"use client";

import { formatDistanceToNow } from "date-fns";
import {
  Clock,
  Users,
  Heart,
  Share,
  MessageCircle,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { Doc } from "@/convex/_generated/dataModel";
import { ViralScoreIndicator } from "./viral-score-indicator";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Trend = Doc<"trends">;

interface TrendCardProps {
  trend: Trend;
  onSelect?: (trend: Trend) => void;
  variant?: "default" | "compact" | "featured";
  showCreateButton?: boolean;
  className?: string;
}

export function TrendCard({
  trend,
  onSelect,
  variant = "default",
  showCreateButton = true,
  className,
}: TrendCardProps) {
  const handleCardClick = () => {
    onSelect?.(trend);
  };

  const handleCreateVideo = (e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Integrate with video creation wizard
    console.log("Create video for trend:", trend.title);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getPlatformIcon = (platform: string) => {
    // Return platform-specific styling
    const platformConfig = {
      reddit: {
        bg: "bg-orange-500/10",
        text: "text-orange-500",
        border: "border-orange-500/20",
      },
      twitter: {
        bg: "bg-blue-500/10",
        text: "text-blue-500",
        border: "border-blue-500/20",
      },
      tiktok: {
        bg: "bg-pink-500/10",
        text: "text-pink-500",
        border: "border-pink-500/20",
      },
      youtube: {
        bg: "bg-red-500/10",
        text: "text-red-500",
        border: "border-red-500/20",
      },
      manual: {
        bg: "bg-purple-500/10",
        text: "text-purple-500",
        border: "border-purple-500/20",
      },
    };
    return (
      platformConfig[platform as keyof typeof platformConfig] ||
      platformConfig.manual
    );
  };

  const platformStyle = getPlatformIcon(trend.platform);

  if (variant === "compact") {
    return (
      <Card
        className={cn(
          "cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.02]",
          className
        )}
        onClick={handleCardClick}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <ViralScoreIndicator score={trend.viralScore} size="sm" />
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs",
                    platformStyle.text,
                    platformStyle.bg,
                    platformStyle.border
                  )}
                >
                  {trend.platform}
                </Badge>
              </div>
              <h3 className="font-semibold text-sm line-clamp-2 mb-1">
                {trend.title}
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {trend.description}
              </p>
            </div>
            {showCreateButton && (
              <Button size="sm" variant="outline" onClick={handleCreateVideo}>
                <Sparkles className="h-3 w-3" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === "featured") {
    return (
      <Card
        className={cn(
          "cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02] bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20",
          className
        )}
        onClick={handleCardClick}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <ViralScoreIndicator score={trend.viralScore} size="lg" />
                <Badge variant="secondary" className="font-medium">
                  Featured
                </Badge>
              </div>
              <h3 className="text-xl font-bold line-clamp-2 mb-2">
                {trend.title}
              </h3>
              <p className="text-muted-foreground line-clamp-3">
                {trend.description}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4">
            {/* Enhanced engagement metrics */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  {formatNumber(
                    trend.engagementMetrics.views ||
                      trend.engagementMetrics.likes ||
                      0
                  )}
                </span>
                <span className="text-muted-foreground">views</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-red-500" />
                <span className="font-medium">
                  {formatNumber(
                    trend.engagementMetrics.likes ||
                      trend.engagementMetrics.upvotes ||
                      0
                  )}
                </span>
                <span className="text-muted-foreground">likes</span>
              </div>
            </div>

            {showCreateButton && (
              <Button className="w-full" onClick={handleCreateVideo}>
                <Sparkles className="h-4 w-4 mr-2" />
                Create Viral Video
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default variant
  return (
    <Card
      className={cn(
        "cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02]",
        className
      )}
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <ViralScoreIndicator score={trend.viralScore} size="sm" />
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(trend.createdAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
            <h3 className="font-semibold text-lg line-clamp-2 mb-2">
              {trend.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {trend.description}
            </p>
          </div>

          {trend.trending && (
            <Badge variant="secondary" className="shrink-0">
              <Clock className="h-3 w-3 mr-1" />
              Trending
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {/* Platform and Category */}
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={cn(
              "text-xs",
              platformStyle.text,
              platformStyle.bg,
              platformStyle.border
            )}
          >
            {trend.platform}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {trend.category}
          </Badge>
        </div>

        {/* Engagement Metrics */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            {trend.engagementMetrics.views && (
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>{formatNumber(trend.engagementMetrics.views)}</span>
              </div>
            )}

            {(trend.engagementMetrics.likes ||
              trend.engagementMetrics.upvotes) && (
              <div className="flex items-center gap-1">
                <Heart className="h-3 w-3" />
                <span>
                  {formatNumber(
                    trend.engagementMetrics.likes ||
                      trend.engagementMetrics.upvotes ||
                      0
                  )}
                </span>
              </div>
            )}

            {(trend.engagementMetrics.shares ||
              trend.engagementMetrics.retweets) && (
              <div className="flex items-center gap-1">
                <Share className="h-3 w-3" />
                <span>
                  {formatNumber(
                    trend.engagementMetrics.shares ||
                      trend.engagementMetrics.retweets ||
                      0
                  )}
                </span>
              </div>
            )}

            {(trend.engagementMetrics.comments ||
              trend.engagementMetrics.replies) && (
              <div className="flex items-center gap-1">
                <MessageCircle className="h-3 w-3" />
                <span>
                  {formatNumber(
                    trend.engagementMetrics.comments ||
                      trend.engagementMetrics.replies ||
                      0
                  )}
                </span>
              </div>
            )}
          </div>

          {trend.sourceUrl && (
            <a
              href={trend.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-primary hover:text-primary/80 transition-colors"
            >
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>

        {/* Tags */}
        {trend.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {trend.tags.slice(0, 3).map((tag, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="text-xs px-2 py-0.5"
              >
                #{tag}
              </Badge>
            ))}
            {trend.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs px-2 py-0.5">
                +{trend.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Create Video Button */}
        {showCreateButton && (
          <Button size="sm" className="w-full" onClick={handleCreateVideo}>
            <Sparkles className="h-4 w-4 mr-2" />
            Create Video
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
