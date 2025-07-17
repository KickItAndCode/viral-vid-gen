import {
  GenerationJob,
  VideoGenerationRequest,
  VideoGenerationResponse,
  VideoProvider,
  VideoProviderName,
  VideoGenerationError,
  ProviderUnavailableError,
} from "./types";
import {
  VideoProviderFactory,
  getProviderOrFallback,
} from "./provider-factory";

export type JobStatus =
  | "queued"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled";
export type JobPriority = "low" | "normal" | "high";

interface QueueConfig {
  maxConcurrentJobs: number;
  maxRetries: number;
  retryDelayMs: number;
  jobTimeoutMs: number;
  cleanupIntervalMs: number;
}

interface ProgressUpdateEvent {
  progress: number;
  status: JobStatus;
  estimatedCompletion?: number;
  response?: any;
}

type ProgressListener = (jobId: string, update: ProgressUpdateEvent) => void;

export class VideoGenerationQueue {
  private static instance: VideoGenerationQueue;
  private jobs: Map<string, GenerationJob> = new Map();
  private runningJobs: Set<string> = new Set();
  private config: QueueConfig;
  private isProcessing: boolean = false;
  private cleanupInterval?: NodeJS.Timeout;
  private progressListeners: Set<ProgressListener> = new Set();

  private constructor(config?: Partial<QueueConfig>) {
    this.config = {
      maxConcurrentJobs: 3,
      maxRetries: 3,
      retryDelayMs: 5000,
      jobTimeoutMs: 900000, // 15 minutes
      cleanupIntervalMs: 300000, // 5 minutes
      ...config,
    };

    // Start cleanup interval
    this.startCleanup();
  }

  static getInstance(config?: Partial<QueueConfig>): VideoGenerationQueue {
    if (!VideoGenerationQueue.instance) {
      VideoGenerationQueue.instance = new VideoGenerationQueue(config);
    }
    return VideoGenerationQueue.instance;
  }

  async addJob(
    request: VideoGenerationRequest,
    userId: string,
    trendId?: string,
    priority: JobPriority = "normal",
    preferredProvider?: VideoProviderName
  ): Promise<string> {
    const jobId = this.generateJobId();

    // Determine default provider based on environment
    const defaultProvider: VideoProviderName = preferredProvider || 
      (process.env.NODE_ENV === "development" ? "mock" : "runway");

    const job: GenerationJob = {
      id: jobId,
      provider: defaultProvider,
      request,
      status: "queued",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      attempts: 0,
      maxAttempts: this.config.maxRetries,
      priority,
      userId,
      trendId,
    };

    this.jobs.set(jobId, job);

    // Start processing if not already running
    if (!this.isProcessing) {
      this.processQueue();
    }

    return jobId;
  }

  getJob(jobId: string): GenerationJob | undefined {
    return this.jobs.get(jobId);
  }

  getJobStatus(jobId: string): JobStatus | undefined {
    return this.jobs.get(jobId)?.status;
  }

  getUserJobs(userId: string): GenerationJob[] {
    return Array.from(this.jobs.values())
      .filter((job) => job.userId === userId)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  getQueueStatus(): {
    total: number;
    queued: number;
    processing: number;
    completed: number;
    failed: number;
    cancelled: number;
  } {
    const jobs = Array.from(this.jobs.values());
    return {
      total: jobs.length,
      queued: jobs.filter((j) => j.status === "queued").length,
      processing: jobs.filter((j) => j.status === "processing").length,
      completed: jobs.filter((j) => j.status === "completed").length,
      failed: jobs.filter((j) => j.status === "failed").length,
      cancelled: jobs.filter((j) => j.status === "cancelled").length,
    };
  }

  async cancelJob(jobId: string): Promise<boolean> {
    const job = this.jobs.get(jobId);
    if (!job) return false;

    if (job.status === "processing") {
      // Try to cancel with provider
      try {
        const provider = VideoProviderFactory.getInstance().getProvider(
          job.provider
        );
        if (provider?.cancelGeneration) {
          await provider.cancelGeneration(jobId);
        }
      } catch (error) {
        console.warn(`Failed to cancel job ${jobId} with provider:`, error);
      }

      this.runningJobs.delete(jobId);
    }

    job.status = "cancelled";
    job.updatedAt = Date.now();

    return true;
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      while (this.runningJobs.size < this.config.maxConcurrentJobs) {
        const nextJob = this.getNextJob();
        if (!nextJob) break;

        this.runningJobs.add(nextJob.id);
        this.processJob(nextJob).catch((error) => {
          console.error(`Error processing job ${nextJob.id}:`, error);
        });
      }
    } finally {
      this.isProcessing = false;
    }

    // Schedule next processing cycle if there are queued jobs
    if (this.hasQueuedJobs()) {
      setTimeout(() => this.processQueue(), 1000);
    }
  }

