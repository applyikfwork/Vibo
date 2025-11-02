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
    const authorName = vibe.isAnonymous ? 'Anonymous User' : vibe.author.name;
    
    const timeAgo = vibe.timestamp ? formatDistanceToNow(vibe.timestamp.toDate(), { addSuffix: true }) : 'just now';

    // Enhanced emotion-specific glow effects for powerful emoji presence
    const emotionGlowEffect: Record<string, string> = {
        'Happy': 'drop-shadow-[0_0_35px_rgba(255,200,87,0.95)] drop-shadow-[0_0_20px_rgba(255,167,38,0.8)]',
        'Sad': 'drop-shadow-[0_0_35px_rgba(33,150,243,0.9)] drop-shadow-[0_0_20px_rgba(25,118,210,0.7)]',
        'Chill': 'drop-shadow-[0_0_35px_rgba(77,208,225,0.95)] drop-shadow-[0_0_20px_rgba(38,198,218,0.8)]',
        'Motivated': 'drop-shadow-[0_0_35px_rgba(224,64,251,0.9)] drop-shadow-[0_0_20px_rgba(186,104,200,0.8)]',
        'Lonely': 'drop-shadow-[0_0_30px_rgba(161,140,209,0.85)] drop-shadow-[0_0_18px_rgba(179,157,219,0.7)]',
        'Angry': 'drop-shadow-[0_0_35px_rgba(239,83,80,0.9)] drop-shadow-[0_0_20px_rgba(229,57,53,0.75)]',
        'Neutral': 'drop-shadow-[0_0_25px_rgba(120,144,156,0.7)] drop-shadow-[0_0_15px_rgba(96,125,139,0.6)]',
    }

    // Emotion text color variations for extra punch
    const emotionTextColor: Record<string, string> = {
        'Happy': 'text-white',
        'Sad': 'text-white',
        'Chill': 'text-white',
        'Motivated': 'text-yellow-100',
        'Lonely': 'text-pink-50',
        'Angry': 'text-white',
        'Neutral': 'text-gray-100',
    }

    return (
        <Card className={cn(
            "rounded-[28px] p-7 text-white shadow-2xl transition-all duration-300 ease-out",
            "hover:scale-[1.03] hover:-translate-y-2 hover:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.4)]",
            "flex flex-col h-[340px] relative overflow-hidden",
            "bg-gradient-to-br", 
            vibe.backgroundColor,
            "border-0 backdrop-blur-sm"
        )}>
            {/* Subtle overlay for depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-white/5 pointer-events-none" />
            
            {/* Content Container */}
            <div className="relative z-10 flex flex-col h-full">
                {/* Vibe Header */}
                <div className="flex items-center text-sm opacity-90 mb-4 gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                        <User className="w-4.5 h-4.5" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-semibold leading-none text-base">{authorName}</span>
                        <span className="text-xs leading-tight opacity-75 mt-0.5">{timeAgo}</span>
                    </div>
                </div>

                {/* Vibe Content - Centered and Powerful */}
                <div className="flex flex-col items-center justify-center text-center flex-grow -mt-2">
                    {/* Emoji with powerful glow */}
                    <div className="relative mb-6">
                        <span className={cn(
                            "text-[120px] leading-none inline-block",
                            "transition-transform duration-300 hover:scale-110",
                            emotion && emotionGlowEffect[emotion.name]
                        )}>
                            {vibe.emoji}
                        </span>
                    </div>
                    
                    {/* Emotion Name */}
                    <h3 className={cn(
                        "text-5xl font-black tracking-tight",
                        "drop-shadow-[0_4px_12px_rgba(0,0,0,0.25)]",
                        emotionTextColor[vibe.emotion] || 'text-white'
                    )}>
                        {vibe.emotion}
                    </h3>
                </div>

                {/* Vibe Actions */}
                <div className="flex justify-center items-center gap-3 mt-auto pt-2">
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className={cn(
                            "text-white bg-white/15 hover:bg-white/25 backdrop-blur-md",
                            "border border-white/20 hover:border-white/30",
                            "rounded-full px-5 h-10 font-medium text-sm",
                            "transition-all duration-200 hover:scale-105",
                            "shadow-lg hover:shadow-xl"
                        )}
                    >
                        {vibe.emotion === 'Motivated' ? 
                            <Zap className="mr-2 h-4 w-4 fill-current" /> : 
                            <Heart className="mr-2 h-4 w-4" />
                        }
                        <span>React</span>
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className={cn(
                            "text-white bg-white/15 hover:bg-white/25 backdrop-blur-md",
                            "border border-white/20 hover:border-white/30",
                            "rounded-full px-5 h-10 font-medium text-sm",
                            "transition-all duration-200 hover:scale-105",
                            "shadow-lg hover:shadow-xl"
                        )}
                    >
                        <MessageCircle className="mr-2 h-4 w-4" />
                        <span>Vibe Chat</span>
                    </Button>
                </div>
            </div>
        </Card>
    )
}
