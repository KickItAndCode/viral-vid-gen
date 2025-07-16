# Comprehensive Product Requirements Document: AI Viral Video Generation MVP

## Executive Summary

ViralAI is an AI-powered video generation platform that automatically creates viral-ready 15-30 second videos by analyzing internet trends, generating scripts, and producing videos using state-of-the-art AI models. The platform targets content creators, digital marketers, and social media managers who need to quickly produce engaging video content at scale.

**Key Objectives:**

- Enable users to generate viral videos with minimal effort
- Leverage AI to identify trending content and create relevant scripts
- Provide a seamless, production-ready video creation workflow
- Build a scalable foundation for future enterprise features

**Tech Stack:** Next.js 14+ (App Router), TypeScript, Tailwind CSS + Shadcn/ui, Convex Database, React Query, Zustand (implemented), Clerk Auth (implemented), AI APIs (Veo 3, Runway, Luma)

## Problem Statement

Content creators and marketers struggle to keep pace with the demand for fresh, engaging video content. Traditional video creation is time-consuming, requires technical expertise, and often misses viral trends. Current AI video tools lack integration with trend analysis and require significant manual input.

**User Pain Points:**

- Time-consuming video creation process (4-8 hours per video)
- Difficulty identifying viral content opportunities
- Technical barriers to professional video production
- High costs of video production tools and talent

**Market Opportunity:**

- AI video market projected to reach $5.93B by 2032 (33.1% CAGR)
- 500M+ content creators globally seeking efficiency tools
- 85% of marketers use video as a marketing tool

## Product Vision & Strategy

### Vision Statement

"Democratize viral video creation by making AI-powered content generation as simple as typing a prompt."

### Strategic Alignment

- **Short-term (6 months):** Launch MVP with core video generation features
- **Medium-term (12 months):** Add collaboration features and analytics
- **Long-term (24 months):** Enterprise platform with API access and white-label solutions

### Success Criteria

- 10,000 MAU within 6 months
- 85% video completion rate
- 70% viral score accuracy
- $50K MRR by month 6

## Technical Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                     │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   App Router │  │ Server Comp. │  │ Client Comp. │       │
│  └─────────────┘  └──────────────┘  └──────────────┘       │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────┴─────────────────────────────────┐
│                     Backend Services                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Convex DB    │  │ Auth Service │  │ File Storage │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────┴─────────────────────────────────┐
│                    External Services                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ AI Video APIs│  │ Trend APIs   │  │ CDN          │      │
│  │ (Veo, Runway)│  │(Reddit, X)   │  │(CloudFront)  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Frontend:**

- Next.js 14+ with App Router and TypeScript strict mode
- Tailwind CSS + Shadcn/ui component library with custom ViralAI theme
- React Query (TanStack Query v5) for server state management
- Zustand for client state management
- React Player for video playback
- Clerk for authentication and user management

**Backend:**

- Convex for real-time database with comprehensive schema
- Custom React Query + Convex integration hooks
- Bull Queue for background video processing jobs
- Redis for caching (planned)
- AI API integrations (Veo 3, Runway, Luma)

**Infrastructure:**

- Vercel for hosting
- AWS S3 for video storage
- CloudFront CDN for delivery
- Monitoring with Sentry

### Project Structure

```
viral-ai/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/       # Main app routes
│   │   ├── create/        # Video creation flow
│   │   ├── library/       # User video library
│   │   └── analytics/     # Performance metrics
│   └── api/               # API routes
├── components/
│   ├── ui/               # Shadcn/ui components (Button, Input, Card, Dialog, etc.)
│   ├── providers/        # Context providers (QueryProvider, ThemeProvider)
│   ├── video/            # Video-specific components (planned)
│   └── ai/               # AI generation components (planned)
├── convex/               # Database schemas, queries, mutations
├── hooks/                # Custom React Query + Convex integration hooks
├── lib/                  # Utilities (query-client, utils, etc.)
├── styles/               # Global styles
└── public/               # Static assets
```

## Core Features Specification

### 1. AI Video Generation

**User Story:** As a content creator, I want to generate viral videos from trending topics so that I can quickly produce engaging content.

**Functional Requirements:**

