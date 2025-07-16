import { useQuery } from "@tanstack/react-query";
import { useConvex } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export function useVideoAnalytics(
  videoId: Id<"videos">,
  options?: {
    startDate?: string;
    endDate?: string;
    platform?: string;
    enabled?: boolean;
  }
) {
  const convex = useConvex();

  return useQuery({
    queryKey: [
      "video-analytics",
      videoId,
      options?.startDate,
      options?.endDate,
      options?.platform,
    ],
    queryFn: async () => {
      return await convex.query(api.analytics.getVideoAnalytics, {
        videoId,
        startDate: options?.startDate,
        endDate: options?.endDate,
        platform: options?.platform,
      });
    },
    enabled: options?.enabled !== false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // 30 seconds
  });
}

export function useUserAnalytics(
  userId: Id<"users">,
  period: "daily" | "weekly" | "monthly" | "quarterly" | "yearly",
  options?: {
    startDate?: string;
    endDate?: string;
    enabled?: boolean;
  }
) {
  const convex = useConvex();

  return useQuery({
    queryKey: [
      "user-analytics",
      userId,
      period,
      options?.startDate,
      options?.endDate,
    ],
    queryFn: async () => {
      return await convex.query(api.analytics.getUserAnalytics, {
        userId,
        period,
        startDate: options?.startDate,
        endDate: options?.endDate,
      });
    },
    enabled: options?.enabled !== false,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 60 * 1000, // 1 minute
  });
}

export function useVideoPerformance(
  videoId: Id<"videos">,
  options?: {
    platform?: string;
    enabled?: boolean;
  }
) {
  const convex = useConvex();

  return useQuery({
    queryKey: ["video-performance", videoId, options?.platform],
    queryFn: async () => {
      return await convex.query(api.analytics.getVideoPerformance, {
        videoId,
        platform: options?.platform,
      });
    },
    enabled: options?.enabled !== false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // 30 seconds
  });
}

export function usePlatformComparison(
  userId: Id<"users">,
  options?: {
    startDate?: string;
    endDate?: string;
    enabled?: boolean;
  }
) {
  const convex = useConvex();

  return useQuery({
    queryKey: [
      "platform-comparison",
      userId,
      options?.startDate,
      options?.endDate,
    ],
    queryFn: async () => {
      return await convex.query(api.analytics.getPlatformComparison, {
        userId,
        startDate: options?.startDate,
        endDate: options?.endDate,
      });
    },
    enabled: options?.enabled !== false,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 60 * 1000, // 1 minute
  });
}

export function useTrendingInsights(
  userId: Id<"users">,
  options?: {
    limit?: number;
    enabled?: boolean;
  }
) {
  const convex = useConvex();

  return useQuery({
    queryKey: ["trending-insights", userId, options?.limit],
    queryFn: async () => {
      return await convex.query(api.analytics.getTrendingInsights, {
        userId,
        limit: options?.limit,
      });
    },
    enabled: options?.enabled !== false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // 30 seconds
  });
}

// Combined analytics hook for dashboard
export function useAnalyticsDashboard(
  userId: Id<"users">,
  options?: {
    period?: "daily" | "weekly" | "monthly" | "quarterly" | "yearly";
    startDate?: string;
    endDate?: string;
    enabled?: boolean;
  }
) {
  const period = options?.period || "weekly";

  const userAnalytics = useUserAnalytics(userId, period, {
    startDate: options?.startDate,
    endDate: options?.endDate,
    enabled: options?.enabled,
  });

  const platformComparison = usePlatformComparison(userId, {
    startDate: options?.startDate,
    endDate: options?.endDate,
    enabled: options?.enabled,
  });

  const trendingInsights = useTrendingInsights(userId, {
    limit: 10,
    enabled: options?.enabled,
  });

  return {
    userAnalytics,
    platformComparison,
    trendingInsights,
    isLoading:
      userAnalytics.isLoading ||
      platformComparison.isLoading ||
      trendingInsights.isLoading,
    error:
      userAnalytics.error || platformComparison.error || trendingInsights.error,
  };
}

// Helper hook for calculating date ranges
export function useDateRanges() {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);

  const lastMonth = new Date(today);
  lastMonth.setMonth(lastMonth.getMonth() - 1);

  const lastQuarter = new Date(today);
  lastQuarter.setMonth(lastQuarter.getMonth() - 3);

  const lastYear = new Date(today);
  lastYear.setFullYear(lastYear.getFullYear() - 1);

  const formatDate = (date: Date) => date.toISOString().split("T")[0];

  return {
    today: formatDate(today),
    yesterday: formatDate(yesterday),
    lastWeek: formatDate(lastWeek),
    lastMonth: formatDate(lastMonth),
    lastQuarter: formatDate(lastQuarter),
    lastYear: formatDate(lastYear),
    ranges: {
      today: {
        start: formatDate(today),
        end: formatDate(today),
        label: "Today",
      },
      yesterday: {
        start: formatDate(yesterday),
        end: formatDate(yesterday),
        label: "Yesterday",
      },
      last7Days: {
        start: formatDate(lastWeek),
        end: formatDate(today),
        label: "Last 7 days",
      },
      last30Days: {
        start: formatDate(lastMonth),
        end: formatDate(today),
        label: "Last 30 days",
      },
      last90Days: {
        start: formatDate(lastQuarter),
        end: formatDate(today),
        label: "Last 90 days",
      },
      lastYear: {
        start: formatDate(lastYear),
        end: formatDate(today),
        label: "Last year",
      },
    },
  };
}

// Analytics calculation utilities
export function calculateGrowthRate(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

export function calculateEngagementRate(
  likes: number,
  shares: number,
  comments: number,
  views: number
): number {
  if (views === 0) return 0;
  return ((likes + shares + comments) / views) * 100;
}

export function calculateViralCoefficient(
  shares: number,
  views: number
): number {
  if (views === 0) return 0;
  return (shares / views) * 100;
}

export function formatMetricValue(
  value: number,
  type: "number" | "percentage" | "currency" | "duration" = "number"
): string {
  switch (type) {
    case "percentage":
      return `${value.toFixed(1)}%`;
    case "currency":
      return `$${value.toFixed(2)}`;
    case "duration":
      const minutes = Math.floor(value / 60);
      const seconds = Math.floor(value % 60);
      return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    case "number":
    default:
      if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`;
      } else if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}K`;
      }
      return value.toString();
  }
}

// Platform-specific utilities
export const PLATFORM_COLORS = {
  youtube: "#FF0000",
  tiktok: "#000000",
  instagram: "#E4405F",
  twitter: "#1DA1F2",
  facebook: "#4267B2",
  linkedin: "#0077B5",
  snapchat: "#FFFC00",
  reddit: "#FF4500",
  direct: "#6B7280",
} as const;

export const PLATFORM_LABELS = {
  youtube: "YouTube",
  tiktok: "TikTok",
  instagram: "Instagram",
  twitter: "Twitter/X",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  snapchat: "Snapchat",
  reddit: "Reddit",
  direct: "Direct",
} as const;

export function getPlatformColor(platform: string): string {
  return PLATFORM_COLORS[platform as keyof typeof PLATFORM_COLORS] || "#6B7280";
}

export function getPlatformLabel(platform: string): string {
  return PLATFORM_LABELS[platform as keyof typeof PLATFORM_LABELS] || platform;
}
