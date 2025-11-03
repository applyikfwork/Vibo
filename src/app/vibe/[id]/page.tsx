'use client';

import { use, useEffect } from 'react';
import { VibeCard } from '@/components/VibeCard';
import { InteractionSection } from '@/components/InteractionSection';
import { useDoc, useMemoFirebase, useFirestore, updateDocumentNonBlocking } from '@/firebase';
import { doc, increment } from 'firebase/firestore';
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

export default function VibeDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const firestore = useFirestore();
    const { id } = use(params);

    const vibeRef = useMemoFirebase(() => {
        if (!firestore) return null;
        return doc(firestore, 'all-vibes', id);
    }, [firestore, id]);

    const { data: vibe, isLoading: isLoadingVibe } = useDoc<Vibe>(vibeRef);

    useEffect(() => {
        if (vibeRef) {
            updateDocumentNonBlocking(vibeRef, { viewCount: increment(1) });
        }
    }, [vibeRef]);

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
                <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse-glow">
                    <Eye className="h-5 w-5" />
                    <span className="font-semibold">{vibe.viewCount ?? 1}</span>
                    <span>{vibe.viewCount === 1 ? 'view' : 'views'}</span>
                </div>
            </div>
            
            <InteractionSection vibeId={vibe.id} />
        </div>
    );
}
