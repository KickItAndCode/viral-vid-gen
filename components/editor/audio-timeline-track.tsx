"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import WaveSurfer from "wavesurfer.js";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Scissors,
  Copy,
  Trash2,
  Music,
  Mic,
  Zap,
  Lock,
  Unlock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AudioTrack } from "@/lib/stores/video-editor-store";

interface AudioTimelineTrackProps {
  audioTrack: AudioTrack;
  duration: number;
  currentTime: number;
  zoom: number;
  pixelsPerSecond: number;
  isSelected?: boolean;
  isVisible?: boolean;
  isMuted?: boolean;
  onTrackUpdate?: (track: AudioTrack) => void;
  onTimeChange?: (time: number) => void;
  onSelect?: () => void;
  onDelete?: () => void;
  onSplit?: (time: number) => void;
  onCopy?: () => void;
  className?: string;
}

export function AudioTimelineTrack({
  audioTrack,
  duration,
  currentTime,
  zoom,
  pixelsPerSecond,
  isSelected = false,
  isVisible = true,
  isMuted = false,
  onTrackUpdate,
  onTimeChange,
  onSelect,
  onDelete,
  onSplit,
  onCopy,
  className,
}: AudioTimelineTrackProps) {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [waveformLoaded, setWaveformLoaded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragType, setDragType] = useState<
    "move" | "trim-start" | "trim-end" | null
  >(null);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartTime, setDragStartTime] = useState(0);
  const [localTrack, setLocalTrack] = useState(audioTrack);
  const [isLocked, setIsLocked] = useState(false);

  // Calculate track position and size
  const trackWidth = localTrack.duration * pixelsPerSecond;
  const trackLeft = localTrack.startTime * pixelsPerSecond;
  const fadeInWidth = (localTrack.fadeIn || 0) * pixelsPerSecond;
  const fadeOutWidth = (localTrack.fadeOut || 0) * pixelsPerSecond;

  // Update waveform colors based on track state
  const getWaveColor = () => {
    if (!isVisible) return "#6b7280";
    if (isMuted) return "#9ca3af";

    switch (localTrack.type) {
      case "background":
        return "#3b82f6";
      case "voiceover":
        return "#10b981";
      case "sfx":
        return "#8b5cf6";
      default:
        return "#6b7280";
    }
  };

  const getProgressColor = () => {
    if (!isVisible) return "#374151";
    if (isMuted) return "#4b5563";

    switch (localTrack.type) {
      case "background":
        return "#1d4ed8";
      case "voiceover":
        return "#059669";
      case "sfx":
        return "#7c3aed";
      default:
        return "#374151";
    }
  };

  // Initialize waveform
  useEffect(() => {
    if (!waveformRef.current || !localTrack.url) return;

    const container = waveformRef.current;

    // Clear existing waveform
    if (wavesurferRef.current) {
      wavesurferRef.current.destroy();
    }

    const wavesurfer = WaveSurfer.create({
      container,
      waveColor: getWaveColor(),
      progressColor: getProgressColor(),
      cursorColor: "transparent",
      barWidth: 1,
      barRadius: 0,
      height: 40,
      normalize: true,
      backend: "WebAudio",
      interact: false,
      barGap: 0,
    });

    wavesurferRef.current = wavesurfer;

    wavesurfer.load(localTrack.url);

    wavesurfer.on("ready", () => {
      setWaveformLoaded(true);
      wavesurfer.setVolume(localTrack.volume);
    });

    wavesurfer.on("error", (error) => {
      console.error("Waveform error:", error);
    });

    return () => {
      wavesurfer.destroy();
    };
  }, [localTrack.url, localTrack.volume, getWaveColor, getProgressColor]);

  // Update waveform progress based on current time
  useEffect(() => {
    if (!wavesurferRef.current || !waveformLoaded) return;

    const relativeTime = currentTime - localTrack.startTime;
    if (relativeTime >= 0 && relativeTime <= localTrack.duration) {
      const progress = relativeTime / localTrack.duration;
      wavesurferRef.current.seekTo(progress);
    }
  }, [currentTime, localTrack.startTime, localTrack.duration, waveformLoaded]);

  // Handle mouse down for dragging
  const handleMouseDown = useCallback(
    (e: React.MouseEvent, type: "move" | "trim-start" | "trim-end") => {
      if (isLocked) return;

      e.preventDefault();
      e.stopPropagation();

      setIsDragging(true);
      setDragType(type);
      setDragStartX(e.clientX);
      setDragStartTime(localTrack.startTime);

      onSelect?.();
    },
    [isLocked, localTrack.startTime, onSelect]
  );

  // Handle mouse move for dragging
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !dragType) return;

      const deltaX = e.clientX - dragStartX;
      const deltaTime = deltaX / pixelsPerSecond;

      switch (dragType) {
        case "move":
          const newStartTime = Math.max(
            0,
            Math.min(duration - localTrack.duration, dragStartTime + deltaTime)
          );
          setLocalTrack((prev) => ({ ...prev, startTime: newStartTime }));
          break;

        case "trim-start":
          const newTrimStart = Math.max(0, deltaTime);
          const newDuration = Math.max(0.1, localTrack.duration - newTrimStart);
          setLocalTrack((prev) => ({
            ...prev,
            startTime: dragStartTime + newTrimStart,
            duration: newDuration,
          }));
          break;

        case "trim-end":
          const newDuration2 = Math.max(0.1, localTrack.duration + deltaTime);
          setLocalTrack((prev) => ({ ...prev, duration: newDuration2 }));
          break;
      }
    },
    [
      isDragging,
      dragType,
      dragStartX,
      dragStartTime,
      pixelsPerSecond,
      duration,
      localTrack.duration,
    ]
  );

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      setDragType(null);
      onTrackUpdate?.(localTrack);
    }
  }, [isDragging, localTrack, onTrackUpdate]);

  // Add event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Handle track click
  const handleTrackClick = (e: React.MouseEvent) => {
    if (isLocked) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickTime = localTrack.startTime + clickX / pixelsPerSecond;

    onTimeChange?.(clickTime);
    onSelect?.();
  };

  // Handle volume change
  const handleVolumeChange = (volume: number) => {
    const updatedTrack = { ...localTrack, volume };
    setLocalTrack(updatedTrack);
    onTrackUpdate?.(updatedTrack);
  };

  // Handle fade change
  const handleFadeChange = (fadeType: "fadeIn" | "fadeOut", value: number) => {
    const updatedTrack = { ...localTrack, [fadeType]: value };
    setLocalTrack(updatedTrack);
    onTrackUpdate?.(updatedTrack);
  };

  const getTrackTypeIcon = () => {
    switch (localTrack.type) {
      case "background":
        return <Music className="h-3 w-3" />;
      case "voiceover":
        return <Mic className="h-3 w-3" />;
      case "sfx":
        return <Zap className="h-3 w-3" />;
      default:
        return <Music className="h-3 w-3" />;
    }
  };

  const getTrackTypeColor = () => {
    switch (localTrack.type) {
      case "background":
        return "bg-blue-500";
      case "voiceover":
        return "bg-green-500";
      case "sfx":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div
      className={cn(
        "relative bg-background border rounded-sm transition-all duration-200",
        isSelected && "ring-2 ring-primary shadow-lg",
        !isVisible && "opacity-50",
        isDragging && "cursor-grabbing",
        className
      )}
      style={{
        left: `${trackLeft}px`,
        width: `${trackWidth}px`,
        minWidth: "60px",
      }}
    >
      {/* Track Header */}
      <div className="absolute top-0 left-0 right-0 h-6 bg-muted/80 border-b flex items-center justify-between px-2 z-10">
        <div className="flex items-center space-x-1">
          <div className={cn("w-2 h-2 rounded-full", getTrackTypeColor())} />
          <span className="text-xs font-medium truncate">{localTrack.id}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Badge variant="outline" className="text-xs px-1 py-0">
            {localTrack.type}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsLocked(!isLocked)}
            className="h-4 w-4 p-0"
          >
            {isLocked ? (
              <Lock className="h-3 w-3" />
            ) : (
              <Unlock className="h-3 w-3" />
            )}
          </Button>
        </div>
      </div>

      {/* Waveform Container */}
      <div
        className="absolute top-6 left-0 right-0 bottom-0 cursor-pointer"
        onClick={handleTrackClick}
        onMouseDown={(e) => handleMouseDown(e, "move")}
      >
        <div
          ref={waveformRef}
          className="w-full h-full"
          style={{ height: "40px" }}
        />

        {/* Fade In Overlay */}
        {fadeInWidth > 0 && (
          <div
            className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-black/30 to-transparent pointer-events-none"
            style={{ width: `${fadeInWidth}px` }}
          />
        )}

        {/* Fade Out Overlay */}
        {fadeOutWidth > 0 && (
          <div
            className="absolute top-0 right-0 bottom-0 bg-gradient-to-l from-black/30 to-transparent pointer-events-none"
            style={{ width: `${fadeOutWidth}px` }}
          />
        )}
      </div>

      {/* Trim Handles */}
      {!isLocked && (
        <>
          <div
            className="absolute top-0 left-0 bottom-0 w-2 cursor-ew-resize bg-primary/20 hover:bg-primary/40 transition-colors"
            onMouseDown={(e) => handleMouseDown(e, "trim-start")}
          />
          <div
            className="absolute top-0 right-0 bottom-0 w-2 cursor-ew-resize bg-primary/20 hover:bg-primary/40 transition-colors"
            onMouseDown={(e) => handleMouseDown(e, "trim-end")}
          />
        </>
      )}

      {/* Track Controls (shown when selected) */}
      {isSelected && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-sm p-2 shadow-lg z-20">
          <div className="space-y-2">
            {/* Volume Control */}
            <div className="flex items-center space-x-2">
              <Volume2 className="h-3 w-3" />
              <Slider
                value={[localTrack.volume]}
                onValueChange={(value) => handleVolumeChange(value[0])}
                min={0}
                max={1}
                step={0.1}
                className="flex-1"
              />
              <span className="text-xs w-8">
                {Math.round(localTrack.volume * 100)}%
              </span>
            </div>

            {/* Fade Controls */}
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center space-x-1">
                <span className="text-xs">Fade In:</span>
                <input
                  type="number"
                  value={localTrack.fadeIn || 0}
                  onChange={(e) =>
                    handleFadeChange("fadeIn", parseFloat(e.target.value) || 0)
                  }
                  min={0}
                  max={5}
                  step={0.1}
                  className="w-12 px-1 py-0 text-xs border rounded"
                />
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-xs">Fade Out:</span>
                <input
                  type="number"
                  value={localTrack.fadeOut || 0}
                  onChange={(e) =>
                    handleFadeChange("fadeOut", parseFloat(e.target.value) || 0)
                  }
                  min={0}
                  max={5}
                  step={0.1}
                  className="w-12 px-1 py-0 text-xs border rounded"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSplit?.(currentTime)}
                  className="h-6 px-2"
                >
                  <Scissors className="h-3 w-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onCopy}
                  className="h-6 px-2"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onDelete}
                className="h-6 px-2 text-red-500 hover:text-red-600"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
