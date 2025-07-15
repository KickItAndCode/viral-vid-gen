"use client";

import { useState } from "react";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Play,
  Pause,
  MoreHorizontal,
  Download,
  Share2,
  Edit,
  Copy,
  Trash2,
  Eye,
  Heart,
  MessageCircle,
  TrendingUp,
  Clock,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { VideoLibraryItem } from "./video-library-grid";

export interface VideoCardProps {
  /** Video data */
  video: VideoLibraryItem;
  /** View mode (grid or list) */
  viewMode: "grid" | "list";
  /** Whether the video is selected */
  isSelected?: boolean;
  /** Callback for video selection */
  onSelect?: () => void;
  /** Callback for video actions */
  onAction?: (action: string) => void;
  /** Whether to show selection checkbox */
  showSelection?: boolean;
  /** Custom CSS class */
  className?: string;
}

export const VideoCard = ({
  video,
  viewMode,
  isSelected = false,
  onSelect,
  onAction,
  showSelection = true,
  className,
}: VideoCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Format duration
  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Get status color and icon
  const getStatusInfo = (status: VideoLibraryItem["status"]) => {
    switch (status) {
      case "completed":
        return {
          color: "bg-green-100 text-green-800",
          icon: CheckCircle2,
          label: "Completed",
        };
      case "generating":
        return {
          color: "bg-blue-100 text-blue-800",
          icon: Loader2,
          label: "Generating",
        };
      case "failed":
        return {
          color: "bg-red-100 text-red-800",
          icon: AlertCircle,
          label: "Failed",
        };
      case "queued":
        return {
          color: "bg-yellow-100 text-yellow-800",
          icon: Clock,
          label: "Queued",
        };
      default:
        return {
          color: "bg-gray-100 text-gray-800",
          icon: Clock,
          label: "Unknown",
        };
    }
  };

  const statusInfo = getStatusInfo(video.status);
  const StatusIcon = statusInfo.icon;

  // Handle play/pause
  const handlePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(!isPlaying);
  };

  // Handle card click
  const handleCardClick = () => {
    if (video.status === "completed") {
      onAction?.("play");
    }
  };

  // Handle dropdown actions
  const handleAction = (action: string) => {
    onAction?.(action);
  };

  // Grid view card
  if (viewMode === "grid") {
    return (
      <Card
        className={cn(
          "group relative overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg",
          isSelected && "ring-2 ring-blue-500",
          className
        )}
        onClick={handleCardClick}
      >
        {/* Selection checkbox */}
        {showSelection && (
          <div className="absolute top-2 left-2 z-10">
            <Checkbox
              checked={isSelected}
              onCheckedChange={onSelect}
              className="bg-white/80 border-white/80"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}

        {/* Actions dropdown */}
        <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 bg-white/80 hover:bg-white/90"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleAction("play")}>
                <Play className="h-4 w-4 mr-2" />
                Play
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAction("edit")}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAction("duplicate")}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleAction("download")}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAction("share")}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleAction("delete")}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Thumbnail */}
        <div className="relative aspect-video bg-gray-100 overflow-hidden">
          {video.thumbnailUrl && !imageError ? (
            <Image
              src={video.thumbnailUrl}
              alt={video.title}
              fill
              className={cn(
                "object-cover transition-opacity duration-200",
                imageLoaded ? "opacity-100" : "opacity-0"
              )}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-200">
              <Play className="h-12 w-12 text-gray-400" />
            </div>
          )}

          {/* Play overlay */}
          {video.status === "completed" && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors">
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white text-black"
                onClick={handlePlayPause}
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5" />
                )}
              </Button>
            </div>
          )}

          {/* Duration */}
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
            {formatDuration(video.duration)}
          </div>

          {/* Generation progress */}
          {video.status === "generating" && (
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/70">
              <Progress value={65} className="h-2" />
              <p className="text-white text-xs mt-1">Generating video...</p>
            </div>
          )}
        </div>

        {/* Content */}
        <CardContent className="p-4">
          <div className="space-y-2">
            {/* Title */}
            <h3 className="font-semibold text-sm line-clamp-2 leading-tight">
              {video.title}
            </h3>

            {/* Status */}
            <div className="flex items-center space-x-2">
              <Badge
                variant="secondary"
                className={cn("text-xs", statusInfo.color)}
              >
                <StatusIcon className="h-3 w-3 mr-1" />
                {statusInfo.label}
              </Badge>
              {video.platform && (
                <Badge variant="outline" className="text-xs">
                  {video.platform}
                </Badge>
              )}
            </div>

            {/* Metadata */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {formatDistanceToNow(video.createdAt, { addSuffix: true })}
              </span>
              {video.viralScore && (
                <div className="flex items-center space-x-1">
                  <TrendingUp className="h-3 w-3" />
                  <span>{Math.round(video.viralScore)}</span>
                </div>
              )}
            </div>

            {/* Stats */}
            {video.status === "completed" && (
              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                {video.views && (
                  <div className="flex items-center space-x-1">
                    <Eye className="h-3 w-3" />
                    <span>{video.views.toLocaleString()}</span>
                  </div>
                )}
                {video.likes && (
                  <div className="flex items-center space-x-1">
                    <Heart className="h-3 w-3" />
                    <span>{video.likes.toLocaleString()}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // List view card
  return (
    <Card
      className={cn(
        "group relative overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-md",
        isSelected && "ring-2 ring-blue-500",
        className
      )}
      onClick={handleCardClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          {/* Selection checkbox */}
          {showSelection && (
            <Checkbox
              checked={isSelected}
              onCheckedChange={onSelect}
              onClick={(e) => e.stopPropagation()}
            />
          )}

          {/* Thumbnail */}
          <div className="relative w-24 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
            {video.thumbnailUrl && !imageError ? (
              <Image
                src={video.thumbnailUrl}
                alt={video.title}
                fill
                className="object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-200">
                <Play className="h-6 w-6 text-gray-400" />
              </div>
            )}
            <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 py-0.5 rounded">
              {formatDuration(video.duration)}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm line-clamp-1">
                  {video.title}
                </h3>
                {video.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                    {video.description}
                  </p>
                )}

                <div className="flex items-center space-x-2 mt-2">
                  <Badge
                    variant="secondary"
                    className={cn("text-xs", statusInfo.color)}
                  >
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {statusInfo.label}
                  </Badge>
                  {video.platform && (
                    <Badge variant="outline" className="text-xs">
                      {video.platform}
                    </Badge>
                  )}
                  {video.style && (
                    <Badge variant="outline" className="text-xs">
                      {video.style}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 ml-4">
                {video.status === "completed" && (
                  <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                    {video.views && (
                      <div className="flex items-center space-x-1">
                        <Eye className="h-3 w-3" />
                        <span>{video.views.toLocaleString()}</span>
                      </div>
                    )}
                    {video.likes && (
                      <div className="flex items-center space-x-1">
                        <Heart className="h-3 w-3" />
                        <span>{video.likes.toLocaleString()}</span>
                      </div>
                    )}
                    {video.viralScore && (
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="h-3 w-3" />
                        <span>{Math.round(video.viralScore)}</span>
                      </div>
                    )}
                  </div>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleAction("play")}>
                      <Play className="h-4 w-4 mr-2" />
                      Play
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleAction("edit")}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleAction("duplicate")}>
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleAction("download")}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleAction("share")}>
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleAction("delete")}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(video.createdAt, { addSuffix: true })}
              </span>
              {video.status === "generating" && (
                <div className="flex items-center space-x-2">
                  <Progress value={65} className="h-2 w-20" />
                  <span className="text-xs text-muted-foreground">65%</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VideoCard;
