'use client';

import { useState, useMemo } from 'react';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import type { Comment } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { formatDistanceToNow } from 'date-fns';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Loader2, Send } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { useToast } from '@/hooks/use-toast';

function CommentCard({ comment }: { comment: Comment }) {
    const authorName = comment.isAnonymous ? 'Anonymous' : comment.author.name;
    const authorImage = comment.isAnonymous ? '' : comment.author.avatarUrl;
    const authorFallback = comment.isAnonymous ? 'A' : authorName.charAt(0).toUpperCase();

    return (
        <div className="flex items-start gap-4">
            <Avatar>
                <AvatarImage src={authorImage} alt={authorName} />
                <AvatarFallback>{authorFallback}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
                <div className="flex items-center gap-2">
                    <p className="font-semibold">{authorName}</p>
                    <p className="text-xs text-muted-foreground">
                        {comment.timestamp ? formatDistanceToNow(comment.timestamp.toDate(), { addSuffix: true }) : '...'}
                    </p>
                </div>
                <p className="text-muted-foreground">{comment.text}</p>
            </div>
        </div>
    );
}

function CommentListLoading() {
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

export function CommentSection({ vibeId }: { vibeId: string }) {
    const firestore = useFirestore();
    const { user } = useUser();
    const { toast } = useToast();
    const [commentText, setCommentText] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const commentsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'all-vibes', vibeId, 'comments'), orderBy('timestamp', 'desc'));
    }, [firestore, vibeId]);

    const { data: comments, isLoading: isLoadingComments } = useCollection<Comment>(commentsQuery);

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
        const newComment = {
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
        <Card>
            <CardHeader>
                <CardTitle>Vibe Chat</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Textarea
                        id="comment-textarea"
                        placeholder="Share your thoughts or send good vibes..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        required
                    />
                    <div className="flex justify-between items-center">
                         <div className="flex items-center space-x-2">
                            <Switch id="anonymous-comment" checked={isAnonymous} onCheckedChange={setIsAnonymous} />
                            <Label htmlFor="anonymous-comment">Comment Anonymously</Label>
                        </div>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                            Post
                        </Button>
                    </div>
                </form>

                <div className="space-y-6">
                    {isLoadingComments && <CommentListLoading />}
                    {comments && comments.length > 0 && comments.map(comment => (
                        <CommentCard key={comment.id} comment={comment} />
                    ))}
                     {comments && comments.length === 0 && !isLoadingComments && (
                        <p className="text-center text-muted-foreground">Be the first to leave a comment!</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

    