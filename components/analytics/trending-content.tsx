"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
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
  TrendingUp,
  Flame,
  Search,
  Filter,
  Eye,
  Heart,
  Share2,
  MessageCircle,
  Calendar,
  Clock,
  ExternalLink,
  Sparkles,
  Target,
  Zap,
  Crown,
  Award,
  Star,
  Bookmark,
  RefreshCw,
} from "lucide-react";

interface TrendingVideo {
  id: string;
  title: string;
  thumbnail: string;
  platform: string;
  views: number;
  likes: number;
  shares: number;
  comments: number;
  engagementRate: number;
  viralScore: number;
  createdAt: string;
  duration: number;
  hashtags: string[];
  category: string;
  trendingRank: number;
  growthRate: number;
  potentialReach: number;
}

interface TrendingHashtag {
  tag: string;
  count: number;
  growth: number;
  category: string;
  platforms: string[];
}

interface TrendingTopic {
  topic: string;
  mentions: number;
  sentiment: "positive" | "negative" | "neutral";
  platforms: string[];
  relatedHashtags: string[];
}

interface TrendingInsights {
  trendingVideos: TrendingVideo[];
  trendingHashtags: TrendingHashtag[];
  trendingTopics: TrendingTopic[];
  recommendations: {
    suggestedHashtags: string[];
    suggestedTopics: string[];
    optimalPostTimes: { hour: number; day: string; score: number }[];
  };
}

interface TrendingContentProps {
  insights: TrendingInsights | null;
  loading?: boolean;
  className?: string;
}

