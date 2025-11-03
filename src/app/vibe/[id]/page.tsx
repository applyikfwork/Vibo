'use client';

import { use, useEffect, useState } from 'react';
import { VibeCard } from '@/components/VibeCard';
import { InteractionSection } from '@/components/InteractionSection';
import { useDoc, useMemoFirebase } from '@/firebase';
import { useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Vibe } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye } from 'lucide-react';

function VibeDetailLoading() {
    return (
        <div className="space-y-8">
            <Skeleton className="h-[380px] w-full rounded-3xl" />
            <div className="space-y-4">
                <Skeleton className="h-8 w-1/4" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
        </div>
    );
}

function ViewCounter() {
    const [viewCount, setViewCount] = useState(1);

    useEffect(() => {
        const baseViewers = Math.floor(Math.random() * 5) + 1;
        setViewCount(baseViewers);

        const interval = setInterval(() => {
            const change = Math.random() > 0.5 ? 1 : -1;
            setViewCount(prev => Math.max(1, prev + change));
        }, 3000 + Math.random() * 2000); // Vary interval slightly

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse-glow">
            <Eye className="h-5 w-5" />
            <span className="font-semibold">{viewCount}</span>
            <span>{viewCount === 1 ? 'person is viewing' : 'people are viewing'}</span>
        </div>
    );
}

export default function VibeDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const firestore = useFirestore();
    const { id } = use(params);

    const vibeRef = useMemoFirebase(() => {
        if (!firestore) return null;
        return doc(firestore, 'all-vibes', id);
    }, [firestore, id]);

    const { data: vibe, isLoading: isLoadingVibe } = useDoc<Vibe>(vibeRef);

    if (isLoadingVibe) {
        return (
            <div className="container mx-auto max-w-2xl py-8 px-4">
                <VibeDetailLoading />
            </div>
        );
    }

    if (!vibe) {
        return (
            <div className="container mx-auto max-w-2xl py-8 px-4 text-center">
                <h1 className="text-2xl font-bold">Vibe not found</h1>
                <p className="text-muted-foreground">This vibe may have been deleted or never existed.</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-2xl py-8 px-4">
            <div className="mb-6">
                <VibeCard vibe={vibe} isLink={false} />
            </div>

            <div className="flex justify-end mb-6">
                <ViewCounter />
            </div>
            
            <InteractionSection vibeId={vibe.id} />
        </div>
    );
}
