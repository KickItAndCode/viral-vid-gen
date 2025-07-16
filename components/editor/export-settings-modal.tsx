"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Download,
  Settings,
  Video,
  Monitor,
  Smartphone,
  Square,
  Zap,
  HardDrive,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { useExport } from "@/lib/stores/video-editor-store";

export interface ExportSettingsModalProps {
  /** Whether modal is open */
  isOpen: boolean;
  /** Callback to close modal */
  onClose: () => void;
  /** Callback to start export */
  onStartExport: (settings: ExportSettings) => void;
  /** Current project duration */
  duration: number;
  /** Custom CSS class */
  className?: string;
}

export interface ExportSettings {
  format: "mp4" | "mov" | "webm";
  quality: "high" | "medium" | "low";
  resolution: "1080p" | "720p" | "480p";
  aspectRatio: "16:9" | "9:16" | "1:1";
  fps: 24 | 30 | 60;
  filename: string;
  includeAudio: boolean;
  platform: "youtube" | "tiktok" | "instagram" | "custom";
}

const defaultSettings: ExportSettings = {
  format: "mp4",
  quality: "high",
  resolution: "1080p",
  aspectRatio: "16:9",
  fps: 30,
  filename: "my-video",
  includeAudio: true,
  platform: "youtube",
};

const platformPresets = {
  youtube: {
    aspectRatio: "16:9" as const,
    resolution: "1080p" as const,
    format: "mp4" as const,
    fps: 30 as const,
    icon: Monitor,
    description: "Optimized for YouTube",
  },
  tiktok: {
    aspectRatio: "9:16" as const,
    resolution: "1080p" as const,
    format: "mp4" as const,
    fps: 30 as const,
    icon: Smartphone,
    description: "Optimized for TikTok",
  },
  instagram: {
    aspectRatio: "1:1" as const,
    resolution: "1080p" as const,
    format: "mp4" as const,
    fps: 30 as const,
    icon: Square,
    description: "Optimized for Instagram",
  },
  custom: {
    aspectRatio: "16:9" as const,
    resolution: "1080p" as const,
    format: "mp4" as const,
    fps: 30 as const,
    icon: Settings,
    description: "Custom settings",
  },
};

