import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    imageUrl: v.optional(v.string()),
    subscription: v.union(
      v.literal("free"),
      v.literal("pro"),
      v.literal("enterprise")
    ),
    credits: v.number(),
    clerkUserId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_clerk_user_id", ["clerkUserId"]),

  videos: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    userId: v.id("users"),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("cancelled")
    ),
    url: v.optional(v.string()),
    thumbnailUrl: v.optional(v.string()),
    duration: v.number(), // seconds
    viralScore: v.optional(v.number()), // 0-100
    metadata: v.object({
      provider: v.union(
        v.literal("veo"),
        v.literal("runway"),
        v.literal("luma")
      ),
      style: v.string(),
      trend: v.string(),
      prompt: v.optional(v.string()),
      resolution: v.optional(v.string()),
      fps: v.optional(v.number()),
    }),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_created_at", ["createdAt"]),

  trends: defineTable({
    title: v.string(),
    description: v.string(),
    platform: v.union(
      v.literal("reddit"),
      v.literal("twitter"),
      v.literal("tiktok"),
      v.literal("youtube"),
      v.literal("manual") // For manually added trends
    ),
    category: v.string(),
    viralScore: v.number(), // 0-100
    trending: v.boolean(), // Currently trending flag
    engagementMetrics: v.object({
      likes: v.optional(v.number()),
      shares: v.optional(v.number()),
      comments: v.optional(v.number()),
      views: v.optional(v.number()),
      upvotes: v.optional(v.number()), // Reddit specific
      score: v.optional(v.number()), // Reddit score
      retweets: v.optional(v.number()), // Twitter specific
      replies: v.optional(v.number()), // Twitter specific
    }),
    platformMetadata: v.optional(v.object({
      subreddit: v.optional(v.string()), // Reddit
      authorId: v.optional(v.string()),
      postId: v.optional(v.string()),
      hashtags: v.optional(v.array(v.string())), // Twitter
      mentions: v.optional(v.array(v.string())), // Twitter
    })),
    tags: v.array(v.string()),
    sourceUrl: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    scrapedAt: v.number(),
    lastUpdated: v.number(),
    createdAt: v.number(),
  })
    .index("by_platform", ["platform"])
    .index("by_category", ["category"])
    .index("by_viral_score", ["viralScore"])
    .index("by_trending", ["trending"])
    .index("by_created_at", ["createdAt"])
    .index("by_platform_category", ["platform", "category"]),

  videoJobs: defineTable({
    userId: v.id("users"),
    videoId: v.optional(v.id("videos")),
    status: v.union(
      v.literal("queued"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("cancelled")
    ),
    provider: v.union(v.literal("veo"), v.literal("runway"), v.literal("luma")),
    priority: v.union(v.literal("low"), v.literal("normal"), v.literal("high")),
    jobData: v.object({
      trend: v.string(),
      style: v.string(),
      duration: v.number(),
      prompt: v.optional(v.string()),
      script: v.optional(v.string()),
    }),
    progress: v.number(), // 0-100
    errorMessage: v.optional(v.string()),
    estimatedCompletion: v.optional(v.number()),
    retryCount: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_priority", ["priority"])
    .index("by_created_at", ["createdAt"]),

  analytics: defineTable({
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
      v.literal("direct") // Direct shares/views
    ),
    eventType: v.union(
      v.literal("view"),
      v.literal("share"),
      v.literal("like"),
      v.literal("comment"),
      v.literal("download"),
      v.literal("click"),
      v.literal("impression"),
      v.literal("completion"), // Video watched to end
      v.literal("engagement") // General engagement metric
    ),
    metrics: v.object({
      count: v.number(), // Number of events
      value: v.optional(v.number()), // Monetary value if applicable
      duration: v.optional(v.number()), // Watch duration for views
      completionRate: v.optional(v.number()), // Percentage watched
      clickThroughRate: v.optional(v.number()), // CTR for impressions
    }),
    metadata: v.object({
      source: v.optional(v.string()), // Traffic source
      deviceType: v.optional(v.string()), // mobile, desktop, tablet
      browserType: v.optional(v.string()), // Chrome, Safari, etc.
      location: v.optional(v.string()), // Geographic location
      userAgent: v.optional(v.string()), // User agent string
      referrer: v.optional(v.string()), // Referrer URL
      campaignId: v.optional(v.string()), // Marketing campaign ID
      sessionId: v.optional(v.string()), // User session ID
    }),
    date: v.string(), // YYYY-MM-DD format
    hour: v.number(), // 0-23 for hourly analytics
    timestamp: v.number(),
  })
    .index("by_video", ["videoId"])
    .index("by_user", ["userId"])
    .index("by_date", ["date"])
    .index("by_event_type", ["eventType"])
    .index("by_platform", ["platform"])
    .index("by_video_date", ["videoId", "date"])
    .index("by_user_date", ["userId", "date"])
    .index("by_platform_date", ["platform", "date"]),

  videoPerformance: defineTable({
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
      v.literal("overall") // Aggregated across all platforms
    ),
    metrics: v.object({
      views: v.number(),
      likes: v.number(),
      shares: v.number(),
      comments: v.number(),
      downloads: v.number(),
      impressions: v.number(),
      clickThroughRate: v.number(), // CTR percentage
      engagementRate: v.number(), // Engagement percentage
      averageWatchTime: v.number(), // Average watch time in seconds
      completionRate: v.number(), // Percentage who watched to end
      viralCoefficient: v.number(), // Viral spread coefficient
      reachRate: v.number(), // Reach as percentage of impressions
    }),
    demographics: v.object({
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
    }),
    timeSeriesData: v.array(v.object({
      date: v.string(),
      hour: v.number(),
      views: v.number(),
      engagement: v.number(),
    })),
    lastUpdated: v.number(),
    createdAt: v.number(),
  })
    .index("by_video", ["videoId"])
    .index("by_user", ["userId"])
    .index("by_platform", ["platform"])
    .index("by_video_platform", ["videoId", "platform"]),

  userAnalytics: defineTable({
    userId: v.id("users"),
    period: v.union(
      v.literal("daily"),
      v.literal("weekly"),
      v.literal("monthly"),
      v.literal("quarterly"),
      v.literal("yearly")
    ),
    date: v.string(), // YYYY-MM-DD format
    metrics: v.object({
      videosCreated: v.number(),
      totalViews: v.number(),
      totalLikes: v.number(),
      totalShares: v.number(),
      totalComments: v.number(),
      totalDownloads: v.number(),
      averageViralScore: v.number(),
      topPerformingVideoId: v.optional(v.id("videos")),
      engagementGrowth: v.number(), // Percentage growth
      reachGrowth: v.number(), // Percentage growth
      followerGrowth: v.number(), // Percentage growth
    }),
    platformBreakdown: v.object({
      youtube: v.object({ views: v.number(), engagement: v.number() }),
      tiktok: v.object({ views: v.number(), engagement: v.number() }),
      instagram: v.object({ views: v.number(), engagement: v.number() }),
      twitter: v.object({ views: v.number(), engagement: v.number() }),
      facebook: v.object({ views: v.number(), engagement: v.number() }),
      linkedin: v.object({ views: v.number(), engagement: v.number() }),
      snapchat: v.object({ views: v.number(), engagement: v.number() }),
      reddit: v.object({ views: v.number(), engagement: v.number() }),
    }),
    insights: v.array(v.object({
      type: v.union(
        v.literal("performance"),
        v.literal("audience"),
        v.literal("content"),
        v.literal("timing"),
        v.literal("trend")
      ),
      title: v.string(),
      description: v.string(),
      impact: v.union(v.literal("high"), v.literal("medium"), v.literal("low")),
      actionable: v.boolean(),
    })),
    lastUpdated: v.number(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_period", ["period"])
    .index("by_date", ["date"])
    .index("by_user_period", ["userId", "period"]),

  userPreferences: defineTable({
    userId: v.id("users"),
    preferences: v.object({
      defaultStyle: v.optional(v.string()),
      defaultProvider: v.optional(
        v.union(v.literal("veo"), v.literal("runway"), v.literal("luma"))
      ),
      defaultDuration: v.optional(v.number()),
      categories: v.optional(v.array(v.string())),
      notifications: v.object({
        email: v.boolean(),
        browser: v.boolean(),
        videoComplete: v.boolean(),
        weeklyDigest: v.boolean(),
      }),
    }),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),
});
