"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatMetricValue } from "@/lib/hooks/use-analytics";
import {
  Users,
  MapPin,
  Calendar,
  Clock,
  Smartphone,
  Monitor,
  Tablet,
  Globe,
  TrendingUp,
  UserCheck,
  Target,
  Activity,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";

interface AudienceInsightsData {
  demographics: {
    age: { range: string; percentage: number }[];
    gender: { type: string; percentage: number }[];
    location: { country: string; percentage: number; views: number }[];
  };
  behavior: {
    watchTime: { hour: number; views: number }[];
    devices: { type: string; percentage: number }[];
    platforms: { name: string; percentage: number; engagement: number }[];
  };
  engagement: {
    retentionRate: number;
    averageWatchTime: number;
    bounceRate: number;
    returnViewers: number;
  };
  growth: {
    newFollowers: number;
    followerGrowth: number;
    audienceGrowth: { date: string; followers: number }[];
  };
}

interface AudienceInsightsProps {
  data: AudienceInsightsData | null;
  loading?: boolean;
  className?: string;
}

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
];

export function AudienceInsights({
  data,
  loading = false,
  className,
}: AudienceInsightsProps) {
  // Mock data for development
  const mockData: AudienceInsightsData = {
    demographics: {
      age: [
        { range: "18-24", percentage: 35 },
        { range: "25-34", percentage: 28 },
        { range: "35-44", percentage: 20 },
        { range: "45-54", percentage: 12 },
        { range: "55+", percentage: 5 },
      ],
      gender: [
        { type: "Female", percentage: 58 },
        { type: "Male", percentage: 40 },
        { type: "Other", percentage: 2 },
      ],
      location: [
        { country: "United States", percentage: 45, views: 45230 },
        { country: "United Kingdom", percentage: 12, views: 12340 },
        { country: "Canada", percentage: 8, views: 8560 },
        { country: "Australia", percentage: 7, views: 7890 },
        { country: "Germany", percentage: 6, views: 6780 },
        { country: "France", percentage: 5, views: 5670 },
        { country: "Other", percentage: 17, views: 17530 },
      ],
    },
    behavior: {
      watchTime: [
        { hour: 0, views: 1200 },
        { hour: 2, views: 800 },
        { hour: 4, views: 500 },
        { hour: 6, views: 1100 },
        { hour: 8, views: 2300 },
        { hour: 10, views: 3200 },
        { hour: 12, views: 4100 },
        { hour: 14, views: 3800 },
        { hour: 16, views: 4500 },
        { hour: 18, views: 5200 },
        { hour: 20, views: 6100 },
        { hour: 22, views: 4800 },
      ],
      devices: [
        { type: "Mobile", percentage: 68 },
        { type: "Desktop", percentage: 25 },
        { type: "Tablet", percentage: 7 },
      ],
      platforms: [
        { name: "TikTok", percentage: 35, engagement: 12.8 },
        { name: "Instagram", percentage: 28, engagement: 10.2 },
        { name: "YouTube", percentage: 20, engagement: 8.7 },
        { name: "Twitter", percentage: 12, engagement: 9.5 },
        { name: "Facebook", percentage: 5, engagement: 6.8 },
      ],
    },
    engagement: {
      retentionRate: 78.5,
      averageWatchTime: 23.4,
      bounceRate: 15.2,
      returnViewers: 42.7,
    },
    growth: {
      newFollowers: 2340,
      followerGrowth: 18.5,
      audienceGrowth: [
        { date: "2024-01-01", followers: 12400 },
        { date: "2024-01-02", followers: 12580 },
        { date: "2024-01-03", followers: 12750 },
        { date: "2024-01-04", followers: 13100 },
        { date: "2024-01-05", followers: 13420 },
        { date: "2024-01-06", followers: 13680 },
        { date: "2024-01-07", followers: 14020 },
      ],
    },
  };

  const audienceData = data || mockData;

  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case "mobile":
        return <Smartphone className="h-4 w-4" />;
      case "desktop":
        return <Monitor className="h-4 w-4" />;
      case "tablet":
        return <Tablet className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const formatHour = (hour: number) => {
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}${period}`;
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-40" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Engagement Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Retention Rate
            </CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {audienceData.engagement.retentionRate}%
            </div>
            <Progress
              value={audienceData.engagement.retentionRate}
              className="mt-2"
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg. Watch Time
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {audienceData.engagement.averageWatchTime}s
            </div>
            <p className="text-xs text-muted-foreground">
              {((audienceData.engagement.averageWatchTime / 30) * 100).toFixed(
                1
              )}
              % of video
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Return Viewers
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {audienceData.engagement.returnViewers}%
            </div>
            <p className="text-xs text-muted-foreground">
              +{audienceData.growth.followerGrowth}% this week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Followers</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatMetricValue(audienceData.growth.newFollowers)}
            </div>
            <p className="text-xs text-muted-foreground">
              +{audienceData.growth.followerGrowth}% growth
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Demographics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Age Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={audienceData.demographics.age}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="percentage"
                >
                  {audienceData.demographics.age.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {audienceData.demographics.age.map((item, index) => (
                <div
                  key={item.range}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <div
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm">{item.range}</span>
                  </div>
                  <span className="text-sm font-semibold">
                    {item.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Gender Split
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={audienceData.demographics.gender}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="percentage"
                >
                  {audienceData.demographics.gender.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {audienceData.demographics.gender.map((item, index) => (
                <div
                  key={item.type}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <div
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm">{item.type}</span>
                  </div>
                  <span className="text-sm font-semibold">
                    {item.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Smartphone className="h-5 w-5 mr-2" />
              Device Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {audienceData.behavior.devices.map((device, index) => (
                <div
                  key={device.type}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center">
                    {getDeviceIcon(device.type)}
                    <span className="text-sm ml-2">{device.type}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Progress value={device.percentage} className="w-20" />
                    <span className="text-sm font-semibold w-12">
                      {device.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Geographic Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="h-5 w-5 mr-2" />
            Geographic Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={audienceData.demographics.location.slice(0, 6)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="country"
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Bar
                    dataKey="percentage"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              {audienceData.demographics.location.map((location, index) => (
                <div
                  key={location.country}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <div
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm">{location.country}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-muted-foreground">
                      {formatMetricValue(location.views)} views
                    </span>
                    <span className="text-sm font-semibold w-12">
                      {location.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Viewing Patterns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Viewing Times
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={audienceData.behavior.watchTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="hour"
                  tick={{ fontSize: 12 }}
                  tickFormatter={formatHour}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value) => [
                    formatMetricValue(value as number),
                    "Views",
                  ]}
                  labelFormatter={(hour) => `${formatHour(hour as number)}`}
                />
                <Area
                  type="monotone"
                  dataKey="views"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Follower Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={audienceData.growth.audienceGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(date) =>
                    new Date(date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value) => [
                    formatMetricValue(value as number),
                    "Followers",
                  ]}
                  labelFormatter={(date) =>
                    new Date(date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  }
                />
                <Line
                  type="monotone"
                  dataKey="followers"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
