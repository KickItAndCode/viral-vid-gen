"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TimelineClipEditor } from "./timeline-clip-editor";
import {
  ZoomIn,
  ZoomOut,
  Scissors,
  Copy,
  Trash2,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
} from "lucide-react";

export interface VideoClip {
  id: string;
  type: "video" | "audio" | "image" | "text";
  name: string;
  startTime: number;
  duration: number;
  url?: string;
  thumbnail?: string;
  color?: string;
  volume?: number;
  isVisible?: boolean;
  isMuted?: boolean;
}

export interface VideoTrack {
  id: string;
  name: string;
  type: "video" | "audio" | "overlay";
  clips: VideoClip[];
  isVisible: boolean;
  isMuted: boolean;
  height: number;
}

export interface VideoEditorTimelineProps {
  /** Total duration in seconds */
  duration: number;
  /** Current playback time */
  currentTime: number;
  /** Video clips data */
  clips: VideoClip[];
  /** Currently selected clip */
  selectedClip: VideoClip | null;
  /** Timeline zoom level */
  zoom: number;
  /** Callback for time changes */
  onTimeChange?: (time: number) => void;
  /** Callback for zoom changes */
  onZoomChange?: (zoom: number) => void;
  /** Callback for clip selection */
  onClipSelect?: (clip: VideoClip | null) => void;
  /** Callback for clip updates */
  onClipUpdate?: (clip: VideoClip) => void;
  /** Custom CSS class */
  className?: string;
}

