"use client";

import React, { useState, useEffect } from "react";
import { WizardStepProps } from "../types";
import { WizardStepWrapper } from "../wizard-step-wrapper";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
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
  Bot,
  Zap,
  Settings,
  Palette,
  Clock,
  CheckCircle,
  Wand2,
  Sparkles,
  Video,
  Volume2,
  Type,
  Brush,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AIConfigurationStepProps extends WizardStepProps {}

// AI Provider options
const AI_PROVIDERS = [
  {
    id: "veo",
    name: "Google Veo 3",
    description: "Latest Google video generation model with excellent quality",
    icon: <Sparkles className="h-5 w-5" />,
    color: "bg-blue-100 text-blue-800 border-blue-200",
    features: ["High quality", "Natural motion", "Fast generation"],
    price: "Premium",
    estimatedTime: "2-4 minutes",
    maxDuration: 60,
  },
  {
    id: "runway",
    name: "Runway Gen-3",
    description: "Advanced video generation with precise control",
    icon: <Video className="h-5 w-5" />,
    color: "bg-green-100 text-green-800 border-green-200",
    features: ["Precise control", "Style consistency", "Professional quality"],
    price: "Premium",
    estimatedTime: "3-5 minutes",
    maxDuration: 90,
  },
  {
    id: "luma",
    name: "Luma Dream Machine",
    description: "Fast and cost-effective video generation",
    icon: <Wand2 className="h-5 w-5" />,
    color: "bg-purple-100 text-purple-800 border-purple-200",
    features: ["Fast generation", "Cost effective", "Good quality"],
    price: "Standard",
    estimatedTime: "1-2 minutes",
    maxDuration: 30,
  },
];

// Quality presets
const QUALITY_PRESETS = [
  {
    id: "draft",
    name: "Draft",
    description: "Quick preview with lower quality",
    resolution: "720p",
    quality: 70,
    estimatedTime: "30% faster",
  },
  {
    id: "standard",
    name: "Standard",
    description: "Balanced quality and generation time",
    resolution: "1080p",
    quality: 85,
    estimatedTime: "Normal",
  },
  {
    id: "premium",
    name: "Premium",
    description: "Highest quality for final videos",
    resolution: "1080p",
    quality: 95,
    estimatedTime: "30% slower",
  },
];

// Style strength presets
const STYLE_STRENGTH_PRESETS = [
  { value: 30, label: "Subtle", description: "Light styling" },
  { value: 50, label: "Moderate", description: "Balanced approach" },
  { value: 70, label: "Strong", description: "Distinctive style" },
  { value: 90, label: "Intense", description: "Heavy styling" },
];

