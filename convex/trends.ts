import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Query trends with filtering and pagination
 */
export const getTrends = query({
  args: {
    platform: v.optional(v.union(
      v.literal("reddit"),
      v.literal("twitter"),
      v.literal("tiktok"),
      v.literal("youtube"),
      v.literal("manual")
    )),
    category: v.optional(v.string()),
    trending: v.optional(v.boolean()),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
    sortBy: v.optional(v.union(
      v.literal("viralScore"),
      v.literal("createdAt"),
      v.literal("engagementTotal")
    )),
    sortOrder: v.optional(v.union(v.literal("asc"), v.literal("desc"))),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("trends");

    // Apply filters
    if (args.platform) {
      query = query.withIndex("by_platform", (q) => q.eq("platform", args.platform!));
    } else if (args.category && args.platform) {
      query = query.withIndex("by_platform_category", (q) => 
        q.eq("platform", args.platform!).eq("category", args.category!)
      );
    } else if (args.category) {
      query = query.withIndex("by_category", (q) => q.eq("category", args.category!));
    } else if (args.trending !== undefined) {
      query = query.withIndex("by_trending", (q) => q.eq("trending", args.trending!));
    } else {
      // Default to sorting by viral score
      query = query.withIndex("by_viral_score");
    }

    // Apply additional filters
    query = query.filter((q) => {
      let filter = q.gt(q.field("viralScore"), 0); // Only return scored trends
      
      if (args.category && !args.platform) {
        filter = q.and(filter, q.eq(q.field("category"), args.category));
      }
      
      if (args.trending !== undefined && !args.platform && !args.category) {
        filter = q.and(filter, q.eq(q.field("trending"), args.trending));
      }
      
      return filter;
    });

    // Apply sorting
    if (args.sortBy === "createdAt") {
      query = query.order(args.sortOrder === "asc" ? "asc" : "desc");
    } else {
      query = query.order(args.sortOrder === "asc" ? "asc" : "desc");
    }

    // Apply pagination
    const offset = args.offset || 0;
    const limit = Math.min(args.limit || 20, 100); // Cap at 100

    const trends = await query
      .take(limit + offset)
      .then(results => results.slice(offset));

    return trends;
  },
});

/**
 * Get trending content specifically
 */
export const getTrendingContent = query({
  args: {
    category: v.optional(v.string()),
    platform: v.optional(v.union(
      v.literal("reddit"),
      v.literal("twitter"),
      v.literal("tiktok"),
      v.literal("youtube")
    )),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit || 10, 50);
    
    let query = ctx.db.query("trends")
      .withIndex("by_trending", (q) => q.eq("trending", true));

    const trends = await query
      .filter((q) => {
        let filter = q.gt(q.field("viralScore"), 60); // High viral score threshold
        
        if (args.category) {
          filter = q.and(filter, q.eq(q.field("category"), args.category));
        }
        
        if (args.platform) {
          filter = q.and(filter, q.eq(q.field("platform"), args.platform));
        }
        
        return filter;
      })
      .order("desc")
      .take(limit);

    return trends;
  },
});

/**
 * Search trends by title or description
 */
export const searchTrends = query({
  args: {
    searchTerm: v.string(),
    category: v.optional(v.string()),
    platform: v.optional(v.union(
      v.literal("reddit"),
      v.literal("twitter"),
      v.literal("tiktok"),
      v.literal("youtube")
    )),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit || 20, 100);
    const searchLower = args.searchTerm.toLowerCase();
    
    const trends = await ctx.db.query("trends")
      .filter((q) => {
        let filter = q.or(
          q.contains(q.field("title"), searchLower),
          q.contains(q.field("description"), searchLower)
        );
        
        if (args.category) {
          filter = q.and(filter, q.eq(q.field("category"), args.category));
        }
        
        if (args.platform) {
          filter = q.and(filter, q.eq(q.field("platform"), args.platform));
        }
        
        return filter;
      })
      .order("desc")
      .take(limit);

    return trends;
  },
});

/**
 * Get trend by ID
 */
