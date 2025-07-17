import {
  VideoProvider,
  VideoProviderName,
  VideoGenerationRequest,
  VideoGenerationResponse,
  ProviderConfig,
  VideoGenerationError,
  ProviderUnavailableError,
  QuotaExceededError,
  GenerationTimeoutError,
} from "./types";

export abstract class BaseVideoProvider implements VideoProvider {
  abstract name: VideoProviderName;

  protected config: ProviderConfig;
  protected isOnline: boolean = true;
  protected lastHealthCheck: number = 0;
  protected healthCheckInterval: number = 5 * 60 * 1000; // 5 minutes

  constructor(config: ProviderConfig) {
    this.config = {
      timeout: 300000, // 5 minutes default
      retryCount: 3,
      priority: 3,
      ...config,
    };
  }

  abstract generateVideo(
    request: VideoGenerationRequest
  ): Promise<VideoGenerationResponse>;
  abstract getStatus(jobId: string): Promise<VideoGenerationResponse>;

  async cancelGeneration?(jobId: string): Promise<void> {
    throw new Error(`Cancel not implemented for ${this.name} provider`);
  }

  async getCredits?(): Promise<number> {
    throw new Error(`Credits check not implemented for ${this.name} provider`);
  }

  async isAvailable(): Promise<boolean> {
    const now = Date.now();

    // Use cached health check if recent
    if (
      this.lastHealthCheck &&
      now - this.lastHealthCheck < this.healthCheckInterval
    ) {
      return this.isOnline;
    }

    try {
      await this.healthCheck();
      this.isOnline = true;
      this.lastHealthCheck = now;
      return true;
    } catch (error) {
      console.warn(`Health check failed for ${this.name}:`, error);
      this.isOnline = false;
      this.lastHealthCheck = now;
      return false;
    }
  }

  protected abstract healthCheck(): Promise<void>;

  protected async makeRequest<T>(
    url: string,
    options: RequestInit = {},
    timeout?: number
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutMs = timeout || this.config.timeout || 300000;

    const timeoutId = setTimeout(() => {
      controller.abort();
    }, timeoutMs);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.config.apiKey}`,
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        await this.handleApiError(response);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);

      if (error.name === "AbortError") {
        throw new GenerationTimeoutError(this.name, timeoutMs);
      }

      throw new VideoGenerationError(
        `Request failed: ${error.message}`,
        this.name,
        "REQUEST_FAILED"
      );
    }
  }

  protected async handleApiError(response: Response): Promise<never> {
    const errorData = await response.json().catch(() => ({}));
    const message =
      errorData.message || errorData.error || `HTTP ${response.status}`;

    switch (response.status) {
      case 401:
        throw new VideoGenerationError(
          `Authentication failed: ${message}`,
          this.name,
          "AUTH_FAILED",
          401
        );
      case 403:
        throw new VideoGenerationError(
          `Forbidden: ${message}`,
          this.name,
          "FORBIDDEN",
          403
        );
      case 429:
        throw new QuotaExceededError(this.name);
      case 500:
      case 502:
      case 503:
      case 504:
        throw new ProviderUnavailableError(
          this.name,
          `Server error: ${message}`
        );
      default:
        throw new VideoGenerationError(
          `API error: ${message}`,
          this.name,
          "API_ERROR",
          response.status
        );
    }
  }

  protected validateRequest(request: VideoGenerationRequest): void {
    if (!request.prompt || request.prompt.trim().length === 0) {
      throw new VideoGenerationError(
        "Prompt is required",
        this.name,
        "INVALID_REQUEST"
      );
    }

    if (request.duration <= 0 || request.duration > 120) {
      throw new VideoGenerationError(
        "Duration must be between 1 and 120 seconds",
        this.name,
        "INVALID_REQUEST"
      );
    }

    if (request.prompt.length > 2000) {
      throw new VideoGenerationError(
        "Prompt too long (max 2000 characters)",
        this.name,
        "INVALID_REQUEST"
      );
    }
  }

  protected generateJobId(): string {
    return `${this.name}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  protected mapStatus(
    providerStatus: string
  ): VideoGenerationResponse["status"] {
    // Override in specific providers
    const statusMap: Record<string, VideoGenerationResponse["status"]> = {
      pending: "queued",
      queued: "queued",
      processing: "processing",
      running: "processing",
      completed: "completed",
      succeeded: "completed",
      failed: "failed",
      error: "failed",
      cancelled: "failed",
    };

    return statusMap[providerStatus.toLowerCase()] || "queued";
  }

  getPriority(): number {
    return this.config.priority || 3;
  }

  getTimeout(): number {
    return this.config.timeout || 300000;
  }
}
