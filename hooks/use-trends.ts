import { api } from "@/convex/_generated/api";
import { useConvexQueryPublic } from "./use-convex-query";
import { useConvexMutation } from "./use-convex-mutation";

type Platform = "reddit" | "twitter" | "tiktok" | "youtube";

/**
 * Get trending content with filters
 */
export function useTrends(filters?: {
  platform?: Platform | "manual";
  category?: string;
  trending?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: "viralScore" | "createdAt" | "engagementTotal";
  sortOrder?: "asc" | "desc";
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
 * Search trends by title or description
 */
export function useSearchTrends(searchTerm: string, filters?: {
  category?: string;
  platform?: Platform;
  limit?: number;
}) {
  return useConvexQueryPublic(
    api.trends.searchTrends,
    { searchTerm, ...filters },
    {
      enabled: !!searchTerm && searchTerm.length > 2,
      staleTime: 1 * 60 * 1000, // 1 minute for search results
    }
  );
}

/**
 * Get trend categories with counts
 */
export function useTrendCategories(platform?: Platform) {
  return useConvexQueryPublic(
    api.trends.getTrendCategories,
    platform ? { platform } : {},
    {
      staleTime: 10 * 60 * 1000, // 10 minutes for categories
    }
  );
}

/**
 * Get currently trending content (high viral score)
 */
export function useTrendingContent(filters?: {
  category?: string;
  platform?: Platform;
  limit?: number;
}) {
  return useConvexQueryPublic(
    api.trends.getTrendingContent,
    filters || {},
    {
      staleTime: 1 * 60 * 1000, // 1 minute for trending content
    }
  );
}

/**
 * Get single trend by ID
 */
export function useTrend(trendId: string) {
  return useConvexQueryPublic(
    api.trends.getTrend,
    { id: trendId as any },
    {
      enabled: !!trendId,
      staleTime: 5 * 60 * 1000, // 5 minutes for individual trends
    }
  );
}

/**
 * Create new trend (admin function)
 */
export function useCreateTrend() {
  return useConvexMutation(api.trends.upsertTrend, {
    invalidateQueries: ["trends.getTrends", "trends.getTrendingContent"],
  });
}