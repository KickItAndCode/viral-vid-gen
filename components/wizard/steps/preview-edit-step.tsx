"use client";

import React, { useState, useEffect, useRef } from "react";
import { WizardStepProps } from "../types";
import { WizardStepWrapper } from "../wizard-step-wrapper";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Eye,
  Play,
  Pause,
  RotateCcw,
  Download,
  Share2,
  Edit3,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Scissors,
  Type,
  Palette,
  Music,
  CheckCircle,
  Settings,
  Clock,
  FileText,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PreviewEditStepProps extends WizardStepProps {}

// Mock video data
const MOCK_VIDEO = {
  id: "video-123",
  url: "/api/mock-video.mp4",
  duration: 30,
  title: "AI Generated Video",
  description: "Generated from trending content",
  thumbnail: "/api/mock-thumbnail.jpg",
  subtitles: [
    { start: 0, end: 3, text: "Welcome to the future of content creation!" },
    { start: 3, end: 6, text: "This video was generated using AI technology." },
    { start: 6, end: 9, text: "Based on trending topics and viral patterns." },
    {
      start: 9,
      end: 12,
      text: "With just a few clicks, you can create engaging content.",
    },
  ],
};

// Export formats
const EXPORT_FORMATS = [
  {
    id: "mp4-1080p",
    name: "MP4 - 1080p",
    description: "Best quality for YouTube, Instagram",
    size: "15-25 MB",
  },
  {
    id: "mp4-720p",
    name: "MP4 - 720p",
    description: "Good quality, smaller size",
    size: "8-15 MB",
  },
  {
    id: "webm",
    name: "WebM",
    description: "Web optimized format",
    size: "5-10 MB",
  },
  {
    id: "gif",
    name: "Animated GIF",
    description: "For social media previews",
    size: "2-5 MB",
  },
];