export const getTrend = query({
  args: { id: v.id("trends") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

/**
 * Get trend categories with counts
 */
export const getTrendCategories = query({
  args: {
    platform: v.optional(v.union(
      v.literal("reddit"),
      v.literal("twitter"),
      v.literal("tiktok"),
      v.literal("youtube")
    )),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("trends");
    
    if (args.platform) {
      query = query.withIndex("by_platform", (q) => q.eq("platform", args.platform!));
    }
    
    const trends = await query.collect();
    
    // Group by category and count
    const categoryMap = new Map<string, number>();
    
    trends.forEach(trend => {
      const current = categoryMap.get(trend.category) || 0;
      categoryMap.set(trend.category, current + 1);
    });
    
    // Convert to array and sort by count
    return Array.from(categoryMap.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);
  },
});

/**
 * Create or update a trend with viral score calculation
 */
export const upsertTrend = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    platform: v.union(
      v.literal("reddit"),
      v.literal("twitter"),
      v.literal("tiktok"),
      v.literal("youtube"),
      v.literal("manual")
    ),
    category: v.string(),
    engagementMetrics: v.object({
      likes: v.optional(v.number()),
      shares: v.optional(v.number()),
      comments: v.optional(v.number()),
      views: v.optional(v.number()),
      upvotes: v.optional(v.number()),
      score: v.optional(v.number()),
      retweets: v.optional(v.number()),
      replies: v.optional(v.number()),
    }),
    platformMetadata: v.optional(v.object({
      subreddit: v.optional(v.string()),
      authorId: v.optional(v.string()),
      postId: v.optional(v.string()),
      hashtags: v.optional(v.array(v.string())),
      mentions: v.optional(v.array(v.string())),
    })),
    tags: v.array(v.string()),
    sourceUrl: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    viralScore: v.optional(v.number()), // Manual override
    existingId: v.optional(v.id("trends")), // For updates
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Use provided viral score or calculate a basic one
    // Note: For now using a simplified calculation until we can import the algorithm
    const calculateBasicViralScore = (metrics: typeof args.engagementMetrics) => {
      const likes = metrics.likes || metrics.upvotes || 0;
      const engagement = likes + (metrics.shares || metrics.retweets || 0) * 2 + (metrics.comments || metrics.replies || 0) * 1.5;
      const views = metrics.views || Math.max(engagement * 10, 1);
      const ratio = engagement / views;
      return Math.min(Math.round(ratio * 1000 + Math.log10(engagement + 1) * 10), 100);
    };
    
    const viralScore = args.viralScore || calculateBasicViralScore(args.engagementMetrics);
    const trending = viralScore > 60; // Simple trending threshold
    
    const trendDoc = {
      title: args.title,
      description: args.description,
      platform: args.platform,
      category: args.category,
      viralScore,
      trending,
      engagementMetrics: args.engagementMetrics,
      platformMetadata: args.platformMetadata,
      tags: args.tags,
      sourceUrl: args.sourceUrl,
      imageUrl: args.imageUrl,
      scrapedAt: now,
      lastUpdated: now,
      createdAt: args.existingId ? (await ctx.db.get(args.existingId))?.createdAt || now : now,
    };
    
    if (args.existingId) {
      // Update existing trend
      await ctx.db.patch(args.existingId, trendDoc);
      return args.existingId;
    } else {
      // Check for duplicate by sourceUrl or title+platform
      const existing = await ctx.db.query("trends")
        .filter((q) => 
          args.sourceUrl 
            ? q.eq(q.field("sourceUrl"), args.sourceUrl)
            : q.and(
                q.eq(q.field("title"), args.title),
                q.eq(q.field("platform"), args.platform)
              )
        )
        .first();
        
      if (existing) {
        // Update existing
        await ctx.db.patch(existing._id, trendDoc);
        return existing._id;
      } else {
        // Create new
        return await ctx.db.insert("trends", trendDoc);
      }
    }
  },
});

/**
 * Delete a trend by ID
 */
export const deleteTrend = mutation({
  args: { id: v.id("trends") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return { success: true };
  },
});

/**
 * Update engagement metrics for a trend
 */
export const updateTrendMetrics = mutation({
  args: {
    trendId: v.id("trends"),
    engagementMetrics: v.object({
      likes: v.optional(v.number()),
      shares: v.optional(v.number()),
      comments: v.optional(v.number()),
      views: v.optional(v.number()),
      upvotes: v.optional(v.number()),
      score: v.optional(v.number()),
      retweets: v.optional(v.number()),
      replies: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args) => {
    const trend = await ctx.db.get(args.trendId);
    if (!trend) {
      throw new Error("Trend not found");
    }
    
    const now = Date.now();
    
    // Simple viral score recalculation
    const calculateBasicViralScore = (metrics: typeof args.engagementMetrics) => {
      const likes = metrics.likes || metrics.upvotes || 0;
      const engagement = likes + (metrics.shares || metrics.retweets || 0) * 2 + (metrics.comments || metrics.replies || 0) * 1.5;
      const views = metrics.views || Math.max(engagement * 10, 1);
      const ratio = engagement / views;
      return Math.min(Math.round(ratio * 1000 + Math.log10(engagement + 1) * 10), 100);
    };
    
    const viralScore = calculateBasicViralScore(args.engagementMetrics);
    const trending = viralScore > 60;
    
    await ctx.db.patch(args.trendId, {
      engagementMetrics: args.engagementMetrics,
      viralScore,
      trending,
      lastUpdated: now,
      scrapedAt: now,
    });
    
    return { viralScore, trending };
  },
});
