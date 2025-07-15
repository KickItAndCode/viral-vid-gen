import {
  ListObjectsV2Command,
  DeleteObjectsCommand,
  PutBucketLifecycleConfigurationCommand,
  GetBucketLifecycleConfigurationCommand,
  DeleteBucketLifecycleCommand,
} from "@aws-sdk/client-s3";
import { s3Client, S3_CONFIG } from "./s3-config";
import { s3FileManager } from "./s3-upload";
import { cloudFrontManager } from "./cloudfront-config";

export interface CleanupRule {
  id: string;
  enabled: boolean;
  prefix: string;
  days: number;
  applyToMultipartUploads?: boolean;
  applyToVersions?: boolean;
  deleteMarkers?: boolean;
}

export interface CleanupResult {
  success: boolean;
  deletedFiles: number;
  deletedSize: number;
  errors: string[];
  duration: number;
}

export interface CleanupOptions {
  dryRun?: boolean;
  maxFiles?: number;
  olderThanDays?: number;
  folders?: string[];
  fileTypes?: string[];
  preserveRecent?: number;
}

export interface LifecyclePolicyRule {
  ID: string;
  Status: "Enabled" | "Disabled";
  Filter: {
    Prefix?: string;
    Tag?: { Key: string; Value: string };
    And?: {
      Prefix?: string;
      Tags?: Array<{ Key: string; Value: string }>;
    };
  };
  Expiration?: {
    Days?: number;
    Date?: Date;
    ExpiredObjectDeleteMarker?: boolean;
  };
  Transitions?: Array<{
    Days?: number;
    Date?: Date;
    StorageClass: "STANDARD_IA" | "ONEZONE_IA" | "GLACIER" | "DEEP_ARCHIVE";
  }>;
  NoncurrentVersionExpiration?: {
    NoncurrentDays: number;
  };
  NoncurrentVersionTransitions?: Array<{
    NoncurrentDays: number;
    StorageClass: "STANDARD_IA" | "ONEZONE_IA" | "GLACIER" | "DEEP_ARCHIVE";
  }>;
  AbortIncompleteMultipartUpload?: {
    DaysAfterInitiation: number;
  };
}

// Predefined cleanup rules
export const DEFAULT_CLEANUP_RULES: CleanupRule[] = [
  {
    id: "temp-files-daily",
    enabled: true,
    prefix: "temp/",
    days: 1,
    applyToMultipartUploads: true,
  },
  {
    id: "failed-uploads-weekly",
    enabled: true,
    prefix: "uploads/failed/",
    days: 7,
    applyToMultipartUploads: true,
  },
  {
    id: "old-processed-videos",
    enabled: true,
    prefix: "processed/",
    days: 365, // 1 year
    applyToVersions: true,
  },
  {
    id: "old-thumbnails",
    enabled: true,
    prefix: "thumbnails/",
    days: 180, // 6 months
  },
  {
    id: "orphaned-files",
    enabled: true,
    prefix: "orphaned/",
    days: 30,
    applyToMultipartUploads: true,
  },
];

// Predefined lifecycle policies
export const DEFAULT_LIFECYCLE_POLICIES: LifecyclePolicyRule[] = [
  {
    ID: "TempFilesCleanup",
    Status: "Enabled",
    Filter: {
      Prefix: "temp/",
    },
    Expiration: {
      Days: 1,
    },
    AbortIncompleteMultipartUpload: {
      DaysAfterInitiation: 1,
    },
  },
  {
    ID: "VideoTransitions",
    Status: "Enabled",
    Filter: {
      Prefix: "videos/",
    },
    Transitions: [
      {
        Days: 30,
        StorageClass: "STANDARD_IA",
      },
      {
        Days: 90,
        StorageClass: "GLACIER",
      },
      {
        Days: 365,
        StorageClass: "DEEP_ARCHIVE",
      },
    ],
    NoncurrentVersionExpiration: {
      NoncurrentDays: 30,
    },
  },
  {
    ID: "ProcessedVideoCleanup",
    Status: "Enabled",
    Filter: {
      Prefix: "processed/",
    },
    Expiration: {
      Days: 365,
    },
    Transitions: [
      {
        Days: 30,
        StorageClass: "STANDARD_IA",
      },
      {
        Days: 90,
        StorageClass: "GLACIER",
      },
    ],
  },
  {
    ID: "ThumbnailCleanup",
    Status: "Enabled",
    Filter: {
      Prefix: "thumbnails/",
    },
    Expiration: {
      Days: 180,
    },
    Transitions: [
      {
        Days: 30,
        StorageClass: "STANDARD_IA",
      },
    ],
  },
  {
    ID: "MultipartUploadCleanup",
    Status: "Enabled",
    Filter: {},
    AbortIncompleteMultipartUpload: {
      DaysAfterInitiation: 1,
    },
  },
];

