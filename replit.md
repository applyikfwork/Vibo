# Vibo - Project Documentation

## Overview
Vibo is a Next.js 15 application with Firebase integration for authentication and data storage. The app was migrated from Vercel to Replit on November 2, 2025.

## Recent Changes

### Hydration Error Fix (November 2, 2025)
- **Fixed React Hydration Mismatch**: Replaced manual Google Fonts link tags with Next.js font optimization
- **Used next/font/google**: Implemented proper font loading using Next.js built-in font system
- **Eliminated SSR/Client Mismatch**: Font loading now happens consistently on both server and client
- **Performance Improved**: Fonts are now optimized and loaded more efficiently

### Complete Visual Overhaul - Super Colorful & Attractive Design (November 2, 2025)
- **VibeCard Enhancements**:
  - Emotion-specific colorful border glows with multi-layer shadows
  - Animated gradient backgrounds (hover-triggered for performance)
  - Floating sparkle decorations that appear on hover
  - Enhanced buttons with stronger borders, backdrop blur, and glow effects
  - Improved card hover effects with scale and lift animations
  - Performance-optimized animations (only active on hover)

- **Global Styling**:
  - Custom CSS animations: gradient-shift, float, and pulse-glow
  - Animated gradient background across the entire page
  - Floating decorative circles with blur effects
  - Inter font family for better typography

- **Header Redesign**:
  - Gradient background (purple → pink → blue)
  - Colorful logo with rotation on hover
  - Gradient text effects on brand name and navigation
  - Enhanced hover states with gradient backgrounds

- **Main Page Enhancement**:
  - Animated gradient background (purple → pink → blue)
  - Three floating decorative circles with staggered animations
  - Enhanced hero section with larger gradient text
  - Improved visual hierarchy and spacing

- **EmotionTabs Redesign**:
  - Emotion-specific gradient colors for each tab
  - Active state with vibrant gradients and shadows
  - Hover animations with scale effects
  - Glass morphism container with backdrop blur
  - Colorful borders matching each emotion

- **Performance Optimizations**:
  - Gradient animations only trigger on hover
  - Sparkle decorations only appear and animate on hover
  - Reduced idle animation load for better performance on lower-powered devices

### Migration from Vercel to Replit (November 2, 2025)
- **Port Configuration**: Updated dev and start scripts to bind to `0.0.0.0:5000` for Replit compatibility
- **Configuration Cleanup**: Removed Vercel-specific settings from `next.config.ts`
- **Workflow**: Configured Replit workflow to run the Next.js development server

## Project Architecture

### Tech Stack
- **Framework**: Next.js 15.3.3 with Turbopack
- **UI Library**: React 18.3.1
- **Component Library**: Radix UI components
- **Styling**: Tailwind CSS with tailwindcss-animate
- **Backend**: Firebase (Authentication & Firestore)
- **AI Integration**: Genkit with Google Genai
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts

### Key Directories
- `/src/app/` - Next.js app router pages and layouts
- `/src/components/` - React components (UI components, forms, charts)
- `/src/firebase/` - Firebase configuration, hooks, and utilities
- `/src/hooks/` - Custom React hooks
- `/src/lib/` - Shared utilities and type definitions
- `/src/ai/` - Genkit AI integration

### Firebase Setup
Firebase credentials are managed via environment variables for security:
- Configuration validation in `src/firebase/config.ts` checks for required env vars
- Missing credentials trigger a warning and return null to prevent crashes
- Initialization in `src/firebase/index.ts` provides clear error messages when credentials are absent

## Environment Variables

### Required for Firebase Features
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` (optional)

## User Preferences
None recorded yet.

## Development Notes
- The app uses TypeScript with build error ignoring enabled for faster development
- ESLint errors are ignored during builds
- Turbopack is enabled for faster development builds
- The app is configured to work with external images from placehold.co, images.unsplash.com, and picsum.photos
