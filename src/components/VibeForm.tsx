'use client';

import { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Sparkles, Send, Loader2 } from 'lucide-react';
import { getEmojiSuggestion, FormState } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { getEmotionByName } from '@/lib/data';

function SuggestButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="outline" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
      Suggest Emoji
    </Button>
  );
}

export function VibeForm() {
    const initialState: FormState = { message: '' };
    const [state, formAction] = useActionState(getEmojiSuggestion, initialState);
    const { toast } = useToast();
    const [emoji, setEmoji] = useState('✨');
    const [vibeText, setVibeText] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);

    const { user } = useUser();
    const firestore = useFirestore();

    useEffect(() => {
        if (state.message && state.error) {
            toast({
                variant: 'destructive',
                title: 'Oops!',
                description: state.message,
            });
        }
        if (state.emoji) {
            setEmoji(state.emoji);
            toast({ title: 'New emoji suggested!', description: `We think ${state.emoji} fits your vibe.` });
        }
    }, [state, toast]);

    const handlePostVibe = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (!user || !firestore) {
            toast({ variant: 'destructive', title: 'Not signed in', description: 'You must be signed in to post a vibe.' });
            return;
        }

        if (vibeText.trim().length < 3) {
            toast({
                variant: 'destructive',
                title: 'Too short!',
                description: 'Your vibe needs to be at least 3 characters long.',
            });
            return;
        }

        // For this prototype, we'll just pick a random emotion.
        // A real app would use another Genkit flow to determine this from text.
        const randomEmotion = ['Happy', 'Sad', 'Chill', 'Motivated', 'Lonely'][Math.floor(Math.random() * 5)];
        const emotionDetails = getEmotionByName(randomEmotion);
        
        const newVibe = {
            userId: user.uid,
            text: vibeText,
            emoji: emoji,
            emotion: randomEmotion,
            backgroundColor: 'bg-gradient-to-br ' + emotionDetails.gradient,
            timestamp: serverTimestamp(),
            // User details are denormalized for easier display on a global feed
            author: {
                name: user.displayName || 'Anonymous User',
                avatarUrl: user.photoURL || '',
            },
            isAnonymous: isAnonymous,
        };

        // We'll write to both the user-specific collection and a global collection
        // to facilitate both a user's private history and a public feed.
        const userVibesRef = collection(firestore, 'users', user.uid, 'vibes');
        const globalVibesRef = collection(firestore, 'all-vibes');

        addDocumentNonBlocking(userVibesRef, newVibe);
        addDocumentNonBlocking(globalVibesRef, newVibe);
        
        toast({
            title: 'Vibe Posted!',
            description: `You shared: "${vibeText}" ${emoji}`,
        });

        setVibeText('');
        setEmoji('✨');
    };

    return (
        <Card className="shadow-xl shadow-primary/5 border-border/20">
            <form action={formAction}>
                <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                        <div className="text-5xl pt-2 transition-transform duration-200 hover:scale-110 cursor-pointer">{emoji}</div>
                        <Textarea
                            name="vibeText"
                            placeholder="Type your current feeling, thought, or mood..."
                            className="text-base border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-2 shadow-none min-h-[80px] resize-none bg-transparent"
                            value={vibeText}
                            onChange={(e) => setVibeText(e.target.value)}
                            required
                            minLength={3}
                        />
                    </div>
                </CardContent>
                <div className="bg-muted/30 px-4 py-3 flex justify-between items-center border-t">
                    <div className="flex items-center space-x-2">
                        <Switch id="anonymous-mode" checked={isAnonymous} onCheckedChange={setIsAnonymous} />
                        <Label htmlFor="anonymous-mode" className="text-sm text-muted-foreground">Post Anonymously</Label>
                    </div>
                    <div className="flex gap-2">
                        <SuggestButton />
                        <Button onClick={handlePostVibe} disabled={!user || !firestore}>
                            <Send className="mr-2 h-4 w-4" />
                            Post Vibe
                        </Button>
                    </div>
                </div>
            </form>
        </Card>
    );
}
