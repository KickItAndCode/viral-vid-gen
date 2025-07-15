"use client";

import { useState, useEffect } from "react";
import {
  Play,
  Pause,
  RotateCw,
  AlertCircle,
  Wifi,
  WifiOff,
  Volume2,
  VolumeX,
  Settings,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { VideoPlayerState, VideoPlayerActions } from "./types";

export interface PlayerOverlayProps {
  /** Current player state */
  state: VideoPlayerState;
  /** Player actions */
  actions: VideoPlayerActions;
  /** Whether overlay is visible */
  visible?: boolean;
  /** Custom CSS class */
  className?: string;
  /** Show center play button */
  showCenterPlayButton?: boolean;
  /** Show buffering indicator */
  showBuffering?: boolean;
  /** Show volume indicator */
  showVolumeIndicator?: boolean;
  /** Show network status */
  showNetworkStatus?: boolean;
}

export const PlayerOverlay = ({
  state,
  actions,
  visible = true,
  className,
  showCenterPlayButton = true,
  showBuffering = true,
  showVolumeIndicator = true,
  showNetworkStatus = true,
}: PlayerOverlayProps) => {
  const [volumeIndicatorVisible, setVolumeIndicatorVisible] = useState(false);
  const [networkStatus, setNetworkStatus] = useState<
    "online" | "offline" | "slow"
  >("online");
  const [showPlayAnimation, setShowPlayAnimation] = useState(false);

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => setNetworkStatus("online");
    const handleOffline = () => setNetworkStatus("offline");

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Show volume indicator temporarily when volume changes
  useEffect(() => {
    if (state.volume !== undefined) {
      setVolumeIndicatorVisible(true);
      const timer = setTimeout(() => setVolumeIndicatorVisible(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [state.volume, state.isMuted]);

  // Show play animation when play state changes
  useEffect(() => {
    if (state.isPlaying) {
      setShowPlayAnimation(true);
      const timer = setTimeout(() => setShowPlayAnimation(false), 800);
      return () => clearTimeout(timer);
    }
  }, [state.isPlaying]);

  const handleCenterPlayClick = () => {
    actions.togglePlay();
  };

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div
      className={cn(
        "absolute inset-0 pointer-events-none transition-opacity duration-300",
        visible ? "opacity-100" : "opacity-0",
        className
      )}
    >
      {/* Center Play Button */}
      {showCenterPlayButton &&
        !state.isPlaying &&
        !state.isLoading &&
        !state.hasError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCenterPlayClick}
              className="pointer-events-auto h-16 w-16 rounded-full bg-black/50 text-white hover:bg-black/70 hover:scale-110 transition-all duration-200"
            >
              <Play className="h-8 w-8 ml-1" />
            </Button>
          </div>
        )}

      {/* Play Animation */}
      {showPlayAnimation && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-ping h-16 w-16 rounded-full bg-white/20 flex items-center justify-center">
            <Play className="h-8 w-8 text-white ml-1" />
          </div>
        </div>
      )}

      {/* Loading State */}
      {state.isLoading && showBuffering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <div className="flex flex-col items-center space-y-3 text-white">
            <Loader2 className="h-8 w-8 animate-spin" />
            <div className="text-sm font-medium">Loading video...</div>
            <div className="w-32 h-1 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white/60 rounded-full animate-pulse"
                style={{ width: `${state.buffered * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {state.hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="text-center text-white max-w-md px-4">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <div className="text-xl font-semibold mb-2">Video Error</div>
            <div className="text-sm text-white/70 mb-6">
              {state.error?.message ||
                "Failed to load video. Please check your connection and try again."}
            </div>
            <div className="flex justify-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetry}
                className="pointer-events-auto bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <RotateCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => console.log("Settings clicked")}
                className="pointer-events-auto bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Volume Indicator */}
      {showVolumeIndicator && volumeIndicatorVisible && (
        <div className="absolute top-6 right-6 flex items-center space-x-2 bg-black/70 rounded-lg px-3 py-2 text-white">
          {state.isMuted ? (
            <VolumeX className="h-4 w-4" />
          ) : (
            <Volume2 className="h-4 w-4" />
          )}
          <div className="text-sm font-medium">
            {state.isMuted ? "Muted" : `${Math.round(state.volume * 100)}%`}
          </div>
        </div>
      )}

      {/* Network Status Indicator */}
      {showNetworkStatus && networkStatus !== "online" && (
        <div className="absolute top-6 left-6 flex items-center space-x-2 bg-black/70 rounded-lg px-3 py-2 text-white">
          {networkStatus === "offline" ? (
            <WifiOff className="h-4 w-4 text-red-400" />
          ) : (
            <Wifi className="h-4 w-4 text-yellow-400" />
          )}
          <div className="text-sm font-medium">
            {networkStatus === "offline" ? "No Connection" : "Slow Connection"}
          </div>
        </div>
      )}

      {/* Buffering Indicator */}
      {state.isLoading && showBuffering && state.buffered > 0 && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-black/70 rounded-lg px-3 py-2 text-white">
          <div className="flex items-center space-x-2">
            <div
              className="w-2 h-2 bg-white rounded-full animate-bounce"
              style={{ animationDelay: "0ms" }}
            />
            <div
              className="w-2 h-2 bg-white rounded-full animate-bounce"
              style={{ animationDelay: "150ms" }}
            />
            <div
              className="w-2 h-2 bg-white rounded-full animate-bounce"
              style={{ animationDelay: "300ms" }}
            />
            <span className="text-sm font-medium ml-2">Buffering</span>
          </div>
        </div>
      )}

      {/* Playback Rate Indicator */}
      {state.playbackRate !== 1 && (
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-black/70 rounded-lg px-3 py-2 text-white">
          <div className="text-sm font-medium">{state.playbackRate}x Speed</div>
        </div>
      )}

      {/* Keyboard Shortcuts Hint */}
      {!state.isPlaying && !state.isLoading && !state.hasError && (
        <div className="absolute bottom-6 left-6 text-white/50 text-xs">
          <div>Press Space to play/pause</div>
          <div>← → to seek, ↑ ↓ for volume</div>
          <div>F for fullscreen, M to mute</div>
        </div>
      )}
    </div>
  );
};

export default PlayerOverlay;
