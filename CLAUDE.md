# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ViralAI is an AI-powered video generation platform that creates viral-ready 15-30 second videos by analyzing internet trends, generating scripts, and producing videos using AI models (Veo 3, Runway, Luma).

## Tech Stack

- **Frontend**: Next.js 14+ with App Router, TypeScript, Tailwind CSS, Shadcn/ui
- **Backend**: Convex database, NextAuth.js authentication
- **AI Services**: Veo 3, Runway, Luma APIs for video generation
- **Infrastructure**: Vercel hosting, AWS S3 storage, CloudFront CDN

## Development Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Run type checking
npm run type-check

# Database operations (Convex)
npx convex dev          # Start Convex development server
npx convex deploy       # Deploy database changes
npx convex import       # Import data
npx convex dashboard    # Open Convex dashboard
```

## Architecture Overview

### Project Structure
```
app/                    # Next.js App Router
├── (auth)/            # Authentication routes
├── (dashboard)/       # Main app routes
│   ├── create/        # Video creation flow
│   ├── library/       # User video library
│   └── analytics/     # Performance metrics
└── api/               # API routes

components/            
├── ui/               # Shadcn/ui components
├── video/            # Video-specific components
└── ai/               # AI generation components

convex/               # Database schemas, queries, mutations
lib/                  # Utilities, hooks, and shared logic
```

### Key Data Flow

1. **Trend Discovery**: External APIs → Convex trends table → Frontend display
2. **Video Generation**: User input → Convex mutation → AI API queue → Video storage → User notification
3. **Video Management**: Convex video table → S3 storage → CloudFront delivery

### Database Schema (Convex)

- `users`: User accounts with subscription/credits
- `videos`: Generated videos with metadata and status
- `trends`: Scraped trending content with viral scores
- `analytics`: Video performance metrics by platform
- `videoJobs`: Background job tracking for video generation

### Authentication Flow

NextAuth.js with Convex integration for session management. User authentication state synchronized between Next.js and Convex.

### Video Processing Pipeline

1. Trend analysis and script generation
2. Queue job creation in Convex
3. Background processing with AI video APIs
4. Video upload to S3 with CDN distribution
5. Database update with final video URLs

## Important Implementation Notes

- All video generation is asynchronous with job tracking
- Implement fallback providers for AI video generation
- Use Convex real-time subscriptions for progress updates
- Video files stored in S3 with CloudFront CDN for global delivery
- Analytics tracking requires both client-side and server-side events

## Environment Variables Required

```
# Convex
CONVEX_DEPLOYMENT=
NEXT_PUBLIC_CONVEX_URL=

# Authentication
NEXTAUTH_SECRET=
NEXTAUTH_URL=

# AI Video APIs
VEO_API_KEY=
RUNWAY_API_KEY=
LUMA_API_KEY=

# Storage
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=
CLOUDFRONT_DOMAIN=
```

## Testing Strategy

- Unit tests for utility functions and API integrations
- Integration tests for Convex mutations and queries
- E2E tests for critical user flows (video creation, authentication)
- Mock AI APIs in development/testing environments