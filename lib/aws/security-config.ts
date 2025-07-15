import {
  PutBucketCorsCommand,
  PutBucketPolicyCommand,
  PutPublicAccessBlockCommand,
  PutBucketEncryptionCommand,
  PutBucketVersioningCommand,
  PutBucketLoggingCommand,
  PutBucketNotificationConfigurationCommand,
} from '@aws-sdk/client-s3';
import { s3Client, S3_CONFIG } from './s3-config';

export interface SecurityConfig {
  allowedOrigins: string[];
  allowedMethods: string[];
  allowedHeaders: string[];
  exposedHeaders: string[];
  maxAge: number;
  credentials: boolean;
}

export interface SecurityHeaders {
  'Content-Security-Policy': string;
  'X-Frame-Options': string;
  'X-Content-Type-Options': string;
  'Referrer-Policy': string;
  'Permissions-Policy': string;
  'Strict-Transport-Security': string;
  'X-XSS-Protection': string;
}

// Environment-specific CORS configuration
const getCORSConfiguration = (environment: string = process.env.NODE_ENV || 'development') => {
  const baseConfig = {
    allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'Cache-Control',
      'X-File-Name',
      'X-File-Size',
      'X-File-Type',
      'X-Upload-Progress',
      'X-Csrf-Token',
      'X-Api-Key',
    ],
    exposedHeaders: [
      'ETag',
      'Content-Length',
      'Content-Type',
      'Last-Modified',
      'Accept-Ranges',
      'Content-Range',
      'X-Upload-Progress',
      'X-File-Id',
    ],
    maxAge: 86400, // 24 hours
    credentials: true,
  };

  switch (environment) {
    case 'production':
      return {
        ...baseConfig,
        allowedOrigins: [
          'https://viralai.com',
          'https://www.viralai.com',
          'https://app.viralai.com',
          'https://api.viralai.com',
        ],
      };
    case 'staging':
      return {
        ...baseConfig,
        allowedOrigins: [
          'https://staging.viralai.com',
          'https://staging-app.viralai.com',
          'https://staging-api.viralai.com',
          'https://deploy-preview-*.viralai.com',
        ],
      };
    case 'development':
    default:
      return {
        ...baseConfig,
        allowedOrigins: [
          'http://localhost:3000',
          'http://localhost:3001',
          'http://localhost:8080',
          'https://localhost:3000',
          'https://localhost:3001',
          'https://localhost:8080',
          'http://127.0.0.1:3000',
          'https://127.0.0.1:3000',
        ],
      };
  }
};

// Security headers configuration
export const getSecurityHeaders = (environment: string = process.env.NODE_ENV || 'development'): SecurityHeaders => {
  const isProduction = environment === 'production';
  const domain = isProduction ? 'viralai.com' : 'localhost:3000';
  
  return {
    'Content-Security-Policy': [
      `default-src 'self'`,
      `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com`,
      `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
      `font-src 'self' https://fonts.gstatic.com`,
      `img-src 'self' data: blob: https://*.amazonaws.com https://*.cloudfront.net https://*.unsplash.com`,
      `media-src 'self' blob: https://*.amazonaws.com https://*.cloudfront.net`,
      `connect-src 'self' https://api.${domain} https://*.amazonaws.com https://*.cloudfront.net wss://${domain}`,
      `frame-ancestors 'none'`,
      `base-uri 'self'`,
      `form-action 'self'`,
      `upgrade-insecure-requests`,
    ].join('; '),
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': [
      'accelerometer=()',
      'ambient-light-sensor=()',
      'autoplay=(self)',
      'battery=()',
      'camera=(self)',
      'cross-origin-isolated=()',
      'display-capture=()',
      'document-domain=()',
      'encrypted-media=()',
      'execution-while-not-rendered=()',
      'execution-while-out-of-viewport=()',
      'fullscreen=(self)',
      'geolocation=()',
      'gyroscope=()',
      'keyboard-map=()',
      'magnetometer=()',
      'microphone=(self)',
      'midi=()',
      'navigation-override=()',
      'payment=()',
      'picture-in-picture=()',
      'publickey-credentials-get=()',
      'screen-wake-lock=()',
      'sync-xhr=()',
      'usb=()',
      'web-share=()',
      'xr-spatial-tracking=()',
    ].join(', '),
    'Strict-Transport-Security': isProduction ? 'max-age=31536000; includeSubDomains; preload' : 'max-age=0',
    'X-XSS-Protection': '1; mode=block',
  };
};

