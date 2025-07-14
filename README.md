# ViralAI - AI-Powered Video Generation Platform

## Overview

ViralAI is an AI-powered video generation platform that creates viral-ready 15-30 second videos by analyzing internet trends, generating scripts, and producing videos using state-of-the-art AI models (Veo 3, Runway, Luma).

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS, Shadcn/ui
- **Backend**: Convex (database), Clerk (authentication)
- **AI Services**: Veo 3, Runway, Luma APIs
- **Infrastructure**: Vercel, AWS S3, CloudFront CDN

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- Git

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd viral-vid-gen
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Set up environment variables:

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API keys and configuration
   ```

4. Start the development server:

   ```bash
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Development Commands

```bash
# Development
pnpm dev             # Start development server
pnpm build           # Build for production
pnpm start           # Start production server

# Code Quality
pnpm lint            # Run ESLint
pnpm lint:fix        # Fix ESLint issues
pnpm format          # Format code with Prettier
pnpm format:check    # Check code formatting
pnpm type-check      # Run TypeScript type checking

# Database (Convex)
pnpm convex dev      # Start Convex development server
pnpm convex deploy   # Deploy database changes
pnpm convex dashboard # Open Convex dashboard
```

## Project Structure

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

## Features (Planned)

### Phase 1 - Foundation

- ✅ Next.js 14+ setup with TypeScript
- ✅ Tailwind CSS + Shadcn/ui components
- ✅ ESLint + Prettier configuration
- 🚧 Convex database setup
- 🚧 Clerk authentication
- 🚧 Basic app layout

### Phase 2 - Core Features

- 📋 Trend discovery system
- 📋 AI video generation pipeline
- 📋 Video creation wizard
- 📋 File storage (S3 + CloudFront)
- 📋 Video player components
- 📋 Video library dashboard

### Phase 3 - Enhancement

- 📋 Advanced video editor
- 📋 Analytics tracking
- 📋 Mobile responsiveness
- 📋 Performance optimizations
- 📋 Production deployment

## Environment Variables

See `.env.example` for required environment variables:

- **Convex**: Database configuration
- **Clerk**: Authentication service
- **AI APIs**: Veo 3, Runway, Luma
- **AWS**: S3 storage and CloudFront CDN

## Contributing

1. Follow the existing code style (ESLint + Prettier)
2. Use TypeScript strictly - all components should be properly typed
3. Follow Next.js App Router conventions
4. Test thoroughly before submitting PRs

## License

This project is private and proprietary.
