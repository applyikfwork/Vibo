# Vibo - Project Documentation

## Overview
Vibo is a Next.js 15 application with Firebase integration for authentication and data storage. The app was migrated from Vercel to Replit on November 2, 2025.

## Recent Changes

### Migration from Vercel to Replit (November 2, 2025)
- **Port Configuration**: Updated dev and start scripts to bind to `0.0.0.0:5000` for Replit compatibility
- **Security Improvement**: Moved hardcoded Firebase credentials to environment variables
- **Configuration Cleanup**: Removed Vercel-specific settings from `next.config.ts`
- **Firebase Validation**: Added validation logic to gracefully handle missing Firebase credentials
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
