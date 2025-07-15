import { Doc } from "@/convex/_generated/dataModel";

type Trend = Doc<"trends">;

export interface VideoScript {
  prompt: string;
  style: string;
  duration: number;
  aspectRatio: "16:9" | "9:16" | "1:1";
  tags: string[];
  targetPlatform: "youtube" | "tiktok" | "instagram" | "twitter";
  hook: string; // First 3 seconds
  content: string; // Main content
  cta: string; // Call to action
}

export interface ScriptGenerationOptions {
  style?:
    | "educational"
    | "entertaining"
    | "dramatic"
    | "minimalist"
    | "cinematic";
  duration?: number;
  targetPlatform?: "youtube" | "tiktok" | "instagram" | "twitter";
  tone?: "professional" | "casual" | "humorous" | "serious" | "inspiring";
  visualStyle?: "realistic" | "animated" | "abstract" | "documentary";
}

export class AIScriptGenerator {
  private static readonly STYLE_PROMPTS = {
    educational: "Create an informative and clear visual explanation",
    entertaining: "Generate engaging and fun visual content",
    dramatic: "Produce intense and emotionally compelling visuals",
    minimalist: "Design clean, simple, and focused imagery",
    cinematic: "Create movie-quality, professional cinematography",
  };

  private static readonly PLATFORM_SPECS = {
    youtube: { aspectRatio: "16:9" as const, maxDuration: 30, hookDuration: 5 },
    tiktok: { aspectRatio: "9:16" as const, maxDuration: 15, hookDuration: 3 },
    instagram: {
      aspectRatio: "1:1" as const,
      maxDuration: 15,
      hookDuration: 3,
    },
    twitter: { aspectRatio: "16:9" as const, maxDuration: 15, hookDuration: 3 },
  };

  private static readonly TONE_MODIFIERS = {
    professional: "using professional and authoritative language",
    casual: "in a friendly and conversational tone",
    humorous: "with humor and entertaining elements",
    serious: "with gravity and importance",
    inspiring: "with motivational and uplifting content",
  };

  /**
   * Generate a video script from trending content
   */
  static generateScript(
    trend: Trend,
    options: ScriptGenerationOptions = {}
  ): VideoScript {
    const {
      style = "entertaining",
      duration = 15,
      targetPlatform = "tiktok",
      tone = "casual",
      visualStyle = "realistic",
    } = options;

    const platformSpec = this.PLATFORM_SPECS[targetPlatform];
    const finalDuration = Math.min(duration, platformSpec.maxDuration);

    const hook = this.generateHook(trend, platformSpec.hookDuration, tone);
    const content = this.generateContent(trend, style, tone, visualStyle);
    const cta = this.generateCTA(trend, targetPlatform);

    const prompt = this.buildVideoPrompt(
      trend,
      hook,
      content,
      style,
      visualStyle,
      tone
    );

    return {
      prompt,
      style,
      duration: finalDuration,
      aspectRatio: platformSpec.aspectRatio,
      tags: this.generateTags(trend, style, targetPlatform),
      targetPlatform,
      hook,
      content,
      cta,
    };
  }

  /**
   * Generate multiple script variations for A/B testing
   */
  static generateVariations(
    trend: Trend,
    count: number = 3,
    baseOptions: ScriptGenerationOptions = {}
  ): VideoScript[] {
    const variations: VideoScript[] = [];
    const styles: Array<ScriptGenerationOptions["style"]> = [
      "educational",
      "entertaining",
      "dramatic",
    ];
    const tones: Array<ScriptGenerationOptions["tone"]> = [
      "casual",
      "professional",
      "humorous",
    ];

    for (let i = 0; i < count; i++) {
      const options: ScriptGenerationOptions = {
        ...baseOptions,
        style: styles[i % styles.length],
        tone: tones[i % tones.length],
      };
      variations.push(this.generateScript(trend, options));
    }

    return variations;
  }

  private static generateHook(
    trend: Trend,
    duration: number,
    tone: string
  ): string {
    const hooks = {
      high_viral: [
        `🔥 This ${trend.platform} trend is breaking the internet!`,
        `Stop scrolling! You need to see this viral ${trend.category.toLowerCase()} trend`,
        `Everyone's talking about this - here's why`,
        `This trend has ${this.formatNumber(this.getEngagementTotal(trend))} views and counting!`,
      ],
      medium_viral: [
        `Here's why everyone's obsessed with ${trend.title}`,
        `This ${trend.category.toLowerCase()} trend is everywhere`,
        `You're about to discover something incredible`,
        `This is why ${trend.title} matters`,
      ],
      educational: [
        `Let me explain why ${trend.title} is significant`,
        `The science behind ${trend.title}`,
        `Here's what you need to know about ${trend.title}`,
        `Breaking down the ${trend.title} phenomenon`,
      ],
    };

    const category =
      trend.viralScore > 80
        ? "high_viral"
        : trend.viralScore > 60
          ? "medium_viral"
          : "educational";

    const selectedHooks = hooks[category];
    return selectedHooks[Math.floor(Math.random() * selectedHooks.length)];
  }

  private static generateContent(
    trend: Trend,
    style: string,
    tone: string,
    visualStyle: string
  ): string {
    const baseDescription = trend.description;
    const stylePrompt = this.STYLE_PROMPTS[style];
    const toneModifier = this.TONE_MODIFIERS[tone];

    return `${stylePrompt} about "${trend.title}" - ${baseDescription}. Present this ${toneModifier} with ${visualStyle} visuals that capture the essence of this ${trend.category.toLowerCase()} trend from ${trend.platform}.`;
  }