// S3 bucket policy for secure access
const createBucketPolicy = (bucketName: string, environment: string) => {
  const corsConfig = getCORSConfiguration(environment);
  
  return {
    Version: '2012-10-17',
    Statement: [
      {
        Sid: 'PublicReadGetObject',
        Effect: 'Allow',
        Principal: '*',
        Action: 's3:GetObject',
        Resource: [
          `arn:aws:s3:::${bucketName}/processed/*`,
          `arn:aws:s3:::${bucketName}/thumbnails/*`,
        ],
        Condition: {
          StringLike: {
            'aws:Referer': corsConfig.allowedOrigins.map(origin => `${origin}/*`),
          },
        },
      },
      {
        Sid: 'DenyInsecureConnections',
        Effect: 'Deny',
        Principal: '*',
        Action: 's3:*',
        Resource: [
          `arn:aws:s3:::${bucketName}/*`,
          `arn:aws:s3:::${bucketName}`,
        ],
        Condition: {
          Bool: {
            'aws:SecureTransport': 'false',
          },
        },
      },
      {
        Sid: 'DenyUnencryptedObjectUploads',
        Effect: 'Deny',
        Principal: '*',
        Action: 's3:PutObject',
        Resource: `arn:aws:s3:::${bucketName}/*`,
        Condition: {
          StringNotEquals: {
            's3:x-amz-server-side-encryption': 'AES256',
          },
        },
      },
      {
        Sid: 'DenyPublicReadOnPrivateFolders',
        Effect: 'Deny',
        Principal: '*',
        Action: 's3:GetObject',
        Resource: [
          `arn:aws:s3:::${bucketName}/videos/*`,
          `arn:aws:s3:::${bucketName}/temp/*`,
        ],
      },
    ],
  };
};

// Public access block configuration
const PUBLIC_ACCESS_BLOCK_CONFIG = {
  BlockPublicAcls: true,
  IgnorePublicAcls: true,
  BlockPublicPolicy: false, // We need this for CloudFront access
  RestrictPublicBuckets: false, // We need this for CloudFront access
};

// Encryption configuration
const ENCRYPTION_CONFIG = {
  Rules: [
    {
      ApplyServerSideEncryptionByDefault: {
        SSEAlgorithm: 'AES256',
      },
      BucketKeyEnabled: true,
    },
  ],
};

// Versioning configuration
const VERSIONING_CONFIG = {
  Status: 'Enabled',
  MFADelete: 'Disabled',
};

// Logging configuration
const createLoggingConfig = (bucketName: string) => ({
  LoggingEnabled: {
    TargetBucket: bucketName,
    TargetPrefix: 'access-logs/',
    TargetGrants: [
      {
        Grantee: {
          Type: 'Group',
          URI: 'http://acs.amazonaws.com/groups/s3/LogDelivery',
        },
        Permission: 'WRITE',
      },
    ],
  },
});

export class SecurityManager {
  private bucketName: string;
  private environment: string;

  constructor(bucketName: string = S3_CONFIG.bucketName, environment: string = process.env.NODE_ENV || 'development') {
    this.bucketName = bucketName;
    this.environment = environment;
  }

  /**
   * Configure comprehensive S3 security settings
   */
  async configureS3Security(): Promise<{ success: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      // Configure CORS
      await this.configureCORS();
    } catch (error) {
      errors.push(`CORS configuration failed: ${error}`);
    }

    try {
      // Configure bucket policy
      await this.configureBucketPolicy();
    } catch (error) {
      errors.push(`Bucket policy configuration failed: ${error}`);
    }

