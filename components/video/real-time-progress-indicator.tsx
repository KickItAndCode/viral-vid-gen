"use client";

import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Activity,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  Zap,
  Wifi,
  WifiOff,
  Pulse,
} from "lucide-react";
import { useJobProgressMonitor } from "@/lib/hooks/use-real-time-progress";
import { cn } from "@/lib/utils";

interface RealTimeProgressIndicatorProps {
  jobId: string;
  variant?: "default" | "compact" | "minimal";
  showEstimatedTime?: boolean;
  showProviderInfo?: boolean;
  onComplete?: (jobId: string) => void;
  onFailed?: (jobId: string, error?: string) => void;
  className?: string;
}

export function RealTimeProgressIndicator({
  jobId,
  variant = "default",
  showEstimatedTime = true,
  showProviderInfo = false,
  onComplete,
  onFailed,
  className,
}: RealTimeProgressIndicatorProps) {
  const {
    progress,
    status,
    estimatedCompletion,
    isActive,
    isCompleted,
    isFailed,
  } = useJobProgressMonitor(jobId);

  const [isConnected, setIsConnected] = useState(true);
  const [pulseAnimation, setPulseAnimation] = useState(false);

  // Handle completion/failure callbacks
  useEffect(() => {
    if (isCompleted && onComplete) {
      onComplete(jobId);
    }
  }, [isCompleted, jobId, onComplete]);

  useEffect(() => {
    if (isFailed && onFailed) {
      onFailed(jobId);
    }
  }, [isFailed, jobId, onFailed]);

  // Pulse animation on progress updates
  useEffect(() => {
    if (isActive) {
      setPulseAnimation(true);
      const timer = setTimeout(() => setPulseAnimation(false), 200);
      return () => clearTimeout(timer);
    }
  }, [progress, isActive]);

  // Simulate connection monitoring (in real app, this would be actual WebSocket status)
  useEffect(() => {
    const interval = setInterval(() => {
      setIsConnected(Math.random() > 0.1); // 90% uptime simulation
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = () => {
    if (!isConnected) {
      return <WifiOff className="h-4 w-4 text-red-500" />;
    }

    switch (status) {
      case "queued":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "processing":
        return (
          <Activity
            className={cn("h-4 w-4 text-blue-500", isActive && "animate-pulse")}
          />
        );
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

  const getProgressColor = () => {
    if (!isConnected) return "bg-red-500";

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

  const getStatusText = () => {
    if (!isConnected) return "Connection lost";

    switch (status) {
      case "queued":
        return "Waiting in queue";
      case "processing":
        return "Generating video";
      case "completed":
        return "Generation complete";
      case "failed":
        return "Generation failed";
      case "cancelled":
        return "Generation cancelled";
      default:
        return "Unknown status";
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

  if (variant === "minimal") {
    return (
      <div className={cn("flex items-center space-x-2", className)}>
        {getStatusIcon()}
        <div className="flex-1 min-w-0">
          <Progress value={progress} className="h-1" />
          <div
            className={cn(
              "absolute top-0 left-0 h-1 rounded-full transition-all",
              getProgressColor()
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-xs text-muted-foreground">{progress}%</span>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="p-3">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              {getStatusIcon()}
              <Badge variant="secondary" className="text-xs">
                {status}
              </Badge>
              {!isConnected && (
                <Badge variant="destructive" className="text-xs animate-pulse">
                  Offline
                </Badge>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="truncate">{getStatusText()}</span>
                <span>{progress}%</span>
              </div>
              <div className="relative">
                <Progress value={progress} className="h-2" />
                <div
                  className={cn(
                    "absolute top-0 left-0 h-2 rounded-full transition-all",
                    getProgressColor(),
                    pulseAnimation && "animate-pulse"
                  )}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {showEstimatedTime && estimatedCompletion && isActive && (
              <div className="text-xs text-muted-foreground">
                {formatEstimatedTime(estimatedCompletion)}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default variant
  return (
    <Card className={cn("w-full", className)}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Status Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getStatusIcon()}
              <span className="font-medium">{getStatusText()}</span>
              {isConnected ? (
                <Badge variant="secondary" className="text-xs">
                  <Wifi className="h-3 w-3 mr-1" />
                  Live
                </Badge>
              ) : (
                <Badge variant="destructive" className="text-xs animate-pulse">
                  <WifiOff className="h-3 w-3 mr-1" />
                  Offline
                </Badge>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">{progress}%</span>
              {isActive && (
                <Pulse className="h-4 w-4 text-blue-500 animate-pulse" />
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative">
            <Progress value={progress} className="h-3" />
            <div
              className={cn(
                "absolute top-0 left-0 h-3 rounded-full transition-all duration-500",
                getProgressColor(),
                pulseAnimation && "animate-pulse"
              )}
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Additional Info */}
          {(showEstimatedTime || showProviderInfo) && (
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              {showEstimatedTime && estimatedCompletion && isActive && (
                <div className="flex items-center space-x-1">
                  <Zap className="h-3 w-3" />
                  <span>ETA: {formatEstimatedTime(estimatedCompletion)}</span>
                </div>
              )}

              {showProviderInfo && (
                <div className="flex items-center space-x-1">
                  <span>Job ID: {jobId.slice(-8)}</span>
                </div>
              )}
            </div>
          )}

          {/* Connection Status */}
          {!isConnected && (
            <div className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              Connection lost. Progress updates may be delayed.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
