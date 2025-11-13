# Vibo - Project Documentation

## Overview
Vibo (Vibee OS) is a Next.js 15 emotional wellness application focused on student mental health, voice-based emotional expression, and location-based social features. It aims to provide a personalized, supportive platform for mood tracking, sharing feelings, and connecting with communities. Key features include advanced voice notes, a student mental health hub with parent-student emotional bridging, an AI-powered emotional resonance feed, and the GeoVibe Engine for location-based emotional mapping across Indian cities. The project targets the significant market of student mental health and emotional well-being.

## User Preferences
None recorded yet.

## System Architecture

### UI/UX Decisions
- **Visual Design**: Super colorful and attractive design with emotion-specific visual cues, animated gradient backgrounds, colorful borders, sparkle decorations, and glow effects.
- **Typography**: Uses the Inter font family.
- **Component Styling**: Leverages Tailwind CSS with `tailwindcss-animate`.
- **Header Design**: Gradient background, colorful logo with rotation on hover, and gradient text effects. **Fully responsive** with mobile hamburger menu using Sheet component for navigation on small screens.
- **EmotionTabs Design**: Emotion-specific gradient colors, vibrant active states, and glass morphism effects.
- **Responsive Design (November 2025)**: Complete mobile-first responsive design across all pages. Navigation bar hidden on mobile with slide-out hamburger menu, optimized spacing and sizing for all breakpoints (mobile, tablet, desktop).

### Technical Implementations
- **Framework**: Next.js 15.3.3 with Turbopack.
- **Frontend**: React 18.3.1 with Radix UI components.
- **State Management**: Custom React hooks.
- **Data Validation**: React Hook Form with Zod.
- **Charting**: Recharts for data visualization.
- **Voice Notes**: Browser MediaRecorder API for audio capture (WebM/Opus, 24kbps, 16kHz), real-time waveform visualization using Web Audio API.
- **Image Attachments (November 2025)**: Powerful image upload system for Vibe posts with automatic compression (<1MB for Firebase Free tier). Features drag-and-drop UI, real-time preview, multi-pass compression with quality fallback, WebP conversion for optimal file size. Browser-image-compression library ensures images are compressed client-side before upload. Images display in feeds with responsive layouts, lazy loading, and gradient overlays. Complete storage lifecycle management with automatic cleanup when vibes are deleted. Supports both text and voice vibes with images.
- **Student Mental Health Hub**: Includes Exam Stress Mode, Smart Study Break Reminders, Anonymous Peer Support, and a Privacy-Protected Parent-Student Emotional Bridge.
- **SEO**: Advanced SEO using Next.js Metadata API, dynamic XML sitemaps, structured data (JSON-LD Schema), canonical URLs, and PWA manifest.
- **Vibee Feed Algorithm**: AI-powered, emotion-based recommendation system calculating a VibeScore. Uses Genkit AI (Google Gemini 2.5 Flash) for emotion strength and sentiment intensity. Features "My Vibe Zone", "Healing Zone", and "Explore Vibes", with adaptive learning and post boosting.
  - **Phase 2 Enhancements (November 2025)**: Advanced AI-powered personalization, including an Emotion Intelligence Engine (mood graphs, reaction analysis, time-based tracking), enhanced recommendation algorithm (Emotion Match, Freshness, Engagement Quality, Location Proximity, Diversity Boost), Vibe Streaks system, Emotion Explorer Gamification, Daily Emotion Challenges, Social Proof Layer, UserInterestProfile, Smart Emotion Notifications, and an Emotion Intelligence Dashboard.
