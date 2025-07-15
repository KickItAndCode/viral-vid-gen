import ffmpeg from "fluent-ffmpeg";
import { promises as fs } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { s3FileManager } from "@/lib/aws/s3-upload";

// FFmpeg path configuration (adjust based on your deployment environment)
const FFMPEG_PATH = process.env.FFMPEG_PATH || "ffmpeg";
const FFPROBE_PATH = process.env.FFPROBE_PATH || "ffprobe";

ffmpeg.setFfmpegPath(FFMPEG_PATH);
ffmpeg.setFfprobePath(FFPROBE_PATH);

export interface VideoFormat {
  name: string;
  extension: string;
  codec: string;
  quality: string;
  bitrate: string;
  maxWidth: number;
  maxHeight: number;
  fps: number;
}

export interface TranscodingOptions {
  formats: VideoFormat[];
  generateThumbnails: boolean;
  thumbnailCount: number;
  thumbnailSize: { width: number; height: number };
  watermark?: {
    text?: string;
    imagePath?: string;
    position:
      | "top-left"
      | "top-right"
      | "bottom-left"
      | "bottom-right"
      | "center";
    opacity: number;
  };
  metadata?: Record<string, string>;
}

export interface TranscodingResult {
  success: boolean;
  originalFile: string;
  processedFiles: Array<{
    format: VideoFormat;
    key: string;
    url: string;
    cdnUrl: string;
    size: number;
    duration: number;
  }>;
  thumbnails: Array<{
    key: string;
    url: string;
    cdnUrl: string;
    size: number;
    timestamp: number;
  }>;
  metadata: {
    duration: number;
    width: number;
    height: number;
    fps: number;
    bitrate: number;
    codec: string;
    format: string;
  };
  error?: string;
}

// Predefined video formats for different platforms
export const VIDEO_FORMATS: Record<string, VideoFormat> = {
  mp4_hd: {
    name: "MP4 HD",
    extension: "mp4",
    codec: "libx264",
    quality: "medium",
    bitrate: "2000k",
    maxWidth: 1920,
    maxHeight: 1080,
    fps: 30,
  },
  mp4_sd: {
    name: "MP4 SD",
    extension: "mp4",
    codec: "libx264",
    quality: "medium",
    bitrate: "1000k",
    maxWidth: 1280,
    maxHeight: 720,
    fps: 30,
  },
  mp4_mobile: {
    name: "MP4 Mobile",
    extension: "mp4",
    codec: "libx264",
    quality: "medium",
    bitrate: "500k",
    maxWidth: 640,
    maxHeight: 480,
    fps: 24,
  },
  webm_hd: {
    name: "WebM HD",
    extension: "webm",
    codec: "libvpx-vp9",
    quality: "medium",
    bitrate: "1500k",
    maxWidth: 1920,
    maxHeight: 1080,
    fps: 30,
  },
  webm_sd: {
    name: "WebM SD",
    extension: "webm",
    codec: "libvpx-vp9",
    quality: "medium",
    bitrate: "800k",
    maxWidth: 1280,
    maxHeight: 720,
    fps: 30,
  },
  instagram_story: {
    name: "Instagram Story",
    extension: "mp4",
    codec: "libx264",
    quality: "medium",
    bitrate: "1000k",
    maxWidth: 1080,
    maxHeight: 1920,
    fps: 30,
  },
  instagram_reel: {
    name: "Instagram Reel",
    extension: "mp4",
    codec: "libx264",
    quality: "medium",
    bitrate: "1500k",
    maxWidth: 1080,
    maxHeight: 1920,
    fps: 30,
  },
  tiktok: {
    name: "TikTok",
    extension: "mp4",
    codec: "libx264",
    quality: "medium",
    bitrate: "1000k",
    maxWidth: 1080,
    maxHeight: 1920,
    fps: 30,
  },
  youtube_shorts: {
    name: "YouTube Shorts",
    extension: "mp4",
    codec: "libx264",
    quality: "medium",
    bitrate: "1500k",
    maxWidth: 1080,
    maxHeight: 1920,
    fps: 30,
  },
};

export class VideoTranscoder {
  private tempDir: string;

  constructor() {
    this.tempDir = tmpdir();
  }

