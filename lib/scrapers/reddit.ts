/**
 * Reddit API Scraper for Trend Discovery
 *
 * Scrapes trending content from Reddit using the public API
 * and calculates viral scores based on engagement metrics
 */

import {
  calculateViralScore,
  type EngagementMetrics,
  type TrendData,
} from "../viral-score";

export interface RedditPost {
  id: string;
  title: string;
  selftext: string;
  subreddit: string;
  author: string;
  score: number;
  upvote_ratio: number;
  num_comments: number;
  created_utc: number;
  url: string;
  thumbnail?: string;
  preview?: {
    images: Array<{
      source: { url: string };
    }>;
  };
  is_video: boolean;
  media?: any;
  ups: number;
  downs: number;
  permalink: string;
  domain: string;
  num_crossposts: number;
  stickied: boolean;
  over_18: boolean;
  quarantine: boolean;
  subreddit_type: string;
  view_count?: number;
}

export interface RedditApiResponse {
  data: {
    children: Array<{
      data: RedditPost;
    }>;
    after?: string;
    before?: string;
  };
}

export interface ScrapedTrend {
  title: string;
  description: string;
  platform: "reddit";
  category: string;
  engagementMetrics: EngagementMetrics;
  platformMetadata: {
    subreddit: string;
    authorId: string;
    postId: string;
  };
  tags: string[];
  sourceUrl: string;
  imageUrl?: string;
  viralScore: number;
  createdAt: number;
}

/**
 * Subreddit configuration with categories
 */
const SUBREDDIT_CATEGORIES: Record<string, string> = {
  technology: "technology",
  programming: "technology",
  artificial: "technology",
  MachineLearning: "technology",
  gadgets: "technology",

  worldnews: "news",
  news: "news",
  politics: "politics",

  gaming: "gaming",
  pcgaming: "gaming",
  NintendoSwitch: "gaming",

  entertainment: "entertainment",
  movies: "entertainment",
  television: "entertainment",
  Music: "entertainment",

  funny: "memes",
  memes: "memes",
  dankmemes: "memes",

  business: "business",
  investing: "finance",
  stocks: "finance",
  cryptocurrency: "finance",

  LifeProTips: "lifestyle",
  todayilearned: "education",
  science: "education",

  sports: "sports",
  nfl: "sports",
  nba: "sports",
  soccer: "sports",

  health: "health",
  fitness: "health",

  food: "food",
  recipes: "food",

  videos: "viral",
  gifs: "viral",
  interestingasfuck: "viral",
  nextfuckinglevel: "viral",
};

/**
 * Get category for a subreddit
 */
function getSubredditCategory(subreddit: string): string {
  return SUBREDDIT_CATEGORIES[subreddit] || "general";
}

/**
 * Extract tags from Reddit post
 */
function extractTags(post: RedditPost): string[] {
  const tags: string[] = [];

  // Add subreddit as tag
  tags.push(post.subreddit.toLowerCase());

  // Extract hashtags from title
  const hashtagRegex = /#(\w+)/g;
  const titleHashtags = post.title.match(hashtagRegex);
  if (titleHashtags) {
    tags.push(...titleHashtags.map((tag) => tag.slice(1).toLowerCase()));
  }

  // Add content type tags
  if (post.is_video) tags.push("video");
  if (
    post.thumbnail &&
    post.thumbnail !== "self" &&
    post.thumbnail !== "default"
  )
    tags.push("image");
  if (post.url.includes("youtube.com") || post.url.includes("youtu.be"))
    tags.push("youtube");
  if (post.url.includes("tiktok.com")) tags.push("tiktok");
  if (post.url.includes("twitter.com") || post.url.includes("x.com"))
    tags.push("twitter");

  // Add engagement level tags
  if (post.score > 10000) tags.push("viral");
  if (post.score > 5000) tags.push("trending");
  if (post.num_comments > 1000) tags.push("discussion");

  return [...new Set(tags)]; // Remove duplicates
}

/**
 * Get image URL from Reddit post
 */
function getImageUrl(post: RedditPost): string | undefined {
  // Check preview images first
  if (post.preview?.images?.[0]?.source?.url) {
    return post.preview.images[0].source.url.replace(/&amp;/g, "&");
  }

  // Check thumbnail
  if (
    post.thumbnail &&
    post.thumbnail !== "self" &&
    post.thumbnail !== "default" &&
    post.thumbnail !== "nsfw"
  ) {
    return post.thumbnail;
  }

  // Check if URL is a direct image
  const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
  if (imageExtensions.some((ext) => post.url.toLowerCase().includes(ext))) {
    return post.url;
  }

  return undefined;
}

/**
 * Convert Reddit post to ScrapedTrend
 */
