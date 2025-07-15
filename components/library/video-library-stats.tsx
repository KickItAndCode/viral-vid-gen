"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Video,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Eye,
  Heart,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface VideoLibraryStatsData {
  total: number;
  completed: number;
  generating: number;
  failed: number;
  totalViews: number;
  totalLikes: number;
  averageViralScore: number;
}

export interface VideoLibraryStatsProps {
  /** Statistics data */
  stats: VideoLibraryStatsData;
  /** Custom CSS class */
  className?: string;
}

export const VideoLibraryStats = ({
  stats,
  className,
}: VideoLibraryStatsProps) => {
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toLocaleString();
  };

  const statCards = [
    {
      title: "Total Videos",
      value: stats.total,
      icon: Video,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Completed",
      value: stats.completed,
      icon: CheckCircle2,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Generating",
      value: stats.generating,
      icon: Loader2,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Failed",
      value: stats.failed,
      icon: AlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "Total Views",
      value: formatNumber(stats.totalViews),
      icon: Eye,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Total Likes",
      value: formatNumber(stats.totalLikes),
      icon: Heart,
      color: "text-pink-600",
      bgColor: "bg-pink-50",
    },
    {
      title: "Avg Viral Score",
      value: Math.round(stats.averageViralScore),
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  return (
    <div
      className={cn(
        "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4",
        className
      )}
    >
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="p-4">
            <div className="flex items-center space-x-3">
              <div className={cn("p-2 rounded-lg", stat.bgColor)}>
                <Icon className={cn("h-5 w-5", stat.color)} />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.title}</p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default VideoLibraryStats;
