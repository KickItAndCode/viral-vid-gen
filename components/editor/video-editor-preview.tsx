"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { VideoPlayer } from "@/components/video/video-player";
import {
  Play,
  Pause,
  Maximize,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Grid3X3,
} from "lucide-react";

export interface VideoEditorPreviewProps {
  /** Video data to preview */
  video: {
    id: string;
    title: string;
    url: string;
    thumbnail?: string;
    duration: number;
    width: number;
    height: number;
  };
  /** Current playback time */
  currentTime: number;
  /** Whether video is playing */
  isPlaying: boolean;
  /** Callback for time updates */
  onTimeUpdate?: (time: number) => void;
  /** Callback for play/pause */
  onPlayPause?: () => void;
  /** Callback for seeking */
  onSeek?: (time: number) => void;
  /** Custom CSS class */
  className?: string;
}

export const VideoEditorPreview = ({
  video,
  currentTime,
  isPlaying,
  onTimeUpdate,
  onPlayPause,
  onSeek,
  className,
}: VideoEditorPreviewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showGrid, setShowGrid] = useState(false);
  const [previewScale, setPreviewScale] = useState(1);
  const [previewRotation, setPreviewRotation] = useState(0);

  // Calculate aspect ratio and sizing
  const aspectRatio = video.width / video.height;
  const isLandscape = aspectRatio > 1;

  const handleZoomIn = useCallback(() => {
    setPreviewScale((prev) => Math.min(prev + 0.1, 2));
  }, []);

  const handleZoomOut = useCallback(() => {
    setPreviewScale((prev) => Math.max(prev - 0.1, 0.5));
  }, []);

  const handleRotate = useCallback(() => {
    setPreviewRotation((prev) => (prev + 90) % 360);
  }, []);

  const handleReset = useCallback(() => {
    setPreviewScale(1);
    setPreviewRotation(0);
  }, []);

  return (
    <Card className={cn("relative overflow-hidden bg-black", className)}>
      {/* Preview Controls */}
      <div className="absolute top-2 right-2 z-10 flex space-x-1">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowGrid(!showGrid)}
          className="h-8 w-8 p-0 bg-black/50 hover:bg-black/70"
        >
          <Grid3X3 className="h-4 w-4 text-white" />
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleZoomOut}
          className="h-8 w-8 p-0 bg-black/50 hover:bg-black/70"
        >
          <ZoomOut className="h-4 w-4 text-white" />
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleZoomIn}
          className="h-8 w-8 p-0 bg-black/50 hover:bg-black/70"
        >
          <ZoomIn className="h-4 w-4 text-white" />
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleRotate}
          className="h-8 w-8 p-0 bg-black/50 hover:bg-black/70"
        >
          <RotateCw className="h-4 w-4 text-white" />
        </Button>
      </div>

      {/* Video Preview Container */}
      <div
        ref={containerRef}
        className="relative w-full h-full flex items-center justify-center"
      >
        {/* Grid Overlay */}
        {showGrid && (
          <div className="absolute inset-0 z-10 pointer-events-none">
            <svg
              className="w-full h-full"
              style={{
                transform: `scale(${previewScale}) rotate(${previewRotation}deg)`,
              }}
            >
              <defs>
                <pattern
                  id="grid"
                  width="60"
                  height="60"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 60 0 L 0 0 0 60"
                    fill="none"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="1"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
        )}

        {/* Video Player */}
        <div
          className="relative max-w-full max-h-full"
          style={{
            transform: `scale(${previewScale}) rotate(${previewRotation}deg)`,
            transformOrigin: "center center",
            transition: "transform 0.2s ease-in-out",
          }}
        >
          <VideoPlayer
            url={video.url}
            width="100%"
            height="100%"
            controls={false}
            autoplay={false}
            muted={false}
            poster={video.thumbnail}
            onProgress={(progress) => {
              onTimeUpdate?.(progress.playedSeconds);
            }}
            onSeek={onSeek}
            className="shadow-lg"
          />
        </div>

        {/* Center Play Button Overlay */}
        {!isPlaying && (
          <Button
            variant="secondary"
            size="lg"
            onClick={onPlayPause}
            className="absolute z-20 h-16 w-16 rounded-full bg-black/50 hover:bg-black/70 border-2 border-white/20"
          >
            <Play className="h-8 w-8 text-white ml-1" />
          </Button>
        )}
      </div>

      {/* Preview Info */}
      <div className="absolute bottom-2 left-2 z-10 bg-black/50 rounded px-2 py-1 text-xs text-white">
        <div>
          {video.width} × {video.height}
        </div>
        <div>Scale: {Math.round(previewScale * 100)}%</div>
        {previewRotation > 0 && <div>Rotation: {previewRotation}°</div>}
      </div>

      {/* Reset Button */}
      {(previewScale !== 1 || previewRotation !== 0) && (
        <div className="absolute bottom-2 right-2 z-10">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleReset}
            className="h-8 px-2 bg-black/50 hover:bg-black/70 text-xs text-white"
          >
            Reset View
          </Button>
        </div>
      )}
    </Card>
  );
};

export default VideoEditorPreview;
