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
- **State Management**: Custom React hooks (`useVoiceRecorder`, `useStudentHub`, `useStudyBreakNotifications`, `usePersonalizedFeed`, `useEngagementTracking`, `useHubNotifications`).
- **Data Validation**: React Hook Form with Zod validation.
- **Charting**: Recharts for data visualization.
- **Voice Notes**: Utilizes Browser MediaRecorder API for audio capture (WebM/Opus, 24kbps, 16kHz sample rate), with real-time waveform visualization using Web Audio API (AnalyserNode, 256 FFT size). Features include live audio levels, compression stats, echo cancellation, noise suppression, and proper cleanup.
- **Student Mental Health Hub**: Includes Exam Stress Mode, Smart Study Break Reminders (using Browser Notification API), Anonymous Peer Support circles, and a Privacy-Protected Parent-Student Emotional Bridge.
- **SEO**: Advanced SEO implementation using Next.js Metadata API, dynamic XML sitemaps, structured data (JSON-LD Schema), canonical URLs, and PWA manifest.
- **Vibee Feed Algorithm**: An AI-powered, emotion-based recommendation system that calculates a VibeScore based on Emotion Relevance Score (ERS), reactions, freshness, engagement, diversity, and boosts. Uses Genkit AI (Google Gemini 2.5 Flash) for emotion strength and sentiment intensity scoring. Divides the feed into "My Vibe Zone", "Healing Zone", and "Explore Vibes". Features adaptive learning and a post boost system with cooldown and decay.
- **Vibee Gamification System**: A comprehensive gamified community system with a reward economy (XP, VibeCoins, badges), missions (daily, weekly, special events), a virtual store, leaderboards (national, city-based, friends-only, weekly mood), and emotion-based community hubs. Automated rewards for posting, reacting, commenting, and voice notes are implemented with smart notifications for progress.
- **Enhanced Community Hubs System** (November 2025): Advanced hub discovery and engagement features including:
  - **Smart Hub Recommendations**: AI-powered recommendation engine that analyzes user emotional history, vibe affinity scores, current mood, and vibeMemory patterns to suggest personalized hubs with match scores and explanations
  - **Real-time Hub Notifications**: Browser notification system for hub activities (new posts, challenges, milestones, trending content) with customizable preferences and quiet hours
  - **Enhanced Hub Navigation**: Direct linking from hub list to detailed hub pages with interactive cards showing activity levels, member counts, and trending indicators
  - **Hub Activity Metrics**: Real-time tracking of 24-hour activity counts and trending scores for each hub
  - **Notification Preferences**: User-configurable notification settings including mute options, quiet hours, and selective notification types (stored in Firestore `hub-notification-preferences` collection)
- **GeoVibe Engine**: A comprehensive location-based emotional mapping system. Features location capture (Browser Geolocation API with privacy consent), real-time city-level emotion analytics (City Mood Pulse), Geo-hash based nearby vibes feed, and interactive emotion maps (Google Maps integration). Includes gamification elements like XP, local leaderboards, and city challenges. All mutation endpoints require Firebase authentication.
- **Enhanced GeoVibe System** (November 2025): Revolutionary emotional landscape features including:
  - **Automatic Redirect**: /geovibe now automatically redirects to /geovibe/enhanced for the best experience
  - **Intelligent Demo Data System**: Enhanced to generate 80-100 realistic vibes per city (up from 20) with:
    - Realistic timestamp distribution (40% within 2 hours, 70% within 6 hours, 90% within 18 hours, 10% up to 48 hours old)
    - 15+ diverse text variations per emotion for authentic feel
    - Time-based emotion patterns across 6 major Indian cities (Delhi, Mumbai, Bangalore, Pune, Hyderabad, Chennai)
    - Trending emotional waves ("Wave of Joy spreading across South Delhi")
    - Demo vibes sorted by recency and marked as "Anonymous Viber" for transparency
  - **Live Activity Indicator**: Real-time dashboard showing:
    - Vibes in last hour with live incrementing animation
    - Active users estimate (30% of total + realistic variance)
    - Vibes per minute calculation
    - Total vibes today with animated pulse on new vibes
  - **India-Wide Emotional Pulse**: National-level statistics dashboard featuring:
    - Total vibes count across India
    - Number of active cities and states
    - Estimated active users
    - Trending emotion for the entire nation with percentage
    - Top 5 most active cities leaderboard
  - **Trending Emotions Panel**: Real-time emotion breakdown showing:
    - Top 6 emotions with percentage and count
    - Progress bars with emotion-specific colors
    - Trending indicator for #1 emotion
    - Live updates as data changes
  - **Advanced Map Visualizations**: 
    - Enhanced SVG India map with animated gradient borders and pulsing effects
    - Emotion Heat Maps using Google Maps Visualization API with multi-layer gradients for different emotions
    - 3D Emotion Bubbles with intensity-based sizes, floating animations, and interactive popups
    - Particle System with animated emotion flows, connecting particles of similar emotions
    - Improved visual design with shadow effects, gradient backgrounds, and smooth transitions
  - **Emotion Timeline & Rewind**: Hour-by-hour emotion tracking with rewind capability to view yesterday/last week, plus AI-powered predictions for when specific emotions typically occur in a location
  - **Nearby Vibe Stories**: Aggregated anonymous emotional narratives ("8 people felt happy here today"), emotion journey maps (Calm Trail, Happiness Route, Motivation Path), and location-based emotional insights
  - **Vibe Challenges & Gamification**: Daily/weekly/city challenges ("Spread 10 Happy Vibes", "Delhi Happiness Battle"), geo-unlockable achievements for visiting famous locations, progress tracking with XP/coin rewards, and city-vs-city competitions
  - **Map Theme System**: 6 custom themes including Dark Glow (glowing markers on dark map), Pastel Dreams (calming colors), Vibrant Neon (high-energy aesthetic), and seasonal themes (Monsoon Blues, Summer Yellows) with custom Google Maps styling
  - **Smart GeoVibe Notifications**: Real-time notifications for neighborhood mood needs, achievement unlocks, emotional storms detected, trending waves, and nearby people with similar emotions
  - **Viral Sharing Features**: Beautiful city mood cards with current emotional weather, shareable screenshots, emotion forecasts, and social media integration for spreading awareness
  - **Emotion Waves Display**: Live tracking of trending emotional patterns ("Morning Motivation Wave", "Lunch Hour Joy", "Evening Chill Wave") with intensity indicators and affected area maps
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

## Environment Variables

### Required for Full Functionality
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`: Google Maps JavaScript API key for map visualizations
- `FIREBASE_PRIVATE_KEY`: Firebase Admin SDK private key (for server-side operations)
- `FIREBASE_CLIENT_EMAIL`: Firebase Admin SDK client email
- `FIREBASE_PROJECT_ID`: Firebase project ID

### Demo Mode Fallbacks
The Enhanced GeoVibe system includes intelligent demo data fallbacks when Firebase Admin credentials are not available:
- **City Leaderboards**: Returns demo leaderboard with 10 sample users
- **City Challenges**: Returns 2 active demo challenges for the selected city
- **Demo Vibes**: Generates realistic emotion clusters for 6 major Indian cities
- **Emotion Waves**: Creates time-based emotional weather patterns

This ensures the application remains fully functional and visually impressive even in development/demo environments without Firebase Admin setup.