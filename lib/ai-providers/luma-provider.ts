import { BaseVideoProvider } from "./base-provider";
import {
  VideoGenerationRequest,
  VideoGenerationResponse,
  ProviderConfig,
  VideoGenerationError,
} from "./types";

interface LumaGenerationRequest {
  prompt: string;
  aspect_ratio?: string;
  loop?: boolean;
  keyframes?: {
    frame0?: {
      type: "generation";
      text: string;
    };
    frame1?: {
      type: "generation";
      text: string;
    };
  };
  user_id?: string;
}

interface LumaGeneration {
  id: string;
  state: "queued" | "dreaming" | "completed" | "failed";
  video?: {
    url: string;
    thumbnail?: string;
    width: number;
    height: number;
  };
  failure_reason?: string;
  created_at: string;
  assets?: {
    video?: string;
    thumbnail?: string;
  };
  progress?: number;
  estimated_time?: number;
}

export class LumaProvider extends BaseVideoProvider {
  name: "luma" = "luma";
  private baseUrl: string;

  constructor(config: ProviderConfig) {
    super(config);
    this.baseUrl = config.baseUrl || "https://api.lumalabs.ai/dream-machine/v1";
  }

  async generateVideo(
    request: VideoGenerationRequest
  ): Promise<VideoGenerationResponse> {
    this.validateRequest(request);

    const lumaRequest: LumaGenerationRequest = {
      prompt: request.prompt,
      aspect_ratio: this.mapAspectRatio(request.aspectRatio),
      loop: false, // Default to no loop
      keyframes: {
        frame0: {
          type: "generation",
          text: request.prompt,
        },
      },
    };

    try {
      const response = await this.makeRequest<LumaGeneration>(
        `${this.baseUrl}/generations`,
        {
          method: "POST",
          body: JSON.stringify(lumaRequest),
        }
      );

      return this.mapResponse(response);
    } catch (error) {
      if (error instanceof VideoGenerationError) {
        throw error;
      }
      throw new VideoGenerationError(
        `Luma generation failed: ${error.message}`,
        this.name,
        "GENERATION_FAILED"
      );
    }
  }

  async getStatus(jobId: string): Promise<VideoGenerationResponse> {
    try {
      const response = await this.makeRequest<LumaGeneration>(
        `${this.baseUrl}/generations/${jobId}`
      );

      return this.mapResponse(response);
    } catch (error) {
      if (error instanceof VideoGenerationError) {
        throw error;
      }
      throw new VideoGenerationError(
        `Luma status check failed: ${error.message}`,
        this.name,
        "STATUS_CHECK_FAILED"
      );
    }
  }

  async cancelGeneration(jobId: string): Promise<void> {
    try {
      await this.makeRequest(`${this.baseUrl}/generations/${jobId}`, {
        method: "DELETE",
      });
    } catch (error) {
      throw new VideoGenerationError(
        `Luma cancellation failed: ${error.message}`,
        this.name,
        "CANCELLATION_FAILED"
      );
    }
  }

  async getCredits(): Promise<number> {
    try {
      const response = await this.makeRequest<{ credits: number }>(
        `${this.baseUrl}/credits`
      );
      return response.credits;
    } catch (error) {
      throw new VideoGenerationError(
        `Luma credits check failed: ${error.message}`,
        this.name,
        "CREDITS_CHECK_FAILED"
      );
    }
  }

  protected async healthCheck(): Promise<void> {
    try {
      await this.makeRequest(
        `${this.baseUrl}/generations`,
        {
          method: "GET",
          // Add a limit parameter to minimize response size
        },
        5000 // 5 second timeout for health check
      );
    } catch (error) {
      throw new Error(`Luma health check failed: ${error.message}`);
    }
  }

  private mapAspectRatio(ratio?: string): string {
    const aspectRatioMap: Record<string, string> = {
      "16:9": "16:9",
      "9:16": "9:16",
      "1:1": "1:1",
    };
    return aspectRatioMap[ratio || "16:9"] || "16:9";
  }

  private mapResponse(lumaGeneration: LumaGeneration): VideoGenerationResponse {
    return {
      id: lumaGeneration.id,
      status: this.mapLumaStatus(lumaGeneration.state),
      url: lumaGeneration.video?.url || lumaGeneration.assets?.video,
      thumbnailUrl:
        lumaGeneration.video?.thumbnail || lumaGeneration.assets?.thumbnail,
      progress: lumaGeneration.progress,
      estimatedTime: lumaGeneration.estimated_time,
      error: lumaGeneration.failure_reason,
      metadata: {
        provider: "luma",
        createdAt: lumaGeneration.created_at,
        dimensions: lumaGeneration.video
          ? {
              width: lumaGeneration.video.width,
              height: lumaGeneration.video.height,
            }
          : undefined,
      },
    };
  }

  private mapLumaStatus(state: string): VideoGenerationResponse["status"] {
    const statusMap: Record<string, VideoGenerationResponse["status"]> = {
      queued: "queued",
      dreaming: "processing",
      completed: "completed",
      failed: "failed",
    };
    return statusMap[state] || "queued";
  }

  protected validateRequest(request: VideoGenerationRequest): void {
    super.validateRequest(request);

    // Luma-specific validations
    // Luma Dream Machine generates ~5 second videos by default
    if (request.duration !== 5) {
      console.warn(
        `Luma generates ~5 second videos, requested duration ${request.duration}s will be ignored`
      );
    }

    if (request.prompt.length > 1000) {
      throw new VideoGenerationError(
        "Luma prompt must be 1000 characters or less",
        this.name,
        "PROMPT_TOO_LONG"
      );
    }

    // Luma has fixed aspect ratios
    const supportedRatios = ["16:9", "9:16", "1:1"];
    if (request.aspectRatio && !supportedRatios.includes(request.aspectRatio)) {
      throw new VideoGenerationError(
        `Luma supports aspect ratios: ${supportedRatios.join(", ")}`,
        this.name,
        "INVALID_ASPECT_RATIO"
      );
    }
  }
}

// Factory function for easy instantiation
export function createLumaProvider(
  apiKey: string,
  config?: Partial<ProviderConfig>
): LumaProvider {
  return new LumaProvider({
    apiKey,
    priority: 3, // Medium priority for Luma
    timeout: 600000, // 10 minutes for video generation
    ...config,
  });
}
