'use client';

import { useState } from 'react';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import type { Comment, Reaction } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { formatDistanceToNow } from 'date-fns';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Loader2, MessageCircle, Send, Heart } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from '@/lib/utils';


function CommentCard({ comment }: { comment: Comment }) {
    const authorName = comment.isAnonymous ? 'Anonymous' : comment.author.name;
    const authorImage = comment.isAnonymous ? '' : comment.author.avatarUrl;
    const authorFallback = comment.isAnonymous ? 'A' : authorName.charAt(0).toUpperCase();

    return (
        <div className="flex items-start gap-4 bg-background/5 p-4 rounded-xl border border-border/10">
            <Avatar>
                <AvatarImage src={authorImage} alt={authorName} />
                <AvatarFallback>{authorFallback}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
                <div className="flex items-center gap-2">
                    <p className="font-semibold text-foreground">{authorName}</p>
                    <p className="text-xs text-muted-foreground">
                        {comment.timestamp ? formatDistanceToNow(comment.timestamp.toDate(), { addSuffix: true }) : '...'}
                    </p>
                </div>
                <p className="text-muted-foreground mt-1">{comment.text}</p>
            </div>
        </div>
    );
}

function ReactionItem({ reaction }: { reaction: Reaction }) {
    // Defensive check for author
    const authorName = reaction.author?.name || 'Anonymous';
    const authorImage = reaction.author?.avatarUrl || '';
    const authorFallback = authorName.charAt(0).toUpperCase();

    return (
        <div className="flex items-center gap-4 p-3 rounded-xl bg-background/5 hover:bg-background/10 transition-colors border border-border/10">
            <div className="text-3xl bg-muted/10 p-2 rounded-full">{reaction.emoji}</div>
            <Avatar className="h-10 w-10">
                <AvatarImage src={authorImage} alt={authorName} />
                <AvatarFallback>{authorFallback}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
                 <p className="font-semibold text-sm text-foreground">{authorName}</p>
                 <p className="text-xs text-muted-foreground">
                    Reacted {reaction.timestamp ? formatDistanceToNow(reaction.timestamp.toDate(), { addSuffix: true }) : '...'}
                 </p>
            </div>
        </div>
    );
}


function ListLoading() {
    return (
        <div className="space-y-6">
            <div className="flex gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-3/4" />
                </div>
            </div>
             <div className="flex gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
            </div>
        </div>
    );
}

export function InteractionSection({ vibeId }: { vibeId: string }) {
    const firestore = useFirestore();
    const { user } = useUser();
    const { toast } = useToast();
    const [commentText, setCommentText] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState('comments');


    const commentsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'all-vibes', vibeId, 'comments'), orderBy('timestamp', 'desc'));
    }, [firestore, vibeId]);

    const reactionsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'all-vibes', vibeId, 'reactions'), orderBy('timestamp', 'desc'));
    }, [firestore, vibeId]);

    const { data: comments, isLoading: isLoadingComments } = useCollection<Comment>(commentsQuery);
    const { data: reactions, isLoading: isLoadingReactions } = useCollection<Reaction>(reactionsQuery);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !firestore || !commentText.trim()) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'You must be logged in and write a comment to post.',
            });
            return;
        }

        setIsSubmitting(true);
        const commentsRef = collection(firestore, 'all-vibes', vibeId, 'comments');
        const newComment: Omit<Comment, 'id'> = {
            vibeId,
            userId: user.uid,
            text: commentText,
            timestamp: serverTimestamp(),
            isAnonymous,
            author: {
                name: user.displayName || 'Anonymous',
                avatarUrl: user.photoURL || '',
            },
        };
        
        addDocumentNonBlocking(commentsRef, newComment);

        setCommentText('');
        setIsSubmitting(false);
        toast({ title: 'Comment posted!' });
    };


    return (
        <Card className="bg-white/30 dark:bg-black/30 backdrop-blur-2xl border-white/20 dark:border-black/20 shadow-2xl rounded-2xl">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                    Join the Conversation
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8 p-4 sm:p-6">
                <form onSubmit={handleSubmit} className="space-y-4 p-4 rounded-xl bg-background/20 border border-border/10">
                    <Textarea
                        id="comment-textarea"
                        placeholder="Share your thoughts or send good vibes..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        className="bg-background/50 border-border/20 focus:bg-background/70"
                        required
                    />
                    <div className="flex justify-between items-center">
                         <div className="flex items-center space-x-2">
                            <Switch id="anonymous-comment" checked={isAnonymous} onCheckedChange={setIsAnonymous} />
                            <Label htmlFor="anonymous-comment" className="text-muted-foreground font-medium">Post Anonymously</Label>
                        </div>
                        <Button type="submit" disabled={isSubmitting} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold hover:scale-105 transition-transform">
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                            Post
                        </Button>
                    </div>
                </form>

                <Tabs defaultValue="comments" onValueChange={setActiveTab} className="w-full">
                    <TabsList className="h-auto p-1.5 flex flex-wrap justify-center gap-2 bg-background/20 rounded-xl shadow-inner">
                        <TabsTrigger 
                            value="comments"
                            className={cn("flex-1 px-4 py-2.5 rounded-lg font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2",
                                activeTab === 'comments'
                                    ? 'bg-white dark:bg-zinc-800 text-primary shadow-md'
                                    : 'bg-transparent text-muted-foreground hover:bg-background/30'
                            )}
                        >
                            <MessageCircle className="h-5 w-5" />
                            Comments <span className="ml-1.5 bg-muted/50 text-muted-foreground text-xs font-bold px-2 py-0.5 rounded-full">{comments?.length ?? 0}</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="reactions"
                             className={cn("flex-1 px-4 py-2.5 rounded-lg font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2",
                                activeTab === 'reactions'
                                    ? 'bg-white dark:bg-zinc-800 text-primary shadow-md'
                                    : 'bg-transparent text-muted-foreground hover:bg-background/30'
                            )}
                        >
                           <Heart className="h-5 w-5" />
                           Reactions <span className="ml-1.5 bg-muted/50 text-muted-foreground text-xs font-bold px-2 py-0.5 rounded-full">{reactions?.length ?? 0}</span>
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="comments" className="mt-6">
                        <div className="space-y-4">
                            {isLoadingComments && <ListLoading />}
                            {comments && comments.length > 0 && comments.map(comment => (
                                <CommentCard key={comment.id} comment={comment} />
                            ))}
                            {comments && comments.length === 0 && !isLoadingComments && (
                                <div className="text-center text-muted-foreground py-10">
                                    <MessageCircle className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                                    <p className="font-bold">No Comments Yet</p>
                                    <p className="text-sm">Be the first to share your thoughts!</p>
                                </div>
                            )}
                        </div>
                    </TabsContent>
                    <TabsContent value="reactions" className="mt-6">
                        <div className="space-y-3">
                            {isLoadingReactions && <ListLoading />}
                            {reactions && reactions.length > 0 && reactions.map(reaction => (
                                <ReactionItem key={reaction.id} reaction={reaction} />
                            ))}
                            {reactions && reactions.length === 0 && !isLoadingReactions && (
                                <div className="text-center text-muted-foreground py-10">
                                    <Heart className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                                    <p className="font-bold">No Reactions Yet</p>
                                    <p className="text-sm">Be the first one to react!</p>
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