- Trend analysis from Reddit, Twitter/X, TikTok
- AI script generation based on trends
- Video generation using Veo 3, Runway, or Luma
- Multiple style presets (comedy, educational, promotional)

**Acceptance Criteria:**

- Video generation completes within 2 minutes
- Users can select from 10+ video styles
- Generated videos are 15-30 seconds long
- 90% success rate for video generation

**Technical Implementation:**

```typescript
// convex/videos.ts
export const generateVideo = mutation({
  args: {
    trend: v.string(),
    style: v.string(),
    duration: v.number(),
    provider: v.union(v.literal("veo"), v.literal("runway"), v.literal("luma")),
  },
  handler: async (ctx, args) => {
    // 1. Generate script from trend
    const script = await generateScript(args.trend, args.style);

    // 2. Create video generation job
    const jobId = await ctx.db.insert("videoJobs", {
      script,
      status: "pending",
      provider: args.provider,
      userId: ctx.auth.getUserIdentity().subject,
    });

    // 3. Queue video generation
    await videoQueue.add("generate", { jobId, ...args });

    return jobId;
  },
});
```

### 2. Trend Discovery System

**User Story:** As a marketer, I want to discover viral trends in my niche so that I can create timely content.

**Functional Requirements:**

- Real-time trend monitoring across platforms
- Category-based filtering (tech, lifestyle, comedy, etc.)
- Viral score prediction algorithm
- Trend history and analytics

**UI Components:**

```typescript
// components/trends/TrendCard.tsx
interface TrendCardProps {
  trend: Trend;
  onSelect: (trend: Trend) => void;
}

export function TrendCard({ trend, onSelect }: TrendCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-center">
          <Badge variant="secondary">{trend.category}</Badge>
          <span className="text-sm text-muted-foreground">
            {trend.platform}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <h3 className="font-semibold text-lg">{trend.title}</h3>
        <p className="text-sm text-muted-foreground mt-2">
          {trend.description}
        </p>
        <div className="flex items-center mt-4">
          <TrendingUp className="w-4 h-4 mr-1 text-green-500" />
          <span className="text-sm font-medium">
            {trend.viralScore}% viral potential
          </span>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={() => onSelect(trend)} className="w-full">
          Create Video
        </Button>
      </CardFooter>
    </Card>
  );
}
```

### 3. Video Editor Interface

**User Story:** As a user, I want to customize generated videos so that they match my brand and style.

**Functional Requirements:**

- Real-time preview during editing
- Caption overlay with styling options
- Trim and merge capabilities
- Music/sound effect library
- Export in multiple formats

**Component Architecture:**

```typescript
// components/editor/VideoEditor.tsx
export function VideoEditor({ videoId }: { videoId: string }) {
  const video = useQuery(api.videos.get, { videoId });
  const [edits, setEdits] = useState<VideoEdits>({
    trim: { start: 0, end: video?.duration || 30 },
    captions: [],
    effects: []
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <VideoPreview video={video} edits={edits} />
      <EditingPanel
        video={video}
        edits={edits}
        onEditChange={setEdits}
      />
    </div>
  );
}
```

### 4. User Dashboard

**User Story:** As a user, I want to manage my video library and track performance so that I can optimize my content strategy.

**Functional Requirements:**

- Video library with search/filter
- Performance analytics per video
- Download and share options
- Project organization

**Database Schema:**

```typescript
// convex/schema.ts
export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    subscription: v.string(),
    credits: v.number(),
  }).index("by_email", ["email"]),

  videos: defineTable({
    title: v.string(),
    description: v.string(),
    userId: v.id("users"),
    status: v.string(),
    url: v.optional(v.string()),
    thumbnailUrl: v.optional(v.string()),
    duration: v.number(),
    viralScore: v.number(),
    metadata: v.object({
      provider: v.string(),
      style: v.string(),
      trend: v.string(),
    }),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"]),

  analytics: defineTable({
    videoId: v.id("videos"),
    views: v.number(),
    shares: v.number(),
    engagement: v.number(),
    platform: v.string(),
    date: v.string(),
  })
    .index("by_video", ["videoId"])
    .index("by_date", ["date"]),
});
```

## UI/UX Design Specifications

### Design System

**Color Palette:**

