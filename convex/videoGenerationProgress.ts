import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

/**
 * Update video generation job progress in real-time
 */
export const updateJobProgress = mutation({
  args: {
    jobId: v.id("videoJobs"),
    progress: v.number(),
    estimatedCompletion: v.optional(v.number()),
    providerJobId: v.optional(v.string()),
    metadata: v.optional(v.object({
      currentStep: v.optional(v.string()),
      totalSteps: v.optional(v.number()),
      processingDetails: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const { jobId, metadata, ...updates } = args;
    const now = Date.now();

    const job = await ctx.db.get(jobId);
    if (!job) {
      throw new Error("Job not found");
    }

    // Ensure progress is within valid range
    const progress = Math.min(Math.max(args.progress, 0), 100);

    // Update job progress
    await ctx.db.patch(jobId, {
      progress,
      estimatedCompletion: args.estimatedCompletion,
      providerJobId: args.providerJobId,
      updatedAt: now,
      ...(metadata && {
        metadata: {
          ...job.metadata,
          ...metadata,
        },
      }),
    });

    return { jobId, progress, updatedAt: now };
  },
});

/**
 * Get real-time progress for a specific job
 */
export const getJobProgress = query({
  args: { jobId: v.id("videoJobs") },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    if (!job) return null;

    return {
      jobId: job._id,
      status: job.status,
      progress: job.progress || 0,
      estimatedCompletion: job.estimatedCompletion,
      providerJobId: job.providerJobId,
      metadata: job.metadata,
      updatedAt: job.updatedAt,
      createdAt: job.createdAt,
    };
  },
});

/**
 * Subscribe to progress updates for all user jobs
 */
export const watchUserJobProgress = query({
  args: { 
    userId: v.id("users"),
    activeOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("videoJobs")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc");

    if (args.activeOnly) {
      query = query.filter((q) => 
        q.or(
          q.eq(q.field("status"), "queued"),
          q.eq(q.field("status"), "processing")
        )
      );
    }

    const jobs = await query.take(20);

    return jobs.map(job => ({
      jobId: job._id,
      status: job.status,
      progress: job.progress || 0,
      estimatedCompletion: job.estimatedCompletion,
      providerJobId: job.providerJobId,
      provider: job.provider,
      priority: job.priority,
      metadata: job.metadata,
      updatedAt: job.updatedAt,
      createdAt: job.createdAt,
      videoId: job.videoId,
    }));
  },
});

/**
 * Subscribe to real-time queue statistics
 */
export const watchQueueStats = query({
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
      } as Record<string, number>,
      byPriority: {
        low: 0,
        normal: 0,
        high: 0,
      } as Record<string, number>,
      averageProcessingTime: 0,
      estimatedWaitTime: 0,
    };

    let totalProcessingTime = 0;
    let completedCount = 0;
    let queuedJobs = 0;
    let processingJobs = 0;

    jobs.forEach(job => {
      // Count by status
      stats[job.status as keyof typeof stats]++;
      
      // Count by provider
      if (stats.byProvider[job.provider] !== undefined) {
        stats.byProvider[job.provider]++;
      } else {
        stats.byProvider[job.provider] = 1;
      }
      
      // Count by priority
      stats.byPriority[job.priority]++;
      
      // Calculate processing times
      if (job.status === "completed" && job.estimatedCompletion) {
        totalProcessingTime += job.estimatedCompletion;
        completedCount++;
      }
      
      // Count active jobs for wait time estimation
      if (job.status === "queued") queuedJobs++;
      if (job.status === "processing") processingJobs++;
    });

    // Calculate average processing time
    if (completedCount > 0) {
      stats.averageProcessingTime = totalProcessingTime / completedCount;
    }

    // Estimate wait time for new jobs (simple calculation)
    const avgProcessingTime = stats.averageProcessingTime || 180000; // Default 3 minutes
    const maxConcurrentJobs = 3; // From queue config
    const activeJobs = processingJobs;
    const waitingJobs = queuedJobs;
    
    if (activeJobs < maxConcurrentJobs) {
      stats.estimatedWaitTime = 0; // Can start immediately
    } else {
      // Estimate based on queue position and average processing time
      const avgWaitPerJob = avgProcessingTime / maxConcurrentJobs;
      stats.estimatedWaitTime = avgWaitPerJob * Math.ceil(waitingJobs / maxConcurrentJobs);
    }

    return stats;
  },
});

/**
 * Create a progress milestone for detailed tracking
 */
export const createProgressMilestone = mutation({
  args: {
    jobId: v.id("videoJobs"),
    milestone: v.string(),
    description: v.optional(v.string()),
    progress: v.number(),
    timestamp: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = args.timestamp || Date.now();
    
    // This could be stored in a separate milestones table for detailed tracking
    // For now, we'll update the job metadata
    const job = await ctx.db.get(args.jobId);
    if (!job) {
      throw new Error("Job not found");
    }

    const milestones = job.metadata?.milestones || [];
    milestones.push({
      milestone: args.milestone,
      description: args.description,
      progress: args.progress,
      timestamp: now,
    });

    await ctx.db.patch(args.jobId, {
      progress: args.progress,
      metadata: {
        ...job.metadata,
        milestones,
        currentMilestone: args.milestone,
      },
      updatedAt: now,
    });

    return { success: true, milestone: args.milestone };
  },
});

/**
 * Batch update multiple job progresses (for queue manager)
 */
export const batchUpdateProgress = mutation({
  args: {
    updates: v.array(v.object({
      jobId: v.id("videoJobs"),
      progress: v.number(),
      estimatedCompletion: v.optional(v.number()),
      status: v.optional(v.union(
        v.literal("queued"),
        v.literal("processing"),
        v.literal("completed"),
        v.literal("failed"),
        v.literal("cancelled")
      )),
    })),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const results = [];

    for (const update of args.updates) {
      try {
        const job = await ctx.db.get(update.jobId);
        if (!job) {
          results.push({ jobId: update.jobId, success: false, error: "Job not found" });
          continue;
        }

        const updateData: any = {
          progress: Math.min(Math.max(update.progress, 0), 100),
          updatedAt: now,
        };

        if (update.estimatedCompletion) {
          updateData.estimatedCompletion = update.estimatedCompletion;
        }

        if (update.status) {
          updateData.status = update.status;
        }

        await ctx.db.patch(update.jobId, updateData);
        results.push({ jobId: update.jobId, success: true });
      } catch (error) {
        results.push({ 
          jobId: update.jobId, 
          success: false, 
          error: error instanceof Error ? error.message : "Unknown error"
        });
      }
    }

    return { results, updatedAt: now };
  },
});