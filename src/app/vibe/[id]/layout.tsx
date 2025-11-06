import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://vibeos-lite.repl.co';
  
  return {
    title: 'Vibe Post',
    description: 'View and interact with this emotional expression on Vibe OS Lite.',
    alternates: {
      canonical: `${baseUrl}/vibe/${params.id}`,
    },
    openGraph: {
      title: 'Vibe Post | Vibe OS Lite',
      description: 'View and interact with this emotional expression on Vibe OS Lite.',
      url: `${baseUrl}/vibe/${params.id}`,
      type: 'article',
    },
  };
}

export default function VibeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