export const ExportSettingsModal = ({
  isOpen,
  onClose,
  onStartExport,
  duration,
  className,
}: ExportSettingsModalProps) => {
  const [settings, setSettings] = useState<ExportSettings>(defaultSettings);
  const [activeTab, setActiveTab] = useState("presets");
  const { isExporting } = useExport();

  const updateSettings = useCallback((updates: Partial<ExportSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  const handlePlatformSelect = useCallback(
    (platform: keyof typeof platformPresets) => {
      const preset = platformPresets[platform];
      updateSettings({
        platform,
        ...preset,
      });
    },
    [updateSettings]
  );

  const handleExport = useCallback(() => {
    onStartExport(settings);
  }, [settings, onStartExport]);

  const getEstimatedFileSize = () => {
    const baseSize = duration * 2; // 2MB per second baseline
    const qualityMultiplier = {
      low: 0.5,
      medium: 1,
      high: 2,
    }[settings.quality];

    const resolutionMultiplier = {
      "480p": 0.5,
      "720p": 1,
      "1080p": 2,
    }[settings.resolution];

    return Math.round(baseSize * qualityMultiplier * resolutionMultiplier);
  };

  const getEstimatedExportTime = () => {
    const baseTime = duration * 0.5; // 0.5x realtime baseline
    const qualityMultiplier = {
      low: 0.5,
      medium: 1,
      high: 2,
    }[settings.quality];

    return Math.round(baseTime * qualityMultiplier);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn("max-w-2xl max-h-[90vh] overflow-hidden", className)}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Download className="h-5 w-5" />
            <span>Export Video</span>
          </DialogTitle>
          <DialogDescription>
            Choose your export settings and platform optimization
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="presets">Platform Presets</TabsTrigger>
              <TabsTrigger value="advanced">Advanced Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="presets" className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(platformPresets).map(([key, preset]) => {
                  const IconComponent = preset.icon;
                  const isSelected = settings.platform === key;

                  return (
                    <Card
                      key={key}
                      className={cn(
                        "cursor-pointer transition-all hover:shadow-md",
                        isSelected ? "ring-2 ring-primary bg-primary/5" : ""
                      )}
                      onClick={() =>
                        handlePlatformSelect(
                          key as keyof typeof platformPresets
                        )
                      }
                    >
                      <CardContent className="p-4 text-center">
                        <IconComponent className="h-8 w-8 mx-auto mb-2" />
                        <h3 className="font-semibold capitalize">{key}</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {preset.description}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          <Badge variant="secondary" className="text-xs">
                            {preset.aspectRatio}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {preset.resolution}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Quick Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Quick Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label htmlFor="filename" className="text-sm">
                      Filename
                    </Label>
                    <Input
                      id="filename"
                      value={settings.filename}
                      onChange={(e) =>
                        updateSettings({ filename: e.target.value })
                      }
                      placeholder="my-video"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="quality" className="text-sm">
                      Quality
                    </Label>
                    <Select
                      value={settings.quality}
                      onValueChange={(value) =>
                        updateSettings({ quality: value as any })
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low (Faster export)</SelectItem>
                        <SelectItem value="medium">
                          Medium (Balanced)
                        </SelectItem>
                        <SelectItem value="high">
                          High (Best quality)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="format" className="text-sm">
                    Format
                  </Label>
                  <Select
                    value={settings.format}
                    onValueChange={(value) =>
                      updateSettings({ format: value as any })
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mp4">MP4 (Recommended)</SelectItem>
                      <SelectItem value="mov">MOV (Apple)</SelectItem>
                      <SelectItem value="webm">WebM (Web)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="resolution" className="text-sm">
                    Resolution
                  </Label>
                  <Select
                    value={settings.resolution}
                    onValueChange={(value) =>
                      updateSettings({ resolution: value as any })
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1080p">1080p (1920×1080)</SelectItem>
                      <SelectItem value="720p">720p (1280×720)</SelectItem>
                      <SelectItem value="480p">480p (854×480)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="aspect-ratio" className="text-sm">
                    Aspect Ratio
                  </Label>
                  <Select
                    value={settings.aspectRatio}
                    onValueChange={(value) =>
                      updateSettings({ aspectRatio: value as any })
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="16:9">16:9 (Landscape)</SelectItem>
                      <SelectItem value="9:16">9:16 (Portrait)</SelectItem>
                      <SelectItem value="1:1">1:1 (Square)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="fps" className="text-sm">
                    Frame Rate
                  </Label>
                  <Select
                    value={settings.fps.toString()}
                    onValueChange={(value) =>
                      updateSettings({ fps: parseInt(value) as any })
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24">24 FPS (Cinematic)</SelectItem>
                      <SelectItem value="30">30 FPS (Standard)</SelectItem>
                      <SelectItem value="60">60 FPS (Smooth)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="include-audio"
                  checked={settings.includeAudio}
                  onChange={(e) =>
                    updateSettings({ includeAudio: e.target.checked })
                  }
                />
                <Label htmlFor="include-audio" className="text-sm">
                  Include audio
                </Label>
              </div>
            </TabsContent>
          </Tabs>

          {/* Export Estimates */}
          <Card className="mt-4">
            <CardContent className="p-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <HardDrive className="h-4 w-4 text-muted-foreground" />
                  <span>Estimated file size:</span>
                  <Badge variant="secondary">{getEstimatedFileSize()} MB</Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Export time:</span>
                  <Badge variant="secondary">
                    ~{getEstimatedExportTime()}s
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isExporting}>
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="min-w-24"
          >
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export Video
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExportSettingsModal;
