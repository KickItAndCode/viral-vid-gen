/**
 * Viral Score Calculation Algorithm
 * 
 * Calculates a viral potential score (0-100) based on multiple factors:
 * - Engagement velocity (rate of engagement over time)
 * - Engagement ratio (engagement vs views/impressions)
 * - Platform-specific factors
 * - Content freshness
 * - Cross-platform momentum
 */

export interface EngagementMetrics {
  likes?: number;
  shares?: number;
  comments?: number;
  views?: number;
  upvotes?: number;
  score?: number;
  retweets?: number;
  replies?: number;
}

export interface TrendData {
  platform: "reddit" | "twitter" | "tiktok" | "youtube" | "manual";
  engagementMetrics: EngagementMetrics;
  scrapedAt: number;
  createdAt: number;
  category: string;
}

/**
 * Platform-specific weight configurations
 */
const PLATFORM_WEIGHTS = {
  reddit: {
    upvotes: 0.4,
    comments: 0.3,
    score: 0.2,
    awards: 0.1,
  },
  twitter: {
    retweets: 0.35,
    likes: 0.25,
    replies: 0.25,
    impressions: 0.15,
  },
  tiktok: {
    likes: 0.3,
    shares: 0.3,
    comments: 0.25,
    views: 0.15,
  },
  youtube: {
    views: 0.4,
    likes: 0.25,
    comments: 0.2,
    shares: 0.15,
  },
  manual: {
    likes: 0.4,
    shares: 0.3,
    comments: 0.3,
  },
} as const;

/**
 * Category multipliers for different content types
 */
const CATEGORY_MULTIPLIERS = {
  "technology": 1.2,
  "entertainment": 1.1,
  "news": 1.0,
  "sports": 1.1,
  "lifestyle": 0.9,
  "education": 0.8,
  "business": 0.9,
  "politics": 1.0,
  "gaming": 1.2,
  "memes": 1.3,
  "viral": 1.5,
  "breaking": 1.4,
  "trending": 1.3,
} as const;

/**
 * Calculate engagement velocity (engagement per hour)
 */
function calculateVelocity(metrics: EngagementMetrics, ageInHours: number): number {
  if (ageInHours === 0) return 0;
  
  const totalEngagement = (metrics.likes || 0) + 
                         (metrics.shares || 0) + 
                         (metrics.comments || 0) + 
                         (metrics.upvotes || 0) + 
                         (metrics.retweets || 0) + 
                         (metrics.replies || 0);
  
  return totalEngagement / Math.max(ageInHours, 0.1);
}

/**
 * Calculate engagement ratio based on platform
 */
function calculateEngagementRatio(
  platform: TrendData["platform"], 
  metrics: EngagementMetrics
): number {
  switch (platform) {
    case "reddit":
      const redditTotal = (metrics.upvotes || 0) + (metrics.comments || 0);
      const redditViews = metrics.views || Math.max(redditTotal * 10, 1);
      return redditTotal / redditViews;
      
    case "twitter":
      const twitterEngagement = (metrics.retweets || 0) + (metrics.likes || 0) + (metrics.replies || 0);
      const twitterImpressions = metrics.views || Math.max(twitterEngagement * 20, 1);
      return twitterEngagement / twitterImpressions;
      
    case "tiktok":
    case "youtube":
      const videoEngagement = (metrics.likes || 0) + (metrics.shares || 0) + (metrics.comments || 0);
      const videoViews = metrics.views || Math.max(videoEngagement * 15, 1);
      return videoEngagement / videoViews;
      
    default:
      const defaultEngagement = (metrics.likes || 0) + (metrics.shares || 0) + (metrics.comments || 0);
      const defaultViews = metrics.views || Math.max(defaultEngagement * 12, 1);
      return defaultEngagement / defaultViews;
  }
}

/**
 * Calculate platform-specific engagement score
 */
