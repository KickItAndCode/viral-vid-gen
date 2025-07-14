import { api } from "@/convex/_generated/api";
import { useConvexQuery } from "./use-convex-query";
import { useConvexMutation } from "./use-convex-mutation";
import { Id } from "@/convex/_generated/dataModel";

/**
 * Get user by Clerk user ID
 */
export function useUser(clerkUserId: string) {
  return useConvexQuery(
    api.users.getUser,
    { clerkUserId },
    {
      enabled: !!clerkUserId,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
}

/**
 * Get user credits
 */
export function useUserCredits(userId: Id<"users">) {
  return useConvexQuery(
    api.users.getUserCredits,
    { userId },
    {
      enabled: !!userId,
      staleTime: 30 * 1000, // 30 seconds for frequently changing data
    }
  );
}

/**
 * Create new user
 */
export function useCreateUser() {
  return useConvexMutation(api.users.createUser, {
    invalidateQueries: ["users.getUser"],
  });
}

/**
 * Update user profile
 */
export function useUpdateUser() {
  return useConvexMutation(api.users.updateUser, {
    invalidateQueries: ["users.getUser", "users.getUserCredits"],
    optimisticUpdate: {
      queryKey: ["users.getUser"],
      updater: (oldData: any, variables: any) => {
        if (!oldData) return oldData;
        return { ...oldData, ...variables, updatedAt: Date.now() };
      },
    },
  });
}

/**
 * Consume user credit
 */
export function useConsumeCredit() {
  return useConvexMutation(api.users.consumeCredit, {
    invalidateQueries: ["users.getUserCredits"],
    optimisticUpdate: {
      queryKey: ["users.getUserCredits"],
      updater: (oldCredits: number) => Math.max(0, oldCredits - 1),
    },
  });
}