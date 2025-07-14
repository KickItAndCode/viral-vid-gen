import { QueryClient } from "@tanstack/react-query";

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Stale time: 5 minutes for most queries
        staleTime: 5 * 60 * 1000,
        // Cache time: 10 minutes
        gcTime: 10 * 60 * 1000,
        // Retry failed requests 3 times with exponential backoff
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        // Refetch on window focus for real-time data
        refetchOnWindowFocus: true,
        // Don't refetch on reconnect to avoid excessive requests
        refetchOnReconnect: false,
        // Don't refetch on mount if data is fresh
        refetchOnMount: true,
      },
      mutations: {
        // Retry mutations once on failure
        retry: 1,
        retryDelay: 1000,
      },
    },
  });
}

// Singleton instance for server-side rendering compatibility
let queryClient: QueryClient | undefined;

export function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always create a new query client
    return createQueryClient();
  } else {
    // Browser: create query client if it doesn't exist
    if (!queryClient) {
      queryClient = createQueryClient();
    }
    return queryClient;
  }
}
