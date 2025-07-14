import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

export const createVideo = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    userId: v.id("users"),
    duration: v.number(),
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
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const videoId = await ctx.db.insert("videos", {
      title: args.title,
      description: args.description,
      userId: args.userId,
      status: "pending",
      duration: args.duration,
      metadata: args.metadata,
      createdAt: now,
      updatedAt: now,
    });

    return videoId;
  },
});

export const updateVideoStatus = mutation({
  args: {
    videoId: v.id("videos"),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("cancelled")
    ),
    url: v.optional(v.string()),
    thumbnailUrl: v.optional(v.string()),
    viralScore: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { videoId, ...updates } = args;

    await ctx.db.patch(videoId, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

export const getUserVideos = query({
  args: {
    userId: v.id("users"),
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("processing"),
        v.literal("completed"),
        v.literal("failed"),
        v.literal("cancelled")
      )
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("videos")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc");

    if (args.status) {
      query = query.filter((q) => q.eq(q.field("status"), args.status));
    }

    const limit = args.limit || 20;
    return await query.take(limit);
  },
});

export const getVideo = query({
  args: { videoId: v.id("videos") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.videoId);
  },
});

export const deleteVideo = mutation({
  args: { videoId: v.id("videos") },
  handler: async (ctx, args) => {
    // Delete associated analytics
    const analytics = await ctx.db
      .query("analytics")
      .withIndex("by_video", (q) => q.eq("videoId", args.videoId))
      .collect();

    for (const analytic of analytics) {
      await ctx.db.delete(analytic._id);
    }

    // Delete the video
    await ctx.db.delete(args.videoId);
  },
});

export const getVideosByTrend = query({
  args: {
    trend: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const videos = await ctx.db
      .query("videos")
      .filter((q) => q.eq(q.field("metadata.trend"), args.trend))
      .order("desc")
      .take(args.limit || 10);

    return videos;
  },
});

export const getVideosByStatus = query({
  args: {
    userId: v.id("users"),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("cancelled")
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const videos = await ctx.db
      .query("videos")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("status"), args.status))
      .order("desc")
      .take(args.limit || 20);

    return videos;
  },
});

export const updateVideoUrl = mutation({
  args: {
    videoId: v.id("videos"),
    url: v.string(),
    thumbnailUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.videoId, {
      url: args.url,
      thumbnailUrl: args.thumbnailUrl,
      status: "completed",
      updatedAt: Date.now(),
    });
  },
});
