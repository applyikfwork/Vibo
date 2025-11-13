'use client';

import { useState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Send, Loader2, Mic, Type, Image as ImageIcon, X } from 'lucide-react';
import { getVibeDiagnosis } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, setDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase';
import { collection, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { getEmotionByName } from '@/lib/data';
import type { Vibe, EmotionCategory, Location } from '@/lib/types';
import { VoiceRecorder } from '@/components/VoiceRecorder';
import { uploadVoiceNote, uploadVibeImage } from '@/lib/firebase-storage';
import { generateGeohash } from '@/lib/geo-utils';
import { useGamification } from '@/hooks/useGamification';
import { compressImage, formatFileSize, cleanupPreviewUrl, type CompressedImage } from '@/lib/image-processing';

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
  const [selectedImage, setSelectedImage] = useState<CompressedImage | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

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

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(err => {
        console.log('Auto-play prevented:', err);
      });
    }
  }, []);

  useEffect(() => {
    return () => {
      if (selectedImage?.previewUrl) {
        cleanupPreviewUrl(selectedImage.previewUrl);
      }
    };
  }, [selectedImage]);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);

    try {
      const compressed = await compressImage(file);
      setSelectedImage(compressed);
      
      const compressionRatio = ((compressed.originalSize - compressed.compressedSize) / compressed.originalSize * 100).toFixed(0);
      
      toast({
        title: '✨ Image Compressed!',
        description: `Reduced by ${compressionRatio}% (${formatFileSize(compressed.originalSize)} → ${formatFileSize(compressed.compressedSize)})`,
      });
    } catch (error: any) {
      console.error('Error compressing image:', error);
      toast({
        variant: 'destructive',
        title: 'Image Error',
        description: error.message || 'Failed to process image',
      });
    } finally {
      setIsCompressing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = () => {
    if (selectedImage?.previewUrl) {
      cleanupPreviewUrl(selectedImage.previewUrl);
    }
    setSelectedImage(null);
  };

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

      let imageData: { imageUrl: string; storagePath: string } | undefined;
      
      if (selectedImage) {
        try {
          imageData = await uploadVibeImage(user.uid, selectedImage.blob);
        } catch (error: any) {
          console.error('Error uploading image:', error);
          toast({
            variant: 'destructive',
            title: 'Image Upload Failed',
            description: 'Your vibe will be posted without the image.',
          });
        }
      }

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
        ...(imageData && { 
          imageUrl: imageData.imageUrl,
          imageStoragePath: imageData.storagePath 
        }),
      };

      // 1. Create the document in the public 'all-vibes' collection and get its ref
      const globalVibesRef = collection(firestore, 'all-vibes');
      const globalVibeDocRef = await addDocumentNonBlocking(globalVibesRef, newVibeData);
      
      // 2. If the public doc was created, save a copy to the private user collection with the SAME ID
      if (globalVibeDocRef) {
        const newVibeId = globalVibeDocRef.id;
        const userVibeDocRef = doc(firestore, 'users', user.uid, 'vibes', newVibeId);
        setDocumentNonBlocking(userVibeDocRef, newVibeData, {});
        
        toast({
          title: 'Vibe Posted!',
          description: `You shared: "${vibeText}" ${finalEmoji}`,
        });

        awardPostReward(false, newVibeId);
      } else {
        throw new Error("Failed to create the vibe in the public feed.");
      }

      setVibeText('');
      setEmoji('✨');
      handleRemoveImage();
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

      // Upload audio to Firebase Storage
      const { audioUrl, storagePath: audioStoragePath } = await uploadVoiceNote(user.uid, audioBlob);

      const locationData = userLocation
        ? {
            ...userLocation,
            geohash: generateGeohash(userLocation.lat, userLocation.lng),
          }
        : undefined;

      let imageData: { imageUrl: string; storagePath: string } | undefined;
      
      if (selectedImage) {
        try {
          imageData = await uploadVibeImage(user.uid, selectedImage.blob);
        } catch (error: any) {
          console.error('Error uploading image:', error);
          toast({
            variant: 'destructive',
            title: 'Image Upload Failed',
            description: 'Your voice vibe will be posted without the image.',
          });
        }
      }

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
        audioStoragePath: audioStoragePath,
        ...(locationData && { location: locationData }),
        ...(imageData && { 
          imageUrl: imageData.imageUrl,
          imageStoragePath: imageData.storagePath 
        }),
      };

      const globalVibesRef = collection(firestore, 'all-vibes');
      const globalVibeDocRef = await addDocumentNonBlocking(globalVibesRef, newVibeData);
      
      if (globalVibeDocRef) {
        const newVibeId = globalVibeDocRef.id;
        const userVibeDocRef = doc(firestore, 'users', user.uid, 'vibes', newVibeId);
        setDocumentNonBlocking(userVibeDocRef, newVibeData, {});
        
        toast({
          title: '🎙️ Voice Vibe Posted!',
          description: `Your ${duration}s voice note is now live!`,
        });

        awardPostReward(true, newVibeId);
      }

      setInputMode('text');
      handleRemoveImage();
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
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 overflow-hidden rounded-2xl">
                  <video
                    ref={videoRef}
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="auto"
                    src="/assets/vibe-animation.mp4"
                    className="absolute inset-0 w-full h-full object-cover shadow-lg transition-all duration-500 ease-out hover:scale-110 hover:shadow-2xl hover:shadow-purple-500/50 cursor-pointer"
                    style={{
                      filter: 'brightness(1.1) contrast(1.1) saturate(1.2)',
                      display: 'block',
                    }}
                    onError={(e: any) => console.error('Video error:', e.target.error)}
                    onLoadStart={() => console.log('Video loading started')}
                    onLoadedData={() => console.log('Video loaded successfully')}
                    onCanPlay={() => console.log('Video can play')}
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-pink-500/20 pointer-events-none animate-pulse"></div>
                </div>
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
              {selectedImage && (
                <div className="relative mb-4 rounded-xl overflow-hidden border-2 border-purple-300/40 shadow-lg">
                  <img
                    src={selectedImage.previewUrl}
                    alt="Preview"
                    className="w-full h-auto max-h-96 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    className="absolute top-3 right-3 h-8 w-8 rounded-full shadow-lg"
                    onClick={handleRemoveImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    <span className="text-xs text-white font-medium">
                      {formatFileSize(selectedImage.compressedSize)} • {selectedImage.width}×{selectedImage.height}
                    </span>
                  </div>
                </div>
              )}

              <div className="bg-muted/10 px-4 py-3 flex justify-between items-center border-t border-purple-200/20 rounded-b-lg">
                <div className="flex items-center space-x-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageSelect}
                    accept="image/jpeg,image/png,image/webp,image/heic"
                    className="hidden"
                    disabled={isCompressing || isPosting}
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-9 w-9 rounded-full hover:bg-purple-100 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isCompressing || isPosting || !!selectedImage}
                    title={selectedImage ? "Image already added" : "Add image"}
                  >
                    {isCompressing ? (
                      <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
                    ) : (
                      <ImageIcon className={`h-5 w-5 ${selectedImage ? 'text-gray-400' : 'text-purple-600'}`} />
                    )}
                  </Button>
                  <div className="flex items-center space-x-2">
                    <Switch id="anonymous-mode" checked={isAnonymous} onCheckedChange={setIsAnonymous} />
                    <Label htmlFor="anonymous-mode" className="text-sm font-medium text-muted-foreground">Anonymous</Label>
                  </div>
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