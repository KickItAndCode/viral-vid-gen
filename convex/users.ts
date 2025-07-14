import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

export const getUser = query({
  args: { clerkUserId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) =>
        q.eq("clerkUserId", args.clerkUserId)
      )
      .unique();

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
