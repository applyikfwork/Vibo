import { generatePageMetadata } from '@/lib/seo-config';
import type { Metadata } from 'next';

export const metadata: Metadata = generatePageMetadata('profile');

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
