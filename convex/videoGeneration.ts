import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

/**
 * Create a video generation job
 */
export const createVideoGenerationJob = mutation({
  args: {
    userId: v.id("users"),
    trendId: v.id("trends"),
    title: v.string(),
    description: v.optional(v.string()),
    provider: v.union(v.literal("veo"), v.literal("runway"), v.literal("luma")),
    style: v.string(),
    duration: v.number(),
    priority: v.union(v.literal("low"), v.literal("normal"), v.literal("high")),
    prompt: v.string(),
    metadata: v.object({
      aspectRatio: v.optional(v.string()),
      resolution: v.optional(v.string()),
      fps: v.optional(v.number()),
      targetPlatform: v.optional(v.string()),
      tone: v.optional(v.string()),
      visualStyle: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Create video record
    const videoId = await ctx.db.insert("videos", {
      title: args.title,
      description: args.description,
      userId: args.userId,
      status: "pending",
      duration: args.duration,
      metadata: {
        provider: args.provider,
        style: args.style,
        trend: args.trendId,
        prompt: args.prompt,
        resolution: args.metadata.resolution,
        fps: args.metadata.fps,
      },
      createdAt: now,
      updatedAt: now,
    });

    // Create video job
    const jobId = await ctx.db.insert("videoJobs", {
      userId: args.userId,
      videoId,
      status: "queued",
      provider: args.provider,
      priority: args.priority,
      jobData: {
        trend: args.trendId,
        style: args.style,
        duration: args.duration,
        prompt: args.prompt,
        script: args.description,
      },
      progress: 0,
      retryCount: 0,
      createdAt: now,
      updatedAt: now,
    });

    return { videoId, jobId };
  },
});

/**
 * Update video generation job status
 */
export const updateVideoGenerationJob = mutation({
  args: {
    jobId: v.id("videoJobs"),
    status: v.union(
      v.literal("queued"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("cancelled")
    ),
    progress: v.optional(v.number()),
    errorMessage: v.optional(v.string()),
    estimatedCompletion: v.optional(v.number()),
    providerJobId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { jobId, ...updates } = args;
    const now = Date.now();

    const job = await ctx.db.get(jobId);
    if (!job) {
      throw new Error("Job not found");
    }

    // Update job
    await ctx.db.patch(jobId, {
      ...updates,
      updatedAt: now,
    });

    // Update associated video status if job is completed or failed
    if (job.videoId && (args.status === "completed" || args.status === "failed")) {
      await ctx.db.patch(job.videoId, {
        status: args.status,
        updatedAt: now,
      });
    }

    return job.videoId;
  },
});

/**
 * Update video with final URLs and completion data
 */
export const completeVideoGeneration = mutation({
  args: {
    videoId: v.id("videos"),
    url: v.string(),
    thumbnailUrl: v.optional(v.string()),
    viralScore: v.optional(v.number()),
    metadata: v.optional(v.object({
      provider: v.optional(v.string()),
      providerJobId: v.optional(v.string()),
      generationTime: v.optional(v.number()),
      finalPrompt: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const { videoId, metadata, ...videoUpdates } = args;
    const now = Date.now();

    const video = await ctx.db.get(videoId);
    if (!video) {
      throw new Error("Video not found");
    }

    // Update video with completion data
    await ctx.db.patch(videoId, {
      ...videoUpdates,
      status: "completed",
      metadata: {
        ...video.metadata,
        ...metadata,
      },
      updatedAt: now,
    });

    return videoId;
  },
});

/**
 * Get user's video generation jobs
 */
export const getUserVideoJobs = query({
  args: {
    userId: v.id("users"),
    status: v.optional(
      v.union(
        v.literal("queued"),
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
      .query("videoJobs")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc");

    if (args.status) {
      query = query.filter((q) => q.eq(q.field("status"), args.status));
    }

    const limit = args.limit || 20;
    return await query.take(limit);
  },
});

/**
 * Get video generation job with video details
 */
export const getVideoJobWithDetails = query({
  args: { jobId: v.id("videoJobs") },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    if (!job) return null;

    let video = null;
    if (job.videoId) {
      video = await ctx.db.get(job.videoId);
    }

    return { job, video };
  },
});

/**
 * Cancel a video generation job
 */
export const cancelVideoGenerationJob = mutation({
  args: { jobId: v.id("videoJobs") },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    if (!job) {
      throw new Error("Job not found");
    }

    if (job.status === "completed") {
      throw new Error("Cannot cancel completed job");
    }

    const now = Date.now();

    // Update job status
    await ctx.db.patch(args.jobId, {
      status: "cancelled",
      updatedAt: now,
    });

    // Update video status if exists
    if (job.videoId) {
      await ctx.db.patch(job.videoId, {
        status: "cancelled",
        updatedAt: now,
      });
    }

    return true;
  },
});

/**
 * Get generation queue statistics
 */
export const getGenerationQueueStats = query({
  args: {},
  handler: async (ctx) => {
    const jobs = await ctx.db.query("videoJobs").collect();
    
    const stats = {
      total: jobs.length,
      queued: 0,
      processing: 0,
      completed: 0,
      failed: 0,
      cancelled: 0,
      byProvider: {
        veo: 0,
        runway: 0,
        luma: 0,
      },
      averageProcessingTime: 0,
    };

    let totalProcessingTime = 0;
    let completedCount = 0;

    jobs.forEach(job => {
      stats[job.status as keyof typeof stats]++;
      stats.byProvider[job.provider]++;
      
      if (job.status === "completed" && job.estimatedCompletion) {
        totalProcessingTime += job.estimatedCompletion;
        completedCount++;
      }
    });

    if (completedCount > 0) {
      stats.averageProcessingTime = totalProcessingTime / completedCount;
    }

    return stats;
  },
});

/**
 * Retry a failed video generation job
 */
export const retryVideoGenerationJob = mutation({
  args: { jobId: v.id("videoJobs") },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    if (!job) {
      throw new Error("Job not found");
    }

    if (job.status !== "failed") {
      throw new Error("Can only retry failed jobs");
    }

    if (job.retryCount >= 3) {
      throw new Error("Maximum retry attempts reached");
    }

    const now = Date.now();

    // Reset job to queued status
    await ctx.db.patch(args.jobId, {
      status: "queued",
      progress: 0,
      errorMessage: undefined,
      retryCount: job.retryCount + 1,
      updatedAt: now,
    });

    // Reset video status if exists
    if (job.videoId) {
      await ctx.db.patch(job.videoId, {
        status: "pending",
        updatedAt: now,
      });
    }

    return true;
  },
});

/**
 * Action to initiate video generation workflow
 */
export const initiateVideoGeneration = action({
  args: {
    userId: v.id("users"),
    trendId: v.id("trends"),
    options: v.object({
      style: v.optional(v.string()),
      duration: v.optional(v.number()),
      provider: v.optional(v.union(v.literal("veo"), v.literal("runway"), v.literal("luma"))),
      priority: v.optional(v.union(v.literal("low"), v.literal("normal"), v.literal("high"))),
      targetPlatform: v.optional(v.string()),
      tone: v.optional(v.string()),
      visualStyle: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    // Get trend data
    const trend = await ctx.runQuery("trends.getTrend", { id: args.trendId });
    if (!trend) {
      throw new Error("Trend not found");
    }

    // Generate script (this would integrate with the AIScriptGenerator)
    const script = {
      prompt: `Create a ${args.options.style || "entertaining"} video about "${trend.title}" - ${trend.description}`,
      duration: args.options.duration || 15,
      style: args.options.style || "entertaining",
    };

    // Create video generation job
    const result = await ctx.runMutation("videoGeneration.createVideoGenerationJob", {
      userId: args.userId,
      trendId: args.trendId,
      title: `${trend.title} - AI Generated Video`,
      description: script.prompt,
      provider: args.options.provider || "runway",
      style: script.style,
      duration: script.duration,
      priority: args.options.priority || "normal",
      prompt: script.prompt,
      metadata: {
        aspectRatio: "16:9",
        resolution: "1080p",
        fps: 30,
        targetPlatform: args.options.targetPlatform,
        tone: args.options.tone,
        visualStyle: args.options.visualStyle,
      },
    });

    return result;
  },
});