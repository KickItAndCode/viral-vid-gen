import {
  CreateBucketCommand,
  HeadBucketCommand,
  PutBucketCorsCommand,
  PutBucketPolicyCommand,
  PutBucketLifecycleConfigurationCommand,
  PutBucketVersioningCommand,
  PutBucketEncryptionCommand,
  PutBucketNotificationConfigurationCommand,
  GetBucketLocationCommand,
  BucketAlreadyExistsError,
  BucketAlreadyOwnedByYouError,
  NoSuchBucketError,
} from "@aws-sdk/client-s3";
import { s3Client, S3_CONFIG } from "./s3-config";

// CORS configuration for browser uploads
const CORS_CONFIGURATION = {
  CORSRules: [
    {
      AllowedHeaders: ["*"],
      AllowedMethods: ["GET", "POST", "PUT", "DELETE", "HEAD"],
      AllowedOrigins: [
        "http://localhost:3000",
        "https://localhost:3000",
        "https://viralai.com",
        "https://*.viralai.com",
      ],
      ExposeHeaders: ["ETag", "x-amz-meta-*"],
      MaxAgeSeconds: 3600,
    },
  ],
};

// Bucket policy for public read access to processed videos
const BUCKET_POLICY = {
  Version: "2012-10-17",
  Statement: [
    {
      Sid: "PublicReadGetObject",
      Effect: "Allow",
      Principal: "*",
      Action: "s3:GetObject",
      Resource: `arn:aws:s3:::${S3_CONFIG.bucketName}/${S3_CONFIG.folders.processed}/*`,
    },
    {
      Sid: "PublicReadGetThumbnails",
      Effect: "Allow",
      Principal: "*",
      Action: "s3:GetObject",
      Resource: `arn:aws:s3:::${S3_CONFIG.bucketName}/${S3_CONFIG.folders.thumbnails}/*`,
    },
  ],
};

// Lifecycle configuration for automatic cleanup
const LIFECYCLE_CONFIGURATION = {
  Rules: [
    {
      ID: "TempFileCleanup",
      Status: "Enabled",
      Filter: {
        Prefix: `${S3_CONFIG.folders.temp}/`,
      },
      Expiration: {
        Days: 1,
      },
    },
    {
      ID: "IncompleteMultipartUploads",
      Status: "Enabled",
      Filter: {},
      AbortIncompleteMultipartUpload: {
        DaysAfterInitiation: 1,
      },
    },
    {
      ID: "OldVersionCleanup",
      Status: "Enabled",
      Filter: {},
      NoncurrentVersionExpiration: {
        NoncurrentDays: 30,
      },
    },
  ],
};

// Encryption configuration
const ENCRYPTION_CONFIGURATION = {
  Rules: [
    {
      ApplyServerSideEncryptionByDefault: {
        SSEAlgorithm: "AES256",
      },
      BucketKeyEnabled: true,
    },
  ],
};

// Versioning configuration
const VERSIONING_CONFIGURATION = {
  Status: "Enabled",
  MFADelete: "Disabled",
};

export class S3BucketManager {
  private bucketName: string;

  constructor(bucketName: string = S3_CONFIG.bucketName) {
    this.bucketName = bucketName;
  }

  /**
   * Check if bucket exists
   */
  async bucketExists(): Promise<boolean> {
    try {
      await s3Client.send(new HeadBucketCommand({ Bucket: this.bucketName }));
      return true;
    } catch (error) {
      if (error instanceof NoSuchBucketError) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Create S3 bucket with all necessary configurations
   */
  async createBucket(): Promise<{ success: boolean; message: string }> {
    try {
      // Check if bucket already exists
      const exists = await this.bucketExists();
      if (exists) {
        return { success: true, message: "Bucket already exists" };
      }

      // Create bucket
      await s3Client.send(
        new CreateBucketCommand({
          Bucket: this.bucketName,
          CreateBucketConfiguration:
            S3_CONFIG.region !== "us-east-1"
              ? {
                  LocationConstraint: S3_CONFIG.region,
                }
              : undefined,
        })
      );

      // Configure bucket settings
      await this.configureBucket();

      return { success: true, message: "Bucket created successfully" };
    } catch (error) {
      if (
        error instanceof BucketAlreadyExistsError ||
        error instanceof BucketAlreadyOwnedByYouError
      ) {
        return { success: true, message: "Bucket already exists" };
      }
      console.error("Error creating bucket:", error);
      return { success: false, message: `Failed to create bucket: ${error}` };
    }
  }

  /**
   * Configure bucket with CORS, policy, lifecycle, encryption, and versioning
   */
  async configureBucket(): Promise<void> {
    try {
      // Set CORS configuration
      await s3Client.send(
        new PutBucketCorsCommand({
          Bucket: this.bucketName,
          CORSConfiguration: CORS_CONFIGURATION,
        })
      );

      // Set bucket policy
      await s3Client.send(
        new PutBucketPolicyCommand({
          Bucket: this.bucketName,
          Policy: JSON.stringify(BUCKET_POLICY),
        })
      );

      // Set lifecycle configuration
      await s3Client.send(
        new PutBucketLifecycleConfigurationCommand({
          Bucket: this.bucketName,
          LifecycleConfiguration: LIFECYCLE_CONFIGURATION,
        })
      );

      // Set encryption configuration
      await s3Client.send(
        new PutBucketEncryptionCommand({
          Bucket: this.bucketName,
          ServerSideEncryptionConfiguration: ENCRYPTION_CONFIGURATION,
        })
      );

      // Set versioning configuration
      await s3Client.send(
        new PutBucketVersioningCommand({
          Bucket: this.bucketName,
          VersioningConfiguration: VERSIONING_CONFIGURATION,
        })
      );

      console.log("Bucket configuration completed successfully");
    } catch (error) {
      console.error("Error configuring bucket:", error);
      throw error;
    }
  }

  /**
   * Get bucket location
   */
  async getBucketLocation(): Promise<string> {
    try {
      const response = await s3Client.send(
        new GetBucketLocationCommand({
          Bucket: this.bucketName,
        })
      );
      return response.LocationConstraint || "us-east-1";
    } catch (error) {
      console.error("Error getting bucket location:", error);
      throw error;
    }
  }

  /**
   * Initialize bucket - create if needed and configure
   */
  async initializeBucket(): Promise<{ success: boolean; message: string }> {
    try {
      const result = await this.createBucket();
      if (result.success) {
        await this.configureBucket();
        return { success: true, message: "Bucket initialized successfully" };
      }
      return result;
    } catch (error) {
      console.error("Error initializing bucket:", error);
      return {
        success: false,
        message: `Failed to initialize bucket: ${error}`,
      };
    }
  }

  /**
   * Update CORS configuration for development/production
   */
  async updateCorsConfiguration(
    additionalOrigins: string[] = []
  ): Promise<void> {
    const corsConfig = {
      CORSRules: [
        {
          ...CORS_CONFIGURATION.CORSRules[0],
          AllowedOrigins: [
            ...CORS_CONFIGURATION.CORSRules[0].AllowedOrigins,
            ...additionalOrigins,
          ],
        },
      ],
    };

    await s3Client.send(
      new PutBucketCorsCommand({
        Bucket: this.bucketName,
        CORSConfiguration: corsConfig,
      })
    );
  }
}

// Export singleton instance
export const s3BucketManager = new S3BucketManager();
