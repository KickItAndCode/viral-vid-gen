import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { useConvexAuth } from "convex/react";
import { FunctionReference, getFunctionName } from "convex/server";
import { useConvex } from "convex/react";

type ConvexQueryOptions<T> = Omit<
  UseQueryOptions<T, Error, T, string[]>,
  "queryKey" | "queryFn"
>;

/**
 * Custom hook that integrates React Query with Convex queries
 * Provides caching, background updates, and optimistic updates
 */
export function useConvexQuery<T>(
  query: FunctionReference<"query", "public", any, T>,
  args: any,
  options?: ConvexQueryOptions<T>
) {
  const convex = useConvex();
  
  // In development, bypass auth checks
  const isDevelopment = process.env.NODE_ENV === 'development';
  let isAuthenticated = true;
  let authLoading = false;
  
  if (!isDevelopment) {
    const auth = useConvexAuth();
    isAuthenticated = auth.isAuthenticated;
    authLoading = auth.isLoading;
  }

  const queryKey = [getFunctionName(query), JSON.stringify(args)];

  return useQuery({
    queryKey,
    queryFn: async () => {
      return await convex.query(query, args);
    },
    enabled: !authLoading && isAuthenticated,
    staleTime: 30 * 1000, // 30 seconds for real-time data
    gcTime: 5 * 60 * 1000, // 5 minutes cache
    ...options,
  });
}

/**
 * Hook for queries that don't require authentication
 */
export function useConvexQueryPublic<T>(
  query: FunctionReference<"query", "public", any, T>,
  args: any,
  options?: ConvexQueryOptions<T>
) {
  const convex = useConvex();

  const queryKey = [getFunctionName(query), JSON.stringify(args)];

  return useQuery({
    queryKey,
    queryFn: async () => {
      return await convex.query(query, args);
    },
    staleTime: 2 * 60 * 1000, // 2 minutes for public data
    gcTime: 10 * 60 * 1000, // 10 minutes cache
    ...options,
  });
}