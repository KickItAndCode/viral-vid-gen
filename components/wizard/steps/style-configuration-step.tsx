"use client";

import React, { useState, useEffect } from "react";
import { WizardStepProps } from "../types";
import { WizardStepWrapper } from "../wizard-step-wrapper";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Palette,
  Play,
  Monitor,
  Smartphone,
  Instagram,
  Twitter,
  Youtube,
  Sparkles,
  Clock,
  CheckCircle,
  Camera,
  Mic,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StyleConfigurationStepProps extends WizardStepProps {}

// Video style presets
const VIDEO_STYLES = [
  {
    id: "educational",
    name: "Educational",
    description: "Clean, informative content with clear explanations",
    icon: <Monitor className="h-5 w-5" />,
    color: "bg-blue-100 text-blue-800 border-blue-200",
    features: ["Clear narration", "Simple visuals", "Step-by-step format"],
    platforms: ["YouTube", "TikTok", "Instagram"],
  },
  {
    id: "entertaining",
    name: "Entertaining",
    description: "Fun, engaging content with dynamic visuals",
    icon: <Sparkles className="h-5 w-5" />,
    color: "bg-purple-100 text-purple-800 border-purple-200",
    features: ["Quick cuts", "Music overlay", "Visual effects"],
    platforms: ["TikTok", "Instagram", "YouTube Shorts"],
  },
  {
    id: "promotional",
    name: "Promotional",
    description: "Product showcases and brand-focused content",
    icon: <Zap className="h-5 w-5" />,
    color: "bg-orange-100 text-orange-800 border-orange-200",
    features: ["Product focus", "Call-to-action", "Brand elements"],
    platforms: ["Instagram", "YouTube", "Twitter"],
  },
  {
    id: "storytelling",
    name: "Storytelling",
    description: "Narrative-driven content with emotional engagement",
    icon: <Camera className="h-5 w-5" />,
    color: "bg-green-100 text-green-800 border-green-200",
    features: ["Narrative arc", "Emotional hooks", "Character focus"],
    platforms: ["YouTube", "TikTok", "Instagram"],
  },
  {
    id: "news",
    name: "News/Update",
    description: "Timely content covering current events or trends",
    icon: <Mic className="h-5 w-5" />,
    color: "bg-red-100 text-red-800 border-red-200",
    features: ["Breaking news style", "Quick delivery", "Fact-focused"],
    platforms: ["Twitter", "YouTube", "TikTok"],
  },
];

// Platform presets
const PLATFORMS = [
  {
    id: "tiktok",
    name: "TikTok",
    icon: <Smartphone className="h-4 w-4" />,
    aspectRatio: "9:16",
    duration: [15, 60],
    description: "Vertical videos for mobile consumption",
  },
  {
    id: "instagram",
    name: "Instagram Reels",
    icon: <Instagram className="h-4 w-4" />,
    aspectRatio: "9:16",
    duration: [15, 90],
    description: "Square or vertical for Instagram feeds and stories",
  },
  {
    id: "youtube",
    name: "YouTube Shorts",
    icon: <Youtube className="h-4 w-4" />,
    aspectRatio: "9:16",
    duration: [15, 60],
    description: "Vertical format for YouTube's short-form content",
  },
  {
    id: "twitter",
    name: "Twitter/X",
    icon: <Twitter className="h-4 w-4" />,
    aspectRatio: "16:9",
    duration: [15, 140],
    description: "Horizontal or square videos for social sharing",
  },
];

// Duration presets
const DURATION_PRESETS = [
  { value: 15, label: "15s", description: "Quick hook" },
  { value: 30, label: "30s", description: "Standard viral" },
  { value: 60, label: "60s", description: "Detailed content" },
  { value: 90, label: "90s", description: "Extended format" },
];

