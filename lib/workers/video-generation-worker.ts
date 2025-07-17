import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { getVideoQueue } from "@/lib/ai-providers/queue-manager";
import { VideoGenerationRequest } from "@/lib/ai-providers/types";

/**
 * Background worker that processes video generation jobs
 * Connects Convex database jobs to AI provider queue
 */
export class VideoGenerationWorker {
  private convex: ConvexHttpClient;
  private queue: any;
  private isRunning = false;
  private pollInterval: NodeJS.Timeout | null = null;
  private clerkUserId: string | null = null;
  private convexUserId: Id<"users"> | null = null;

  constructor(convexUrl: string, clerkUserId?: string) {
    this.convex = new ConvexHttpClient(convexUrl);
    this.queue = getVideoQueue();
    this.clerkUserId = clerkUserId || null;
  }

  async start() {
    if (this.isRunning) return;
    this.isRunning = true;
    
    console.log("🚀 Video Generation Worker started", this.clerkUserId ? `for user ${this.clerkUserId}` : "(no user ID)");
    
    // Resolve Convex user ID if we have a Clerk user ID
    if (this.clerkUserId && !this.convexUserId) {
      await this.resolveConvexUserId();
    }
    
    // Start polling for new jobs every 5 seconds
    this.pollInterval = setInterval(() => {
      this.processNewJobs().catch(console.error);
    }, 5000);
    
    // Process any existing jobs immediately
    await this.processNewJobs();
  }

  async stop() {
    this.isRunning = false;
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    console.log("⏹️ Video Generation Worker stopped");
  }

  setUserId(clerkUserId: string) {
    this.clerkUserId = clerkUserId;
    this.convexUserId = null; // Reset Convex user ID so it gets resolved again
    console.log(`🆔 Video Generation Worker clerk user ID set to: ${clerkUserId}`);
  }

  private async resolveConvexUserId() {
    if (!this.clerkUserId) return;
    
    try {
      const user = await this.convex.query(api.users.getUser, {
        clerkUserId: this.clerkUserId,
      });
      
      if (user) {
        this.convexUserId = user._id;
        console.log(`✅ Resolved Convex user ID: ${this.convexUserId} for Clerk user: ${this.clerkUserId}`);
      } else {
        console.warn(`⚠️ No Convex user found for Clerk user: ${this.clerkUserId}`);
      }
    } catch (error) {
      console.error(`❌ Error resolving Convex user ID for ${this.clerkUserId}:`, error);
    }
  }

  private async processNewJobs() {
    try {
      // Skip processing if no Convex user ID is available
      if (!this.convexUserId) {
        if (this.clerkUserId) {
          console.log("Waiting for Convex user ID resolution...");
          await this.resolveConvexUserId();
        }
        if (!this.convexUserId) {
          console.log("No Convex user ID available for video generation worker");
          return;
        }
      }

      // Get all queued jobs from Convex
      const queuedJobs = await this.convex.query(api.videoGeneration.getUserVideoJobs, {
        userId: this.convexUserId,
        status: "queued",
        limit: 10,
      });

      for (const job of queuedJobs) {
        await this.processJob(job);
      }
    } catch (error) {
      console.error("Error processing new jobs:", error);
    }
  }

  private async processJob(job: any) {
    try {
      console.log(`🎬 Processing video generation job: ${job._id}`);

      // Mark job as processing
      await this.convex.mutation(api.videoGeneration.updateVideoGenerationJob, {
        jobId: job._id,
        status: "processing",
        progress: 0,
      });

      // Create AI provider request
      const request: VideoGenerationRequest = {
        prompt: job.jobData.prompt || `Create a ${job.jobData.style} video about ${job.jobData.trend}`,
        duration: job.jobData.duration,
        aspectRatio: "16:9", // From metadata
        resolution: "1080p",
        fps: 30,
        style: job.jobData.style,
        provider: job.provider,
      };

      // Add to AI provider queue
      const queueJobId = await this.queue.addJob(
        request,
        job.userId,
        job.jobData.trend,
        job.priority,
        job.provider
      );

      // Update job with provider job ID
      await this.convex.mutation(api.videoGeneration.updateVideoGenerationJob, {
        jobId: job._id,
        status: "processing",
        progress: 10,
        providerJobId: queueJobId,
      });

      // Monitor provider job progress
      this.monitorProviderJob(job._id, queueJobId);

    } catch (error) {
      console.error(`Error processing job ${job._id}:`, error);
      
      // Mark job as failed
      await this.convex.mutation(api.videoGeneration.updateVideoGenerationJob, {
        jobId: job._id,
        status: "failed",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  private async monitorProviderJob(convexJobId: Id<"videoJobs">, providerJobId: string) {
    const monitor = setInterval(async () => {
      try {
        const providerJob = this.queue.getJob(providerJobId);
        
        if (!providerJob) {
          clearInterval(monitor);
          return;
        }

        // Update progress in Convex
        await this.convex.mutation(api.videoGenerationProgress.updateJobProgress, {
          jobId: convexJobId,
          progress: this.mapProviderProgress(providerJob.status, providerJob.progress),
          estimatedCompletion: providerJob.estimatedCompletion,
          providerJobId,
        });

        // Check if completed
        if (providerJob.status === "completed") {
          clearInterval(monitor);
          
          // Update video with final URL
          if (providerJob.videoUrl) {
            await this.convex.mutation(api.videoGeneration.completeVideoGeneration, {
              videoId: providerJob.videoId,
              url: providerJob.videoUrl,
              thumbnailUrl: providerJob.thumbnailUrl,
              viralScore: 85, // Could be calculated based on trend
            });
          }

          await this.convex.mutation(api.videoGeneration.updateVideoGenerationJob, {
            jobId: convexJobId,
            status: "completed",
            progress: 100,
          });
        } else if (providerJob.status === "failed") {
          clearInterval(monitor);
          
          await this.convex.mutation(api.videoGeneration.updateVideoGenerationJob, {
            jobId: convexJobId,
            status: "failed",
            errorMessage: providerJob.error || "Provider generation failed",
          });
        }
        
      } catch (error) {
        console.error(`Error monitoring provider job ${providerJobId}:`, error);
      }
    }, 5000); // Check every 5 seconds

    // Cleanup after 30 minutes
    setTimeout(() => {
      clearInterval(monitor);
    }, 30 * 60 * 1000);
  }

  private mapProviderProgress(status: string, providerProgress: number = 0): number {
    switch (status) {
      case "queued":
        return 5;
      case "processing":
        return Math.min(10 + (providerProgress * 0.8), 90); // Map 0-100 to 10-90
      case "completed":
        return 100;
      case "failed":
        return 0;
      default:
        return 0;
    }
  }
}

// Singleton instance
let workerInstance: VideoGenerationWorker | null = null;

export function getVideoGenerationWorker(convexUrl: string, clerkUserId?: string): VideoGenerationWorker {
  if (!workerInstance) {
    workerInstance = new VideoGenerationWorker(convexUrl, clerkUserId);
  } else if (clerkUserId) {
    workerInstance.setUserId(clerkUserId);
  }
  return workerInstance;
}

export async function startVideoGenerationWorker(convexUrl: string, clerkUserId?: string) {
  const worker = getVideoGenerationWorker(convexUrl, clerkUserId);
  await worker.start();
  return worker;
}