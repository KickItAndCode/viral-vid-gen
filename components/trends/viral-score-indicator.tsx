"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface ViralScoreIndicatorProps {
  score: number;
  showIcon?: boolean;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ViralScoreIndicator({
  score,
  showIcon = true,
  showLabel = true,
  size = "md",
  className,
}: ViralScoreIndicatorProps) {
  // Determine score level and styling
  const getScoreLevel = (score: number) => {
    if (score >= 80) return "viral";
    if (score >= 60) return "trending";
    if (score >= 40) return "rising";
    if (score >= 20) return "stable";
    return "low";
  };

  const scoreLevel = getScoreLevel(score);

  // Define styling based on score level
  const levelConfig = {
    viral: {
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/20",
      icon: TrendingUp,
      label: "Viral",
    },
    trending: {
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/20",
      icon: TrendingUp,
      label: "Trending",
    },
    rising: {
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/20",
      icon: TrendingUp,
      label: "Rising",
    },
    stable: {
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
      icon: Minus,
      label: "Stable",
    },
    low: {
      color: "text-muted-foreground",
      bgColor: "bg-muted/50",
      borderColor: "border-muted-foreground/20",
      icon: TrendingDown,
      label: "Low",
    },
  };

  const config = levelConfig[scoreLevel];
  const Icon = config.icon;

  // Size variants
  const sizeConfig = {
    sm: {
      container: "px-2 py-1 text-xs",
      icon: "h-3 w-3",
      score: "text-xs font-medium",
      label: "text-xs",
    },
    md: {
      container: "px-3 py-1.5 text-sm",
      icon: "h-4 w-4",
      score: "text-sm font-medium",
      label: "text-sm",
    },
    lg: {
      container: "px-4 py-2 text-base",
      icon: "h-5 w-5",
      score: "text-base font-semibold",
      label: "text-base",
    },
  };

  const sizeStyles = sizeConfig[size];

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border",
        config.bgColor,
        config.borderColor,
        sizeStyles.container,
        className
      )}
    >
      {showIcon && <Icon className={cn(sizeStyles.icon, config.color)} />}

      <span className={cn(sizeStyles.score, config.color)}>
        {score.toFixed(1)}
      </span>

      {showLabel && (
        <span className={cn(sizeStyles.label, config.color)}>
          {config.label}
        </span>
      )}
    </div>
  );
}

// Alternative progress bar style viral score
interface ViralScoreBarProps {
  score: number;
  maxScore?: number;
  height?: "sm" | "md" | "lg";
  showPercentage?: boolean;
  className?: string;
}

export function ViralScoreBar({
  score,
  maxScore = 100,
  height = "md",
  showPercentage = true,
  className,
}: ViralScoreBarProps) {
  const percentage = Math.min((score / maxScore) * 100, 100);

  const heightConfig = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3",
  };

  // Color based on percentage
  const getBarColor = (percentage: number) => {
    if (percentage >= 80) return "bg-red-500";
    if (percentage >= 60) return "bg-green-500";
    if (percentage >= 40) return "bg-orange-500";
    if (percentage >= 20) return "bg-blue-500";
    return "bg-muted-foreground";
  };

  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">
          Viral Score
        </span>
        {showPercentage && (
          <span className="text-xs font-medium">
            {score.toFixed(1)}/{maxScore}
          </span>
        )}
      </div>

      <div
        className={cn(
          "w-full bg-muted rounded-full overflow-hidden",
          heightConfig[height]
        )}
      >
        <div
          className={cn(
            "transition-all duration-300 ease-out rounded-full",
            getBarColor(percentage),
            heightConfig[height]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
