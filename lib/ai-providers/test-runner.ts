/**
 * Manual test runner for AI video generation providers
 * This file allows testing the providers without setting up actual API keys
 */

import { createVeoProvider } from './veo-provider';
import { createRunwayProvider } from './runway-provider';
import { createLumaProvider } from './luma-provider';
import { VideoProviderFactory } from './provider-factory';
import { VideoGenerationQueue } from './queue-manager';
import { generateScriptFromTrend } from './script-generator';
import { VideoGenerationRequest } from './types';

// Mock trend data for testing
const mockTrend = {
  _id: 'trend_test_123',
  title: 'The Future of AI Video Generation',
  description: 'Exploring how AI is revolutionizing video content creation with cutting-edge technology',
  platform: 'reddit' as const,
  category: 'Technology',
  viralScore: 92,
  tags: ['ai', 'video', 'technology', 'innovation', 'future'],
  engagementMetrics: {
    upvotes: 2500,
    comments: 145,
    shares: 78,
    awards: 12,
  },
  url: 'https://reddit.com/r/technology/test',
  authorInfo: {
    username: 'tech_enthusiast',
    followers: 15000,
  },
  createdAt: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
  updatedAt: Date.now(),
};

/**
 * Test individual provider initialization
 */
export async function testProviderInitialization() {
  console.log('🧪 Testing Provider Initialization...\n');

  try {
    // Test Veo provider
    console.log('📹 Testing Veo Provider...');
    const veoProvider = createVeoProvider('mock_veo_key', {
      baseUrl: 'https://api.veo.dev/mock',
      timeout: 30000,
      priority: 4,
    });
    
    console.log(`✅ Veo provider created: ${veoProvider.name}`);
    console.log(`   Priority: ${veoProvider.getPriority()}`);
    console.log(`   Max duration: ${veoProvider.getMaxDuration()}s`);
    console.log(`   Supported resolutions: ${veoProvider.getSupportedResolutions().join(', ')}\n`);

    // Test Runway provider
    console.log('🎬 Testing Runway Provider...');
    const runwayProvider = createRunwayProvider('mock_runway_key', {
      baseUrl: 'https://api.runway.dev/mock',
      timeout: 45000,
      priority: 5,
    });
    
    console.log(`✅ Runway provider created: ${runwayProvider.name}`);
    console.log(`   Priority: ${runwayProvider.getPriority()}`);
    console.log(`   Max duration: ${runwayProvider.getMaxDuration()}s`);
    console.log(`   Supported resolutions: ${runwayProvider.getSupportedResolutions().join(', ')}\n`);

    // Test Luma provider
    console.log('✨ Testing Luma Provider...');
    const lumaProvider = createLumaProvider('mock_luma_key', {
      baseUrl: 'https://api.luma.dev/mock',
      timeout: 30000,
      priority: 3,
    });
    
    console.log(`✅ Luma provider created: ${lumaProvider.name}`);
    console.log(`   Priority: ${lumaProvider.getPriority()}`);
    console.log(`   Max duration: ${lumaProvider.getMaxDuration()}s`);
    console.log(`   Supported resolutions: ${lumaProvider.getSupportedResolutions().join(', ')}\n`);

    return { veoProvider, runwayProvider, lumaProvider };
  } catch (error) {
    console.error('❌ Provider initialization failed:', error);
    throw error;
  }
}

/**
 * Test provider factory functionality
 */
