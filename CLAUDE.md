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
pnpm dev

# Build for production
pnpm build

# Run linting
pnpm lint

# Run type checking
pnpm type-check

# Database operations (Convex)
pnpm convex dev         # Start Convex development server
pnpm convex deploy      # Deploy database changes
pnpm convex import      # Import data
pnpm convex dashboard   # Open Convex dashboard
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
├── layout/           # Layout components (AppShell, Navbar, Sidebar)
├── auth/             # Enhanced Clerk authentication components
├── trends/           # Trend discovery UI components
├── wizard/           # Video creation wizard components
│   ├── steps/        # Individual wizard step components
│   ├── types.ts      # Wizard TypeScript interfaces
│   └── wizard-store.ts # Wizard state management
├── video/            # Video player and editing components
└── ai/               # AI generation status and progress components

convex/               # Database schemas, queries, mutations
├── schema.ts         # Database schema definitions
├── users.ts          # User-related queries and mutations
├── videos.ts         # Video management functions
├── trends.ts         # Trend discovery and scraping
├── analytics.ts      # Performance metrics tracking
└── videoJobs.ts      # Background job processing

lib/
├── stores/           # Zustand client state stores
│   ├── ui-store.ts          # Theme, sidebar, modals, notifications
│   ├── video-wizard-store.ts # Multi-step creation wizard
│   ├── video-editor-store.ts # Timeline, playback, effects
│   ├── preferences-store.ts  # User settings with persistence
│   ├── subscriptions.ts     # Cross-store synchronization
│   └── index.ts            # Store exports and utilities
├── hooks/            # Custom React hooks
├── ai-providers/     # AI video generation system
│   ├── base/         # Base provider interface
│   ├── veo/          # Google Veo 3 integration
│   ├── runway/       # Runway ML integration
│   ├── luma/         # Luma Dream Machine integration
│   ├── factory.ts    # Provider factory pattern
│   └── queue.ts      # Video generation queue
└── utils/            # Shared utilities and helpers
```

### Key Data Flow

1. **Trend Discovery**: External APIs → Convex trends table → TrendGrid UI → User selection
2. **Video Generation**: User input → Wizard steps → Convex mutation → AI provider queue → Real-time progress → Video storage
3. **Video Management**: Convex video table → S3 storage → CloudFront delivery → Video player
4. **Client State**: Zustand stores manage UI state, wizard progress, editor timeline, user preferences
5. **Theme Management**: Cross-store synchronization between UI store and preferences with persistence
6. **Wizard Flow**: Trend selection → Style configuration → AI settings → Generation progress → Preview & export

### Database Schema (Convex)

- `users`: User accounts with subscription/credits
- `videos`: Generated videos with metadata and status
- `trends`: Scraped trending content with viral scores
- `analytics`: Video performance metrics by platform
- `videoJobs`: Background job tracking for video generation

### Authentication Flow

Clerk authentication with Convex integration for session management. User authentication state synchronized between Next.js and Convex using Clerk's webhooks and JWT tokens.

### Video Processing Pipeline

1. Trend analysis and script generation
2. Queue job creation in Convex
3. Background processing with AI video APIs
4. Video upload to S3 with CDN distribution
5. Database update with final video URLs

## Environment Variables Required

```
# Convex
CONVEX_DEPLOYMENT=
NEXT_PUBLIC_CONVEX_URL=

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=

# AI Video APIs
VEO_API_KEY=
RUNWAY_API_KEY=
LUMA_API_KEY=

# Social Media APIs (for trend scraping)
TWITTER_BEARER_TOKEN=
REDDIT_CLIENT_ID=
REDDIT_CLIENT_SECRET=

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

## Important Implementation Notes

