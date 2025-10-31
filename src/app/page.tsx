'use client';

import { VibeForm } from '@/components/VibeForm';
import { EmotionTabs } from '@/components/EmotionTabs';
import { VibeCard } from '@/components/VibeCard';
import { emotions } from '@/lib/data';
import { useCollection, useMemoFirebase } from '@/firebase';
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

  // Note: Firestore doesn't allow querying across all subcollections with the same name (e.g., all 'vibes' across all 'users')
  // out of the box with client-side SDKs due to security and performance reasons. 
  // To show a global feed, you'd typically have a separate top-level 'vibes' collection where all public vibes are duplicated.
  // For this prototype, we'll just show a message.
  const globalVibesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    // This query would point to a global collection if it existed.
    // For now, we'll create a dummy query that returns nothing to illustrate the point.
    return query(collection(firestore, 'all-vibes'), orderBy('timestamp', 'desc'), limit(30));
  }, [firestore]);

  const { data: vibes, isLoading } = useCollection<Vibe>(globalVibesQuery);

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <header className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent">
          Feel it. Share it. Find your vibe.
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          How do you feel right now?
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
  );
}