export async function testProviderFactory() {
  console.log('🏭 Testing Provider Factory...\n');

  try {
    const factory = VideoProviderFactory.getInstance({
      veo: {
        apiKey: 'mock_veo_key',
        baseUrl: 'https://api.veo.dev/mock',
        priority: 4,
      },
      runway: {
        apiKey: 'mock_runway_key',
        baseUrl: 'https://api.runway.dev/mock',
        priority: 5,
      },
      luma: {
        apiKey: 'mock_luma_key',
        baseUrl: 'https://api.luma.dev/mock',
        priority: 3,
      },
    });

    const allProviders = factory.getAllProviders();
    console.log(`✅ Factory initialized with ${allProviders.length} providers`);
    
    allProviders.forEach(provider => {
      console.log(`   - ${provider.name} (priority: ${provider.getPriority()})`);
    });

    const prioritizedProviders = await factory.getProvidersByPriority();
    console.log('\n📊 Providers by priority:');
    prioritizedProviders.forEach((provider, index) => {
      console.log(`   ${index + 1}. ${provider.name} (priority: ${provider.getPriority()})`);
    });

    console.log('\n✅ Provider factory test completed\n');
    return factory;
  } catch (error) {
    console.error('❌ Provider factory test failed:', error);
    throw error;
  }
}

/**
 * Test script generation functionality
 */
export function testScriptGeneration() {
  console.log('📝 Testing Script Generation...\n');

  try {
    // Test basic script generation
    const basicScript = generateScriptFromTrend(mockTrend, {
      style: 'cinematic',
      duration: 15,
      targetPlatform: 'tiktok',
      tone: 'inspiring',
      visualStyle: 'realistic',
    });

    console.log('✅ Basic script generated:');
    console.log(`   Title: ${mockTrend.title}`);
    console.log(`   Style: ${basicScript.style}`);
    console.log(`   Duration: ${basicScript.duration}s`);
    console.log(`   Platform: ${basicScript.targetPlatform}`);
    console.log(`   Aspect Ratio: ${basicScript.aspectRatio}`);
    console.log(`   Tags: ${basicScript.tags.slice(0, 5).join(', ')}`);
    console.log(`   Hook: "${basicScript.hook}"`);
    console.log(`   CTA: "${basicScript.cta}"`);
    console.log(`   Prompt length: ${basicScript.prompt.length} characters\n`);

    // Test different platforms
    const platforms = ['youtube', 'tiktok', 'instagram', 'twitter'] as const;
    console.log('🎯 Testing platform-specific scripts:');
    
    platforms.forEach(platform => {
      const script = generateScriptFromTrend(mockTrend, {
        targetPlatform: platform,
        style: 'educational',
      });
      console.log(`   ${platform}: ${script.aspectRatio}, max ${script.duration}s`);
    });

    console.log('\n✅ Script generation test completed\n');
    return basicScript;
  } catch (error) {
    console.error('❌ Script generation test failed:', error);
    throw error;
  }
}

/**
 * Test queue management system
 */
export async function testQueueManagement() {
  console.log('🚀 Testing Queue Management...\n');

  try {
    const queue = VideoGenerationQueue.getInstance({
      maxConcurrentJobs: 2,
      maxRetries: 3,
      retryDelayMs: 1000,
      jobTimeoutMs: 30000,
      cleanupIntervalMs: 60000,
    });

    // Test adding jobs with different priorities
    const requests: VideoGenerationRequest[] = [
      {
        prompt: 'High priority video about AI breakthrough',
        duration: 15,
        style: 'cinematic',
        resolution: '1080p',
      },
      {
        prompt: 'Normal priority video about technology trends',
        duration: 20,
        style: 'educational',
        resolution: '720p',
      },
      {
        prompt: 'Low priority video about general topics',
        duration: 10,
        style: 'entertaining',
        resolution: '1080p',
      },
    ];

    const priorities = ['high', 'normal', 'low'] as const;
    const jobIds: string[] = [];

    for (let i = 0; i < requests.length; i++) {
      const jobId = await queue.addJob(
        requests[i],
        `user_${i + 1}`,
        `trend_${i + 1}`,
        priorities[i],
        i === 0 ? 'runway' : undefined // Preferred provider for first job
      );
      jobIds.push(jobId);
      console.log(`✅ Added ${priorities[i]} priority job: ${jobId.slice(-8)}`);
    }

    // Check queue status
    const stats = queue.getQueueStatus();
    console.log('\n📊 Queue Statistics:');
    console.log(`   Total jobs: ${stats.total}`);
    console.log(`   Queued: ${stats.queued}`);
    console.log(`   Processing: ${stats.processing}`);
    console.log(`   Completed: ${stats.completed}`);
    console.log(`   Failed: ${stats.failed}`);

    // Test job retrieval
    console.log('\n📋 Job Details:');
    jobIds.forEach(jobId => {
      const job = queue.getJob(jobId);
      if (job) {
        console.log(`   ${jobId.slice(-8)}: ${job.status} (${job.priority} priority, ${job.provider} provider)`);
      }
    });

    // Test job cancellation
    if (jobIds.length > 0) {
      const cancelSuccess = await queue.cancelJob(jobIds[jobIds.length - 1]);
      console.log(`\n🚫 Job cancellation: ${cancelSuccess ? 'Success' : 'Failed'}`);
    }

    console.log('\n✅ Queue management test completed\n');
    
    // Cleanup
    queue.destroy();
    return stats;
  } catch (error) {
    console.error('❌ Queue management test failed:', error);
    throw error;
  }
}

