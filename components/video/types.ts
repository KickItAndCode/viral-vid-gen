export interface VideoPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playbackRate: number;
  isFullscreen: boolean;
  isMuted: boolean;
  isLoading: boolean;
  hasError: boolean;
  error?: Error;
  buffered: number;
  played: number;
}

export interface VideoPlayerSettings {
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  volume?: number;
  playbackRate?: number;
  quality?: "auto" | "144p" | "240p" | "360p" | "480p" | "720p" | "1080p";
  subtitles?: boolean;
  poster?: string;
}

export interface VideoPlayerActions {
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  seek: (seconds: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setPlaybackRate: (rate: number) => void;
  toggleFullscreen: () => void;
  restart: () => void;
  forward: (seconds: number) => void;
  backward: (seconds: number) => void;
}

export interface VideoPlayerCallbacks {
  onReady?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onError?: (error: Error) => void;
  onProgress?: (state: {
    played: number;
    playedSeconds: number;
    loaded: number;
    loadedSeconds: number;
  }) => void;
  onDuration?: (duration: number) => void;
  onSeek?: (seconds: number) => void;
  onVolumeChange?: (volume: number) => void;
  onPlaybackRateChange?: (rate: number) => void;
  onFullscreenChange?: (isFullscreen: boolean) => void;
  onTimeUpdate?: (currentTime: number) => void;
  onBufferStart?: () => void;
  onBufferEnd?: () => void;
}

export interface VideoPlayerRef {
  getCurrentTime: () => number;
  getDuration: () => number;
  getPlayedFraction: () => number;
  getLoadedFraction: () => number;
  seekTo: (seconds: number) => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  setVolume: (volume: number) => void;
  setPlaybackRate: (rate: number) => void;
  getInternalPlayer: () => any;
  getPlayerState: () => VideoPlayerState;
}

export interface VideoMetadata {
  title?: string;
  description?: string;
  duration?: number;
  thumbnail?: string;
  tags?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface VideoFile {
  id: string;
  url: string;
  filename: string;
  size: number;
  type: string;
  duration?: number;
  width?: number;
  height?: number;
  thumbnail?: string;
  metadata?: VideoMetadata;
}

export interface VideoPlayerConfig {
  showControls?: boolean;
  customControls?: boolean;
  theme?: "light" | "dark";
  keyboardShortcuts?: boolean;
  touchControls?: boolean;
  playbackRates?: number[];
  qualityOptions?: string[];
  subtitleOptions?: { label: string; src: string; lang: string }[];
  thumbnailPreview?: boolean;
  pip?: boolean; // Picture-in-Picture
  airplay?: boolean;
  chromecast?: boolean;
}