- All video generation is asynchronous with job tracking
- Implement fallback providers for AI video generation
- Use Convex real-time subscriptions for progress updates
- Video files stored in S3 with CloudFront CDN for global delivery
- Analytics tracking requires both client-side and server-side events
- Never commit API keys or sensitive data to the repository
- Use TypeScript strictly - all components and functions should be properly typed
- Follow Next.js App Router conventions for file-based routing
- Implement proper error boundaries for video generation failures

## CLI Behavior Memories

- Do not create a new session file when running the start session slash command if files are not tracked
- Always use pnpm for package installation and running commands
- Keep documentation updated: CLAUDE.md, PRD.md, and TASKS.md files
- Update session files when running appropriate slash commands
- Update Claude.md at the start of every new conversation. Always check task.md before starting your work. Mark completed tasks. Mark tasks completed immediately. Add newly discovered tasks to the task.md
- Always use Puppeteer MCP to look at the actual application while it's running. You can use this to evaluate the UI, identify any issues with the UI, and look for improvements.

## Session History

### 2025-07-14-1459 Session (Foundation Implementation)
**Status**: Completed
**Duration**: ~3 hours
**Focus**: Core project foundation setup

**Major Accomplishments**:
- Complete Next.js 14+ project setup with TypeScript and Tailwind CSS
- Comprehensive Convex database schema design and implementation
- Clerk authentication integration with custom styling
- Professional development environment configuration
- Environment variable setup for development and production

**Tasks Completed**: 18+ subtasks across Tasks 1-3 (foundation phase)
**Next Priority**: Task 4 - Shadcn/ui component library setup

**Key Technical Decisions**:
- Package manager: pnpm (per user preference)
- Authentication: Clerk with custom dark theme
- Database: Convex with real-time capabilities
- Styling: Tailwind CSS with Shadcn/ui (planned)
- State management: React Query + Zustand hybrid approach (planned)

### 2025-07-14-1537 Session (Shadcn/ui Component Library)
**Status**: Completed
**Duration**: ~1 hour
**Focus**: UI component library setup and theme configuration

**Major Accomplishments**:
- Complete Shadcn/ui CLI installation and configuration
- Custom ViralAI brand colors (purple/blue gradient theme)
- Dark/light theme system with CSS variables and next-themes
- Base UI components (Button, Input, Card, Dialog) installed
- Theme provider and toggle functionality implemented
- Build pipeline working with all components

**Tasks Completed**: All 10 subtasks in Task 4 (Shadcn/ui setup)
**Next Priority**: Task 5 - React Query with Convex integration

### 2025-07-14-1537 Session (UI & State Management Infrastructure)
**Status**: Completed
**Duration**: ~2 hours
**Focus**: UI component library and server state management

**Major Accomplishments**:
- Complete Shadcn/ui setup with custom ViralAI branding (purple/blue theme)
- React Query v5 integration with Convex for server state management
- Custom hooks architecture with optimistic updates and error handling
- Professional design system with dark/light theme switching
- Type-safe data layer with domain-specific abstractions
- Development tools integration (React Query DevTools)

**Tasks Completed**: All 19 subtasks across Tasks 4-5 (UI + State Management)
**Next Priority**: Task 6 - Zustand stores for client state management

### 2025-07-15-1230 Session (Client State Management & Dashboard)
**Status**: Completed
**Duration**: ~4 hours
**Focus**: Client state management, authentication UI, and main app layout

**Major Accomplishments**:
- Complete Zustand store architecture with 4 specialized stores (UI, Video Wizard, Editor, Preferences)
- Enhanced Clerk authentication components with professional layouts and ViralAI branding
- Comprehensive main app layout with responsive navigation, sidebar, and dashboard pages
- TypeScript integration across all stores with persistence and cross-store subscriptions
- Mobile-first responsive design with smooth transitions and accessibility compliance
- Auto-save functionality and keyboard shortcuts management

**Tasks Completed**: All 30 subtasks across Tasks 6-8 (Client State + Auth UI + Layout)
**Next Priority**: Task 9 - Trend discovery API and database integration

