"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Palette,
  Zap,
  Sparkles,
  Sun,
  Moon,
  Droplets,
  Wind,
  Flame,
  Snowflake,
  Filter,
  Blend,
  Contrast as ContrastIcon,
  Brightness6 as BrightnessIcon,
  Sliders,
  Settings,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  RotateCcw,
  Copy,
  Download,
  Upload,
} from "lucide-react";

export interface VisualEffect {
  id: string;
  name: string;
  type: "filter" | "transition" | "color" | "distortion" | "overlay";
  category: string;
  intensity: number;
  enabled: boolean;
  settings: Record<string, any>;
  previewUrl?: string;
}

export interface EffectPreset {
  id: string;
  name: string;
  category: string;
  type: "filter" | "transition" | "color" | "distortion" | "overlay";
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  settings: Record<string, any>;
  isPremium?: boolean;
}

export interface VisualEffectsPanelProps {
  /** Applied effects */
  effects?: VisualEffect[];
  /** Current video clip ID */
  clipId?: string;
  /** Callback when effects are updated */
  onEffectsUpdate?: (effects: VisualEffect[]) => void;
  /** Custom CSS class */
  className?: string;
}

const filterPresets: EffectPreset[] = [
  {
    id: "vintage",
    name: "Vintage",
    category: "Cinematic",
    type: "filter",
    icon: Sun,
    description: "Classic vintage film look",
    settings: { sepia: 0.3, contrast: 1.2, brightness: 0.9, saturation: 0.8 },
  },
  {
    id: "noir",
    name: "Film Noir",
    category: "Cinematic",
    type: "filter",
    icon: Moon,
    description: "Black and white dramatic effect",
    settings: { saturation: 0, contrast: 1.5, brightness: 0.8, vignette: 0.6 },
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk",
    category: "Futuristic",
    type: "filter",
    icon: Zap,
    description: "Neon-tinted futuristic look",
    settings: { hue: 180, saturation: 1.4, contrast: 1.3, brightness: 1.1 },
    isPremium: true,
  },
  {
    id: "warm",
    name: "Warm Tone",
    category: "Color",
    type: "color",
    icon: Flame,
    description: "Warm, cozy atmosphere",
    settings: { temperature: 1.2, tint: 0.1, brightness: 1.05 },
  },
  {
    id: "cold",
    name: "Cold Tone",
    category: "Color",
    type: "color",
    icon: Snowflake,
    description: "Cool, crisp atmosphere",
    settings: { temperature: 0.8, tint: -0.1, brightness: 0.95 },
  },
  {
    id: "blur",
    name: "Gaussian Blur",
    category: "Blur",
    type: "filter",
    icon: Filter,
    description: "Smooth blur effect",
    settings: { radius: 2, quality: "medium" },
  },
  {
    id: "sharpen",
    name: "Sharpen",
    category: "Enhancement",
    type: "filter",
    icon: Sliders,
    description: "Enhance image sharpness",
    settings: { amount: 1.2, radius: 1, threshold: 0.1 },
  },
  {
    id: "grain",
    name: "Film Grain",
    category: "Texture",
    type: "overlay",
    icon: Sparkles,
    description: "Add film grain texture",
    settings: { intensity: 0.3, size: 1, speed: 0.5 },
  },
];

const transitionPresets: EffectPreset[] = [
  {
    id: "fade",
    name: "Fade",
    category: "Basic",
    type: "transition",
    icon: Sun,
    description: "Classic fade transition",
    settings: { duration: 1, easing: "ease-in-out" },
  },
  {
    id: "slide",
    name: "Slide",
    category: "Motion",
    type: "transition",
    icon: Wind,
    description: "Sliding transition",
    settings: { direction: "right", duration: 0.8 },
  },
  {
    id: "zoom",
    name: "Zoom",
    category: "Motion",
    type: "transition",
    icon: Sparkles,
    description: "Zoom transition",
    settings: { scale: 1.5, duration: 1.2 },
  },
  {
    id: "dissolve",
    name: "Dissolve",
    category: "Advanced",
    type: "transition",
    icon: Droplets,
    description: "Dissolve transition",
    settings: { softness: 0.5, duration: 1.5 },
    isPremium: true,
  },
];

