'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, User, Zap, Sparkles, Heart, Trash2, Eye, Download } from 'lucide-react';
import type { Vibe, Reaction } from '@/lib/types';
import { getEmotionByName } from '@/lib/data';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ReactionPalette } from './ReactionPalette';
import { VoicePlayer } from '@/components/VoicePlayer';
import Link from 'next/link';
import { useCollection, useFirestore, useMemoFirebase, useUser, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc, Timestamp } from 'firebase/firestore';
import { deleteVibeImage, deleteVoiceNote } from '@/lib/firebase-storage';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DownloadDialog } from './DownloadDialog';

interface VibeCardProps {
    vibe: Vibe;
    isLink?: boolean;
}

export function VibeCard({ vibe, isLink = true }: VibeCardProps) {
    const { user } = useUser();
    const { toast } = useToast();
    const firestore = useFirestore();
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);
    const emotion = getEmotionByName(vibe.emotion);
    const authorName = vibe.isAnonymous ? 'Anonymous User' : vibe.author.name;
    
    // Helper to handle both Timestamp object and serialized object
    const getSafeDate = (timestamp: any): Date | null => {
        if (!timestamp) return null;
        
        try {
            if (timestamp.toDate && typeof timestamp.toDate === 'function') {
                return timestamp.toDate();
            }
            
            if (timestamp._seconds !== undefined) {
                return new Timestamp(timestamp._seconds, timestamp._nanoseconds || 0).toDate();
            }
            
            if (timestamp.seconds !== undefined) {
                return new Timestamp(timestamp.seconds, timestamp.nanoseconds || 0).toDate();
            }
            
            const dateAttempt = new Date(timestamp);
            if (!isNaN(dateAttempt.getTime())) {
                return dateAttempt;
            }
            
            return null;
        } catch (e) {
            console.error('Error converting timestamp:', e, timestamp);
            return null;
        }
    };

    const safeDate = getSafeDate(vibe.timestamp);
    const timeAgo = safeDate && !isNaN(safeDate.getTime()) 
        ? formatDistanceToNow(safeDate, { addSuffix: true }) 
        : 'just now';

    const reactionsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'all-vibes', vibe.id, 'reactions');
    }, [firestore, vibe.id]);
    const { data: reactions } = useCollection<Reaction>(reactionsQuery);
    const reactionCount = reactions?.length ?? 0;
    const viewCount = vibe.viewCount ?? 0;

    const isOwner = user?.uid === vibe.userId;

    const handleDelete = async () => {
        if (!isOwner || !user || !firestore) return;
        setIsDeleting(true);

        try {
            if (vibe.imageStoragePath) {
                await deleteVibeImage(vibe.imageStoragePath);
            }

            if (vibe.audioStoragePath) {
                await deleteVoiceNote(vibe.audioStoragePath);
            }

            const userVibeRef = doc(firestore, 'users', user.uid, 'vibes', vibe.id);
            deleteDocumentNonBlocking(userVibeRef);

            const globalVibeRef = doc(firestore, 'all-vibes', vibe.id);
            deleteDocumentNonBlocking(globalVibeRef);
            
            toast({
                title: 'Vibe Deleted',
                description: 'Your vibe has been successfully removed.',
            });
            
            router.push('/');

        } catch (e: any) {
            console.error("Error deleting vibe:", e);
            toast({
                variant: 'destructive',
                title: 'Deletion Failed',
                description: e.message || 'An unexpected error occurred while deleting the vibe.',
            });
        } finally {
            setIsDeleting(false);
        }
    };

    const emotionGlowEffect: Record<string, string> = {
        'Happy': 'drop-shadow-[0_0_40px_rgba(255,184,77,1)] drop-shadow-[0_0_25px_rgba(255,167,38,0.9)] drop-shadow-[0_0_15px_rgba(255,149,0,0.8)]',
        'Sad': 'drop-shadow-[0_0_40px_rgba(100,181,246,1)] drop-shadow-[0_0_25px_rgba(66,165,245,0.9)] drop-shadow-[0_0_15px_rgba(33,150,243,0.8)]',
        'Chill': 'drop-shadow-[0_0_40px_rgba(77,208,225,1)] drop-shadow-[0_0_25px_rgba(38,198,218,0.9)] drop-shadow-[0_0_15px_rgba(0,188,212,0.8)]',
        'Motivated': 'drop-shadow-[0_0_40px_rgba(244,143,177,1)] drop-shadow-[0_0_25px_rgba(236,64,122,0.9)] drop-shadow-[0_0_15px_rgba(233,30,99,0.8)]',
        'Lonely': 'drop-shadow-[0_0_40px_rgba(206,147,216,1)] drop-shadow-[0_0_25px_rgba(186,104,200,0.9)] drop-shadow-[0_0_15px_rgba(171,71,188,0.8)]',
        'Angry': 'drop-shadow-[0_0_40px_rgba(255,112,67,1)] drop-shadow-[0_0_25px_rgba(255,87,34,0.9)] drop-shadow-[0_0_15px_rgba(244,81,30,0.8)]',
        'Neutral': 'drop-shadow-[0_0_35px_rgba(144,164,174,0.9)] drop-shadow-[0_0_20px_rgba(120,144,156,0.8)]',
        'Funny': 'drop-shadow-[0_0_40px_rgba(212,225,87,1)] drop-shadow-[0_0_25px_rgba(205,220,57,0.9)] drop-shadow-[0_0_15px_rgba(192,202,51,0.8)]',
    }

    const emotionBorderGlow: Record<string, string> = {
        'Happy': 'shadow-[0_0_30px_rgba(255,184,77,0.6),0_0_60px_rgba(255,167,38,0.4),0_0_90px_rgba(255,149,0,0.2)]',
        'Sad': 'shadow-[0_0_30px_rgba(100,181,246,0.6),0_0_60px_rgba(66,165,245,0.4),0_0_90px_rgba(33,150,243,0.2)]',
        'Chill': 'shadow-[0_0_30px_rgba(77,208,225,0.6),0_0_60px_rgba(38,198,218,0.4),0_0_90px_rgba(0,188,212,0.2)]',
        'Motivated': 'shadow-[0_0_30px_rgba(244,143,177,0.6),0_0_60px_rgba(236,64,122,0.4),0_0_90px_rgba(233,30,99,0.2)]',
        'Lonely': 'shadow-[0_0_30px_rgba(206,147,216,0.6),0_0_60px_rgba(186,104,200,0.4),0_0_90px_rgba(171,71,188,0.2)]',
        'Angry': 'shadow-[0_0_30px_rgba(255,112,67,0.6),0_0_60px_rgba(255,87,34,0.4),0_0_90px_rgba(244,81,30,0.2)]',
        'Neutral': 'shadow-[0_0_30px_rgba(144,164,174,0.5),0_0_60px_rgba(120,144,156,0.3)]',
        'Funny': 'shadow-[0_0_30px_rgba(212,225,87,0.6),0_0_60px_rgba(205,220,57,0.4),0_0_90px_rgba(192,202,51,0.2)]',
    }
    
    const CardContent = () => (
      <div className="group relative" id={`vibe-card-${vibe.id}`}>
            <Card className={cn(
                "rounded-[24px] sm:rounded-[28px] lg:rounded-[32px] p-5 sm:p-6",
                "text-white transition-all duration-500 ease-out",
                 isLink && "hover:scale-[1.05] sm:hover:scale-[1.06] hover:-translate-y-3",
                "flex flex-col relative overflow-hidden",
                "h-auto min-h-[380px] lg:min-h-[360px]",
                "bg-gradient-to-br group-hover:animate-gradient-shift", 
                vibe.backgroundColor,
                "border-2 border-white/20",
                emotion && emotionBorderGlow[emotion.name]
            )}>
                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-black/10 opacity-50" />
                
                <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
                    <div onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                        <DownloadDialog 
                            vibe={vibe}
                            trigger={
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-500/40 to-pink-500/40 text-white/90 hover:from-purple-500/60 hover:to-pink-500/60 hover:text-white border border-white/30 hover:border-white/50 transition-all duration-300 hover:scale-110 shadow-lg"
                                >
                                    <Download className="h-4 w-4" />
                                </Button>
                            }
                        />
                    </div>
                    {isOwner && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-black/20 text-white/70 hover:bg-black/40 hover:text-white" onClick={(e) => e.stopPropagation()}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete your vibe from all feeds.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                                        {isDeleting ? 'Deleting...' : 'Delete'}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                </div>
                
                <div className="absolute bottom-8 left-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                    <Sparkles className="w-4 h-4 text-white/30 group-hover:animate-pulse" />
                </div>

                <div className="relative z-10 flex flex-col h-full">
                    <div className="flex items-center mb-3 sm:mb-4 gap-2">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/25 backdrop-blur-sm flex items-center justify-center shadow-lg">
                            <User className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white drop-shadow-md" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold leading-none text-sm sm:text-base text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
                                {authorName}
                            </span>
                            <span className="text-xs leading-tight text-white/95 mt-0.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
                                {timeAgo}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col items-center justify-center text-center flex-grow py-4">
                        <div className="relative">
                            <span className={cn(
                                "text-[70px] sm:text-[80px]",
                                "leading-none inline-block",
                                "transition-transform duration-300 group-hover:scale-110",
                                emotion && emotionGlowEffect[emotion.name]
                            )}>
                                {vibe.emoji}
                            </span>
                        </div>
                        
                        <h3 className={cn(
                            "text-3xl sm:text-4xl font-black tracking-tighter mt-2",
                            "text-white",
                            "drop-shadow-[0_4px_8px_rgba(0,0,0,0.4)]"
                        )}>
                            {vibe.emotion}
                        </h3>

                        <p className="font-medium text-white/90 text-base sm:text-lg mt-4 px-2 line-clamp-3 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                            "{vibe.text}"
                        </p>
                        
                        {vibe.imageUrl && (
                            <div className="w-full px-2 mt-5 mb-2">
                                <div className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-white/30 group-hover:border-white/50 transition-all duration-300">
                                    <img
                                        src={vibe.imageUrl}
                                        alt="Vibe"
                                        loading="lazy"
                                        className="w-full h-auto max-h-80 object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
                                </div>
                            </div>
                        )}
                        
                        {vibe.isVoiceNote && vibe.audioUrl && vibe.audioDuration && (
                            <div className="w-full px-2 mt-4" onClick={(e) => e.stopPropagation()}>
                                <VoicePlayer audioUrl={vibe.audioUrl} duration={vibe.audioDuration} />
                            </div>
                        )}
                    </div>

                    <div className="flex justify-center items-center gap-2 sm:gap-3 mt-auto pt-4">
                        <div onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                            <ReactionPalette vibeId={vibe.id} />
                        </div>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            asChild={isLink}
                             className={cn(
                                "text-white bg-white/25 hover:bg-white/40 backdrop-blur-md",
                                "border-2 border-white/40 hover:border-white/60",
                                "rounded-full font-bold",
                                "px-3 h-8 sm:px-4 sm:h-9",
                                "text-xs sm:text-sm",
                                "transition-all duration-300 hover:scale-110",
                                "shadow-[0_4px_20px_rgba(255,255,255,0.3)] hover:shadow-[0_6px_30px_rgba(255,255,255,0.5)]",
                                "drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]"
                            )}
                            onClick={(e) => {
                                if (!isLink) {
                                    e.preventDefault();
                                    document.getElementById('comment-textarea')?.focus();
                                }
                            }}
                        >
                            <div className="flex items-center">
                                <MessageCircle className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                <span className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">Vibe Chat</span>
                            </div>
                        </Button>
                         {(reactionCount > 0 || viewCount > 0) && (
                            <div 
                                className={cn(
                                    "text-white bg-white/25 backdrop-blur-md flex items-center gap-3 sm:gap-4",
                                    "border-2 border-white/40",
                                    "rounded-full font-bold",
                                    "px-3 h-8 sm:px-4 sm:h-9",
                                    "text-xs sm:text-sm",
                                    "shadow-[0_4px_20px_rgba(255,255,255,0.3)]",
                                    "drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]"
                                )}
                            >
                                {reactionCount > 0 && (
                                    <div className="flex items-center">
                                        <Heart className="mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4 fill-white" />
                                        <span>{reactionCount}</span>
                                    </div>
                                )}
                                {viewCount > 0 && (
                                    <div className="flex items-center">
                                        <Eye className="mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                        <span>{viewCount}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    );

    if (isLink) {
        return (
            <Link href={`/vibe/${vibe.id}`} className="block">
                <CardContent />
            </Link>
        );
    }

    return <CardContent />;
}