- **Emotion Feed (Reels-Style Experience)**: Full-screen, vertical swipe feed for text and voice vibes at `/emotion-feed`. Instagram Reels-style immersive experience with smooth Framer Motion animations, gesture-based swipe navigation, and engagement tracking.
  - **Full-Screen Swipeable Deck**: Vertical swipe up/down navigation, smooth fade transitions, touch-friendly drag gestures, progress indicators (5-dot pagination).
  - **Vibe Display**: User name & location, emotion tag with emoji, text vibes (poetic expressions), voice vibes with waveform animation, gradient backgrounds per emotion.
  - **Action Buttons**: Interest (❤️), Share (🔁), React (💬 with 8 emoji options), Skip (⏭️), "Show me more like this" (✨).
  - **Onboarding Flow**: Emotion quiz (`/onboarding/emotions`) where users select 3-5 emotions from 16 options including Indian-specific vibes (Festival Joy, Exam Stress, etc.).
  - **Smart Interest System**: Real-time engagement tracking (views, listen duration, interactions, completion rate), User Interest Profile (emotion affinity, content style preferences, average listen rate, focus emotion).
  - **Enhanced Recommendation Algorithm**: Multi-factor scoring formula: Emotion Match (40%), Freshness (20%), Engagement Quality (15%), Location Proximity (10%), Diversity (10%), Cold-Start Boost (5%). Features emotion affinity learning, focus emotion boost, distance-based location scoring, and monotony prevention.
  - **Performance**: Audio prefetching (next 2 vibes), localStorage caching (last 10 vibes), lazy loading, infinite scroll with auto-load, Firebase CDN for audio delivery.
  - **Implementation**: `SwipeableVibeDeck`, `VibeCardFullScreen`, `VoiceWavePlayer`, `useFeedEngagement` hook, `enhanced-algorithm.ts`, `/api/feed` endpoints. Full documentation at `docs/EMOTION_FEED_IMPLEMENTATION.md`.
- **Vibee Gamification System**: Multi-currency reward economy (XP, VibeCoins, Karma Score), missions (daily, weekly, special events), virtual store, leaderboards, and emotion-based community hubs.
  - **Multi-Currency Rewards Economy (November 2025)**: Detailed XP earning structure with daily caps, quality bonuses for viral content, a progressive level system (1-50), comprehensive badge system (100+ badges across 7 categories), Karma Score system for content visibility, Streak Milestones, Special Achievements, and a Rewards Dashboard.
- **AI-Powered Challenge System (November 2025)**: Revolutionary engagement system with a Challenge Dock, 7 Challenge Archetypes (Emotion Exploration, Social Connector, Discovery Quests, Streak Builder, Location Explorer, Festival Specials, Flash Challenges). Uses Google Gemini 2.5 Flash for personalized challenge generation and smart scheduling (hourly, daily, weekly, festival). Features a multi-tier reward system and celebration animations.
- **Enhanced Community Hubs System (November 2025)**: Smart Hub Recommendations based on user emotional history and mood, real-time Hub Notifications with customizable preferences, enhanced navigation, and activity metrics.
- **GeoVibe Engine**: Location-based emotional mapping system. Features location capture (Browser Geolocation API), real-time city-level emotion analytics (City Mood Pulse), Geo-hash based nearby vibes feed, and interactive emotion maps (Google Maps integration).
  - **Enhanced GeoVibe System (November 2025)**: Automatic redirect to `/geovibe/enhanced`. Intelligent demo data generation for realistic vibes and emotional waves. Live activity indicator (vibes in last hour, active users). India-Wide Emotional Pulse dashboard with national statistics. Trending Emotions Panel. Advanced Map Visualizations (SVG India map, Emotion Heat Maps, 3D Emotion Bubbles, Particle System). Emotion Timeline & Rewind. Nearby Vibe Stories. Vibe Challenges & Gamification (city challenges, geo-unlockable achievements). Map Theme System (6 custom themes). Smart GeoVibe Notifications. Viral Sharing Features. Emotion Waves Display.
- **Development Setup**: Configured for Replit compatibility (port binding `0.0.0.0:5000`), TypeScript with build error/ESLint ignoring.
- **Analytics & Performance Monitoring (November 2025)**: Integrated Vercel Web Analytics and Vercel Speed Insights for real-time user behavior tracking and performance monitoring. Both services configured for Next.js App Router with proper server-side component compatibility.

### System Design Choices
- **Modular Structure**: Functionalities organized into dedicated directories.
- **Privacy-First Architecture**: Especially for Parent-Student Emotional Bridge, focusing on general mood trends.
- **Performance Optimization**: Lazy loading, hover-triggered animations, optimized font loading.
- **Environment Variables**: Strict management of Firebase and SEO credentials.
- **Atomic Transaction Architecture**: For reward operations, using Firestore transactions with idempotency and client-side retry logic.

## External Dependencies

- **Backend & Database**: Firebase (Authentication, Firestore, Firebase Storage).
- **AI Integration**: Genkit with Google Genai (Google Gemini 2.5 Flash).
- **Maps**: Google Maps JavaScript API.
- **External Image Providers**: `placehold.co`, `images.unsplash.com`, `picsum.photos`.