"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  getPlatformColor,
  getPlatformLabel,
  formatMetricValue,
  calculateEngagementRate,
} from "@/lib/hooks/use-analytics";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Globe, TrendingUp, Users, Zap } from "lucide-react";

interface PlatformComparisonProps {
  data: Record<string, any>;
  loading?: boolean;
  className?: string;
}

export function PlatformComparison({
  data,
  loading = false,
  className,
}: PlatformComparisonProps) {
  // Mock data for development
  const mockData = {
    youtube: {
      views: 45230,
      likes: 3420,
      shares: 890,
      comments: 1250,
      engagementRate: 12.3,
    },
    tiktok: {
      views: 78940,
      likes: 6780,
      shares: 2340,
      comments: 890,
      engagementRate: 12.8,
    },
    instagram: {
      views: 34560,
      likes: 2890,
      shares: 1230,
      comments: 670,
      engagementRate: 13.9,
    },
    twitter: {
      views: 23450,
      likes: 1890,
      shares: 890,
      comments: 450,
      engagementRate: 13.1,
    },
    facebook: {
      views: 19780,
      likes: 1230,
      shares: 560,
      comments: 340,
      engagementRate: 10.8,
    },
  };

  const platformData = Object.keys(data).length > 0 ? data : mockData;

  // Convert to array for charts
  const chartData = Object.entries(platformData).map(([platform, metrics]) => ({
    platform: getPlatformLabel(platform),
    platformKey: platform,
    ...metrics,
  }));

  // Sort by views for ranking
  const sortedPlatforms = chartData.sort((a, b) => b.views - a.views);

  // Calculate totals
  const totals = Object.values(platformData).reduce(
    (acc: any, platform: any) => ({
      views: acc.views + platform.views,
      likes: acc.likes + platform.likes,
      shares: acc.shares + platform.shares,
      comments: acc.comments + platform.comments,
    }),
    { views: 0, likes: 0, shares: 0, comments: 0 }
  );

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
            <Skeleton className="w-full h-80" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Platform Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart className="h-5 w-5 mr-2" />
            Platform Performance Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="platform" />
              <YAxis tickFormatter={(value) => formatMetricValue(value)} />
              <Tooltip
                formatter={(value) => formatMetricValue(value as number)}
              />
              <Bar dataKey="views" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Platform Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Top Performing Platforms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sortedPlatforms.map((platform, index) => (
                <div
                  key={platform.platformKey}
                  className="flex items-center space-x-4"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                    <span className="text-sm font-bold">#{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{platform.platform}</span>
                      <span className="text-sm text-muted-foreground">
                        {formatMetricValue(platform.views)} views
                      </span>
                    </div>
                    <Progress
                      value={(platform.views / totals.views) * 100}
                      className="h-2"
                      style={{
                        backgroundColor:
                          getPlatformColor(platform.platformKey) + "20",
                      }}
                    />
                  </div>
                  <Badge
                    variant="outline"
                    style={{
                      borderColor: getPlatformColor(platform.platformKey),
                      color: getPlatformColor(platform.platformKey),
                    }}
                  >
                    {((platform.views / totals.views) * 100).toFixed(1)}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="h-5 w-5 mr-2" />
              Engagement Leaders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sortedPlatforms
                .sort((a, b) => b.engagementRate - a.engagementRate)
                .map((platform, index) => (
                  <div
                    key={platform.platformKey}
                    className="flex items-center space-x-4"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100">
                      <span className="text-sm font-bold text-green-700">
                        #{index + 1}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{platform.platform}</span>
                        <span className="text-sm text-muted-foreground">
                          {platform.engagementRate.toFixed(1)}%
                        </span>
                      </div>
                      <Progress
                        value={platform.engagementRate}
                        className="h-2"
                        style={{
                          backgroundColor:
                            getPlatformColor(platform.platformKey) + "20",
                        }}
                      />
                    </div>
                    <Badge
                      variant={index === 0 ? "default" : "secondary"}
                      style={{
                        backgroundColor:
                          index === 0
                            ? getPlatformColor(platform.platformKey)
                            : undefined,
                      }}
                    >
                      {index === 0 ? "👑" : ""}
                    </Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Platform Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="h-5 w-5 mr-2" />
            Detailed Platform Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Platform</th>
                  <th className="text-right py-2">Views</th>
                  <th className="text-right py-2">Likes</th>
                  <th className="text-right py-2">Shares</th>
                  <th className="text-right py-2">Comments</th>
                  <th className="text-right py-2">Engagement</th>
                </tr>
              </thead>
              <tbody>
                {sortedPlatforms.map((platform) => (
                  <tr key={platform.platformKey} className="border-b">
                    <td className="py-3">
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: getPlatformColor(
                              platform.platformKey
                            ),
                          }}
                        />
                        <span className="font-medium">{platform.platform}</span>
                      </div>
                    </td>
                    <td className="text-right py-3 font-semibold">
                      {formatMetricValue(platform.views)}
                    </td>
                    <td className="text-right py-3">
                      {formatMetricValue(platform.likes)}
                    </td>
                    <td className="text-right py-3">
                      {formatMetricValue(platform.shares)}
                    </td>
                    <td className="text-right py-3">
                      {formatMetricValue(platform.comments)}
                    </td>
                    <td className="text-right py-3">
                      <Badge
                        variant="outline"
                        style={{
                          borderColor: getPlatformColor(platform.platformKey),
                          color: getPlatformColor(platform.platformKey),
                        }}
                      >
                        {platform.engagementRate.toFixed(1)}%
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
