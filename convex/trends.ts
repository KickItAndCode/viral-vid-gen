import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

export const createTrend = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    platform: v.union(
      v.literal("reddit"),
      v.literal("twitter"),
      v.literal("tiktok"),
      v.literal("youtube")
    ),
    category: v.string(),
    viralScore: v.number(),
    engagementMetrics: v.object({
      likes: v.optional(v.number()),
      shares: v.optional(v.number()),
      comments: v.optional(v.number()),
      views: v.optional(v.number()),
    }),
    tags: v.array(v.string()),
    sourceUrl: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const trendId = await ctx.db.insert("trends", {
      ...args,
      scrapedAt: now,
      createdAt: now,
    });

    return trendId;
  },
});

export const getTrends = query({
  args: {
    category: v.optional(v.string()),
    platform: v.optional(
      v.union(
        v.literal("reddit"),
        v.literal("twitter"),
        v.literal("tiktok"),
        v.literal("youtube")
      )
    ),
    minViralScore: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("trends").order("desc");

    if (args.category) {
      query = query.filter((q) => q.eq(q.field("category"), args.category));
    }

    if (args.platform) {
      query = query.filter((q) => q.eq(q.field("platform"), args.platform));
    }

    if (args.minViralScore) {
      query = query.filter((q) =>
        q.gte(q.field("viralScore"), args.minViralScore)
      );
    }

    const limit = args.limit || 20;
    return await query.take(limit);
  },
});

export const getTrendById = query({
  args: { trendId: v.id("trends") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.trendId);
  },
});

export const searchTrends = query({
  args: {
    searchTerm: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const trends = await ctx.db.query("trends").collect();

    const searchLower = args.searchTerm.toLowerCase();
    const filteredTrends = trends.filter(
      (trend) =>
        trend.title.toLowerCase().includes(searchLower) ||
        trend.description.toLowerCase().includes(searchLower) ||
        trend.tags.some((tag: string) => tag.toLowerCase().includes(searchLower))
    );

    // Sort by viral score descending
    filteredTrends.sort((a, b) => b.viralScore - a.viralScore);

    const limit = args.limit || 20;
    return filteredTrends.slice(0, limit);
  },
});

export const getTrendingCategories = query({
  args: {},
  handler: async (ctx, args) => {
    const trends = await ctx.db.query("trends").collect();

    const categoryStats = trends.reduce(
      (acc, trend) => {
        if (!acc[trend.category]) {
          acc[trend.category] = {
            category: trend.category,
            count: 0,
            avgViralScore: 0,
            totalViralScore: 0,
          };
        }

        acc[trend.category].count++;
        acc[trend.category].totalViralScore += trend.viralScore;
        acc[trend.category].avgViralScore =
          acc[trend.category].totalViralScore / acc[trend.category].count;

        return acc;
      },
      {} as Record<string, any>
    );

    return Object.values(categoryStats).sort(
      (a: any, b: any) => b.avgViralScore - a.avgViralScore
    );
  },
});

export const updateTrendViralScore = mutation({
  args: {
    trendId: v.id("trends"),
    viralScore: v.number(),
    engagementMetrics: v.optional(
      v.object({
        likes: v.optional(v.number()),
        shares: v.optional(v.number()),
        comments: v.optional(v.number()),
        views: v.optional(v.number()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const { trendId, ...updates } = args;

    await ctx.db.patch(trendId, {
      ...updates,
      scrapedAt: Date.now(),
    });
  },
});
