import { BaseVideoProvider } from "./base-provider";
import {
  VideoGenerationRequest,
  VideoGenerationResponse,
  ProviderConfig,
  VideoGenerationError,
} from "./types";

interface VeoGenerationRequest {
  prompt: string;
  duration_seconds: number;
  aspect_ratio?: string;
  resolution?: string;
  fps?: number;
  style?: string;
  seed?: number;
}

interface VeoGenerationResponse {
  generation_id: string;
  status: "pending" | "processing" | "completed" | "failed";
  video_url?: string;
  thumbnail_url?: string;
  progress?: number;
  estimated_time?: number;
  error?: string;
  created_at: string;
  updated_at: string;
}

export class VeoProvider extends BaseVideoProvider {
  name: "veo" = "veo";
  private baseUrl: string;

  constructor(config: ProviderConfig) {
    super(config);
    this.baseUrl =
      config.baseUrl || "https://videogeneration.googleapis.com/v1";
  }

  async generateVideo(
    request: VideoGenerationRequest
  ): Promise<VideoGenerationResponse> {
    this.validateRequest(request);

    const veoRequest: VeoGenerationRequest = {
      prompt: request.prompt,
      duration_seconds: request.duration,
      aspect_ratio: this.mapAspectRatio(request.aspectRatio),
      resolution: request.resolution || "1080p",
      fps: request.fps || 30,
      style: request.style,
      seed: request.seed,
    };

    try {
      const response = await this.makeRequest<VeoGenerationResponse>(
        `${this.baseUrl}/generate`,
        {
          method: "POST",
          body: JSON.stringify(veoRequest),
        }
      );

      return this.mapResponse(response);
    } catch (error) {
      if (error instanceof VideoGenerationError) {
        throw error;
      }
      throw new VideoGenerationError(
        `Veo generation failed: ${error.message}`,
        this.name,
        "GENERATION_FAILED"
      );
    }
  }

  async getStatus(jobId: string): Promise<VideoGenerationResponse> {
    try {
      const response = await this.makeRequest<VeoGenerationResponse>(
        `${this.baseUrl}/generations/${jobId}`
      );

      return this.mapResponse(response);
    } catch (error) {
      if (error instanceof VideoGenerationError) {
        throw error;
      }
      throw new VideoGenerationError(
        `Veo status check failed: ${error.message}`,
        this.name,
        "STATUS_CHECK_FAILED"
      );
    }
  }

  async cancelGeneration(jobId: string): Promise<void> {
    try {
      await this.makeRequest(`${this.baseUrl}/generations/${jobId}/cancel`, {
        method: "POST",
      });
    } catch (error) {
      throw new VideoGenerationError(
        `Veo cancellation failed: ${error.message}`,
        this.name,
        "CANCELLATION_FAILED"
      );
    }
  }

  async getCredits(): Promise<number> {
    try {
      const response = await this.makeRequest<{ credits: number }>(
        `${this.baseUrl}/account/credits`
      );
      return response.credits;
    } catch (error) {
      throw new VideoGenerationError(
        `Veo credits check failed: ${error.message}`,
        this.name,
        "CREDITS_CHECK_FAILED"
      );
    }
  }

  protected async healthCheck(): Promise<void> {
    try {
      await this.makeRequest(
        `${this.baseUrl}/health`,
        { method: "GET" },
        5000 // 5 second timeout for health check
      );
    } catch (error) {
      throw new Error(`Veo health check failed: ${error.message}`);
    }
  }

  private mapAspectRatio(ratio?: string): string {
    const aspectRatioMap: Record<string, string> = {
      "16:9": "landscape",
      "9:16": "portrait",
      "1:1": "square",
    };
    return aspectRatioMap[ratio || "16:9"] || "landscape";
  }

  private mapResponse(
    veoResponse: VeoGenerationResponse
  ): VideoGenerationResponse {
    return {
      id: veoResponse.generation_id,
      status: this.mapVeoStatus(veoResponse.status),
      url: veoResponse.video_url,
      thumbnailUrl: veoResponse.thumbnail_url,
      progress: veoResponse.progress,
      estimatedTime: veoResponse.estimated_time,
      error: veoResponse.error,
      metadata: {
        provider: "veo",
        createdAt: veoResponse.created_at,
        updatedAt: veoResponse.updated_at,
      },
    };
  }

  private mapVeoStatus(status: string): VideoGenerationResponse["status"] {
    const statusMap: Record<string, VideoGenerationResponse["status"]> = {
      pending: "queued",
      processing: "processing",
      completed: "completed",
      failed: "failed",
    };
    return statusMap[status] || "queued";
  }

  protected validateRequest(request: VideoGenerationRequest): void {
    super.validateRequest(request);

    // Veo-specific validations
    if (request.duration < 5 || request.duration > 30) {
      throw new VideoGenerationError(
        "Veo supports video duration between 5 and 30 seconds",
        this.name,
        "INVALID_DURATION"
      );
    }

    if (request.fps && ![24, 30].includes(request.fps)) {
      throw new VideoGenerationError(
        "Veo supports 24 or 30 FPS only",
        this.name,
        "INVALID_FPS"
      );
    }

    if (request.resolution && !["720p", "1080p"].includes(request.resolution)) {
      throw new VideoGenerationError(
        "Veo supports 720p or 1080p resolution only",
        this.name,
        "INVALID_RESOLUTION"
      );
    }
  }
}

// Factory function for easy instantiation
export function createVeoProvider(
  apiKey: string,
  config?: Partial<ProviderConfig>
): VeoProvider {
  return new VeoProvider({
    apiKey,
    priority: 4, // High priority for Veo
    timeout: 600000, // 10 minutes for video generation
    ...config,
  });
}
