"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ResizablePanel,
  ResizablePanelGroup,
  ResizableHandle,
} from "@/components/ui/resizable";
import { VideoEditorPreview } from "./video-editor-preview";
import { VideoEditorTimeline } from "./video-editor-timeline";
import { VideoEditorToolbar } from "./video-editor-toolbar";
import { VideoEditorSidebar } from "./video-editor-sidebar";
import { VideoEditorAssets } from "./video-editor-assets";
import { ClipEditorControls } from "./clip-editor-controls";
import { ExportSettingsModal } from "./export-settings-modal";
import { ExportProgressModal } from "./export-progress-modal";
import { PerformanceDashboard } from "./performance-dashboard";
import { useEditorShortcuts } from "./use-editor-shortcuts";
import {
  useVideoEditorStore,
  usePlayback,
  useTimeline,
  useClips,
  useProjectActions,
  useExport,
} from "@/lib/stores/video-editor-store";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize,
  Save,
  Download,
  Undo,
  Redo,
  Scissors,
  Type,
  Palette,
  Music,
} from "lucide-react";

export interface VideoEditorWorkspaceProps {
  /** Current video ID being edited */
  videoId: string | null;
  /** Callback when a video is loaded */
  onVideoLoad?: (videoId: string) => void;
  /** Custom CSS class */
  className?: string;
}

