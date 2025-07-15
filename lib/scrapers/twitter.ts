/**
 * Twitter/X API Scraper for Trend Discovery
 * 
 * Scrapes trending content from Twitter/X using various approaches
 * including trending topics and high-engagement tweets
 */

import { calculateViralScore, type EngagementMetrics, type TrendData } from "../viral-score";

export interface TwitterTweet {
  id: string;
  text: string;
  author_id: string;
  created_at: string;
  context_annotations?: Array<{
    domain: {
      id: string;
      name: string;
      description: string;
    };
    entity: {
      id: string;
      name: string;
      description?: string;
    };
  }>;
  entities?: {
    hashtags?: Array<{ tag: string }>;
    mentions?: Array<{ username: string; id: string }>;
    urls?: Array<{ url: string; expanded_url: string; display_url: string }>;
  };
  public_metrics: {
    retweet_count: number;
    like_count: number;
    reply_count: number;
    quote_count: number;
    bookmark_count?: number;
    impression_count?: number;
  };
  referenced_tweets?: Array<{
    type: "retweeted" | "quoted" | "replied_to";
    id: string;
  }>;
  attachments?: {
    media_keys?: string[];
  };
  lang: string;
  possibly_sensitive: boolean;
  source: string;
}

export interface TwitterUser {
  id: string;
  name: string;
  username: string;
  verified: boolean;
  public_metrics: {
    followers_count: number;
    following_count: number;
    tweet_count: number;
    listed_count: number;
  };
}

export interface TwitterTrendingTopic {
  trend: string;
  url: string;
  promoted_content?: boolean;
  query: string;
  tweet_volume?: number;
}

export interface ScrapedTwitterTrend {
  title: string;
  description: string;
  platform: "twitter";
  category: string;
  engagementMetrics: EngagementMetrics;
  platformMetadata: {
    authorId: string;
    postId: string;
    hashtags?: string[];
    mentions?: string[];
  };
  tags: string[];
  sourceUrl: string;
  imageUrl?: string;
  viralScore: number;
  createdAt: number;
}

/**
 * Category mapping based on content analysis
 */
const TWITTER_CATEGORIES: Record<string, string> = {
  // Technology hashtags
  ai: "technology",
  tech: "technology", 
  coding: "technology",
  programming: "technology",
  crypto: "finance",
  blockchain: "finance",
  bitcoin: "finance",
  nft: "finance",
  
  // News and politics
  breaking: "news",
  news: "news",
  politics: "politics",
  election: "politics",
  
  // Entertainment
  music: "entertainment",
  movie: "entertainment",
  tv: "entertainment",
  celebrity: "entertainment",
  netflix: "entertainment",
  
  // Sports
  sports: "sports",
  football: "sports",
  basketball: "sports",
  soccer: "sports",
  nfl: "sports",
  nba: "sports",
  
  // Gaming
  gaming: "gaming",
  esports: "gaming",
  twitch: "gaming",
  
  // Lifestyle
  fashion: "lifestyle",
  food: "food",
  health: "health",
  fitness: "health",
  travel: "lifestyle",
  
  // Viral/Memes
  meme: "memes",
  viral: "viral",
  trending: "viral",
  
  // Business
  business: "business",
  startup: "business",
  entrepreneur: "business",
};

/**
 * Determine category from tweet content
 */
function determineTweetCategory(tweet: TwitterTweet): string {
  // Check hashtags first
  if (tweet.entities?.hashtags) {
    for (const hashtag of tweet.entities.hashtags) {
      const tag = hashtag.tag.toLowerCase();
      if (TWITTER_CATEGORIES[tag]) {
        return TWITTER_CATEGORIES[tag];
      }
    }
  }
  
  // Check context annotations
  if (tweet.context_annotations) {
    for (const annotation of tweet.context_annotations) {
      const domain = annotation.domain.name.toLowerCase();
      if (domain.includes("technology")) return "technology";
      if (domain.includes("sports")) return "sports";
      if (domain.includes("entertainment")) return "entertainment";
      if (domain.includes("politics")) return "politics";
      if (domain.includes("business")) return "business";
    }
  }
  
  // Check tweet text for keywords
  const text = tweet.text.toLowerCase();
  for (const [keyword, category] of Object.entries(TWITTER_CATEGORIES)) {
    if (text.includes(keyword)) {
      return category;
    }
  }
  
  return "general";
}

/**
 * Extract tags from Twitter tweet
 */
