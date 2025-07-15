import {
  CreateDistributionCommand,
  GetDistributionCommand,
  UpdateDistributionCommand,
  CreateInvalidationCommand,
  GetInvalidationCommand,
  ListInvalidationsCommand,
  DistributionConfig,
  Origins,
  DefaultCacheBehavior,
  CacheBehaviors,
  CustomErrorResponses,
  ViewerProtocolPolicy,
  CachePolicyId,
  OriginRequestPolicyId,
  ResponseHeadersPolicyId,
  NoSuchDistributionError,
} from '@aws-sdk/client-cloudfront';
import { cloudFrontClient, CLOUDFRONT_CONFIG, S3_CONFIG } from './s3-config';

// CloudFront distribution configuration
const DISTRIBUTION_CONFIG: DistributionConfig = {
  CallerReference: `viralai-${Date.now()}`,
  Comment: 'ViralAI Video Distribution',
  DefaultRootObject: 'index.html',
  Enabled: true,
  PriceClass: 'PriceClass_100', // Use only North America and Europe edge locations
  
  // Origin configuration
  Origins: {
    Quantity: 1,
    Items: [
      {
        Id: 'viralai-s3-origin',
        DomainName: `${S3_CONFIG.bucketName}.s3.${S3_CONFIG.region}.amazonaws.com`,
        CustomOriginConfig: {
          HTTPPort: 80,
          HTTPSPort: 443,
          OriginProtocolPolicy: 'https-only',
          OriginSslProtocols: {
            Quantity: 3,
            Items: ['TLSv1', 'TLSv1.1', 'TLSv1.2'],
          },
        },
        OriginPath: '',
        OriginShield: {
          Enabled: false,
        },
      },
    ],
  },

  // Default cache behavior
  DefaultCacheBehavior: {
    TargetOriginId: 'viralai-s3-origin',
    ViewerProtocolPolicy: ViewerProtocolPolicy.redirect_to_https,
    CachePolicyId: '4135ea2d-6df8-44a3-9df3-4b5a84be39ad', // Managed-CachingOptimized
    OriginRequestPolicyId: '88a5eaf4-2fd4-4709-b370-b4c650ea3fcf', // Managed-CORS-S3Origin
    ResponseHeadersPolicyId: '67f7725c-6f97-4210-82d7-5512b31e9d03', // Managed-SecurityHeadersPolicy
    Compress: true,
    AllowedMethods: {
      Quantity: 7,
      Items: ['GET', 'HEAD', 'OPTIONS', 'PUT', 'POST', 'PATCH', 'DELETE'],
      CachedMethods: {
        Quantity: 2,
        Items: ['GET', 'HEAD'],
      },
    },
    TrustedSigners: {
      Enabled: false,
      Quantity: 0,
    },
    TrustedKeyGroups: {
      Enabled: false,
      Quantity: 0,
    },
    MinTTL: 0,
    DefaultTTL: 86400, // 24 hours
    MaxTTL: 31536000, // 1 year
  },

  // Cache behaviors for different content types
  CacheBehaviors: {
    Quantity: 3,
    Items: [
      {
        PathPattern: '/videos/*',
        TargetOriginId: 'viralai-s3-origin',
        ViewerProtocolPolicy: ViewerProtocolPolicy.redirect_to_https,
        CachePolicyId: '4135ea2d-6df8-44a3-9df3-4b5a84be39ad', // Managed-CachingOptimized
        OriginRequestPolicyId: '88a5eaf4-2fd4-4709-b370-b4c650ea3fcf', // Managed-CORS-S3Origin
        ResponseHeadersPolicyId: '67f7725c-6f97-4210-82d7-5512b31e9d03', // Managed-SecurityHeadersPolicy
        Compress: false, // Don't compress videos
        AllowedMethods: {
          Quantity: 3,
          Items: ['GET', 'HEAD', 'OPTIONS'],
          CachedMethods: {
            Quantity: 2,
            Items: ['GET', 'HEAD'],
          },
        },
        TrustedSigners: {
          Enabled: false,
          Quantity: 0,
        },
        TrustedKeyGroups: {
          Enabled: false,
          Quantity: 0,
        },
        MinTTL: 0,
        DefaultTTL: 604800, // 7 days
        MaxTTL: 31536000, // 1 year
      },
      {
        PathPattern: '/thumbnails/*',
        TargetOriginId: 'viralai-s3-origin',
        ViewerProtocolPolicy: ViewerProtocolPolicy.redirect_to_https,
        CachePolicyId: '4135ea2d-6df8-44a3-9df3-4b5a84be39ad', // Managed-CachingOptimized
        OriginRequestPolicyId: '88a5eaf4-2fd4-4709-b370-b4c650ea3fcf', // Managed-CORS-S3Origin
        ResponseHeadersPolicyId: '67f7725c-6f97-4210-82d7-5512b31e9d03', // Managed-SecurityHeadersPolicy
        Compress: true,
        AllowedMethods: {
          Quantity: 3,
          Items: ['GET', 'HEAD', 'OPTIONS'],
          CachedMethods: {
            Quantity: 2,
            Items: ['GET', 'HEAD'],
          },
        },
        TrustedSigners: {
          Enabled: false,
          Quantity: 0,
        },
        TrustedKeyGroups: {
          Enabled: false,
          Quantity: 0,
        },
        MinTTL: 0,
        DefaultTTL: 2592000, // 30 days
        MaxTTL: 31536000, // 1 year
      },
      {
        PathPattern: '/processed/*',
        TargetOriginId: 'viralai-s3-origin',
        ViewerProtocolPolicy: ViewerProtocolPolicy.redirect_to_https,
        CachePolicyId: '4135ea2d-6df8-44a3-9df3-4b5a84be39ad', // Managed-CachingOptimized
        OriginRequestPolicyId: '88a5eaf4-2fd4-4709-b370-b4c650ea3fcf', // Managed-CORS-S3Origin
        ResponseHeadersPolicyId: '67f7725c-6f97-4210-82d7-5512b31e9d03', // Managed-SecurityHeadersPolicy
        Compress: false, // Don't compress processed videos
        AllowedMethods: {
          Quantity: 3,
          Items: ['GET', 'HEAD', 'OPTIONS'],
          CachedMethods: {
            Quantity: 2,
            Items: ['GET', 'HEAD'],
          },
        },
        TrustedSigners: {
          Enabled: false,
          Quantity: 0,
        },
        TrustedKeyGroups: {
          Enabled: false,
          Quantity: 0,
        },
        MinTTL: 0,
        DefaultTTL: 604800, // 7 days
        MaxTTL: 31536000, // 1 year
      },
    ],
  },

  // Custom error responses
  CustomErrorResponses: {
    Quantity: 2,
    Items: [
      {
        ErrorCode: 404,
        ResponseCode: '404',
        ResponsePagePath: '/404.html',
        ErrorCachingMinTTL: 300, // 5 minutes
      },
      {
        ErrorCode: 403,
        ResponseCode: '403',
        ResponsePagePath: '/403.html',
        ErrorCachingMinTTL: 300, // 5 minutes
      },
    ],
  },

  // Geo restrictions
  Restrictions: {
    GeoRestriction: {
      RestrictionType: 'none',
      Quantity: 0,
    },
  },

  // Viewer certificate (use default CloudFront certificate)
  ViewerCertificate: {
    CloudFrontDefaultCertificate: true,
    MinimumProtocolVersion: 'TLSv1.2_2021',
    CertificateSource: 'cloudfront',
  },

  // HTTP version
  HttpVersion: 'http2',

  // IPv6 support
  IsIPV6Enabled: true,

  // Web ACL
  WebACLId: '',

  // Logging
  Logging: {
    Enabled: false,
    IncludeCookies: false,
    Bucket: '',
    Prefix: '',
  },
};

