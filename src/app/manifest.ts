import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Vibe OS Lite - Emotional Wellness Social Platform',
    short_name: 'Vibe OS Lite',
    description: 'Share your emotions, track your mood, and connect with others. AI-powered emotional wellness platform.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#667eea',
    orientation: 'portrait',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    categories: ['social', 'health', 'lifestyle', 'wellness'],
    screenshots: [
      {
        src: '/screenshot-1.png',
        sizes: '1280x720',
        type: 'image/png',
        form_factor: 'wide',
      },
      {
        src: '/screenshot-2.png',
        sizes: '750x1334',
        type: 'image/png',
        form_factor: 'narrow',
      },
    ],
  };
}
