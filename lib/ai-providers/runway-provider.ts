import { BaseVideoProvider } from "./base-provider";
import {
  VideoGenerationRequest,
  VideoGenerationResponse,
  ProviderConfig,
  VideoGenerationError,
} from "./types";

interface RunwayGenerationRequest {
  promptText: string;
  model: string;
  seconds: number;
  ratio?: string;
  watermark?: boolean;
  enhance_prompt?: boolean;
  seed?: number;
  motion_score?: number;
  style?: string;
}

interface RunwayTask {
  id: string;
  status: "PENDING" | "RUNNING" | "SUCCEEDED" | "FAILED" | "CANCELLED";
  output?: string[];
  progress?: number;
  eta?: number;
  error?: string;
  created_at: string;
  updated_at: string;
}

export class RunwayProvider extends BaseVideoProvider {
  name: "runway" = "runway";
  private baseUrl: string;

  constructor(config: ProviderConfig) {
    super(config);
    this.baseUrl = config.baseUrl || "https://api.runwayml.com/v1";
  }

  async generateVideo(
    request: VideoGenerationRequest
  ): Promise<VideoGenerationResponse> {
    this.validateRequest(request);

    const runwayRequest: RunwayGenerationRequest = {
      promptText: request.prompt,
      model: "gen3a_turbo", // Default Runway model
      seconds: request.duration,
      ratio: this.mapAspectRatio(request.aspectRatio),
      watermark: false,
      enhance_prompt: true,
      seed: request.seed,
      motion_score: 20, // Default motion score
      style: request.style,
    };

    try {
      const response = await this.makeRequest<{ task: RunwayTask }>(
        `${this.baseUrl}/tasks`,
        {
          method: "POST",
          body: JSON.stringify(runwayRequest),
        }
      );

      return this.mapResponse(response.task);
    } catch (error) {
      if (error instanceof VideoGenerationError) {
        throw error;
      }
      throw new VideoGenerationError(
        `Runway generation failed: ${error.message}`,
        this.name,
        "GENERATION_FAILED"
      );
    }
  }

  async getStatus(jobId: string): Promise<VideoGenerationResponse> {
    try {
      const response = await this.makeRequest<RunwayTask>(
        `${this.baseUrl}/tasks/${jobId}`
      );

      return this.mapResponse(response);
    } catch (error) {
      if (error instanceof VideoGenerationError) {
        throw error;
      }
      throw new VideoGenerationError(
        `Runway status check failed: ${error.message}`,
        this.name,
        "STATUS_CHECK_FAILED"
      );
    }
  }

  async cancelGeneration(jobId: string): Promise<void> {
    try {
      await this.makeRequest(`${this.baseUrl}/tasks/${jobId}/cancel`, {
        method: "POST",
      });
    } catch (error) {
      throw new VideoGenerationError(
        `Runway cancellation failed: ${error.message}`,
        this.name,
        "CANCELLATION_FAILED"
      );
    }
  }

  async getCredits(): Promise<number> {
    try {
      const response = await this.makeRequest<{ credits: number }>(
        `${this.baseUrl}/account`
      );
      return response.credits;
    } catch (error) {
      throw new VideoGenerationError(
        `Runway credits check failed: ${error.message}`,
        this.name,
        "CREDITS_CHECK_FAILED"
      );
    }
  }

  protected async healthCheck(): Promise<void> {
    try {
      await this.makeRequest(
        `${this.baseUrl}/models`,
        { method: "GET" },
        5000 // 5 second timeout for health check
      );
    } catch (error) {
      throw new Error(`Runway health check failed: ${error.message}`);
    }
  }

  private mapAspectRatio(ratio?: string): string {
    const aspectRatioMap: Record<string, string> = {
      "16:9": "1280:768",
      "9:16": "768:1280",
      "1:1": "1024:1024",
    };
    return aspectRatioMap[ratio || "16:9"] || "1280:768";
  }

  private mapResponse(runwayTask: RunwayTask): VideoGenerationResponse {
    return {
      id: runwayTask.id,
      status: this.mapRunwayStatus(runwayTask.status),
      url: runwayTask.output?.[0], // First output is usually the video
      thumbnailUrl: this.generateThumbnailUrl(runwayTask.output?.[0]),
      progress: runwayTask.progress,
      estimatedTime: runwayTask.eta,
      error: runwayTask.error,
      metadata: {
        provider: "runway",
        createdAt: runwayTask.created_at,
        updatedAt: runwayTask.updated_at,
        outputs: runwayTask.output,
      },
    };
  }

  private mapRunwayStatus(status: string): VideoGenerationResponse["status"] {
    const statusMap: Record<string, VideoGenerationResponse["status"]> = {
      PENDING: "queued",
      RUNNING: "processing",
      SUCCEEDED: "completed",
      FAILED: "failed",
      CANCELLED: "failed",
    };
    return statusMap[status] || "queued";
  }

  private generateThumbnailUrl(videoUrl?: string): string | undefined {
    if (!videoUrl) return undefined;
    // Runway typically provides thumbnails alongside videos
    // This is a placeholder - actual implementation would depend on Runway's API
    return videoUrl.replace(/\.(mp4|mov)$/i, "_thumbnail.jpg");
  }

  protected validateRequest(request: VideoGenerationRequest): void {
    super.validateRequest(request);

    // Runway-specific validations
    if (request.duration < 4 || request.duration > 10) {
      throw new VideoGenerationError(
        "Runway supports video duration between 4 and 10 seconds",
        this.name,
        "INVALID_DURATION"
      );
    }

    if (request.prompt.length > 500) {
      throw new VideoGenerationError(
        "Runway prompt must be 500 characters or less",
        this.name,
        "PROMPT_TOO_LONG"
      );
    }

    // Runway has specific resolution requirements
    if (request.resolution && !["720p", "1080p"].includes(request.resolution)) {
      throw new VideoGenerationError(
        "Runway supports 720p or 1080p resolution only",
        this.name,
        "INVALID_RESOLUTION"
      );
    }
  }
}

// Factory function for easy instantiation
export function createRunwayProvider(
  apiKey: string,
  config?: Partial<ProviderConfig>
): RunwayProvider {
  return new RunwayProvider({
    apiKey,
    priority: 5, // Highest priority for Runway (industry leader)
    timeout: 900000, // 15 minutes for video generation
    ...config,
  });
}