export interface CloudFrontDistributionInfo {
  id: string;
  arn: string;
  domainName: string;
  status: string;
  lastModifiedTime: Date;
  etag: string;
}

export class CloudFrontManager {
  private distributionId?: string;

  constructor(distributionId?: string) {
    this.distributionId = distributionId || CLOUDFRONT_CONFIG.distributionId;
  }

  /**
   * Create a new CloudFront distribution
   */
  async createDistribution(): Promise<CloudFrontDistributionInfo> {
    try {
      const response = await cloudFrontClient.send(
        new CreateDistributionCommand({
          DistributionConfig: DISTRIBUTION_CONFIG,
        })
      );

      if (!response.Distribution) {
        throw new Error('Failed to create distribution');
      }

      const distribution = response.Distribution;
      this.distributionId = distribution.Id;

      return {
        id: distribution.Id!,
        arn: distribution.ARN!,
        domainName: distribution.DomainName!,
        status: distribution.Status!,
        lastModifiedTime: distribution.LastModifiedTime!,
        etag: response.ETag!,
      };
    } catch (error) {
      console.error('Error creating CloudFront distribution:', error);
      throw error;
    }
  }

  /**
   * Get distribution information
   */
  async getDistribution(): Promise<CloudFrontDistributionInfo | null> {
    if (!this.distributionId) {
      return null;
    }

    try {
      const response = await cloudFrontClient.send(
        new GetDistributionCommand({
          Id: this.distributionId,
        })
      );

      if (!response.Distribution) {
        return null;
      }

      const distribution = response.Distribution;
      return {
        id: distribution.Id!,
        arn: distribution.ARN!,
        domainName: distribution.DomainName!,
        status: distribution.Status!,
        lastModifiedTime: distribution.LastModifiedTime!,
        etag: response.ETag!,
      };
    } catch (error) {
      if (error instanceof NoSuchDistributionError) {
        return null;
      }
      console.error('Error getting CloudFront distribution:', error);
      throw error;
    }
  }

