"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Download,
  CheckCircle2,
  AlertCircle,
  X,
  Clock,
  HardDrive,
  Zap,
  Play,
} from "lucide-react";
import { useExport } from "@/lib/stores/video-editor-store";

export interface ExportProgressModalProps {
  /** Whether modal is open */
  isOpen: boolean;
  /** Callback to close modal */
  onClose: () => void;
  /** Custom CSS class */
  className?: string;
}

interface ExportStage {
  id: string;
  name: string;
  description: string;
  progress: number;
  status: "pending" | "active" | "completed" | "error";
  timeElapsed?: number;
}

export const ExportProgressModal = ({
  isOpen,
  onClose,
  className,
}: ExportProgressModalProps) => {
  const {
    isExporting,
    exportProgress,
    exportStage,
    exportError,
    exportedVideoUrl,
    cancelExport,
  } = useExport();

  const [stages, setStages] = useState<ExportStage[]>([
    {
      id: "prepare",
      name: "Preparing Export",
      description: "Analyzing timeline and clips",
      progress: 0,
      status: "pending",
    },
    {
      id: "render",
      name: "Rendering Video",
      description: "Processing video frames",
      progress: 0,
      status: "pending",
    },
    {
      id: "encode",
      name: "Encoding",
      description: "Compressing and optimizing",
      progress: 0,
      status: "pending",
    },
    {
      id: "upload",
      name: "Uploading",
      description: "Saving to cloud storage",
      progress: 0,
      status: "pending",
    },
  ]);

  const [startTime, setStartTime] = useState<number | null>(null);
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState<
    number | null
  >(null);

  useEffect(() => {
    if (isExporting && !startTime) {
      setStartTime(Date.now());
    } else if (!isExporting) {
      setStartTime(null);
    }
  }, [isExporting, startTime]);

  useEffect(() => {
    setStages((prev) =>
      prev.map((stage) => {
        if (stage.id === exportStage) {
          return {
            ...stage,
            status: "active",
            progress: exportProgress,
          };
        } else if (
          stages.findIndex((s) => s.id === exportStage) >
          prev.findIndex((s) => s.id === stage.id)
        ) {
          return {
            ...stage,
            status: "completed",
            progress: 100,
          };
        } else {
          return {
            ...stage,
            status: "pending",
            progress: 0,
          };
        }
      })
    );

    // Calculate estimated time remaining
    if (startTime && exportProgress > 0) {
      const elapsed = (Date.now() - startTime) / 1000;
      const rate = exportProgress / elapsed;
      const remaining = (100 - exportProgress) / rate;
      setEstimatedTimeRemaining(remaining);
    }
  }, [exportStage, exportProgress, startTime, stages]);

  const handleCancel = () => {
    cancelExport();
    onClose();
  };

  const handleDownload = () => {
    if (exportedVideoUrl) {
      // Create download link
      const link = document.createElement("a");
      link.href = exportedVideoUrl;
      link.download = "exported-video.mp4";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getElapsedTime = () => {
    if (!startTime) return 0;
    return (Date.now() - startTime) / 1000;
  };

  const isCompleted = exportedVideoUrl && !isExporting;
  const hasError = exportError && !isExporting;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn("max-w-md", className)}>
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {isCompleted ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : hasError ? (
              <AlertCircle className="h-5 w-5 text-red-500" />
            ) : (
              <Download className="h-5 w-5" />
            )}
            <span>
              {isCompleted
                ? "Export Complete"
                : hasError
                  ? "Export Failed"
                  : "Exporting Video"}
            </span>
          </DialogTitle>
          <DialogDescription>
            {isCompleted
              ? "Your video has been successfully exported and is ready for download."
              : hasError
                ? "An error occurred during the export process."
                : "Processing your video with the selected export settings."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {hasError ? (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 text-red-700">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Export Error</span>
                </div>
                <p className="text-sm text-red-600 mt-1">
                  {exportError || "An unexpected error occurred during export."}
                </p>
              </CardContent>
            </Card>
          ) : isCompleted ? (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-green-700">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      Ready to Download
                    </span>
                  </div>
                  <Button
                    size="sm"
                    onClick={handleDownload}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Overall Progress */}
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Overall Progress
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {Math.round(exportProgress)}%
                      </span>
                    </div>
                    <Progress value={exportProgress} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              {/* Export Stages */}
              <div className="space-y-2">
                {stages.map((stage, index) => (
                  <div
                    key={stage.id}
                    className={cn(
                      "flex items-center space-x-3 p-3 rounded-lg border",
                      stage.status === "active"
                        ? "bg-primary/5 border-primary/20"
                        : stage.status === "completed"
                          ? "bg-green-50 border-green-200"
                          : "bg-muted/30 border-border"
                    )}
                  >
                    <div className="flex-shrink-0">
                      {stage.status === "completed" ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : stage.status === "active" ? (
                        <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {stage.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {stage.description}
                      </p>
                    </div>
                    {stage.status === "active" && (
                      <Badge variant="secondary" className="text-xs">
                        {Math.round(stage.progress)}%
                      </Badge>
                    )}
                  </div>
                ))}
              </div>

              {/* Export Stats */}
              {isExporting && (
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>Elapsed: {formatTime(getElapsedTime())}</span>
                  </div>
                  {estimatedTimeRemaining && (
                    <div className="flex items-center space-x-1">
                      <Zap className="h-3 w-3" />
                      <span>ETA: {formatTime(estimatedTimeRemaining)}</span>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          {isCompleted ? (
            <div className="flex space-x-2">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download Video
              </Button>
            </div>
          ) : hasError ? (
            <div className="flex space-x-2">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button
                onClick={() => {
                  // Retry export would be implemented here
                  console.log("Retry export");
                }}
              >
                Try Again
              </Button>
            </div>
          ) : (
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancel Export
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExportProgressModal;
