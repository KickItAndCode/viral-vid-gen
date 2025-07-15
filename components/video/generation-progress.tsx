"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Play,
  Pause,
  X,
  RefreshCw,
  Zap,
  Timer,
  Activity,
} from "lucide-react";
import {
  useJobProgress,
  useVideoGeneration,
} from "@/lib/hooks/use-video-generation";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface GenerationProgressProps {
  jobId: string;
  onComplete?: (videoId: string) => void;
  onCancel?: () => void;
  className?: string;
}

export function GenerationProgress({
  jobId,
  onComplete,
  onCancel,
  className,
}: GenerationProgressProps) {
  const {
    job,
    video,
    progress,
    status,
    estimatedCompletion,
    errorMessage,
    providerJobId,
  } = useJobProgress(jobId);
  const { cancelJob, retryJob, isCancelling, isRetrying } =
    useVideoGeneration();
  const [timeElapsed, setTimeElapsed] = useState(0);

  // Calculate time elapsed
  useEffect(() => {
    if (!job?.createdAt) return;

    const interval = setInterval(() => {
      setTimeElapsed(Date.now() - job.createdAt);
    }, 1000);

    return () => clearInterval(interval);
  }, [job?.createdAt]);

  // Handle completion
  useEffect(() => {
    if (status === "completed" && video?._id && onComplete) {
      onComplete(video._id);
    }
  }, [status, video?._id, onComplete]);

  const handleCancel = async () => {
    if (job?._id) {
      const success = await cancelJob(job._id);
      if (success && onCancel) {
        onCancel();
      }
    }
  };

  const handleRetry = async () => {
    if (job?._id) {
      await retryJob(job._id);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "queued":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "processing":
        return <Activity className="h-4 w-4 text-blue-500 animate-pulse" />;
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "cancelled":
        return <X className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "queued":
        return "bg-yellow-500";
      case "processing":
        return "bg-blue-500";
      case "completed":
        return "bg-green-500";
      case "failed":
        return "bg-red-500";
      case "cancelled":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatTimeElapsed = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const formatEstimatedTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);

    if (minutes > 0) {
      return `~${minutes}m ${seconds % 60}s`;
    } else {
      return `~${seconds}s`;
    }
  };

  if (!job) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <div className="animate-pulse h-4 w-4 bg-gray-300 rounded-full" />
            <span className="text-sm text-muted-foreground">
              Loading job details...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <CardTitle className="text-lg">Video Generation</CardTitle>
            <Badge variant="secondary" className="capitalize">
              {job.provider}
            </Badge>
          </div>

          <div className="flex items-center space-x-2">
            {status === "processing" && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={isCancelling}
                className="h-8"
              >
                {isCancelling ? (
                  <RefreshCw className="h-3 w-3 animate-spin" />
                ) : (
                  <X className="h-3 w-3" />
                )}
                Cancel
              </Button>
            )}

            {status === "failed" && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetry}
                disabled={isRetrying}
                className="h-8"
              >
                {isRetrying ? (
                  <RefreshCw className="h-3 w-3 animate-spin" />
                ) : (
                  <RefreshCw className="h-3 w-3" />
                )}
                Retry
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium capitalize text-foreground">
              {status === "queued"
                ? "Waiting in queue"
                : status === "processing"
                  ? "Generating video"
                  : status === "completed"
                    ? "Generation complete"
                    : status === "failed"
                      ? "Generation failed"
                      : "Generation cancelled"}
            </span>
            <span className="text-muted-foreground">{progress}%</span>
          </div>

          <div className="relative">
            <Progress value={progress} className="h-2" />
            <div
              className={cn(
                "absolute top-0 left-0 h-2 rounded-full transition-all",
                getStatusColor()
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Time Information */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Timer className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">Time Elapsed</p>
              <p className="text-muted-foreground">
                {formatTimeElapsed(timeElapsed)}
              </p>
            </div>
          </div>

          {estimatedCompletion && status === "processing" && (
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Estimated Time</p>
                <p className="text-muted-foreground">
                  {formatEstimatedTime(estimatedCompletion)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Job Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-medium text-muted-foreground">Job ID</p>
            <p className="font-mono text-xs bg-muted px-2 py-1 rounded">
              {jobId.slice(-8)}
            </p>
          </div>

          {providerJobId && (
            <div>
              <p className="font-medium text-muted-foreground">Provider Job</p>
              <p className="font-mono text-xs bg-muted px-2 py-1 rounded">
                {providerJobId.slice(-8)}
              </p>
            </div>
          )}
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-800">
                  Generation Failed
                </p>
                <p className="text-sm text-red-700 mt-1">{errorMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {status === "completed" && video && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-start space-x-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-800">
                  Video Generated Successfully!
                </p>
                <p className="text-sm text-green-700 mt-1">
                  Your video is ready and available in your library.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Queue Position for Queued Jobs */}
        {status === "queued" && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <p className="text-sm text-yellow-800">
                Your video is queued for generation. Average wait time is 2-5
                minutes.
              </p>
            </div>
          </div>
        )}

        {/* Created Time */}
        <div className="text-xs text-muted-foreground">
          Created{" "}
          {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
        </div>
      </CardContent>
    </Card>
  );
}
