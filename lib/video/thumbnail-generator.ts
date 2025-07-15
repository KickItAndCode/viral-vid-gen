import sharp from "sharp";
import ffmpeg from "fluent-ffmpeg";
import { promises as fs } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { s3FileManager } from "@/lib/aws/s3-upload";

export interface ThumbnailOptions {
  width: number;
  height: number;
  quality: number;
  format: "jpeg" | "png" | "webp";
  background?: string;
  fit?: "contain" | "cover" | "fill" | "inside" | "outside";
}

export interface ThumbnailResult {
  key: string;
  url: string;
  cdnUrl: string;
  size: number;
  width: number;
  height: number;
  format: string;
  timestamp?: number;
}

export interface VideoThumbnailOptions extends ThumbnailOptions {
  timestamps: number[]; // Array of timestamps in seconds
  seekAccuracy?: "fast" | "accurate"; // FFmpeg seek accuracy
}

export interface ImageThumbnailOptions extends ThumbnailOptions {
  sizes: Array<{ width: number; height: number; suffix: string }>;
  progressive?: boolean;
  optimizeFor?: "web" | "print" | "speed";
}

export class ThumbnailGenerator {
  private tempDir: string;

  constructor() {
    this.tempDir = tmpdir();
  }

  /**
   * Generate thumbnails from video at specific timestamps
   */
  async generateVideoThumbnails(
    videoKey: string,
    outputPrefix: string,
    options: VideoThumbnailOptions
  ): Promise<ThumbnailResult[]> {
    const tempVideoPath = join(this.tempDir, `video_${Date.now()}.tmp`);
    const results: ThumbnailResult[] = [];

    try {
      // Download video file
      const videoBuffer = await s3FileManager.downloadFile(videoKey);
      if (!videoBuffer) {
        throw new Error("Failed to download video file");
      }

      await fs.writeFile(tempVideoPath, videoBuffer);

      // Generate thumbnails for each timestamp
      const thumbnailPromises = options.timestamps.map((timestamp, index) =>
        this.generateSingleVideoThumbnail(
          tempVideoPath,
          outputPrefix,
          timestamp,
          index,
          options
        )
      );

      const thumbnailResults = await Promise.allSettled(thumbnailPromises);

      // Process results
      thumbnailResults.forEach((result, index) => {
        if (result.status === "fulfilled") {
          results.push({
            ...result.value,
            timestamp: options.timestamps[index],
          });
        } else {
          console.error(
            `Thumbnail generation failed for timestamp ${options.timestamps[index]}:`,
            result.reason
          );
        }
      });

      return results;
    } catch (error) {
      console.error("Video thumbnail generation error:", error);
      throw error;
    } finally {
      // Clean up temporary files
      try {
        await fs.unlink(tempVideoPath);
      } catch (error) {
        console.error("Error cleaning up temp video file:", error);
      }
    }
  }

