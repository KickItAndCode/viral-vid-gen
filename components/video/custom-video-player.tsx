"use client";

import {
  useState,
  useRef,
  useCallback,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import ReactPlayer from "react-player";
import { PlayerControls } from "./player-controls";
import { cn } from "@/lib/utils";
import {
  VideoPlayerState,
  VideoPlayerActions,
  VideoPlayerRef,
  VideoPlayerCallbacks,
} from "./types";

export interface CustomVideoPlayerProps {
  /** Video URL to play */
  url: string;
  /** Player width (default: 100%) */
  width?: string | number;
  /** Player height (default: auto) */
  height?: string | number;
  /** Whether to show custom controls (default: true) */
  controls?: boolean;
  /** Whether to autoplay (default: false) */
  autoplay?: boolean;
  /** Whether to loop (default: false) */
  loop?: boolean;
  /** Whether to mute by default (default: false) */
  muted?: boolean;
  /** Volume level (0-1) */
  volume?: number;
  /** Playback rate (default: 1) */
  playbackRate?: number;
  /** Whether to show light mode (thumbnail) */
  light?: boolean;
  /** Custom thumbnail URL */
  poster?: string;
  /** Custom CSS class */
  className?: string;
  /** Whether to show advanced controls */
  showAdvanced?: boolean;
  /** Player callbacks */
  callbacks?: VideoPlayerCallbacks;
}

export const CustomVideoPlayer = forwardRef<
  VideoPlayerRef,
  CustomVideoPlayerProps
>(
  (
    {
      url,
      width = "100%",
      height = "auto",
      controls = true,
      autoplay = false,
      loop = false,
      muted = false,
      volume = 0.8,
      playbackRate = 1,
      light = false,
      poster,
      className,
      showAdvanced = true,
      callbacks,
    },
    ref
  ) => {
    const playerRef = useRef<ReactPlayer>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const controlsTimeoutRef = useRef<NodeJS.Timeout>();

    // Player state
    const [state, setState] = useState<VideoPlayerState>({
      isPlaying: autoplay,
      currentTime: 0,
      duration: 0,
      volume: volume,
      playbackRate: playbackRate,
      isFullscreen: false,
      isMuted: muted,
      isLoading: true,
      hasError: false,
      buffered: 0,
      played: 0,
    });

    // Controls visibility
    const [showControls, setShowControls] = useState(true);

    // Auto-hide controls after 3 seconds of inactivity
    const resetControlsTimeout = useCallback(() => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }

      setShowControls(true);

      if (state.isPlaying) {
        controlsTimeoutRef.current = setTimeout(() => {
          setShowControls(false);
        }, 3000);
      }
    }, [state.isPlaying]);

    // Mouse movement handler
    const handleMouseMove = useCallback(() => {
      resetControlsTimeout();
    }, [resetControlsTimeout]);

    // Mouse leave handler
    const handleMouseLeave = useCallback(() => {
      if (state.isPlaying) {
        setShowControls(false);
      }
    }, [state.isPlaying]);

    // Player actions
    const actions: VideoPlayerActions = {
      play: () => {
        setState((prev) => ({ ...prev, isPlaying: true }));
        callbacks?.onPlay?.();
      },
      pause: () => {
        setState((prev) => ({ ...prev, isPlaying: false }));
        callbacks?.onPause?.();
      },
      togglePlay: () => {
        const newPlayingState = !state.isPlaying;
        setState((prev) => ({ ...prev, isPlaying: newPlayingState }));
        if (newPlayingState) {
          callbacks?.onPlay?.();
        } else {
          callbacks?.onPause?.();
        }
      },
      seek: (seconds: number) => {
        playerRef.current?.seekTo(seconds);
        setState((prev) => ({ ...prev, currentTime: seconds }));
        callbacks?.onSeek?.(seconds);
      },
      setVolume: (vol: number) => {
        setState((prev) => ({ ...prev, volume: vol, isMuted: vol === 0 }));
        callbacks?.onVolumeChange?.(vol);
      },
      toggleMute: () => {
        const newMutedState = !state.isMuted;
        setState((prev) => ({ ...prev, isMuted: newMutedState }));
        callbacks?.onVolumeChange?.(newMutedState ? 0 : state.volume);
      },
      setPlaybackRate: (rate: number) => {
        setState((prev) => ({ ...prev, playbackRate: rate }));
        callbacks?.onPlaybackRateChange?.(rate);
      },
      toggleFullscreen: () => {
        if (!document.fullscreenElement) {
          containerRef.current?.requestFullscreen().then(() => {
            setState((prev) => ({ ...prev, isFullscreen: true }));
            callbacks?.onFullscreenChange?.(true);
          });
        } else {
          document.exitFullscreen().then(() => {
            setState((prev) => ({ ...prev, isFullscreen: false }));
            callbacks?.onFullscreenChange?.(false);
          });
        }
      },
      restart: () => {
        playerRef.current?.seekTo(0);
        setState((prev) => ({ ...prev, currentTime: 0 }));
        callbacks?.onSeek?.(0);
      },
      forward: (seconds: number) => {
        const newTime = Math.min(state.currentTime + seconds, state.duration);
        playerRef.current?.seekTo(newTime);
        setState((prev) => ({ ...prev, currentTime: newTime }));
        callbacks?.onSeek?.(newTime);
      },
      backward: (seconds: number) => {
        const newTime = Math.max(state.currentTime - seconds, 0);
        playerRef.current?.seekTo(newTime);
        setState((prev) => ({ ...prev, currentTime: newTime }));
        callbacks?.onSeek?.(newTime);
      },
    };

    // ReactPlayer event handlers
    const handleReady = useCallback(() => {
      setState((prev) => ({ ...prev, isLoading: false }));
      callbacks?.onReady?.();
    }, [callbacks]);

    const handleStart = useCallback(() => {
      setState((prev) => ({ ...prev, isPlaying: true }));
      callbacks?.onPlay?.();
    }, [callbacks]);

    const handlePause = useCallback(() => {
      setState((prev) => ({ ...prev, isPlaying: false }));
      callbacks?.onPause?.();
    }, [callbacks]);

    const handleEnded = useCallback(() => {
      setState((prev) => ({ ...prev, isPlaying: false }));
      callbacks?.onEnded?.();
    }, [callbacks]);

    const handleError = useCallback(
      (error: any) => {
        setState((prev) => ({
          ...prev,
          hasError: true,
          error,
          isLoading: false,
        }));
        callbacks?.onError?.(error);
      },
      [callbacks]
    );

    const handleProgress = useCallback(
      (progressState: any) => {
        setState((prev) => ({
          ...prev,
          currentTime: progressState.playedSeconds,
          played: progressState.played,
          buffered: progressState.loaded,
        }));
        callbacks?.onProgress?.(progressState);
        callbacks?.onTimeUpdate?.(progressState.playedSeconds);
      },
      [callbacks]
    );

    const handleDuration = useCallback(
      (duration: number) => {
        setState((prev) => ({ ...prev, duration }));
        callbacks?.onDuration?.(duration);
      },
      [callbacks]
    );

    const handleSeek = useCallback(
      (seconds: number) => {
        setState((prev) => ({ ...prev, currentTime: seconds }));
        callbacks?.onSeek?.(seconds);
      },
      [callbacks]
    );

    const handleBufferStart = useCallback(() => {
      setState((prev) => ({ ...prev, isLoading: true }));
      callbacks?.onBufferStart?.();
    }, [callbacks]);

    const handleBufferEnd = useCallback(() => {
      setState((prev) => ({ ...prev, isLoading: false }));
      callbacks?.onBufferEnd?.();
    }, [callbacks]);

    // Expose methods through ref
    useImperativeHandle(
      ref,
      () => ({
        getCurrentTime: () => playerRef.current?.getCurrentTime() || 0,
        getDuration: () => playerRef.current?.getDuration() || 0,
        getPlayedFraction: () => state.played,
        getLoadedFraction: () => state.buffered,
        seekTo: actions.seek,
        play: actions.play,
        pause: actions.pause,
        togglePlay: actions.togglePlay,
        setVolume: actions.setVolume,
        setPlaybackRate: actions.setPlaybackRate,
        getInternalPlayer: () => playerRef.current?.getInternalPlayer(),
        getPlayerState: () => state,
      }),
      [actions, state]
    );

    // Keyboard shortcuts
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement
        ) {
          return;
        }

        switch (e.key) {
          case " ":
            e.preventDefault();
            actions.togglePlay();
            break;
          case "ArrowLeft":
            e.preventDefault();
            actions.backward(5);
            break;
          case "ArrowRight":
            e.preventDefault();
            actions.forward(5);
            break;
          case "ArrowUp":
            e.preventDefault();
            actions.setVolume(Math.min(state.volume + 0.1, 1));
            break;
          case "ArrowDown":
            e.preventDefault();
            actions.setVolume(Math.max(state.volume - 0.1, 0));
            break;
          case "m":
            e.preventDefault();
            actions.toggleMute();
            break;
          case "f":
            e.preventDefault();
            actions.toggleFullscreen();
            break;
          case "r":
            e.preventDefault();
            actions.restart();
            break;
        }
      };

      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }, [actions, state.volume]);

    // Cleanup timeout on unmount
    useEffect(() => {
      return () => {
        if (controlsTimeoutRef.current) {
          clearTimeout(controlsTimeoutRef.current);
        }
      };
    }, []);

    return (
      <div
        ref={containerRef}
        className={cn(
          "relative overflow-hidden rounded-lg bg-black group",
          className
        )}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ width, height }}
      >
        <ReactPlayer
          ref={playerRef}
          url={url}
          width="100%"
          height="100%"
          playing={state.isPlaying}
          controls={false} // We use custom controls
          loop={loop}
          muted={state.isMuted}
          volume={state.volume}
          playbackRate={state.playbackRate}
          light={light}
          poster={poster}
          onReady={handleReady}
          onStart={handleStart}
          onPause={handlePause}
          onEnded={handleEnded}
          onError={handleError}
          onProgress={handleProgress}
          onDuration={handleDuration}
          onSeek={handleSeek}
          onBufferStart={handleBufferStart}
          onBufferEnd={handleBufferEnd}
          config={
            {
              file: {
                attributes: {
                  preload: "metadata",
                  playsInline: true,
                },
              },
            } as any
          }
        />

        {/* Custom Controls */}
        {controls && (
          <PlayerControls
            state={state}
            actions={actions}
            visible={showControls}
            showAdvanced={showAdvanced}
            onSettings={() => console.log("Settings clicked")}
            onDownload={() => console.log("Download clicked")}
            onShare={() => console.log("Share clicked")}
          />
        )}

        {/* Error State */}
        {state.hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="text-center text-white">
              <div className="text-lg font-semibold mb-2">Video Error</div>
              <div className="text-sm text-white/70">
                {state.error?.message || "Failed to load video"}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);

CustomVideoPlayer.displayName = "CustomVideoPlayer";

export default CustomVideoPlayer;