export function PreviewEditStep(props: PreviewEditStepProps) {
  const { wizardData, onDataChange } = props;

  // Video player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(30);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Editing state
  const [videoTitle, setVideoTitle] = useState(
    wizardData.finalVideo?.title || "My AI Generated Video"
  );
  const [videoDescription, setVideoDescription] = useState(
    wizardData.finalVideo?.description || ""
  );
  const [selectedExportFormat, setSelectedExportFormat] = useState("mp4-1080p");
  const [includeSubtitles, setIncludeSubtitles] = useState(true);
  const [includeBranding, setIncludeBranding] = useState(false);
  const [customThumbnail, setCustomThumbnail] = useState<File | null>(null);

  // Advanced editing
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(30);
  const [audioLevel, setAudioLevel] = useState(80);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);

  // Update wizard data when changes occur
  useEffect(() => {
    const finalVideoData = {
      title: videoTitle,
      description: videoDescription,
      exportFormat: selectedExportFormat,
      includeSubtitles,
      includeBranding,
      trimStart,
      trimEnd,
      audioLevel,
      customThumbnail: customThumbnail?.name || null,
    };

    onDataChange("preview-edit", {
      finalVideo: finalVideoData,
      isReadyForExport: !!(videoTitle && selectedExportFormat),
    });
  }, [
    videoTitle,
    videoDescription,
    selectedExportFormat,
    includeSubtitles,
    includeBranding,
    trimStart,
    trimEnd,
    audioLevel,
    customThumbnail,
    onDataChange,
  ]);

  // Simulate video playback
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 0.1;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, duration]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    setCurrentTime(value[0]);
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0] / 100);
    setIsMuted(false);
  };

  const handleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleExport = () => {
    // This would trigger the actual export process
    console.log("Exporting video with settings:", {
      format: selectedExportFormat,
      title: videoTitle,
      description: videoDescription,
      includeSubtitles,
      includeBranding,
      trimStart,
      trimEnd,
      audioLevel,
    });
  };

  const handleShare = () => {
    // This would open sharing options
    console.log("Sharing video...");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const currentSubtitle = MOCK_VIDEO.subtitles.find(
    (sub) => currentTime >= sub.start && currentTime <= sub.end
  );

  return (
    <WizardStepWrapper step={props.step}>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <Eye className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold">Preview & Finalize</h2>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Review your generated video and make final adjustments before
            exporting.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Player */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardContent className="p-0">
                {/* Video Container */}
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                  {/* Mock Video Player */}
                  <div className="w-full h-full bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
                    <div className="text-center text-white space-y-4">
                      <Sparkles className="h-16 w-16 mx-auto opacity-50" />
                      <div>
                        <h3 className="text-lg font-semibold mb-2">
                          AI Generated Video
                        </h3>
                        <p className="text-sm opacity-75">
                          {wizardData.selectedTrend?.title ||
                            "Trending Content Video"}
                        </p>
                      </div>
                      {currentSubtitle && (
                        <div className="absolute bottom-4 left-4 right-4 text-center">
                          <div className="bg-black/70 text-white px-3 py-1 rounded text-sm">
                            {currentSubtitle.text}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Video Controls Overlay */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      variant="secondary"
                      size="lg"
                      className="rounded-full w-16 h-16"
                      onClick={handlePlayPause}
                    >
                      {isPlaying ? (
                        <Pause className="h-6 w-6" />
                      ) : (
                        <Play className="h-6 w-6 ml-1" />
                      )}
                    </Button>
                  </div>

                  {/* Fullscreen Button */}
                  <div className="absolute top-4 right-4">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="opacity-70 hover:opacity-100"
                      onClick={() => setIsFullscreen(!isFullscreen)}
                    >
                      {isFullscreen ? (
                        <Minimize2 className="h-4 w-4" />
                      ) : (
                        <Maximize2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Player Controls */}
                <div className="p-4 space-y-3">
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <Slider
                      value={[currentTime]}
                      onValueChange={handleSeek}
                      max={duration}
                      step={0.1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>

                  {/* Control Buttons */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handlePlayPause}
                      >
                        {isPlaying ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={handleMute}>
                        {isMuted || volume === 0 ? (
                          <VolumeX className="h-4 w-4" />
                        ) : (
                          <Volume2 className="h-4 w-4" />
                        )}
                      </Button>
                      <div className="flex items-center space-x-2 w-24">
                        <Slider
                          value={[isMuted ? 0 : volume * 100]}
                          onValueChange={handleVolumeChange}
                          max={100}
                          step={1}
                          className="w-full"
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setShowAdvancedOptions(!showAdvancedOptions)
                        }
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Advanced Editing Options */}
            {showAdvancedOptions && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Scissors className="h-5 w-5 mr-2" />
                    Basic Editing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Trim Start: {formatTime(trimStart)}</Label>
                      <Slider
                        value={[trimStart]}
                        onValueChange={(value) => setTrimStart(value[0])}
                        max={duration - 1}
                        step={0.1}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Trim End: {formatTime(trimEnd)}</Label>
                      <Slider
                        value={[trimEnd]}
                        onValueChange={(value) => setTrimEnd(value[0])}
                        min={trimStart + 1}
                        max={duration}
                        step={0.1}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Audio Level: {audioLevel}%</Label>
                    <Slider
                      value={[audioLevel]}
                      onValueChange={(value) => setAudioLevel(value[0])}
                      max={150}
                      step={5}
                      className="w-full"
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Settings Panel */}
          <div className="space-y-4">
            {/* Video Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Video Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="video-title">Title</Label>
                  <Input
                    id="video-title"
                    value={videoTitle}
                    onChange={(e) => setVideoTitle(e.target.value)}
                    placeholder="Enter video title..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="video-description">Description</Label>
                  <Textarea
                    id="video-description"
                    value={videoDescription}
                    onChange={(e) => setVideoDescription(e.target.value)}
                    placeholder="Add a description..."
                    rows={3}
                    className="resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div>
                    <span className="font-medium">Duration:</span>
                    <p>{formatTime(trimEnd - trimStart)}</p>
                  </div>
                  <div>
                    <span className="font-medium">Format:</span>
                    <p>
                      {
                        EXPORT_FORMATS.find(
                          (f) => f.id === selectedExportFormat
                        )?.name
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Export Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Download className="h-5 w-5 mr-2" />
                  Export Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {EXPORT_FORMATS.map((format) => (
                    <div
                      key={format.id}
                      className={cn(
                        "p-3 border rounded-lg cursor-pointer transition-colors",
                        selectedExportFormat === format.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                      onClick={() => setSelectedExportFormat(format.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-sm">{format.name}</h4>
                          <p className="text-xs text-muted-foreground">
                            {format.description}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">
                            {format.size}
                          </div>
                          {selectedExportFormat === format.id && (
                            <CheckCircle className="h-4 w-4 text-primary mt-1" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 pt-3 border-t">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Include Subtitles</Label>
                      <p className="text-xs text-muted-foreground">
                        Add captions to video
                      </p>
                    </div>
                    <Switch
                      checked={includeSubtitles}
                      onCheckedChange={setIncludeSubtitles}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Include Branding</Label>
                      <p className="text-xs text-muted-foreground">
                        Add ViralAI watermark
                      </p>
                    </div>
                    <Switch
                      checked={includeBranding}
                      onCheckedChange={setIncludeBranding}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button onClick={handleExport} className="w-full" size="lg">
                <Download className="h-4 w-4 mr-2" />
                Export Video
              </Button>

              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline">
                  <Edit3 className="h-4 w-4 mr-2" />
                  Advanced
                </Button>
              </div>
            </div>

            {/* Generation Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Generation Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Trend:</span>
                  <span>
                    {wizardData.selectedTrend?.title || "Trending Topic"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Style:</span>
                  <span>{wizardData.videoStyle?.style || "Educational"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Provider:</span>
                  <span>{wizardData.aiConfiguration?.provider || "Veo 3"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Generated:</span>
                  <span>{new Date().toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Help Text */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            💡 <strong>Tip:</strong> You can make basic edits here or export now
            and use professional editing software for advanced modifications.
          </p>
        </div>
      </div>
    </WizardStepWrapper>
  );
}
