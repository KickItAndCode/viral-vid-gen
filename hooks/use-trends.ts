import { api } from "@/convex/_generated/api";
import { useConvexQueryPublic } from "./use-convex-query";
import { useConvexMutation } from "./use-convex-mutation";

type Platform = "reddit" | "twitter" | "tiktok" | "youtube";

/**
 * Get trending content with filters
 */
export function useTrends(filters?: {
  category?: string;
  platform?: Platform;
  minViralScore?: number;
  limit?: number;
}) {
  return useConvexQueryPublic(
    api.trends.getTrends,
    filters || {},
    {
      staleTime: 2 * 60 * 1000, // 2 minutes for trend data
      gcTime: 10 * 60 * 1000, // 10 minutes cache
    }
  );
}

/**
 * Get trending content by category
 */
export function useTrendsByCategory(category: string) {
  return useConvexQueryPublic(
    api.trends.getTrends,
    { category },
    {
      enabled: !!category,
      staleTime: 5 * 60 * 1000, // 5 minutes for category data
    }
  );
}

/**
 * Get trending content by platform
 */
export function useTrendsByPlatform(platform: Platform) {
  return useConvexQueryPublic(
    api.trends.getTrends,
    { platform },
    {
      enabled: !!platform,
      staleTime: 3 * 60 * 1000, // 3 minutes for platform data
    }
  );
}

/**
 * Get high viral score trends
 */
export function useViralTrends(minViralScore: number = 70) {
  return useConvexQueryPublic(
    api.trends.getTrends,
    { minViralScore },
    {
      staleTime: 1 * 60 * 1000, // 1 minute for viral content
    }
  );
}

/**
 * Create new trend (admin function)
 */
export function useCreateTrend() {
  return useConvexMutation(api.trends.createTrend, {
    invalidateQueries: ["trends.getTrends"],
  });
}