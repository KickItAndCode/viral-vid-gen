import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  HeadObjectCommand,
  CopyObjectCommand,
  ListObjectsV2Command,
  GetObjectCommandOutput,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client, S3_CONFIG, getS3Key, getCloudFrontUrl, validateFileFormat, validateFileSize } from './s3-config';
import { cloudFrontManager } from './cloudfront-config';

export interface UploadOptions {
  folder: keyof typeof S3_CONFIG.folders;
  filename: string;
  contentType?: string;
  metadata?: Record<string, string>;
  cacheControl?: string;
  expiresInSeconds?: number;
}

export interface UploadResult {
  success: boolean;
  key: string;
  url: string;
  cdnUrl: string;
  error?: string;
}

export interface PresignedUrlOptions {
  folder: keyof typeof S3_CONFIG.folders;
  filename: string;
  contentType?: string;
  metadata?: Record<string, string>;
  expiresInSeconds?: number;
}

export interface PresignedUrlResult {
  success: boolean;
  uploadUrl: string;
  key: string;
  cdnUrl: string;
  error?: string;
}

export interface FileInfo {
  key: string;
  size: number;
  lastModified: Date;
  contentType: string;
  metadata?: Record<string, string>;
  url: string;
  cdnUrl: string;
}

export class S3FileManager {
  private bucketName: string;

  constructor(bucketName: string = S3_CONFIG.bucketName) {
    this.bucketName = bucketName;
  }

  /**
   * Generate presigned URL for direct browser upload
   */
  async getPresignedUploadUrl(options: PresignedUrlOptions): Promise<PresignedUrlResult> {
    try {
      const { folder, filename, contentType, metadata, expiresInSeconds = 3600 } = options;

      // Validate file format
      const fileType = folder === 'videos' || folder === 'processed' ? 'video' : 'thumbnail';
      if (!validateFileFormat(filename, fileType)) {
        return {
          success: false,
          uploadUrl: '',
          key: '',
          cdnUrl: '',
          error: `Invalid file format for ${fileType}`,
        };
      }

      const key = getS3Key(folder, filename);
      const cdnUrl = getCloudFrontUrl(key);

      // Create upload command
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        ContentType: contentType,
        Metadata: metadata,
        CacheControl: folder === 'temp' ? 'no-cache' : 'max-age=31536000', // 1 year for non-temp files
        ServerSideEncryption: 'AES256',
      });

      // Generate presigned URL
      const uploadUrl = await getSignedUrl(s3Client, command, {
        expiresIn: expiresInSeconds,
      });

