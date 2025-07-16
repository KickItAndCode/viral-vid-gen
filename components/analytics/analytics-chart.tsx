"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { PLATFORM_COLORS } from "@/lib/hooks/use-analytics";

interface AnalyticsChartProps {
  title: string;
  data: any[];
  loading?: boolean;
  type?: "line" | "bar" | "pie";
  className?: string;
  height?: number;
  colors?: string[];
  xKey?: string;
  yKeys?: string[];
  showLegend?: boolean;
  showGrid?: boolean;
}

export function AnalyticsChart({
  title,
  data,
  loading = false,
  type = "line",
  className,
  height = 300,
  colors = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b"],
  xKey = "date",
  yKeys = ["views"],
  showLegend = true,
  showGrid = true,
}: AnalyticsChartProps) {
  // Mock data for development
  const mockData = [
    { date: "2024-01-01", views: 1200, likes: 89, shares: 23, comments: 45 },
    { date: "2024-01-02", views: 1350, likes: 102, shares: 31, comments: 52 },
    { date: "2024-01-03", views: 1180, likes: 76, shares: 18, comments: 38 },
    { date: "2024-01-04", views: 1650, likes: 145, shares: 42, comments: 67 },
    { date: "2024-01-05", views: 1890, likes: 167, shares: 54, comments: 78 },
    { date: "2024-01-06", views: 2100, likes: 189, shares: 63, comments: 89 },
    { date: "2024-01-07", views: 1920, likes: 154, shares: 47, comments: 71 },
  ];

  const chartData = data.length > 0 ? data : mockData;

  const formatTooltipValue = (value: number, name: string) => {
    if (name === "views") {
      return value >= 1000 ? `${(value / 1000).toFixed(1)}K` : value.toString();
    }
    return value.toString();
  };

  const formatAxisValue = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  };

  if (loading) {
    return (
      <Card className={cn("", className)}>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-5 w-32" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="w-full" style={{ height: `${height}px` }} />
        </CardContent>
      </Card>
    );
  }

  const renderChart = () => {
    switch (type) {
      case "bar":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={chartData}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis
                dataKey={xKey}
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });
                }}
              />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={formatAxisValue} />
              <Tooltip
                formatter={formatTooltipValue}
                labelFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  });
                }}
              />
              {showLegend && <Legend />}
              {yKeys.map((key, index) => (
                <Bar
                  key={key}
                  dataKey={key}
                  fill={colors[index % colors.length]}
                  radius={[2, 2, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );

      case "pie":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`
                }
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={colors[index % colors.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) =>
                  formatTooltipValue(value as number, "value")
                }
              />
            </PieChart>
          </ResponsiveContainer>
        );

      case "line":
      default:
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={chartData}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis
                dataKey={xKey}
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });
                }}
              />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={formatAxisValue} />
              <Tooltip
                formatter={formatTooltipValue}
                labelFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  });
                }}
              />
              {showLegend && <Legend />}
              {yKeys.map((key, index) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={colors[index % colors.length]}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{title}</span>
          <div className="flex items-center space-x-2">
            {type === "line" && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-blue-500 rounded-full" />
                  <span>Views</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <span>Likes</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-purple-500 rounded-full" />
                  <span>Shares</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-orange-500 rounded-full" />
                  <span>Comments</span>
                </div>
              </div>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>{renderChart()}</CardContent>
    </Card>
  );
}
