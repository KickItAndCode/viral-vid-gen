"use client";

import { useState, useEffect } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  Settings,
  Download,
  Share2,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { VideoPlayerState, VideoPlayerActions } from "./types";

export interface PlayerControlsProps {
  /** Current player state */
  state: VideoPlayerState;
  /** Player actions */
  actions: VideoPlayerActions;
  /** Whether to show controls */
  visible?: boolean;
  /** Custom CSS class */
  className?: string;
  /** Whether to show advanced controls */
  showAdvanced?: boolean;
  /** Callback for settings menu */
  onSettings?: () => void;
  /** Callback for download */
  onDownload?: () => void;
  /** Callback for share */
  onShare?: () => void;
}

export const PlayerControls = ({
  state,
  actions,
  visible = true,
  className,
  showAdvanced = true,
  onSettings,
  onDownload,
  onShare,
}: PlayerControlsProps) => {
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [showMore, setShowMore] = useState(false);

  // Format time in MM:SS or HH:MM:SS format
  const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return "0:00";

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  // Handle progress bar changes
  const handleProgressChange = (value: number[]) => {
    const newTime = (value[0] / 100) * state.duration;
    actions.seek(newTime);
  };

  // Handle volume changes
  const handleVolumeChange = (value: number[]) => {
    actions.setVolume(value[0] / 100);
  };

  // Calculate progress percentage
  const progressPercent =
    state.duration > 0 ? (state.currentTime / state.duration) * 100 : 0;
  const bufferedPercent = state.buffered * 100;

  return (
    <div
      className={cn(
        "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 transition-opacity duration-300",
        visible ? "opacity-100" : "opacity-0 pointer-events-none",
        className
      )}
    >
      {/* Progress Bar */}
      <div className="mb-4 space-y-2">
        <div className="relative">
          <Slider
            value={[progressPercent]}
            onValueChange={handleProgressChange}
            max={100}
            step={0.1}
            className="w-full cursor-pointer"
            disabled={state.isLoading}
          />
          {/* Buffer indicator */}
          <div
            className="absolute top-1/2 left-0 h-2 bg-white/30 rounded-full pointer-events-none transform -translate-y-1/2"
            style={{ width: `${bufferedPercent}%` }}
          />
        </div>

        <div className="flex justify-between text-xs text-white/70">
          <span>{formatTime(state.currentTime)}</span>
          <span>{formatTime(state.duration)}</span>
        </div>
      </div>

      {/* Main Controls */}
      <div className="flex items-center justify-between">
        {/* Left Controls */}
        <div className="flex items-center space-x-2">
          {/* Play/Pause Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={actions.togglePlay}
            disabled={state.isLoading}
            className="text-white hover:bg-white/20"
          >
            {state.isPlaying ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6" />
            )}
          </Button>

          {/* Restart Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={actions.restart}
            disabled={state.isLoading}
            className="text-white hover:bg-white/20"
          >
            <RotateCcw className="h-5 w-5" />
          </Button>

          {/* Volume Controls */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={actions.toggleMute}
              onMouseEnter={() => setShowVolumeSlider(true)}
              onMouseLeave={() => setShowVolumeSlider(false)}
              className="text-white hover:bg-white/20"
            >
              {state.isMuted || state.volume === 0 ? (
                <VolumeX className="h-5 w-5" />
              ) : (
                <Volume2 className="h-5 w-5" />
              )}
            </Button>

            {/* Volume Slider */}
            {showVolumeSlider && (
              <div
                className="w-20 transition-all duration-200"
                onMouseEnter={() => setShowVolumeSlider(true)}
                onMouseLeave={() => setShowVolumeSlider(false)}
              >
                <Slider
                  value={[state.volume * 100]}
                  onValueChange={handleVolumeChange}
                  max={100}
                  step={1}
                  className="cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* Time Display */}
          <div className="text-sm text-white/90 font-mono">
            {formatTime(state.currentTime)} / {formatTime(state.duration)}
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center space-x-2">
          {/* Playback Rate */}
          <div className="text-sm text-white/90">
            {state.playbackRate !== 1 && `${state.playbackRate}x`}
          </div>

          {/* Advanced Controls */}
          {showAdvanced && (
            <div className="flex items-center space-x-1">
              {/* Settings */}
              <Button
                variant="ghost"
                size="icon"
                onClick={onSettings}
                className="text-white hover:bg-white/20"
              >
                <Settings className="h-5 w-5" />
              </Button>

              {/* More Options */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowMore(!showMore)}
                  className="text-white hover:bg-white/20"
                >
                  <MoreHorizontal className="h-5 w-5" />
                </Button>

                {/* More Options Menu */}
                {showMore && (
                  <div className="absolute bottom-full right-0 mb-2 bg-black/90 rounded-lg p-2 space-y-1 min-w-[120px]">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onDownload}
                      className="w-full justify-start text-white hover:bg-white/20"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onShare}
                      className="w-full justify-start text-white hover:bg-white/20"
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Fullscreen Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={actions.toggleFullscreen}
            className="text-white hover:bg-white/20"
          >
            {state.isFullscreen ? (
              <Minimize className="h-5 w-5" />
            ) : (
              <Maximize className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Loading Indicator */}
      {state.isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="flex items-center space-x-2 text-white">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            <span className="text-sm">Loading...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerControls;