export function StyleConfigurationStep(props: StyleConfigurationStepProps) {
  const { wizardData, onDataChange } = props;

  // State for style configuration
  const [selectedStyle, setSelectedStyle] = useState<string>(
    wizardData.videoStyle?.style || ""
  );
  const [selectedTone, setSelectedTone] = useState<string>(
    wizardData.videoStyle?.tone || "casual"
  );
  const [selectedVisualStyle, setSelectedVisualStyle] = useState<string>(
    wizardData.videoStyle?.visualStyle || "realistic"
  );
  const [selectedPlatform, setSelectedPlatform] = useState<string>(
    wizardData.videoStyle?.targetPlatform || ""
  );
  const [duration, setDuration] = useState<number>(
    wizardData.videoStyle?.duration || 30
  );
  const [aspectRatio, setAspectRatio] = useState<string>(
    wizardData.videoStyle?.aspectRatio || "9:16"
  );
  const [resolution, setResolution] = useState<string>(
    wizardData.videoStyle?.resolution || "1080p"
  );
  const [fps, setFps] = useState<number>(wizardData.videoStyle?.fps || 30);

  // Update step validation when data changes
  useEffect(() => {
    const isValid = !!(selectedStyle && selectedPlatform && duration > 0);

    if (isValid) {
      const styleData = {
        style: selectedStyle as
          | "educational"
          | "entertaining"
          | "dramatic"
          | "minimalist"
          | "cinematic",
        tone: selectedTone as
          | "professional"
          | "casual"
          | "humorous"
          | "serious"
          | "inspiring",
        visualStyle: selectedVisualStyle as
          | "realistic"
          | "animated"
          | "abstract"
          | "documentary",
        duration,
        targetPlatform: selectedPlatform as
          | "youtube"
          | "tiktok"
          | "instagram"
          | "twitter",
        aspectRatio: aspectRatio as "16:9" | "9:16" | "1:1",
        resolution: resolution as "720p" | "1080p" | "4k",
        fps: fps as 24 | 30 | 60,
      };

      onDataChange("style-configuration", {
        videoStyle: styleData,
      });
    }
  }, [
    selectedStyle,
    selectedTone,
    selectedVisualStyle,
    selectedPlatform,
    duration,
    aspectRatio,
    resolution,
    fps,
    onDataChange,
  ]);

  const handleStyleSelect = (styleId: string) => {
    setSelectedStyle(styleId);
  };

  const handlePlatformSelect = (platformId: string) => {
    setSelectedPlatform(platformId);

    // Auto-adjust duration based on platform constraints
    const platform = PLATFORMS.find((p) => p.id === platformId);
    if (
      platform &&
      (duration < platform.duration[0] || duration > platform.duration[1])
    ) {
      setDuration(platform.duration[0]);
    }
  };

  const handleDurationChange = (value: number[]) => {
    setDuration(value[0]);
  };

  const selectedStyleData = VIDEO_STYLES.find((s) => s.id === selectedStyle);
  const selectedPlatformData = PLATFORMS.find((p) => p.id === selectedPlatform);

  return (
    <WizardStepWrapper step={props.step}>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <Palette className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold">Configure Video Style</h2>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Choose the visual style, platform, and format settings for your
            video.
          </p>
        </div>

        {/* Current Selection Summary */}
        {(selectedStyle || selectedPlatform) && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <CheckCircle className="h-5 w-5 text-blue-600 mr-2" />
                Configuration Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                {selectedStyle && (
                  <div>
                    <span className="font-medium text-blue-800">Style:</span>
                    <p className="text-blue-700">{selectedStyleData?.name}</p>
                  </div>
                )}
                {selectedPlatform && (
                  <div>
                    <span className="font-medium text-blue-800">Platform:</span>
                    <p className="text-blue-700">
                      {selectedPlatformData?.name}
                    </p>
                  </div>
                )}
                <div>
                  <span className="font-medium text-blue-800">Duration:</span>
                  <p className="text-blue-700">{duration} seconds</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Video Style Selection */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Choose Video Style</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Select the overall tone and approach for your video content.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {VIDEO_STYLES.map((style) => (
              <Card
                key={style.id}
                className={cn(
                  "cursor-pointer transition-all hover:shadow-md",
                  selectedStyle === style.id
                    ? "ring-2 ring-primary border-primary"
                    : "hover:border-primary/50"
                )}
                onClick={() => handleStyleSelect(style.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={cn("p-1.5 rounded", style.color)}>
                        {style.icon}
                      </div>
                      <CardTitle className="text-base">{style.name}</CardTitle>
                    </div>
                    {selectedStyle === style.id && (
                      <CheckCircle className="h-5 w-5 text-primary" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    {style.description}
                  </p>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1">
                      {style.features.map((feature) => (
                        <Badge
                          key={feature}
                          variant="outline"
                          className="text-xs"
                        >
                          {feature}
                        </Badge>
                      ))}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Best for: {style.platforms.join(", ")}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Platform Selection */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Target Platform</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Choose the primary platform where your video will be published.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {PLATFORMS.map((platform) => (
              <Card
                key={platform.id}
                className={cn(
                  "cursor-pointer transition-all hover:shadow-md",
                  selectedPlatform === platform.id
                    ? "ring-2 ring-primary border-primary"
                    : "hover:border-primary/50"
                )}
                onClick={() => handlePlatformSelect(platform.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      {platform.icon}
                    </div>
                    <div>
                      <h4 className="font-medium">{platform.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {platform.aspectRatio}
                      </p>
                    </div>
                    {selectedPlatform === platform.id && (
                      <CheckCircle className="h-5 w-5 text-primary ml-auto" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {platform.description}
                  </p>
                  <div className="text-xs text-muted-foreground mt-2">
                    Duration: {platform.duration[0]}-{platform.duration[1]}s
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Duration and Settings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Duration Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Video Duration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Duration: {duration} seconds</Label>
                  <div className="flex space-x-2">
                    {DURATION_PRESETS.map((preset) => (
                      <Button
                        key={preset.value}
                        variant={
                          duration === preset.value ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setDuration(preset.value)}
                        disabled={
                          selectedPlatformData &&
                          (preset.value < selectedPlatformData.duration[0] ||
                            preset.value > selectedPlatformData.duration[1])
                        }
                      >
                        {preset.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Slider
                    value={[duration]}
                    onValueChange={handleDurationChange}
                    min={selectedPlatformData?.duration[0] || 15}
                    max={selectedPlatformData?.duration[1] || 90}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{selectedPlatformData?.duration[0] || 15}s</span>
                    <span>{selectedPlatformData?.duration[1] || 90}s</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Include Subtitles</Label>
                    <p className="text-xs text-muted-foreground">
                      Auto-generated captions
                    </p>
                  </div>
                  <Switch
                    checked={includeSubtitles}
                    onCheckedChange={setIncludeSubtitles}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Music Overlay</Label>
                    <p className="text-xs text-muted-foreground">
                      Background music track
                    </p>
                  </div>
                  <Switch
                    checked={includeMusicOverlay}
                    onCheckedChange={setIncludeMusicOverlay}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Voice Narration</Label>
                    <p className="text-xs text-muted-foreground">
                      AI-generated voice over
                    </p>
                  </div>
                  <Switch
                    checked={voiceNarration}
                    onCheckedChange={setVoiceNarration}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Custom Prompt */}
        <Card>
          <CardHeader>
            <CardTitle>Custom Instructions (Optional)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="custom-prompt">
                Additional creative direction or specific requirements
              </Label>
              <Textarea
                id="custom-prompt"
                placeholder="e.g., 'Include trending hashtags', 'Focus on product benefits', 'Use bright colors'..."
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                rows={3}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                These instructions will be passed to the AI to customize your
                video generation.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Help Text */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            💡 <strong>Tip:</strong> Different platforms have optimal duration
            ranges. TikTok and Instagram Reels perform best with 15-30 second
            videos, while YouTube Shorts can be up to 60 seconds.
          </p>
        </div>
      </div>
    </WizardStepWrapper>
  );
}
