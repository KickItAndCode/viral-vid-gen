"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Scissors,
  GripVertical,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
} from "lucide-react";
import type { VideoClip } from "@/lib/stores/video-editor-store";

export interface TimelineClipEditorProps {
  /** The video clip */
  clip: VideoClip;
  /** Current playback time */
  currentTime: number;
  /** Pixels per second for timeline scaling */
  pixelsPerSecond: number;
  /** Whether clip is selected */
  isSelected: boolean;
  /** Whether clip is being trimmed */
  isTrimming?: boolean;
  /** Trim start time */
  trimStart?: number;
  /** Trim end time */
  trimEnd?: number;
  /** Callback for clip selection */
  onSelect?: () => void;
  /** Callback for clip split */
  onSplit?: (time: number) => void;
  /** Callback for clip trim */
  onTrimStart?: () => void;
  /** Callback for trim update */
  onTrimUpdate?: (start: number, end: number) => void;
  /** Callback for trim confirm */
  onTrimConfirm?: () => void;
  /** Callback for clip move */
  onMove?: (newStartTime: number) => void;
  /** Custom CSS class */
  className?: string;
}

export const TimelineClipEditor = ({
  clip,
  currentTime,
  pixelsPerSecond,
  isSelected,
  isTrimming = false,
  trimStart,
  trimEnd,
  onSelect,
  onSplit,
  onTrimStart,
  onTrimUpdate,
  onTrimConfirm,
  onMove,
  className,
}: TimelineClipEditorProps) => {
  const clipRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizingLeft, setIsResizingLeft] = useState(false);
  const [isResizingRight, setIsResizingRight] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

  const displayStartTime =
    isTrimming && trimStart !== undefined ? trimStart : clip.startTime;
  const displayEndTime =
    isTrimming && trimEnd !== undefined ? trimEnd : clip.endTime;
  const displayDuration = displayEndTime - displayStartTime;

  const clipStyle = {
    left: `${displayStartTime * pixelsPerSecond}px`,
    width: `${displayDuration * pixelsPerSecond}px`,
  };

  const getClipColor = () => {
    if (isTrimming) return "bg-yellow-500";
    if (isSelected) return "bg-blue-500";
    return "bg-blue-400";
  };

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      onSelect?.();

      const rect = clipRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = e.clientX - rect.left;
      const isLeftEdge = x < 8;
      const isRightEdge = x > rect.width - 8;

      if (isTrimming) {
        if (isLeftEdge) {
          setIsResizingLeft(true);
        } else if (isRightEdge) {
          setIsResizingRight(true);
        }
      } else {
        setIsDragging(true);
        setDragOffset(x);
      }
    },
    [onSelect, isTrimming]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!clipRef.current) return;

      const timelineRect =
        clipRef.current.parentElement?.getBoundingClientRect();
      if (!timelineRect) return;

      const x = e.clientX - timelineRect.left;
      const time = x / pixelsPerSecond;

      if (isResizingLeft && isTrimming) {
        const newStart = Math.max(0, Math.min(time, displayEndTime - 0.1));
        onTrimUpdate?.(newStart, displayEndTime);
      } else if (isResizingRight && isTrimming) {
        const newEnd = Math.max(displayStartTime + 0.1, time);
        onTrimUpdate?.(displayStartTime, newEnd);
      } else if (isDragging && !isTrimming) {
        const newStartTime = Math.max(0, time - dragOffset / pixelsPerSecond);
        onMove?.(newStartTime);
      }
    },
    [
      isDragging,
      isResizingLeft,
      isResizingRight,
      isTrimming,
      pixelsPerSecond,
      dragOffset,
      displayStartTime,
      displayEndTime,
      onTrimUpdate,
      onMove,
    ]
  );

  const handleMouseUp = useCallback(() => {
    if (isTrimming && (isResizingLeft || isResizingRight)) {
      onTrimConfirm?.();
    }

    setIsDragging(false);
    setIsResizingLeft(false);
    setIsResizingRight(false);
  }, [isTrimming, isResizingLeft, isResizingRight, onTrimConfirm]);

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      if (isTrimming) return;

      const rect = clipRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = e.clientX - rect.left;
      const relativeTime = (x / rect.width) * clip.duration;
      const absoluteTime = clip.startTime + relativeTime;

      onSplit?.(absoluteTime);
    },
    [clip.startTime, clip.duration, onSplit, isTrimming]
  );

  // Add global mouse event listeners
  useEffect(() => {
    if (isDragging || isResizingLeft || isResizingRight) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [
    isDragging,
    isResizingLeft,
    isResizingRight,
    handleMouseMove,
    handleMouseUp,
  ]);

  // Check if playhead is over this clip
  const isPlayheadOver =
    currentTime >= displayStartTime && currentTime <= displayEndTime;

  return (
    <div
      ref={clipRef}
      className={cn(
        "absolute top-1 bottom-1 rounded cursor-pointer border-2 transition-all duration-200 group",
        getClipColor(),
        isSelected ? "border-white shadow-lg" : "border-transparent",
        isTrimming ? "shadow-xl ring-2 ring-yellow-300" : "",
        className
      )}
      style={clipStyle}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
    >
      {/* Clip Content */}
      <div className="h-full flex items-center justify-between px-2 text-white text-xs relative overflow-hidden">
        <div className="flex items-center space-x-1 truncate">
          <span className="truncate">{clip.url.split("/").pop()}</span>
          {clip.volume === 0 && <VolumeX className="h-3 w-3 flex-shrink-0" />}
        </div>

        <div className="flex items-center space-x-1 flex-shrink-0">
          <span>{Math.round(displayDuration)}s</span>
        </div>
      </div>

      {/* Playhead indicator */}
      {isPlayheadOver && (
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
          style={{
            left: `${((currentTime - displayStartTime) / displayDuration) * 100}%`,
          }}
        />
      )}

      {/* Split indicator on hover */}
      {!isTrimming && isSelected && (
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <Scissors className="h-4 w-4 text-white drop-shadow-lg" />
          </div>
        </div>
      )}

      {/* Resize handles for trimming */}
      {isTrimming && (
        <>
          <div
            className="absolute left-0 top-0 bottom-0 w-2 bg-yellow-300 cursor-w-resize opacity-80 hover:opacity-100"
            onMouseDown={(e) => {
              e.stopPropagation();
              setIsResizingLeft(true);
            }}
          />
          <div
            className="absolute right-0 top-0 bottom-0 w-2 bg-yellow-300 cursor-e-resize opacity-80 hover:opacity-100"
            onMouseDown={(e) => {
              e.stopPropagation();
              setIsResizingRight(true);
            }}
          />
        </>
      )}

      {/* Drag handle */}
      {!isTrimming && isSelected && (
        <div className="absolute left-1 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
          <GripVertical className="h-3 w-3 text-white/70" />
        </div>
      )}

      {/* Trim mode overlay */}
      {isTrimming && (
        <div className="absolute inset-0 bg-yellow-500/20 border-2 border-yellow-300 rounded pointer-events-none">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full">
            <div className="bg-yellow-500 text-black text-xs px-1 py-0.5 rounded whitespace-nowrap">
              Trimming: {Math.round(displayDuration * 100) / 100}s
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimelineClipEditor;