export const VideoEditorTimeline = ({
  duration,
  currentTime,
  clips,
  selectedClip,
  zoom,
  onTimeChange,
  onZoomChange,
  onClipSelect,
  onClipUpdate,
  className,
}: VideoEditorTimelineProps) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [trimmingClipId, setTrimmingClipId] = useState<string | null>(null);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);

  // Mock tracks for demonstration
  const tracks: VideoTrack[] = useMemo(
    () => [
      {
        id: "video-track-1",
        name: "Video Track",
        type: "video",
        clips: clips.filter((clip) => clip.type === "video"),
        isVisible: true,
        isMuted: false,
        height: 80,
      },
      {
        id: "audio-track-1",
        name: "Audio Track",
        type: "audio",
        clips: clips.filter((clip) => clip.type === "audio"),
        isVisible: true,
        isMuted: false,
        height: 60,
      },
      {
        id: "overlay-track-1",
        name: "Text & Graphics",
        type: "overlay",
        clips: clips.filter(
          (clip) => clip.type === "text" || clip.type === "image"
        ),
        isVisible: true,
        isMuted: false,
        height: 50,
      },
    ],
    [clips]
  );

  // Calculate timeline dimensions
  const timelineWidth = duration * zoom * 10; // 10px per second at zoom level 1
  const pixelsPerSecond = zoom * 10;

  // Generate time markers
  const timeMarkers = useMemo(() => {
    const markers = [];
    const interval = zoom < 0.5 ? 10 : zoom < 1 ? 5 : zoom < 2 ? 1 : 0.5;

    for (let time = 0; time <= duration; time += interval) {
      markers.push({
        time,
        position: time * pixelsPerSecond,
        isMain: time % (interval * 2) === 0,
      });
    }
    return markers;
  }, [duration, zoom, pixelsPerSecond]);

  const handleTimelineClick = useCallback(
    (event: React.MouseEvent) => {
      if (!timelineRef.current) return;

      const rect = timelineRef.current.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const time = Math.max(0, Math.min(duration, x / pixelsPerSecond));

      onTimeChange?.(time);
    },
    [duration, pixelsPerSecond, onTimeChange]
  );

  const handleZoomIn = useCallback(() => {
    onZoomChange?.(Math.min(zoom * 1.5, 5));
  }, [zoom, onZoomChange]);

  const handleZoomOut = useCallback(() => {
    onZoomChange?.(Math.max(zoom / 1.5, 0.1));
  }, [zoom, onZoomChange]);

  const handleClipClick = useCallback(
    (clip: VideoClip, event: React.MouseEvent) => {
      event.stopPropagation();
      onClipSelect?.(clip);
    },
    [onClipSelect]
  );

  const handleClipSplit = useCallback((clip: VideoClip, splitTime: number) => {
    console.log("Splitting clip:", clip.id, "at time:", splitTime);
    // This would create two clips from the split point
    // Implementation would involve updating the clips array
  }, []);

  const handleTrimStart = useCallback((clip: VideoClip) => {
    setTrimmingClipId(clip.id);
    setTrimStart(clip.startTime);
    setTrimEnd(clip.endTime);
  }, []);

  const handleTrimUpdate = useCallback(
    (clipId: string, start: number, end: number) => {
      if (trimmingClipId === clipId) {
        setTrimStart(start);
        setTrimEnd(end);
      }
    },
    [trimmingClipId]
  );

  const handleTrimConfirm = useCallback(
    (clip: VideoClip) => {
      if (trimmingClipId === clip.id) {
        onClipUpdate?.(clip);
        setTrimmingClipId(null);
      }
    },
    [trimmingClipId, onClipUpdate]
  );

  const handleClipMove = useCallback(
    (clip: VideoClip, newStartTime: number) => {
      const newClip = {
        ...clip,
        startTime: newStartTime,
        endTime: newStartTime + clip.duration,
      };
      onClipUpdate?.(newClip);
    },
    [onClipUpdate]
  );

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins}:${secs.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className={cn("h-full bg-background border-t border-border", className)}
    >
      {/* Timeline Controls */}
      <div className="h-12 px-4 flex items-center justify-between border-b border-border bg-muted/50">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Timeline</span>
          <Separator orientation="vertical" className="h-4" />
          <span className="text-xs text-muted-foreground">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomOut}
            disabled={zoom <= 0.1}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground min-w-12 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomIn}
            disabled={zoom >= 5}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Timeline Content */}
      <div className="flex-1 flex">
        {/* Track Headers */}
        <div className="w-48 bg-muted/20 border-r border-border">
          {tracks.map((track) => (
            <div
              key={track.id}
              className="flex items-center justify-between px-3 border-b border-border"
              style={{ height: `${track.height}px` }}
            >
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => {
                    // Toggle track visibility
                  }}
                >
                  {track.isVisible ? (
                    <Eye className="h-3 w-3" />
                  ) : (
                    <EyeOff className="h-3 w-3" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => {
                    // Toggle track mute
                  }}
                >
                  {track.isMuted ? (
                    <VolumeX className="h-3 w-3" />
                  ) : (
                    <Volume2 className="h-3 w-3" />
                  )}
                </Button>
                <span className="text-xs font-medium truncate">
                  {track.name}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Timeline Scroll Area */}
        <ScrollArea className="flex-1">
          <div
            ref={timelineRef}
            className="relative cursor-pointer"
            style={{ width: `${Math.max(timelineWidth, 800)}px` }}
            onClick={handleTimelineClick}
          >
            {/* Time Ruler */}
            <div className="h-8 border-b border-border bg-background relative">
              {timeMarkers.map((marker) => (
                <div
                  key={marker.time}
                  className="absolute top-0 border-l border-border/50"
                  style={{ left: `${marker.position}px` }}
                >
                  <div
                    className={cn(
                      "h-full",
                      marker.isMain
                        ? "border-l-2 border-border"
                        : "border-l border-border/30"
                    )}
                  />
                  {marker.isMain && (
                    <span className="absolute top-0 left-1 text-xs text-muted-foreground">
                      {formatTime(marker.time)}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Playhead */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-30 pointer-events-none"
              style={{ left: `${currentTime * pixelsPerSecond}px` }}
            >
              <div className="absolute top-0 -left-1 w-3 h-3 bg-red-500 transform rotate-45" />
            </div>

            {/* Tracks */}
            {tracks.map((track) => (
              <div
                key={track.id}
                className="border-b border-border bg-muted/5 relative"
                style={{ height: `${track.height}px` }}
              >
                {track.clips.map((clip) => (
                  <TimelineClipEditor
                    key={clip.id}
                    clip={clip}
                    currentTime={currentTime}
                    pixelsPerSecond={pixelsPerSecond}
                    isSelected={selectedClip?.id === clip.id}
                    isTrimming={trimmingClipId === clip.id}
                    trimStart={
                      trimmingClipId === clip.id ? trimStart : undefined
                    }
                    trimEnd={trimmingClipId === clip.id ? trimEnd : undefined}
                    onSelect={() => onClipSelect?.(clip)}
                    onSplit={(time) => handleClipSplit(clip, time)}
                    onTrimStart={() => handleTrimStart(clip)}
                    onTrimUpdate={(start, end) =>
                      handleTrimUpdate(clip.id, start, end)
                    }
                    onTrimConfirm={() => handleTrimConfirm(clip)}
                    onMove={(newStartTime) =>
                      handleClipMove(clip, newStartTime)
                    }
                  />
                ))}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default VideoEditorTimeline;
