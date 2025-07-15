"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Play,
  Pause,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { VideoPlayerState, VideoPlayerActions } from "./types";

export interface TouchControlsProps {
  /** Current player state */
  state: VideoPlayerState;
  /** Player actions */
  actions: VideoPlayerActions;
  /** Whether controls are visible */
  visible?: boolean;
  /** Custom CSS class */
  className?: string;
  /** Enable double tap to seek */
  enableDoubleTapSeek?: boolean;
  /** Seek duration in seconds for double tap */
  seekDuration?: number;
  /** Enable pinch to zoom */
  enablePinchZoom?: boolean;
  /** Enable swipe gestures */
  enableSwipeGestures?: boolean;
}

interface TouchGesture {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  startTime: number;
  isActive: boolean;
}

export const TouchControls = ({
  state,
  actions,
  visible = true,
  className,
  enableDoubleTapSeek = true,
  seekDuration = 10,
  enablePinchZoom = false,
  enableSwipeGestures = true,
}: TouchControlsProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastTapRef = useRef<{ time: number; x: number; y: number } | null>(
    null
  );
  const gestureRef = useRef<TouchGesture | null>(null);
  const [showSeekIndicator, setShowSeekIndicator] = useState<{
    show: boolean;
    direction: "forward" | "backward";
    amount: number;
  } | null>(null);
  const [showVolumeIndicator, setShowVolumeIndicator] = useState<{
    show: boolean;
    volume: number;
  } | null>(null);

  // Double tap to seek
  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (!enableDoubleTapSeek || e.touches.length !== 1) return;

      const touch = e.touches[0];
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      const now = Date.now();

      // Check for double tap
      if (lastTapRef.current && now - lastTapRef.current.time < 300) {
        const dx = Math.abs(x - lastTapRef.current.x);
        const dy = Math.abs(y - lastTapRef.current.y);

        if (dx < 50 && dy < 50) {
          e.preventDefault();

          // Determine seek direction based on tap location
          const centerX = rect.width / 2;
          const isForward = x > centerX;

          if (isForward) {
            actions.forward(seekDuration);
          } else {
            actions.backward(seekDuration);
          }

          // Show seek indicator
          setShowSeekIndicator({
            show: true,
            direction: isForward ? "forward" : "backward",
            amount: seekDuration,
          });

          setTimeout(() => setShowSeekIndicator(null), 1000);

          lastTapRef.current = null;
          return;
        }
      }

      lastTapRef.current = { time: now, x, y };
    },
    [enableDoubleTapSeek, seekDuration, actions]
  );

  // Swipe gestures for volume and seeking
  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!enableSwipeGestures || e.touches.length !== 1) return;

      const touch = e.touches[0];
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      if (!gestureRef.current) {
        gestureRef.current = {
          startX: touch.clientX,
          startY: touch.clientY,
          currentX: touch.clientX,
          currentY: touch.clientY,
          startTime: Date.now(),
          isActive: false,
        };
        return;
      }

      const gesture = gestureRef.current;
      gesture.currentX = touch.clientX;
      gesture.currentY = touch.clientY;

      const deltaX = gesture.currentX - gesture.startX;
      const deltaY = gesture.currentY - gesture.startY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (!gesture.isActive && distance > 20) {
        gesture.isActive = true;

        // Determine gesture type based on direction
        const isHorizontal = Math.abs(deltaX) > Math.abs(deltaY);

        if (isHorizontal) {
          // Horizontal swipe - seeking
          e.preventDefault();
          const sensitivity = 0.1;
          const seekAmount = deltaX * sensitivity;
          const newTime = Math.max(
            0,
            Math.min(state.duration, state.currentTime + seekAmount)
          );
          actions.seek(newTime);
        } else {
          // Vertical swipe - volume control
          e.preventDefault();
          const sensitivity = 0.005;
          const volumeChange = -deltaY * sensitivity;
          const newVolume = Math.max(
            0,
            Math.min(1, state.volume + volumeChange)
          );
          actions.setVolume(newVolume);

          // Show volume indicator
          setShowVolumeIndicator({
            show: true,
            volume: newVolume,
          });
        }
      }
    },
    [
      enableSwipeGestures,
      state.duration,
      state.currentTime,
      state.volume,
      actions,
    ]
  );

  const handleTouchEnd = useCallback(() => {
    gestureRef.current = null;

    // Hide volume indicator after delay
    if (showVolumeIndicator) {
      setTimeout(() => setShowVolumeIndicator(null), 1000);
    }
  }, [showVolumeIndicator]);

  // Set up touch event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("touchstart", handleTouchStart, {
      passive: false,
    });
    container.addEventListener("touchmove", handleTouchMove, {
      passive: false,
    });
    container.addEventListener("touchend", handleTouchEnd, { passive: false });

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  // Prevent context menu on long press
  useEffect(() => {
    const handleContextMenu = (e: Event) => {
      e.preventDefault();
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("contextmenu", handleContextMenu);
      return () =>
        container.removeEventListener("contextmenu", handleContextMenu);
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        "absolute inset-0 touch-none select-none",
        visible ? "pointer-events-auto" : "pointer-events-none",
        className
      )}
    >
      {/* Mobile Controls Bar */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent md:hidden">
        <div className="flex items-center justify-between">
          {/* Play/Pause */}
          <Button
            variant="ghost"
            size="icon"
            onClick={actions.togglePlay}
            className="text-white hover:bg-white/20 h-12 w-12"
          >
            {state.isPlaying ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6" />
            )}
          </Button>

          {/* Volume */}
          <Button
            variant="ghost"
            size="icon"
            onClick={actions.toggleMute}
            className="text-white hover:bg-white/20 h-12 w-12"
          >
            {state.isMuted ? (
              <VolumeX className="h-6 w-6" />
            ) : (
              <Volume2 className="h-6 w-6" />
            )}
          </Button>

          {/* Fullscreen */}
          <Button
            variant="ghost"
            size="icon"
            onClick={actions.toggleFullscreen}
            className="text-white hover:bg-white/20 h-12 w-12"
          >
            {state.isFullscreen ? (
              <Minimize className="h-6 w-6" />
            ) : (
              <Maximize className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>

      {/* Seek Indicator */}
      {showSeekIndicator && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-black/70 rounded-lg px-4 py-2 text-white flex items-center space-x-2">
            <RotateCw className="h-5 w-5" />
            <span className="text-sm font-medium">
              {showSeekIndicator.direction === "forward" ? "+" : "-"}
              {showSeekIndicator.amount}s
            </span>
          </div>
        </div>
      )}

      {/* Volume Indicator */}
      {showVolumeIndicator && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="bg-black/70 rounded-lg px-4 py-2 text-white flex items-center space-x-2">
            {showVolumeIndicator.volume === 0 ? (
              <VolumeX className="h-5 w-5" />
            ) : (
              <Volume2 className="h-5 w-5" />
            )}
            <span className="text-sm font-medium">
              {Math.round(showVolumeIndicator.volume * 100)}%
            </span>
          </div>
        </div>
      )}

      {/* Touch Hints */}
      {!state.isPlaying && !state.isLoading && !state.hasError && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-white/50 text-xs text-center md:hidden">
          <div>Double tap left/right to seek</div>
          <div>Swipe up/down for volume</div>
          <div>Swipe left/right to scrub</div>
        </div>
      )}
    </div>
  );
};

export default TouchControls;
