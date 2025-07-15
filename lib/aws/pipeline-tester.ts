import { s3BucketManager } from "./s3-bucket";
import { cloudFrontManager } from "./cloudfront-config";
import { s3FileManager } from "./s3-upload";
import { videoTranscoder, VIDEO_FORMATS } from "@/lib/video/transcoder";
import {
  thumbnailGenerator,
  THUMBNAIL_PRESETS,
} from "@/lib/video/thumbnail-generator";
import { cdnHelper } from "./cdn-helpers";
import { securityManager } from "./security-config";
import { cleanupManager } from "./cleanup-workflows";
import { uploadProgressTracker } from "@/lib/upload/progress-tracker";
import { validateAWSConfig } from "./s3-config";

export interface PipelineTestResult {
  test: string;
  success: boolean;
  duration: number;
  details: any;
  error?: string;
}

export interface PipelineTestSuite {
  name: string;
  results: PipelineTestResult[];
  overallSuccess: boolean;
  totalDuration: number;
  successCount: number;
  failureCount: number;
}

export class PipelineTest {
  private testResults: PipelineTestResult[] = [];

  /**
   * Run comprehensive pipeline tests
   */
  async runFullPipelineTest(): Promise<PipelineTestSuite> {
    console.log("Starting comprehensive pipeline test...");
    const startTime = Date.now();

    // Test 1: Environment validation
    await this.runTest("Environment Validation", async () => {
      const validation = validateAWSConfig();
      if (!validation.valid) {
        throw new Error(
          `AWS configuration invalid: ${validation.errors.join(", ")}`
        );
      }
      return validation;
    });

    // Test 2: S3 bucket setup
    await this.runTest("S3 Bucket Setup", async () => {
      const result = await s3BucketManager.initializeBucket();
      if (!result.success) {
        throw new Error(result.message);
      }
      return result;
    });

    // Test 3: CloudFront distribution setup
    await this.runTest("CloudFront Distribution", async () => {
      const distribution = await cloudFrontManager.initializeDistribution();
      return distribution;
    });

    // Test 4: Security configuration
    await this.runTest("Security Configuration", async () => {
      const result = await securityManager.configureS3Security();
      if (!result.success) {
        throw new Error(
          `Security configuration failed: ${result.errors.join(", ")}`
        );
      }
      return result;
    });

    // Test 5: File upload (presigned URL)
    await this.runTest("Presigned URL Upload", async () => {
      const testFile = this.createTestFile("test-video.mp4", 1024 * 1024); // 1MB
      const result = await s3FileManager.getPresignedUploadUrl({
        folder: "temp",
        filename: "test-video.mp4",
        contentType: "video/mp4",
        metadata: { test: "true" },
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      return result;
    });

    // Test 6: Direct file upload
    await this.runTest("Direct File Upload", async () => {
      const testFile = this.createTestFile("test-image.jpg", 512 * 1024); // 512KB
      const result = await s3FileManager.uploadFile(testFile, {
        folder: "temp",
        filename: "test-image.jpg",
        contentType: "image/jpeg",
        metadata: { test: "true" },
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      return result;
    });

    // Test 7: File operations
    await this.runTest("File Operations", async () => {
      const testFile = this.createTestFile("test-copy.jpg", 256 * 1024); // 256KB
      const uploadResult = await s3FileManager.uploadFile(testFile, {
        folder: "temp",
        filename: "test-copy.jpg",
        contentType: "image/jpeg",
      });

      if (!uploadResult.success) {
        throw new Error(uploadResult.error);
      }

      // Test file info
      const fileInfo = await s3FileManager.getFileInfo(uploadResult.key);
      if (!fileInfo) {
        throw new Error("Failed to get file info");
      }

      // Test file copy
      const copyResult = await s3FileManager.copyFile(
        uploadResult.key,
        "temp/test-copy-2.jpg"
      );
      if (!copyResult) {
        throw new Error("Failed to copy file");
      }

      // Test file deletion
      const deleteResult = await s3FileManager.deleteFile(uploadResult.key);
      if (!deleteResult) {
        throw new Error("Failed to delete file");
      }

      return { fileInfo, copyResult, deleteResult };
    });

    // Test 8: CDN URL generation
    await this.runTest("CDN URL Generation", async () => {
      const testKey = "processed/test-video.mp4";

      const urls = {
        basic: cdnHelper.generateCDNUrl(testKey),
        cacheBusted: cdnHelper.generateCacheBustedUrl(testKey),
        signed: await cdnHelper.generateSignedUrl(testKey, {
          expiresInSeconds: 3600,
        }),
        multiFormat: cdnHelper.generateMultiFormatUrls(testKey, [
          "mp4",
          "webm",
        ]),
        streaming: cdnHelper.generateVideoStreamingUrls(testKey, [
          "720p",
          "1080p",
        ]),
      };

      return urls;
    });

    // Test 9: Upload progress tracking
    await this.runTest("Upload Progress Tracking", async () => {
      const uploadId = "test-upload-" + Date.now();
      const session = uploadProgressTracker.createSession(
        uploadId,
        "test-progress.mp4",
        10 * 1024 * 1024, // 10MB
        1024 * 1024, // 1MB chunks
        "temp/test-progress.mp4",
        "video/mp4"
      );

      // Simulate progress updates
      uploadProgressTracker.updateChunkProgress(
        uploadId,
        0,
        512 * 1024,
        1024 * 1024
      );
      uploadProgressTracker.completeChunk(uploadId, 0, "etag123");

      const progress = uploadProgressTracker.getProgress(uploadId);
      if (!progress) {
        throw new Error("Failed to get upload progress");
      }

      uploadProgressTracker.completeSession(uploadId);

      return { session, progress };
    });

    // Test 10: Cache invalidation
    await this.runTest("Cache Invalidation", async () => {
      const result = await cdnHelper.invalidateCache({
        paths: ["/test/*"],
        priority: "normal",
      });

      return result;
    });

    // Test 11: Cleanup workflows
    await this.runTest("Cleanup Workflows", async () => {
      const result = await cleanupManager.runCleanup({
        dryRun: true,
        folders: ["temp/"],
        maxFiles: 10,
      });

      return result;
    });

    const totalDuration = Date.now() - startTime;
    const successCount = this.testResults.filter((r) => r.success).length;
    const failureCount = this.testResults.filter((r) => !r.success).length;

    const suite: PipelineTestSuite = {
      name: "Full Pipeline Test",
      results: this.testResults,
      overallSuccess: failureCount === 0,
      totalDuration,
      successCount,
      failureCount,
    };

    this.printTestResults(suite);
    return suite;
  }

  /**
   * Run video processing pipeline test
   */
  async runVideoProcessingTest(): Promise<PipelineTestSuite> {
    console.log("Starting video processing pipeline test...");
    const startTime = Date.now();

    // Test 1: Video upload
    await this.runTest("Video Upload", async () => {
      const testVideo = this.createTestVideoFile(
        "test-video.mp4",
        2 * 1024 * 1024
      ); // 2MB
      const result = await s3FileManager.uploadFile(testVideo, {
        folder: "videos",
        filename: "test-video.mp4",
        contentType: "video/mp4",
        metadata: { source: "test", duration: "30" },
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      return result;
    });

    // Test 2: Thumbnail generation
    await this.runTest("Thumbnail Generation", async () => {
      const testVideo = this.createTestVideoFile("test-thumb.mp4", 1024 * 1024); // 1MB
      const uploadResult = await s3FileManager.uploadFile(testVideo, {
        folder: "temp",
        filename: "test-thumb.mp4",
        contentType: "video/mp4",
      });

      if (!uploadResult.success) {
        throw new Error(uploadResult.error);
      }

      // Generate thumbnails (this would normally require actual video processing)
      // For testing, we'll create mock thumbnails
      const thumbnails = await this.createMockThumbnails(uploadResult.key);

      return { uploadResult, thumbnails };
    });

    // Test 3: Video transcoding formats
    await this.runTest("Video Format Support", async () => {
      const formats = Object.keys(VIDEO_FORMATS);
      const supportedFormats = formats.map((format) => ({
        format,
        config: VIDEO_FORMATS[format],
      }));

      return supportedFormats;
    });

    // Test 4: Multiple quality generation
    await this.runTest("Multi-Quality Generation", async () => {
      const testKey = "videos/test-multi.mp4";
      const qualities = ["720p", "1080p", "mobile"];

      const urls = qualities.map((quality) => ({
        quality,
        url: cdnHelper.generateVideoStreamingUrls(testKey, [quality]),
      }));

      return urls;
    });

    const totalDuration = Date.now() - startTime;
    const successCount = this.testResults.filter((r) => r.success).length;
    const failureCount = this.testResults.filter((r) => !r.success).length;

    const suite: PipelineTestSuite = {
      name: "Video Processing Pipeline Test",
      results: this.testResults,
      overallSuccess: failureCount === 0,
      totalDuration,
      successCount,
      failureCount,
    };

    this.printTestResults(suite);
    return suite;
  }

  /**
   * Run load testing
   */
  async runLoadTest(
    concurrentUploads: number = 10,
    fileSize: number = 1024 * 1024
  ): Promise<PipelineTestSuite> {
    console.log(
      `Starting load test with ${concurrentUploads} concurrent uploads...`
    );
    const startTime = Date.now();

    await this.runTest("Load Test", async () => {
      const uploads = Array.from({ length: concurrentUploads }, (_, i) =>
        this.performSingleUpload(i, fileSize)
      );

      const results = await Promise.allSettled(uploads);
      const successful = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.filter((r) => r.status === "rejected").length;

      return {
        concurrent: concurrentUploads,
        successful,
        failed,
        successRate: (successful / concurrentUploads) * 100,
        results: results.map((r, i) => ({
          upload: i,
          status: r.status,
          error: r.status === "rejected" ? r.reason : undefined,
        })),
      };
    });

    const totalDuration = Date.now() - startTime;
    const successCount = this.testResults.filter((r) => r.success).length;
    const failureCount = this.testResults.filter((r) => !r.success).length;

    const suite: PipelineTestSuite = {
      name: "Load Test",
      results: this.testResults,
      overallSuccess: failureCount === 0,
      totalDuration,
      successCount,
      failureCount,
    };

    this.printTestResults(suite);
    return suite;
  }

  /**
   * Run individual test
   */
  private async runTest(
    name: string,
    testFunction: () => Promise<any>
  ): Promise<void> {
    console.log(`Running test: ${name}`);
    const startTime = Date.now();

    try {
      const result = await testFunction();
      const duration = Date.now() - startTime;

      this.testResults.push({
        test: name,
        success: true,
        duration,
        details: result,
      });

      console.log(`✅ ${name} passed (${duration}ms)`);
    } catch (error) {
      const duration = Date.now() - startTime;

      this.testResults.push({
        test: name,
        success: false,
        duration,
        details: null,
        error: String(error),
      });

      console.log(`❌ ${name} failed (${duration}ms): ${error}`);
    }
  }

  /**
   * Create test file buffer
   */
  private createTestFile(filename: string, size: number): Buffer {
    const content = Buffer.alloc(size, "test-data");
    return content;
  }

  /**
   * Create test video file buffer
   */
  private createTestVideoFile(filename: string, size: number): Buffer {
    // Create a simple binary content that mimics video data
    const content = Buffer.alloc(size);

    // Add some video-like headers (simplified)
    content.write("ftyp", 0); // MP4 file type
    content.write("mp42", 4); // MP4 brand

    // Fill rest with pseudo-random data
    for (let i = 8; i < size; i++) {
      content[i] = Math.floor(Math.random() * 256);
    }

    return content;
  }

  /**
   * Create mock thumbnails for testing
   */
  private async createMockThumbnails(videoKey: string): Promise<any[]> {
    const thumbnails = [];

    for (let i = 0; i < 3; i++) {
      const thumbnailBuffer = this.createTestFile(`thumb-${i}.jpg`, 50 * 1024);

      const result = await s3FileManager.uploadFile(thumbnailBuffer, {
        folder: "thumbnails",
        filename: `${videoKey}-thumb-${i}.jpg`,
        contentType: "image/jpeg",
        metadata: { timestamp: (i * 10).toString() },
      });

      if (result.success) {
        thumbnails.push(result);
      }
    }

    return thumbnails;
  }

  /**
   * Perform single upload for load testing
   */
  private async performSingleUpload(
    index: number,
    fileSize: number
  ): Promise<any> {
    const testFile = this.createTestFile(`load-test-${index}.dat`, fileSize);

    const result = await s3FileManager.uploadFile(testFile, {
      folder: "temp",
      filename: `load-test-${index}.dat`,
      contentType: "application/octet-stream",
      metadata: { loadTest: "true", index: index.toString() },
    });

    if (!result.success) {
      throw new Error(result.error);
    }

    return result;
  }

  /**
   * Print test results
   */
  private printTestResults(suite: PipelineTestSuite): void {
    console.log("\n" + "=".repeat(50));
    console.log(`TEST SUITE: ${suite.name}`);
    console.log("=".repeat(50));
    console.log(`Overall Success: ${suite.overallSuccess ? "✅" : "❌"}`);
    console.log(`Total Duration: ${suite.totalDuration}ms`);
    console.log(`Success Count: ${suite.successCount}`);
    console.log(`Failure Count: ${suite.failureCount}`);
    console.log(
      `Success Rate: ${((suite.successCount / suite.results.length) * 100).toFixed(1)}%`
    );
    console.log("\nDetailed Results:");

    suite.results.forEach((result, index) => {
      const status = result.success ? "✅" : "❌";
      const duration = result.duration.toString().padStart(5);
      console.log(`${index + 1}. ${status} ${result.test} (${duration}ms)`);

      if (!result.success && result.error) {
        console.log(`   Error: ${result.error}`);
      }
    });

    console.log("=".repeat(50) + "\n");
  }
}

// Export test utilities
export const pipelineTest = new PipelineTest();

// Quick test functions
export const testFileUpload = async (): Promise<PipelineTestResult> => {
  const tester = new PipelineTest();
  await tester.runTest("Quick File Upload Test", async () => {
    const testFile = Buffer.alloc(1024 * 1024, "test-data");
    const result = await s3FileManager.uploadFile(testFile, {
      folder: "temp",
      filename: "quick-test.dat",
      contentType: "application/octet-stream",
    });

    if (!result.success) {
      throw new Error(result.error);
    }

    return result;
  });

  return tester.testResults[0];
};

export const testCDNDelivery = async (): Promise<PipelineTestResult> => {
  const tester = new PipelineTest();
  await tester.runTest("CDN Delivery Test", async () => {
    const testKey = "temp/test-cdn.jpg";

    const urls = {
      direct: cdnHelper.generateCDNUrl(testKey),
      optimized: cdnHelper.generateOptimizedImageUrl(testKey, {
        width: 800,
        height: 600,
        quality: 85,
      }),
      signed: await cdnHelper.generateSignedUrl(testKey),
    };

    return urls;
  });

  return tester.testResults[0];
};

export const testCleanup = async (): Promise<PipelineTestResult> => {
  const tester = new PipelineTest();
  await tester.runTest("Cleanup Test", async () => {
    const result = await cleanupManager.runCleanup({
      dryRun: true,
      folders: ["temp/"],
      maxFiles: 5,
    });

    return result;
  });

  return tester.testResults[0];
};