export class CleanupManager {
  private bucketName: string;
  private cleanupRules: CleanupRule[];

  constructor(
    bucketName: string = S3_CONFIG.bucketName,
    cleanupRules: CleanupRule[] = DEFAULT_CLEANUP_RULES
  ) {
    this.bucketName = bucketName;
    this.cleanupRules = cleanupRules;
  }

  /**
   * Run cleanup based on configured rules
   */
  async runCleanup(options: CleanupOptions = {}): Promise<CleanupResult> {
    const startTime = Date.now();
    let deletedFiles = 0;
    let deletedSize = 0;
    const errors: string[] = [];

    console.log("Starting cleanup process...");

    try {
      for (const rule of this.cleanupRules) {
        if (!rule.enabled) continue;

        console.log(`Processing rule: ${rule.id}`);

        const ruleResult = await this.processCleanupRule(rule, options);
        deletedFiles += ruleResult.deletedFiles;
        deletedSize += ruleResult.deletedSize;
        errors.push(...ruleResult.errors);
      }

      // Run orphaned file cleanup
      const orphanedResult = await this.cleanupOrphanedFiles(options);
      deletedFiles += orphanedResult.deletedFiles;
      deletedSize += orphanedResult.deletedSize;
      errors.push(...orphanedResult.errors);

      console.log(
        `Cleanup completed. Deleted ${deletedFiles} files (${this.formatBytes(deletedSize)})`
      );

      return {
        success: errors.length === 0,
        deletedFiles,
        deletedSize,
        errors,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      console.error("Cleanup process failed:", error);
      return {
        success: false,
        deletedFiles,
        deletedSize,
        errors: [...errors, String(error)],
        duration: Date.now() - startTime,
      };
    }
  }

  /**
   * Process a single cleanup rule
   */
  private async processCleanupRule(
    rule: CleanupRule,
    options: CleanupOptions
  ): Promise<CleanupResult> {
    const startTime = Date.now();
    let deletedFiles = 0;
    let deletedSize = 0;
    const errors: string[] = [];

    try {
      const cutoffDate = new Date(Date.now() - rule.days * 24 * 60 * 60 * 1000);
      const files = await this.listFilesForCleanup(
        rule.prefix,
        cutoffDate,
        options
      );

      if (files.length === 0) {
        console.log(`No files found for cleanup rule: ${rule.id}`);
        return {
          success: true,
          deletedFiles: 0,
          deletedSize: 0,
          errors: [],
          duration: Date.now() - startTime,
        };
      }

      console.log(
        `Found ${files.length} files to clean up for rule: ${rule.id}`
      );

      if (options.dryRun) {
        console.log(
          "DRY RUN - Would delete:",
          files.map((f) => f.key)
        );
        return {
          success: true,
          deletedFiles: files.length,
          deletedSize: files.reduce((sum, f) => sum + f.size, 0),
          errors: [],
          duration: Date.now() - startTime,
        };
      }

      // Delete files in batches
      const batchSize = 1000;
      for (let i = 0; i < files.length; i += batchSize) {
        const batch = files.slice(i, i + batchSize);
        const batchResult = await this.deleteBatch(batch);

        deletedFiles += batchResult.deletedFiles;
        deletedSize += batchResult.deletedSize;
        errors.push(...batchResult.errors);
      }

      return {
        success: errors.length === 0,
        deletedFiles,
        deletedSize,
        errors,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      console.error(`Error processing cleanup rule ${rule.id}:`, error);
      return {
        success: false,
        deletedFiles,
        deletedSize,
        errors: [String(error)],
        duration: Date.now() - startTime,
      };
    }
  }

  /**
   * List files for cleanup based on criteria
   */
  private async listFilesForCleanup(
    prefix: string,
    cutoffDate: Date,
    options: CleanupOptions
  ): Promise<Array<{ key: string; size: number; lastModified: Date }>> {
    const files: Array<{ key: string; size: number; lastModified: Date }> = [];
    let continuationToken: string | undefined;

    do {
      const response = await s3Client.send(
        new ListObjectsV2Command({
          Bucket: this.bucketName,
          Prefix: prefix,
          MaxKeys: 1000,
          ContinuationToken: continuationToken,
        })
      );

      if (response.Contents) {
        for (const object of response.Contents) {
          if (!object.Key || !object.LastModified) continue;

          // Apply filters
          if (object.LastModified > cutoffDate) continue;
          if (
            options.fileTypes &&
            !this.matchesFileType(object.Key, options.fileTypes)
          )
            continue;
          if (
            options.folders &&
            !this.matchesFolder(object.Key, options.folders)
          )
            continue;

          files.push({
            key: object.Key,
            size: object.Size || 0,
            lastModified: object.LastModified,
          });

          // Respect maxFiles limit
          if (options.maxFiles && files.length >= options.maxFiles) {
            return files;
          }
        }
      }

      continuationToken = response.NextContinuationToken;
    } while (continuationToken);

    // Sort by age (oldest first) and preserve recent files if specified
    files.sort((a, b) => a.lastModified.getTime() - b.lastModified.getTime());

    if (options.preserveRecent) {
      return files.slice(0, -options.preserveRecent);
    }

    return files;
  }

  /**
   * Delete a batch of files
   */
  private async deleteBatch(
    files: Array<{ key: string; size: number; lastModified: Date }>
  ): Promise<CleanupResult> {
    let deletedFiles = 0;
    let deletedSize = 0;
    const errors: string[] = [];

    try {
      const deleteObjects = files.map((file) => ({ Key: file.key }));

      const response = await s3Client.send(
        new DeleteObjectsCommand({
          Bucket: this.bucketName,
          Delete: {
            Objects: deleteObjects,
          },
        })
      );

      if (response.Deleted) {
        deletedFiles = response.Deleted.length;
        deletedSize = files.reduce((sum, file) => sum + file.size, 0);

        // Invalidate CloudFront cache for deleted files
        const paths = response.Deleted.map((obj) => `/${obj.Key}`);
        await cloudFrontManager.createInvalidation(paths);
      }

      if (response.Errors) {
        errors.push(
          ...response.Errors.map((err) => `${err.Key}: ${err.Message}`)
        );
      }

      return {
        success: errors.length === 0,
        deletedFiles,
        deletedSize,
        errors,
        duration: 0,
      };
    } catch (error) {
      console.error("Error deleting batch:", error);
      return {
        success: false,
        deletedFiles,
        deletedSize,
        errors: [String(error)],
        duration: 0,
      };
    }
  }

  /**
   * Clean up orphaned files (files not referenced in database)
   */
  private async cleanupOrphanedFiles(
    options: CleanupOptions
  ): Promise<CleanupResult> {
    console.log("Checking for orphaned files...");

    // This would typically check against the database to find unreferenced files
    // For now, we'll implement a basic check for files older than 30 days in temp folder
    const cutoffDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const files = await this.listFilesForCleanup("temp/", cutoffDate, options);

    if (files.length === 0) {
      return {
        success: true,
        deletedFiles: 0,
        deletedSize: 0,
        errors: [],
        duration: 0,
      };
    }

    console.log(`Found ${files.length} orphaned files`);

    if (options.dryRun) {
      return {
        success: true,
        deletedFiles: files.length,
        deletedSize: files.reduce((sum, f) => sum + f.size, 0),
        errors: [],
        duration: 0,
      };
    }

    return this.deleteBatch(files);
  }

  /**
   * Configure S3 lifecycle policies
   */
  async configureLifecyclePolicies(
    policies: LifecyclePolicyRule[] = DEFAULT_LIFECYCLE_POLICIES
  ): Promise<void> {
    try {
      await s3Client.send(
        new PutBucketLifecycleConfigurationCommand({
          Bucket: this.bucketName,
          LifecycleConfiguration: {
            Rules: policies,
          },
        })
      );

      console.log("Lifecycle policies configured successfully");
    } catch (error) {
      console.error("Error configuring lifecycle policies:", error);
      throw error;
    }
  }

  /**
   * Get current lifecycle policies
   */
  async getLifecyclePolicies(): Promise<LifecyclePolicyRule[]> {
    try {
      const response = await s3Client.send(
        new GetBucketLifecycleConfigurationCommand({
          Bucket: this.bucketName,
        })
      );

      return response.Rules || [];
    } catch (error) {
      console.error("Error getting lifecycle policies:", error);
      return [];
    }
  }

  /**
   * Delete lifecycle policies
   */
  async deleteLifecyclePolicies(): Promise<void> {
    try {
      await s3Client.send(
        new DeleteBucketLifecycleCommand({
          Bucket: this.bucketName,
        })
      );

      console.log("Lifecycle policies deleted successfully");
    } catch (error) {
      console.error("Error deleting lifecycle policies:", error);
      throw error;
    }
  }

  /**
   * Schedule automatic cleanup
   */
  async scheduleCleanup(intervalHours: number = 24): Promise<void> {
    console.log(`Scheduling cleanup every ${intervalHours} hours`);

    const runScheduledCleanup = async () => {
      try {
        const result = await this.runCleanup();
        console.log("Scheduled cleanup completed:", result);
      } catch (error) {
        console.error("Scheduled cleanup failed:", error);
      }
    };

    // Run initial cleanup
    await runScheduledCleanup();

    // Schedule recurring cleanup
    setInterval(runScheduledCleanup, intervalHours * 60 * 60 * 1000);
  }

  /**
   * Get cleanup statistics
   */
  async getCleanupStats(): Promise<{
    totalFiles: number;
    totalSize: number;
    tempFiles: number;
    tempSize: number;
    oldFiles: number;
    oldSize: number;
  }> {
    const stats = {
      totalFiles: 0,
      totalSize: 0,
      tempFiles: 0,
      tempSize: 0,
      oldFiles: 0,
      oldSize: 0,
    };

    try {
      // Get all files
      const allFiles = await this.listFilesForCleanup("", new Date(0), {});
      stats.totalFiles = allFiles.length;
      stats.totalSize = allFiles.reduce((sum, f) => sum + f.size, 0);

      // Get temp files
      const tempFiles = await this.listFilesForCleanup(
        "temp/",
        new Date(0),
        {}
      );
      stats.tempFiles = tempFiles.length;
      stats.tempSize = tempFiles.reduce((sum, f) => sum + f.size, 0);

      // Get old files (older than 30 days)
      const cutoffDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const oldFiles = await this.listFilesForCleanup("", cutoffDate, {});
      stats.oldFiles = oldFiles.length;
      stats.oldSize = oldFiles.reduce((sum, f) => sum + f.size, 0);

      return stats;
    } catch (error) {
      console.error("Error getting cleanup stats:", error);
      return stats;
    }
  }

  /**
   * Helper methods
   */
  private matchesFileType(key: string, fileTypes: string[]): boolean {
    const extension = key.split(".").pop()?.toLowerCase();
    return extension ? fileTypes.includes(extension) : false;
  }

  private matchesFolder(key: string, folders: string[]): boolean {
    return folders.some((folder) => key.startsWith(folder));
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }
}

// Export singleton instance
export const cleanupManager = new CleanupManager();

// Utility functions
export const cleanupTempFiles = async (
  olderThanHours: number = 24
): Promise<CleanupResult> => {
  return cleanupManager.runCleanup({
    folders: ["temp/"],
    olderThanDays: olderThanHours / 24,
  });
};

export const cleanupOrphanedFiles = async (
  options: CleanupOptions = {}
): Promise<CleanupResult> => {
  return cleanupManager.runCleanup({
    ...options,
    folders: ["temp/", "uploads/failed/"],
  });
};

export const getStorageStats = async (): Promise<{
  totalFiles: number;
  totalSize: number;
  tempFiles: number;
  tempSize: number;
  oldFiles: number;
  oldSize: number;
}> => {
  return cleanupManager.getCleanupStats();
};