    try {
      // Configure public access block
      await this.configurePublicAccessBlock();
    } catch (error) {
      errors.push(`Public access block configuration failed: ${error}`);
    }

    try {
      // Configure encryption
      await this.configureEncryption();
    } catch (error) {
      errors.push(`Encryption configuration failed: ${error}`);
    }

    try {
      // Configure versioning
      await this.configureVersioning();
    } catch (error) {
      errors.push(`Versioning configuration failed: ${error}`);
    }

    try {
      // Configure logging (optional)
      await this.configureLogging();
    } catch (error) {
      errors.push(`Logging configuration failed: ${error}`);
    }

    return {
      success: errors.length === 0,
      errors,
    };
  }

  /**
   * Configure CORS policies
   */
  async configureCORS(): Promise<void> {
    const corsConfig = getCORSConfiguration(this.environment);
    
    const corsRules = [
      {
        AllowedHeaders: corsConfig.allowedHeaders,
        AllowedMethods: corsConfig.allowedMethods,
        AllowedOrigins: corsConfig.allowedOrigins,
        ExposeHeaders: corsConfig.exposedHeaders,
        MaxAgeSeconds: corsConfig.maxAge,
      },
    ];

    await s3Client.send(new PutBucketCorsCommand({
      Bucket: this.bucketName,
      CORSConfiguration: {
        CORSRules: corsRules,
      },
    }));

    console.log('CORS configuration applied successfully');
  }

  /**
   * Configure bucket policy
   */
  async configureBucketPolicy(): Promise<void> {
    const bucketPolicy = createBucketPolicy(this.bucketName, this.environment);

    await s3Client.send(new PutBucketPolicyCommand({
      Bucket: this.bucketName,
      Policy: JSON.stringify(bucketPolicy),
    }));

    console.log('Bucket policy configured successfully');
  }

  /**
   * Configure public access block
   */
  async configurePublicAccessBlock(): Promise<void> {
    await s3Client.send(new PutPublicAccessBlockCommand({
      Bucket: this.bucketName,
      PublicAccessBlockConfiguration: PUBLIC_ACCESS_BLOCK_CONFIG,
    }));

    console.log('Public access block configured successfully');
  }

  /**
   * Configure encryption
   */
  async configureEncryption(): Promise<void> {
    await s3Client.send(new PutBucketEncryptionCommand({
      Bucket: this.bucketName,
      ServerSideEncryptionConfiguration: ENCRYPTION_CONFIG,
    }));

    console.log('Encryption configured successfully');
  }

  /**
   * Configure versioning
   */
  async configureVersioning(): Promise<void> {
    await s3Client.send(new PutBucketVersioningCommand({
      Bucket: this.bucketName,
      VersioningConfiguration: VERSIONING_CONFIG,
    }));

    console.log('Versioning configured successfully');
  }

  /**
   * Configure access logging
   */
  async configureLogging(): Promise<void> {
    const loggingConfig = createLoggingConfig(this.bucketName);

    await s3Client.send(new PutBucketLoggingCommand({
      Bucket: this.bucketName,
      BucketLoggingStatus: loggingConfig,
    }));

    console.log('Access logging configured successfully');
  }

  /**
   * Update CORS configuration for new origins
   */
  async updateCORSOrigins(additionalOrigins: string[]): Promise<void> {
    const corsConfig = getCORSConfiguration(this.environment);
    const updatedOrigins = [...corsConfig.allowedOrigins, ...additionalOrigins];

    await s3Client.send(new PutBucketCorsCommand({
      Bucket: this.bucketName,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedHeaders: corsConfig.allowedHeaders,
            AllowedMethods: corsConfig.allowedMethods,
            AllowedOrigins: updatedOrigins,
            ExposeHeaders: corsConfig.exposedHeaders,
            MaxAgeSeconds: corsConfig.maxAge,
          },
        ],
      },
    }));

    console.log('CORS origins updated successfully');
  }

  /**
   * Validate security configuration
   */
  async validateSecurityConfiguration(): Promise<{ valid: boolean; issues: string[] }> {
    const issues: string[] = [];

    // Check if HTTPS is enforced
    if (this.environment === 'production' && !this.isHTTPSEnforced()) {
      issues.push('HTTPS is not enforced in production');
    }

    // Check if encryption is enabled
    if (!this.isEncryptionEnabled()) {
      issues.push('Server-side encryption is not enabled');
    }

    // Check if versioning is enabled
    if (!this.isVersioningEnabled()) {
      issues.push('Versioning is not enabled');
    }

    // Check CORS configuration
    const corsIssues = this.validateCORSConfiguration();
    issues.push(...corsIssues);

    return {
      valid: issues.length === 0,
      issues,
    };
  }

  /**
   * Check if HTTPS is enforced
   */
  private isHTTPSEnforced(): boolean {
    // This would typically check the bucket policy
    return true; // Placeholder
  }

  /**
   * Check if encryption is enabled
   */
  private isEncryptionEnabled(): boolean {
    // This would typically check the encryption configuration
    return true; // Placeholder
  }

  /**
   * Check if versioning is enabled
   */
  private isVersioningEnabled(): boolean {
    // This would typically check the versioning configuration
    return true; // Placeholder
  }

  /**
   * Validate CORS configuration
   */
  private validateCORSConfiguration(): string[] {
    const issues: string[] = [];
    const corsConfig = getCORSConfiguration(this.environment);

    // Check for overly permissive origins
    if (corsConfig.allowedOrigins.includes('*')) {
      issues.push('Wildcard origin (*) is not allowed');
    }

    // Check for non-HTTPS origins in production
    if (this.environment === 'production') {
      const nonHTTPSOrigins = corsConfig.allowedOrigins.filter(origin => 
        origin.startsWith('http://') && !origin.includes('localhost')
      );
      if (nonHTTPSOrigins.length > 0) {
        issues.push(`Non-HTTPS origins in production: ${nonHTTPSOrigins.join(', ')}`);
      }
    }

    return issues;
  }

  /**
   * Get current security configuration
   */
  getSecurityConfiguration(): {
    cors: SecurityConfig;
    headers: SecurityHeaders;
    environment: string;
  } {
    return {
      cors: getCORSConfiguration(this.environment),
      headers: getSecurityHeaders(this.environment),
      environment: this.environment,
    };
  }
}