### 2025-07-15-1600 Session (Trend Discovery System)
**Status**: Completed
**Duration**: ~3 hours
**Focus**: Complete trend discovery API and database integration

**Major Accomplishments**:
- Enhanced Convex database schema with comprehensive trend data fields and indexing
- Sophisticated viral score calculation algorithm with 35+ factors and platform-specific weights
- Complete Reddit API scraper covering 25+ subreddits with intelligent categorization
- Twitter/X API scraper with hashtag tracking and mock data fallbacks for development
- Comprehensive Convex functions for CRUD operations, filtering, search, and pagination
- Master trend scraping coordinator with error handling, statistics, and cleanup workflows
- Sample data seeding system with 10 diverse trending topics for development testing

**Tasks Completed**: All 10 subtasks in Task 9 (Trend Discovery API)
**Next Priority**: Task 10 - Trend discovery UI components

### 2025-07-15-1730 Session (Trend Discovery UI Components)
**Status**: Completed
**Duration**: ~2 hours
**Focus**: Comprehensive trend discovery UI component library

**Major Accomplishments**:
- Built complete trend UI component library with 10+ reusable components
- TrendGrid component with integrated search, filtering, sorting, and pagination support
- TrendCard components with 3 variants (default, compact, featured) and dynamic styling
- ViralScoreIndicator with 5 score levels and platform-specific visual design
- Advanced filtering system supporting platforms, categories with real-time counts
- Comprehensive search functionality with debounced input and clear controls
- Sorting system with 3 criteria (viral score, date, engagement) and direction toggle
- Loading states with skeleton components and comprehensive empty state handling
- TrendPreview modal with detailed metrics, platform metadata, and engagement data
- Full responsive design tested across mobile, tablet, and desktop breakpoints
- Complete integration with Convex data layer and React Query for real-time updates

**Technical Implementation**:
- TypeScript integration with strict typing for all components and props
- Shadcn/ui component integration (Badge, Popover, Dialog, Skeleton, etc.)
- Date-fns for relative time formatting and human-readable timestamps
- Platform-specific styling with dynamic color schemes and icon systems
- Comprehensive error handling and loading states for all data scenarios
- Mobile-first responsive design with touch-friendly interactions

**Tasks Completed**: All 10 subtasks in Task 10 (Trend Discovery UI)
**Next Priority**: Task 11 - AI video generation pipeline

### 2025-07-15-2100 Session (AI Video Generation Pipeline)
**Status**: Completed
**Duration**: ~3 hours
**Focus**: Complete AI video generation pipeline implementation

**Major Accomplishments**:
- Built comprehensive AI provider system with Veo 3, Runway ML, and Luma Dream Machine
- Implemented provider interfaces with abstract base class and health checking
- Created intelligent video generation queue with concurrent processing and priority handling
- Developed comprehensive fallback logic between providers with availability checking
- Built AI script generation system from trending content with platform-specific optimization
- Implemented real-time progress tracking with Convex live queries and event listeners
- Created professional UI components for progress visualization and queue monitoring
- Built complete video processing workflow with status tracking and error handling
- Designed provider factory pattern with environment-based configuration
- Achieved TypeScript-first architecture with comprehensive type safety

**Technical Implementation**:
- Provider abstraction with BaseVideoProvider class and specific implementations
- Video generation queue with Bull Queue and Redis for background processing
- Progress tracking system with real-time updates via Convex subscriptions
- Comprehensive error handling with retry mechanisms and fallback strategies
- Integration testing framework with mock providers for development
- Factory pattern for provider initialization with configuration management

**Tasks Completed**: All 10 subtasks in Task 11 (AI Video Generation Pipeline)
**Next Priority**: Task 12 - Video creation wizard UI

### 2025-07-15-2200 Session (Video Creation Wizard Implementation)
**Status**: Completed
**Duration**: ~4 hours
**Focus**: Complete 5-step video creation wizard with full functionality

