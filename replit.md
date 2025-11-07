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