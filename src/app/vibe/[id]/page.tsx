'use client';

import { VibeCard } from '@/components/VibeCard';
import { CommentSection } from '@/components/CommentSection';
import { useDoc, useMemoFirebase } from '@/firebase';
import { useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Vibe } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

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

export default function VibeDetailPage({ params }: { params: { id: string } }) {
    const firestore = useFirestore();
    const vibeRef = useMemoFirebase(() => {
        if (!firestore) return null;
        return doc(firestore, 'all-vibes', params.id);
    }, [firestore, params.id]);

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
            <div className="mb-8">
                <VibeCard vibe={vibe} isLink={false} />
            </div>
            
            <CommentSection vibeId={vibe.id} />
        </div>
    );
}

    