```css
:root {
  /* Primary Colors */
  --primary-50: #eff6ff;
  --primary-500: #3b82f6;
  --primary-900: #1e3a8a;

  /* Neutral Colors */
  --gray-50: #f9fafb;
  --gray-900: #111827;

  /* Semantic Colors */
  --success: #10b981;
  --warning: #f59e0b;
  --error: #ef4444;
}

.dark {
  --background: #0a0a0a;
  --foreground: #fafafa;
}
```

**Typography:**

```typescript
// tailwind.config.js
typography: {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'monospace']
  },
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],
    sm: ['0.875rem', { lineHeight: '1.25rem' }],
    base: ['1rem', { lineHeight: '1.5rem' }],
    lg: ['1.125rem', { lineHeight: '1.75rem' }],
    xl: ['1.25rem', { lineHeight: '1.75rem' }]
  }
}
```

### Component Library

**Button Variants:**

```typescript
// components/ui/button.tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
  }
);
```

### Key User Flows

**Video Creation Flow:**

1. **Trend Selection** → Browse trending topics or enter custom prompt
2. **Style Configuration** → Choose video style, duration, and AI provider
3. **Generation** → Real-time progress updates during video creation
4. **Preview & Edit** → Review generated video with editing options
5. **Export & Share** → Download or share directly to social platforms

## API Endpoints

### REST API Structure

```typescript
// app/api/videos/route.ts
export async function POST(request: Request) {
  const { trend, style, duration } = await request.json();

  // Validate input
  if (!trend || !style) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  // Create video generation job
  const jobId = await createVideoJob({ trend, style, duration });

  return NextResponse.json({ jobId }, { status: 201 });
}

// app/api/videos/[id]/route.ts
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const video = await getVideo(params.id);

  if (!video) {
    return NextResponse.json({ error: "Video not found" }, { status: 404 });
  }

  return NextResponse.json(video);
}
```

### Convex Functions

```typescript
// convex/trends.ts
export const getTrends = query({
  args: {
    category: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const trends = await ctx.db
      .query("trends")
      .filter((q) =>
        args.category ? q.eq(q.field("category"), args.category) : true
      )
      .order("desc")
      .take(args.limit || 10);

    return trends;
  },
});

// convex/analytics.ts
export const trackVideoView = mutation({
  args: {
    videoId: v.id("videos"),
    platform: v.string(),
  },
  handler: async (ctx, args) => {
    const today = new Date().toISOString().split("T")[0];

    const existing = await ctx.db
      .query("analytics")
      .withIndex("by_video", (q) =>
        q.eq("videoId", args.videoId).eq("date", today)
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        views: existing.views + 1,
      });
    } else {
      await ctx.db.insert("analytics", {
        videoId: args.videoId,
        views: 1,
        shares: 0,
        engagement: 0,
        platform: args.platform,
        date: today,
      });
    }
  },
});
```

## Implementation Timeline

### Phase 1: Foundation (Weeks 1-4) ✅ COMPLETED

**Week 1-2: Core Infrastructure** ✅
- ✅ Project setup with Next.js 14+ and Convex
- ✅ Authentication system implementation (Clerk)
- ✅ UI component library setup (Shadcn/ui with custom ViralAI theme)
- ✅ Database schema implementation (comprehensive Convex schema)

**Week 3-4: State Management & Hooks** ✅
- ✅ React Query + Convex integration with custom hooks
- ✅ Server state management with caching and optimistic updates
- ✅ Domain-specific hooks (useUser, useTrends, useVideos)
- ✅ Development tools integration (React Query DevTools)

**Deliverables:** ✅ ALL COMPLETED
- ✅ Working authentication flow with Clerk
- ✅ Professional UI component library with custom theme
- ✅ Complete database schema with all tables and indexes
- ✅ Type-safe data layer with optimized caching

### Phase 2: Core Features (Weeks 5-8) ✅ COMPLETED

**Week 5-6: Client State & Authentication UI** ✅ COMPLETED
- ✅ Zustand stores for client state management (Task 6) 
- ✅ Authentication UI components with Clerk styling (Task 7)
- ✅ Main app layout with responsive navigation (Task 8)
- ✅ Complete dashboard pages with responsive design

