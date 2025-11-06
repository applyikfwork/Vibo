import { generatePageMetadata } from '@/lib/seo-config';
import type { Metadata } from 'next';

export const metadata: Metadata = generatePageMetadata('settings');

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
