import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/layout/Header';
import { FirebaseClientProvider } from '@/firebase';
import AuthManager from '@/components/AuthManager';

const inter = Inter({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Vibee OS Lite – The social network that feels you.',
  description: 'Feel it. Share it. Find your vibe.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className={cn('min-h-screen bg-background antialiased', inter.className)}>
        <FirebaseClientProvider>
          <AuthManager>
            <div className="relative flex min-h-dvh flex-col">
              <Header />
              <main className="flex-1">{children}</main>
            </div>
            <Toaster />
          </AuthManager>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
