import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

export const getUser = query({
  args: { clerkUserId: v.string() },
  handler: async (ctx, args) => {
    // Handle potential duplicates by getting the first user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) =>
        q.eq("clerkUserId", args.clerkUserId)
      )
      .first();

    return user;
  },
});

export const createUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    imageUrl: v.optional(v.string()),
    clerkUserId: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user already exists to prevent duplicates
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) =>
        q.eq("clerkUserId", args.clerkUserId)
      )
      .first();

    if (existingUser) {
      // Return existing user ID instead of creating duplicate
      return existingUser._id;
    }

    const now = Date.now();

    const userId = await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      imageUrl: args.imageUrl,
      subscription: "free",
      credits: 3, // Free tier starts with 3 credits
      clerkUserId: args.clerkUserId,
      createdAt: now,
      updatedAt: now,
    });

    // Create default user preferences
    await ctx.db.insert("userPreferences", {
      userId,
      preferences: {
        notifications: {
          email: true,
          browser: true,
          videoComplete: true,
          weeklyDigest: false,
        },
      },
      createdAt: now,
      updatedAt: now,
    });

    return userId;
  },
});

export const updateUser = mutation({
  args: {
    userId: v.id("users"),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    subscription: v.optional(
      v.union(v.literal("free"), v.literal("pro"), v.literal("enterprise"))
    ),
  },
  handler: async (ctx, args) => {
    const { userId, ...updates } = args;

    await ctx.db.patch(userId, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

export const getUserCredits = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    return user?.credits ?? 0;
  },
});

export const consumeCredit = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    if (user.credits <= 0) {
      throw new Error("Insufficient credits");
    }

    await ctx.db.patch(args.userId, {
      credits: user.credits - 1,
      updatedAt: Date.now(),
    });

    return user.credits - 1;
  },
});

// Cleanup function to remove duplicate users (keep the oldest one)
export const cleanupDuplicateUsers = mutation({
  args: { clerkUserId: v.string() },
  handler: async (ctx, args) => {
    const users = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) =>
        q.eq("clerkUserId", args.clerkUserId)
      )
      .collect();

    if (users.length <= 1) {
      return { message: "No duplicates found", kept: users[0]?._id };
    }

    // Sort by creation time, keep the oldest one
    users.sort((a, b) => a.createdAt - b.createdAt);
    const userToKeep = users[0];
    const usersToDelete = users.slice(1);

    // Delete duplicate users
    for (const user of usersToDelete) {
      await ctx.db.delete(user._id);
    }

    return {
      message: `Cleaned up ${usersToDelete.length} duplicate users`,
      kept: userToKeep._id,
      deleted: usersToDelete.map(u => u._id),
    };
  },
});