**Week 7-8: Video Generation MVP** ✅ COMPLETED
- ✅ Multiple AI provider integration (Veo 3, Runway, Luma) - Task 11
- ✅ Advanced script generation from trends with platform optimization
- ✅ Video generation pipeline with intelligent job queue and priority handling
- ✅ Real-time progress tracking system with multi-stage visualization
- ✅ Complete 5-step video creation wizard - Task 12
- ✅ Trend selection, style configuration, AI settings, generation progress, preview & export

**Deliverables:** ✅ ALL COMPLETED

- ✅ Full video generation pipeline with 3 AI providers
- ✅ Complete user dashboard with all pages implemented
- ✅ Video creation wizard with basic editing features
- ✅ Real-time progress tracking and status monitoring
- ✅ Comprehensive trend discovery and selection system

### Phase 3: Infrastructure & Polish (Weeks 9-12) ✅ COMPLETED / 🚧 IN PROGRESS

**Week 9-10: Infrastructure & Storage** ✅ COMPLETED
- ✅ File storage system setup (AWS S3 + CloudFront) - Task 13
- ✅ Video player components with custom controls - Task 14
- ✅ Video library dashboard with management features - Task 15
- ✅ Background job queue optimization - Task 16

**Week 11-12: Video Editor & Launch** 🚧 IN PROGRESS
- ✅ Video editor interface with timeline - Task 17 (8/10 subtasks complete)
  - ✅ Multi-panel editor workspace with resizable sections
  - ✅ Timeline component with frame-accurate scrubbing
  - ✅ Trim and cut controls with split functionality
  - ✅ Caption editor with drag-and-drop positioning
  - ✅ Visual effects panel (filters, transitions)
  - ✅ Export functionality with quality options
  - ✅ Performance monitoring system
  - 🚧 Audio controls and waveform display (in progress)
- 📋 Analytics tracking and dashboard - Task 18
- 📋 Mobile responsiveness and accessibility - Task 19
- 📋 Performance optimizations - Task 20
- 📋 Production deployment setup - Task 21

**Deliverables:**

- ✅ Complete video storage and delivery system
- ✅ Advanced video player and editing capabilities
- 🚧 Production-ready application with analytics
- 📋 Complete documentation and deployment pipeline
- 📋 Beta testing program and launch preparation

## Success Metrics

### Technical Performance KPIs

- **Page Load Time:** < 2 seconds (LCP)
- **Video Generation Time:** < 2 minutes average
- **API Response Time:** < 200ms (p95)
- **System Uptime:** 99.9%

### User Engagement Metrics

- **User Acquisition:** 1,000 users in first month
- **Daily Active Users:** 20% of total users
- **Video Completion Rate:** 85%
- **Average Session Duration:** 15+ minutes

### Business Metrics

- **Monthly Recurring Revenue:** $10K by month 3
- **Customer Acquisition Cost:** < $50
- **Churn Rate:** < 10% monthly
- **Net Promoter Score:** 50+

### Content Performance

- **Viral Score Accuracy:** 70% correlation
- **Video Export Rate:** 60% of generated videos
- **Social Share Rate:** 30% of exported videos
- **User Retention:** 60% monthly

## Risk Mitigation

### Technical Risks

- **AI API Reliability:** Implement fallback providers and retry mechanisms
- **Scalability Issues:** Use auto-scaling infrastructure and caching
- **Video Processing Load:** Implement queue system with priority handling

### Business Risks

- **Competition:** Focus on unique viral scoring and trend integration
- **User Adoption:** Implement freemium model with generous free tier
- **Content Moderation:** AI-powered content filtering with human review

### Security Considerations

- **Data Protection:** Implement encryption at rest and in transit
- **API Security:** Rate limiting and authentication on all endpoints
- **User Privacy:** GDPR compliance and transparent data policies

## Conclusion

This PRD provides a comprehensive blueprint for building ViralAI, an innovative AI-powered viral video generation platform. The combination of trend analysis, AI video generation, and user-friendly editing tools positions the product to capture significant market share in the rapidly growing AI content creation space.

The phased implementation approach ensures quick time-to-market while maintaining quality and scalability. With clear success metrics and risk mitigation strategies, the development team has a detailed roadmap for creating a production-ready MVP that can evolve into a market-leading platform.