function extractTwitterTags(tweet: TwitterTweet): string[] {
  const tags: string[] = [];
  
  // Add hashtags
  if (tweet.entities?.hashtags) {
    tags.push(...tweet.entities.hashtags.map(h => h.tag.toLowerCase()));
  }
  
  // Add engagement level tags
  const metrics = tweet.public_metrics;
  const totalEngagement = metrics.retweet_count + metrics.like_count + metrics.reply_count;
  
  if (totalEngagement > 50000) tags.push("viral");
  if (totalEngagement > 10000) tags.push("trending");
  if (metrics.retweet_count > 5000) tags.push("highly-shared");
  if (metrics.reply_count > 1000) tags.push("discussion");
  
  // Add content type tags
  if (tweet.attachments?.media_keys?.length) tags.push("media");
  if (tweet.entities?.urls?.length) tags.push("link");
  if (tweet.referenced_tweets?.some(r => r.type === "quoted")) tags.push("quote");
  
  // Add language tag
  if (tweet.lang && tweet.lang !== "en") tags.push(`lang-${tweet.lang}`);
  
  return [...new Set(tags)];
}

/**
 * Convert Twitter tweet to ScrapedTwitterTrend
 */
function convertTweetToTrend(tweet: TwitterTweet, author?: TwitterUser): ScrapedTwitterTrend {
  const engagementMetrics: EngagementMetrics = {
    likes: tweet.public_metrics.like_count,
    shares: tweet.public_metrics.retweet_count,
    comments: tweet.public_metrics.reply_count,
    retweets: tweet.public_metrics.retweet_count,
    replies: tweet.public_metrics.reply_count,
    views: tweet.public_metrics.impression_count,
  };
  
  const trendData: TrendData = {
    platform: "twitter",
    engagementMetrics,
    scrapedAt: Date.now(),
    createdAt: new Date(tweet.created_at).getTime(),
    category: determineTweetCategory(tweet),
  };
  
  const viralScore = calculateViralScore(trendData);
  
  return {
    title: tweet.text.length > 100 ? tweet.text.substring(0, 97) + "..." : tweet.text,
    description: tweet.text,
    platform: "twitter",
    category: determineTweetCategory(tweet),
    engagementMetrics,
    platformMetadata: {
      authorId: author ? `@${author.username}` : tweet.author_id,
      postId: tweet.id,
      hashtags: tweet.entities?.hashtags?.map(h => h.tag),
      mentions: tweet.entities?.mentions?.map(m => m.username),
    },
    tags: extractTwitterTags(tweet),
    sourceUrl: `https://twitter.com/i/status/${tweet.id}`,
    viralScore,
    createdAt: new Date(tweet.created_at).getTime(),
  };
}

/**
 * Mock trending topics (since Twitter API v2 doesn't provide trends in free tier)
 */
function getMockTrendingTopics(): TwitterTrendingTopic[] {
  return [
    { trend: "#AI", url: "", query: "#AI", tweet_volume: 50000 },
    { trend: "#Technology", url: "", query: "#Technology", tweet_volume: 30000 },
    { trend: "#Breaking", url: "", query: "#Breaking", tweet_volume: 25000 },
    { trend: "#Gaming", url: "", query: "#Gaming", tweet_volume: 20000 },
    { trend: "#Crypto", url: "", query: "#Crypto", tweet_volume: 18000 },
    { trend: "#Sports", url: "", query: "#Sports", tweet_volume: 15000 },
    { trend: "#Music", url: "", query: "#Music", tweet_volume: 12000 },
    { trend: "#Politics", url: "", query: "#Politics", tweet_volume: 10000 },
    { trend: "#Business", url: "", query: "#Business", tweet_volume: 8000 },
    { trend: "#Health", url: "", query: "#Health", tweet_volume: 6000 },
  ];
}

/**
 * Search tweets by hashtag or keyword (requires Twitter API access)
 * This is a placeholder implementation for when API access is available
 */
export async function searchTwitterTrends(
  query: string,
  maxResults: number = 10,
  bearerToken?: string
): Promise<ScrapedTwitterTrend[]> {
  if (!bearerToken) {
    console.warn("Twitter API bearer token not provided, returning mock data");
    return generateMockTwitterTrends(query, maxResults);
  }
  
  const url = `https://api.twitter.com/2/tweets/search/recent?query=${encodeURIComponent(query)}&max_results=${maxResults}&tweet.fields=created_at,author_id,context_annotations,entities,public_metrics,referenced_tweets,attachments,lang,possibly_sensitive,source&user.fields=name,username,verified,public_metrics&expansions=author_id`;
  
  try {
    const response = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${bearerToken}`,
        "User-Agent": "ViralAI/1.0 (Trend Discovery Bot)",
      },
    });
    
    if (!response.ok) {
      throw new Error(`Twitter API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.data || data.data.length === 0) {
      return [];
    }
    
    // Create user lookup map
    const userMap = new Map<string, TwitterUser>();
    if (data.includes?.users) {
      data.includes.users.forEach((user: TwitterUser) => {
        userMap.set(user.id, user);
      });
    }
    
    // Filter out potentially sensitive content and convert to trends
    const validTweets = data.data.filter((tweet: TwitterTweet) => 
      !tweet.possibly_sensitive &&
      tweet.lang === "en" && // Focus on English content for now
      tweet.public_metrics.like_count > 50 // Minimum engagement threshold
    );
    
    return validTweets.map((tweet: TwitterTweet) => 
      convertTweetToTrend(tweet, userMap.get(tweet.author_id))
    );
    
  } catch (error) {
    console.error(`Error searching Twitter for "${query}":`, error);
    // Fallback to mock data
    return generateMockTwitterTrends(query, maxResults);
  }
}

