"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  X,
  ExternalLink,
  Sparkles,
  Calendar,
  Globe,
  Hash,
  Users,
  Heart,
  Share,
  MessageCircle,
} from "lucide-react";
import { Doc } from "@/convex/_generated/dataModel";
import { ViralScoreIndicator, ViralScoreBar } from "./viral-score-indicator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

type Trend = Doc<"trends">;

interface TrendPreviewProps {
  trend: Trend | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateVideo?: (trend: Trend) => void;
}

export function TrendPreview({
  trend,
  open,
  onOpenChange,
  onCreateVideo,
}: TrendPreviewProps) {
  if (!trend) return null;

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getPlatformConfig = (platform: string) => {
    const configs = {
      reddit: {
        name: "Reddit",
        color: "bg-orange-500",
        textColor: "text-orange-500",
      },
      twitter: {
        name: "Twitter/X",
        color: "bg-blue-500",
        textColor: "text-blue-500",
      },
      tiktok: {
        name: "TikTok",
        color: "bg-pink-500",
        textColor: "text-pink-500",
      },
      youtube: {
        name: "YouTube",
        color: "bg-red-500",
        textColor: "text-red-500",
      },
      manual: {
        name: "Manual",
        color: "bg-purple-500",
        textColor: "text-purple-500",
      },
    };
    return configs[platform as keyof typeof configs] || configs.manual;
  };

  const platformConfig = getPlatformConfig(trend.platform);

  const handleCreateVideo = () => {
    onCreateVideo?.(trend);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0">
        <ScrollArea className="max-h-[90vh]">
          <div className="p-6">
            {/* Header */}
            <DialogHeader className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <ViralScoreIndicator score={trend.viralScore} size="lg" />
                    {trend.trending && (
                      <Badge
                        variant="secondary"
                        className="bg-green-500/10 text-green-500 border-green-500/20"
                      >
                        Trending Now
                      </Badge>
                    )}
                  </div>
                  <DialogTitle className="text-2xl font-bold leading-tight mb-2">
                    {trend.title}
                  </DialogTitle>
                  <p className="text-muted-foreground text-base leading-relaxed">
                    {trend.description}
                  </p>
                </div>
              </div>
            </DialogHeader>

            <Separator className="my-6" />

            {/* Metadata */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Platform:</span>
                  <Badge
                    variant="outline"
                    className={cn("text-xs", platformConfig.textColor)}
                  >
                    {platformConfig.name}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Category:</span>
                  <Badge variant="outline" className="text-xs">
                    {trend.category}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Created:</span>
                  <span className="text-muted-foreground">
                    {formatDistanceToNow(new Date(trend.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>

                {trend.sourceUrl && (
                  <div className="flex items-center gap-2 text-sm">
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={trend.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80 transition-colors font-medium"
                    >
                      View Source
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Viral Score Breakdown */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Viral Score Breakdown</h3>
              <div className="space-y-3">
                <ViralScoreBar score={trend.viralScore} height="md" />
                <div className="text-xs text-muted-foreground">
                  Score calculated based on engagement metrics, platform reach,
                  and trending velocity
                </div>
              </div>
            </div>

            {/* Engagement Metrics */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Engagement Metrics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {trend.engagementMetrics.views && (
                  <div className="text-center p-3 border rounded-lg">
                    <Users className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                    <div className="font-semibold">
                      {formatNumber(trend.engagementMetrics.views)}
                    </div>
                    <div className="text-xs text-muted-foreground">Views</div>
                  </div>
                )}

                {(trend.engagementMetrics.likes ||
                  trend.engagementMetrics.upvotes) && (
                  <div className="text-center p-3 border rounded-lg">
                    <Heart className="h-5 w-5 mx-auto mb-1 text-red-500" />
                    <div className="font-semibold">
                      {formatNumber(
                        trend.engagementMetrics.likes ||
                          trend.engagementMetrics.upvotes ||
                          0
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {trend.platform === "reddit" ? "Upvotes" : "Likes"}
                    </div>
                  </div>
                )}

                {(trend.engagementMetrics.shares ||
                  trend.engagementMetrics.retweets) && (
                  <div className="text-center p-3 border rounded-lg">
                    <Share className="h-5 w-5 mx-auto mb-1 text-blue-500" />
                    <div className="font-semibold">
                      {formatNumber(
                        trend.engagementMetrics.shares ||
                          trend.engagementMetrics.retweets ||
                          0
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {trend.platform === "twitter" ? "Retweets" : "Shares"}
                    </div>
                  </div>
                )}

                {(trend.engagementMetrics.comments ||
                  trend.engagementMetrics.replies) && (
                  <div className="text-center p-3 border rounded-lg">
                    <MessageCircle className="h-5 w-5 mx-auto mb-1 text-green-500" />
                    <div className="font-semibold">
                      {formatNumber(
                        trend.engagementMetrics.comments ||
                          trend.engagementMetrics.replies ||
                          0
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {trend.platform === "twitter" ? "Replies" : "Comments"}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            {trend.tags.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Related Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {trend.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Platform-specific metadata */}
            {trend.platformMetadata && (
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Platform Details</h3>
                <div className="space-y-2 text-sm">
                  {trend.platformMetadata.subreddit && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Subreddit:</span>
                      <Badge variant="outline" className="text-xs">
                        r/{trend.platformMetadata.subreddit}
                      </Badge>
                    </div>
                  )}
                  {trend.platformMetadata.hashtags &&
                    trend.platformMetadata.hashtags.length > 0 && (
                      <div className="flex items-start gap-2">
                        <span className="font-medium">Hashtags:</span>
                        <div className="flex flex-wrap gap-1">
                          {trend.platformMetadata.hashtags
                            .slice(0, 5)
                            .map((hashtag, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-xs"
                              >
                                #{hashtag}
                              </Badge>
                            ))}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <Button onClick={handleCreateVideo} className="flex-1">
                <Sparkles className="h-4 w-4 mr-2" />
                Create Viral Video
              </Button>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
