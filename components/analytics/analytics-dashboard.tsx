"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateRange, DayPicker } from "react-day-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Eye,
  Heart,
  Share2,
  Download,
  CalendarIcon,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Target,
  Zap,
  Globe,
} from "lucide-react";

import { MetricsCard } from "./metrics-card";
import { AnalyticsChart } from "./analytics-chart";
import { PlatformComparison } from "./platform-comparison";
import { VideoPerformanceTable } from "./video-performance-table";
import { AudienceInsights } from "./audience-insights";
import { TrendingContent } from "./trending-content";

import {
  useAnalyticsDashboard,
  useDateRanges,
  formatMetricValue,
} from "@/lib/hooks/use-analytics";
import { useUser } from "@/hooks/use-users";

interface AnalyticsDashboardProps {
  className?: string;
}

export function AnalyticsDashboard({ className }: AnalyticsDashboardProps) {
  const { data: user } = useUser("temp-user-id");
  const { ranges } = useDateRanges();

  const [selectedPeriod, setSelectedPeriod] = useState<
    "daily" | "weekly" | "monthly" | "quarterly" | "yearly"
  >("weekly");
  const [selectedRange, setSelectedRange] = useState(ranges.last7Days);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const {
    userAnalytics,
    platformComparison,
    trendingInsights,
    isLoading,
    error,
  } = useAnalyticsDashboard(user?._id || "temp-user-id", {
    period: selectedPeriod,
    startDate: selectedRange.start,
    endDate: selectedRange.end,
    enabled: !!user,
  });

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    if (range?.from && range?.to) {
      setSelectedRange({
        start: format(range.from, "yyyy-MM-dd"),
        end: format(range.to, "yyyy-MM-dd"),
        label: "Custom Range",
      });
    }
  };

  const handlePredefinedRangeChange = (rangeKey: string) => {
    const range = ranges[rangeKey as keyof typeof ranges];
    setSelectedRange(range);
    setDateRange(undefined);
  };

  // Mock data for development
  const mockMetrics = {
    totalViews: 125420,
    totalLikes: 8965,
    totalShares: 2140,
    totalComments: 1850,
    totalDownloads: 560,
    engagementRate: 10.2,
    viralCoefficient: 1.7,
    reachGrowth: 15.8,
    previousViews: 98230,
    previousLikes: 7120,
    previousShares: 1680,
    previousComments: 1420,
  };

  const growthMetrics = {
    viewsGrowth:
      ((mockMetrics.totalViews - mockMetrics.previousViews) /
        mockMetrics.previousViews) *
      100,
    likesGrowth:
      ((mockMetrics.totalLikes - mockMetrics.previousLikes) /
        mockMetrics.previousLikes) *
      100,
    sharesGrowth:
      ((mockMetrics.totalShares - mockMetrics.previousShares) /
        mockMetrics.previousShares) *
      100,
    commentsGrowth:
      ((mockMetrics.totalComments - mockMetrics.previousComments) /
        mockMetrics.previousComments) *
      100,
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            Failed to load analytics
          </h3>
          <p className="text-muted-foreground mb-4">
            There was an error loading your analytics data.
          </p>
          <Button onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            Analytics Dashboard
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Track your video performance and audience insights
          </p>
        </div>
        <div className="flex flex-col space-y-2 md:flex-row md:items-center md:space-y-0 md:space-x-2">
          <Select
            value={selectedPeriod}
            onValueChange={(value: any) => setSelectedPeriod(value)}
          >
            <SelectTrigger className="w-full md:w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full md:w-48">
                <CalendarIcon className="h-4 w-4 mr-2" />
                <span className="truncate">{selectedRange.label}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <div className="p-3 border-b">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {Object.entries(ranges).map(([key, range]) => (
                    <Button
                      key={key}
                      variant={
                        selectedRange.label === range.label
                          ? "default"
                          : "ghost"
                      }
                      size="sm"
                      onClick={() => handlePredefinedRangeChange(key)}
                      className="w-full justify-start"
                    >
                      {range.label}
                    </Button>
                  ))}
                </div>
              </div>
              <DayPicker
                mode="range"
                selected={dateRange}
                onSelect={handleDateRangeChange}
                numberOfMonths={window.innerWidth < 768 ? 1 : 2}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricsCard
          title="Total Views"
          value={formatMetricValue(mockMetrics.totalViews)}
          change={growthMetrics.viewsGrowth}
          icon={<Eye className="h-4 w-4" />}
          loading={isLoading}
        />
        <MetricsCard
          title="Engagement Rate"
          value={formatMetricValue(mockMetrics.engagementRate, "percentage")}
          change={mockMetrics.reachGrowth}
          icon={<Heart className="h-4 w-4" />}
          loading={isLoading}
        />
        <MetricsCard
          title="Viral Coefficient"
          value={formatMetricValue(mockMetrics.viralCoefficient)}
          change={12.5}
          icon={<Zap className="h-4 w-4" />}
          loading={isLoading}
        />
        <MetricsCard
          title="Total Shares"
          value={formatMetricValue(mockMetrics.totalShares)}
          change={growthMetrics.sharesGrowth}
          icon={<Share2 className="h-4 w-4" />}
          loading={isLoading}
        />
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <div className="overflow-x-auto">
          <TabsList className="grid w-full grid-cols-5 min-w-max md:min-w-0">
            <TabsTrigger value="overview" className="px-2 md:px-4">
              Overview
            </TabsTrigger>
            <TabsTrigger value="performance" className="px-2 md:px-4">
              Performance
            </TabsTrigger>
            <TabsTrigger value="audience" className="px-2 md:px-4">
              Audience
            </TabsTrigger>
            <TabsTrigger value="platforms" className="px-2 md:px-4">
              Platforms
            </TabsTrigger>
            <TabsTrigger value="trending" className="px-2 md:px-4">
              Trending
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <AnalyticsChart
              title="Views Over Time"
              data={[]} // Will be populated with real data
              loading={isLoading}
            />
            <AnalyticsChart
              title="Engagement Metrics"
              data={[]} // Will be populated with real data
              loading={isLoading}
              type="bar"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Performance Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {formatMetricValue(mockMetrics.totalLikes)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total Likes
                    </div>
                    <div className="flex items-center justify-center mt-1">
                      <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                      <span className="text-xs text-green-500">
                        +{growthMetrics.likesGrowth.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {formatMetricValue(mockMetrics.totalComments)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Comments
                    </div>
                    <div className="flex items-center justify-center mt-1">
                      <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                      <span className="text-xs text-green-500">
                        +{growthMetrics.commentsGrowth.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {formatMetricValue(mockMetrics.totalDownloads)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Downloads
                    </div>
                    <div className="flex items-center justify-center mt-1">
                      <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                      <span className="text-xs text-green-500">+22.3%</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {mockMetrics.engagementRate.toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Avg. Engagement
                    </div>
                    <div className="flex items-center justify-center mt-1">
                      <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                      <span className="text-xs text-green-500">
                        +{mockMetrics.reachGrowth.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Growth Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Views</span>
                    <div className="flex items-center">
                      <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                      <span className="text-sm font-semibold text-green-500">
                        +{growthMetrics.viewsGrowth.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Engagement</span>
                    <div className="flex items-center">
                      <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                      <span className="text-sm font-semibold text-green-500">
                        +{mockMetrics.reachGrowth.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Viral Score</span>
                    <div className="flex items-center">
                      <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                      <span className="text-sm font-semibold text-green-500">
                        +12.5%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Reach</span>
                    <div className="flex items-center">
                      <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                      <span className="text-sm font-semibold text-green-500">
                        +18.2%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <VideoPerformanceTable
            videos={trendingInsights.data?.trendingVideos || []}
            loading={isLoading}
          />
        </TabsContent>

        <TabsContent value="audience" className="space-y-4">
          <AudienceInsights
            data={null} // Will be populated with real demographic data
            loading={isLoading}
          />
        </TabsContent>

        <TabsContent value="platforms" className="space-y-4">
          <PlatformComparison
            data={platformComparison.data || {}}
            loading={isLoading}
          />
        </TabsContent>

        <TabsContent value="trending" className="space-y-4">
          <TrendingContent
            insights={trendingInsights.data}
            loading={isLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
