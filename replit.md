# Vibo - Project Documentation

## Overview
Vibo (also known as Vibee OS) is a Next.js 15 application for emotional wellness, student mental health support, and voice-based emotional expression with location-based social features. It aims to create a personalized, compassionate, and engaging platform for users to track moods, share feelings, and connect with supportive communities globally and locally. Key capabilities include advanced voice note features, a comprehensive student mental health hub with parent-student emotional bridging, an AI-powered emotional resonance feed, and the GeoVibe Engine for location-based emotional mapping across Indian cities. The project targets a significant market in student mental health and emotional well-being.

## User Preferences
None recorded yet.

## System Architecture

### UI/UX Decisions
- **Visual Design**: Super colorful and attractive design with emotion-specific visual cues, animated gradient backgrounds, colorful borders, sparkle decorations, and glow effects on interactive elements.
- **Typography**: Uses the Inter font family.
- **Component Styling**: Leverages Tailwind CSS with `tailwindcss-animate` for dynamic animations.
- **Header Design**: Features a gradient background, colorful logo with rotation on hover, and gradient text effects.
- **EmotionTabs Design**: Emotion-specific gradient colors, vibrant active states, and glass morphism effects.

### Technical Implementations
- **Framework**: Next.js 15.3.3 with Turbopack.
- **Frontend**: React 18.3.1 with Radix UI components.
- **State Management**: Custom React hooks (`useVoiceRecorder`, `useStudentHub`, `useStudyBreakNotifications`, `usePersonalizedFeed`, `useEngagementTracking`).
- **Data Validation**: React Hook Form with Zod validation.
- **Charting**: Recharts for data visualization.
- **Voice Notes**: Utilizes Browser MediaRecorder API for audio capture (WebM/Opus, 24kbps, 16kHz sample rate), with real-time waveform visualization using Web Audio API (AnalyserNode, 256 FFT size). Features include live audio levels, compression stats, echo cancellation, noise suppression, and proper cleanup.
- **Student Mental Health Hub**: Includes Exam Stress Mode, Smart Study Break Reminders (using Browser Notification API), Anonymous Peer Support circles, and a Privacy-Protected Parent-Student Emotional Bridge.
- **SEO**: Advanced SEO implementation using Next.js Metadata API, dynamic XML sitemaps, structured data (JSON-LD Schema), canonical URLs, and PWA manifest.
- **Vibee Feed Algorithm**: An AI-powered, emotion-based recommendation system that calculates a VibeScore based on Emotion Relevance Score (ERS), reactions, freshness, engagement, diversity, and boosts. Uses Genkit AI (Google Gemini 2.5 Flash) for emotion strength and sentiment intensity scoring. Divides the feed into "My Vibe Zone", "Healing Zone", and "Explore Vibes". Features adaptive learning and a post boost system with cooldown and decay.
- **Vibee Gamification System**: A comprehensive gamified community system with a reward economy (XP, VibeCoins, badges), missions (daily, weekly, special events), a virtual store, leaderboards (national, city-based, friends-only, weekly mood), and emotion-based community hubs. Automated rewards for posting, reacting, commenting, and voice notes are implemented with smart notifications for progress.
- **GeoVibe Engine**: A comprehensive location-based emotional mapping system. Features location capture (Browser Geolocation API with privacy consent), real-time city-level emotion analytics (City Mood Pulse), Geo-hash based nearby vibes feed, and interactive emotion maps (Google Maps integration). Includes gamification elements like XP, local leaderboards, and city challenges. All mutation endpoints require Firebase authentication.
- **Development Setup**: Configured for Replit compatibility, including port binding (`0.0.0.0:5000`), using TypeScript with build error/ESLint ignoring for faster development.

### System Design Choices
- **Modular Structure**: Key functionalities are organized into dedicated directories (`/src/app/`, `/src/components/`, `/src/firebase/`, `/src/hooks/`, `/src/lib/`, `/src/ai/`).
- **Privacy-First Architecture**: Especially for the Parent-Student Emotional Bridge, ensuring no direct access to student posts, only general mood trends.
- **Performance Optimization**: Lazy loading, hover-triggered animations, and optimized font loading using `next/font/google`.
- **Environment Variables**: Strict management of Firebase and SEO credentials via environment variables for security and flexibility.
- **Atomic Transaction Architecture**: For reward operations, using Firestore transactions with advanced idempotency (deterministic key generation, unique identifiers) to prevent duplicates and race conditions. Client-side resilience with exponential backoff retry logic.

## External Dependencies

- **Backend & Database**: Firebase (Authentication, Firestore for data storage with geohash indexes, Firebase Storage for voice notes).
- **AI Integration**: Genkit with Google Genai (Google Gemini 2.5 Flash for emotion analysis).
- **Maps**: Google Maps JavaScript API.
- **External Image Providers**: `placehold.co`, `images.unsplash.com`, `picsum.photos`.