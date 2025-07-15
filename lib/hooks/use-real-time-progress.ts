import { useEffect, useState, useCallback, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { getVideoQueue } from "@/lib/ai-providers/queue-manager";

export interface ProgressUpdate {
  jobId: string;
  progress: number;
  status: "queued" | "processing" | "completed" | "failed" | "cancelled";
  estimatedCompletion?: number;
  providerJobId?: string;
  metadata?: any;
  updatedAt: number;
}

export interface RealTimeProgressHook {
  // Single job tracking
  progress: number;
  status: string | undefined;
  estimatedCompletion?: number;
  isActive: boolean;
  lastUpdate: number | null;

  // Multiple jobs tracking
  allProgresses: Record<string, ProgressUpdate>;
  activeJobCount: number;

  // Queue statistics
  queueStats: any;
  estimatedWaitTime: number;

  // Controls
  startTracking: (jobId: string) => void;
  stopTracking: (jobId: string) => void;
  clearProgress: (jobId: string) => void;
}

export function useRealTimeProgress(
  jobId?: string,
  userId?: string
): RealTimeProgressHook {
  const [trackedJobs, setTrackedJobs] = useState<Set<string>>(new Set());
  const [allProgresses, setAllProgresses] = useState<
    Record<string, ProgressUpdate>
  >({});
  const [lastUpdate, setLastUpdate] = useState<number | null>(null);
  const listenerRef = useRef<((jobId: string, update: any) => void) | null>(
    null
  );

  // Subscribe to user job progress if userId provided
  const userJobsProgress = useQuery(
    api.videoGenerationProgress.watchUserJobProgress,
    userId ? { userId: userId as Id<"users">, activeOnly: true } : "skip"
  );

  // Subscribe to specific job progress if jobId provided
  const singleJobProgress = useQuery(
    api.videoGenerationProgress.getJobProgress,
    jobId ? { jobId: jobId as Id<"videoJobs"> } : "skip"
  );

  // Subscribe to queue statistics
  const queueStats = useQuery(api.videoGenerationProgress.watchQueueStats);

  // Initialize progress listener for queue manager
  useEffect(() => {
    const queue = getVideoQueue();

    const progressListener = (jobId: string, update: any) => {
      const progressUpdate: ProgressUpdate = {
        jobId,
        progress: update.progress,
        status: update.status,
        estimatedCompletion: update.estimatedCompletion,
        providerJobId: update.response?.id,
        metadata: update.response,
        updatedAt: Date.now(),
      };

      setAllProgresses((prev) => ({
        ...prev,
        [jobId]: progressUpdate,
      }));

      setLastUpdate(Date.now());
    };

    queue.addProgressListener(progressListener);
    listenerRef.current = progressListener;

    return () => {
      if (listenerRef.current) {
        queue.removeProgressListener(listenerRef.current);
      }
    };
  }, []);

  // Update progresses from Convex real-time data
  useEffect(() => {
    if (userJobsProgress) {
      const updates: Record<string, ProgressUpdate> = {};

      userJobsProgress.forEach((job) => {
        updates[job.jobId] = {
          jobId: job.jobId,
          progress: job.progress,
          status: job.status,
          estimatedCompletion: job.estimatedCompletion,
          providerJobId: job.providerJobId,
          metadata: job.metadata,
          updatedAt: job.updatedAt,
        };
      });

      setAllProgresses((prev) => ({
        ...prev,
        ...updates,
      }));

      if (Object.keys(updates).length > 0) {
        setLastUpdate(Date.now());
      }
    }
  }, [userJobsProgress]);

  // Update single job progress
  useEffect(() => {
    if (singleJobProgress && jobId) {
      const update: ProgressUpdate = {
        jobId: singleJobProgress.jobId,
        progress: singleJobProgress.progress,
        status: singleJobProgress.status,
        estimatedCompletion: singleJobProgress.estimatedCompletion,
        providerJobId: singleJobProgress.providerJobId,
        metadata: singleJobProgress.metadata,
        updatedAt: singleJobProgress.updatedAt,
      };

      setAllProgresses((prev) => ({
        ...prev,
        [jobId]: update,
      }));

      setLastUpdate(Date.now());
    }
  }, [singleJobProgress, jobId]);

  const startTracking = useCallback((jobId: string) => {
    setTrackedJobs((prev) => new Set([...prev, jobId]));
  }, []);

  const stopTracking = useCallback((jobId: string) => {
    setTrackedJobs((prev) => {
      const newSet = new Set(prev);
      newSet.delete(jobId);
      return newSet;
    });
  }, []);

  const clearProgress = useCallback(
    (jobId: string) => {
      setAllProgresses((prev) => {
        const { [jobId]: removed, ...rest } = prev;
        return rest;
      });
      stopTracking(jobId);
    },
    [stopTracking]
  );

  // Get current job progress
  const currentProgress = jobId ? allProgresses[jobId] : null;
  const progress = currentProgress?.progress || 0;
  const status = currentProgress?.status;
  const estimatedCompletion = currentProgress?.estimatedCompletion;
  const isActive = status === "queued" || status === "processing";

  // Count active jobs
  const activeJobCount = Object.values(allProgresses).filter(
    (p) => p.status === "queued" || p.status === "processing"
  ).length;

  // Get estimated wait time
  const estimatedWaitTime = queueStats?.estimatedWaitTime || 0;

  return {
    progress,
    status,
    estimatedCompletion,
    isActive,
    lastUpdate,
    allProgresses,
    activeJobCount,
    queueStats,
    estimatedWaitTime,
    startTracking,
    stopTracking,
    clearProgress,
  };
}

// Hook for monitoring specific job with automatic cleanup
export function useJobProgressMonitor(jobId: string | undefined) {
  const {
    progress,
    status,
    estimatedCompletion,
    isActive,
    startTracking,
    stopTracking,
    clearProgress,
  } = useRealTimeProgress(jobId);

  // Auto-start tracking when jobId is provided
  useEffect(() => {
    if (jobId) {
      startTracking(jobId);
    }

    return () => {
      if (jobId) {
        stopTracking(jobId);
      }
    };
  }, [jobId, startTracking, stopTracking]);

  // Auto-cleanup completed jobs after delay
  useEffect(() => {
    if (
      jobId &&
      (status === "completed" || status === "failed" || status === "cancelled")
    ) {
      const timer = setTimeout(() => {
        clearProgress(jobId);
      }, 30000); // Clear after 30 seconds

      return () => clearTimeout(timer);
    }
  }, [jobId, status, clearProgress]);

  return {
    progress,
    status,
    estimatedCompletion,
    isActive,
    isCompleted: status === "completed",
    isFailed: status === "failed",
    isCancelled: status === "cancelled",
  };
}

// Hook for queue monitoring dashboard
export function useQueueProgressMonitor(userId?: string) {
  const { allProgresses, activeJobCount, queueStats, estimatedWaitTime } =
    useRealTimeProgress(undefined, userId);

  // Filter progresses by status
  const queuedJobs = Object.values(allProgresses).filter(
    (p) => p.status === "queued"
  );
  const processingJobs = Object.values(allProgresses).filter(
    (p) => p.status === "processing"
  );
  const completedJobs = Object.values(allProgresses).filter(
    (p) => p.status === "completed"
  );
  const failedJobs = Object.values(allProgresses).filter(
    (p) => p.status === "failed"
  );

  // Calculate aggregate statistics
  const totalProgress = Object.values(allProgresses).reduce(
    (sum, p) => sum + p.progress,
    0
  );
  const averageProgress = allProgresses
    ? totalProgress / Object.keys(allProgresses).length
    : 0;

  // Get most recent updates
  const recentUpdates = Object.values(allProgresses)
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, 5);

  return {
    queueStats,
    estimatedWaitTime,
    activeJobCount,
    queuedJobs,
    processingJobs,
    completedJobs,
    failedJobs,
    averageProgress: isNaN(averageProgress) ? 0 : averageProgress,
    recentUpdates,
    allProgresses,
  };
}
