'use client';

import { VibeForm } from '@/components/VibeForm';
import { EmotionTabs } from '@/components/EmotionTabs';
import { VibeCard } from '@/components/VibeCard';
import { vibes, emotions } from '@/lib/data';

export default function Home() {
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
            initialVibes={vibes}
            renderContent={(filteredVibes) => (
              filteredVibes.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredVibes.map((vibe) => (
                        <VibeCard key={vibe.id} vibe={vibe} />
                    ))}
                </div>
              ) : (
                <div className="text-center py-16 text-muted-foreground">
                  <p className="text-xl mb-2">🍃</p>
                  <p>No vibes here... yet.</p>
                  <p className="text-sm">Be the first to share this feeling!</p>
                </div>
              )
            )}
        />
      </section>
    </div>
  );
}