  /**
   * Get video metadata
   */
  async getVideoMetadata(filePath: string): Promise<any> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) {
          reject(err);
        } else {
          resolve(metadata);
        }
      });
    });
  }

  /**
   * Transcode video to multiple formats
   */
  async transcodeVideo(
    inputKey: string,
    outputPrefix: string,
    options: TranscodingOptions
  ): Promise<TranscodingResult> {
    const tempInputPath = join(this.tempDir, `input_${Date.now()}.tmp`);
    const result: TranscodingResult = {
      success: false,
      originalFile: inputKey,
      processedFiles: [],
      thumbnails: [],
      metadata: {
        duration: 0,
        width: 0,
        height: 0,
        fps: 0,
        bitrate: 0,
        codec: "",
        format: "",
      },
    };

    try {
      // Download input file from S3
      const inputBuffer = await s3FileManager.downloadFile(inputKey);
      if (!inputBuffer) {
        throw new Error("Failed to download input file");
      }

      await fs.writeFile(tempInputPath, inputBuffer);

      // Get video metadata
      const metadata = await this.getVideoMetadata(tempInputPath);
      const videoStream = metadata.streams.find(
        (s: any) => s.codec_type === "video"
      );

      if (!videoStream) {
        throw new Error("No video stream found");
      }

      result.metadata = {
        duration: parseFloat(metadata.format.duration) || 0,
        width: videoStream.width || 0,
        height: videoStream.height || 0,
        fps: eval(videoStream.r_frame_rate) || 0,
        bitrate: parseInt(metadata.format.bit_rate) || 0,
        codec: videoStream.codec_name || "",
        format: metadata.format.format_name || "",
      };

      // Transcode to different formats
      const transcodingPromises = options.formats.map((format) =>
        this.transcodeToFormat(
          tempInputPath,
          outputPrefix,
          format,
          options.watermark
        )
      );

      const transcodingResults = await Promise.allSettled(transcodingPromises);

      // Process results
      transcodingResults.forEach((transcodingResult, index) => {
        if (transcodingResult.status === "fulfilled") {
          result.processedFiles.push({
            format: options.formats[index],
            ...transcodingResult.value,
            duration: result.metadata.duration,
          });
        } else {
          console.error(
            `Transcoding failed for ${options.formats[index].name}:`,
            transcodingResult.reason
          );
        }
      });

      // Generate thumbnails if requested
      if (options.generateThumbnails && options.thumbnailCount > 0) {
        const thumbnailResults = await this.generateThumbnails(
          tempInputPath,
          outputPrefix,
          options.thumbnailCount,
          options.thumbnailSize,
          result.metadata.duration
        );
        result.thumbnails = thumbnailResults;
      }

      result.success = result.processedFiles.length > 0;

      return result;
    } catch (error) {
      console.error("Video transcoding error:", error);
      result.error = String(error);
      return result;
    } finally {
      // Clean up temporary files
      try {
        await fs.unlink(tempInputPath);
      } catch (error) {
        console.error("Error cleaning up temp file:", error);
      }
    }
  }

  /**
   * Transcode to a specific format
   */
  private async transcodeToFormat(
    inputPath: string,
    outputPrefix: string,
    format: VideoFormat,
    watermark?: TranscodingOptions["watermark"]
  ): Promise<{ key: string; url: string; cdnUrl: string; size: number }> {
    const tempOutputPath = join(
      this.tempDir,
      `output_${Date.now()}.${format.extension}`
    );
    const outputFilename = `${outputPrefix}_${format.name.toLowerCase().replace(/\s+/g, "_")}.${format.extension}`;

    return new Promise((resolve, reject) => {
      let command = ffmpeg(inputPath)
        .videoCodec(format.codec)
        .videoBitrate(format.bitrate)
        .fps(format.fps)
        .size(`${format.maxWidth}x${format.maxHeight}`)
        .aspect("16:9")
        .autopad()
        .outputOptions([
          "-preset",
          "medium",
          "-profile:v",
          "main",
          "-level",
          "4.0",
          "-movflags",
          "+faststart",
        ]);

      // Add watermark if specified
      if (watermark) {
        if (watermark.text) {
          const position = this.getWatermarkPosition(watermark.position);
          command = command.complexFilter([
            `drawtext=text='${watermark.text}':fontsize=24:fontcolor=white:x=${position.x}:y=${position.y}:alpha=${watermark.opacity}`,
          ]);
        }
        // Image watermark support could be added here
      }

      command
        .output(tempOutputPath)
        .on("start", (commandLine) => {
          console.log("FFmpeg command:", commandLine);
        })
        .on("progress", (progress) => {
          console.log(`Processing ${format.name}: ${progress.percent}%`);
        })
        .on("end", async () => {
          try {
            // Read transcoded file
            const outputBuffer = await fs.readFile(tempOutputPath);

            // Upload to S3
            const uploadResult = await s3FileManager.uploadFile(outputBuffer, {
              folder: "processed",
              filename: outputFilename,
              contentType: `video/${format.extension}`,
              metadata: {
                format: format.name,
                codec: format.codec,
                bitrate: format.bitrate,
                resolution: `${format.maxWidth}x${format.maxHeight}`,
                fps: format.fps.toString(),
              },
            });

            if (!uploadResult.success) {
              throw new Error(`Upload failed: ${uploadResult.error}`);
            }

            // Get file size
            const stats = await fs.stat(tempOutputPath);

            // Clean up temp file
            await fs.unlink(tempOutputPath);

            resolve({
              key: uploadResult.key,
              url: uploadResult.url,
              cdnUrl: uploadResult.cdnUrl,
              size: stats.size,
            });
          } catch (error) {
            reject(error);
          }
        })
        .on("error", (error) => {
          reject(error);
        })
        .run();
    });
  }

  /**
   * Generate video thumbnails
   */
  private async generateThumbnails(
    inputPath: string,
    outputPrefix: string,
    count: number,
    size: { width: number; height: number },
    duration: number
  ): Promise<
    Array<{
      key: string;
      url: string;
      cdnUrl: string;
      size: number;
      timestamp: number;
    }>
  > {
    const thumbnails = [];
    const interval = duration / (count + 1);

    for (let i = 1; i <= count; i++) {
      const timestamp = interval * i;
      const tempThumbnailPath = join(
        this.tempDir,
        `thumb_${Date.now()}_${i}.jpg`
      );
      const thumbnailFilename = `${outputPrefix}_thumbnail_${i}.jpg`;

      try {
        // Generate thumbnail
        await new Promise<void>((resolve, reject) => {
          ffmpeg(inputPath)
            .screenshots({
              timestamps: [timestamp],
              filename: `thumb_${Date.now()}_${i}.jpg`,
              folder: this.tempDir,
              size: `${size.width}x${size.height}`,
            })
            .on("end", () => resolve())
            .on("error", reject);
        });

        // Read thumbnail file
        const thumbnailBuffer = await fs.readFile(tempThumbnailPath);

        // Upload to S3
        const uploadResult = await s3FileManager.uploadFile(thumbnailBuffer, {
          folder: "thumbnails",
          filename: thumbnailFilename,
          contentType: "image/jpeg",
          metadata: {
            timestamp: timestamp.toString(),
            width: size.width.toString(),
            height: size.height.toString(),
          },
        });

        if (uploadResult.success) {
          const stats = await fs.stat(tempThumbnailPath);
          thumbnails.push({
            key: uploadResult.key,
            url: uploadResult.url,
            cdnUrl: uploadResult.cdnUrl,
            size: stats.size,
            timestamp,
          });
        }

        // Clean up temp file
        await fs.unlink(tempThumbnailPath);
      } catch (error) {
        console.error(`Error generating thumbnail ${i}:`, error);
      }
    }

    return thumbnails;
  }

  /**
   * Get watermark position coordinates
   */
  private getWatermarkPosition(position: string): { x: string; y: string } {
    switch (position) {
      case "top-left":
        return { x: "10", y: "10" };
      case "top-right":
        return { x: "w-tw-10", y: "10" };
      case "bottom-left":
        return { x: "10", y: "h-th-10" };
      case "bottom-right":
        return { x: "w-tw-10", y: "h-th-10" };
      case "center":
        return { x: "(w-tw)/2", y: "(h-th)/2" };
      default:
        return { x: "10", y: "10" };
    }
  }

  /**
   * Clean up old temporary files
   */
  async cleanupTempFiles(): Promise<void> {
    try {
      const files = await fs.readdir(this.tempDir);
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours

      for (const file of files) {
        if (
          file.startsWith("input_") ||
          file.startsWith("output_") ||
          file.startsWith("thumb_")
        ) {
          const filePath = join(this.tempDir, file);
          const stats = await fs.stat(filePath);

          if (now - stats.mtime.getTime() > maxAge) {
            await fs.unlink(filePath);
          }
        }
      }
    } catch (error) {
      console.error("Error cleaning up temp files:", error);
    }
  }
}

// Export singleton instance
export const videoTranscoder = new VideoTranscoder();
