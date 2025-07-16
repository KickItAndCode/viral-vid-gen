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
  /** Custom CSS class */
  className?: string;
}

export const VideoEditorSidebar = ({
  activePanel,
  onPanelChange,
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

          <TabsContent value="effects" className="mt-0">
            <div className="px-4 space-y-4">
              <h3 className="font-semibold text-sm">Video Effects</h3>

              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {["Transition", "Filter", "Color", "Transform"].map(
                    (category) => (
                      <div key={category}>
                        <h4 className="text-xs font-medium text-muted-foreground mb-2">
                          {category}
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          {mockEffects
                            .filter((effect) => effect.category === category)
                            .map((effect) => (
                              <Button
                                key={effect.id}
                                variant="outline"
                                size="sm"
                                className="h-16 flex flex-col items-center justify-center"
                                draggable
                                onDragStart={(e) => {
                                  e.dataTransfer.setData(
                                    "text/plain",
                                    JSON.stringify(effect)
                                  );
                                }}
                              >
                                <Palette className="h-4 w-4 mb-1" />
                                <span className="text-xs">{effect.name}</span>
                              </Button>
                            ))}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>

          <TabsContent value="captions" className="mt-0">
            <div className="px-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">Text & Captions</h3>
                <Button variant="outline" size="sm">
                  <Plus className="h-3 w-3 mr-1" />
                  Add Text
                </Button>
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="text-content" className="text-xs">
                    Text Content
                  </Label>
                  <Input
                    id="text-content"
                    placeholder="Enter your text..."
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="font-family" className="text-xs">
                    Font Family
                  </Label>
                  <select
                    id="font-family"
                    className="mt-1 w-full p-2 border rounded"
                  >
                    {mockFonts.map((font) => (
                      <option key={font.id} value={font.name}>
                        {font.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="font-size" className="text-xs">
                    Font Size
                  </Label>
                  <Slider
                    id="font-size"
                    min={12}
                    max={72}
                    step={1}
                    defaultValue={[24]}
                    className="mt-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm">
                    <strong>B</strong>
                  </Button>
                  <Button variant="outline" size="sm">
                    <em>I</em>
                  </Button>
                </div>

                <div>
                  <Label className="text-xs">Text Color</Label>
                  <div className="grid grid-cols-6 gap-1 mt-1">
                    {[
                      "#000000",
                      "#ffffff",
                      "#ff0000",
                      "#00ff00",
                      "#0000ff",
                      "#ffff00",
                    ].map((color) => (
                      <button
                        key={color}
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="audio" className="mt-0">
            <div className="px-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">Audio Controls</h3>
                <Button variant="outline" size="sm">
                  <Upload className="h-3 w-3 mr-1" />
                  Import
                </Button>
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="master-volume" className="text-xs">
                    Master Volume
                  </Label>
                  <Slider
                    id="master-volume"
                    min={0}
                    max={100}
                    step={1}
                    defaultValue={[80]}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="video-volume" className="text-xs">
                    Video Track Volume
                  </Label>
                  <Slider
                    id="video-volume"
                    min={0}
                    max={100}
                    step={1}
                    defaultValue={[100]}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="background-volume" className="text-xs">
                    Background Music
                  </Label>
                  <Slider
                    id="background-volume"
                    min={0}
                    max={100}
                    step={1}
                    defaultValue={[50]}
                    className="mt-2"
                  />
                </div>

                <div className="pt-2">
                  <h4 className="text-xs font-medium mb-2">Audio Effects</h4>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                    >
                      Noise Reduction
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                    >
                      Audio Fade
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                    >
                      Equalizer
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default VideoEditorSidebar;
