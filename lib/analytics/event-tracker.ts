import React from "react";
import { useMutation } from "@tanstack/react-query";
import { useConvex } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export type Platform =
  | "youtube"
  | "tiktok"
  | "instagram"
  | "twitter"
  | "facebook"
  | "linkedin"
  | "snapchat"
  | "reddit"
  | "direct";

export type EventType =
  | "view"
  | "share"
  | "like"
  | "comment"
  | "download"
  | "click"
  | "impression"
  | "completion"
  | "engagement";

export interface EventMetrics {
  count: number;
  value?: number;
  duration?: number;
  completionRate?: number;
  clickThroughRate?: number;
}

export interface EventMetadata {
  source?: string;
  deviceType?: string;
  browserType?: string;
  location?: string;
  userAgent?: string;
  referrer?: string;
  campaignId?: string;
  sessionId?: string;
}

export interface AnalyticsEvent {
  videoId: Id<"videos">;
  userId: Id<"users">;
  platform: Platform;
  eventType: EventType;
  metrics: EventMetrics;
  metadata?: EventMetadata;
}

class EventTracker {
  private convex: any;
  private userId: Id<"users"> | null = null;
  private sessionId: string;
  private batchEvents: AnalyticsEvent[] = [];
  private batchTimeout: NodeJS.Timeout | null = null;
  private readonly BATCH_SIZE = 10;
  private readonly BATCH_TIMEOUT = 5000; // 5 seconds

  constructor() {
    this.sessionId = this.generateSessionId();

    // Auto-detect device and browser info
    this.detectEnvironment();
  }

  public setConvex(convex: any) {
    this.convex = convex;
  }

  public setUserId(userId: Id<"users">) {
    this.userId = userId;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private detectEnvironment(): EventMetadata {
    const userAgent =
      typeof navigator !== "undefined" ? navigator.userAgent : "";
    const deviceType = this.getDeviceType();
    const browserType = this.getBrowserType();

    return {
      userAgent,
      deviceType,
      browserType,
      referrer: typeof document !== "undefined" ? document.referrer : undefined,
      sessionId: this.sessionId,
    };
  }

  private getDeviceType(): string {
    if (typeof navigator === "undefined") return "unknown";

    const userAgent = navigator.userAgent;
    if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
      return "tablet";
    }
    if (
      /mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(
        userAgent
      )
    ) {
      return "mobile";
    }
    return "desktop";
  }

  private getBrowserType(): string {
    if (typeof navigator === "undefined") return "unknown";

    const userAgent = navigator.userAgent;
    if (userAgent.includes("Chrome")) return "chrome";
    if (userAgent.includes("Firefox")) return "firefox";
    if (userAgent.includes("Safari")) return "safari";
    if (userAgent.includes("Edge")) return "edge";
    if (userAgent.includes("Opera")) return "opera";
    return "unknown";
  }

  public async track(event: AnalyticsEvent): Promise<void> {
    if (!this.userId) {
      console.warn("EventTracker: User ID not set, skipping event");
      return;
    }

    if (!this.convex) {
      console.warn("EventTracker: Convex not initialized, skipping event");
      return;
    }

    // Merge environment metadata
    const envMetadata = this.detectEnvironment();
    const eventWithMetadata = {
      ...event,
      userId: this.userId,
      metadata: {
        ...envMetadata,
        ...event.metadata,
      },
    };

    // Add to batch
    this.batchEvents.push(eventWithMetadata);

    // Process batch if it's full or after timeout
    if (this.batchEvents.length >= this.BATCH_SIZE) {
      await this.processBatch();
    } else {
      this.scheduleBatchProcessing();
    }
  }

  private scheduleBatchProcessing(): void {
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
    }

