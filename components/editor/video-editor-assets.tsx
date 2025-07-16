"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  FileVideo,
  FileAudio,
  FileImage,
  Type,
  Upload,
  Search,
  Filter,
} from "lucide-react";

export interface Asset {
  id: string;
  name: string;
  type: "video" | "audio" | "image" | "text";
  url: string;
  thumbnail?: string;
  duration?: number;
  size: string;
  createdAt: Date;
}

export interface VideoEditorAssetsProps {
  /** List of available assets */
  assets?: Asset[];
  /** Callback for asset selection */
  onAssetSelect?: (asset: Asset) => void;
  /** Callback for asset import */
  onAssetImport?: (type: string) => void;
  /** Custom CSS class */
  className?: string;
}

export const VideoEditorAssets = ({
  assets = [],
  onAssetSelect,
  onAssetImport,
  className,
}: VideoEditorAssetsProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  // Mock assets for development
  const mockAssets: Asset[] = [
    {
      id: "1",
      name: "Sample Video 1.mp4",
      type: "video",
      url: "/api/placeholder/video/sample1.mp4",
      thumbnail: "/api/placeholder/160/90",
      duration: 30,
      size: "12.5 MB",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      id: "2",
      name: "Background Music.mp3",
      type: "audio",
      url: "/api/placeholder/audio/background.mp3",
      duration: 120,
      size: "3.2 MB",
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
    {
      id: "3",
      name: "Logo.png",
      type: "image",
      url: "/api/placeholder/logo.png",
      thumbnail: "/api/placeholder/160/90",
      size: "256 KB",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
    {
      id: "4",
      name: "Intro Text",
      type: "text",
      url: "",
      size: "0 KB",
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    },
  ];

  const allAssets = assets.length > 0 ? assets : mockAssets;

  const filteredAssets = allAssets.filter((asset) => {
    const matchesSearch = asset.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === "all" || asset.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const getAssetIcon = (type: string) => {
    switch (type) {
      case "video":
        return FileVideo;
      case "audio":
        return FileAudio;
      case "image":
        return FileImage;
      case "text":
        return Type;
      default:
        return FileVideo;
    }
  };

  const getAssetColor = (type: string) => {
    switch (type) {
      case "video":
        return "bg-blue-500";
      case "audio":
        return "bg-green-500";
      case "image":
        return "bg-purple-500";
      case "text":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatFileSize = (size: string) => {
    return size;
  };

  const formatDuration = (duration?: number) => {
    if (!duration) return "";
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className={cn("h-full flex flex-col", className)}>
      {/* Asset Controls */}
      <div className="p-4 border-b border-border space-y-3">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAssetImport?.("all")}
          >
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <div className="flex flex-wrap gap-1">
            {["all", "video", "audio", "image", "text"].map((type) => (
              <Badge
                key={type}
                variant={filterType === type ? "default" : "secondary"}
                className="cursor-pointer text-xs"
                onClick={() => setFilterType(type)}
              >
                {type === "all"
                  ? "All"
                  : type.charAt(0).toUpperCase() + type.slice(1)}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Assets List */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-2">
          {filteredAssets.map((asset) => {
            const IconComponent = getAssetIcon(asset.type);

            return (
              <Card
                key={asset.id}
                className="p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                draggable
                onClick={() => onAssetSelect?.(asset)}
                onDragStart={(e) => {
                  e.dataTransfer.setData("text/plain", JSON.stringify(asset));
                }}
              >
                <div className="flex items-center space-x-3">
                  {/* Asset Thumbnail/Icon */}
                  <div className="relative">
                    {asset.thumbnail ? (
                      <img
                        src={asset.thumbnail}
                        alt={asset.name}
                        className="w-16 h-12 object-cover rounded"
                      />
                    ) : (
                      <div
                        className={cn(
                          "w-16 h-12 rounded flex items-center justify-center",
                          getAssetColor(asset.type)
                        )}
                      >
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                    )}

                    {/* Duration Badge */}
                    {asset.duration && (
                      <Badge
                        variant="secondary"
                        className="absolute bottom-0 right-0 text-xs px-1 py-0"
                      >
                        {formatDuration(asset.duration)}
                      </Badge>
                    )}
                  </div>

                  {/* Asset Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">
                      {asset.name}
                    </h4>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <span className="capitalize">{asset.type}</span>
                      <span>•</span>
                      <span>{formatFileSize(asset.size)}</span>
                      {asset.duration && (
                        <>
                          <span>•</span>
                          <span>{formatDuration(asset.duration)}</span>
                        </>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {asset.createdAt.toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}

          {filteredAssets.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <IconComponent className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No assets found</p>
              <p className="text-xs mt-1">
                {searchQuery
                  ? "Try adjusting your search terms"
                  : "Import some media files to get started"}
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default VideoEditorAssets;
