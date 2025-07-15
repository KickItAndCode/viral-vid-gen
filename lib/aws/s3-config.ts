import { S3Client, S3ClientConfig } from '@aws-sdk/client-s3';
import { CloudFrontClient, CloudFrontClientConfig } from '@aws-sdk/client-cloudfront';

// AWS Configuration
const AWS_CONFIG = {
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
};

// S3 Configuration
export const S3_CONFIG = {
  bucketName: process.env.AWS_S3_BUCKET || 'viralai-videos',
  region: AWS_CONFIG.region,
  publicUrl: process.env.AWS_S3_PUBLIC_URL || '',
  folders: {
    videos: 'videos',
    thumbnails: 'thumbnails',
    processed: 'processed',
    temp: 'temp',
  },
  limits: {
    maxFileSize: 500 * 1024 * 1024, // 500MB
    allowedFormats: ['.mp4', '.mov', '.avi', '.mkv', '.webm'],
    thumbnailFormats: ['.jpg', '.jpeg', '.png', '.webp'],
  },
} as const;

// CloudFront Configuration
export const CLOUDFRONT_CONFIG = {
  distributionDomain: process.env.CLOUDFRONT_DOMAIN || '',
  distributionId: process.env.CLOUDFRONT_DISTRIBUTION_ID || '',
  region: AWS_CONFIG.region,
  invalidationTtl: 3600, // 1 hour
} as const;

// Initialize S3 Client
export const s3Client = new S3Client({
  region: AWS_CONFIG.region,
  credentials: AWS_CONFIG.credentials,
  forcePathStyle: process.env.NODE_ENV === 'development',
} as S3ClientConfig);

// Initialize CloudFront Client
export const cloudFrontClient = new CloudFrontClient({
  region: AWS_CONFIG.region,
  credentials: AWS_CONFIG.credentials,
} as CloudFrontClientConfig);

// File path utilities
export const getS3Key = (folder: keyof typeof S3_CONFIG.folders, filename: string): string => {
  return `${S3_CONFIG.folders[folder]}/${filename}`;
};

export const getCloudFrontUrl = (key: string): string => {
  if (!CLOUDFRONT_CONFIG.distributionDomain) {
    return `https://${S3_CONFIG.bucketName}.s3.${S3_CONFIG.region}.amazonaws.com/${key}`;
  }
  return `https://${CLOUDFRONT_CONFIG.distributionDomain}/${key}`;
};

// Validation utilities
export const validateFileFormat = (filename: string, type: 'video' | 'thumbnail'): boolean => {
  const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  const allowedFormats = type === 'video' ? S3_CONFIG.limits.allowedFormats : S3_CONFIG.limits.thumbnailFormats;
  return allowedFormats.includes(extension);
};

export const validateFileSize = (sizeInBytes: number): boolean => {
  return sizeInBytes <= S3_CONFIG.limits.maxFileSize;
};

// Environment validation
export const validateAWSConfig = (): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!process.env.AWS_ACCESS_KEY_ID) {
    errors.push('AWS_ACCESS_KEY_ID is required');
  }
  
  if (!process.env.AWS_SECRET_ACCESS_KEY) {
    errors.push('AWS_SECRET_ACCESS_KEY is required');
  }
  
  if (!process.env.AWS_S3_BUCKET) {
    errors.push('AWS_S3_BUCKET is required');
  }
  
  if (!process.env.AWS_REGION) {
    errors.push('AWS_REGION is required');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
};