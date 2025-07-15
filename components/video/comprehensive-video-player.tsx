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
import { PlayerOverlay } from "./player-overlay";
import { TouchControls } from "./touch-controls";
import { cn } from "@/lib/utils";
import {
  VideoPlayerState,
  VideoPlayerActions,
  VideoPlayerRef,
  VideoPlayerCallbacks,
} from "./types";

export interface ComprehensiveVideoPlayerProps {
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
  /** Enable touch controls for mobile */
  enableTouchControls?: boolean;
  /** Enable keyboard shortcuts */
  enableKeyboardShortcuts?: boolean;
  /** Player callbacks */
  callbacks?: VideoPlayerCallbacks;
  /** Settings configuration */
  settings?: {
    enableDoubleTapSeek?: boolean;
    seekDuration?: number;
    enablePinchZoom?: boolean;
    enableSwipeGestures?: boolean;
    showBuffering?: boolean;
    showVolumeIndicator?: boolean;
    showNetworkStatus?: boolean;
  };
}

export const ComprehensiveVideoPlayer = forwardRef<
  VideoPlayerRef,
  ComprehensiveVideoPlayerProps
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
      enableTouchControls = true,
      enableKeyboardShortcuts = true,
      callbacks,
      settings = {},
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
    const [showOverlay, setShowOverlay] = useState(true);

    // Auto-hide controls after 3 seconds of inactivity
    const resetControlsTimeout = useCallback(() => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }

      setShowControls(true);
      setShowOverlay(true);

      if (state.isPlaying) {
        controlsTimeoutRef.current = setTimeout(() => {
          setShowControls(false);
          setShowOverlay(false);
        }, 3000);
      }
    }, [state.isPlaying]);

    // Mouse and touch interaction handlers
    const handleInteraction = useCallback(() => {
      resetControlsTimeout();
    }, [resetControlsTimeout]);

    const handleMouseLeave = useCallback(() => {
      if (state.isPlaying) {
        setShowControls(false);
        setShowOverlay(false);
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
        const clampedSeconds = Math.max(0, Math.min(seconds, state.duration));
        playerRef.current?.seekTo(clampedSeconds);
        setState((prev) => ({ ...prev, currentTime: clampedSeconds }));
        callbacks?.onSeek?.(clampedSeconds);
      },
      setVolume: (vol: number) => {
        const clampedVolume = Math.max(0, Math.min(1, vol));
        setState((prev) => ({
          ...prev,
          volume: clampedVolume,
          isMuted: clampedVolume === 0,
        }));
        callbacks?.onVolumeChange?.(clampedVolume);
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
          containerRef.current
            ?.requestFullscreen()
            .then(() => {
              setState((prev) => ({ ...prev, isFullscreen: true }));
              callbacks?.onFullscreenChange?.(true);
            })
            .catch((err) => {
              console.warn("Could not enter fullscreen:", err);
            });
        } else {
          document
            .exitFullscreen()
            .then(() => {
              setState((prev) => ({ ...prev, isFullscreen: false }));
              callbacks?.onFullscreenChange?.(false);
            })
            .catch((err) => {
              console.warn("Could not exit fullscreen:", err);
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
        actions.seek(newTime);
      },
      backward: (seconds: number) => {
        const newTime = Math.max(state.currentTime - seconds, 0);
        actions.seek(newTime);
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
      if (!enableKeyboardShortcuts) return;

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
          case "j":
            e.preventDefault();
            actions.backward(10);
            break;
          case "l":
            e.preventDefault();
            actions.forward(10);
            break;
          case "k":
            e.preventDefault();
            actions.togglePlay();
            break;
        }
      };

      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }, [enableKeyboardShortcuts, actions, state.volume]);

    // Cleanup timeout on unmount
    useEffect(() => {
      return () => {
        if (controlsTimeoutRef.current) {
          clearTimeout(controlsTimeoutRef.current);
        }
      };
    }, []);

    // Handle fullscreen changes
    useEffect(() => {
      const handleFullscreenChange = () => {
        setState((prev) => ({
          ...prev,
          isFullscreen: !!document.fullscreenElement,
        }));
      };

      document.addEventListener("fullscreenchange", handleFullscreenChange);
      return () =>
        document.removeEventListener(
          "fullscreenchange",
          handleFullscreenChange
        );
    }, []);

    return (
      <div
        ref={containerRef}
        className={cn(
          "relative overflow-hidden rounded-lg bg-black group focus-within:ring-2 focus-within:ring-blue-500",
          state.isFullscreen && "rounded-none",
          className
        )}
        onMouseMove={handleInteraction}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleInteraction}
        style={{ width, height }}
        tabIndex={0}
      >
        {/* React Player */}
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

        {/* Player Overlay */}
        <PlayerOverlay
          state={state}
          actions={actions}
          visible={showOverlay}
          showBuffering={settings.showBuffering}
          showVolumeIndicator={settings.showVolumeIndicator}
          showNetworkStatus={settings.showNetworkStatus}
        />

        {/* Touch Controls */}
        {enableTouchControls && (
          <TouchControls
            state={state}
            actions={actions}
            visible={showControls}
            enableDoubleTapSeek={settings.enableDoubleTapSeek}
            seekDuration={settings.seekDuration}
            enablePinchZoom={settings.enablePinchZoom}
            enableSwipeGestures={settings.enableSwipeGestures}
          />
        )}

        {/* Desktop Controls */}
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
      </div>
    );
  }
);

ComprehensiveVideoPlayer.displayName = "ComprehensiveVideoPlayer";

export default ComprehensiveVideoPlayer;