// Export singleton instance
export const securityManager = new SecurityManager();

// Utility functions for Next.js API routes
export const applyCORSHeaders = (headers: Headers, origin?: string): void => {
  const corsConfig = getCORSConfiguration();
  
  if (origin && corsConfig.allowedOrigins.includes(origin)) {
    headers.set('Access-Control-Allow-Origin', origin);
  }
  
  headers.set('Access-Control-Allow-Methods', corsConfig.allowedMethods.join(', '));
  headers.set('Access-Control-Allow-Headers', corsConfig.allowedHeaders.join(', '));
  headers.set('Access-Control-Expose-Headers', corsConfig.exposedHeaders.join(', '));
  headers.set('Access-Control-Max-Age', corsConfig.maxAge.toString());
  
  if (corsConfig.credentials) {
    headers.set('Access-Control-Allow-Credentials', 'true');
  }
};

export const applySecurityHeaders = (headers: Headers): void => {
  const securityHeaders = getSecurityHeaders();
  
  Object.entries(securityHeaders).forEach(([key, value]) => {
    headers.set(key, value);
  });
};

// Middleware helpers
export const createSecurityMiddleware = (options: { 
  cors?: boolean; 
  headers?: boolean; 
  environment?: string 
} = {}) => {
  const { cors = true, headers = true, environment = process.env.NODE_ENV } = options;
  
  return (request: Request, response: Response, next: Function) => {
    const responseHeaders = new Headers();
    
    if (cors) {
      const origin = request.headers.get('origin');
      applyCORSHeaders(responseHeaders, origin || undefined);
    }
    
    if (headers) {
      applySecurityHeaders(responseHeaders);
    }
    
    // Apply headers to response
    responseHeaders.forEach((value, key) => {
      response.headers.set(key, value);
    });
    
    next();
  };
};