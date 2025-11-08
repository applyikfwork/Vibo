# Vibo - Project Documentation

## Overview
Vibo (also known as Vibee OS) is a Next.js 15 application designed for emotional wellness, student mental health support, and voice-based emotional expression with location-based social features. It aims to create a personalized, compassionate, and engaging platform for users to track moods, share feelings, and connect with supportive communities both globally and locally. Key capabilities include advanced voice note features, a comprehensive student mental health hub with parent-student emotional bridging, an AI-powered emotional resonance feed, and the GeoVibe Engine for location-based emotional mapping across Indian cities. The project targets a significant market in student mental health and emotional well-being.

## User Preferences
None recorded yet.

## System Architecture

### UI/UX Decisions
- **Visual Design**: Super colorful and attractive design with emotion-specific visual cues. This includes animated gradient backgrounds, colorful borders, sparkle decorations, and glow effects on interactive elements.
- **Typography**: Uses the Inter font family.
- **Component Styling**: Leverages Tailwind CSS with `tailwindcss-animate` for dynamic, performance-optimized animations.
- **Header Redesign**: Features a gradient background, colorful logo with rotation on hover, and gradient text effects.
- **EmotionTabs Redesign**: Emotion-specific gradient colors, vibrant active states, and glass morphism effects.

### Technical Implementations
- **Framework**: Next.js 15.3.3 with Turbopack for performance.
- **Frontend**: React 18.3.1 with Radix UI components.
- **State Management**: Custom React hooks (`useVoiceRecorder`, `useStudentHub`, `useStudyBreakNotifications`, `usePersonalizedFeed`, `useEngagementTracking`).
- **Data Validation**: React Hook Form with Zod validation.
- **Charting**: Recharts for data visualization.
- **Voice Notes**: Utilizes Browser MediaRecorder API for audio capture, optimized for low bandwidth (WebM/Opus, 24kbps, 16kHz sample rate), with **real-time waveform visualization using Web Audio API**. Features include:
    - Real frequency analysis with AnalyserNode (256 FFT size)
    - Live audio levels displayed as 20-bar waveform (8-40px height range)
    - Actual compression stats showing real blob size and calculated bitrate
    - Echo cancellation and noise suppression
    - Proper cleanup to prevent memory leaks (AudioContext, AnalyserNode, animation frames)
- **Student Mental Health Hub**: Features Exam Stress Mode, Smart Study Break Reminders (using Browser Notification API), Anonymous Peer Support circles, and a Privacy-Protected Parent-Student Emotional Bridge.
- **SEO**: Advanced SEO implementation including Next.js Metadata API, dynamic XML sitemaps, structured data (JSON-LD Schema), canonical URLs, and PWA manifest.
- **Vibee Feed Algorithm**: An AI-powered, emotion-based recommendation system.
    - **Core Logic**: Calculates a VibeScore based on Emotion Relevance Score (ERS), reactions, freshness, engagement, diversity, and boosts.
    - **AI Analysis**: Uses Genkit AI (Google Gemini 2.5 Flash) for emotion strength and sentiment intensity scoring.
    - **Smart Vibe Zones**: Divides the feed into "My Vibe Zone" (exact matches), "Healing Zone" (complementary emotions), and "Explore Vibes" (trending content).
    - **Adaptive Learning**: Personalizes recommendations based on user interaction (view, react, comment) to update `VibeAffinityScores`.
    - **Post Boost System**: Implements various triggers for boosting post visibility (e.g., Support Boost, Energy Boost, Emotional Balance Boost).
    - **Cooldown & Decay**: Time-based score decay, with emotion-specific rates.