  /**
   * Generate a single thumbnail from video
   */
  private async generateSingleVideoThumbnail(
    videoPath: string,
    outputPrefix: string,
    timestamp: number,
    index: number,
    options: VideoThumbnailOptions
  ): Promise<ThumbnailResult> {
    const tempThumbnailPath = join(
      this.tempDir,
      `thumb_${Date.now()}_${index}.jpg`
    );
    const thumbnailFilename = `${outputPrefix}_thumbnail_${index + 1}.${options.format}`;

    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .seekInput(timestamp)
        .videoFilters(
          `scale=${options.width}:${options.height}:force_original_aspect_ratio=decrease,pad=${options.width}:${options.height}:(ow-iw)/2:(oh-ih)/2:${options.background || "black"}`
        )
        .frames(1)
        .output(tempThumbnailPath)
        .on("end", async () => {
          try {
            // Process with Sharp for optimization
            const processedBuffer = await this.processImageWithSharp(
              tempThumbnailPath,
              options
            );

            // Upload to S3
            const uploadResult = await s3FileManager.uploadFile(
              processedBuffer,
              {
                folder: "thumbnails",
                filename: thumbnailFilename,
                contentType: `image/${options.format}`,
                metadata: {
                  timestamp: timestamp.toString(),
                  width: options.width.toString(),
                  height: options.height.toString(),
                  quality: options.quality.toString(),
                },
              }
            );

            if (!uploadResult.success) {
              throw new Error(`Upload failed: ${uploadResult.error}`);
            }

            // Get image dimensions
            const metadata = await sharp(processedBuffer).metadata();

            // Clean up temp file
            await fs.unlink(tempThumbnailPath);

            resolve({
              key: uploadResult.key,
              url: uploadResult.url,
              cdnUrl: uploadResult.cdnUrl,
              size: processedBuffer.length,
              width: metadata.width || options.width,
              height: metadata.height || options.height,
              format: options.format,
            });
          } catch (error) {
            reject(error);
          }
        })
        .on("error", reject)
        .run();
    });
  }

  /**
   * Generate thumbnails from image at multiple sizes
   */
  async generateImageThumbnails(
    imageKey: string,
    outputPrefix: string,
    options: ImageThumbnailOptions
  ): Promise<ThumbnailResult[]> {
    const results: ThumbnailResult[] = [];

    try {
      // Download image file
      const imageBuffer = await s3FileManager.downloadFile(imageKey);
      if (!imageBuffer) {
        throw new Error("Failed to download image file");
      }

      // Generate thumbnails for each size
      const thumbnailPromises = options.sizes.map((size, index) =>
        this.generateSingleImageThumbnail(
          imageBuffer,
          outputPrefix,
          size,
          index,
          options
        )
      );

      const thumbnailResults = await Promise.allSettled(thumbnailPromises);

      // Process results
      thumbnailResults.forEach((result) => {
        if (result.status === "fulfilled") {
          results.push(result.value);
        } else {
          console.error("Image thumbnail generation failed:", result.reason);
        }
      });

      return results;
    } catch (error) {
      console.error("Image thumbnail generation error:", error);
      throw error;
    }
  }

  /**
   * Generate a single thumbnail from image
   */
  private async generateSingleImageThumbnail(
    imageBuffer: Buffer,
    outputPrefix: string,
    size: { width: number; height: number; suffix: string },
    index: number,
    options: ImageThumbnailOptions
  ): Promise<ThumbnailResult> {
    const thumbnailFilename = `${outputPrefix}_${size.suffix}.${options.format}`;

    try {
      // Process image with Sharp
      let sharpInstance = sharp(imageBuffer);

      // Apply resize and fit options
      sharpInstance = sharpInstance.resize(size.width, size.height, {
        fit: options.fit || "cover",
        background: options.background || "transparent",
      });

      // Apply format-specific options
      switch (options.format) {
        case "jpeg":
          sharpInstance = sharpInstance.jpeg({
            quality: options.quality,
            progressive: options.progressive || false,
            mozjpeg: options.optimizeFor === "web",
          });
          break;
        case "png":
          sharpInstance = sharpInstance.png({
            quality: options.quality,
            progressive: options.progressive || false,
            compressionLevel: options.optimizeFor === "speed" ? 1 : 9,
          });
          break;
        case "webp":
          sharpInstance = sharpInstance.webp({
            quality: options.quality,
            effort: options.optimizeFor === "speed" ? 1 : 6,
          });
          break;
      }

      // Apply optimization based on target
      if (options.optimizeFor === "web") {
        sharpInstance = sharpInstance.normalize().sharpen();
      }

      const processedBuffer = await sharpInstance.toBuffer();

      // Upload to S3
      const uploadResult = await s3FileManager.uploadFile(processedBuffer, {
        folder: "thumbnails",
        filename: thumbnailFilename,
        contentType: `image/${options.format}`,
        metadata: {
          width: size.width.toString(),
          height: size.height.toString(),
          quality: options.quality.toString(),
          optimized: options.optimizeFor || "web",
        },
      });

      if (!uploadResult.success) {
        throw new Error(`Upload failed: ${uploadResult.error}`);
      }

      // Get processed image dimensions
      const metadata = await sharp(processedBuffer).metadata();

      return {
        key: uploadResult.key,
        url: uploadResult.url,
        cdnUrl: uploadResult.cdnUrl,
        size: processedBuffer.length,
        width: metadata.width || size.width,
        height: metadata.height || size.height,
        format: options.format,
      };
    } catch (error) {
      console.error("Single image thumbnail generation error:", error);
      throw error;
    }
  }

  /**
   * Process image with Sharp for optimization
   */
  private async processImageWithSharp(
    imagePath: string,
    options: ThumbnailOptions
  ): Promise<Buffer> {
    let sharpInstance = sharp(imagePath);

    // Apply resize and fit options
    sharpInstance = sharpInstance.resize(options.width, options.height, {
      fit: options.fit || "cover",
      background: options.background || "transparent",
    });

    // Apply format-specific processing
    switch (options.format) {
      case "jpeg":
        sharpInstance = sharpInstance.jpeg({
          quality: options.quality,
          progressive: true,
          mozjpeg: true,
        });
        break;
      case "png":
        sharpInstance = sharpInstance.png({
          quality: options.quality,
          progressive: true,
          compressionLevel: 9,
        });
        break;
      case "webp":
        sharpInstance = sharpInstance.webp({
          quality: options.quality,
          effort: 6,
        });
        break;
    }

    // Apply web optimization
    sharpInstance = sharpInstance.normalize().sharpen();

    return await sharpInstance.toBuffer();
  }

  /**
   * Generate automatic thumbnails for video (at 25%, 50%, 75% of duration)
   */
  async generateAutoVideoThumbnails(
    videoKey: string,
    outputPrefix: string,
    videoDuration: number,
    options: Omit<VideoThumbnailOptions, "timestamps">
  ): Promise<ThumbnailResult[]> {
    const timestamps = [
      videoDuration * 0.25,
      videoDuration * 0.5,
      videoDuration * 0.75,
    ];

    return this.generateVideoThumbnails(videoKey, outputPrefix, {
      ...options,
      timestamps,
    });
  }

  /**
   * Generate responsive image thumbnails (common web sizes)
   */
  async generateResponsiveImageThumbnails(
    imageKey: string,
    outputPrefix: string,
    options: Omit<ImageThumbnailOptions, "sizes">
  ): Promise<ThumbnailResult[]> {
    const sizes = [
      { width: 150, height: 150, suffix: "thumbnail" },
      { width: 300, height: 300, suffix: "small" },
      { width: 600, height: 600, suffix: "medium" },
      { width: 1200, height: 1200, suffix: "large" },
    ];

    return this.generateImageThumbnails(imageKey, outputPrefix, {
      ...options,
      sizes,
    });
  }

  /**
   * Generate social media thumbnails (platform-specific sizes)
   */
  async generateSocialMediaThumbnails(
    imageKey: string,
    outputPrefix: string,
    options: Omit<ImageThumbnailOptions, "sizes">
  ): Promise<ThumbnailResult[]> {
    const sizes = [
      { width: 1200, height: 630, suffix: "facebook" },
      { width: 1024, height: 512, suffix: "twitter" },
      { width: 1080, height: 1080, suffix: "instagram" },
      { width: 735, height: 1102, suffix: "pinterest" },
      { width: 1200, height: 627, suffix: "linkedin" },
    ];

    return this.generateImageThumbnails(imageKey, outputPrefix, {
      ...options,
      sizes,
    });
  }

  /**
   * Clean up old temporary files
   */
  async cleanupTempFiles(): Promise<void> {
    try {
      const files = await fs.readdir(this.tempDir);
      const now = Date.now();
      const maxAge = 2 * 60 * 60 * 1000; // 2 hours

      for (const file of files) {
        if (file.startsWith("thumb_") || file.startsWith("video_")) {
          const filePath = join(this.tempDir, file);
          try {
            const stats = await fs.stat(filePath);

            if (now - stats.mtime.getTime() > maxAge) {
              await fs.unlink(filePath);
            }
          } catch (error) {
            // File might not exist anymore, ignore
          }
        }
      }
    } catch (error) {
      console.error("Error cleaning up thumbnail temp files:", error);
    }
  }
}

// Export singleton instance
export const thumbnailGenerator = new ThumbnailGenerator();

// Common thumbnail presets
export const THUMBNAIL_PRESETS = {
  video: {
    quality: 85,
    format: "jpeg" as const,
    width: 1280,
    height: 720,
    background: "black",
    fit: "contain" as const,
  },
  image: {
    quality: 85,
    format: "jpeg" as const,
    progressive: true,
    optimizeFor: "web" as const,
    fit: "cover" as const,
  },
  socialMedia: {
    quality: 90,
    format: "jpeg" as const,
    progressive: true,
    optimizeFor: "web" as const,
    fit: "cover" as const,
  },
} as const;
