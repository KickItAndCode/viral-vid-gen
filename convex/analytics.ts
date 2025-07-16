import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

// Track individual analytics events
export const trackEvent = mutation({
  args: {
    videoId: v.id("videos"),
    userId: v.id("users"),
    platform: v.union(
      v.literal("youtube"),
      v.literal("tiktok"),
      v.literal("instagram"),
      v.literal("twitter"),
      v.literal("facebook"),
      v.literal("linkedin"),
      v.literal("snapchat"),
      v.literal("reddit"),
      v.literal("direct")
    ),
    eventType: v.union(
      v.literal("view"),
      v.literal("share"),
      v.literal("like"),
      v.literal("comment"),
      v.literal("download"),
      v.literal("click"),
      v.literal("impression"),
      v.literal("completion"),
      v.literal("engagement")
    ),
    metrics: v.object({
      count: v.number(),
      value: v.optional(v.number()),
      duration: v.optional(v.number()),
      completionRate: v.optional(v.number()),
      clickThroughRate: v.optional(v.number()),
    }),
    metadata: v.optional(v.object({
      source: v.optional(v.string()),
      deviceType: v.optional(v.string()),
      browserType: v.optional(v.string()),
      location: v.optional(v.string()),
      userAgent: v.optional(v.string()),
      referrer: v.optional(v.string()),
      campaignId: v.optional(v.string()),
      sessionId: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const date = new Date(now).toISOString().split('T')[0]; // YYYY-MM-DD
    const hour = new Date(now).getHours();

    await ctx.db.insert("analytics", {
      videoId: args.videoId,
      userId: args.userId,
      platform: args.platform,
      eventType: args.eventType,
      metrics: args.metrics,
      metadata: args.metadata || {},
      date,
      hour,
      timestamp: now,
    });
  },
});

// Get analytics for a specific video
export const getVideoAnalytics = query({
  args: {
    videoId: v.id("videos"),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    platform: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let analyticsQuery = ctx.db
      .query("analytics")
      .withIndex("by_video", (q) => q.eq("videoId", args.videoId));

    if (args.startDate) {
      analyticsQuery = analyticsQuery.filter((q) => 
        q.gte(q.field("date"), args.startDate!)
      );
    }

    if (args.endDate) {
      analyticsQuery = analyticsQuery.filter((q) => 
        q.lte(q.field("date"), args.endDate!)
      );
    }

    if (args.platform) {
      analyticsQuery = analyticsQuery.filter((q) => 
        q.eq(q.field("platform"), args.platform!)
      );
    }

    const analytics = await analyticsQuery.collect();

    // Aggregate metrics
    const summary = analytics.reduce((acc, event) => {
      const platform = event.platform;
      if (!acc[platform]) {
        acc[platform] = {
          views: 0,
          likes: 0,
          shares: 0,
          comments: 0,
          downloads: 0,
          impressions: 0,
          totalDuration: 0,
          totalCompletions: 0,
          totalClicks: 0,
        };
      }

      switch (event.eventType) {
        case "view":
          acc[platform].views += event.metrics.count;
          if (event.metrics.duration) {
            acc[platform].totalDuration += event.metrics.duration;
          }
          break;
        case "like":
          acc[platform].likes += event.metrics.count;
          break;
        case "share":
          acc[platform].shares += event.metrics.count;
          break;
        case "comment":
          acc[platform].comments += event.metrics.count;
          break;
        case "download":
          acc[platform].downloads += event.metrics.count;
          break;
        case "impression":
          acc[platform].impressions += event.metrics.count;
          break;
        case "completion":
          acc[platform].totalCompletions += event.metrics.count;
          break;
        case "click":
          acc[platform].totalClicks += event.metrics.count;
          break;
      }

      return acc;
    }, {} as Record<string, any>);

    // Calculate derived metrics
    Object.keys(summary).forEach(platform => {
      const platformData = summary[platform];
      platformData.engagementRate = platformData.views > 0 
        ? ((platformData.likes + platformData.shares + platformData.comments) / platformData.views * 100)
        : 0;
      platformData.completionRate = platformData.views > 0 
        ? (platformData.totalCompletions / platformData.views * 100)
        : 0;
      platformData.clickThroughRate = platformData.impressions > 0 
        ? (platformData.totalClicks / platformData.impressions * 100)
        : 0;
      platformData.averageWatchTime = platformData.views > 0 
        ? (platformData.totalDuration / platformData.views)
        : 0;
    });

    return {
      summary,
      events: analytics,
      totalEvents: analytics.length,
    };
  },
});

// Get user analytics overview
export const getUserAnalytics = query({
  args: {
    userId: v.id("users"),
    period: v.union(
      v.literal("daily"),
      v.literal("weekly"),
      v.literal("monthly"),
      v.literal("quarterly"),
      v.literal("yearly")
    ),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get user analytics records
    let analyticsQuery = ctx.db
      .query("userAnalytics")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("period"), args.period));

    if (args.startDate) {
      analyticsQuery = analyticsQuery.filter((q) => 
        q.gte(q.field("date"), args.startDate!)
      );
    }

    if (args.endDate) {
      analyticsQuery = analyticsQuery.filter((q) => 
        q.lte(q.field("date"), args.endDate!)
      );
    }

    const userAnalytics = await analyticsQuery.collect();

    // Get user's videos for additional context
    const videos = await ctx.db
      .query("videos")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // Get recent analytics events for trending calculation
    const recentEvents = await ctx.db
      .query("analytics")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.gte(q.field("timestamp"), Date.now() - 24 * 60 * 60 * 1000)) // Last 24 hours
      .collect();

    return {
      analytics: userAnalytics,
      totalVideos: videos.length,
      recentActivity: recentEvents.length,
      averageViralScore: videos.reduce((acc, video) => acc + (video.viralScore || 0), 0) / videos.length || 0,
    };
  },
});

