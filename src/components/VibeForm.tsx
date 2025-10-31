'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { WandSparkles, Send, Loader2 } from 'lucide-react';
import { getVibeDiagnosis } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore } from '@/firebase';
import { collection, serverTimestamp } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { getEmotionByName } from '@/lib/data';

function PostButton({ pending }: { pending: boolean }) {
  const { pending: formPending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending || formPending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
      Post Vibe
    </Button>
  );
}

export function VibeForm() {
  const { toast } = useToast();
  const [emoji, setEmoji] = useState('✨');
  const [vibeText, setVibeText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

  const { user } = useUser();
  const firestore = useFirestore();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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

    setIsPosting(true);

    try {
      const diagnosis = await getVibeDiagnosis(vibeText);
      const emotionDetails = getEmotionByName(diagnosis.emotion);

      if (!emotionDetails) {
        throw new Error('Could not identify a valid emotion for your vibe.');
      }
      
      const finalEmoji = diagnosis.emoji || emotionDetails.emoji;

      const newVibe = {
        userId: user.uid,
        text: vibeText,
        emoji: finalEmoji,
        emotion: diagnosis.emotion,
        backgroundColor: emotionDetails.gradient,
        timestamp: serverTimestamp(),
        author: {
          name: user.displayName || 'Anonymous User',
          avatarUrl: user.photoURL || '',
        },
        isAnonymous: isAnonymous,
      };

      const userVibesRef = collection(firestore, 'users', user.uid, 'vibes');
      const globalVibesRef = collection(firestore, 'all-vibes');

      // Non-blocking writes
      addDocumentNonBlocking(userVibesRef, newVibe);
      addDocumentNonBlocking(globalVibesRef, newVibe);

      toast({
        title: 'Vibe Posted!',
        description: `You shared: "${vibeText}" ${finalEmoji}`,
      });

      // Reset form
      setVibeText('');
      setEmoji('✨');

    } catch (error: any) {
      console.error("Error posting vibe:", error);
      toast({
        variant: 'destructive',
        title: 'Could not post vibe',
        description: error.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <Card className="shadow-xl shadow-primary/5 border-border/20">
      <form onSubmit={handleSubmit}>
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
            {/* The Suggest button is removed as diagnosis is now automatic */}
            <PostButton pending={isPosting} />
          </div>
        </div>
      </form>
    </Card>
  );
}
