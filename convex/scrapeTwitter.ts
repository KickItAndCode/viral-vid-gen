import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

/**
 * Scrape Twitter trends and store them in the database
 */
export const scrapeTwitterTrends = action({
  args: {
    hashtags: v.optional(v.array(v.string())),
    tweetsPerHashtag: v.optional(v.number()),
    bearerToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { scrapeTwitterHashtagTrends, scrapeTwitterTrending, getHighImpactHashtags } = await import("../lib/scrapers/twitter");
    
    const hashtags = args.hashtags || getHighImpactHashtags();
    const tweetsPerHashtag = args.tweetsPerHashtag || 5;
    const bearerToken = args.bearerToken || process.env.TWITTER_BEARER_TOKEN;
    
    try {
      console.log(`Scraping Twitter trends for ${hashtags.length} hashtags...`);
      
      // Scrape hashtag-based trends
      const hashtagTrends = await scrapeTwitterHashtagTrends(hashtags, tweetsPerHashtag, bearerToken);
      
      // Scrape general trending topics
      console.log("Scraping Twitter trending topics...");
      const trendingTopics = await scrapeTwitterTrending(bearerToken);
      
      // Combine and deduplicate trends
      const allTrends = [...hashtagTrends, ...trendingTopics];
      const uniqueTrends = allTrends.filter((trend, index, self) => 
        index === self.findIndex(t => t.sourceUrl === trend.sourceUrl)
      );
      
      console.log(`Found ${uniqueTrends.length} unique Twitter trends`);
      
      // Store trends in database
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
          console.warn(`Failed to store Twitter trend: ${trend.title}`, error);
        }
      }
      
      return {
        success: true,
        message: `Successfully scraped and stored ${storedTrends.length} Twitter trends`,
        trendsScraped: uniqueTrends.length,
        trendsStored: storedTrends.length,
        categories: [...new Set(uniqueTrends.map(t => t.category))],
        topTrends: uniqueTrends
          .sort((a, b) => b.viralScore - a.viralScore)
          .slice(0, 5)
          .map(t => ({
            title: t.title,
            viralScore: t.viralScore,
            likes: t.engagementMetrics.likes,
            retweets: t.engagementMetrics.retweets,
          })),
        apiStatus: bearerToken ? "authenticated" : "mock_data",
      };
      
    } catch (error) {
      console.error("Twitter scraping failed:", error);
      return {
        success: false,
        message: `Twitter scraping failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        trendsScraped: 0,
        trendsStored: 0,
        apiStatus: "error",
      };
    }
  },
});

/**
 * Scrape specific hashtag trends
 */
export const scrapeHashtagTrends = action({
  args: {
    hashtag: v.string(),
    limit: v.optional(v.number()),
    bearerToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { searchTwitterTrends } = await import("../lib/scrapers/twitter");
    
    const bearerToken = args.bearerToken || process.env.TWITTER_BEARER_TOKEN;
    
    try {
      const trends = await searchTwitterTrends(args.hashtag, args.limit || 10, bearerToken);
      
      console.log(`Found ${trends.length} trends for ${args.hashtag}`);
      
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
        message: `Successfully scraped ${args.hashtag}`,
        hashtag: args.hashtag,
        trendsFound: trends.length,
        trendsStored: storedTrends.length,
        topTrends: trends
          .sort((a, b) => b.viralScore - a.viralScore)
          .slice(0, 3)
          .map(t => ({
            title: t.title,
            viralScore: t.viralScore,
            engagement: t.engagementMetrics.likes + (t.engagementMetrics.retweets || 0),
          })),
        apiStatus: bearerToken ? "authenticated" : "mock_data",
      };
      
    } catch (error) {
      console.error(`Error scraping ${args.hashtag}:`, error);
      return {
        success: false,
        message: `Failed to scrape ${args.hashtag}: ${error instanceof Error ? error.message : "Unknown error"}`,
        hashtag: args.hashtag,
        trendsFound: 0,
        trendsStored: 0,
        apiStatus: "error",
      };
    }
  },
});

/**
 * Get Twitter scraping statistics
 */
export const getTwitterStats = action({
  args: {},
  handler: async (ctx) => {
    // Get all Twitter trends
    const allTrends = await ctx.runQuery(api.trends.getTrends, { platform: "twitter" });
    
    // Calculate stats
    const totalTrends = allTrends.length;
    const categories = [...new Set(allTrends.map(t => t.category))];
    
    // Get trends from last 24 hours
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const recentTrends = allTrends.filter(t => t.scrapedAt > oneDayAgo);
    
    // Calculate average engagement
    const avgLikes = totalTrends > 0 
      ? allTrends.reduce((sum, t) => sum + (t.engagementMetrics.likes || 0), 0) / totalTrends 
      : 0;
    
    const avgRetweets = totalTrends > 0 
      ? allTrends.reduce((sum, t) => sum + (t.engagementMetrics.retweets || 0), 0) / totalTrends 
      : 0;
    
    // Calculate average viral score
    const avgViralScore = totalTrends > 0 
      ? allTrends.reduce((sum, t) => sum + t.viralScore, 0) / totalTrends 
      : 0;
    
    // Get hashtag distribution
    const hashtags = new Map<string, number>();
    allTrends.forEach(trend => {
      trend.platformMetadata?.hashtags?.forEach(tag => {
        hashtags.set(tag, (hashtags.get(tag) || 0) + 1);
      });
    });
    
    const topHashtags = Array.from(hashtags.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([hashtag, count]) => ({ hashtag, count }));
    
    return {
      totalTwitterTrends: totalTrends,
      categoriesTracked: categories.length,
      trendsLast24h: recentTrends.length,
      averageViralScore: Math.round(avgViralScore * 100) / 100,
      averageLikes: Math.round(avgLikes),
      averageRetweets: Math.round(avgRetweets),
      topCategories: categories.slice(0, 10),
      topHashtags,
      highestEngagementTrend: allTrends.sort((a, b) => 
        ((b.engagementMetrics.likes || 0) + (b.engagementMetrics.retweets || 0)) - 
        ((a.engagementMetrics.likes || 0) + (a.engagementMetrics.retweets || 0))
      )[0],
      mostViralTrend: allTrends.sort((a, b) => b.viralScore - a.viralScore)[0],
    };
  },
});

/**
 * Run comprehensive Twitter trend scraping
 */
export const runComprehensiveTwitterScraping = action({
  args: {
    bearerToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const bearerToken = args.bearerToken || process.env.TWITTER_BEARER_TOKEN;
    
    try {
      console.log("Starting comprehensive Twitter trend scraping...");
      
      // Run hashtag scraping
      const hashtagResult = await ctx.runAction(api.scrapeTwitter.scrapeTwitterTrends, {
        bearerToken,
      });
      
      // Wait a bit to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Get final stats
      const stats = await ctx.runAction(api.scrapeTwitter.getTwitterStats, {});
      
      return {
        success: true,
        message: "Comprehensive Twitter scraping completed",
        hashtagResults: hashtagResult,
        finalStats: stats,
        timestamp: Date.now(),
      };
      
    } catch (error) {
      console.error("Comprehensive Twitter scraping failed:", error);
      return {
        success: false,
        message: `Comprehensive scraping failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        timestamp: Date.now(),
      };
    }
  },
});