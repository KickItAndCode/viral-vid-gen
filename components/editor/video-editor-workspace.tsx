"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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
  useAudioTracks,
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
  Menu,
  Settings,
  ChevronUp,
  ChevronDown,
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

  // Mobile-specific state
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileTimeline, setShowMobileTimeline] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [showMobileControls, setShowMobileControls] = useState(false);
  const [mobileLayout, setMobileLayout] = useState<
    "preview" | "timeline" | "controls"
  >("preview");

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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

  const { audioTracks, addAudioTrack, updateAudioTrack } = useAudioTracks();

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

  // Add demo clips and audio tracks on component mount for testing
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

    // Add demo audio tracks for testing
    if (audioTracks.length === 0) {
      setTimeout(() => {
        addAudioTrack({
          url: "/api/placeholder/audio/background.mp3",
          type: "background",
          volume: 0.6,
          startTime: 0,
          duration: 30,
          fadeIn: 2,
          fadeOut: 2,
        });
      }, 200);

      setTimeout(() => {
        addAudioTrack({
          url: "/api/placeholder/audio/voiceover.mp3",
          type: "voiceover",
          volume: 0.8,
          startTime: 5,
          duration: 20,
          fadeIn: 0.5,
          fadeOut: 1,
        });
      }, 300);
    }
  }, [clips.length, audioTracks.length, addClip, addAudioTrack]);

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

  // Mobile render method
  if (isMobile) {
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

        {/* Mobile Top Toolbar */}
        <div className="flex items-center justify-between p-2 bg-background border-b border-border">
          <div className="flex items-center space-x-2">
            <Sheet open={showMobileSidebar} onOpenChange={setShowMobileSidebar}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <SheetHeader>
                  <SheetTitle>Assets & Tools</SheetTitle>
                </SheetHeader>
                <VideoEditorSidebar
                  activePanel={activePanel}
                  onPanelChange={setActivePanel}
                  duration={duration}
                  className="h-full mt-4"
                />
              </SheetContent>
            </Sheet>

            <Button
              variant="outline"
              size="sm"
              onClick={undo}
              disabled={!canUndo}
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={redo}
              disabled={!canRedo}
            >
              <Redo className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handleSave}>
              <Save className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4" />
            </Button>
            <Sheet
              open={showMobileControls}
              onOpenChange={setShowMobileControls}
            >
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <SheetHeader>
                  <SheetTitle>Clip Controls</SheetTitle>
                </SheetHeader>
                <ClipEditorControls
                  selectedClip={selectedClip}
                  currentTime={currentTime}
                  onClipUpdate={(clipId, updates) => {
                    console.log("Updating clip:", clipId, updates);
                  }}
                  onClipSplit={(clipId, splitTime) => {
                    console.log(
                      "Splitting clip:",
                      clipId,
                      "at time:",
                      splitTime
                    );
                  }}
                  onClipDelete={(clipId) => {
                    console.log("Deleting clip:", clipId);
                  }}
                  className="h-full mt-4"
                />
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Mobile Layout Switcher */}
        <div className="flex bg-muted/20 border-b border-border">
          <Button
            variant={mobileLayout === "preview" ? "default" : "ghost"}
            size="sm"
            onClick={() => setMobileLayout("preview")}
            className="flex-1 rounded-none"
          >
            Preview
          </Button>
          <Button
            variant={mobileLayout === "timeline" ? "default" : "ghost"}
            size="sm"
            onClick={() => setMobileLayout("timeline")}
            className="flex-1 rounded-none"
          >
            Timeline
          </Button>
          <Button
            variant={mobileLayout === "controls" ? "default" : "ghost"}
            size="sm"
            onClick={() => setMobileLayout("controls")}
            className="flex-1 rounded-none"
          >
            Controls
          </Button>
        </div>

        {/* Mobile Content Area */}
        <div className="flex-1 overflow-hidden">
          {mobileLayout === "preview" && (
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

              {/* Mobile Playback Controls */}
              <div className="p-4 bg-muted/50">
                <div className="flex items-center justify-center space-x-4 mb-3">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() =>
                      setCurrentTime(Math.max(0, currentTime - 10))
                    }
                    className="h-12 w-12"
                  >
                    <SkipBack className="h-6 w-6" />
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handlePlayPause}
                    className="h-16 w-16"
                  >
                    {isPlaying ? (
                      <Pause className="h-8 w-8" />
                    ) : (
                      <Play className="h-8 w-8" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() =>
                      setCurrentTime(Math.min(duration, currentTime + 10))
                    }
                    className="h-12 w-12"
                  >
                    <SkipForward className="h-6 w-6" />
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {Math.floor(currentTime)}s / {Math.floor(duration)}s
                  </span>

                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={toggleMute}>
                      {isMuted ? (
                        <VolumeX className="h-5 w-5" />
                      ) : (
                        <Volume2 className="h-5 w-5" />
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
                      className="w-24"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {mobileLayout === "timeline" && (
            <div className="h-full bg-background">
              <VideoEditorTimeline
                duration={duration}
                currentTime={currentTime}
                clips={clips}
                selectedClip={selectedClip}
                zoom={zoom}
                audioTracks={audioTracks}
                onTimeChange={setCurrentTime}
                onZoomChange={setZoom}
                onAudioTrackUpdate={updateAudioTrack}
                className="h-full"
              />
            </div>
          )}

          {mobileLayout === "controls" && (
            <div className="h-full overflow-y-auto p-4">
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
                className="h-full"
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Desktop layout
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
                  audioTracks={audioTracks}
                  onTimeChange={setCurrentTime}
                  onZoomChange={setZoom}
                  onAudioTrackUpdate={updateAudioTrack}
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