export function TrendingContent({
  insights,
  loading = false,
  className,
}: TrendingContentProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Mock data for development
  const mockInsights: TrendingInsights = {
    trendingVideos: [
      {
        id: "trend-1",
        title: "AI Art Revolution: Creating Masterpieces in Minutes",
        thumbnail: "/api/placeholder/120/68",
        platform: "tiktok",
        views: 2340000,
        likes: 189000,
        shares: 45600,
        comments: 23400,
        engagementRate: 11.2,
        viralScore: 94,
        createdAt: "2024-01-15T14:30:00Z",
        duration: 29,
        hashtags: ["#AI", "#Art", "#Technology", "#Creative"],
        category: "Technology",
        trendingRank: 1,
        growthRate: 156.7,
        potentialReach: 5600000,
      },
      {
        id: "trend-2",
        title: "Quick Morning Routine for Productivity",
        thumbnail: "/api/placeholder/120/68",
        platform: "instagram",
        views: 1890000,
        likes: 145000,
        shares: 34500,
        comments: 18900,
        engagementRate: 10.8,
        viralScore: 89,
        createdAt: "2024-01-14T08:15:00Z",
        duration: 24,
        hashtags: ["#MorningRoutine", "#Productivity", "#Lifestyle"],
        category: "Lifestyle",
        trendingRank: 2,
        growthRate: 134.2,
        potentialReach: 4200000,
      },
      {
        id: "trend-3",
        title: "Cooking Hack: Perfect Pasta Every Time",
        thumbnail: "/api/placeholder/120/68",
        platform: "youtube",
        views: 1560000,
        likes: 98000,
        shares: 23400,
        comments: 12300,
        engagementRate: 8.7,
        viralScore: 82,
        createdAt: "2024-01-13T19:45:00Z",
        duration: 31,
        hashtags: ["#Cooking", "#FoodHacks", "#Recipe"],
        category: "Food",
        trendingRank: 3,
        growthRate: 98.5,
        potentialReach: 3400000,
      },
    ],
    trendingHashtags: [
      {
        tag: "#AI",
        count: 45600,
        growth: 234.5,
        category: "Technology",
        platforms: ["tiktok", "instagram", "youtube"],
      },
      {
        tag: "#Productivity",
        count: 34500,
        growth: 189.2,
        category: "Lifestyle",
        platforms: ["instagram", "youtube"],
      },
      {
        tag: "#Recipe",
        count: 28900,
        growth: 156.7,
        category: "Food",
        platforms: ["tiktok", "youtube"],
      },
      {
        tag: "#Motivation",
        count: 23400,
        growth: 134.8,
        category: "Lifestyle",
        platforms: ["instagram", "tiktok"],
      },
      {
        tag: "#Technology",
        count: 19800,
        growth: 123.4,
        category: "Technology",
        platforms: ["youtube", "twitter"],
      },
    ],
    trendingTopics: [
      {
        topic: "Artificial Intelligence in Daily Life",
        mentions: 156700,
        sentiment: "positive",
        platforms: ["tiktok", "instagram", "youtube"],
        relatedHashtags: ["#AI", "#Technology", "#Future", "#Innovation"],
      },
      {
        topic: "Sustainable Living Tips",
        mentions: 134500,
        sentiment: "positive",
        platforms: ["instagram", "youtube"],
        relatedHashtags: ["#Sustainability", "#EcoFriendly", "#GreenLiving"],
      },
      {
        topic: "Remote Work Productivity",
        mentions: 98700,
        sentiment: "neutral",
        platforms: ["linkedin", "youtube"],
        relatedHashtags: ["#RemoteWork", "#Productivity", "#WorkFromHome"],
      },
    ],
    recommendations: {
      suggestedHashtags: [
        "#AI",
        "#Productivity",
        "#Recipe",
        "#Motivation",
        "#Technology",
      ],
      suggestedTopics: [
        "AI Tools",
        "Morning Routines",
        "Quick Recipes",
        "Productivity Hacks",
      ],
      optimalPostTimes: [
        { hour: 18, day: "Monday", score: 94 },
        { hour: 12, day: "Tuesday", score: 89 },
        { hour: 15, day: "Wednesday", score: 87 },
        { hour: 19, day: "Thursday", score: 92 },
        { hour: 14, day: "Friday", score: 85 },
      ],
    },
  };

  const trendingData = insights || mockInsights;

  const filteredVideos = trendingData.trendingVideos.filter((video) => {
    const matchesSearch =
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.hashtags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );
    const matchesPlatform =
      selectedPlatform === "all" || video.platform === selectedPlatform;
    const matchesCategory =
      selectedCategory === "all" || video.category === selectedCategory;
    return matchesSearch && matchesPlatform && matchesCategory;
  });

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "text-green-600 bg-green-100";
      case "negative":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "📈";
      case "negative":
        return "📉";
      default:
        return "📊";
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 2:
        return <Award className="h-4 w-4 text-gray-400" />;
      case 3:
        return <Star className="h-4 w-4 text-amber-600" />;
      default:
        return <Target className="h-4 w-4 text-muted-foreground" />;
    }
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
      hour: "numeric",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className={cn("space-y-6", className)}>
        <Card>
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-6 w-48" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Trending Videos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Flame className="h-5 w-5 mr-2" />
            Trending Videos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search trending videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={selectedPlatform}
              onValueChange={setSelectedPlatform}
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                <SelectItem value="tiktok">TikTok</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="youtube">YouTube</SelectItem>
                <SelectItem value="twitter">Twitter</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Technology">Technology</SelectItem>
                <SelectItem value="Lifestyle">Lifestyle</SelectItem>
                <SelectItem value="Food">Food</SelectItem>
                <SelectItem value="Entertainment">Entertainment</SelectItem>
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
                  {/* Rank & Thumbnail */}
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                      {getRankIcon(video.trendingRank)}
                    </div>
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-24 h-14 object-cover rounded"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-sm">{video.title}</h3>
                      <Badge
                        variant="outline"
                        style={{
                          borderColor: getPlatformColor(video.platform),
                          color: getPlatformColor(video.platform),
                        }}
                      >
                        {getPlatformLabel(video.platform)}
                      </Badge>
                    </div>

                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(video.createdAt)}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDuration(video.duration)}
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {video.category}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {video.hashtags.slice(0, 4).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:w-80">
                    <div className="text-center">
                      <div className="flex items-center justify-center text-xs text-muted-foreground mb-1">
                        <Eye className="h-3 w-3 mr-1" />
                        Views
                      </div>
                      <div className="font-semibold text-sm">
                        {formatMetricValue(video.views)}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center text-xs text-muted-foreground mb-1">
                        <Heart className="h-3 w-3 mr-1" />
                        Likes
                      </div>
                      <div className="font-semibold text-sm">
                        {formatMetricValue(video.likes)}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center text-xs text-muted-foreground mb-1">
                        <Share2 className="h-3 w-3 mr-1" />
                        Shares
                      </div>
                      <div className="font-semibold text-sm">
                        {formatMetricValue(video.shares)}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center text-xs text-muted-foreground mb-1">
                        <Zap className="h-3 w-3 mr-1" />
                        Viral Score
                      </div>
                      <div className="font-semibold text-sm text-green-600">
                        {video.viralScore}
                      </div>
                    </div>
                  </div>

                  {/* Growth Rate */}
                  <div className="text-center lg:w-24">
                    <div className="text-xs text-muted-foreground mb-1">
                      Growth
                    </div>
                    <div className="flex items-center justify-center">
                      <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                      <span className="text-sm font-semibold text-green-500">
                        +{video.growthRate.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Hashtags & Topics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Sparkles className="h-5 w-5 mr-2" />
              Trending Hashtags
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {trendingData.trendingHashtags.map((hashtag, index) => (
                <div
                  key={hashtag.tag}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-lg font-bold text-primary">
                      #{index + 1}
                    </div>
                    <div>
                      <div className="font-semibold">{hashtag.tag}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatMetricValue(hashtag.count)} posts
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center text-green-600">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      <span className="text-sm font-semibold">
                        +{hashtag.growth.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex gap-1 mt-1">
                      {hashtag.platforms.slice(0, 3).map((platform) => (
                        <div
                          key={platform}
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: getPlatformColor(platform),
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Trending Topics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {trendingData.trendingTopics.map((topic, index) => (
                <div key={topic.topic} className="border rounded-lg p-3">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-sm">{topic.topic}</h4>
                    <Badge
                      className={cn(
                        "text-xs",
                        getSentimentColor(topic.sentiment)
                      )}
                    >
                      {getSentimentIcon(topic.sentiment)} {topic.sentiment}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">
                    {formatMetricValue(topic.mentions)} mentions
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {topic.relatedHashtags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bookmark className="h-5 w-5 mr-2" />
            Content Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Suggested Hashtags</h4>
              <div className="flex flex-wrap gap-2">
                {trendingData.recommendations.suggestedHashtags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Suggested Topics</h4>
              <div className="space-y-2">
                {trendingData.recommendations.suggestedTopics.map((topic) => (
                  <div
                    key={topic}
                    className="text-sm p-2 bg-muted rounded cursor-pointer hover:bg-muted/80"
                  >
                    {topic}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Optimal Post Times</h4>
              <div className="space-y-2">
                {trendingData.recommendations.optimalPostTimes.map((time) => (
                  <div
                    key={`${time.day}-${time.hour}`}
                    className="flex items-center justify-between text-sm"
                  >
                    <span>
                      {time.day} {time.hour}:00
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {time.score} score
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
