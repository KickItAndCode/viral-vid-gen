"use client";

import { useState, useRef, useCallback } from "react";
import ReactPlayer from "react-player";
import { cn } from "@/lib/utils";

export interface VideoPlayerProps {
  /** Video URL to play */
  url: string;
  /** Player width (default: 100%) */
  width?: string | number;
  /** Player height (default: auto) */
  height?: string | number;
  /** Whether to show controls (default: true) */
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
  /** Callback when video is ready */
  onReady?: () => void;
  /** Callback when video starts playing */
  onStart?: () => void;
  /** Callback when video is paused */
  onPause?: () => void;
  /** Callback when video ends */
  onEnded?: () => void;
  /** Callback when video errors */
  onError?: (error: Error) => void;
  /** Callback for progress updates */
  onProgress?: (progress: {
    played: number;
    playedSeconds: number;
    loaded: number;
    loadedSeconds: number;
  }) => void;
  /** Callback for duration change */
  onDuration?: (duration: number) => void;
  /** Callback for seek operations */
  onSeek?: (seconds: number) => void;
}

export interface VideoPlayerRef {
  /** Get current time in seconds */
  getCurrentTime: () => number;
  /** Get total duration in seconds */
  getDuration: () => number;
  /** Get played fraction (0-1) */
  getPlayedFraction: () => number;
  /** Get loaded fraction (0-1) */
  getLoadedFraction: () => number;
  /** Seek to specific time in seconds */
  seekTo: (seconds: number) => void;
  /** Play the video */
  play: () => void;
  /** Pause the video */
  pause: () => void;
  /** Toggle play/pause */
  togglePlay: () => void;
  /** Set volume (0-1) */
  setVolume: (volume: number) => void;
  /** Set playback rate */
  setPlaybackRate: (rate: number) => void;
  /** Get internal player instance */
  getInternalPlayer: () => any;
}

export const VideoPlayer = ({
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
  onReady,
  onStart,
  onPause,
  onEnded,
  onError,
  onProgress,
  onDuration,
  onSeek,
}: VideoPlayerProps) => {
  const playerRef = useRef<ReactPlayer>(null);
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [currentVolume, setCurrentVolume] = useState(volume);
  const [currentRate, setCurrentRate] = useState(playbackRate);
  const [ready, setReady] = useState(false);

  // Create ref object for external access
  const videoPlayerRef: VideoPlayerRef = {
    getCurrentTime: () => playerRef.current?.getCurrentTime() || 0,
    getDuration: () => playerRef.current?.getDuration() || 0,
    getPlayedFraction: () => playerRef.current?.getSeekTime() || 0,
    getLoadedFraction: () => playerRef.current?.getSeekTime() || 0,
    seekTo: (seconds: number) => playerRef.current?.seekTo(seconds),
    play: () => {
      setIsPlaying(true);
    },
    pause: () => {
      setIsPlaying(false);
    },
    togglePlay: () => {
      setIsPlaying(!isPlaying);
    },
    setVolume: (vol: number) => {
      setCurrentVolume(vol);
    },
    setPlaybackRate: (rate: number) => {
      setCurrentRate(rate);
    },
    getInternalPlayer: () => playerRef.current?.getInternalPlayer(),
  };

  const handleReady = useCallback(() => {
    setReady(true);
    onReady?.();
  }, [onReady]);

  const handleStart = useCallback(() => {
    setIsPlaying(true);
    onStart?.();
  }, [onStart]);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
    onPause?.();
  }, [onPause]);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    onEnded?.();
  }, [onEnded]);

  const handleError = useCallback(
    (error: any) => {
      console.error("Video player error:", error);
      onError?.(error);
    },
    [onError]
  );

  const handleProgress = useCallback(
    (state: any) => {
      onProgress?.(state);
    },
    [onProgress]
  );

  const handleDuration = useCallback(
    (duration: number) => {
      onDuration?.(duration);
    },
    [onDuration]
  );

  const handleSeek = useCallback(
    (seconds: number) => {
      onSeek?.(seconds);
    },
    [onSeek]
  );

  return (
    <div
      className={cn("relative overflow-hidden rounded-lg bg-black", className)}
    >
      <ReactPlayer
        ref={playerRef}
        url={url}
        width={width}
        height={height}
        playing={isPlaying}
        controls={controls}
        loop={loop}
        muted={muted}
        volume={currentVolume}
        playbackRate={currentRate}
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
        style={{
          borderRadius: "8px",
        }}
      />

      {/* Loading overlay */}
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="flex items-center space-x-2 text-white">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            <span className="text-sm">Loading video...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
