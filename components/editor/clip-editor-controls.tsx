"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Scissors,
  SplitSquareHorizontal,
  Trash2,
  Copy,
  RotateCcw,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  ZoomIn,
  ZoomOut,
  Crop,
  Move,
  MoreHorizontal,
} from "lucide-react";
import { useClips, useTimeline } from "@/lib/stores/video-editor-store";
import type { VideoClip } from "@/lib/stores/video-editor-store";

export interface ClipEditorControlsProps {
  /** Currently selected clip */
  selectedClip: VideoClip | null;
  /** Current playhead time */
  currentTime: number;
  /** Callback when clip is updated */
  onClipUpdate?: (clipId: string, updates: Partial<VideoClip>) => void;
  /** Callback when clip is split */
  onClipSplit?: (clipId: string, splitTime: number) => void;
  /** Callback when clip is deleted */
  onClipDelete?: (clipId: string) => void;
  /** Custom CSS class */
  className?: string;
}

export const ClipEditorControls = ({
  selectedClip,
  currentTime,
  onClipUpdate,
  onClipSplit,
  onClipDelete,
  className,
}: ClipEditorControlsProps) => {
  const { updateClip, removeClip, addClip, trimClip } = useClips();
  const { timeline } = useTimeline();

  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [isTrimmingMode, setIsTrimmingMode] = useState(false);

  // Update trim values when clip changes
  useEffect(() => {
    if (selectedClip) {
      setTrimStart(selectedClip.startTime);
      setTrimEnd(selectedClip.endTime);
    }
  }, [selectedClip]);

  const handleTrimStart = useCallback(() => {
    if (!selectedClip) return;
    setIsTrimmingMode(true);
    setTrimStart(selectedClip.startTime);
    setTrimEnd(selectedClip.endTime);
  }, [selectedClip]);

  const handleTrimConfirm = useCallback(() => {
    if (!selectedClip) return;

    const newDuration = trimEnd - trimStart;
    if (newDuration <= 0) return;

    trimClip(selectedClip.id, trimStart, trimEnd);
    onClipUpdate?.(selectedClip.id, {
      startTime: trimStart,
      endTime: trimEnd,
      duration: newDuration,
    });

    setIsTrimmingMode(false);
  }, [selectedClip, trimStart, trimEnd, trimClip, onClipUpdate]);

  const handleTrimCancel = useCallback(() => {
    setIsTrimmingMode(false);
    if (selectedClip) {
      setTrimStart(selectedClip.startTime);
      setTrimEnd(selectedClip.endTime);
    }
  }, [selectedClip]);

  const handleSplitAtCurrentTime = useCallback(() => {
    if (!selectedClip) return;

    const splitTime = currentTime;
    if (
      splitTime <= selectedClip.startTime ||
      splitTime >= selectedClip.endTime
    ) {
      return;
    }

    // Create two clips from the split
    const firstClip = {
      ...selectedClip,
      endTime: splitTime,
      duration: splitTime - selectedClip.startTime,
    };

    const secondClip = {
      ...selectedClip,
      id: `${selectedClip.id}-split-${Date.now()}`,
      startTime: splitTime,
      duration: selectedClip.endTime - splitTime,
      order: selectedClip.order + 1,
    };

    // Update the original clip
    updateClip(selectedClip.id, firstClip);

    // Add the new clip
    addClip({
      url: secondClip.url,
      startTime: secondClip.startTime,
      endTime: secondClip.endTime,
      duration: secondClip.duration,
      volume: secondClip.volume,
      effects: [...secondClip.effects],
    });

    onClipSplit?.(selectedClip.id, splitTime);
  }, [selectedClip, currentTime, updateClip, addClip, onClipSplit]);

  const handleDuplicateClip = useCallback(() => {
    if (!selectedClip) return;

    addClip({
      url: selectedClip.url,
      startTime: selectedClip.endTime,
      endTime: selectedClip.endTime + selectedClip.duration,
      duration: selectedClip.duration,
      volume: selectedClip.volume,
      effects: [...selectedClip.effects],
    });
  }, [selectedClip, addClip]);

  const handleDeleteClip = useCallback(() => {
    if (!selectedClip) return;

    removeClip(selectedClip.id);
    onClipDelete?.(selectedClip.id);
  }, [selectedClip, removeClip, onClipDelete]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins}:${secs.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;
  };

  if (!selectedClip) {
    return (
      <Card className={cn("p-4", className)}>
        <div className="text-center text-muted-foreground">
          <Scissors className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Select a clip to edit</p>
        </div>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <Card className={cn("p-4 space-y-4", className)}>
        {/* Clip Info */}
        <div className="space-y-2">
          <h3 className="font-semibold text-sm">Clip Controls</h3>
          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div>Start: {formatTime(selectedClip.startTime)}</div>
            <div>End: {formatTime(selectedClip.endTime)}</div>
            <div>Duration: {formatTime(selectedClip.duration)}</div>
            <div>Volume: {Math.round(selectedClip.volume * 100)}%</div>
          </div>
        </div>

        <Separator />

        {/* Basic Controls */}
        <div className="space-y-3">
          <h4 className="font-medium text-xs text-muted-foreground">
            BASIC EDITING
          </h4>

          <div className="grid grid-cols-2 gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSplitAtCurrentTime}
                  disabled={
                    currentTime <= selectedClip.startTime ||
                    currentTime >= selectedClip.endTime
                  }
                >
                  <Scissors className="h-4 w-4 mr-1" />
                  Split
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Split clip at current time (S)</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDuplicateClip}
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Duplicate clip (Ctrl+D)</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={isTrimmingMode ? handleTrimStart : handleTrimStart}
                >
                  <Crop className="h-4 w-4 mr-1" />
                  Trim
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Trim clip start and end</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteClip}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete clip (Delete)</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Trim Controls */}
        {isTrimmingMode && (
          <>
            <Separator />
            <div className="space-y-3">
              <h4 className="font-medium text-xs text-muted-foreground">
                TRIM CONTROLS
              </h4>

              <div className="space-y-2">
                <div>
                  <Label htmlFor="trim-start" className="text-xs">
                    Start Time
                  </Label>
                  <Input
                    id="trim-start"
                    type="number"
                    step="0.1"
                    min={0}
                    max={selectedClip.endTime}
                    value={trimStart}
                    onChange={(e) => setTrimStart(parseFloat(e.target.value))}
                    className="text-xs"
                  />
                </div>

                <div>
                  <Label htmlFor="trim-end" className="text-xs">
                    End Time
                  </Label>
                  <Input
                    id="trim-end"
                    type="number"
                    step="0.1"
                    min={selectedClip.startTime}
                    value={trimEnd}
                    onChange={(e) => setTrimEnd(parseFloat(e.target.value))}
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTrimConfirm}
                  className="flex-1"
                >
                  Apply
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleTrimCancel}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </>
        )}

        <Separator />

        {/* Transform Controls */}
        <div className="space-y-3">
          <h4 className="font-medium text-xs text-muted-foreground">
            TRANSFORM
          </h4>

          <div className="grid grid-cols-2 gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm">
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Rotate Left</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm">
                  <RotateCw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Rotate Right</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm">
                  <FlipHorizontal className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Flip Horizontal</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm">
                  <FlipVertical className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Flip Vertical</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        <Separator />

        {/* Volume Control */}
        <div className="space-y-2">
          <Label htmlFor="clip-volume" className="text-xs">
            Volume
          </Label>
          <input
            id="clip-volume"
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={selectedClip.volume}
            onChange={(e) => {
              const newVolume = parseFloat(e.target.value);
              updateClip(selectedClip.id, { volume: newVolume });
              onClipUpdate?.(selectedClip.id, { volume: newVolume });
            }}
            className="w-full"
          />
          <div className="text-xs text-muted-foreground text-center">
            {Math.round(selectedClip.volume * 100)}%
          </div>
        </div>
      </Card>
    </TooltipProvider>
  );
};

export default ClipEditorControls;