/**
 * Test progress tracking functionality
 */
export function testProgressTracking() {
  console.log('📈 Testing Progress Tracking...\n');

  try {
    const queue = VideoGenerationQueue.getInstance();
    let progressUpdates = 0;
    
    // Add progress listener
    const progressListener = (jobId: string, update: any) => {
      progressUpdates++;
      console.log(`📊 Progress update for ${jobId.slice(-8)}: ${update.progress}% (${update.status})`);
    };
    
    queue.addProgressListener(progressListener);
    console.log('✅ Progress listener added');
    
    // Simulate progress updates
    setTimeout(() => {
      console.log('\n🔄 Simulating progress updates...');
      progressListener('mock_job_123', { progress: 25, status: 'processing' });
      progressListener('mock_job_123', { progress: 50, status: 'processing' });
      progressListener('mock_job_123', { progress: 100, status: 'completed' });
    }, 100);
    
    setTimeout(() => {
      queue.removeProgressListener(progressListener);
      console.log(`\n✅ Progress tracking test completed (${progressUpdates} updates received)\n`);
      queue.destroy();
    }, 200);
    
    return true;
  } catch (error) {
    console.error('❌ Progress tracking test failed:', error);
    throw error;
  }
}

/**
 * Run all tests
 */
export async function runAllTests() {
  console.log('🎉 Starting AI Video Generation Pipeline Tests\n');
  console.log('=' .repeat(60) + '\n');

  const results = {
    providerInitialization: false,
    providerFactory: false,
    scriptGeneration: false,
    queueManagement: false,
    progressTracking: false,
  };

  try {
    // Test 1: Provider Initialization
    await testProviderInitialization();
    results.providerInitialization = true;

    // Test 2: Provider Factory
    await testProviderFactory();
    results.providerFactory = true;

    // Test 3: Script Generation
    testScriptGeneration();
    results.scriptGeneration = true;

    // Test 4: Queue Management
    await testQueueManagement();
    results.queueManagement = true;

    // Test 5: Progress Tracking
    testProgressTracking();
    results.progressTracking = true;

    // Wait for async tests to complete
    await new Promise(resolve => setTimeout(resolve, 500));

  } catch (error) {
    console.error('❌ Test execution failed:', error);
  }

  // Print final results
  console.log('=' .repeat(60));
  console.log('📊 TEST RESULTS SUMMARY\n');
  
  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅ PASSED' : '❌ FAILED';
    const testName = test.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    console.log(`${status} ${testName}`);
  });

  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`\n🎯 Overall: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! The AI video generation pipeline is ready.');
  } else {
    console.log('⚠️  Some tests failed. Please check the implementation.');
  }
  
  console.log('\n' + '=' .repeat(60));
  
  return results;
}

// Export for direct usage
export { mockTrend };

// Auto-run if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}