    this.batchTimeout = setTimeout(async () => {
      await this.processBatch();
    }, this.BATCH_TIMEOUT);
  }

  private async processBatch(): Promise<void> {
    if (this.batchEvents.length === 0) return;

    const events = [...this.batchEvents];
    this.batchEvents = [];

    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }

    try {
      // Process events in parallel
      await Promise.all(
        events.map((event) =>
          this.convex.mutation(api.analytics.trackEvent, event)
        )
      );
    } catch (error) {
      console.error("EventTracker: Failed to process batch:", error);
      // Re-add failed events to batch for retry
      this.batchEvents.unshift(...events);
    }
  }

  // Convenience methods for common events
  public async trackView(
    videoId: Id<"videos">,
    platform: Platform,
    duration?: number,
    completionRate?: number
  ): Promise<void> {
    await this.track({
      videoId,
      userId: this.userId!,
      platform,
      eventType: "view",
      metrics: {
        count: 1,
        duration,
        completionRate,
      },
    });
  }

  public async trackShare(
    videoId: Id<"videos">,
    platform: Platform,
    source?: string
  ): Promise<void> {
    await this.track({
      videoId,
      userId: this.userId!,
      platform,
      eventType: "share",
      metrics: {
        count: 1,
      },
      metadata: {
        source,
      },
    });
  }

  public async trackLike(
    videoId: Id<"videos">,
    platform: Platform
  ): Promise<void> {
    await this.track({
      videoId,
      userId: this.userId!,
      platform,
      eventType: "like",
      metrics: {
        count: 1,
      },
    });
  }

  public async trackComment(
    videoId: Id<"videos">,
    platform: Platform
  ): Promise<void> {
    await this.track({
      videoId,
      userId: this.userId!,
      platform,
      eventType: "comment",
      metrics: {
        count: 1,
      },
    });
  }

  public async trackDownload(
    videoId: Id<"videos">,
    platform: Platform = "direct"
  ): Promise<void> {
    await this.track({
      videoId,
      userId: this.userId!,
      platform,
      eventType: "download",
      metrics: {
        count: 1,
      },
    });
  }

  public async trackClick(
    videoId: Id<"videos">,
    platform: Platform,
    clickThroughRate?: number
  ): Promise<void> {
    await this.track({
      videoId,
      userId: this.userId!,
      platform,
      eventType: "click",
      metrics: {
        count: 1,
        clickThroughRate,
      },
    });
  }

  public async trackImpression(
    videoId: Id<"videos">,
    platform: Platform
  ): Promise<void> {
    await this.track({
      videoId,
      userId: this.userId!,
      platform,
      eventType: "impression",
      metrics: {
        count: 1,
      },
    });
  }

  public async trackCompletion(
    videoId: Id<"videos">,
    platform: Platform,
    completionRate: number
  ): Promise<void> {
    await this.track({
      videoId,
      userId: this.userId!,
      platform,
      eventType: "completion",
      metrics: {
        count: 1,
        completionRate,
      },
    });
  }

  public async trackEngagement(
    videoId: Id<"videos">,
    platform: Platform,
    engagementValue: number
  ): Promise<void> {
    await this.track({
      videoId,
      userId: this.userId!,
      platform,
      eventType: "engagement",
      metrics: {
        count: 1,
        value: engagementValue,
      },
    });
  }

  // Flush any remaining events (useful for page unload)
  public async flush(): Promise<void> {
    if (this.batchEvents.length > 0) {
      await this.processBatch();
    }
  }
}

// Singleton instance
export const eventTracker = new EventTracker();

// React hook for easy usage
export function useEventTracker() {
  const convex = useConvex();

  // Initialize convex if not already done
  if (!eventTracker["convex"]) {
    eventTracker.setConvex(convex);
  }

  return eventTracker;
}

// Higher-order component for automatic event tracking
export function withEventTracking<P extends object>(
  Component: React.ComponentType<P>,
  trackingConfig?: {
    trackViews?: boolean;
    trackClicks?: boolean;
    trackImpressions?: boolean;
  }
) {
  return function TrackedComponent(props: P) {
    const tracker = useEventTracker();

    React.useEffect(() => {
      // Track impression when component mounts
      if (trackingConfig?.trackImpressions) {
        // This would need video ID and platform context
        // Implementation depends on how props are structured
      }
    }, [tracker]);

    return React.createElement(Component, props);
  };
}

// Hook for tracking video playback
export function useVideoPlaybackTracking(
  videoId: Id<"videos">,
  platform: Platform
) {
  const tracker = useEventTracker();
  const [trackingState, setTrackingState] = React.useState({
    hasStarted: false,
    startTime: 0,
    lastProgressUpdate: 0,
  });

  const trackStart = React.useCallback(() => {
    if (!trackingState.hasStarted) {
      tracker.trackView(videoId, platform);
      setTrackingState((prev) => ({
        ...prev,
        hasStarted: true,
        startTime: Date.now(),
      }));
    }
  }, [videoId, platform, tracker, trackingState.hasStarted]);

  const trackProgress = React.useCallback(
    (currentTime: number, duration: number) => {
      const completionRate = (currentTime / duration) * 100;

      // Track progress every 25% milestone
      const milestone = Math.floor(completionRate / 25) * 25;
      if (milestone > trackingState.lastProgressUpdate && milestone > 0) {
        setTrackingState((prev) => ({
          ...prev,
          lastProgressUpdate: milestone,
        }));
      }
    },
    [trackingState.lastProgressUpdate]
  );

  const trackEnd = React.useCallback(
    (currentTime: number, duration: number) => {
      const completionRate = (currentTime / duration) * 100;
      const watchDuration = Date.now() - trackingState.startTime;

      if (completionRate >= 95) {
        tracker.trackCompletion(videoId, platform, completionRate);
      }

      // Track final view with duration
      tracker.trackView(videoId, platform, watchDuration, completionRate);
    },
    [videoId, platform, tracker, trackingState.startTime]
  );

  return {
    trackStart,
    trackProgress,
    trackEnd,
  };
}

// React import
import React from "react";
