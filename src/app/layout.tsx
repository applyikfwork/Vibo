import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/layout/Header';
import { FirebaseClientProvider } from '@/firebase';
import AuthManager from '@/components/AuthManager';
import { StructuredData } from '@/components/seo/StructuredData';
import { RewardsStatsProvider } from '@/contexts/RewardsStatsContext';

const inter = Inter({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://vibeos-lite.repl.co'),
  title: {
    default: 'Vibe OS Lite – The Social Network That Feels You | Emotional Wellness Platform',
    template: '%s | Vibe OS Lite'
  },
  description: 'Share your emotions, track your mood, and connect with others on Vibe OS Lite. The leading emotional wellness social platform with AI-powered mood tracking, personalized feeds, and emotional support community. Feel it. Share it. Find your vibe.',
  keywords: [
    'emotional wellness',
    'mood tracker',
    'mental health',
    'social network',
    'emotion sharing',
    'AI mood tracking',
    'feelings journal',
    'emotional support',
    'mood history',
    'wellness community',
    'mental wellbeing',
    'emotional health',
    'vibe sharing',
    'mood analysis',
    'personalized feed'
  ],
  authors: [{ name: 'Vibe OS Lite Team' }],
  creator: 'Vibe OS Lite',
  publisher: 'Vibe OS Lite',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'Vibe OS Lite',
    title: 'Vibe OS Lite – The Social Network That Feels You',
    description: 'Share your emotions, track your mood, and connect with others. AI-powered emotional wellness platform with mood tracking, personalized feeds, and supportive community.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Vibe OS Lite - Emotional Wellness Social Platform',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vibe OS Lite – The Social Network That Feels You',
    description: 'Share emotions, track moods, find your vibe. AI-powered emotional wellness platform.',
    images: ['/og-image.png'],
    creator: '@vibeos',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: '/',
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
  },
  category: 'Social Network',
  classification: 'Emotional Wellness, Mental Health, Social Platform',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head>
        <StructuredData />
      </head>
      <body className={cn('min-h-screen bg-background antialiased', inter.className)}>
        <FirebaseClientProvider>
          <AuthManager>
            <RewardsStatsProvider>
              <div className="relative flex min-h-dvh flex-col">
                <Header />
                <main className="flex-1">{children}</main>
              </div>
              <Toaster />
            </RewardsStatsProvider>
          </AuthManager>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
