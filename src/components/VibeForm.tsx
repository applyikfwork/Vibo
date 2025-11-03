'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Send, Loader2 } from 'lucide-react';
import { getVibeDiagnosis } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore } from '@/firebase';
import { collection, serverTimestamp, doc } from 'firebase/firestore';
import { addDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { getEmotionByName } from '@/lib/data';
import type { Vibe } from '@/lib/types';
import { addDoc } from 'firebase/firestore';

function PostButton({ pending }: { pending: boolean }) {
  const { pending: formPending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending || formPending} className="font-bold text-base px-6 py-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:scale-105 transition-transform shadow-lg hover:shadow-xl">
      {pending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Send className="mr-2 h-5 w-5" />}
      Post Vibe
    </Button>
  );
}

export function VibeForm({ onPost }: { onPost?: () => void }) {
  const { toast } = useToast();
  const [emoji, setEmoji] = useState('✨');
  const [vibeText, setVibeText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

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
      setEmoji(finalEmoji);

      const newVibeData: Omit<Vibe, 'id'> = {
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
        viewCount: 0,
      };

      // 1. Create the document in the public 'all-vibes' collection to get its ID
      const globalVibesRef = collection(firestore, 'all-vibes');
      const globalVibeDocRef = await addDoc(globalVibesRef, newVibeData);
      const newVibeId = globalVibeDocRef.id;

      // 2. Create the document in the private `users/{uid}/vibes` collection using the SAME ID
      const userVibeDocRef = doc(firestore, 'users', user.uid, 'vibes', newVibeId);
      setDocumentNonBlocking(userVibeDocRef, newVibeData, {});


      toast({
        title: 'Vibe Posted!',
        description: `You shared: "${vibeText}" ${finalEmoji}`,
      });

      setVibeText('');
      setEmoji('✨');
      onPost?.(); // Callback for successful post

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
    <Card className="shadow-2xl shadow-purple-500/10 border-purple-200/30 bg-white/50 backdrop-blur-xl rounded-2xl transition-all duration-300 data-[focused=true]:shadow-purple-500/20" data-focused={isFocused}>
      <form onSubmit={handleSubmit}>
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-start space-x-4">
            <div className="text-5xl sm:text-6xl pt-2 transition-transform duration-300 ease-out hover:scale-110 cursor-pointer animate-pulse-glow">{emoji}</div>
            <Textarea
              name="vibeText"
              placeholder="What's your vibe right now?"
              className="text-base sm:text-lg border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-2 shadow-none min-h-[80px] sm:min-h-[100px] resize-none bg-transparent placeholder:text-gray-500/80"
              value={vibeText}
              onChange={(e) => setVibeText(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              required
              minLength={3}
            />
          </div>
        </CardContent>
        <div className="bg-muted/10 px-4 py-3 flex justify-between items-center border-t border-purple-200/20 rounded-b-2xl">
          <div className="flex items-center space-x-2">
            <Switch id="anonymous-mode" checked={isAnonymous} onCheckedChange={setIsAnonymous} />
            <Label htmlFor="anonymous-mode" className="text-sm font-medium text-muted-foreground">Post Anonymously</Label>
          </div>
          <div className="flex gap-2">
            <PostButton pending={isPosting} />
          </div>
        </div>
      </form>
    </Card>
  );
}