// Get video performance data
export const getVideoPerformance = query({
  args: {
    videoId: v.id("videos"),
    platform: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let performanceQuery = ctx.db
      .query("videoPerformance")
      .withIndex("by_video", (q) => q.eq("videoId", args.videoId));

    if (args.platform) {
      performanceQuery = performanceQuery.filter((q) => 
        q.eq(q.field("platform"), args.platform!)
      );
    }

    const performance = await performanceQuery.collect();
    
    // Get the video details for context
    const video = await ctx.db.get(args.videoId);
    
    return {
      performance,
      video,
      platforms: performance.map(p => p.platform),
    };
  },
});

// Update video performance metrics (called by background job)
export const updateVideoPerformance = mutation({
  args: {
    videoId: v.id("videos"),
    platform: v.union(
      v.literal("youtube"),
      v.literal("tiktok"),
      v.literal("instagram"),
      v.literal("twitter"),
      v.literal("facebook"),
      v.literal("linkedin"),
      v.literal("snapchat"),
      v.literal("reddit"),
      v.literal("overall")
    ),
    metrics: v.object({
      views: v.number(),
      likes: v.number(),
      shares: v.number(),
      comments: v.number(),
      downloads: v.number(),
      impressions: v.number(),
      clickThroughRate: v.number(),
      engagementRate: v.number(),
      averageWatchTime: v.number(),
      completionRate: v.number(),
      viralCoefficient: v.number(),
      reachRate: v.number(),
    }),
    demographics: v.optional(v.object({
      ageGroups: v.object({
        "_13_17": v.number(),
        "_18_24": v.number(),
        "_25_34": v.number(),
        "_35_44": v.number(),
        "_45_54": v.number(),
        "_55_64": v.number(),
        "_65_plus": v.number(),
      }),
      genders: v.object({
        male: v.number(),
        female: v.number(),
        other: v.number(),
      }),
      topCountries: v.array(v.object({
        country: v.string(),
        percentage: v.number(),
      })),
      topCities: v.array(v.object({
        city: v.string(),
        percentage: v.number(),
      })),
    })),
    timeSeriesData: v.optional(v.array(v.object({
      date: v.string(),
      hour: v.number(),
      views: v.number(),
      engagement: v.number(),
    }))),
  },
  handler: async (ctx, args) => {
    const video = await ctx.db.get(args.videoId);
    if (!video) {
      throw new Error("Video not found");
    }

    // Check if performance record exists
    const existingPerformance = await ctx.db
      .query("videoPerformance")
      .withIndex("by_video_platform", (q) => 
        q.eq("videoId", args.videoId).eq("platform", args.platform)
      )
      .first();

    const now = Date.now();
    const performanceData = {
      videoId: args.videoId,
      userId: video.userId,
      platform: args.platform,
      metrics: args.metrics,
      demographics: args.demographics || {
        ageGroups: {
          "_13_17": 0,
          "_18_24": 0,
          "_25_34": 0,
          "_35_44": 0,
          "_45_54": 0,
          "_55_64": 0,
          "_65_plus": 0,
        },
        genders: {
          male: 0,
          female: 0,
          other: 0,
        },
        topCountries: [],
        topCities: [],
      },
      timeSeriesData: args.timeSeriesData || [],
      lastUpdated: now,
    };

    if (existingPerformance) {
      await ctx.db.patch(existingPerformance._id, performanceData);
    } else {
      await ctx.db.insert("videoPerformance", {
        ...performanceData,
        createdAt: now,
      });
    }
  },
});

