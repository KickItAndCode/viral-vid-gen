import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { CreateInvalidationCommand } from "@aws-sdk/client-cloudfront";
import {
  s3Client,
  cloudFrontClient,
  S3_CONFIG,
  CLOUDFRONT_CONFIG,
} from "./s3-config";
import { cloudFrontManager } from "./cloudfront-config";

export interface CDNUrlOptions {
  secure?: boolean;
  cacheBusting?: boolean;
  customDomain?: string;
  protocol?: "http" | "https";
  queryParams?: Record<string, string>;
}

export interface SignedUrlOptions {
  expiresInSeconds?: number;
  responseHeaders?: Record<string, string>;
  ipAddress?: string;
  userAgent?: string;
}

export interface CacheInvalidationOptions {
  paths: string[];
  priority?: "high" | "normal";
  waitForCompletion?: boolean;
  maxWaitTime?: number;
}

export interface CacheInvalidationResult {
  id: string;
  status: string;
  createTime: Date;
  completed?: boolean;
}

export class CDNHelper {
  private distributionDomain: string;
  private s3Domain: string;

  constructor() {
    this.distributionDomain = CLOUDFRONT_CONFIG.distributionDomain;
    this.s3Domain = `${S3_CONFIG.bucketName}.s3.${S3_CONFIG.region}.amazonaws.com`;
  }

  /**
   * Generate CDN URL for a file
   */
  generateCDNUrl(key: string, options: CDNUrlOptions = {}): string {
    const {
      secure = true,
      cacheBusting = false,
      customDomain = this.distributionDomain,
      protocol = "https",
      queryParams = {},
    } = options;

    // Use S3 direct URL if no CloudFront distribution
    if (!customDomain) {
      const s3Protocol = secure ? "https" : "http";
      const url = `${s3Protocol}://${this.s3Domain}/${key}`;

      if (cacheBusting) {
        queryParams.v = Date.now().toString();
      }

      return this.appendQueryParams(url, queryParams);
    }

    // Use CloudFront URL
    const cdnProtocol = secure ? "https" : protocol;
    const url = `${cdnProtocol}://${customDomain}/${key}`;

    if (cacheBusting) {
      queryParams.v = Date.now().toString();
    }

    return this.appendQueryParams(url, queryParams);
  }

