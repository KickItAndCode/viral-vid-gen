"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { VideoEditorAssets } from "./video-editor-assets";
import { CaptionEditor } from "./caption-editor";
import { VisualEffectsPanel } from "./visual-effects-panel";
import { AudioControlsPanel } from "./audio-controls-panel";
import {
  FolderOpen,
  Palette,
  Type,
  Music,
  Settings,
  Search,
  Plus,
  Download,
  Upload,
} from "lucide-react";

export interface VideoEditorSidebarProps {
  /** Currently active panel */
  activePanel: "assets" | "effects" | "captions" | "audio";
  /** Callback for panel changes */
  onPanelChange?: (panel: "assets" | "effects" | "captions" | "audio") => void;
  /** Current video duration for caption editor */
  duration?: number;
  /** Custom CSS class */
  className?: string;
}

export const VideoEditorSidebar = ({
  activePanel,
  onPanelChange,
  duration = 30,
  className,
}: VideoEditorSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const mockAssets = [
    {
      id: "1",
      name: "Sample Video 1",
      type: "video" as const,
      thumbnail: "/api/placeholder/120/68",
      duration: 30,
      size: "12.5 MB",
    },
    {
      id: "2",
      name: "Background Music",
      type: "audio" as const,
      thumbnail: "/api/placeholder/120/68",
      duration: 120,
      size: "3.2 MB",
    },
    {
      id: "3",
      name: "Logo Image",
      type: "image" as const,
      thumbnail: "/api/placeholder/120/68",
      size: "256 KB",
    },
  ];

  const mockEffects = [
    { id: "1", name: "Fade In", category: "Transition" },
    { id: "2", name: "Fade Out", category: "Transition" },
    { id: "3", name: "Blur", category: "Filter" },
    { id: "4", name: "Brightness", category: "Color" },
    { id: "5", name: "Contrast", category: "Color" },
    { id: "6", name: "Zoom In", category: "Transform" },
  ];

  const mockFonts = [
    { id: "1", name: "Inter", family: "sans-serif" },
    { id: "2", name: "Roboto", family: "sans-serif" },
    { id: "3", name: "Playfair Display", family: "serif" },
    { id: "4", name: "Fira Code", family: "monospace" },
  ];

  const filteredAssets = mockAssets.filter((asset) =>
    asset.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card
      className={cn(
        "h-full rounded-none border-l-0 border-t-0 border-b-0",
        className
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Search assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Button variant="outline" size="sm">
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Tabs
          value={activePanel}
          onValueChange={(value) => onPanelChange?.(value as any)}
        >
          <TabsList className="grid w-full grid-cols-4 mx-4 mb-4">
            <TabsTrigger value="assets" className="text-xs">
              <FolderOpen className="h-3 w-3 mr-1" />
              Assets
            </TabsTrigger>
            <TabsTrigger value="effects" className="text-xs">
              <Palette className="h-3 w-3 mr-1" />
              Effects
            </TabsTrigger>
            <TabsTrigger value="captions" className="text-xs">
              <Type className="h-3 w-3 mr-1" />
              Text
            </TabsTrigger>
            <TabsTrigger value="audio" className="text-xs">
              <Music className="h-3 w-3 mr-1" />
              Audio
            </TabsTrigger>
          </TabsList>

          <TabsContent value="assets" className="mt-0">
            <div className="px-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">Media Library</h3>
                <Button variant="outline" size="sm">
                  <Upload className="h-3 w-3 mr-1" />
                  Import
                </Button>
              </div>

              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {filteredAssets.map((asset) => (
                    <div
                      key={asset.id}
                      className="p-2 rounded border hover:bg-muted/50 cursor-pointer transition-colors"
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData(
                          "text/plain",
                          JSON.stringify(asset)
                        );
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={asset.thumbnail}
                          alt={asset.name}
                          className="w-12 h-8 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {asset.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {asset.type} • {asset.size}
                            {asset.duration && ` • ${asset.duration}s`}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>

          <TabsContent value="effects" className="mt-0 h-full">
            <div className="h-full overflow-hidden">
              <VisualEffectsPanel className="h-full rounded-none border-0" />
            </div>
          </TabsContent>

          <TabsContent value="captions" className="mt-0 h-full">
            <div className="h-full overflow-hidden">
              <CaptionEditor
                duration={duration}
                className="h-full rounded-none border-0"
              />
            </div>
          </TabsContent>

          <TabsContent value="audio" className="mt-0 h-full">
            <div className="h-full overflow-hidden">
              <AudioControlsPanel className="h-full rounded-none border-0" />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default VideoEditorSidebar;
