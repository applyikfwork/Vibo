'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, Heart, User, Zap } from 'lucide-react';
import type { Vibe } from '@/lib/types';
import { getEmotionByName } from '@/lib/data';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface VibeCardProps {
    vibe: Vibe;
}

export function VibeCard({ vibe }: VibeCardProps) {
    const emotion = getEmotionByName(vibe.emotion);
    const authorName = vibe.isAnonymous ? 'Anonymous' : vibe.author.name;
    
    const timeAgo = vibe.timestamp ? formatDistanceToNow(vibe.timestamp.toDate(), { addSuffix: true }) : 'just now';

    // Emotion-specific glow effects for the emoji
    const emotionGlowEffect: Record<string, string> = {
        'Happy': 'drop-shadow-[0_0_15px_rgba(255,217,61,0.7)]',
        'Sad': 'drop-shadow-[0_0_15px_rgba(137,207,240,0.6)]',
        'Chill': 'drop-shadow-[0_0_15px_rgba(109,213,250,0.7)]',
        'Motivated': 'drop-shadow-[0_0_15px_rgba(251,194,235,0.7)]',
        'Lonely': 'drop-shadow-[0_0_15px_rgba(251,194,235,0.6)]',
        'Angry': 'drop-shadow-[0_0_15px_rgba(239,68,68,0.6)]',
        'Neutral': 'drop-shadow-[0_0_15px_rgba(156,163,175,0.5)]',
    }

    return (
        <Card className={cn(
            "rounded-3xl p-6 text-white shadow-lg transition-all duration-300 ease-in-out hover:scale-[1.02] hover:-translate-y-1",
            "flex flex-col h-[280px]", // Fixed height for consistency
            "bg-gradient-to-br", // Use bottom-right gradient direction
            vibe.backgroundColor // This applies the from-[] and to-[] classes
        )}>
            {/* Vibe Header */}
            <div className="flex items-center text-sm opacity-85 mb-3 gap-2 drop-shadow-sm">
                <User className="w-4 h-4" />
                <div className="flex flex-col">
                    <span className="font-semibold leading-none">{authorName}</span>
                    <span className="text-xs leading-tight">{timeAgo}</span>
                </div>
            </div>

            {/* Vibe Content */}
            <div className="flex flex-col items-center justify-center text-center flex-grow my-4">
                <span className={cn(
                    "text-6xl mb-4",
                    emotion && emotionGlowEffect[emotion.name]
                )}>
                    {vibe.emoji}
                </span>
                <p className="text-3xl font-bold tracking-tight drop-shadow-sm">{vibe.emotion}</p>
            </div>

            {/* Vibe Actions */}
            <div className="flex justify-center items-center gap-4 mt-auto">
                <Button variant="ghost" size="sm" className="text-white/90 bg-white/10 hover:bg-white/20 hover:text-white rounded-full px-4 h-auto py-1.5">
                    {vibe.emotion === 'Motivated' ? <Zap className="mr-2 h-4 w-4" /> : <Heart className="mr-2 h-4 w-4" />}
                    <span>React</span>
                </Button>
                 <Button variant="ghost" size="sm" className="text-white/90 bg-white/10 hover:bg-white/20 hover:text-white rounded-full px-4 h-auto py-1.5">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    <span>Vibe Chat</span>
                </Button>
            </div>
        </Card>
    )
}
