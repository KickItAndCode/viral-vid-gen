import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

/**
 * Comprehensive trend scraping across all platforms
 */
export const runFullTrendScraping = action({
  args: {
    redditEnabled: v.optional(v.boolean()),
    twitterEnabled: v.optional(v.boolean()),
    twitterBearerToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const results = {
      reddit: null as any,
      twitter: null as any,
      summary: {
        totalTrendsScraped: 0,
        totalTrendsStored: 0,
        platformsProcessed: [] as string[],
        categories: new Set<string>(),
        errors: [] as string[],
      },
    };
    
    console.log("Starting comprehensive trend scraping across all platforms...");
    
    // Reddit scraping
    if (args.redditEnabled !== false) {
      try {
        console.log("Scraping Reddit trends...");
        results.reddit = await ctx.runAction(api.scrapeReddit.scrapeRedditTrends, {});
        
        if (results.reddit.success) {
          results.summary.totalTrendsScraped += results.reddit.trendsScraped;
          results.summary.totalTrendsStored += results.reddit.trendsStored;
          results.summary.platformsProcessed.push("reddit");
          results.reddit.categories?.forEach((cat: string) => results.summary.categories.add(cat));
        } else {
          results.summary.errors.push(`Reddit: ${results.reddit.message}`);
        }
      } catch (error) {
        const errorMsg = `Reddit scraping failed: ${error instanceof Error ? error.message : "Unknown error"}`;
        console.error(errorMsg);
        results.summary.errors.push(errorMsg);
        results.reddit = { success: false, message: errorMsg };
      }
    }
    
    // Twitter scraping
    if (args.twitterEnabled !== false) {
      try {
        console.log("Scraping Twitter trends...");
        results.twitter = await ctx.runAction(api.scrapeTwitter.scrapeTwitterTrends, {
          bearerToken: args.twitterBearerToken,
        });
        
        if (results.twitter.success) {
          results.summary.totalTrendsScraped += results.twitter.trendsScraped;
          results.summary.totalTrendsStored += results.twitter.trendsStored;
          results.summary.platformsProcessed.push("twitter");
          results.twitter.categories?.forEach((cat: string) => results.summary.categories.add(cat));
        } else {
          results.summary.errors.push(`Twitter: ${results.twitter.message}`);
        }
      } catch (error) {
        const errorMsg = `Twitter scraping failed: ${error instanceof Error ? error.message : "Unknown error"}`;
        console.error(errorMsg);
        results.summary.errors.push(errorMsg);
        results.twitter = { success: false, message: errorMsg };
      }
    }
    
    // Get final database stats
    const finalStats = await ctx.runQuery(api.trends.getTrends, { limit: 1 });
    const totalTrendsInDb = finalStats.length > 0 ? "trends populated" : "no trends found";
    
    return {
      success: results.summary.platformsProcessed.length > 0,
      message: `Trend scraping completed. Processed ${results.summary.platformsProcessed.length} platforms.`,
      platforms: results.summary.platformsProcessed,
      totalTrendsScraped: results.summary.totalTrendsScraped,
      totalTrendsStored: results.summary.totalTrendsStored,
      categoriesFound: Array.from(results.summary.categories),
      errors: results.summary.errors,
      results: {
        reddit: results.reddit,
        twitter: results.twitter,
      },
      databaseStatus: totalTrendsInDb,
      timestamp: new Date().toISOString(),
    };
  },
});

/**
 * Get comprehensive trend statistics across all platforms
 */