export const VideoEditorWorkspace = ({
  videoId,
  onVideoLoad,
  className,
}: VideoEditorWorkspaceProps) => {
  const [activePanel, setActivePanel] = useState<
    "assets" | "effects" | "captions" | "audio"
  >("assets");
  const [previewSize, setPreviewSize] = useState({ width: 1920, height: 1080 });
  const [showExportSettings, setShowExportSettings] = useState(false);
  const [showExportProgress, setShowExportProgress] = useState(false);
  const [showPerformanceDashboard, setShowPerformanceDashboard] =
    useState(false);

  // Video editor store selectors
  const {
    isPlaying,
    volume,
    isMuted,
    currentTime,
    duration,
    play,
    pause,
    setVolume,
    toggleMute,
  } = usePlayback();

  const { timeline, setCurrentTime, setZoom } = useTimeline();

  const { clips, addClip } = useClips();

  const { undo, redo, canUndo, canRedo } = useProjectActions();

  const {
    isExporting,
    exportProgress,
    exportStage,
    exportError,
    exportedVideoUrl,
    startExport,
    updateExportProgress,
    setExportStage,
    setExportError,
    completeExport,
    cancelExport,
  } = useExport();

  const zoom = timeline.zoom;
  const selectedClip =
    clips.find((clip) => clip.id === timeline.selectedClipId) || null;

  // Add demo clips on component mount for testing
  useEffect(() => {
    if (clips.length === 0) {
      // Add a demo video clip
      addClip({
        url: "/api/placeholder/video/sample1.mp4",
        startTime: 0,
        endTime: 15,
        duration: 15,
        volume: 1,
        effects: [],
      });

      // Add another demo clip
      setTimeout(() => {
        addClip({
          url: "/api/placeholder/video/sample2.mp4",
          startTime: 15,
          endTime: 30,
          duration: 15,
          volume: 0.8,
          effects: [],
        });
      }, 100);
    }
  }, [clips.length, addClip]);

  // Auto-show export progress modal when export starts
  useEffect(() => {
    if (isExporting && !showExportProgress) {
      setShowExportProgress(true);
    }
  }, [isExporting, showExportProgress]);

  // Mock video data for development
  const mockVideo = {
    id: "mock-video-1",
    title: "Sample Video for Editing",
    url: "/api/placeholder/video/sample.mp4",
    thumbnail: "/api/placeholder/480/270",
    duration: 30,
    width: 1920,
    height: 1080,
  };

  const handlePlayPause = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  const handleTimeUpdate = useCallback(
    (time: number) => {
      setCurrentTime(time);
    },
    [setCurrentTime]
  );

  const handleVolumeChange = useCallback(
    (newVolume: number) => {
      setVolume(newVolume);
    },
    [setVolume]
  );

  const handleSave = useCallback(() => {
    console.log("Saving project...");
    // Implement save functionality
  }, []);

  const handleExport = useCallback(() => {
    setShowExportSettings(true);
  }, []);

  const handlePerformance = useCallback(() => {
    setShowPerformanceDashboard(!showPerformanceDashboard);
  }, [showPerformanceDashboard]);

  const handleStartExport = useCallback(
    (settings: any) => {
      setShowExportSettings(false);
      setShowExportProgress(true);
      startExport();

      // Simulate export process with realistic progress
      const simulateExport = async () => {
        try {
          // Stage 1: Prepare (10%)
          setExportStage("prepare");
          for (let i = 0; i <= 10; i++) {
            updateExportProgress(i);
            await new Promise((resolve) => setTimeout(resolve, 100));
          }

          // Stage 2: Render (60%)
          setExportStage("render");
          for (let i = 10; i <= 70; i++) {
            updateExportProgress(i);
            await new Promise((resolve) => setTimeout(resolve, 150));
          }

          // Stage 3: Encode (20%)
          setExportStage("encode");
          for (let i = 70; i <= 90; i++) {
            updateExportProgress(i);
            await new Promise((resolve) => setTimeout(resolve, 200));
          }

          // Stage 4: Upload (10%)
          setExportStage("upload");
          for (let i = 90; i <= 100; i++) {
            updateExportProgress(i);
            await new Promise((resolve) => setTimeout(resolve, 100));
          }

          // Complete export with mock video URL
          const mockVideoUrl = `https://storage.viralai.com/exports/video-${Date.now()}.mp4`;
          completeExport(mockVideoUrl);
        } catch (error) {
          setExportError("Export failed: " + (error as Error).message);
        }
      };

      simulateExport();
    },
    [
      startExport,
      setExportStage,
      updateExportProgress,
      completeExport,
      setExportError,
    ]
  );

  const handleSplitAtCurrentTime = useCallback(() => {
    if (!selectedClip) return;

    const splitTime = currentTime;
    if (
      splitTime <= selectedClip.startTime ||
      splitTime >= selectedClip.endTime
    ) {
      return;
    }

    console.log("Splitting clip at current time:", splitTime);
    // Implementation for splitting would be handled by the clip editor controls
  }, [selectedClip, currentTime]);

  // Setup keyboard shortcuts
  useEditorShortcuts({
    selectedClip,
    currentTime,
    onSplitAtCurrentTime: handleSplitAtCurrentTime,
    onTrimStart: () => console.log("Trim start triggered"),
    onCopyClip: () => console.log("Copy clip triggered"),
    onPasteClip: () => console.log("Paste clip triggered"),
    onDeleteClip: () =>
      selectedClip && console.log("Delete clip triggered:", selectedClip.id),
  });

  return (
    <div className={cn("h-full flex flex-col bg-background", className)}>
      {/* Performance Dashboard Overlay */}
      {showPerformanceDashboard && (
        <div className="absolute inset-0 z-50 bg-background/80 backdrop-blur-sm">
          <div className="h-full overflow-y-auto p-4">
            <PerformanceDashboard
              isOpen={showPerformanceDashboard}
              onClose={() => setShowPerformanceDashboard(false)}
            />
          </div>
        </div>
      )}

      {/* Top Toolbar */}
      <VideoEditorToolbar
        onSave={handleSave}
        onExport={handleExport}
        onPerformance={handlePerformance}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        className="border-b border-border"
      />

      {/* Main Editor Layout */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Left Sidebar - Assets & Tools */}
          <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
            <VideoEditorSidebar
              activePanel={activePanel}
              onPanelChange={setActivePanel}
              duration={duration}
              className="h-full"
            />
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Center - Preview & Timeline */}
          <ResizablePanel defaultSize={60} minSize={40}>
            <div className="h-full flex flex-col">
              {/* Video Preview */}
              <div className="flex-1 p-4 flex items-center justify-center bg-muted/20">
                <VideoEditorPreview
                  video={mockVideo}
                  currentTime={currentTime}
                  isPlaying={isPlaying}
                  onTimeUpdate={handleTimeUpdate}
                  onPlayPause={handlePlayPause}
                  className="max-w-full max-h-full"
                />
              </div>

              <Separator />

              {/* Playback Controls */}
              <div className="p-4 bg-muted/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentTime(Math.max(0, currentTime - 10))
                      }
                    >
                      <SkipBack className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePlayPause}
                    >
                      {isPlaying ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentTime(Math.min(duration, currentTime + 10))
                      }
                    >
                      <SkipForward className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">
                      {Math.floor(currentTime)}s / {Math.floor(duration)}s
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={toggleMute}>
                      {isMuted ? (
                        <VolumeX className="h-4 w-4" />
                      ) : (
                        <Volume2 className="h-4 w-4" />
                      )}
                    </Button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={volume}
                      onChange={(e) =>
                        handleVolumeChange(parseFloat(e.target.value))
                      }
                      className="w-20"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Timeline */}
              <div className="h-48 bg-background">
                <VideoEditorTimeline
                  duration={duration}
                  currentTime={currentTime}
                  clips={clips}
                  selectedClip={selectedClip}
                  zoom={zoom}
                  onTimeChange={setCurrentTime}
                  onZoomChange={setZoom}
                  className="h-full"
                />
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Right Panel - Clip Editor Controls */}
          <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
            <div className="h-full overflow-y-auto">
              <ClipEditorControls
                selectedClip={selectedClip}
                currentTime={currentTime}
                onClipUpdate={(clipId, updates) => {
                  console.log("Updating clip:", clipId, updates);
                }}
                onClipSplit={(clipId, splitTime) => {
                  console.log("Splitting clip:", clipId, "at time:", splitTime);
                }}
                onClipDelete={(clipId) => {
                  console.log("Deleting clip:", clipId);
                }}
                className="h-full rounded-none border-l-0 border-r-0 border-t-0"
              />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Export Settings Modal */}
      <ExportSettingsModal
        isOpen={showExportSettings}
        onClose={() => setShowExportSettings(false)}
        onStartExport={handleStartExport}
        duration={duration}
      />

      {/* Export Progress Modal */}
      <ExportProgressModal
        isOpen={showExportProgress}
        onClose={() => setShowExportProgress(false)}
      />
    </div>
  );
};

export default VideoEditorWorkspace;