  /**
   * Update distribution configuration
   */
  async updateDistribution(config: Partial<DistributionConfig>): Promise<CloudFrontDistributionInfo> {
    if (!this.distributionId) {
      throw new Error('Distribution ID is required');
    }

    try {
      // First get the current distribution to get the ETag
      const currentResponse = await cloudFrontClient.send(
        new GetDistributionCommand({
          Id: this.distributionId,
        })
      );

      if (!currentResponse.Distribution || !currentResponse.ETag) {
        throw new Error('Failed to get current distribution');
      }

      const updatedConfig = {
        ...currentResponse.Distribution.DistributionConfig,
        ...config,
      };

      const response = await cloudFrontClient.send(
        new UpdateDistributionCommand({
          Id: this.distributionId,
          DistributionConfig: updatedConfig,
          IfMatch: currentResponse.ETag,
        })
      );

      if (!response.Distribution) {
        throw new Error('Failed to update distribution');
      }

      const distribution = response.Distribution;
      return {
        id: distribution.Id!,
        arn: distribution.ARN!,
        domainName: distribution.DomainName!,
        status: distribution.Status!,
        lastModifiedTime: distribution.LastModifiedTime!,
        etag: response.ETag!,
      };
    } catch (error) {
      console.error('Error updating CloudFront distribution:', error);
      throw error;
    }
  }

  /**
   * Create cache invalidation
   */
  async createInvalidation(paths: string[]): Promise<{ id: string; status: string }> {
    if (!this.distributionId) {
      throw new Error('Distribution ID is required');
    }

    try {
      const response = await cloudFrontClient.send(
        new CreateInvalidationCommand({
          DistributionId: this.distributionId,
          InvalidationBatch: {
            Paths: {
              Quantity: paths.length,
              Items: paths,
            },
            CallerReference: `invalidation-${Date.now()}`,
          },
        })
      );

      if (!response.Invalidation) {
        throw new Error('Failed to create invalidation');
      }

      return {
        id: response.Invalidation.Id!,
        status: response.Invalidation.Status!,
      };
    } catch (error) {
      console.error('Error creating CloudFront invalidation:', error);
      throw error;
    }
  }

  /**
   * Get invalidation status
   */
  async getInvalidation(invalidationId: string): Promise<{ id: string; status: string; createTime: Date }> {
    if (!this.distributionId) {
      throw new Error('Distribution ID is required');
    }

    try {
      const response = await cloudFrontClient.send(
        new GetInvalidationCommand({
          DistributionId: this.distributionId,
          Id: invalidationId,
        })
      );

      if (!response.Invalidation) {
        throw new Error('Invalidation not found');
      }

      return {
        id: response.Invalidation.Id!,
        status: response.Invalidation.Status!,
        createTime: response.Invalidation.CreateTime!,
      };
    } catch (error) {
      console.error('Error getting CloudFront invalidation:', error);
      throw error;
    }
  }

  /**
   * List recent invalidations
   */
  async listInvalidations(maxItems: number = 10): Promise<Array<{ id: string; status: string; createTime: Date }>> {
    if (!this.distributionId) {
      throw new Error('Distribution ID is required');
    }

    try {
      const response = await cloudFrontClient.send(
        new ListInvalidationsCommand({
          DistributionId: this.distributionId,
          MaxItems: maxItems,
        })
      );

      if (!response.InvalidationList || !response.InvalidationList.Items) {
        return [];
      }

      return response.InvalidationList.Items.map((item) => ({
        id: item.Id!,
        status: item.Status!,
        createTime: item.CreateTime!,
      }));
    } catch (error) {
      console.error('Error listing CloudFront invalidations:', error);
      throw error;
    }
  }

  /**
   * Initialize CloudFront distribution - create if needed
   */
  async initializeDistribution(): Promise<CloudFrontDistributionInfo> {
    try {
      // Check if distribution already exists
      const existing = await this.getDistribution();
      if (existing) {
        return existing;
      }

      // Create new distribution
      return await this.createDistribution();
    } catch (error) {
      console.error('Error initializing CloudFront distribution:', error);
      throw error;
    }
  }

  /**
   * Wait for distribution to be deployed
   */
  async waitForDeployment(maxWaitTime: number = 30 * 60 * 1000): Promise<boolean> {
    const startTime = Date.now();
    const pollInterval = 30000; // 30 seconds

    while (Date.now() - startTime < maxWaitTime) {
      const distribution = await this.getDistribution();
      if (distribution && distribution.status === 'Deployed') {
        return true;
      }

      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    return false;
  }
}

// Export singleton instance
export const cloudFrontManager = new CloudFrontManager();