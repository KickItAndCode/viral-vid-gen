import { BaseVideoProvider } from "./base-provider";
import {
  VideoGenerationRequest,
  VideoGenerationResponse,
  ProviderConfig,
} from "./types";

/**
 * Mock video provider for development and testing
 * Simulates video generation without making real API calls
 */
export class MockVideoProvider extends BaseVideoProvider {
  name = "mock" as const;

  constructor(config: ProviderConfig) {
    super(config);
  }

  async generateVideo(
    request: VideoGenerationRequest
  ): Promise<VideoGenerationResponse> {
    console.log(`[MockProvider] Simulating video generation for: ${request.prompt}`);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Return mock response
    return {
      jobId: `mock_job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: "completed",
      progress: 100,
      videoUrl: "https://example.com/mock-video.mp4",
      thumbnailUrl: "https://example.com/mock-thumbnail.jpg",
      estimatedCompletion: Date.now() + 60000, // 1 minute from now
      metadata: {
        provider: this.name,
        request,
        generatedAt: new Date().toISOString(),
      },
    };
  }

  async healthCheck(): Promise<void> {
    // Mock provider is always healthy
    return Promise.resolve();
  }

  async isAvailable(): Promise<boolean> {
    // Mock provider is always available
    return true;
  }

  async cancelGeneration(jobId: string): Promise<void> {
    console.log(`[MockProvider] Cancelling mock job: ${jobId}`);
    return Promise.resolve();
  }

  async getStatus(jobId: string): Promise<VideoGenerationResponse> {
    return {
      jobId,
      status: "completed",
      progress: 100,
      videoUrl: "https://example.com/mock-video.mp4",
      thumbnailUrl: "https://example.com/mock-thumbnail.jpg",
      estimatedCompletion: Date.now(),
      metadata: {
        provider: this.name,
        generatedAt: new Date().toISOString(),
      },
    };
  }
}