export function AIConfigurationStep(props: AIConfigurationStepProps) {
  const { wizardData, onDataChange } = props;

  // State for AI configuration
  const [selectedProvider, setSelectedProvider] = useState<string>(
    wizardData.aiSettings?.provider || ""
  );
  const [selectedQuality, setSelectedQuality] = useState<string>(
    wizardData.aiSettings?.quality || "standard"
  );
  const [styleStrength, setStyleStrength] = useState<number>(
    wizardData.aiSettings?.styleStrength || 50
  );
  const [creativityLevel, setCreativityLevel] = useState<number>(
    wizardData.aiSettings?.creativityLevel || 50
  );
  const [priority, setPriority] = useState<string>(
    wizardData.aiSettings?.priority || "normal"
  );
  const [customPrompt, setCustomPrompt] = useState<string>(
    wizardData.aiSettings?.customPrompt || ""
  );
  const [useCustomPrompt, setUseCustomPrompt] = useState<boolean>(
    wizardData.aiSettings?.useCustomPrompt ?? false
  );
  const [generatedScript, setGeneratedScript] = useState<any>(
    wizardData.aiSettings?.generatedScript || null
  );
  const [enableAdvancedFeatures, setEnableAdvancedFeatures] = useState<boolean>(
    wizardData.aiSettings?.enableAdvancedFeatures ?? false
  );
  const [customPromptEnhancement, setCustomPromptEnhancement] = useState<string>(
    wizardData.aiSettings?.customPromptEnhancement || ""
  );

  // Update step validation when data changes
  useEffect(() => {
    const isValid = !!selectedProvider;

    if (isValid) {
      const aiData = {
        provider: selectedProvider as "veo" | "runway" | "luma" | "auto",
        quality: selectedQuality,
        styleStrength,
        creativityLevel,
        priority: priority as "low" | "normal" | "high",
        customPrompt,
        useCustomPrompt,
        generatedScript,
        enableAdvancedFeatures,
        customPromptEnhancement,
      };

      onDataChange("ai-configuration", {
        aiSettings: aiData,
      });
    }
  }, [
    selectedProvider,
    selectedQuality,
    styleStrength,
    creativityLevel,
    priority,
    customPrompt,
    useCustomPrompt,
    generatedScript,
    enableAdvancedFeatures,
    customPromptEnhancement,
    onDataChange,
  ]);

  const handleProviderSelect = (providerId: string) => {
    setSelectedProvider(providerId);
  };

  const handleQualitySelect = (qualityId: string) => {
    setSelectedQuality(qualityId);
  };

  const handleStyleStrengthChange = (value: number[]) => {
    setStyleStrength(value[0]);
  };

  const handleCreativityChange = (value: number[]) => {
    setCreativityLevel(value[0]);
  };

  const selectedProviderData = AI_PROVIDERS.find(
    (p) => p.id === selectedProvider
  );
  const selectedQualityData = QUALITY_PRESETS.find(
    (q) => q.id === selectedQuality
  );

  // Check if selected duration is compatible with provider
  const videoDuration = wizardData.videoStyle?.duration || 30;
  const isDurationCompatible = selectedProviderData
    ? videoDuration <= selectedProviderData.maxDuration
    : true;

  return (
    <WizardStepWrapper step={props.step}>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <Bot className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold">AI Generation Settings</h2>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Configure the AI provider and generation parameters for your video.
          </p>
        </div>

        {/* Current Configuration Summary */}
        {selectedProvider && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                Configuration Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-green-800">Provider:</span>
                  <p className="text-green-700">{selectedProviderData?.name}</p>
                </div>
                <div>
                  <span className="font-medium text-green-800">Quality:</span>
                  <p className="text-green-700">
                    {selectedQualityData?.name} (
                    {selectedQualityData?.resolution})
                  </p>
                </div>
                <div>
                  <span className="font-medium text-green-800">Est. Time:</span>
                  <p className="text-green-700">
                    {selectedProviderData?.estimatedTime}
                  </p>
                </div>
              </div>
              {!isDurationCompatible && (
                <div className="mt-3 p-3 bg-yellow-100 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Your selected duration ({videoDuration}s) exceeds this
                    provider's limit ({selectedProviderData?.maxDuration}s).
                    Consider choosing a different provider or reducing the
                    duration.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* AI Provider Selection */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Choose AI Provider</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Select the AI video generation model that best fits your needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {AI_PROVIDERS.map((provider) => {
              const isCompatible = videoDuration <= provider.maxDuration;

              return (
                <Card
                  key={provider.id}
                  className={cn(
                    "cursor-pointer transition-all hover:shadow-md",
                    selectedProvider === provider.id
                      ? "ring-2 ring-primary border-primary"
                      : isCompatible
                        ? "hover:border-primary/50"
                        : "opacity-60 cursor-not-allowed"
                  )}
                  onClick={() =>
                    isCompatible && handleProviderSelect(provider.id)
                  }
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={cn("p-1.5 rounded", provider.color)}>
                          {provider.icon}
                        </div>
                        <div>
                          <CardTitle className="text-base">
                            {provider.name}
                          </CardTitle>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {provider.price}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              Max {provider.maxDuration}s
                            </Badge>
                          </div>
                        </div>
                      </div>
                      {selectedProvider === provider.id && (
                        <CheckCircle className="h-5 w-5 text-primary" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      {provider.description}
                    </p>
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-1">
                        {provider.features.map((feature) => (
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
                        <Clock className="h-3 w-3 inline mr-1" />
                        {provider.estimatedTime}
                      </div>
                    </div>
                    {!isCompatible && (
                      <div className="mt-2 text-xs text-red-600 font-medium">
                        Duration too long for this provider
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Quality Settings */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Quality Settings</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Choose the balance between quality and generation speed.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {QUALITY_PRESETS.map((quality) => (
              <Card
                key={quality.id}
                className={cn(
                  "cursor-pointer transition-all hover:shadow-md",
                  selectedQuality === quality.id
                    ? "ring-2 ring-primary border-primary"
                    : "hover:border-primary/50"
                )}
                onClick={() => handleQualitySelect(quality.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{quality.name}</h4>
                    {selectedQuality === quality.id && (
                      <CheckCircle className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {quality.description}
                  </p>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div>Resolution: {quality.resolution}</div>
                    <div>Quality: {quality.quality}%</div>
                    <div>Time: {quality.estimatedTime}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Advanced Settings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Style & Creativity Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Palette className="h-5 w-5 mr-2" />
                Style & Creativity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Style Strength: {styleStrength}%</Label>
                  <div className="flex space-x-2">
                    {STYLE_STRENGTH_PRESETS.map((preset) => (
                      <Button
                        key={preset.value}
                        variant={
                          styleStrength === preset.value ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setStyleStrength(preset.value)}
                      >
                        {preset.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <Slider
                  value={[styleStrength]}
                  onValueChange={handleStyleStrengthChange}
                  min={10}
                  max={100}
                  step={10}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Higher values apply more styling but may reduce content
                  accuracy
                </p>
              </div>

              <div className="space-y-3">
                <Label>Creativity Level: {creativityLevel}%</Label>
                <Slider
                  value={[creativityLevel]}
                  onValueChange={handleCreativityChange}
                  min={10}
                  max={100}
                  step={10}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Controls how creative vs. literal the AI interpretation should
                  be
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Additional Options */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Advanced Options
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Advanced Features</Label>
                    <p className="text-xs text-muted-foreground">
                      Enable experimental AI features
                    </p>
                  </div>
                  <Switch
                    checked={enableAdvancedFeatures}
                    onCheckedChange={setEnableAdvancedFeatures}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Provider Fallback</Label>
                    <p className="text-xs text-muted-foreground">
                      Auto-switch if primary provider fails
                    </p>
                  </div>
                  <Switch
                    checked={enableFallback}
                    onCheckedChange={setEnableFallback}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Custom Prompt Enhancement */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Type className="h-5 w-5 mr-2" />
              Prompt Enhancement (Optional)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="prompt-enhancement">
                Additional prompting instructions for the AI
              </Label>
              <Textarea
                id="prompt-enhancement"
                placeholder="e.g., 'Make it more cinematic', 'Focus on close-up shots', 'Use warm color palette'..."
                value={customPromptEnhancement}
                onChange={(e) => setCustomPromptEnhancement(e.target.value)}
                rows={3}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                These instructions will be added to the base prompt to fine-tune
                the AI generation.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Help Text */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            💡 <strong>Tip:</strong> Veo 3 offers the highest quality but takes
            longer. Luma is fastest for previews. Runway provides the best
            balance of quality and control.
          </p>
        </div>
      </div>
    </WizardStepWrapper>
  );
}
