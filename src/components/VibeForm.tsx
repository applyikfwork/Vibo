'use client';

import { useState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Send, Loader2, Mic, Type } from 'lucide-react';
import { getVibeDiagnosis } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, setDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase';
import { collection, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { getEmotionByName } from '@/lib/data';
import type { Vibe, EmotionCategory, Location } from '@/lib/types';
import { VoiceRecorder } from '@/components/VoiceRecorder';
import { uploadVoiceNote } from '@/lib/firebase-storage';
import { generateGeohash } from '@/lib/geo-utils';
import { useGamification } from '@/hooks/useGamification';

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
  const [inputMode, setInputMode] = useState<'text' | 'voice'>('text');
  const [userLocation, setUserLocation] = useState<Location | undefined>();

  const { user } = useUser();
  const firestore = useFirestore();
  const { awardPostReward } = useGamification();

  useEffect(() => {
    if (!user || !firestore) return;
    
    const loadLocation = async () => {
      try {
        const userDoc = await getDoc(doc(firestore, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          if (data.enableLocationSharing && data.location) {
            setUserLocation(data.location as Location);
          }
        }
      } catch (error) {
        console.error('Error loading location:', error);
      }
    };
    
    loadLocation();
  }, [user, firestore]);

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

      const locationData = userLocation
        ? {
            ...userLocation,
            geohash: generateGeohash(userLocation.lat, userLocation.lng),
          }
        : undefined;

      const newVibeData = {
        userId: user.uid,
        text: vibeText,
        emoji: finalEmoji,
        emotion: diagnosis.emotion,
        backgroundColor: emotionDetails.gradient,
        timestamp: serverTimestamp() as any,
        author: {
          name: user.displayName || 'Anonymous User',
          avatarUrl: user.photoURL || '',
        },
        isAnonymous: isAnonymous,
        viewCount: 0,
        ...(locationData && { location: locationData }),
      };

      // 1. Create the document in the public 'all-vibes' collection and get its ref
      const globalVibesRef = collection(firestore, 'all-vibes');
      const globalVibeDocRef = await addDocumentNonBlocking(globalVibesRef, newVibeData);
      
      // 2. If the public doc was created, save a copy to the private user collection with the SAME ID
      if (globalVibeDocRef) {
        const newVibeId = globalVibeDocRef.id;
        const userVibeDocRef = doc(firestore, 'users', user.uid, 'vibes', newVibeId);
        setDocumentNonBlocking(userVibeDocRef, newVibeData, {});
      } else {
        throw new Error("Failed to create the vibe in the public feed.");
      }

      toast({
        title: 'Vibe Posted!',
        description: `You shared: "${vibeText}" ${finalEmoji}`,
      });

      awardPostReward(false);

      setVibeText('');
      setEmoji('✨');
      if (onPost) onPost();

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

  const handleVoiceRecording = async (audioBlob: Blob, duration: number, selectedEmotion: EmotionCategory) => {
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'Not signed in', description: 'You must be signed in to post a voice vibe.' });
      return;
    }

    setIsPosting(true);

    try {
      const emotionDetails = getEmotionByName(selectedEmotion);
      if (!emotionDetails) {
        throw new Error('Could not identify a valid emotion.');
      }

      // Create a temporary vibe ID
      const tempVibeId = `temp_${Date.now()}`;
      
      // Upload audio to Firebase Storage
      const audioUrl = await uploadVoiceNote(user.uid, audioBlob, tempVibeId);

      const locationData = userLocation
        ? {
            ...userLocation,
            geohash: generateGeohash(userLocation.lat, userLocation.lng),
          }
        : undefined;

      const newVibeData = {
        userId: user.uid,
        text: `🎙️ Voice Vibe - ${selectedEmotion}`,
        emoji: emotionDetails.emoji,
        emotion: selectedEmotion,
        backgroundColor: emotionDetails.gradient,
        timestamp: serverTimestamp() as any,
        author: {
          name: user.displayName || 'Anonymous User',
          avatarUrl: user.photoURL || '',
        },
        isAnonymous: isAnonymous,
        viewCount: 0,
        isVoiceNote: true,
        audioUrl: audioUrl,
        audioDuration: duration,
        ...(locationData && { location: locationData }),
      };

      const globalVibesRef = collection(firestore, 'all-vibes');
      const globalVibeDocRef = await addDocumentNonBlocking(globalVibesRef, newVibeData);
      
      if (globalVibeDocRef) {
        const newVibeId = globalVibeDocRef.id;
        const userVibeDocRef = doc(firestore, 'users', user.uid, 'vibes', newVibeId);
        setDocumentNonBlocking(userVibeDocRef, newVibeData, {});
      }

      toast({
        title: '🎙️ Voice Vibe Posted!',
        description: `Your ${duration}s voice note is now live!`,
      });

      awardPostReward(true);

      setInputMode('text');
      if (onPost) onPost();

    } catch (error: any) {
      console.error("Error posting voice vibe:", error);
      toast({
        variant: 'destructive',
        title: 'Could not post voice vibe',
        description: error.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <Card className="shadow-2xl shadow-purple-500/10 border-purple-200/30 bg-white/50 backdrop-blur-xl rounded-2xl transition-all duration-300 data-[focused=true]:shadow-purple-500/20" data-focused={isFocused}>
      <CardContent className="p-4 sm:p-5">
        <Tabs value={inputMode} onValueChange={(value) => setInputMode(value as 'text' | 'voice')}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="text" className="flex items-center gap-2">
              <Type className="h-4 w-4" />
              Text Vibe
            </TabsTrigger>
            <TabsTrigger value="voice" className="flex items-center gap-2">
              <Mic className="h-4 w-4" />
              🎙️ Voice Vibe
            </TabsTrigger>
          </TabsList>

          <TabsContent value="text">
            <form onSubmit={handleSubmit}>
              <div className="flex items-start space-x-4 mb-4">
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
              <div className="bg-muted/10 px-4 py-3 flex justify-between items-center border-t border-purple-200/20 rounded-b-lg">
                <div className="flex items-center space-x-2">
                  <Switch id="anonymous-mode" checked={isAnonymous} onCheckedChange={setIsAnonymous} />
                  <Label htmlFor="anonymous-mode" className="text-sm font-medium text-muted-foreground">Post Anonymously</Label>
                </div>
                <div className="flex gap-2">
                  <PostButton pending={isPosting} />
                </div>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="voice">
            <VoiceRecorder
              onRecordingComplete={handleVoiceRecording}
              onCancel={() => setInputMode('text')}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}