export const getTrendStats = action({
  args: {},
  handler: async (ctx) => {
    try {
      // Get trends by platform
      const allTrends = await ctx.runQuery(api.trends.getTrends, { limit: 1000 });
      const redditTrends = allTrends.filter(t => t.platform === "reddit");
      const twitterTrends = allTrends.filter(t => t.platform === "twitter");
      
      // Get trending content
      const trendingContent = await ctx.runQuery(api.trends.getTrendingContent, { limit: 20 });
      
      // Get categories
      const categories = await ctx.runQuery(api.trends.getTrendCategories, {});
      
      // Calculate time-based stats
      const now = Date.now();
      const oneDayAgo = now - 24 * 60 * 60 * 1000;
      const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
      
      const trendsLast24h = allTrends.filter(t => t.scrapedAt > oneDayAgo);
      const trendsLastWeek = allTrends.filter(t => t.scrapedAt > oneWeekAgo);
      
      // Calculate engagement stats
      const avgViralScore = allTrends.length > 0 
        ? allTrends.reduce((sum, t) => sum + t.viralScore, 0) / allTrends.length 
        : 0;
      
      // Platform-specific stats
      const redditStats = {
        total: redditTrends.length,
        avgScore: redditTrends.length > 0 
          ? redditTrends.reduce((sum, t) => sum + t.viralScore, 0) / redditTrends.length 
          : 0,
        topSubreddits: redditTrends
          .map(t => t.platformMetadata?.subreddit)
          .filter(Boolean)
          .reduce((acc, sub) => {
            acc[sub] = (acc[sub] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
      };
      
      const twitterStats = {
        total: twitterTrends.length,
        avgScore: twitterTrends.length > 0 
          ? twitterTrends.reduce((sum, t) => sum + t.viralScore, 0) / twitterTrends.length 
          : 0,
        topHashtags: twitterTrends
          .flatMap(t => t.platformMetadata?.hashtags || [])
          .reduce((acc, tag) => {
            acc[tag] = (acc[tag] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
      };
      
      return {
        overview: {
          totalTrends: allTrends.length,
          trendingNow: trendingContent.length,
          categoriesTracked: categories.length,
          trendsLast24h: trendsLast24h.length,
          trendsLastWeek: trendsLastWeek.length,
          averageViralScore: Math.round(avgViralScore * 100) / 100,
        },
        platforms: {
          reddit: {
            ...redditStats,
            topSubreddits: Object.entries(redditStats.topSubreddits)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 10)
              .map(([name, count]) => ({ name, count })),
          },
          twitter: {
            ...twitterStats,
            topHashtags: Object.entries(twitterStats.topHashtags)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 10)
              .map(([name, count]) => ({ name, count })),
          },
        },
        categories: categories.slice(0, 15),
        topTrends: allTrends
          .sort((a, b) => b.viralScore - a.viralScore)
          .slice(0, 10)
          .map(t => ({
            title: t.title,
            platform: t.platform,
            category: t.category,
            viralScore: t.viralScore,
            trending: t.trending,
          })),
        recentTrends: trendsLast24h
          .sort((a, b) => b.scrapedAt - a.scrapedAt)
          .slice(0, 5)
          .map(t => ({
            title: t.title,
            platform: t.platform,
            viralScore: t.viralScore,
            scrapedAt: new Date(t.scrapedAt).toISOString(),
          })),
      };
      
    } catch (error) {
      console.error("Error getting trend stats:", error);
      return {
        success: false,
        message: `Failed to get trend stats: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  },
});

/**
 * Cleanup old trends (keep only last 30 days)
 */
export const cleanupOldTrends = action({
  args: {
    daysToKeep: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const daysToKeep = args.daysToKeep || 30;
    const cutoffTime = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
    
    try {
      // Get old trends
      const allTrends = await ctx.runQuery(api.trends.getTrends, { limit: 10000 });
      const oldTrends = allTrends.filter(t => t.scrapedAt < cutoffTime);
      
      console.log(`Found ${oldTrends.length} trends older than ${daysToKeep} days`);
      
      // Delete old trends in batches
      let deletedCount = 0;
      const batchSize = 50;
      
      for (let i = 0; i < oldTrends.length; i += batchSize) {
        const batch = oldTrends.slice(i, i + batchSize);
        
        for (const trend of batch) {
          try {
            await ctx.runMutation(api.trends.deleteTrend, { id: trend._id });
            deletedCount++;
          } catch (error) {
            console.warn(`Failed to delete trend ${trend._id}:`, error);
          }
        }
        
        // Small delay between batches
        if (i + batchSize < oldTrends.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      return {
        success: true,
        message: `Cleaned up ${deletedCount} old trends`,
        deletedCount,
        daysToKeep,
        cutoffDate: new Date(cutoffTime).toISOString(),
      };
      
    } catch (error) {
      console.error("Cleanup failed:", error);
      return {
        success: false,
        message: `Cleanup failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        deletedCount: 0,
      };
    }
  },
});

/**
 * Scheduled trend scraping (to be called by cron job)
 */
export const scheduledTrendScraping = action({
  args: {},
  handler: async (ctx) => {
    console.log("Running scheduled trend scraping...");
    
    try {
      // Run full scraping
      const scrapingResult = await ctx.runAction(api.trendScraper.runFullTrendScraping, {});
      
      // Cleanup old trends if scraping was successful
      if (scrapingResult.success) {
        await ctx.runAction(api.trendScraper.cleanupOldTrends, { daysToKeep: 30 });
      }
      
      // Get final stats
      const finalStats = await ctx.runAction(api.trendScraper.getTrendStats, {});
      
      return {
        success: scrapingResult.success,
        scrapingResult,
        finalStats,
        timestamp: new Date().toISOString(),
      };
      
    } catch (error) {
      console.error("Scheduled scraping failed:", error);
      return {
        success: false,
        message: `Scheduled scraping failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        timestamp: new Date().toISOString(),
      };
    }
  },
});