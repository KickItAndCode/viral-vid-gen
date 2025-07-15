import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { VideoGenerationRequest } from "@/lib/ai-providers/types";
import { useAuth } from "@clerk/nextjs";

export interface VideoGenerationOptions {
  style?: string;
  duration?: number;
  provider?: "veo" | "runway" | "luma";
  priority?: "low" | "normal" | "high";
  targetPlatform?: string;
  tone?: string;
  visualStyle?: string;
}

export interface GenerationJob {
  id: string;
  status: "queued" | "processing" | "completed" | "failed" | "cancelled";
  progress: number;
  estimatedCompletion?: number;
  errorMessage?: string;
  createdAt: number;
  updatedAt: number;
  provider: string;
  videoId?: string;
}

export interface VideoGenerationHook {
  // Job management
  createGenerationJob: (
    trendId: Id<"trends">,
    options?: VideoGenerationOptions
  ) => Promise<{ videoId: string; jobId: string }>;
  cancelJob: (jobId: Id<"videoJobs">) => Promise<boolean>;
  retryJob: (jobId: Id<"videoJobs">) => Promise<boolean>;

  // Real-time data
  userJobs: GenerationJob[];
  activeJobs: GenerationJob[];
  queueStats:
    | {
        total: number;
        queued: number;
        processing: number;
        completed: number;
        failed: number;
        cancelled: number;
      }
    | undefined;

  // Job tracking
  getJobProgress: (jobId: string) => number;
  getJobEstimatedTime: (jobId: string) => number | undefined;

  // Loading states
  isCreating: boolean;
  isCancelling: boolean;
  isRetrying: boolean;

  // Error handling
  error: string | null;
  clearError: () => void;
}

export function useVideoGeneration(): VideoGenerationHook {
  const { userId } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Real-time queries for user jobs and queue stats
  const userJobs = useQuery(
    api.videoGeneration.getUserVideoJobs,
    userId ? { userId: userId as Id<"users"> } : "skip"
  );

  const queueStats = useQuery(api.videoGeneration.getGenerationQueueStats);

  // Mutations
  const initiateGeneration = useMutation(
    api.videoGeneration.initiateVideoGeneration
  );
  const cancelJobMutation = useMutation(
    api.videoGeneration.cancelVideoGenerationJob
  );
  const retryJobMutation = useMutation(
    api.videoGeneration.retryVideoGenerationJob
  );

  // Transform userJobs to expected format
  const transformedJobs: GenerationJob[] =
    userJobs?.map((job) => ({
      id: job._id,
      status: job.status,
      progress: job.progress || 0,
      estimatedCompletion: job.estimatedCompletion,
      errorMessage: job.errorMessage,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      provider: job.provider,
      videoId: job.videoId,
    })) || [];

  // Filter active jobs (not completed, failed, or cancelled)
  const activeJobs = transformedJobs.filter(
    (job) => job.status === "queued" || job.status === "processing"
  );

  const createGenerationJob = useCallback(
    async (
      trendId: Id<"trends">,
      options: VideoGenerationOptions = {}
    ): Promise<{ videoId: string; jobId: string }> => {
      if (!userId) {
        throw new Error("User must be authenticated");
      }

      setIsCreating(true);
      setError(null);

      try {
        const result = await initiateGeneration({
          userId: userId as Id<"users">,
          trendId,
          options,
        });

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to create generation job";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsCreating(false);
      }
    },
    [userId, initiateGeneration]
  );

  const cancelJob = useCallback(
    async (jobId: Id<"videoJobs">): Promise<boolean> => {
      setIsCancelling(true);
      setError(null);

      try {
        const success = await cancelJobMutation({ jobId });
        return success;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to cancel job";
        setError(errorMessage);
        return false;
      } finally {
        setIsCancelling(false);
      }
    },
    [cancelJobMutation]
  );

  const retryJob = useCallback(
    async (jobId: Id<"videoJobs">): Promise<boolean> => {
      setIsRetrying(true);
      setError(null);

      try {
        const success = await retryJobMutation({ jobId });
        return success;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to retry job";
        setError(errorMessage);
        return false;
      } finally {
        setIsRetrying(false);
      }
    },
    [retryJobMutation]
  );

  const getJobProgress = useCallback(
    (jobId: string): number => {
      const job = transformedJobs.find((j) => j.id === jobId);
      return job?.progress || 0;
    },
    [transformedJobs]
  );

  const getJobEstimatedTime = useCallback(
    (jobId: string): number | undefined => {
      const job = transformedJobs.find((j) => j.id === jobId);
      return job?.estimatedCompletion;
    },
    [transformedJobs]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    createGenerationJob,
    cancelJob,
    retryJob,
    userJobs: transformedJobs,
    activeJobs,
    queueStats,
    getJobProgress,
    getJobEstimatedTime,
    isCreating,
    isCancelling,
    isRetrying,
    error,
    clearError,
  };
}

// Hook for tracking a specific job's progress
export function useJobProgress(jobId: string | undefined) {
  const job = useQuery(
    api.videoGeneration.getVideoJobWithDetails,
    jobId ? { jobId: jobId as Id<"videoJobs"> } : "skip"
  );

  return {
    job: job?.job,
    video: job?.video,
    progress: job?.job?.progress || 0,
    status: job?.job?.status,
    estimatedCompletion: job?.job?.estimatedCompletion,
    errorMessage: job?.job?.errorMessage,
    isLoading: job === undefined,
    providerJobId: job?.job?.providerJobId,
  };
}

// Hook for real-time queue monitoring
export function useQueueMonitor() {
  const stats = useQuery(api.videoGeneration.getGenerationQueueStats);
  const [previousStats, setPreviousStats] = useState(stats);

  useEffect(() => {
    if (stats && JSON.stringify(stats) !== JSON.stringify(previousStats)) {
      setPreviousStats(stats);
    }
  }, [stats, previousStats]);

  const getDelta = useCallback(
    (key: keyof typeof stats) => {
      if (!stats || !previousStats) return 0;
      return (stats[key] as number) - (previousStats[key] as number);
    },
    [stats, previousStats]
  );

  return {
    stats,
    previousStats,
    getDelta,
    hasChanges:
      stats &&
      previousStats &&
      JSON.stringify(stats) !== JSON.stringify(previousStats),
  };
}
