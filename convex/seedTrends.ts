import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Seed the database with sample trending data for development
 */
export const seedSampleTrends = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if we already have trends
    const existingTrends = await ctx.db.query("trends").take(1);
    if (existingTrends.length > 0) {
      return { message: "Trends already exist", count: 0 };
    }

    const now = Date.now();
    const sampleTrends = [
      {
        title: "AI Productivity Revolution",
        description: "How AI tools are completely transforming workplace efficiency and productivity in 2025",
        platform: "reddit" as const,
        category: "technology",
        engagementMetrics: {
          upvotes: 8943,
          comments: 567,
          views: 125000,
          score: 8900,
        },
        platformMetadata: {
          subreddit: "technology",
          authorId: "u/techguru2025",
          postId: "1abc234",
        },
        tags: ["ai", "productivity", "automation", "workplace", "efficiency"],
        sourceUrl: "https://reddit.com/r/technology/comments/1abc234",
        imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995",
        viralScore: 92,
      },
      {
        title: "Sustainable Living Hacks Going Viral",
        description: "Simple eco-friendly lifestyle changes that everyone can implement right now",
        platform: "tiktok" as const,
        category: "lifestyle",
        engagementMetrics: {
          likes: 234500,
          shares: 12300,
          comments: 8900,
          views: 2100000,
        },
        platformMetadata: {
          authorId: "@ecoliving2025",
          postId: "tk_7198234792",
          hashtags: ["sustainable", "ecofriendly", "zerowaste", "green"],
        },
        tags: ["sustainability", "environment", "lifestyle", "tips"],
        sourceUrl: "https://tiktok.com/@ecoliving2025/video/7198234792",
        imageUrl: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09",
        viralScore: 87,
      },
      {
        title: "Remote Work Setup Trends 2025",
        description: "The latest home office setups and gear that are trending among remote workers",
        platform: "twitter" as const,
        category: "business",
        engagementMetrics: {
          likes: 15600,
          retweets: 4200,
          replies: 890,
          views: 180000,
        },
        platformMetadata: {
          authorId: "@remoteworkpro",
          postId: "1745892341",
          hashtags: ["remotework", "homeoffice", "productivity", "setup"],
          mentions: ["@microsoft", "@zoom"],
        },
        tags: ["remote work", "office setup", "productivity", "gear"],
        sourceUrl: "https://twitter.com/remoteworkpro/status/1745892341",
        imageUrl: "https://images.unsplash.com/photo-1586953208448-b95a79798f07",
        viralScore: 81,
      },
      {
        title: "Fitness Motivation Through Technology",
        description: "How fitness apps and wearables are revolutionizing personal health tracking",
        platform: "youtube" as const,
        category: "health",
        engagementMetrics: {
          likes: 45600,
          shares: 2300,
          comments: 1200,
          views: 890000,
        },
        platformMetadata: {
          authorId: "FitTech2025",
          postId: "dQw4w9WgXcQ",
        },
        tags: ["fitness", "technology", "health", "wearables", "motivation"],
        sourceUrl: "https://youtube.com/watch?v=dQw4w9WgXcQ",
        imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b",
        viralScore: 79,
      },
      {
        title: "Cryptocurrency Market Insights",
        description: "Latest trends and predictions in the crypto market for early 2025",
        platform: "reddit" as const,
        category: "finance",
        engagementMetrics: {
          upvotes: 5600,
          comments: 890,
          views: 98000,
          score: 5500,
        },
        platformMetadata: {
          subreddit: "cryptocurrency",
          authorId: "u/cryptoanalyst",
          postId: "2def567",
        },
        tags: ["cryptocurrency", "bitcoin", "investing", "market", "finance"],
        sourceUrl: "https://reddit.com/r/cryptocurrency/comments/2def567",
        imageUrl: "https://images.unsplash.com/photo-1640340434855-6084b1f4901c",
        viralScore: 75,
      },
      {
        title: "Gaming Setup Aesthetics",
        description: "The most aesthetically pleasing gaming setups that are trending on social media",
        platform: "tiktok" as const,
        category: "gaming",
        engagementMetrics: {
          likes: 156000,
          shares: 8900,
          comments: 4500,
          views: 1200000,
        },
        platformMetadata: {
          authorId: "@gamingsetups",
          postId: "tk_9876543210",
          hashtags: ["gaming", "setup", "aesthetic", "rgb", "battlestation"],
        },
        tags: ["gaming", "setup", "aesthetics", "rgb", "desk setup"],
        sourceUrl: "https://tiktok.com/@gamingsetups/video/9876543210",
        imageUrl: "https://images.unsplash.com/photo-1593305841991-05c297ba4575",
        viralScore: 73,
      },
      {
        title: "AI Art Generation Breakthrough",
        description: "New AI art tools are creating stunning visuals that rival human artists",
        platform: "twitter" as const,
        category: "technology",
        engagementMetrics: {
          likes: 12300,
          retweets: 3400,
          replies: 670,
          views: 145000,
        },
        platformMetadata: {
          authorId: "@aiartist2025",
          postId: "1756789012",
          hashtags: ["aiart", "generativeart", "technology", "creativity"],
          mentions: ["@midjourney", "@openai"],
        },
        tags: ["ai art", "creativity", "technology", "generative"],
        sourceUrl: "https://twitter.com/aiartist2025/status/1756789012",
        imageUrl: "https://images.unsplash.com/photo-1547036967-23d11aacaee0",
        viralScore: 71,
      },
      {
        title: "Plant-Based Recipe Trends",
        description: "Delicious plant-based recipes that are taking social media by storm",
        platform: "tiktok" as const,
        category: "food",
        engagementMetrics: {
          likes: 89000,
          shares: 5600,
          comments: 2300,
          views: 780000,
        },
        platformMetadata: {
          authorId: "@plantbasedchef",
          postId: "tk_5432109876",
          hashtags: ["plantbased", "vegan", "recipes", "healthy", "cooking"],
        },
        tags: ["plant based", "vegan", "recipes", "healthy eating", "cooking"],
        sourceUrl: "https://tiktok.com/@plantbasedchef/video/5432109876",
        imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd",
        viralScore: 68,
      },
      {
        title: "Mental Health Awareness Rising",
        description: "Growing conversation about mental health support and resources in digital age",
        platform: "reddit" as const,
        category: "health",
        engagementMetrics: {
          upvotes: 7800,
          comments: 1200,
          views: 156000,
          score: 7600,
        },
        platformMetadata: {
          subreddit: "mentalhealth",
          authorId: "u/mindfulnessguru",
          postId: "3ghi890",
        },
        tags: ["mental health", "wellness", "support", "awareness", "mindfulness"],
        sourceUrl: "https://reddit.com/r/mentalhealth/comments/3ghi890",
        imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
        viralScore: 66,
      },
      {
        title: "Electric Vehicle Adoption Surge",
        description: "Major shift toward electric vehicles across all demographics in 2025",
        platform: "youtube" as const,
        category: "automotive",
        engagementMetrics: {
          likes: 23400,
          shares: 1800,
          comments: 890,
          views: 567000,
        },
        platformMetadata: {
          authorId: "EVFuture2025",
          postId: "ElectricCars123",
        },
        tags: ["electric vehicles", "ev", "automotive", "sustainability", "tesla"],
        sourceUrl: "https://youtube.com/watch?v=ElectricCars123",
        imageUrl: "https://images.unsplash.com/photo-1593941707882-a5bac6861d75",
        viralScore: 64,
      },
    ];

    const trendIds = [];

    for (const trend of sampleTrends) {
      const trending = trend.viralScore > 60;
      
      const trendId = await ctx.db.insert("trends", {
        ...trend,
        trending,
        scrapedAt: now - Math.random() * 86400000, // Random time in last 24 hours
        lastUpdated: now,
        createdAt: now - Math.random() * 172800000, // Random time in last 48 hours
      });
      
      trendIds.push(trendId);
    }

    return { 
      message: "Sample trends created successfully", 
      count: trendIds.length,
      trendIds 
    };
  },
});

/**
 * Clear all trends (for development only)
 */
export const clearAllTrends = mutation({
  args: {},
  handler: async (ctx) => {
    const trends = await ctx.db.query("trends").collect();
    
    for (const trend of trends) {
      await ctx.db.delete(trend._id);
    }
    
    return { message: "All trends cleared", count: trends.length };
  },
});