  /**
   * Generate signed URL for private content
   */
  async generateSignedUrl(
    key: string,
    options: SignedUrlOptions = {}
  ): Promise<string> {
    const {
      expiresInSeconds = 3600,
      responseHeaders = {},
      ipAddress,
      userAgent,
    } = options;

    const command = new GetObjectCommand({
      Bucket: S3_CONFIG.bucketName,
      Key: key,
      ResponseContentType: responseHeaders["Content-Type"],
      ResponseContentLanguage: responseHeaders["Content-Language"],
      ResponseContentEncoding: responseHeaders["Content-Encoding"],
      ResponseContentDisposition: responseHeaders["Content-Disposition"],
      ResponseCacheControl: responseHeaders["Cache-Control"],
      ResponseExpires: responseHeaders["Expires"]
        ? new Date(responseHeaders["Expires"])
        : undefined,
    });

    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: expiresInSeconds,
    });

    return signedUrl;
  }

  /**
   * Generate multiple CDN URLs for different file formats
   */
  generateMultiFormatUrls(
    baseKey: string,
    formats: string[],
    options: CDNUrlOptions = {}
  ): Record<string, string> {
    const urls: Record<string, string> = {};

    formats.forEach((format) => {
      const key = baseKey.replace(/\.[^/.]+$/, `.${format}`);
      urls[format] = this.generateCDNUrl(key, options);
    });

    return urls;
  }

  /**
   * Generate responsive image URLs
   */
  generateResponsiveUrls(
    baseKey: string,
    sizes: string[],
    options: CDNUrlOptions = {}
  ): Record<string, string> {
    const urls: Record<string, string> = {};

    sizes.forEach((size) => {
      const key = baseKey.replace(/\.[^/.]+$/, `_${size}$&`);
      urls[size] = this.generateCDNUrl(key, options);
    });

    return urls;
  }

  /**
   * Generate video streaming URLs for different qualities
   */
  generateVideoStreamingUrls(
    baseKey: string,
    qualities: string[],
    options: CDNUrlOptions = {}
  ): Record<string, string> {
    const urls: Record<string, string> = {};

    qualities.forEach((quality) => {
      const key = baseKey.replace(/\.[^/.]+$/, `_${quality}$&`);
      urls[quality] = this.generateCDNUrl(key, options);
    });

    return urls;
  }

  /**
   * Generate HLS (HTTP Live Streaming) URLs
   */
  generateHLSUrls(
    baseKey: string,
    options: CDNUrlOptions = {}
  ): { master: string; segments: string[] } {
    const masterKey = baseKey.replace(/\.[^/.]+$/, ".m3u8");
    const masterUrl = this.generateCDNUrl(masterKey, options);

    // Generate segment URLs (this would typically be done based on actual segment files)
    const segments = Array.from({ length: 10 }, (_, i) => {
      const segmentKey = baseKey.replace(/\.[^/.]+$/, `_segment_${i}.ts`);
      return this.generateCDNUrl(segmentKey, options);
    });

    return { master: masterUrl, segments };
  }

  /**
   * Generate DASH (Dynamic Adaptive Streaming) URLs
   */
  generateDASHUrls(
    baseKey: string,
    options: CDNUrlOptions = {}
  ): { manifest: string; segments: string[] } {
    const manifestKey = baseKey.replace(/\.[^/.]+$/, ".mpd");
    const manifestUrl = this.generateCDNUrl(manifestKey, options);

    // Generate segment URLs (this would typically be done based on actual segment files)
    const segments = Array.from({ length: 10 }, (_, i) => {
      const segmentKey = baseKey.replace(/\.[^/.]+$/, `_segment_${i}.m4s`);
      return this.generateCDNUrl(segmentKey, options);
    });

    return { manifest: manifestUrl, segments };
  }

  /**
   * Invalidate CloudFront cache for specific paths
   */
  async invalidateCache(
    options: CacheInvalidationOptions
  ): Promise<CacheInvalidationResult> {
    const {
      paths,
      priority = "normal",
      waitForCompletion = false,
      maxWaitTime = 10 * 60 * 1000, // 10 minutes
    } = options;

    // Ensure paths start with /
    const normalizedPaths = paths.map((path) =>
      path.startsWith("/") ? path : `/${path}`
    );

    const invalidationResult =
      await cloudFrontManager.createInvalidation(normalizedPaths);

    const result: CacheInvalidationResult = {
      id: invalidationResult.id,
      status: invalidationResult.status,
      createTime: new Date(),
    };

    // Wait for completion if requested
    if (waitForCompletion) {
      const startTime = Date.now();

      while (Date.now() - startTime < maxWaitTime) {
        const status = await cloudFrontManager.getInvalidation(
          invalidationResult.id
        );

        if (status.status === "Completed") {
          result.completed = true;
          result.status = status.status;
          break;
        }

        // Wait 10 seconds before checking again
        await new Promise((resolve) => setTimeout(resolve, 10000));
      }
    }

    return result;
  }

  /**
   * Purge entire cache for a distribution
   */
  async purgeEntireCache(
    waitForCompletion = false
  ): Promise<CacheInvalidationResult> {
    return this.invalidateCache({
      paths: ["/*"],
      waitForCompletion,
    });
  }

  /**
   * Purge cache for a specific folder
   */
  async purgeFolderCache(
    folder: string,
    waitForCompletion = false
  ): Promise<CacheInvalidationResult> {
    return this.invalidateCache({
      paths: [`/${folder}/*`],
      waitForCompletion,
    });
  }

  /**
   * Get optimized image URL with transformations
   */
  generateOptimizedImageUrl(
    key: string,
    transformations: {
      width?: number;
      height?: number;
      quality?: number;
      format?: "jpeg" | "png" | "webp";
      fit?: "cover" | "contain" | "fill";
    },
    options: CDNUrlOptions = {}
  ): string {
    const queryParams = { ...options.queryParams };

    // Add transformation parameters
    if (transformations.width) queryParams.w = transformations.width.toString();
    if (transformations.height)
      queryParams.h = transformations.height.toString();
    if (transformations.quality)
      queryParams.q = transformations.quality.toString();
    if (transformations.format) queryParams.f = transformations.format;
    if (transformations.fit) queryParams.fit = transformations.fit;

    return this.generateCDNUrl(key, { ...options, queryParams });
  }

  /**
   * Generate WebP fallback URLs
   */
  generateWebPFallbackUrls(
    key: string,
    options: CDNUrlOptions = {}
  ): { webp: string; fallback: string } {
    const webpKey = key.replace(/\.(jpg|jpeg|png)$/i, ".webp");
    const webpUrl = this.generateCDNUrl(webpKey, options);
    const fallbackUrl = this.generateCDNUrl(key, options);

    return { webp: webpUrl, fallback: fallbackUrl };
  }

  /**
   * Generate progressive loading URLs
   */
  generateProgressiveUrls(
    key: string,
    options: CDNUrlOptions = {}
  ): { blur: string; lowRes: string; highRes: string } {
    const blurKey = key.replace(/\.[^/.]+$/, "_blur$&");
    const lowResKey = key.replace(/\.[^/.]+$/, "_small$&");

    return {
      blur: this.generateCDNUrl(blurKey, options),
      lowRes: this.generateCDNUrl(lowResKey, options),
      highRes: this.generateCDNUrl(key, options),
    };
  }

  /**
   * Check if URL is served through CDN
   */
  isFromCDN(url: string): boolean {
    return (
      url.includes(this.distributionDomain) || url.includes("cloudfront.net")
    );
  }

  /**
   * Extract key from CDN URL
   */
  extractKeyFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname.startsWith("/")
        ? urlObj.pathname.slice(1)
        : urlObj.pathname;
    } catch (error) {
      return null;
    }
  }

  /**
   * Generate cache-busting URL
   */
  generateCacheBustedUrl(key: string, timestamp?: number): string {
    const bustingParam = timestamp || Date.now();
    return this.generateCDNUrl(key, {
      queryParams: { v: bustingParam.toString() },
    });
  }

  /**
   * Generate URL with custom headers
   */
  generateUrlWithHeaders(
    key: string,
    headers: Record<string, string>,
    options: CDNUrlOptions = {}
  ): string {
    const headerParams: Record<string, string> = {};

    Object.entries(headers).forEach(([key, value]) => {
      headerParams[`header-${key.toLowerCase()}`] = value;
    });

    return this.generateCDNUrl(key, {
      ...options,
      queryParams: { ...options.queryParams, ...headerParams },
    });
  }

  /**
   * Helper to append query parameters to URL
   */
  private appendQueryParams(
    url: string,
    params: Record<string, string>
  ): string {
    if (Object.keys(params).length === 0) {
      return url;
    }

    const queryString = Object.entries(params)
      .map(
        ([key, value]) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
      )
      .join("&");

    return `${url}${url.includes("?") ? "&" : "?"}${queryString}`;
  }
}