      return {
        success: true,
        uploadUrl,
        key,
        cdnUrl,
      };
    } catch (error) {
      console.error('Error generating presigned upload URL:', error);
      return {
        success: false,
        uploadUrl: '',
        key: '',
        cdnUrl: '',
        error: `Failed to generate upload URL: ${error}`,
      };
    }
  }

  /**
   * Upload file directly to S3
   */
  async uploadFile(file: Buffer | Uint8Array, options: UploadOptions): Promise<UploadResult> {
    try {
      const { folder, filename, contentType, metadata, cacheControl } = options;

      // Validate file size
      if (!validateFileSize(file.length)) {
        return {
          success: false,
          key: '',
          url: '',
          cdnUrl: '',
          error: `File size exceeds limit of ${S3_CONFIG.limits.maxFileSize / (1024 * 1024)}MB`,
        };
      }

      // Validate file format
      const fileType = folder === 'videos' || folder === 'processed' ? 'video' : 'thumbnail';
      if (!validateFileFormat(filename, fileType)) {
        return {
          success: false,
          key: '',
          url: '',
          cdnUrl: '',
          error: `Invalid file format for ${fileType}`,
        };
      }

      const key = getS3Key(folder, filename);
      const url = `https://${this.bucketName}.s3.${S3_CONFIG.region}.amazonaws.com/${key}`;
      const cdnUrl = getCloudFrontUrl(key);

      // Upload file
      await s3Client.send(new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file,
        ContentType: contentType,
        Metadata: metadata,
        CacheControl: cacheControl || (folder === 'temp' ? 'no-cache' : 'max-age=31536000'),
        ServerSideEncryption: 'AES256',
      }));

      return {
        success: true,
        key,
        url,
        cdnUrl,
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      return {
        success: false,
        key: '',
        url: '',
        cdnUrl: '',
        error: `Failed to upload file: ${error}`,
      };
    }
  }

  /**
   * Get file information
   */
  async getFileInfo(key: string): Promise<FileInfo | null> {
    try {
      const response = await s3Client.send(new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      }));

      return {
        key,
        size: response.ContentLength || 0,
        lastModified: response.LastModified || new Date(),
        contentType: response.ContentType || '',
        metadata: response.Metadata,
        url: `https://${this.bucketName}.s3.${S3_CONFIG.region}.amazonaws.com/${key}`,
        cdnUrl: getCloudFrontUrl(key),
      };
    } catch (error) {
      console.error('Error getting file info:', error);
      return null;
    }
  }

  /**
   * Download file from S3
   */
  async downloadFile(key: string): Promise<Buffer | null> {
    try {
      const response: GetObjectCommandOutput = await s3Client.send(new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      }));

      if (!response.Body) {
        return null;
      }

      // Convert stream to buffer
      const chunks: Uint8Array[] = [];
      const reader = response.Body as any;
      
      return new Promise((resolve, reject) => {
        reader.on('data', (chunk: Uint8Array) => chunks.push(chunk));
        reader.on('end', () => resolve(Buffer.concat(chunks)));
        reader.on('error', reject);
      });
    } catch (error) {
      console.error('Error downloading file:', error);
      return null;
    }
  }

  /**
   * Delete single file
   */
  async deleteFile(key: string): Promise<boolean> {
    try {
      await s3Client.send(new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      }));

      // Invalidate CloudFront cache
      await cloudFrontManager.createInvalidation([`/${key}`]);

      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }

  /**
   * Delete multiple files
   */
  async deleteFiles(keys: string[]): Promise<{ success: boolean; deletedKeys: string[]; errors: string[] }> {
    try {
      const response = await s3Client.send(new DeleteObjectsCommand({
        Bucket: this.bucketName,
        Delete: {
          Objects: keys.map(key => ({ Key: key })),
        },
      }));

      const deletedKeys = response.Deleted?.map(obj => obj.Key!).filter(Boolean) || [];
      const errors = response.Errors?.map(err => `${err.Key}: ${err.Message}`).filter(Boolean) || [];

      // Invalidate CloudFront cache for successfully deleted files
      if (deletedKeys.length > 0) {
        await cloudFrontManager.createInvalidation(deletedKeys.map(key => `/${key}`));
      }

      return {
        success: errors.length === 0,
        deletedKeys,
        errors,
      };
    } catch (error) {
      console.error('Error deleting files:', error);
      return {
        success: false,
        deletedKeys: [],
        errors: [String(error)],
      };
    }
  }

  /**
   * Copy file within S3
   */
  async copyFile(sourceKey: string, destinationKey: string, metadata?: Record<string, string>): Promise<boolean> {
    try {
      await s3Client.send(new CopyObjectCommand({
        Bucket: this.bucketName,
        CopySource: `${this.bucketName}/${sourceKey}`,
        Key: destinationKey,
        Metadata: metadata,
        MetadataDirective: metadata ? 'REPLACE' : 'COPY',
        ServerSideEncryption: 'AES256',
      }));

      return true;
    } catch (error) {
      console.error('Error copying file:', error);
      return false;
    }
  }

  /**
   * Move file within S3 (copy + delete)
   */
  async moveFile(sourceKey: string, destinationKey: string, metadata?: Record<string, string>): Promise<boolean> {
    try {
      // Copy file
      const copySuccess = await this.copyFile(sourceKey, destinationKey, metadata);
      if (!copySuccess) {
        return false;
      }

      // Delete original
      const deleteSuccess = await this.deleteFile(sourceKey);
      if (!deleteSuccess) {
        // If delete fails, try to clean up the copy
        await this.deleteFile(destinationKey);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error moving file:', error);
      return false;
    }
  }

  /**
   * List files in a folder
   */
  async listFiles(folder: keyof typeof S3_CONFIG.folders, maxKeys: number = 1000): Promise<FileInfo[]> {
    try {
      const prefix = `${S3_CONFIG.folders[folder]}/`;
      const response = await s3Client.send(new ListObjectsV2Command({
        Bucket: this.bucketName,
        Prefix: prefix,
        MaxKeys: maxKeys,
      }));

      if (!response.Contents) {
        return [];
      }

      return response.Contents.map(object => ({
        key: object.Key!,
        size: object.Size || 0,
        lastModified: object.LastModified || new Date(),
        contentType: '', // Not available in list operation
        url: `https://${this.bucketName}.s3.${S3_CONFIG.region}.amazonaws.com/${object.Key}`,
        cdnUrl: getCloudFrontUrl(object.Key!),
      }));
    } catch (error) {
      console.error('Error listing files:', error);
      return [];
    }
  }

  /**
   * Get presigned URL for file download
   */
  async getPresignedDownloadUrl(key: string, expiresInSeconds: number = 3600): Promise<string | null> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      return await getSignedUrl(s3Client, command, {
        expiresIn: expiresInSeconds,
      });
    } catch (error) {
      console.error('Error generating presigned download URL:', error);
      return null;
    }
  }

  /**
   * Check if file exists
   */
  async fileExists(key: string): Promise<boolean> {
    try {
      await s3Client.send(new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      }));
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Generate unique filename with timestamp
   */
  generateUniqueFilename(originalName: string, prefix?: string): string {
    const timestamp = Date.now();
    const extension = originalName.substring(originalName.lastIndexOf('.'));
    const baseName = originalName.substring(0, originalName.lastIndexOf('.'));
    const cleanBaseName = baseName.replace(/[^a-zA-Z0-9-_]/g, '-');
    
    return prefix 
      ? `${prefix}-${cleanBaseName}-${timestamp}${extension}`
      : `${cleanBaseName}-${timestamp}${extension}`;
  }

  /**
   * Clean up temporary files older than specified time
   */
  async cleanupTempFiles(olderThanHours: number = 24): Promise<number> {
    try {
      const tempFiles = await this.listFiles('temp');
      const cutoffTime = new Date(Date.now() - olderThanHours * 60 * 60 * 1000);
      
      const filesToDelete = tempFiles.filter(file => file.lastModified < cutoffTime);
      
      if (filesToDelete.length === 0) {
        return 0;
      }

      const result = await this.deleteFiles(filesToDelete.map(file => file.key));
      return result.deletedKeys.length;
    } catch (error) {
      console.error('Error cleaning up temp files:', error);
      return 0;
    }
  }
}

// Export singleton instance
export const s3FileManager = new S3FileManager();