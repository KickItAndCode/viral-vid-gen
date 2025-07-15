import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

/**
 * Scrape Reddit trends and store them in the database
 */
export const scrapeRedditTrends = action({
  args: {
    subreddits: v.optional(v.array(v.string())),
    postsPerSubreddit: v.optional(v.number()),
    timeframe: v.optional(v.union(
      v.literal("hour"),
      v.literal("day"), 
      v.literal("week"),
      v.literal("month")
    )),
  },
  handler: async (ctx, args) => {
    // Import the Reddit scraper (dynamic import for server-side)
    const { scrapeRedditTrends, scrapeRedditFrontPage, getHighImpactSubreddits } = await import("../lib/scrapers/reddit");
    
    const subreddits = args.subreddits || getHighImpactSubreddits();
    const postsPerSubreddit = args.postsPerSubreddit || 10;
    
    try {
      // Scrape trends from specified subreddits
      console.log(`Scraping trends from ${subreddits.length} subreddits...`);
      const scrapedTrends = await scrapeRedditTrends(subreddits, postsPerSubreddit);
      
      // Also scrape from r/all for high-impact content
      console.log("Scraping Reddit front page...");
      const frontPageTrends = await scrapeRedditFrontPage(args.timeframe || "day", 25);
      
      // Combine and deduplicate trends
      const allTrends = [...scrapedTrends, ...frontPageTrends];
      const uniqueTrends = allTrends.filter((trend, index, self) => 
        index === self.findIndex(t => t.sourceUrl === trend.sourceUrl)
      );
      
      console.log(`Found ${uniqueTrends.length} unique trends`);
      
      // Store trends in database using upsertTrend
      const storedTrends = [];
      for (const trend of uniqueTrends) {
        try {
          const trendId = await ctx.runMutation(api.trends.upsertTrend, {
            title: trend.title,
            description: trend.description,
            platform: trend.platform,
            category: trend.category,
            engagementMetrics: trend.engagementMetrics,
            platformMetadata: trend.platformMetadata,
            tags: trend.tags,
            sourceUrl: trend.sourceUrl,
            imageUrl: trend.imageUrl,
            viralScore: trend.viralScore,
          });
          
          storedTrends.push(trendId);
        } catch (error) {
          console.warn(`Failed to store trend: ${trend.title}`, error);
        }
      }
      
      return {
        success: true,
        message: `Successfully scraped and stored ${storedTrends.length} Reddit trends`,
        trendsScraped: uniqueTrends.length,
        trendsStored: storedTrends.length,
        categories: [...new Set(uniqueTrends.map(t => t.category))],
        topTrends: uniqueTrends
          .sort((a, b) => b.viralScore - a.viralScore)
          .slice(0, 5)
          .map(t => ({
            title: t.title,
            viralScore: t.viralScore,
            subreddit: t.platformMetadata.subreddit,
          })),
      };
      
    } catch (error) {
      console.error("Reddit scraping failed:", error);
      return {
        success: false,
        message: `Reddit scraping failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        trendsScraped: 0,
        trendsStored: 0,
      };
    }
  },
});

/**
 * Scrape a specific subreddit
 */
export const scrapeSpecificSubreddit = action({
  args: {
    subreddit: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { scrapeSubreddit } = await import("../lib/scrapers/reddit");
    
    try {
      const { trends } = await scrapeSubreddit(args.subreddit, args.limit || 25);
      
      console.log(`Found ${trends.length} trends from r/${args.subreddit}`);
      
      // Store trends in database
      const storedTrends = [];
      for (const trend of trends) {
        try {
          const trendId = await ctx.runMutation(api.trends.upsertTrend, {
            title: trend.title,
            description: trend.description,
            platform: trend.platform,
            category: trend.category,
            engagementMetrics: trend.engagementMetrics,
            platformMetadata: trend.platformMetadata,
            tags: trend.tags,
            sourceUrl: trend.sourceUrl,
            imageUrl: trend.imageUrl,
            viralScore: trend.viralScore,
          });
          
          storedTrends.push(trendId);
        } catch (error) {
          console.warn(`Failed to store trend: ${trend.title}`, error);
        }
      }
      
      return {
        success: true,
        message: `Successfully scraped r/${args.subreddit}`,
        subreddit: args.subreddit,
        trendsFound: trends.length,
        trendsStored: storedTrends.length,
        topTrends: trends
          .sort((a, b) => b.viralScore - a.viralScore)
          .slice(0, 3)
          .map(t => ({
            title: t.title,
            viralScore: t.viralScore,
            score: t.engagementMetrics.score,
          })),
      };
      
    } catch (error) {
      console.error(`Error scraping r/${args.subreddit}:`, error);
      return {
        success: false,
        message: `Failed to scrape r/${args.subreddit}: ${error instanceof Error ? error.message : "Unknown error"}`,
        subreddit: args.subreddit,
        trendsFound: 0,
        trendsStored: 0,
      };
    }
  },
});

/**
 * Get scraping statistics
 */
export const getScrapingStats = action({
  args: {},
  handler: async (ctx) => {
    // Get total trends by platform
    const allTrends = await ctx.runQuery(api.trends.getTrends, {});
    const redditTrends = allTrends.filter(t => t.platform === "reddit");
    
    // Calculate stats
    const totalTrends = redditTrends.length;
    const categories = [...new Set(redditTrends.map(t => t.category))];
    const subreddits = [...new Set(redditTrends.map(t => t.platformMetadata?.subreddit).filter(Boolean))];
    
    // Get trends from last 24 hours
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const recentTrends = redditTrends.filter(t => t.scrapedAt > oneDayAgo);
    
    // Calculate average viral score
    const avgViralScore = totalTrends > 0 
      ? redditTrends.reduce((sum, t) => sum + t.viralScore, 0) / totalTrends 
      : 0;
    
    return {
      totalRedditTrends: totalTrends,
      categoriesTracked: categories.length,
      subredditsTracked: subreddits.length,
      trendsLast24h: recentTrends.length,
      averageViralScore: Math.round(avgViralScore * 100) / 100,
      topCategories: categories.slice(0, 10),
      topSubreddits: subreddits.slice(0, 15),
      highestScoreTrend: redditTrends.sort((a, b) => b.viralScore - a.viralScore)[0],
    };
  },
});