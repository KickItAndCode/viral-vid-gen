"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

interface MetricsCardProps {
  title: string;
  value: string;
  change?: number;
  icon?: React.ReactNode;
  loading?: boolean;
  className?: string;
  trend?: "up" | "down" | "neutral";
  description?: string;
}

export function MetricsCard({
  title,
  value,
  change,
  icon,
  loading = false,
  className,
  trend,
  description,
}: MetricsCardProps) {
  const getTrendColor = (changeValue: number) => {
    if (changeValue > 0) return "text-green-600";
    if (changeValue < 0) return "text-red-600";
    return "text-muted-foreground";
  };

  const getTrendIcon = (changeValue: number) => {
    if (changeValue > 0) return <ArrowUpRight className="h-3 w-3" />;
    if (changeValue < 0) return <ArrowDownRight className="h-3 w-3" />;
    return <Minus className="h-3 w-3" />;
  };

  const getTrendBadgeVariant = (changeValue: number) => {
    if (changeValue > 0) return "default";
    if (changeValue < 0) return "destructive";
    return "secondary";
  };

  if (loading) {
    return (
      <Card className={cn("", className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            <Skeleton className="h-4 w-20" />
          </CardTitle>
          <Skeleton className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-4 w-12" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-2xl font-bold">{value}</div>
          {change !== undefined && (
            <div className="flex items-center space-x-2">
              <Badge
                variant={getTrendBadgeVariant(change)}
                className="flex items-center space-x-1"
              >
                {getTrendIcon(change)}
                <span className="text-xs">
                  {change > 0 ? "+" : ""}
                  {change.toFixed(1)}%
                </span>
              </Badge>
              <span className="text-xs text-muted-foreground">
                vs last period
              </span>
            </div>
          )}
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
