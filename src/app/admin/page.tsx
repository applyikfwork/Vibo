'use client';

import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import type { Vibe } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { addFakeComment, addFakeReaction } from './actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2, MessageSquarePlus, SmilePlus, Ban } from 'lucide-react';

const ADMIN_EMAIL = 'xyzapplywork@gmail.com';

function AdminLoading() {
    return (
        <div className="container mx-auto max-w-4xl py-8 px-4">
            <header className="mb-8">
                <Skeleton className="h-10 w-1/3" />
                <Skeleton className="h-5 w-2/3 mt-2" />
            </header>
            <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                    <Card key={i}>
                        <CardContent className="flex justify-between items-center p-4">
                            <div className='w-2/3'>
                                <Skeleton className="h-6 w-full" />
                                <Skeleton className="h-4 w-1/2 mt-2" />
                            </div>
                            <div className="flex gap-2">
                                <Skeleton className="h-10 w-24" />
                                <Skeleton className="h-10 w-24" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

function VibeRow({ vibe }: { vibe: Vibe }) {
    const { toast } = useToast();
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [isSubmittingReaction, setIsSubmittingReaction] = useState(false);

    const handleFakeComment = async () => {
        setIsSubmittingComment(true);
        const result = await addFakeComment(vibe.id);
        if (result.success) {
            toast({ title: 'Success', description: result.message });
        } else {
            toast({ variant: 'destructive', title: 'Error', description: (result as any).message });
        }
        setIsSubmittingComment(false);
    };

    const handleFakeReaction = async () => {
        setIsSubmittingReaction(true);
        const result = await addFakeReaction(vibe.id);
        if (result.success) {
            toast({ title: 'Success', description: result.message });
        } else {
            toast({ variant: 'destructive', title: 'Error', description: (result as any).message });
        }
        setIsSubmittingReaction(false);
    };

    return (
        <Card>
            <CardContent className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 gap-4">
                <div>
                    <p className="font-semibold line-clamp-1">"{vibe.text}"</p>
                    <p className="text-sm text-muted-foreground">by {vibe.author.name} - {vibe.emotion} {vibe.emoji}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                    <Button size="sm" onClick={handleFakeComment} disabled={isSubmittingComment}>
                        {isSubmittingComment ? <Loader2 className="animate-spin" /> : <MessageSquarePlus />}
                        <span className="ml-2 hidden md:inline">Fake Comment</span>
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleFakeReaction} disabled={isSubmittingReaction}>
                        {isSubmittingReaction ? <Loader2 className="animate-spin" /> : <SmilePlus />}
                         <span className="ml-2 hidden md:inline">Fake Reaction</span>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

export default function AdminPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const router = useRouter();

    const vibesQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'all-vibes'), orderBy('timestamp', 'desc'), limit(50));
    }, [firestore]);

    const { data: vibes, isLoading: isLoadingVibes } = useCollection<Vibe>(vibesQuery);

    useEffect(() => {
        if (!isUserLoading && user?.email !== ADMIN_EMAIL) {
            router.push('/');
        }
    }, [user, isUserLoading, router]);

    if (isUserLoading || user?.email !== ADMIN_EMAIL) {
        return <AdminLoading />;
    }

    return (
        <div className="container mx-auto max-w-4xl py-8 px-4">
            <header className="mb-8">
                <h1 className="text-4xl font-bold tracking-tight">Admin Panel</h1>
                <p className="text-muted-foreground mt-2">Manage vibes and stimulate engagement.</p>
            </header>

            {isLoadingVibes && (
                <div className="space-y-4">
                     {[...Array(5)].map((_, i) => (
                        <Card key={i}>
                            <CardContent className="flex justify-between items-center p-4">
                                <div className='w-2/3'>
                                    <Skeleton className="h-6 w-full" />
                                    <Skeleton className="h-4 w-1/2 mt-2" />
                                </div>
                                <div className="flex gap-2">
                                    <Skeleton className="h-10 w-24" />
                                    <Skeleton className="h-10 w-24" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {!isLoadingVibes && vibes && vibes.length > 0 && (
                <div className="space-y-4">
                    {vibes.map(vibe => (
                        <VibeRow key={vibe.id} vibe={vibe} />
                    ))}
                </div>
            )}

            {!isLoadingVibes && (!vibes || vibes.length === 0) && (
                <Card className="text-center py-16">
                    <CardHeader>
                        <CardTitle>No vibes yet</CardTitle>
                        <CardDescription>Post a vibe on the main page to see it here.</CardDescription>
                    </CardHeader>
                </Card>
            )}
        </div>
    );
}