- **Vibee Gamification System**: A comprehensive gamified community system (Implemented November 2025).
    - **Reward Economy**: XP (20 levels), VibeCoins (virtual currency), 14 unique badges (common to legendary rarity)
    - **Missions**: Daily missions (reset at midnight), Weekly challenges (7-day cycle), Special event missions
    - **Virtual Store**: 10 purchasable items including post boosts, premium badges, custom themes, AI filters
    - **Leaderboards**: National (India-wide), City-based, Friends-only, Weekly Mood rankings
    - **Community Hubs**: 5 emotion-based communities (Motivation Station, Alone Zone, Happy Vibes, Study Support, Chill Corner)
    - **Automatic Rewards**: XP/coins awarded for posting (10 XP), reacting (2 XP), commenting (5 XP), voice notes (15 XP)
    - **Smart Notifications**: Toast alerts for level-ups, badge unlocks, mission completions, streak bonuses
    - **Progress Tracking**: Real-time mission progress, posting streaks, helpful comment counts, reaction streaks
    - **Badge System**: 14 achievement badges with auto-unlock conditions (e.g., Streak Master for 7-day posting streak)
    - **Store Transactions**: Firestore transaction-based purchases to prevent double-spending
    - **API Routes**: `/api/gamification/rewards`, `/api/gamification/missions`, `/api/gamification/store`, `/api/gamification/leaderboards`, `/api/gamification/hubs`
    - **Data Model**: Extended UserProfile with coins, level, badges, dailyMissions, weeklyMissions, inventory, postingStreak, reactionStreaks, and more
- **GeoVibe Engine**: A comprehensive location-based emotional mapping system (MVP completed November 2025).
    - **Location Capture**: Browser Geolocation API with privacy-first consent model stored in Firestore
    - **City Mood Pulse**: Real-time city-level emotion analytics (24-hour aggregation, on-demand calculation)
    - **Nearby Vibes Feed**: Geohash-based proximity queries (10km radius) with batched performance optimization
    - **Interactive Emotion Map**: Google Maps integration showing emotion markers with color-coded mood intensity
    - **XP & Gamification**: User engagement tracking with atomic XP increments using FieldValue.increment
    - **Local Leaderboards**: City and national rankings by XP (top 10 users)
    - **City Challenges**: Community challenges with progress tracking, authenticated join system (Firebase ID tokens), and rewards
    - **Security**: All mutation endpoints require Firebase authentication with server-side token verification
    - **Data Model**: Extended Vibe type with optional Location fields (lat, lng, city, geohash)
    - **API Routes**: `/api/geovibe/city-pulse`, `/api/geovibe/nearby`, `/api/geovibe/challenges`, `/api/geovibe/challenges/join`, `/api/geovibe/leaderboards`
    - **Future Enhancements**: Festival events, Mood Zones, server-side aggregation for high-traffic cities, Firestore transactions for atomic operations
- **Development Setup**: Configured for Replit compatibility, including port binding (`0.0.0.0:5000`). Uses TypeScript with build error/ESLint ignoring for faster development.

### System Design Choices
- **Modular Structure**: Key functionalities are organized into dedicated directories (`/src/app/`, `/src/components/`, `/src/firebase/`, `/src/hooks/`, `/src/lib/`, `/src/ai/`).
- **Privacy-First Architecture**: Especially for the Parent-Student Emotional Bridge, ensuring no direct access to student posts, only general mood trends.
- **Performance Optimization**: Lazy loading, hover-triggered animations, and optimized font loading using `next/font/google`.
- **Environment Variables**: Strict management of Firebase and SEO credentials via environment variables for security and flexibility.

## External Dependencies

- **Backend & Database**: Firebase (Authentication, Firestore for data storage with geohash indexes, Firebase Storage for voice notes).
- **AI Integration**: Genkit with Google Genai (specifically Google Gemini 2.5 Flash for emotion analysis).
- **Maps**: Google Maps JavaScript API (requires NEXT_PUBLIC_GOOGLE_MAPS_API_KEY environment variable).
- **External Image Providers**: `placehold.co`, `images.unsplash.com`, `picsum.photos`.

## Recent Changes (November 2025)

### Comprehensive Gamification System (November 7, 2025)
- ✅ **Complete Reward System**: XP, VibeCoins, Levels (1-20), and Badges (14 types)
- ✅ **Missions System**: Daily (3 missions), Weekly (4 challenges), auto-reset functionality
- ✅ **Virtual Store**: 10 purchasable items (boosts, badges, themes, filters, skip tokens)
- ✅ **Advanced Leaderboards**: National, City, Friends, and Weekly Mood rankings
- ✅ **Community Hubs**: 5 emotion-based communities with member tracking
- ✅ **Smart Notifications**: Level-ups, badge unlocks, mission completions with toast alerts
- ✅ **Reward Integration**: Automatic XP/coin awards for posting vibes, reactions, and comments
- ✅ **UI Components**: ProfileLevel, MissionCard, StoreItemCard, LeaderboardTable components
- ✅ **Dashboard**: Full gamification page with Challenges, Leaderboards, and Store tabs
- ✅ **Custom Hook**: useGamification for seamless reward tracking across the app
- ✅ **Database Schema**: Extended UserProfile with 15+ new gamification fields
- ✅ **API Routes**: 4 new authenticated endpoints (/rewards, /missions, /store, /leaderboards, /hubs)
- ✅ **Security**: All endpoints protected with Firebase ID token verification
- ✅ **Transaction Safety**: Firestore transactions for store purchases to prevent race conditions
- ✅ **Header Integration**: Added Rewards and Hubs links to main navigation

