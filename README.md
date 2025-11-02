# Vibo

A Next.js application with Firebase integration, now running on Replit.

## Getting Started

The development server is configured to run on port 5000:

```bash
npm run dev
```

Open your browser to see the application.

## Firebase Configuration

This app requires Firebase credentials to enable authentication and database features. Add the following environment variables in Replit Secrets:

- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` (optional)

You can find these values in your Firebase Console under **Project Settings > General > Your apps**.

**Note:** The app will run without these credentials, but Firebase features will be disabled until you add them.

## Project Structure

- `src/app/` - Next.js app directory with pages and layouts
- `src/components/` - React components
- `src/firebase/` - Firebase configuration and utilities
- `src/hooks/` - Custom React hooks
- `src/lib/` - Utility functions and shared code
