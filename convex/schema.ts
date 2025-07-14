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
      v.literal("youtube")
    ),
    category: v.string(),
    viralScore: v.number(), // 0-100
    engagementMetrics: v.object({
      likes: v.optional(v.number()),
      shares: v.optional(v.number()),
      comments: v.optional(v.number()),
      views: v.optional(v.number()),
    }),
    tags: v.array(v.string()),
    sourceUrl: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    scrapedAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_platform", ["platform"])
    .index("by_category", ["category"])
    .index("by_viral_score", ["viralScore"])
    .index("by_created_at", ["createdAt"]),

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
    platform: v.string(),
    eventType: v.union(
      v.literal("view"),
      v.literal("share"),
      v.literal("like"),
      v.literal("comment"),
      v.literal("download")
    ),
    metadata: v.optional(
      v.object({
        duration: v.optional(v.number()),
        source: v.optional(v.string()),
        deviceType: v.optional(v.string()),
        location: v.optional(v.string()),
      })
    ),
    date: v.string(), // YYYY-MM-DD format
    timestamp: v.number(),
  })
    .index("by_video", ["videoId"])
    .index("by_user", ["userId"])
    .index("by_date", ["date"])
    .index("by_event_type", ["eventType"]),

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