function calculatePlatformScore(
  platform: TrendData["platform"], 
  metrics: EngagementMetrics
): number {
  const weights = PLATFORM_WEIGHTS[platform];
  let score = 0;
  
  switch (platform) {
    case "reddit":
      score = (metrics.upvotes || 0) * weights.upvotes +
              (metrics.comments || 0) * weights.comments +
              (metrics.score || 0) * weights.score;
      break;
      
    case "twitter":
      score = (metrics.retweets || 0) * weights.retweets +
              (metrics.likes || 0) * weights.likes +
              (metrics.replies || 0) * weights.replies;
      break;
      
    case "tiktok":
    case "youtube":
      score = (metrics.likes || 0) * weights.likes +
              (metrics.shares || 0) * weights.shares +
              (metrics.comments || 0) * weights.comments +
              (metrics.views || 0) * weights.views * 0.001; // Scale down views
      break;
      
    default:
      score = (metrics.likes || 0) * weights.likes +
              (metrics.shares || 0) * weights.shares +
              (metrics.comments || 0) * weights.comments;
  }
  
  return Math.log10(Math.max(score, 1));
}

/**
 * Calculate freshness factor (newer content gets higher scores)
 */
function calculateFreshnessFactor(ageInHours: number): number {
  if (ageInHours <= 1) return 1.0;
  if (ageInHours <= 6) return 0.9;
  if (ageInHours <= 24) return 0.8;
  if (ageInHours <= 72) return 0.6;
  if (ageInHours <= 168) return 0.4; // 1 week
  return 0.2;
}

/**
 * Main viral score calculation function
 */
export function calculateViralScore(trendData: TrendData): number {
  const now = Date.now();
  const ageInMs = now - trendData.createdAt;
  const ageInHours = ageInMs / (1000 * 60 * 60);
  
  // Calculate component scores
  const velocity = calculateVelocity(trendData.engagementMetrics, ageInHours);
  const engagementRatio = calculateEngagementRatio(trendData.platform, trendData.engagementMetrics);
  const platformScore = calculatePlatformScore(trendData.platform, trendData.engagementMetrics);
  const freshnessFactor = calculateFreshnessFactor(ageInHours);
  
  // Get category multiplier
  const categoryKey = trendData.category.toLowerCase() as keyof typeof CATEGORY_MULTIPLIERS;
  const categoryMultiplier = CATEGORY_MULTIPLIERS[categoryKey] || 1.0;
  
  // Normalize scores
  const normalizedVelocity = Math.min(velocity / 100, 1); // Cap at 100 engagements/hour
  const normalizedRatio = Math.min(engagementRatio * 100, 1); // Cap at 1% engagement rate
  const normalizedPlatformScore = Math.min(platformScore / 5, 1); // Cap at log10(100000)
  
  // Weight the components
  const velocityWeight = 0.35;
  const ratioWeight = 0.25;
  const platformWeight = 0.25;
  const freshnessWeight = 0.15;
  
  // Calculate final score
  const rawScore = (
    normalizedVelocity * velocityWeight +
    normalizedRatio * ratioWeight +
    normalizedPlatformScore * platformWeight +
    freshnessFactor * freshnessWeight
  ) * categoryMultiplier;
  
  // Convert to 0-100 scale and apply final adjustments
  let finalScore = rawScore * 100;
  
  // Boost very fresh content with high engagement
  if (ageInHours <= 2 && velocity > 50) {
    finalScore *= 1.2;
  }
  
  // Ensure score is within bounds
  return Math.max(0, Math.min(100, Math.round(finalScore)));
}

/**
 * Recalculate viral score for existing trend
 */
export function recalculateViralScore(
  currentTrend: TrendData,
  newMetrics: EngagementMetrics
): number {
  const updatedTrend: TrendData = {
    ...currentTrend,
    engagementMetrics: newMetrics,
    scrapedAt: Date.now(),
  };
  
  return calculateViralScore(updatedTrend);
}

/**
 * Determine if content is currently trending based on viral score and velocity
 */
export function isTrending(viralScore: number, ageInHours: number): boolean {
  // High viral score content is always considered trending
  if (viralScore >= 80) return true;
  
  // Fresh content with good scores
  if (ageInHours <= 6 && viralScore >= 60) return true;
  
  // Moderate scores need to be very fresh
  if (ageInHours <= 2 && viralScore >= 40) return true;
  
  return false;
}

/**
 * Get trending threshold for a category
 */
export function getTrendingThreshold(category: string): number {
  const categoryKey = category.toLowerCase() as keyof typeof CATEGORY_MULTIPLIERS;
  const multiplier = CATEGORY_MULTIPLIERS[categoryKey] || 1.0;
  
  // Base threshold is 50, adjusted by category
  return Math.round(50 / multiplier);
}