### GeoVibe Engine MVP Implementation
- ✅ Implemented complete location-based emotional mapping system
- ✅ Added 8 new React components (LocationCapture, GeoVibesMap, CityMoodPulse, NearbyVibes, CityChallenges, LocalLeaderboards, etc.)
- ✅ Created 5 authenticated API endpoints with Firebase ID token verification
- ✅ Extended Firestore data model with location fields and geohash indexing
- ✅ Built XP and gamification system with atomic operations
- ✅ Implemented city challenges with progress tracking and rewards
- ✅ Added GeoVibe navigation link to header
- ✅ Security hardened: All mutation endpoints require authentication
- ✅ Performance optimized: Batched Firestore queries for nearby vibes
- 📝 Architect approved as production-ready with no critical blockers

### Rewards System Improvements (November 8, 2025)
- ✅ **Mission Reward Claiming**: Created dedicated `/api/gamification/missions/claim` endpoint with proper validation
- ✅ **Claimed Status Tracking**: Extended Mission type with `claimed` and `claimedAt` fields to prevent duplicate claims
- ✅ **Duplicate Claim Prevention**: Frontend and backend validation ensures rewards can only be claimed once
- ✅ **Level-Up Bonus Fix**: Corrected level-up bonus calculation to use stored database level and prevent duplicate awards
- ✅ **Transaction History**: New `/api/gamification/transactions` endpoint for viewing reward earning/spending history
- ✅ **Reward History UI**: Added RewardHistory component with filtering (All/Earned/Spent) and detailed transaction display
- ✅ **Enhanced Mission Cards**: Updated MissionCard to show claimed status, gift icon for claimed rewards, and disable already-claimed missions
- ✅ **Improved UX**: Added History tab to gamification page with 4-tab layout (Challenges, Leaderboards, Store, History)
- ✅ **Transaction Logging**: All reward claims now properly logged with mission metadata for audit trail
- ✅ **Error Handling**: Comprehensive error messages for already claimed, not completed, and invalid mission scenarios
- 📝 **Architect Verified**: Reward system confirmed secure, functionally correct, and production-ready with no security issues

### Production-Grade Rewards System Overhaul (November 8, 2025)
- ✅ **Atomic Transaction Architecture**: Complete rewrite using Firestore transactions for all reward operations (user fetch, duplicate check, balance updates, reward logging)
- ✅ **Advanced Idempotency System**: Deterministic key generation with 30-second windows + unique identifiers (vibeId, commentId) to prevent duplicates while allowing legitimate repeated actions
- ✅ **Race Condition Prevention**: Duplicate detection inside transactions using deterministic document IDs (`userId_idempotencyKey` pattern)
- ✅ **Client-Side Resilience**: Exponential backoff retry logic (3 attempts: 1s, 2s, 4s delays) with duplicate suppression to handle network failures
- ✅ **Rate Limiting & Anti-Cheat**: Server-side rate limiting via transactional reads of recent `reward-transactions` to prevent abuse
- ✅ **Call Site Integration**: Updated VibeForm, ReactionPalette, and InteractionSection to pass unique identifiers to reward functions
- ✅ **Comprehensive Error Handling**: Full validation pipeline with specific error messages for all failure scenarios
- ✅ **Reward Analytics**: Created `/api/gamification/rewards/analytics` and `/api/gamification/rewards/history` endpoints for transaction tracking
- ✅ **Data Consistency**: All reward updates are fully atomic - no partial failures or race conditions possible
- 📝 **Architect Verified**: System confirmed production-ready with no critical bugs, proper idempotency, and enterprise-level reliability