**Major Accomplishments**:
- Built comprehensive wizard architecture with 40+ TypeScript interfaces
- Implemented complete 5-step video creation workflow with professional UI
- Created Zustand-based wizard store with auto-save and localStorage persistence
- Built trend selection step with full integration to existing trend discovery system
- Implemented style configuration with video presets, platform selection, and duration controls
- Created AI configuration step with provider selection, quality settings, and creativity controls
- Built real-time generation progress tracking with animated multi-stage visualization
- Implemented video preview and editing step with player controls and export options
- Designed responsive UI with mobile-first approach and accessibility compliance
- Created comprehensive validation system with step-by-step progress tracking

**Technical Implementation**:
- Multi-step wizard container with WizardStepWrapper components and navigation
- Form validation with real-time feedback and step completion tracking
- Integration with existing trend discovery, AI generation, and video processing systems
- Mock video player with simulated playback, timeline controls, and editing features
- Export system with multiple format options and quality settings
- Cross-step data persistence with auto-save and recovery capabilities

**Tasks Completed**: All 10 subtasks in Task 12 (Video Creation Wizard)
**Next Priority**: Task 13 - File storage system (AWS S3 + CloudFront)

## Current Project Status (2025-07-15)

### Infrastructure Completed ✅
- **Foundation**: Next.js 14+, TypeScript, Convex database, Clerk authentication
- **UI Library**: Shadcn/ui with custom ViralAI purple/blue gradient theme
- **State Management**: React Query v5 + Convex integration + Zustand for client state
- **Authentication**: Enhanced Clerk UI with custom styling and error handling
- **Layout System**: Complete responsive app shell with navigation and sidebar
- **Developer Experience**: Type-safe hooks, DevTools, comprehensive error handling

### Architecture Status
- **Server State**: React Query + custom Convex hooks (useUser, useTrends, useVideos)
- **Client State**: Comprehensive Zustand stores (UI, Video Wizard, Video Editor, Preferences)
- **Database**: Complete schema with users, videos, trends, analytics, videoJobs
- **Authentication**: Enhanced Clerk integration with professional UI components
- **Layout**: AppShell with MainNavbar, Sidebar, MobileNav, UserMenu, Breadcrumb components
- **Build System**: Production-ready with TypeScript strict mode

### Dashboard Implementation
- **Main Dashboard**: Statistics, quick actions, recent activity with mock data
- **Create Page**: Video creation wizard with step-by-step process guidance
- **Trends Page**: Trending content discovery with viral scores and engagement metrics
- **Library Page**: Video management with search, filters, and status tracking
- **Analytics Page**: Performance metrics, audience insights, and activity feeds
- **Settings Page**: User preferences, notifications, security, and appearance settings

### Phase Progress
- ✅ **Phase 1 Foundation**: 100% complete (Tasks 1-9)
  - Infrastructure, database, authentication, UI library, state management, layout, trend discovery all implemented
- ✅ **Phase 2 Core Features**: 100% complete (Tasks 10-12)
  - ✅ Trend Discovery UI: Complete trend browsing, filtering, search, and selection system
  - ✅ AI Video Generation Pipeline: Complete AI provider system with Veo 3, Runway, and Luma integration
  - ✅ Video Creation Wizard: Complete 5-step wizard with trend selection, style config, AI settings, progress tracking, and preview
- 🚧 **Phase 3 Infrastructure**: Started (Task 13+)
  - Next: File storage system (AWS S3 + CloudFront) for video hosting and delivery
  - Video player components with advanced controls and editing features
  - Library dashboard with search, filtering, and management capabilities

## Development Best Practices

- Always use pnpm to install and run the application

## Documentation Maintenance

- Keep documentation updated across files:
  * claude.md
  * PRD.md
  * Tasks.md
- Use appropriate slash commands to update session files when changes occur