export const VisualEffectsPanel = ({
  effects = [],
  clipId,
  onEffectsUpdate,
  className,
}: VisualEffectsPanelProps) => {
  const [selectedEffect, setSelectedEffect] = useState<VisualEffect | null>(
    null
  );
  const [activeTab, setActiveTab] = useState("filters");
  const [showPreview, setShowPreview] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const addEffect = useCallback(
    (preset: EffectPreset) => {
      const newEffect: VisualEffect = {
        id: `${preset.id}-${Date.now()}`,
        name: preset.name,
        type: preset.type,
        category: preset.category,
        intensity: 1,
        enabled: true,
        settings: { ...preset.settings },
      };

      const updatedEffects = [...effects, newEffect];
      onEffectsUpdate?.(updatedEffects);
      setSelectedEffect(newEffect);
    },
    [effects, onEffectsUpdate]
  );

  const removeEffect = useCallback(
    (effectId: string) => {
      const updatedEffects = effects.filter((e) => e.id !== effectId);
      onEffectsUpdate?.(updatedEffects);

      if (selectedEffect?.id === effectId) {
        setSelectedEffect(null);
      }
    },
    [effects, onEffectsUpdate, selectedEffect]
  );

  const toggleEffect = useCallback(
    (effectId: string) => {
      const updatedEffects = effects.map((e) =>
        e.id === effectId ? { ...e, enabled: !e.enabled } : e
      );
      onEffectsUpdate?.(updatedEffects);
    },
    [effects, onEffectsUpdate]
  );

  const updateEffect = useCallback(
    (effectId: string, updates: Partial<VisualEffect>) => {
      const updatedEffects = effects.map((e) =>
        e.id === effectId ? { ...e, ...updates } : e
      );
      onEffectsUpdate?.(updatedEffects);

      if (selectedEffect?.id === effectId) {
        setSelectedEffect((prev) => (prev ? { ...prev, ...updates } : null));
      }
    },
    [effects, onEffectsUpdate, selectedEffect]
  );

  const duplicateEffect = useCallback(
    (effectId: string) => {
      const effect = effects.find((e) => e.id === effectId);
      if (!effect) return;

      const duplicatedEffect: VisualEffect = {
        ...effect,
        id: `${effect.id}-copy-${Date.now()}`,
        name: `${effect.name} Copy`,
      };

      const updatedEffects = [...effects, duplicatedEffect];
      onEffectsUpdate?.(updatedEffects);
    },
    [effects, onEffectsUpdate]
  );

  const clearAllEffects = useCallback(() => {
    onEffectsUpdate?.([]);
    setSelectedEffect(null);
  }, [onEffectsUpdate]);

  const filteredFilters = filterPresets.filter(
    (preset) =>
      preset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      preset.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTransitions = transitionPresets.filter(
    (preset) =>
      preset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      preset.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderEffectControls = (effect: VisualEffect) => {
    if (!effect) return null;

    const handleSettingChange = (key: string, value: any) => {
      updateEffect(effect.id, {
        settings: { ...effect.settings, [key]: value },
      });
    };

    const handleIntensityChange = (value: number[]) => {
      updateEffect(effect.id, { intensity: value[0] });
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">{effect.name}</h4>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleEffect(effect.id)}
            >
              {effect.enabled ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => duplicateEffect(effect.id)}
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeEffect(effect.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div>
          <Label className="text-xs">Intensity</Label>
          <Slider
            value={[effect.intensity]}
            onValueChange={handleIntensityChange}
            min={0}
            max={2}
            step={0.1}
            className="mt-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>0%</span>
            <span>{Math.round(effect.intensity * 100)}%</span>
            <span>200%</span>
          </div>
        </div>

        <Separator />

        {/* Dynamic settings based on effect type */}
        {effect.type === "filter" && (
          <div className="space-y-3">
            {effect.settings.brightness !== undefined && (
              <div>
                <Label className="text-xs">Brightness</Label>
                <Slider
                  value={[effect.settings.brightness]}
                  onValueChange={([value]) =>
                    handleSettingChange("brightness", value)
                  }
                  min={0}
                  max={2}
                  step={0.1}
                  className="mt-1"
                />
              </div>
            )}
            {effect.settings.contrast !== undefined && (
              <div>
                <Label className="text-xs">Contrast</Label>
                <Slider
                  value={[effect.settings.contrast]}
                  onValueChange={([value]) =>
                    handleSettingChange("contrast", value)
                  }
                  min={0}
                  max={2}
                  step={0.1}
                  className="mt-1"
                />
              </div>
            )}
            {effect.settings.saturation !== undefined && (
              <div>
                <Label className="text-xs">Saturation</Label>
                <Slider
                  value={[effect.settings.saturation]}
                  onValueChange={([value]) =>
                    handleSettingChange("saturation", value)
                  }
                  min={0}
                  max={2}
                  step={0.1}
                  className="mt-1"
                />
              </div>
            )}
            {effect.settings.hue !== undefined && (
              <div>
                <Label className="text-xs">Hue</Label>
                <Slider
                  value={[effect.settings.hue]}
                  onValueChange={([value]) => handleSettingChange("hue", value)}
                  min={-180}
                  max={180}
                  step={1}
                  className="mt-1"
                />
              </div>
            )}
            {effect.settings.radius !== undefined && (
              <div>
                <Label className="text-xs">Radius</Label>
                <Slider
                  value={[effect.settings.radius]}
                  onValueChange={([value]) =>
                    handleSettingChange("radius", value)
                  }
                  min={0}
                  max={20}
                  step={0.5}
                  className="mt-1"
                />
              </div>
            )}
          </div>
        )}

        {effect.type === "color" && (
          <div className="space-y-3">
            {effect.settings.temperature !== undefined && (
              <div>
                <Label className="text-xs">Temperature</Label>
                <Slider
                  value={[effect.settings.temperature]}
                  onValueChange={([value]) =>
                    handleSettingChange("temperature", value)
                  }
                  min={0.5}
                  max={1.5}
                  step={0.1}
                  className="mt-1"
                />
              </div>
            )}
            {effect.settings.tint !== undefined && (
              <div>
                <Label className="text-xs">Tint</Label>
                <Slider
                  value={[effect.settings.tint]}
                  onValueChange={([value]) =>
                    handleSettingChange("tint", value)
                  }
                  min={-0.5}
                  max={0.5}
                  step={0.1}
                  className="mt-1"
                />
              </div>
            )}
          </div>
        )}

        {effect.type === "transition" && (
          <div className="space-y-3">
            {effect.settings.duration !== undefined && (
              <div>
                <Label className="text-xs">Duration (seconds)</Label>
                <Slider
                  value={[effect.settings.duration]}
                  onValueChange={([value]) =>
                    handleSettingChange("duration", value)
                  }
                  min={0.1}
                  max={5}
                  step={0.1}
                  className="mt-1"
                />
              </div>
            )}
            {effect.settings.easing !== undefined && (
              <div>
                <Label className="text-xs">Easing</Label>
                <Select
                  value={effect.settings.easing}
                  onValueChange={(value) =>
                    handleSettingChange("easing", value)
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ease-in-out">Ease In Out</SelectItem>
                    <SelectItem value="ease-in">Ease In</SelectItem>
                    <SelectItem value="ease-out">Ease Out</SelectItem>
                    <SelectItem value="linear">Linear</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateEffect(effect.id, { settings: {} })}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Save Preset
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Card className={cn("w-full h-full flex flex-col", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Palette className="h-5 w-5" />
            <span>Visual Effects</span>
            <Badge variant="outline">{effects.length} applied</Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllEffects}
              disabled={effects.length === 0}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="filters">Filters</TabsTrigger>
            <TabsTrigger value="transitions">Transitions</TabsTrigger>
            <TabsTrigger value="applied">Applied</TabsTrigger>
          </TabsList>

          <TabsContent value="filters" className="space-y-4">
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {[
                  "Cinematic",
                  "Color",
                  "Blur",
                  "Enhancement",
                  "Texture",
                  "Futuristic",
                ].map((category) => (
                  <div key={category}>
                    <h4 className="text-xs font-medium text-muted-foreground mb-2">
                      {category}
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {filteredFilters
                        .filter((filter) => filter.category === category)
                        .map((filter) => (
                          <Button
                            key={filter.id}
                            variant="outline"
                            size="sm"
                            className="h-20 flex flex-col items-center justify-center relative"
                            onClick={() => addEffect(filter)}
                          >
                            <filter.icon className="h-5 w-5 mb-1" />
                            <span className="text-xs text-center">
                              {filter.name}
                            </span>
                            {filter.isPremium && (
                              <Badge
                                variant="secondary"
                                className="absolute top-1 right-1 text-xs"
                              >
                                Pro
                              </Badge>
                            )}
                          </Button>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="transitions" className="space-y-4">
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {["Basic", "Motion", "Advanced"].map((category) => (
                  <div key={category}>
                    <h4 className="text-xs font-medium text-muted-foreground mb-2">
                      {category}
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {filteredTransitions
                        .filter(
                          (transition) => transition.category === category
                        )
                        .map((transition) => (
                          <Button
                            key={transition.id}
                            variant="outline"
                            size="sm"
                            className="h-20 flex flex-col items-center justify-center relative"
                            onClick={() => addEffect(transition)}
                          >
                            <transition.icon className="h-5 w-5 mb-1" />
                            <span className="text-xs text-center">
                              {transition.name}
                            </span>
                            {transition.isPremium && (
                              <Badge
                                variant="secondary"
                                className="absolute top-1 right-1 text-xs"
                              >
                                Pro
                              </Badge>
                            )}
                          </Button>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="applied" className="space-y-4">
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {effects.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Palette className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No effects applied</p>
                    <p className="text-xs">
                      Add effects from the Filters or Transitions tabs
                    </p>
                  </div>
                ) : (
                  effects.map((effect) => (
                    <div
                      key={effect.id}
                      className={cn(
                        "p-3 rounded-lg border cursor-pointer transition-all",
                        selectedEffect?.id === effect.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-border hover:border-blue-300",
                        !effect.enabled && "opacity-50"
                      )}
                      onClick={() => setSelectedEffect(effect)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 rounded-full bg-blue-500" />
                          <div>
                            <p className="text-sm font-medium">{effect.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {effect.category} •{" "}
                              {Math.round(effect.intensity * 100)}%
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleEffect(effect.id);
                            }}
                          >
                            {effect.enabled ? (
                              <Eye className="h-4 w-4" />
                            ) : (
                              <EyeOff className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeEffect(effect.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {/* Effect Controls */}
        {selectedEffect && (
          <>
            <Separator />
            <div className="flex-1 overflow-y-auto">
              {renderEffectControls(selectedEffect)}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default VisualEffectsPanel;
