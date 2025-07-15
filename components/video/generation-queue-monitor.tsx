"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Activity,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  TrendingUp,
  Users,
  Zap,
  BarChart3,
  Play,
  Pause,
} from "lucide-react";
import {
  useVideoGeneration,
  useQueueMonitor,
} from "@/lib/hooks/use-video-generation";
import { GenerationProgress } from "./generation-progress";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface GenerationQueueMonitorProps {
  userId?: string;
  showUserJobsOnly?: boolean;
  maxJobsDisplay?: number;
  className?: string;
}

export function GenerationQueueMonitor({
  userId,
  showUserJobsOnly = false,
  maxJobsDisplay = 5,
  className,
}: GenerationQueueMonitorProps) {
  const { userJobs, activeJobs, queueStats } = useVideoGeneration();
  const { stats, getDelta, hasChanges } = useQueueMonitor();
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);

  const displayJobs = showUserJobsOnly ? userJobs : activeJobs;
  const visibleJobs = displayJobs.slice(0, maxJobsDisplay);

  const getStatusIcon = (status: string) => {
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

  const getProviderBadgeColor = (provider: string) => {
    switch (provider) {
      case "veo":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "runway":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "luma":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Queue Statistics */}
      {queueStats && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Generation Queue</span>
              </CardTitle>
              {hasChanges && (
                <Badge variant="secondary" className="animate-pulse">
                  <Activity className="h-3 w-3 mr-1" />
                  Live
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1">
                  <Clock className="h-4 w-4 text-yellow-500" />
                  <span className="text-2xl font-bold text-yellow-600">
                    {queueStats.queued}
                  </span>
                  {getDelta("queued") !== 0 && (
                    <span
                      className={cn(
                        "text-xs font-medium",
                        getDelta("queued") > 0
                          ? "text-yellow-600"
                          : "text-green-600"
                      )}
                    >
                      {getDelta("queued") > 0 ? "+" : ""}
                      {getDelta("queued")}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Queued</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center space-x-1">
                  <Activity className="h-4 w-4 text-blue-500" />
                  <span className="text-2xl font-bold text-blue-600">
                    {queueStats.processing}
                  </span>
                  {getDelta("processing") !== 0 && (
                    <span
                      className={cn(
                        "text-xs font-medium",
                        getDelta("processing") > 0
                          ? "text-blue-600"
                          : "text-gray-600"
                      )}
                    >
                      {getDelta("processing") > 0 ? "+" : ""}
                      {getDelta("processing")}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Processing</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center space-x-1">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-2xl font-bold text-green-600">
                    {queueStats.completed}
                  </span>
                  {getDelta("completed") !== 0 && (
                    <span className="text-xs font-medium text-green-600">
                      +{getDelta("completed")}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Completed</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center space-x-1">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span className="text-2xl font-bold text-red-600">
                    {queueStats.failed}
                  </span>
                  {getDelta("failed") !== 0 && (
                    <span className="text-xs font-medium text-red-600">
                      +{getDelta("failed")}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Failed</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center space-x-1">
                  <TrendingUp className="h-4 w-4 text-gray-500" />
                  <span className="text-2xl font-bold text-gray-600">
                    {queueStats.total}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Total</p>
              </div>
            </div>

            {/* Provider Statistics */}
            {queueStats.byProvider && (
              <div className="mt-4 pt-4 border-t">
                <h4 className="text-sm font-medium text-muted-foreground mb-2">
                  By Provider
                </h4>
                <div className="flex items-center space-x-4">
                  {Object.entries(queueStats.byProvider).map(
                    ([provider, count]) => (
                      <div
                        key={provider}
                        className="flex items-center space-x-2"
                      >
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs",
                            getProviderBadgeColor(provider)
                          )}
                        >
                          {provider}
                        </Badge>
                        <span className="text-sm font-medium">{count}</span>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Average Processing Time */}
            {queueStats.averageProcessingTime > 0 && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Average processing time:{" "}
                    {formatDuration(queueStats.averageProcessingTime)}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Active Jobs List */}
      {visibleJobs.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>
                {showUserJobsOnly ? "Your Jobs" : "Active Jobs"}(
                {visibleJobs.length}
                {displayJobs.length > maxJobsDisplay
                  ? `/${displayJobs.length}`
                  : ""}
                )
              </span>
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            {visibleJobs.map((job) => (
              <div key={job.id} className="border rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(job.status)}
                    <div>
                      <p className="text-sm font-medium">
                        Job {job.id.slice(-8)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(job.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs",
                        getProviderBadgeColor(job.provider)
                      )}
                    >
                      {job.provider}
                    </Badge>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">
                      {job.progress}%
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setExpandedJobId(
                          expandedJobId === job.id ? null : job.id
                        )
                      }
                      className="h-8 w-8 p-0"
                    >
                      {expandedJobId === job.id ? (
                        <Pause className="h-3 w-3" />
                      ) : (
                        <Play className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-2">
                  <Progress value={job.progress} className="h-1" />
                </div>

                {/* Expanded Details */}
                {expandedJobId === job.id && (
                  <div className="mt-3 pt-3 border-t">
                    <GenerationProgress
                      jobId={job.id}
                      className="border-0 shadow-none bg-transparent p-0"
                    />
                  </div>
                )}
              </div>
            ))}

            {displayJobs.length > maxJobsDisplay && (
              <div className="text-center">
                <Button variant="outline" size="sm">
                  View {displayJobs.length - maxJobsDisplay} more jobs
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {visibleJobs.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              {showUserJobsOnly ? "No generation jobs yet" : "Queue is empty"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {showUserJobsOnly
                ? "Start creating videos from trending content to see your generation jobs here."
                : "All video generation jobs have been completed."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
