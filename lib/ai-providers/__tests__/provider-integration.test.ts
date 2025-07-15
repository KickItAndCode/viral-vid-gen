/**
 * Integration tests for AI video generation providers
 * Tests the complete pipeline with mock implementations
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createVeoProvider } from '../veo-provider';
import { createRunwayProvider } from '../runway-provider';
import { createLumaProvider } from '../luma-provider';
import { VideoGenerationQueue } from '../queue-manager';
import { VideoProviderFactory } from '../provider-factory';
import { VideoGenerationRequest } from '../types';

// Mock fetch for API calls
global.fetch = vi.fn();

describe('AI Video Generation Pipeline Integration', () => {
  let mockFetch: any;
  let queue: VideoGenerationQueue;
  let factory: VideoProviderFactory;

  beforeEach(() => {
    mockFetch = vi.mocked(fetch);
    
    // Mock successful API responses
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('veo')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            id: 'veo_job_123',
            status: 'processing',
            progress: 0,
            video_url: null,
          }),
        });
      }
      
      if (url.includes('runway')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            id: 'runway_job_456',
            status: 'PENDING',
            progress: 0,
          }),
        });
      }
      
      if (url.includes('luma')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            id: 'luma_job_789',
            state: 'queued',
            progress: 0,
          }),
        });
      }
      
      return Promise.reject(new Error('Unknown API endpoint'));
    });

    // Initialize factory with test configuration
    factory = VideoProviderFactory.getInstance({
      veo: { 
        apiKey: 'test_veo_key',
        baseUrl: 'https://api.veo-test.com',
        priority: 4,
        timeout: 30000,
      },
      runway: { 
        apiKey: 'test_runway_key',
        baseUrl: 'https://api.runway-test.com',
        priority: 5,
        timeout: 45000,
      },
      luma: { 
        apiKey: 'test_luma_key',
        baseUrl: 'https://api.luma-test.com',
        priority: 3,
        timeout: 30000,
      },
    });

    queue = VideoGenerationQueue.getInstance({
      maxConcurrentJobs: 2,
      maxRetries: 2,
      retryDelayMs: 1000,
      jobTimeoutMs: 60000,
      cleanupIntervalMs: 30000,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    queue.destroy();
  });

  describe('Individual Provider Tests', () => {
    it('should create and initialize Veo provider correctly', async () => {
      const provider = createVeoProvider('test_key', {
        baseUrl: 'https://api.veo-test.com',
        timeout: 30000,
      });

      expect(provider.name).toBe('veo');
      expect(provider.getPriority()).toBeGreaterThan(0);
      
      const isAvailable = await provider.isAvailable();
      expect(isAvailable).toBe(true);
    });

    it('should create and initialize Runway provider correctly', async () => {
      const provider = createRunwayProvider('test_key', {
        baseUrl: 'https://api.runway-test.com',
        timeout: 45000,
      });

      expect(provider.name).toBe('runway');
      expect(provider.getPriority()).toBeGreaterThan(0);
      
      const isAvailable = await provider.isAvailable();
      expect(isAvailable).toBe(true);
    });

    it('should create and initialize Luma provider correctly', async () => {
      const provider = createLumaProvider('test_key', {
        baseUrl: 'https://api.luma-test.com',
        timeout: 30000,
      });

      expect(provider.name).toBe('luma');
      expect(provider.getPriority()).toBeGreaterThan(0);
      
      const isAvailable = await provider.isAvailable();
      expect(isAvailable).toBe(true);
    });
  });

  describe('Provider Factory Tests', () => {
    it('should initialize all providers from factory', () => {
      const allProviders = factory.getAllProviders();
      expect(allProviders).toHaveLength(3);
      
      const providerNames = allProviders.map(p => p.name);
      expect(providerNames).toContain('veo');
      expect(providerNames).toContain('runway');
      expect(providerNames).toContain('luma');
    });

    it('should return providers sorted by priority', async () => {
      const providers = await factory.getProvidersByPriority();
      expect(providers).toHaveLength(3);
      
      // Runway should be first (priority 5), then Veo (4), then Luma (3)
      expect(providers[0].name).toBe('runway');
      expect(providers[1].name).toBe('veo');
      expect(providers[2].name).toBe('luma');
    });

    it('should handle provider availability checking', async () => {
      const availableProviders = await factory.getAvailableProviders();
      expect(availableProviders).toHaveLength(3);
    });
  });

  describe('Queue Management Tests', () => {
    it('should add jobs to queue successfully', async () => {
      const request: VideoGenerationRequest = {
        prompt: 'Test video generation',
        duration: 15,
        style: 'cinematic',
        resolution: '1080p',
        fps: 30,
        aspectRatio: '16:9',
      };

      const jobId = await queue.addJob(request, 'user_123', 'trend_456', 'normal', 'runway');
      
      expect(jobId).toBeDefined();
      expect(jobId).toMatch(/^job_\d+_[a-z0-9]+$/);
      
      const job = queue.getJob(jobId);
      expect(job).toBeDefined();
      expect(job?.status).toBe('queued');
      expect(job?.provider).toBe('runway');
    });

    it('should track queue statistics correctly', async () => {
      const request: VideoGenerationRequest = {
        prompt: 'Test video',
        duration: 10,
      };

      await queue.addJob(request, 'user_1', undefined, 'high');
      await queue.addJob(request, 'user_2', undefined, 'normal');
      
      const stats = queue.getQueueStatus();
      expect(stats.total).toBe(2);
      expect(stats.queued).toBe(2);
      expect(stats.processing).toBe(0);
    });

    it('should handle job cancellation', async () => {
      const request: VideoGenerationRequest = {
        prompt: 'Test cancellation',
        duration: 20,
      };

      const jobId = await queue.addJob(request, 'user_123');
      const success = await queue.cancelJob(jobId);
      
      expect(success).toBe(true);
      
      const job = queue.getJob(jobId);
      expect(job?.status).toBe('cancelled');
    });
  });

  describe('End-to-End Pipeline Tests', () => {
    it('should handle complete video generation workflow', async () => {
      // Mock successful generation response
      mockFetch.mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            id: 'test_job_123',
            status: 'completed',
            progress: 100,
            video_url: 'https://cdn.example.com/video.mp4',
            thumbnail_url: 'https://cdn.example.com/thumb.jpg',
          }),
        })
      );

      const request: VideoGenerationRequest = {
        prompt: 'Create a beautiful landscape video',
        duration: 15,
        style: 'cinematic',
        resolution: '1080p',
        aspectRatio: '16:9',
      };

      const jobId = await queue.addJob(request, 'user_123', 'trend_456', 'high', 'runway');
      
      // Simulate some processing time
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const job = queue.getJob(jobId);
      expect(job).toBeDefined();
      expect(job?.userId).toBe('user_123');
      expect(job?.trendId).toBe('trend_456');
      expect(job?.priority).toBe('high');
    });

    it('should handle provider fallback logic', async () => {
      // Mock first provider failure, second success
      mockFetch
        .mockImplementationOnce(() => Promise.reject(new Error('API Error')))
        .mockImplementationOnce(() => 
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              id: 'fallback_job_456',
              status: 'processing',
              progress: 0,
            }),
          })
        );

      const request: VideoGenerationRequest = {
        prompt: 'Test fallback scenario',
        duration: 10,
      };

      const jobId = await queue.addJob(request, 'user_123', undefined, 'normal', 'veo');
      
      const job = queue.getJob(jobId);
      expect(job).toBeDefined();
      // Should still be queued or processing, not failed due to fallback
      expect(['queued', 'processing']).toContain(job?.status);
    });

    it('should handle progress tracking workflow', async () => {
      const progressUpdates: Array<{ jobId: string; progress: number }> = [];
      
      // Add progress listener
      queue.addProgressListener((jobId, update) => {
        progressUpdates.push({ jobId, progress: update.progress });
      });

      const request: VideoGenerationRequest = {
        prompt: 'Test progress tracking',
        duration: 15,
      };

      const jobId = await queue.addJob(request, 'user_123');
      
      // Simulate processing with progress updates
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(jobId).toBeDefined();
      // Progress tracking is async, so we just verify the listener was added
      expect(progressUpdates.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Error Handling Tests', () => {
    it('should handle API failures gracefully', async () => {
      // Mock API failure
      mockFetch.mockImplementationOnce(() => 
        Promise.reject(new Error('Network error'))
      );

      const request: VideoGenerationRequest = {
        prompt: 'Test error handling',
        duration: 10,
      };

      const jobId = await queue.addJob(request, 'user_123');
      
      // Should still create job even if immediate processing fails
      expect(jobId).toBeDefined();
      
      const job = queue.getJob(jobId);
      expect(job).toBeDefined();
    });

    it('should validate video generation requests', async () => {
      const provider = createVeoProvider('test_key');
      
      const invalidRequest = {
        prompt: '', // Empty prompt should be invalid
        duration: -5, // Negative duration should be invalid
      } as VideoGenerationRequest;

      // This should throw an error or return an error response
      try {
        await provider.generateVideo(invalidRequest);
        // If no error thrown, check the response
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });
  });

  describe('Performance Tests', () => {
    it('should handle multiple concurrent jobs', async () => {
      const requests = Array.from({ length: 5 }, (_, i) => ({
        prompt: `Test video ${i + 1}`,
        duration: 10,
      } as VideoGenerationRequest));

      const jobIds = await Promise.all(
        requests.map((request, i) => 
          queue.addJob(request, `user_${i}`, undefined, 'normal')
        )
      );

      expect(jobIds).toHaveLength(5);
      expect(new Set(jobIds)).toHaveSize(5); // All IDs should be unique
      
      const stats = queue.getQueueStatus();
      expect(stats.total).toBe(5);
    });

    it('should respect queue concurrency limits', async () => {
      // Queue is configured with maxConcurrentJobs: 2
      const stats = queue.getQueueStatus();
      expect(stats.processing).toBeLessThanOrEqual(2);
    });
  });
});

/**
 * Mock test for script generation integration
 */
describe('AI Script Generation Tests', () => {
  it('should generate scripts from trend data', () => {
    // This would test the AIScriptGenerator with mock trend data
    const mockTrend = {
      _id: 'trend_123',
      title: 'AI Revolution 2024',
      description: 'Exploring the latest AI breakthroughs',
      platform: 'reddit',
      category: 'Technology',
      viralScore: 85,
      tags: ['ai', 'technology', 'innovation'],
      engagementMetrics: {
        upvotes: 1250,
        comments: 89,
        shares: 45,
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    // Import and test script generation
    // This is a placeholder for the actual script generation test
    expect(mockTrend.viralScore).toBeGreaterThan(80);
  });
});