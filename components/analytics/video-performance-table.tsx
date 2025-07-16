"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  formatMetricValue,
  getPlatformColor,
  getPlatformLabel,
} from "@/lib/hooks/use-analytics";
import {
  Play,
  Search,
  Filter,
  ChevronUp,
  ChevronDown,
  ExternalLink,
  TrendingUp,
  TrendingDown,
  Minus,
  Eye,
  Heart,
  Share2,
  MessageCircle,
  Calendar,
  Clock,
} from "lucide-react";

interface VideoPerformanceData {
  id: string;
  title: string;
  thumbnail: string;
  createdAt: string;
  duration: number;
  platforms: {
    platform: string;
    views: number;
    likes: number;
    shares: number;
    comments: number;
    engagementRate: number;
    status: "published" | "processing" | "draft" | "failed";
  }[];
  totalViews: number;
  totalLikes: number;
  totalShares: number;
  totalComments: number;
  overallEngagement: number;
  viralScore: number;
  trendDirection: "up" | "down" | "stable";
  trendValue: number;
}

interface VideoPerformanceTableProps {
  videos: VideoPerformanceData[];
  loading?: boolean;
  className?: string;
}

export function VideoPerformanceTable({
  videos,
  loading = false,
  className,
}: VideoPerformanceTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<
    "views" | "engagement" | "viral" | "date"
  >("views");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [platformFilter, setPlatformFilter] = useState<string>("all");

  // Mock data for development
  const mockVideos: VideoPerformanceData[] = [
    {
      id: "video-1",
      title: "How to Build a Viral TikTok Video in 2024",
      thumbnail: "/api/placeholder/120/68",
      createdAt: "2024-01-15T10:30:00Z",
      duration: 28,
      platforms: [
        {
          platform: "tiktok",
          views: 45230,
          likes: 3420,
          shares: 890,
          comments: 567,
          engagementRate: 10.8,
          status: "published",
        },
        {
          platform: "instagram",
          views: 23450,
          likes: 1890,
          shares: 345,
          comments: 234,
          engagementRate: 9.2,
          status: "published",
        },
        {
          platform: "youtube",
          views: 12340,
          likes: 890,
          shares: 123,
          comments: 156,
          engagementRate: 8.5,
          status: "published",
        },
      ],
      totalViews: 81020,
      totalLikes: 6200,
      totalShares: 1358,
      totalComments: 957,
      overallEngagement: 9.8,
      viralScore: 87,
      trendDirection: "up",
      trendValue: 15.3,
    },
    {
      id: "video-2",
      title: "AI Video Generation: The Future is Here",
      thumbnail: "/api/placeholder/120/68",
      createdAt: "2024-01-10T14:15:00Z",
      duration: 25,
      platforms: [
        {
          platform: "youtube",
          views: 67890,
          likes: 4560,
          shares: 1234,
          comments: 789,
          engagementRate: 9.8,
          status: "published",
        },
        {
          platform: "twitter",
          views: 34560,
          likes: 2340,
          shares: 890,
          comments: 456,
          engagementRate: 10.6,
          status: "published",
        },
      ],
      totalViews: 102450,
      totalLikes: 6900,
      totalShares: 2124,
      totalComments: 1245,
      overallEngagement: 10.2,
      viralScore: 92,
      trendDirection: "up",
      trendValue: 22.7,
    },
    {
      id: "video-3",
      title: "5 Secrets to Instagram Reels Success",
      thumbnail: "/api/placeholder/120/68",
      createdAt: "2024-01-05T09:45:00Z",
      duration: 31,
      platforms: [
        {
          platform: "instagram",
          views: 56780,
          likes: 3890,
          shares: 567,
          comments: 345,
          engagementRate: 8.4,
          status: "published",
        },
        {
          platform: "facebook",
          views: 23450,
          likes: 1230,
          shares: 234,
          comments: 123,
          engagementRate: 7.1,
          status: "published",
        },
      ],
      totalViews: 80230,
      totalLikes: 5120,
      totalShares: 801,
      totalComments: 468,
      overallEngagement: 7.9,
      viralScore: 74,
      trendDirection: "down",
      trendValue: -5.2,
    },
  ];

  const videoData = videos.length > 0 ? videos : mockVideos;

  // Filter and sort videos
  const filteredVideos = videoData
    .filter((video) => {
      const matchesSearch = video.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesPlatform =
        platformFilter === "all" ||
        video.platforms.some((p) => p.platform === platformFilter);
      return matchesSearch && matchesPlatform;
    })
    .sort((a, b) => {
      let aVal: number, bVal: number;
      switch (sortBy) {
        case "views":
          aVal = a.totalViews;
          bVal = b.totalViews;
          break;
        case "engagement":
          aVal = a.overallEngagement;
          bVal = b.overallEngagement;
          break;
        case "viral":
          aVal = a.viralScore;
          bVal = b.viralScore;
          break;
        case "date":
          aVal = new Date(a.createdAt).getTime();
          bVal = new Date(b.createdAt).getTime();
          break;
        default:
          aVal = a.totalViews;
          bVal = b.totalViews;
      }

      return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
    });

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case "up":
        return <TrendingUp className="h-3 w-3 text-green-500" />;
      case "down":
        return <TrendingDown className="h-3 w-3 text-red-500" />;
      default:
        return <Minus className="h-3 w-3 text-gray-500" />;
    }
  };

  const getTrendColor = (direction: string) => {
    switch (direction) {
      case "up":
        return "text-green-500";
      case "down":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const getViralScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-100";
    if (score >= 60) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <Card className={cn("", className)}>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-48" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Play className="h-5 w-5 mr-2" />
          Video Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            value={sortBy}
            onValueChange={(value: any) => setSortBy(value)}
          >
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="views">Views</SelectItem>
              <SelectItem value="engagement">Engagement</SelectItem>
              <SelectItem value="viral">Viral Score</SelectItem>
              <SelectItem value="date">Date</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setSortDirection(sortDirection === "asc" ? "desc" : "asc")
            }
            className="flex items-center"
          >
            {sortDirection === "asc" ? (
              <ChevronUp className="h-4 w-4 mr-1" />
            ) : (
              <ChevronDown className="h-4 w-4 mr-1" />
            )}
            {sortDirection === "asc" ? "Asc" : "Desc"}
          </Button>
          <Select value={platformFilter} onValueChange={setPlatformFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="tiktok">TikTok</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="youtube">YouTube</SelectItem>
              <SelectItem value="twitter">Twitter</SelectItem>
              <SelectItem value="facebook">Facebook</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Video List */}
        <div className="space-y-4">
          {filteredVideos.map((video) => (
            <div
              key={video.id}
              className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Video Info */}
                <div className="flex items-start space-x-4 flex-1">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-20 h-11 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">
                      {video.title}
                    </h3>
                    <div className="flex items-center space-x-4 mt-1 text-xs text-muted-foreground">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(video.createdAt)}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDuration(video.duration)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Platforms */}
                <div className="flex flex-wrap gap-2">
                  {video.platforms.map((platform) => (
                    <Badge
                      key={platform.platform}
                      variant="outline"
                      className="text-xs"
                      style={{
                        borderColor: getPlatformColor(platform.platform),
                        color: getPlatformColor(platform.platform),
                      }}
                    >
                      {getPlatformLabel(platform.platform)}
                    </Badge>
                  ))}
                </div>

                {/* Performance Metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:w-80">
                  <div className="text-center">
                    <div className="flex items-center justify-center text-xs text-muted-foreground mb-1">
                      <Eye className="h-3 w-3 mr-1" />
                      Views
                    </div>
                    <div className="font-semibold text-sm">
                      {formatMetricValue(video.totalViews)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center text-xs text-muted-foreground mb-1">
                      <Heart className="h-3 w-3 mr-1" />
                      Likes
                    </div>
                    <div className="font-semibold text-sm">
                      {formatMetricValue(video.totalLikes)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center text-xs text-muted-foreground mb-1">
                      <Share2 className="h-3 w-3 mr-1" />
                      Shares
                    </div>
                    <div className="font-semibold text-sm">
                      {formatMetricValue(video.totalShares)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center text-xs text-muted-foreground mb-1">
                      <MessageCircle className="h-3 w-3 mr-1" />
                      Comments
                    </div>
                    <div className="font-semibold text-sm">
                      {formatMetricValue(video.totalComments)}
                    </div>
                  </div>
                </div>

                {/* Viral Score & Trend */}
                <div className="flex items-center justify-between lg:justify-end lg:w-32 gap-3">
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground mb-1">
                      Viral Score
                    </div>
                    <Badge
                      className={cn(
                        "text-xs font-bold",
                        getViralScoreColor(video.viralScore)
                      )}
                    >
                      {video.viralScore}
                    </Badge>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground mb-1">
                      Trend
                    </div>
                    <div className="flex items-center justify-center">
                      {getTrendIcon(video.trendDirection)}
                      <span
                        className={cn(
                          "text-xs font-semibold ml-1",
                          getTrendColor(video.trendDirection)
                        )}
                      >
                        {video.trendValue > 0 ? "+" : ""}
                        {video.trendValue.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredVideos.length === 0 && (
          <div className="text-center py-8">
            <div className="text-muted-foreground">
              No videos found matching your criteria.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