function convertPostToTrend(post: RedditPost): ScrapedTrend {
  const engagementMetrics: EngagementMetrics = {
    upvotes: post.ups,
    comments: post.num_comments,
    score: post.score,
    views: post.view_count,
  };

  const trendData: TrendData = {
    platform: "reddit",
    engagementMetrics,
    scrapedAt: Date.now(),
    createdAt: post.created_utc * 1000, // Convert to milliseconds
    category: getSubredditCategory(post.subreddit),
  };

  const viralScore = calculateViralScore(trendData);

  return {
    title: post.title,
    description: post.selftext || post.title,
    platform: "reddit",
    category: getSubredditCategory(post.subreddit),
    engagementMetrics,
    platformMetadata: {
      subreddit: post.subreddit,
      authorId: `u/${post.author}`,
      postId: post.id,
    },
    tags: extractTags(post),
    sourceUrl: `https://reddit.com${post.permalink}`,
    imageUrl: getImageUrl(post),
    viralScore,
    createdAt: post.created_utc * 1000,
  };
}

/**
 * Fetch hot posts from a subreddit
 */
export async function scrapeSubreddit(
  subreddit: string,
  limit: number = 25,
  after?: string
): Promise<{ trends: ScrapedTrend[]; after?: string }> {
  const url = `https://www.reddit.com/r/${subreddit}/hot.json?limit=${limit}${after ? `&after=${after}` : ""}`;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "ViralAI/1.0 (Trend Discovery Bot)",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Reddit API error: ${response.status} ${response.statusText}`
      );
    }

    const data: RedditApiResponse = await response.json();

    // Filter out stickied, NSFW, and quarantined posts
    const validPosts = data.data.children
      .map((child) => child.data)
      .filter(
        (post) =>
          !post.stickied && !post.over_18 && !post.quarantine && post.score > 10 // Minimum score threshold
      );

    const trends = validPosts.map(convertPostToTrend);

    return {
      trends,
      after: data.data.after,
    };
  } catch (error) {
    console.error(`Error scraping r/${subreddit}:`, error);
    throw error;
  }
}

/**
 * Scrape trending posts from multiple subreddits
 */
export async function scrapeRedditTrends(
  subreddits: string[] = Object.keys(SUBREDDIT_CATEGORIES),
  postsPerSubreddit: number = 10
): Promise<ScrapedTrend[]> {
  const allTrends: ScrapedTrend[] = [];

  // Process subreddits in batches to avoid rate limiting
  const batchSize = 3;
  for (let i = 0; i < subreddits.length; i += batchSize) {
    const batch = subreddits.slice(i, i + batchSize);

    const batchPromises = batch.map(async (subreddit) => {
      try {
        const { trends } = await scrapeSubreddit(subreddit, postsPerSubreddit);
        return trends;
      } catch (error) {
        console.warn(`Failed to scrape r/${subreddit}:`, error);
        return [];
      }
    });

    const batchResults = await Promise.all(batchPromises);
    allTrends.push(...batchResults.flat());

    // Rate limiting delay between batches
    if (i + batchSize < subreddits.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 second delay
    }
  }

  // Sort by viral score descending
  return allTrends.sort((a, b) => b.viralScore - a.viralScore);
}

/**
 * Scrape top posts from r/all
 */
export async function scrapeRedditFrontPage(
  timeframe: "hour" | "day" | "week" | "month" = "day",
  limit: number = 50
): Promise<ScrapedTrend[]> {
  const url = `https://www.reddit.com/r/all/top.json?t=${timeframe}&limit=${limit}`;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "ViralAI/1.0 (Trend Discovery Bot)",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Reddit API error: ${response.status} ${response.statusText}`
      );
    }

    const data: RedditApiResponse = await response.json();

    // Filter out stickied, NSFW, and quarantined posts
    const validPosts = data.data.children
      .map((child) => child.data)
      .filter(
        (post) =>
          !post.stickied &&
          !post.over_18 &&
          !post.quarantine &&
          post.score > 100 // Higher threshold for r/all
      );

    return validPosts.map(convertPostToTrend);
  } catch (error) {
    console.error("Error scraping Reddit front page:", error);
    throw error;
  }
}

/**
 * Get high-impact subreddits for trend discovery
 */
export function getHighImpactSubreddits(): string[] {
  return [
    // Technology
    "technology",
    "programming",
    "artificial",
    "MachineLearning",

    // News & Politics
    "worldnews",
    "news",
    "politics",

    // Entertainment
    "entertainment",
    "movies",
    "television",
    "Music",

    // Gaming
    "gaming",
    "pcgaming",

    // Viral Content
    "videos",
    "gifs",
    "interestingasfuck",
    "nextfuckinglevel",

    // Memes
    "funny",
    "memes",

    // Business & Finance
    "business",
    "investing",
    "cryptocurrency",

    // Lifestyle
    "LifeProTips",
    "todayilearned",

    // Sports
    "sports",
    "nfl",
    "nba",
  ];
}
