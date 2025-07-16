"use client";

import React, { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Scissors,
  Loader2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AudioTrack } from "@/lib/stores/video-editor-store";

interface AudioWaveformProps {
  audioTrack: AudioTrack;
  isPlaying?: boolean;
  currentTime?: number;
  onTimeUpdate?: (time: number) => void;
  onVolumeChange?: (volume: number) => void;
  onSplit?: (time: number) => void;
  onTrim?: (start: number, end: number) => void;
  className?: string;
  height?: number;
  showControls?: boolean;
  interactive?: boolean;
}

export function AudioWaveform({
  audioTrack,
  isPlaying = false,
  currentTime = 0,
  onTimeUpdate,
  onVolumeChange,
  onSplit,
  onTrim,
  className,
  height = 80,
  showControls = true,
  interactive = true,
}: AudioWaveformProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [localPlaying, setLocalPlaying] = useState(false);
  const [volume, setVolume] = useState(audioTrack.volume);
  const [muted, setMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [selection, setSelection] = useState<{
    start: number;
    end: number;
  } | null>(null);

  // Initialize WaveSurfer
  useEffect(() => {
    if (!containerRef.current) return;

    const wavesurfer = WaveSurfer.create({
      container: containerRef.current,
      waveColor: "#3b82f6",
      progressColor: "#1d4ed8",
      cursorColor: "#ffffff",
      barWidth: 2,
      barRadius: 1,
      height,
      normalize: true,
      backend: "WebAudio",
      interact: interactive,
      cursorWidth: 2,
      barGap: 1,
      plugins: [],
    });

    wavesurferRef.current = wavesurfer;

    // Load audio
    wavesurfer.load(audioTrack.url);

    // Event listeners
    wavesurfer.on("ready", () => {
      setLoading(false);
      setDuration(wavesurfer.getDuration());
      wavesurfer.setVolume(volume);
    });

    wavesurfer.on("error", (error) => {
      setError(error.message);
      setLoading(false);
    });

    wavesurfer.on("audioprocess", (time) => {
      onTimeUpdate?.(time);
    });

    wavesurfer.on("interaction", () => {
      const time = wavesurfer.getCurrentTime();
      onTimeUpdate?.(time);
    });

    wavesurfer.on("play", () => {
      setLocalPlaying(true);
    });

    wavesurfer.on("pause", () => {
      setLocalPlaying(false);
    });

    wavesurfer.on("finish", () => {
      setLocalPlaying(false);
    });

    // Add region selection for trimming
    if (interactive) {
      // Note: Region functionality would require additional plugins
      // For now, we'll handle selection through click events
    }

    return () => {
      wavesurfer.destroy();
    };
  }, [audioTrack.url, height, interactive, volume, onTimeUpdate]);

  // Sync playing state
  useEffect(() => {
    if (!wavesurferRef.current) return;

    if (isPlaying && !localPlaying) {
      wavesurferRef.current.play();
    } else if (!isPlaying && localPlaying) {
      wavesurferRef.current.pause();
    }
  }, [isPlaying, localPlaying]);

  // Sync current time
  useEffect(() => {
    if (
      !wavesurferRef.current ||
      Math.abs(wavesurferRef.current.getCurrentTime() - currentTime) < 0.1
    )
      return;

    wavesurferRef.current.seekTo(currentTime / duration);
  }, [currentTime, duration]);

  // Handle volume changes
  useEffect(() => {
    if (!wavesurferRef.current) return;

    wavesurferRef.current.setVolume(muted ? 0 : volume);
  }, [volume, muted]);

  const handlePlayPause = () => {
    if (!wavesurferRef.current) return;

    if (localPlaying) {
      wavesurferRef.current.pause();
    } else {
      wavesurferRef.current.play();
    }
  };

  const handleVolumeChange = (newVolume: number[]) => {
    const vol = newVolume[0];
    setVolume(vol);
    onVolumeChange?.(vol);
  };

  const handleMute = () => {
    setMuted(!muted);
  };

  const handleSplit = () => {
    if (!wavesurferRef.current) return;

    const currentTime = wavesurferRef.current.getCurrentTime();
    onSplit?.(currentTime);
  };

  const handleTrim = () => {
    if (!selection) return;

    onTrim?.(selection.start, selection.end);
  };

  const handleZoomIn = () => {
    if (!wavesurferRef.current) return;

    const newZoom = Math.min(zoom * 1.5, 10);
    setZoom(newZoom);
    wavesurferRef.current.zoom(newZoom);
  };

  const handleZoomOut = () => {
    if (!wavesurferRef.current) return;

    const newZoom = Math.max(zoom / 1.5, 0.5);
    setZoom(newZoom);
    wavesurferRef.current.zoom(newZoom);
  };

  const handleReset = () => {
    if (!wavesurferRef.current) return;

    wavesurferRef.current.seekTo(0);
    wavesurferRef.current.pause();
    setSelection(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getTrackTypeColor = (type: AudioTrack["type"]) => {
    switch (type) {
      case "background":
        return "bg-blue-100 text-blue-800";
      case "voiceover":
        return "bg-green-100 text-green-800";
      case "sfx":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (error) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-center h-20 text-red-500">
            <p>Error loading audio: {error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">
            Audio Track: {audioTrack.id}
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge
              variant="outline"
              className={getTrackTypeColor(audioTrack.type)}
            >
              {audioTrack.type}
            </Badge>
            {duration > 0 && (
              <Badge variant="outline" className="text-xs">
                {formatTime(duration)}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Waveform Container */}
        <div className="relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}
          <div
            ref={containerRef}
            className="w-full rounded border bg-background"
            style={{ height: `${height}px` }}
          />
          {selection && (
            <div className="absolute top-2 right-2 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
              Selection: {formatTime(selection.start)} -{" "}
              {formatTime(selection.end)}
            </div>
          )}
        </div>

        {/* Audio Controls */}
        {showControls && (
          <div className="space-y-3">
            {/* Playback Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePlayPause}
                  disabled={loading}
                >
                  {localPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  disabled={loading}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleZoomOut}
                  disabled={loading || zoom <= 0.5}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleZoomIn}
                  disabled={loading || zoom >= 10}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Volume Control */}
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMute}
                disabled={loading}
              >
                {muted ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
              <Slider
                value={[volume]}
                onValueChange={handleVolumeChange}
                min={0}
                max={1}
                step={0.1}
                className="flex-1"
                disabled={loading}
              />
              <span className="text-sm text-muted-foreground w-12">
                {Math.round(volume * 100)}%
              </span>
            </div>

            {/* Edit Controls */}
            {interactive && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSplit}
                  disabled={loading}
                >
                  <Scissors className="h-4 w-4 mr-2" />
                  Split
                </Button>

                {selection && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleTrim}
                    disabled={loading}
                  >
                    Trim Selection
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
