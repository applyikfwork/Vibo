'use client';

import { VibeForm } from '@/components/VibeForm';
import { EmotionTabs } from '@/components/EmotionTabs';
import { VibeCard } from '@/components/VibeCard';
import { emotions } from '@/lib/data';
import { useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type { Vibe } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

function VibeListLoading() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-48 w-full rounded-lg" />
        </div>
    );
}


export default function Home() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  const globalVibesQuery = useMemoFirebase(() => {
    // Wait until we have a user and firestore instance
    if (!firestore || !user) return null;
    
    return query(collection(firestore, 'all-vibes'), orderBy('timestamp', 'desc'), limit(30));
  }, [firestore, user]);

  const { data: vibes, isLoading: isLoadingVibes } = useCollection<Vibe>(globalVibesQuery);
  const isLoading = isUserLoading || isLoadingVibes;

  return (
    <div className="relative min-h-screen">
      {/* Animated Gradient Background */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 animate-gradient-shift" />
      
      {/* Floating decorative circles */}
      <div className="fixed top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" />
      <div className="fixed top-40 right-10 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float delay-1000" style={{animationDelay: '2s'}} />
      <div className="fixed bottom-20 left-1/2 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float delay-500" style={{animationDelay: '4s'}} />
      
      <div className="container mx-auto max-w-4xl py-8 px-4 relative z-10">
        <header className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tighter bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent animate-gradient-shift mb-4">
            Feel it. Share it. Find your vibe.
          </h1>
          <p className="text-gray-700 mt-2 text-lg md:text-xl font-medium bg-white/50 backdrop-blur-sm rounded-full px-6 py-2 inline-block shadow-lg">
            ✨ How do you feel right now? ✨
          </p>
        </header>

      <section className="mb-16">
        <VibeForm />
      </section>

      <section>
        <EmotionTabs 
            emotions={emotions} 
            initialVibes={vibes || []}
            renderContent={(filteredVibes) => {
              if (isLoading) {
                return <VibeListLoading />;
              }
              
              if (filteredVibes.length > 0) {
                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredVibes.map((vibe) => (
                          <VibeCard key={vibe.id} vibe={vibe} />
                      ))}
                  </div>
                )
              }

              return (
                <div className="text-center py-16 text-muted-foreground bg-muted/20 rounded-lg">
                  <p className="text-xl mb-2">🌍</p>
                  <p className="font-bold">This is the global feed!</p>
                  <p className="text-sm max-w-md mx-auto">
                    This is where vibes from everyone would appear. For now, only vibes you post will show up here. Try posting one!
                  </p>
                </div>
              )
            }}
        />
      </section>
    </div>
    </div>
  );
}