  private static generateCTA(trend: Trend, platform: string): string {
    const ctas = {
      youtube: [
        "Subscribe for more trending content!",
        "What do you think? Let me know in the comments!",
        "Hit that like button if this was helpful!",
        "Check out more trending topics in the description!",
      ],
      tiktok: [
        "Follow for daily trends! 🔥",
        "Double tap if you agree! ❤️",
        "Tag someone who needs to see this!",
        "What's your take? Comment below! 💭",
      ],
      instagram: [
        "Save this for later! 📱",
        "Share this with your friends!",
        "What's your opinion? Tell me below! 💬",
        "Follow for more viral content! ✨",
      ],
      twitter: [
        "Retweet if you found this interesting!",
        "What are your thoughts? Reply below!",
        "Follow for more trending insights!",
        "Share your take in the comments!",
      ],
    };

    const platformCTAs = ctas[platform as keyof typeof ctas] || ctas.tiktok;
    return platformCTAs[Math.floor(Math.random() * platformCTAs.length)];
  }

  private static buildVideoPrompt(
    trend: Trend,
    hook: string,
    content: string,
    style: string,
    visualStyle: string,
    tone: string
  ): string {
    const viralElements = this.getViralElements(trend);
    const platformContext = this.getPlatformContext(trend.platform);

    return `Create a ${visualStyle} video showing: ${content}

VISUAL STYLE: ${visualStyle} cinematography with professional lighting and composition
MOOD: ${tone} and ${style}
VIRAL ELEMENTS: ${viralElements}
PLATFORM CONTEXT: ${platformContext}

The video should be engaging, visually appealing, and optimized for viral sharing. Include dynamic movement, compelling visuals, and clear visual storytelling that matches the trend's energy level (viral score: ${trend.viralScore}/100).

Focus on creating thumb-stopping content that immediately captures attention and drives engagement.`;
  }

  private static getViralElements(trend: Trend): string {
    const elements = [];

    if (trend.viralScore > 80) {
      elements.push("high-energy", "trending effects", "viral-worthy moments");
    }

    if (trend.platform === "tiktok") {
      elements.push(
        "quick cuts",
        "trending audio compatibility",
        "hook within first 3 seconds"
      );
    }

    if (
      trend.category.toLowerCase().includes("ai") ||
      trend.category.toLowerCase().includes("tech")
    ) {
      elements.push(
        "futuristic visuals",
        "tech-inspired graphics",
        "innovation themes"
      );
    }

    if (
      trend.engagementMetrics.shares &&
      trend.engagementMetrics.shares > 1000
    ) {
      elements.push(
        "shareable moments",
        "quotable content",
        "discussion-worthy elements"
      );
    }

    return elements.join(", ");
  }

  private static getPlatformContext(platform: string): string {
    const contexts = {
      reddit:
        "Community-driven, discussion-focused content with authentic feel",
      twitter:
        "News-worthy, conversation-starting content with strong opinions",
      tiktok: "Entertainment-first, trend-driven content with viral potential",
      youtube:
        "Educational or entertainment content with high production value",
      manual: "Universal appeal content suitable for cross-platform sharing",
    };

    return contexts[platform as keyof typeof contexts] || contexts.manual;
  }

  private static generateTags(
    trend: Trend,
    style: string,
    platform: string
  ): string[] {
    const tags = [
      trend.category.toLowerCase(),
      style,
      platform,
      "viral",
      "trending",
    ];

    // Add platform-specific tags
    if (platform === "tiktok") {
      tags.push("fyp", "foryou", "viral");
    } else if (platform === "youtube") {
      tags.push("trending", "educational", "entertainment");
    }

    // Add trend-specific tags
    tags.push(...trend.tags.slice(0, 5));

    // Remove duplicates and return
    return [...new Set(tags)];
  }

  private static getEngagementTotal(trend: Trend): number {
    const metrics = trend.engagementMetrics;
    return (
      (metrics.likes || metrics.upvotes || 0) +
      (metrics.shares || metrics.retweets || 0) +
      (metrics.comments || metrics.replies || 0)
    );
  }

  private static formatNumber(num: number): string {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  }

  /**
   * Optimize prompt for specific AI providers
   */
  static optimizeForProvider(
    script: VideoScript,
    provider: "veo" | "runway" | "luma"
  ): string {
    const basePrompt = script.prompt;

    switch (provider) {
      case "veo":
        // Veo prefers detailed, descriptive prompts
        return `${basePrompt}\n\nDetailed scene description: Professional video production with smooth camera movements, proper lighting, and clear subject focus. Emphasis on visual storytelling and cinematic quality.`;

      case "runway":
        // Runway works well with concise, action-focused prompts
        return `${basePrompt.split("\n")[0]}\n\nFocus on dynamic motion, clear subject, professional cinematography. ${script.style} style with ${script.duration} second duration.`;

      case "luma":
        // Luma prefers shorter, concept-focused prompts
        const shortPrompt =
          script.content.length > 200
            ? script.content.substring(0, 200) + "..."
            : script.content;
        return `${shortPrompt} ${script.style} style, ${script.aspectRatio} aspect ratio, professional quality.`;

      default:
        return basePrompt;
    }
  }
}

// Export utility functions
export const generateScriptFromTrend = AIScriptGenerator.generateScript;
export const generateScriptVariations = AIScriptGenerator.generateVariations;
export const optimizePromptForProvider = AIScriptGenerator.optimizeForProvider;
