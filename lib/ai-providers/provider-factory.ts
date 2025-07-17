import { VideoProvider, ProviderConfig } from "./types";
import { createVeoProvider } from "./veo-provider";
import { createRunwayProvider } from "./runway-provider";
import { createLumaProvider } from "./luma-provider";
import { MockVideoProvider } from "./mock-provider";

export interface ProviderConfigs {
  veo?: ProviderConfig;
  runway?: ProviderConfig;
  luma?: ProviderConfig;
}

export class VideoProviderFactory {
  private static instance: VideoProviderFactory;
  private providers: Map<string, VideoProvider> = new Map();
  private configs: ProviderConfigs;

  private constructor(configs: ProviderConfigs) {
    this.configs = configs;
    this.initializeProviders();
  }

  static getInstance(configs?: ProviderConfigs): VideoProviderFactory {
    if (!VideoProviderFactory.instance) {
      if (!configs) {
        // Use mock configs for development when no real configs provided
        console.warn("No provider configs provided, using development mock providers");
        configs = {
          veo: { apiKey: "mock-veo-key", baseUrl: "https://mock-veo-api.dev" },
          runway: { apiKey: "mock-runway-key", baseUrl: "https://mock-runway-api.dev" },
          luma: { apiKey: "mock-luma-key", baseUrl: "https://mock-luma-api.dev" },
        };
      }
      VideoProviderFactory.instance = new VideoProviderFactory(configs);
    }
    return VideoProviderFactory.instance;
  }

  private initializeProviders(): void {
    // Check if we're using mock configs (development mode)
    const isMockMode = this.configs.veo?.apiKey?.includes("mock") ||
                       this.configs.runway?.apiKey?.includes("mock") ||
                       this.configs.luma?.apiKey?.includes("mock");

    if (isMockMode) {
      // Use mock provider for development
      console.log("[VideoProviderFactory] Using mock provider for development");
      this.providers.set("mock", new MockVideoProvider({
        apiKey: "mock-key",
        baseUrl: "https://mock-api.dev",
        priority: 5,
        timeout: 30000,
        retryCount: 1,
      }));
    } else {
      // Use real providers with actual API keys
      if (this.configs.veo?.apiKey) {
        this.providers.set(
          "veo",
          createVeoProvider(this.configs.veo.apiKey, this.configs.veo)
        );
      }

      if (this.configs.runway?.apiKey) {
        this.providers.set(
          "runway",
          createRunwayProvider(this.configs.runway.apiKey, this.configs.runway)
        );
      }

      if (this.configs.luma?.apiKey) {
        this.providers.set(
          "luma",
          createLumaProvider(this.configs.luma.apiKey, this.configs.luma)
        );
      }
    }
  }

  getProvider(name: string): VideoProvider | undefined {
    return this.providers.get(name);
  }

  getAllProviders(): VideoProvider[] {
    return Array.from(this.providers.values());
  }

  getAvailableProviders(): Promise<VideoProvider[]> {
    return Promise.all(
      this.getAllProviders().map(async (provider) => {
        const isAvailable = await provider.isAvailable();
        return isAvailable ? provider : null;
      })
    ).then((providers) => providers.filter(Boolean) as VideoProvider[]);
  }

  async getProvidersByPriority(): Promise<VideoProvider[]> {
    const available = await this.getAvailableProviders();
    return available.sort((a, b) => b.getPriority() - a.getPriority());
  }

  hasProvider(name: string): boolean {
    return this.providers.has(name);
  }

  updateConfig(name: string, config: Partial<ProviderConfig>): void {
    const currentConfig = this.configs[name as keyof ProviderConfigs];
    if (currentConfig) {
      Object.assign(currentConfig, config);
      // Reinitialize provider with new config
      this.initializeProviders();
    }
  }

  removeProvider(name: string): void {
    this.providers.delete(name);
  }

  getProviderStats(): Record<string, { available: boolean; priority: number }> {
    const stats: Record<string, { available: boolean; priority: number }> = {};

    for (const [name, provider] of this.providers) {
      stats[name] = {
        available: false, // Will be updated asynchronously
        priority: provider.getPriority(),
      };

      // Update availability asynchronously
      provider.isAvailable().then((available) => {
        stats[name].available = available;
      });
    }

    return stats;
  }
}

// Utility function to initialize providers from environment variables
export function createProvidersFromEnv(): VideoProviderFactory {
  const configs: ProviderConfigs = {};

  // Veo configuration
  const veoApiKey = process.env.VEO_API_KEY;
  if (veoApiKey) {
    configs.veo = {
      apiKey: veoApiKey,
      baseUrl: process.env.VEO_BASE_URL,
      priority: parseInt(process.env.VEO_PRIORITY || "4"),
      timeout: parseInt(process.env.VEO_TIMEOUT || "600000"),
      retryCount: parseInt(process.env.VEO_RETRY_COUNT || "3"),
    };
  }

  // Runway configuration
  const runwayApiKey = process.env.RUNWAY_API_KEY;
  if (runwayApiKey) {
    configs.runway = {
      apiKey: runwayApiKey,
      baseUrl: process.env.RUNWAY_BASE_URL,
      priority: parseInt(process.env.RUNWAY_PRIORITY || "5"),
      timeout: parseInt(process.env.RUNWAY_TIMEOUT || "900000"),
      retryCount: parseInt(process.env.RUNWAY_RETRY_COUNT || "3"),
    };
  }

  // Luma configuration
  const lumaApiKey = process.env.LUMA_API_KEY;
  if (lumaApiKey) {
    configs.luma = {
      apiKey: lumaApiKey,
      baseUrl: process.env.LUMA_BASE_URL,
      priority: parseInt(process.env.LUMA_PRIORITY || "3"),
      timeout: parseInt(process.env.LUMA_TIMEOUT || "600000"),
      retryCount: parseInt(process.env.LUMA_RETRY_COUNT || "3"),
    };
  }

  return VideoProviderFactory.getInstance(configs);
}

// Helper function to get the best available provider
export async function getBestProvider(): Promise<VideoProvider | null> {
  const factory = VideoProviderFactory.getInstance();
  const providers = await factory.getProvidersByPriority();
  return providers.length > 0 ? providers[0] : null;
}

// Helper function to get a specific provider or fallback to best available
export async function getProviderOrFallback(
  preferredProvider?: string
): Promise<VideoProvider | null> {
  const factory = VideoProviderFactory.getInstance();

  if (preferredProvider) {
    const provider = factory.getProvider(preferredProvider);
    if (provider && (await provider.isAvailable())) {
      return provider;
    }
  }

  return getBestProvider();
}
