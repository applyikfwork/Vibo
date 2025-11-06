import { generatePageMetadata } from '@/lib/seo-config';
import type { Metadata } from 'next';

export const metadata: Metadata = generatePageMetadata('history');

export default function HistoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
