'use client';

import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, orderBy, limit, runTransaction, doc, increment, serverTimestamp, updateDoc } from 'firebase/firestore';
import type { Author, Vibe } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, MessageSquarePlus, SmilePlus, Eye } from 'lucide-react';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';


const ADMIN_EMAIL = 'xyzapplywork@gmail.com';

const fakeComments = [
    "This is such a mood!",
    "I feel this on a spiritual level.",
    "Sending good vibes your way! ✨",
    "Totally get that.",
    "Thanks for sharing this!",
    "This is so relatable.",
    "What a great post.",
    "Love this energy.",
    "Hope you have a great day!",
    "This made me smile.",
];

const fakeReactions = ['🤗', '🙏', '❤️', '✨', '🔥', '💯', '🙌'];

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
    const firestore = useFirestore();
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [isReactViewsDialogOpen, setReactViewsDialogOpen] = useState(false);
    const [isViewsDialogOpen, setViewsDialogOpen] = useState(false);
    const [amount, setAmount] = useState(10);


    const getFakeAuthor = (): Author => ({
        name: 'Anonymous',
        avatarUrl: '',
    });

    const handleFakeComment = () => {
        if (!firestore) return;
        setIsSubmittingComment(true);
        try {
            const commentText = fakeComments[Math.floor(Math.random() * fakeComments.length)];
            const author = getFakeAuthor();
            const commentRef = collection(firestore, 'all-vibes', vibe.id, 'comments');
            
            addDocumentNonBlocking(commentRef, {
                vibeId: vibe.id,
                userId: `fake_user_${Date.now()}`, // Fake user ID
                text: commentText,
                timestamp: serverTimestamp(),
                isAnonymous: true,
                author,
            });

            toast({ title: 'Success', description: `Added comment: "${commentText}"` });
        } catch (e: any) {
             toast({ variant: 'destructive', title: 'Error', description: e.message || "Could not add comment." });
        }
        setIsSubmittingComment(false);
    };

    const handleAddReactAndView = async () => {
        if (!firestore) return;
        setIsSubmitting(true);
        try {
            await runTransaction(firestore, async (transaction) => {
                const reactionEmoji = fakeReactions[Math.floor(Math.random() * fakeReactions.length)];
                const reactionRef = doc(collection(firestore, 'all-vibes', vibe.id, 'reactions'));
                
                transaction.set(reactionRef, {
                    vibeId: vibe.id,
                    userId: `fake_user_${Date.now()}`,
                    emoji: reactionEmoji,
                    timestamp: serverTimestamp(),
                });

                const vibeRef = doc(firestore, 'all-vibes', vibe.id);
                transaction.update(vibeRef, {
                    viewCount: increment(amount)
                });
            });

            toast({ title: 'Success', description: `Added a fake reaction and ${amount} views.` });
            setReactViewsDialogOpen(false);
        } catch (e: any) {
            const permissionError = new FirestorePermissionError({
                path: `all-vibes/${vibe.id}`,
                operation: 'write', 
                requestResourceData: { reaction: '...', viewCount: amount },
              });
            errorEmitter.emit('permission-error', permissionError);
        }
        setIsSubmitting(false);
    };

    const handleAddViews = () => {
        if (!firestore) return;
        setIsSubmitting(true);
        const vibeRef = doc(firestore, 'all-vibes', vibe.id);
        const dataToUpdate = { viewCount: increment(amount) };

        updateDoc(vibeRef, dataToUpdate)
            .then(() => {
                toast({ title: 'Success', description: `Added ${amount} views.` });
                setViewsDialogOpen(false);
            })
            .catch(async (serverError) => {
                const permissionError = new FirestorePermissionError({
                    path: vibeRef.path,
                    operation: 'update',
                    requestResourceData: dataToUpdate,
                });
                errorEmitter.emit('permission-error', permissionError);
            })
            .finally(() => {
                setIsSubmitting(false);
            });
    };


    return (
        <>
            <Card>
                <CardContent className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 gap-4">
                    <div>
                        <p className="font-semibold line-clamp-1">"{vibe.text}"</p>
                        <p className="text-sm text-muted-foreground">by {vibe.author.name} - {vibe.emotion} {vibe.emoji}</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                        <Button size="sm" onClick={handleFakeComment} disabled={isSubmittingComment || isSubmitting}>
                            {isSubmittingComment ? <Loader2 className="animate-spin" /> : <MessageSquarePlus />}
                            <span className="ml-2 hidden md:inline">Fake Comment</span>
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setReactViewsDialogOpen(true)} disabled={isSubmitting}>
                           <SmilePlus /><Eye className="ml-1"/>
                           <span className="ml-2 hidden md:inline">Fake React & Views</span>
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setViewsDialogOpen(true)} disabled={isSubmitting}>
                           <Eye className="ml-1"/>
                           <span className="ml-2 hidden md:inline">Fake Views</span>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isReactViewsDialogOpen} onOpenChange={setReactViewsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Fake Reaction & Views</DialogTitle>
                        <DialogDescription>
                            This will add one random reaction and a specified number of views to the vibe.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="react-views-amount" className="text-right">View Count</Label>
                            <Input
                                id="react-views-amount"
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(Number(e.target.value))}
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                         <DialogClose asChild>
                            <Button type="button" variant="secondary">Cancel</Button>
                         </DialogClose>
                        <Button onClick={handleAddReactAndView} disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="animate-spin" /> : 'Add Engagement'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isViewsDialogOpen} onOpenChange={setViewsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Fake Views</DialogTitle>
                         <DialogDescription>
                            This will increase the view count for the vibe.
                        </DialogDescription>
                    </DialogHeader>
                     <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="views-amount" className="text-right">View Count</Label>
                            <Input
                                id="views-amount"
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(Number(e.target.value))}
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                         <DialogClose asChild>
                            <Button type="button" variant="secondary">Cancel</Button>
                        </DialogClose>
                        <Button onClick={handleAddViews} disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="animate-spin" /> : 'Add Views'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
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

    if (isUserLoading || !user || user.email !== ADMIN_EMAIL) {
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
