"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { startVideoGenerationWorker, VideoGenerationWorker } from "@/lib/workers/video-generation-worker";

interface VideoGenerationContextType {
  worker: VideoGenerationWorker | null;
  isWorkerRunning: boolean;
  startWorker: () => Promise<void>;
  stopWorker: () => Promise<void>;
}

const VideoGenerationContext = createContext<VideoGenerationContextType | null>(null);

interface VideoGenerationProviderProps {
  children: React.ReactNode;
}

export function VideoGenerationProvider({ children }: VideoGenerationProviderProps) {
  const { user } = useUser();
  const [worker, setWorker] = useState<VideoGenerationWorker | null>(null);
  const [isWorkerRunning, setIsWorkerRunning] = useState(false);

  const startWorker = async () => {
    try {
      const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
      if (!convexUrl) {
        console.error("NEXT_PUBLIC_CONVEX_URL is not configured");
        return;
      }

      if (!user?.id) {
        console.log("⏸️ User not authenticated, skipping worker start");
        return;
      }

      console.log("🚀 Starting video generation worker...");
      const workerInstance = await startVideoGenerationWorker(convexUrl, user.id);
      setWorker(workerInstance);
      setIsWorkerRunning(true);
      console.log("✅ Video generation worker started successfully");
    } catch (error) {
      console.error("❌ Failed to start video generation worker:", error);
    }
  };

  const stopWorker = async () => {
    if (worker) {
      await worker.stop();
      setWorker(null);
      setIsWorkerRunning(false);
      console.log("⏹️ Video generation worker stopped");
    }
  };

  // Auto-start worker when user is authenticated
  useEffect(() => {
    if (user?.id) {
      startWorker();
    }

    // Cleanup on unmount
    return () => {
      if (worker) {
        worker.stop();
      }
    };
  }, [user?.id]);

  // Monitor window visibility to pause/resume worker
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isWorkerRunning) {
        console.log("⏸️ Pausing worker (tab hidden)");
        // We could implement pause functionality here
      } else if (!document.hidden && !isWorkerRunning && worker) {
        console.log("▶️ Resuming worker (tab visible)");
        startWorker();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isWorkerRunning, worker]);

  return (
    <VideoGenerationContext.Provider
      value={{
        worker,
        isWorkerRunning,
        startWorker,
        stopWorker,
      }}
    >
      {children}
    </VideoGenerationContext.Provider>
  );
}

export function useVideoGenerationWorker() {
  const context = useContext(VideoGenerationContext);
  if (!context) {
    throw new Error("useVideoGenerationWorker must be used within VideoGenerationProvider");
  }
  return context;
}

export default VideoGenerationProvider;