/**
 * Generate mock Twitter trends for development/testing
 */
function generateMockTwitterTrends(query: string, count: number): ScrapedTwitterTrend[] {
  const mockTrends: ScrapedTwitterTrend[] = [];
  const now = Date.now();
  
  for (let i = 0; i < count; i++) {
    const mockEngagement = {
      likes: Math.floor(Math.random() * 10000) + 100,
      shares: Math.floor(Math.random() * 2000) + 20,
      comments: Math.floor(Math.random() * 500) + 10,
      retweets: Math.floor(Math.random() * 2000) + 20,
      replies: Math.floor(Math.random() * 500) + 10,
      views: Math.floor(Math.random() * 100000) + 5000,
    };
    
    const mockTrend: ScrapedTwitterTrend = {
      title: `${query} trending topic ${i + 1}`,
      description: `This is a mock trending topic about ${query} with high engagement metrics`,
      platform: "twitter",
      category: TWITTER_CATEGORIES[query.toLowerCase().replace("#", "")] || "general",
      engagementMetrics: mockEngagement,
      platformMetadata: {
        authorId: `@user${i + 1}`,
        postId: `mock${now}${i}`,
        hashtags: [query.replace("#", ""), "trending"],
      },
      tags: [query.replace("#", "").toLowerCase(), "trending", "mock"],
      sourceUrl: `https://twitter.com/i/status/mock${now}${i}`,
      viralScore: Math.floor(Math.random() * 40) + 60, // 60-100 for trending content
      createdAt: now - Math.random() * 86400000, // Random time in last 24 hours
    };
    
    mockTrends.push(mockTrend);
  }
  
  return mockTrends;
}

/**
 * Scrape trending topics from Twitter
 */
export async function scrapeTwitterTrending(
  bearerToken?: string,
  location: string = "1" // 1 = Worldwide
): Promise<ScrapedTwitterTrend[]> {
  // Get trending topics (mock for now since API requires paid access)
  const trendingTopics = getMockTrendingTopics();
  
  const allTrends: ScrapedTwitterTrend[] = [];
  
  // Search for tweets for each trending topic
  for (const topic of trendingTopics.slice(0, 5)) { // Limit to top 5 to avoid rate limits
    try {
      const trends = await searchTwitterTrends(topic.trend, 5, bearerToken);
      allTrends.push(...trends);
      
      // Rate limiting delay
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.warn(`Failed to scrape trends for ${topic.trend}:`, error);
    }
  }
  
  // Sort by viral score
  return allTrends.sort((a, b) => b.viralScore - a.viralScore);
}

/**
 * Get high-impact hashtags for trend discovery
 */
export function getHighImpactHashtags(): string[] {
  return [
    "#AI", "#Technology", "#Crypto", "#Bitcoin", "#Gaming",
    "#Sports", "#Music", "#Politics", "#Business", "#Health",
    "#Breaking", "#News", "#Viral", "#Trending", "#Meme",
    "#Entertainment", "#Movies", "#TV", "#Fashion", "#Food"
  ];
}

/**
 * Scrape Twitter trends for multiple hashtags
 */
export async function scrapeTwitterHashtagTrends(
  hashtags: string[] = getHighImpactHashtags(),
  tweetsPerHashtag: number = 5,
  bearerToken?: string
): Promise<ScrapedTwitterTrend[]> {
  const allTrends: ScrapedTwitterTrend[] = [];
  
  // Process hashtags in batches
  const batchSize = 3;
  for (let i = 0; i < hashtags.length; i += batchSize) {
    const batch = hashtags.slice(i, i + batchSize);
    
    const batchPromises = batch.map(async hashtag => {
      try {
        return await searchTwitterTrends(hashtag, tweetsPerHashtag, bearerToken);
      } catch (error) {
        console.warn(`Failed to scrape ${hashtag}:`, error);
        return [];
      }
    });
    
    const batchResults = await Promise.all(batchPromises);
    allTrends.push(...batchResults.flat());
    
    // Rate limiting delay between batches
    if (i + batchSize < hashtags.length) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  // Remove duplicates and sort by viral score
  const uniqueTrends = allTrends.filter((trend, index, self) => 
    index === self.findIndex(t => t.sourceUrl === trend.sourceUrl)
  );
  
  return uniqueTrends.sort((a, b) => b.viralScore - a.viralScore);
}