  private getNextJob(): GenerationJob | null {
    const queuedJobs = Array.from(this.jobs.values())
      .filter((job) => job.status === "queued")
      .sort((a, b) => {
        // Sort by priority first, then by creation time
        const priorityOrder = { high: 3, normal: 2, low: 1 };
        const priorityDiff =
          priorityOrder[b.priority] - priorityOrder[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return a.createdAt - b.createdAt;
      });

    return queuedJobs[0] || null;
  }

  private hasQueuedJobs(): boolean {
    return Array.from(this.jobs.values()).some(
      (job) => job.status === "queued"
    );
  }

  private async processJob(job: GenerationJob): Promise<void> {
    try {
      job.status = "processing";
      job.updatedAt = Date.now();
      job.attempts++;

      // Emit processing start event
      this.emitProgressUpdate(job.id, {
        progress: 0,
        status: "processing",
      });

      // Get provider with fallback
      const provider = await getProviderOrFallback(job.provider);
      if (!provider) {
        throw new ProviderUnavailableError(
          job.provider,
          "No providers available"
        );
      }

      // Update job with actual provider used
      job.provider = provider.name;

      // Generate video
      const response = await this.generateWithTimeout(provider, job.request);

      // Poll for completion if not immediately completed
      if (response.status !== "completed") {
        await this.pollJobCompletion(provider, response.jobId, job);
      } else {
        job.status = "completed";
        job.updatedAt = Date.now();
      }
    } catch (error) {
      console.error(`Job ${job.id} failed:`, error);

      if (job.attempts < job.maxAttempts && this.shouldRetry(error)) {
        // Retry with delay
        job.status = "queued";
        job.updatedAt = Date.now();

        setTimeout(() => {
          // Remove from running jobs to allow retry
          this.runningJobs.delete(job.id);
          this.processQueue();
        }, this.config.retryDelayMs * job.attempts);
      } else {
        job.status = "failed";
        job.updatedAt = Date.now();
      }
    } finally {
      this.runningJobs.delete(job.id);
    }
  }

  private async generateWithTimeout(
    provider: VideoProvider,
    request: VideoGenerationRequest
  ): Promise<VideoGenerationResponse> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error("Generation timeout"));
      }, this.config.jobTimeoutMs);
    });

    return Promise.race([provider.generateVideo(request), timeoutPromise]);
  }

  private async pollJobCompletion(
    provider: VideoProvider,
    providerJobId: string,
    job: GenerationJob
  ): Promise<void> {
    const maxPolls = 180; // 15 minutes with 5-second intervals
    let polls = 0;

    while (polls < maxPolls) {
      if (job.status === "cancelled") {
        break;
      }

      try {
        const response = await provider.getStatus(providerJobId);

        if (response.status === "completed") {
          job.status = "completed";
          job.updatedAt = Date.now();

          // Emit progress completion event
          this.emitProgressUpdate(job.id, {
            progress: 100,
            status: "completed",
            response,
          });
          break;
        } else if (response.status === "failed") {
          throw new Error(response.error || "Generation failed");
        }

        // Update progress if available
        if (response.progress !== undefined) {
          const progress = Math.min(Math.max(response.progress, 0), 100);

          // Emit progress update event
          this.emitProgressUpdate(job.id, {
            progress,
            status: "processing",
            estimatedCompletion: response.estimatedCompletion,
            response,
          });
        }
      } catch (error) {
        console.warn(`Polling error for job ${job.id}:`, error);
      }

      // Wait before next poll
      await new Promise((resolve) => setTimeout(resolve, 5000));
      polls++;
    }

    if (polls >= maxPolls) {
      throw new Error("Job polling timeout");
    }
  }

  private shouldRetry(error: any): boolean {
    // Don't retry validation errors or quota exceeded
    if (error instanceof VideoGenerationError) {
      return (
        error.code !== "INVALID_REQUEST" &&
        error.code !== "QUOTA_EXCEEDED" &&
        error.code !== "AUTH_FAILED"
      );
    }
    return true;
  }

  private generateJobId(): string {
    return `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupOldJobs();
    }, this.config.cleanupIntervalMs);
  }

  private cleanupOldJobs(): void {
    const cutoffTime = Date.now() - 24 * 60 * 60 * 1000; // 24 hours

    for (const [jobId, job] of this.jobs) {
      if (
        job.updatedAt < cutoffTime &&
        (job.status === "completed" ||
          job.status === "failed" ||
          job.status === "cancelled")
      ) {
        this.jobs.delete(jobId);
      }
    }
  }

  // Progress tracking methods
  addProgressListener(listener: ProgressListener): void {
    this.progressListeners.add(listener);
  }

  removeProgressListener(listener: ProgressListener): void {
    this.progressListeners.delete(listener);
  }

  private emitProgressUpdate(jobId: string, update: ProgressUpdateEvent): void {
    this.progressListeners.forEach((listener) => {
      try {
        listener(jobId, update);
      } catch (error) {
        console.warn("Progress listener error:", error);
      }
    });
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.jobs.clear();
    this.runningJobs.clear();
    this.progressListeners.clear();
  }
}

// Export singleton instance getter
export function getVideoQueue(
  config?: Partial<QueueConfig>
): VideoGenerationQueue {
  return VideoGenerationQueue.getInstance(config);
}
