import { api } from "@/convex/_generated/api";
import { useConvexQuery } from "./use-convex-query";
import { useConvexMutation } from "./use-convex-mutation";
import { Id } from "@/convex/_generated/dataModel";

type VideoStatus = "pending" | "processing" | "completed" | "failed" | "cancelled";

/**
 * Get user's videos
 */
export function useUserVideos(userId: Id<"users">) {
  return useConvexQuery(
    api.videos.getUserVideos,
    { userId },
    {
      enabled: !!userId,
      staleTime: 30 * 1000, // 30 seconds for user videos
    }
  );
}

/**
 * Get videos by status
 */
export function useVideosByStatus(userId: Id<"users">, status: VideoStatus) {
  return useConvexQuery(
    api.videos.getVideosByStatus,
    { userId, status },
    {
      enabled: !!userId && !!status,
      staleTime: 10 * 1000, // 10 seconds for status-based queries
    }
  );
}

/**
 * Get single video by ID
 */
export function useVideo(videoId: Id<"videos">) {
  return useConvexQuery(
    api.videos.getVideo,
    { videoId },
    {
      enabled: !!videoId,
      staleTime: 60 * 1000, // 1 minute for individual videos
    }
  );
}

/**
 * Create new video
 */
export function useCreateVideo() {
  return useConvexMutation(api.videos.createVideo, {
    invalidateQueries: ["videos.getUserVideos", "videos.getVideosByStatus"],
  });
}

/**
 * Update video status
 */
export function useUpdateVideoStatus() {
  return useConvexMutation(api.videos.updateVideoStatus, {
    invalidateQueries: ["videos.getUserVideos", "videos.getVideosByStatus", "videos.getVideo"],
    optimisticUpdate: {
      queryKey: ["videos.getVideo"],
      updater: (oldData: any, variables: any) => {
        if (!oldData) return oldData;
        return { ...oldData, status: variables.status, updatedAt: Date.now() };
      },
    },
  });
}

/**
 * Update video URL (when processing completes)
 */
export function useUpdateVideoUrl() {
  return useConvexMutation(api.videos.updateVideoUrl, {
    invalidateQueries: ["videos.getUserVideos", "videos.getVideo"],
    optimisticUpdate: {
      queryKey: ["videos.getVideo"],
      updater: (oldData: any, variables: any) => {
        if (!oldData) return oldData;
        return { 
          ...oldData, 
          url: variables.url,
          thumbnailUrl: variables.thumbnailUrl,
          status: "completed",
          updatedAt: Date.now() 
        };
      },
    },
  });
}

/**
 * Delete video
 */
export function useDeleteVideo() {
  return useConvexMutation(api.videos.deleteVideo, {
    invalidateQueries: ["videos.getUserVideos", "videos.getVideosByStatus"],
  });
}