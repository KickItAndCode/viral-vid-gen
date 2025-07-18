"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Play, Download, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Doc } from "@/convex/_generated/dataModel";

export function MVPVideoLibrary() {
  const { isAuthenticated } = useConvexAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Get user's videos with search and filters
  const { data: videos, isLoading } = useQuery(
    convexQuery(api.videos.getUserVideos, {
      searchQuery: searchQuery || undefined,
      status: statusFilter === "all" ? undefined : (statusFilter as any),
    })
  );

  const filteredVideos = videos || [];

  if (!isAuthenticated) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground">Please sign in to view your videos</p>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Simple Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search your videos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="All videos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All videos</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Video Grid */}
      {filteredVideos.length === 0 ? (
        <Card className="p-12 text-center">
          <h3 className="text-lg font-semibold mb-2">No videos found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery || statusFilter !== "all"
              ? "Try adjusting your search or filters"
              : "Create your first video to get started"}
          </p>
          <Button onClick={() => window.location.href = "/dashboard/create"}>
            Create Your First Video
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
}

function VideoCard({ video }: { video: Doc<"videos"> }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/10 text-green-500";
      case "processing":
        return "bg-blue-500/10 text-blue-500";
      case "failed":
        return "bg-red-500/10 text-red-500";
      default:
        return "bg-gray-500/10 text-gray-500";
    }
  };

  return (
    <Card className="overflow-hidden group hover:shadow-lg transition-shadow">
      {/* Video Thumbnail */}
      <div className="relative aspect-video bg-muted">
        {video.thumbnailUrl ? (
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Play className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        
        {/* Status Badge */}
        <Badge 
          className={`absolute top-2 right-2 ${getStatusColor(video.status)}`}
          variant="secondary"
        >
          {video.status}
        </Badge>

        {/* Duration Badge */}
        {video.duration && (
          <Badge 
            className="absolute bottom-2 left-2 bg-black/70 text-white"
            variant="secondary"
          >
            {Math.floor(video.duration)}s
          </Badge>
        )}
      </div>

      {/* Video Info */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold line-clamp-1">{video.title}</h3>
          <p className="text-sm text-muted-foreground">
            {formatDistanceToNow(new Date(video._creationTime), { addSuffix: true })}
          </p>
        </div>

        {/* Platform Badge */}
        {video.platform && (
          <Badge variant="outline" className="text-xs">
            {video.platform}
          </Badge>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {video.status === "completed" && video.videoUrl && (
            <>
              <Button
                size="sm"
                variant="default"
                className="flex-1"
                onClick={() => window.open(video.videoUrl, "_blank")}
              >
                <Play className="h-4 w-4 mr-1" />
                Play
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = video.videoUrl!;
                  link.download = `${video.title}.mp4`;
                  link.click();
                }}
              >
                <Download className="h-4 w-4" />
              </Button>
            </>
          )}
          {video.status === "processing" && (
            <Button size="sm" variant="outline" disabled className="flex-1">
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              Processing...
            </Button>
          )}
          {video.status === "failed" && (
            <Button
              size="sm"
              variant="destructive"
              className="flex-1"
              onClick={() => window.location.href = "/dashboard/create"}
            >
              Retry
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}