import { useMutation, useQueryClient, UseMutationOptions } from "@tanstack/react-query";
import { useConvex } from "convex/react";
import { FunctionReference } from "convex/server";

type ConvexMutationOptions<TData, TError, TVariables> = Omit<
  UseMutationOptions<TData, TError, TVariables>,
  "mutationFn"
>;

/**
 * Custom hook that integrates React Query mutations with Convex mutations
 * Provides optimistic updates and automatic cache invalidation
 */
export function useConvexMutation<TData, TVariables = any>(
  mutation: FunctionReference<"mutation", "public", any, TData>,
  options?: ConvexMutationOptions<TData, Error, TVariables> & {
    invalidateQueries?: string[];
    optimisticUpdate?: {
      queryKey: string[];
      updater: (oldData: any, variables: TVariables) => any;
    };
  }
) {
  const convex = useConvex();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: TVariables) => {
      return await convex.mutation(mutation, variables);
    },
    onMutate: async (variables: TVariables) => {
      // Optimistic update
      if (options?.optimisticUpdate) {
        await queryClient.cancelQueries({ queryKey: options.optimisticUpdate.queryKey });
        
        const previousData = queryClient.getQueryData(options.optimisticUpdate.queryKey);
        
        queryClient.setQueryData(
          options.optimisticUpdate.queryKey,
          options.optimisticUpdate.updater(previousData, variables)
        );

        return { previousData };
      }
      return undefined;
    },
    onError: (err, variables, context: any) => {
      // Rollback optimistic update on error
      if (options?.optimisticUpdate && context?.previousData) {
        queryClient.setQueryData(
          options.optimisticUpdate.queryKey,
          context.previousData
        );
      }
      options?.onError?.(err, variables, context);
    },
    onSuccess: (data, variables, context: any) => {
      // Invalidate related queries
      if (options?.invalidateQueries) {
        options.invalidateQueries.forEach((queryKey) => {
          queryClient.invalidateQueries({ queryKey: [queryKey] });
        });
      }
      options?.onSuccess?.(data, variables, context);
    },
    onSettled: (data, error, variables, context: any) => {
      // Always refetch after mutation completes
      if (options?.optimisticUpdate) {
        queryClient.invalidateQueries({ queryKey: options.optimisticUpdate.queryKey });
      }
      options?.onSettled?.(data, error, variables, context);
    },
    ...options,
  });
}