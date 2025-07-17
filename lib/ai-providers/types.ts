// Types for AI video generation providers

export type VideoProviderName = "veo" | "runway" | "luma" | "mock";

export interface VideoGenerationRequest {
  prompt: string;
  duration: number; // seconds (15, 30, etc.)
  style?: string;
  resolution?: "720p" | "1080p" | "4k";
  fps?: 24 | 30 | 60;
  aspectRatio?: "16:9" | "9:16" | "1:1";
  seed?: number;
  provider?: VideoProviderName;
  metadata?: Record<string, any>;
}

export interface VideoGenerationResponse {
  jobId: string;
  status: "queued" | "processing" | "completed" | "failed";
  videoUrl?: string;
  thumbnailUrl?: string;
  progress?: number; // 0-100
  estimatedCompletion?: number; // timestamp
  error?: string;
  metadata?: Record<string, any>;
}

export interface VideoProvider {
  name: VideoProviderName;
  generateVideo(
    request: VideoGenerationRequest
  ): Promise<VideoGenerationResponse>;
  getStatus(jobId: string): Promise<VideoGenerationResponse>;
  cancelGeneration?(jobId: string): Promise<void>;
  getCredits?(): Promise<number>;
  isAvailable(): Promise<boolean>;
  getPriority(): number;
  getTimeout(): number;
}

export interface ProviderConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  retryCount?: number;
  priority?: number; // 1-5, higher = preferred
}

export interface GenerationJob {
  id: string;
  provider: VideoProviderName;
  request: VideoGenerationRequest;
  status: VideoGenerationResponse["status"];
  createdAt: number;
  updatedAt: number;
  attempts: number;
  maxAttempts: number;
  priority: "low" | "normal" | "high";
  userId: string;
  trendId?: string;
}

export class VideoGenerationError extends Error {
  constructor(
    message: string,
    public provider: VideoProviderName,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = "VideoGenerationError";
  }
}

export class ProviderUnavailableError extends VideoGenerationError {
  constructor(provider: VideoProviderName, reason?: string) {
    super(
      `Provider ${provider} is unavailable${reason ? `: ${reason}` : ""}`,
      provider,
      "UNAVAILABLE"
    );
    this.name = "ProviderUnavailableError";
  }
}

export class QuotaExceededError extends VideoGenerationError {
  constructor(provider: VideoProviderName) {
    super(
      `Quota exceeded for provider ${provider}`,
      provider,
      "QUOTA_EXCEEDED"
    );
    this.name = "QuotaExceededError";
  }
}

export class GenerationTimeoutError extends VideoGenerationError {
  constructor(provider: VideoProviderName, timeout: number) {
    super(
      `Generation timeout after ${timeout}ms for provider ${provider}`,
      provider,
      "TIMEOUT"
    );
    this.name = "GenerationTimeoutError";
  }
}