// Get platform comparison data
export const getPlatformComparison = query({
  args: {
    userId: v.id("users"),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get all user's analytics within date range
    let analyticsQuery = ctx.db
      .query("analytics")
      .withIndex("by_user", (q) => q.eq("userId", args.userId));

    if (args.startDate) {
      analyticsQuery = analyticsQuery.filter((q) => 
        q.gte(q.field("date"), args.startDate!)
      );
    }

    if (args.endDate) {
      analyticsQuery = analyticsQuery.filter((q) => 
        q.lte(q.field("date"), args.endDate!)
      );
    }

    const analytics = await analyticsQuery.collect();

    // Group by platform
    const platformData = analytics.reduce((acc, event) => {
      const platform = event.platform;
      if (!acc[platform]) {
        acc[platform] = {
          views: 0,
          likes: 0,
          shares: 0,
          comments: 0,
          downloads: 0,
          impressions: 0,
          engagementRate: 0,
          completionRate: 0,
          clickThroughRate: 0,
        };
      }

      switch (event.eventType) {
        case "view":
          acc[platform].views += event.metrics.count;
          break;
        case "like":
          acc[platform].likes += event.metrics.count;
          break;
        case "share":
          acc[platform].shares += event.metrics.count;
          break;
        case "comment":
          acc[platform].comments += event.metrics.count;
          break;
        case "download":
          acc[platform].downloads += event.metrics.count;
          break;
        case "impression":
          acc[platform].impressions += event.metrics.count;
          break;
      }

      return acc;
    }, {} as Record<string, any>);

    // Calculate engagement rates
    Object.keys(platformData).forEach(platform => {
      const data = platformData[platform];
      data.engagementRate = data.views > 0 
        ? ((data.likes + data.shares + data.comments) / data.views * 100)
        : 0;
    });

    return platformData;
  },
});

// Get trending insights for dashboard
export const getTrendingInsights = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    
    // Get user's recent videos
    const videos = await ctx.db
      .query("videos")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(limit);

    // Get recent analytics for trending analysis
    const recentAnalytics = await ctx.db
      .query("analytics")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.gte(q.field("timestamp"), Date.now() - 7 * 24 * 60 * 60 * 1000)) // Last 7 days
      .collect();

    // Calculate trending metrics
    const trendingVideos = videos.map(video => {
      const videoAnalytics = recentAnalytics.filter(a => a.videoId === video._id);
      const totalViews = videoAnalytics
        .filter(a => a.eventType === "view")
        .reduce((sum, a) => sum + a.metrics.count, 0);
      
      const totalEngagement = videoAnalytics
        .filter(a => ["like", "share", "comment"].includes(a.eventType))
        .reduce((sum, a) => sum + a.metrics.count, 0);

      return {
        ...video,
        recentViews: totalViews,
        recentEngagement: totalEngagement,
        engagementRate: totalViews > 0 ? (totalEngagement / totalViews * 100) : 0,
      };
    });

    // Sort by engagement rate
    trendingVideos.sort((a, b) => b.engagementRate - a.engagementRate);

    return {
      trendingVideos: trendingVideos.slice(0, limit),
      totalVideos: videos.length,
      averageEngagement: trendingVideos.reduce((sum, v) => sum + v.engagementRate, 0) / trendingVideos.length || 0,
    };
  },
});