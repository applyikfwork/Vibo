'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function GeoVibePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/geovibe/enhanced');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-4">
        <div className="text-6xl animate-pulse">🌍</div>
        <p className="text-xl font-semibold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
          Redirecting to Enhanced GeoVibe...
        </p>
      </div>
    </div>
  );
}