// Export singleton instance
export const cdnHelper = new CDNHelper();

// Common URL generation helpers
export const generateVideoUrl = (key: string, options?: CDNUrlOptions) =>
  cdnHelper.generateCDNUrl(key, options);

export const generateThumbnailUrl = (key: string, options?: CDNUrlOptions) =>
  cdnHelper.generateCDNUrl(key, options);

export const generateImageUrl = (key: string, options?: CDNUrlOptions) =>
  cdnHelper.generateCDNUrl(key, options);

export const generateDownloadUrl = (
  key: string,
  filename: string,
  options?: CDNUrlOptions
) =>
  cdnHelper.generateCDNUrl(key, {
    ...options,
    queryParams: {
      ...options?.queryParams,
      "response-content-disposition": `attachment; filename="${filename}"`,
    },
  });

export const generateStreamingUrl = (
  key: string,
  quality: string,
  options?: CDNUrlOptions
) =>
  cdnHelper.generateCDNUrl(key.replace(/\.[^/.]+$/, `_${quality}$&`), options);

// URL validation helpers
export const isValidCDNUrl = (url: string): boolean => {
  try {
    new URL(url);
    return cdnHelper.isFromCDN(url);
  } catch {
    return false;
  }
};

export const extractFileExtension = (key: string): string => {
  const match = key.match(/\.([^/.]+)$/);
  return match ? match[1].toLowerCase() : "";
};

export const isVideoFile = (key: string): boolean => {
  const extension = extractFileExtension(key);
  return ["mp4", "webm", "mov", "avi", "mkv"].includes(extension);
};

export const isImageFile = (key: string): boolean => {
  const extension = extractFileExtension(key);
  return ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(extension);
};
