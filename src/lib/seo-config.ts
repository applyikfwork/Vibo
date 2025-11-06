import { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://vibeos-lite.repl.co';

export const defaultMetadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'Vibe OS Lite – The Social Network That Feels You | Emotional Wellness Platform',
    template: '%s | Vibe OS Lite'
  },
  description: 'Share your emotions, track your mood, and connect with others on Vibe OS Lite. The leading emotional wellness social platform with AI-powered mood tracking, personalized feeds, and emotional support community.',
};

export const pageMetadata = {
  home: {
    title: 'Vibe OS Lite – Share Emotions, Track Moods, Find Your Vibe',
    description: 'Join Vibe OS Lite, the emotional wellness social platform. Share your feelings, track your mood with AI-powered analytics, connect with a supportive community, and discover personalized content that matches your vibe.',
    keywords: 'emotional wellness, mood tracker, social network, mental health, emotion sharing, AI mood tracking, feelings journal',
  },
  login: {
    title: 'Login to Vibe OS Lite – Start Your Emotional Wellness Journey',
    description: 'Sign in to Vibe OS Lite to track your mood, share emotions, and connect with a supportive community. Access your personalized feed and AI-powered insights.',
    keywords: 'login, sign in, vibe os lite, emotional wellness login, mood tracker login',
  },
  profile: {
    title: 'Your Profile – Vibe OS Lite',
    description: 'View your emotional journey, vibe history, and mood patterns. Track your personal growth and see your contribution to the Vibe OS Lite community.',
    keywords: 'user profile, mood history, emotional journey, vibe journal',
  },
  history: {
    title: 'Mood History & Analytics – Track Your Emotional Journey',
    description: 'Visualize your emotional flow with beautiful mood charts and AI-powered insights. Track patterns, understand your feelings, and monitor your emotional wellness over time.',
    keywords: 'mood history, emotional analytics, mood chart, feelings tracker, emotional patterns, mood visualization',
  },
  settings: {
    title: 'Settings – Customize Your Vibe OS Lite Experience',
    description: 'Manage your account, customize notifications, and personalize your Vibe OS Lite experience. Control your privacy and preferences.',
    keywords: 'settings, account settings, preferences, privacy settings',
  },
};

export function generatePageMetadata(page: keyof typeof pageMetadata): Metadata {
  const meta = pageMetadata[page];
  
  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords.split(', '),
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: `${baseUrl}${page === 'home' ? '' : `/${page}`}`,
      siteName: 'Vibe OS Lite',
      type: 'website',
      images: [
        {
          url: `${baseUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: 'Vibe OS Lite',
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.description,
      images: [`${baseUrl}/og-image.png`],
    },
    alternates: {
      canonical: `${baseUrl}${page === 'home' ? '' : `/${page}`}`,
    },
  };
}
