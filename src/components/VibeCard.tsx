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

    // Super powerful emotion-specific glow effects
    const emotionGlowEffect: Record<string, string> = {
        'Happy': 'drop-shadow-[0_0_40px_rgba(255,184,77,1)] drop-shadow-[0_0_25px_rgba(255,167,38,0.9)] drop-shadow-[0_0_15px_rgba(255,149,0,0.8)]',
        'Sad': 'drop-shadow-[0_0_40px_rgba(100,181,246,1)] drop-shadow-[0_0_25px_rgba(66,165,245,0.9)] drop-shadow-[0_0_15px_rgba(33,150,243,0.8)]',
        'Chill': 'drop-shadow-[0_0_40px_rgba(77,208,225,1)] drop-shadow-[0_0_25px_rgba(38,198,218,0.9)] drop-shadow-[0_0_15px_rgba(0,188,212,0.8)]',
        'Motivated': 'drop-shadow-[0_0_40px_rgba(244,143,177,1)] drop-shadow-[0_0_25px_rgba(236,64,122,0.9)] drop-shadow-[0_0_15px_rgba(233,30,99,0.8)]',
        'Lonely': 'drop-shadow-[0_0_40px_rgba(206,147,216,1)] drop-shadow-[0_0_25px_rgba(186,104,200,0.9)] drop-shadow-[0_0_15px_rgba(171,71,188,0.8)]',
        'Angry': 'drop-shadow-[0_0_40px_rgba(255,112,67,1)] drop-shadow-[0_0_25px_rgba(255,87,34,0.9)] drop-shadow-[0_0_15px_rgba(244,81,30,0.8)]',
        'Neutral': 'drop-shadow-[0_0_35px_rgba(144,164,174,0.9)] drop-shadow-[0_0_20px_rgba(120,144,156,0.8)]',
    }

    return (
        <Card className={cn(
            // Base styles with full responsiveness
            "rounded-[24px] sm:rounded-[28px] p-5 sm:p-6 md:p-7",
            "text-white shadow-2xl transition-all duration-300 ease-out",
            "hover:scale-[1.02] sm:hover:scale-[1.03] hover:-translate-y-2",
            "hover:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)]",
            "flex flex-col relative overflow-hidden",
            // Responsive heights
            "h-[300px] sm:h-[320px] md:h-[360px] lg:h-[380px]",
            // Super vibrant gradient
            "bg-gradient-to-br", 
            vibe.backgroundColor,
            "border-0"
        )}>
            {/* Content Container */}
            <div className="relative z-10 flex flex-col h-full">
                {/* Vibe Header - Highly visible white text */}
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

                {/* Vibe Content - Centered and Super Powerful */}
                <div className="flex flex-col items-center justify-center text-center flex-grow">
                    {/* Emoji with massive glow */}
                    <div className="relative mb-4 sm:mb-5 md:mb-6">
                        <span className={cn(
                            "text-[90px] sm:text-[110px] md:text-[130px] lg:text-[140px]",
                            "leading-none inline-block",
                            "transition-transform duration-300 hover:scale-110",
                            emotion && emotionGlowEffect[emotion.name]
                        )}>
                            {vibe.emoji}
                        </span>
                    </div>
                    
                    {/* Emotion Name - Pure white with strong shadow */}
                    <h3 className={cn(
                        "text-3xl sm:text-4xl md:text-5xl lg:text-6xl",
                        "font-black tracking-tight",
                        "text-white",
                        "drop-shadow-[0_4px_8px_rgba(0,0,0,0.4)]",
                        "drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]"
                    )}>
                        {vibe.emotion}
                    </h3>
                </div>

                {/* Vibe Actions - Responsive sizing */}
                <div className="flex justify-center items-center gap-2 sm:gap-3 mt-auto pt-2">
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className={cn(
                            "text-white bg-white/20 hover:bg-white/30 backdrop-blur-sm",
                            "border border-white/30 hover:border-white/40",
                            "rounded-full font-semibold",
                            "px-3 sm:px-4 md:px-5 h-8 sm:h-9 md:h-10",
                            "text-xs sm:text-sm",
                            "transition-all duration-200 hover:scale-105",
                            "shadow-lg hover:shadow-xl",
                            "drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]"
                        )}
                    >
                        {vibe.emotion === 'Motivated' ? 
                            <Zap className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 fill-current" /> : 
                            <Heart className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        }
                        <span className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">React</span>
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className={cn(
                            "text-white bg-white/20 hover:bg-white/30 backdrop-blur-sm",
                            "border border-white/30 hover:border-white/40",
                            "rounded-full font-semibold",
                            "px-3 sm:px-4 md:px-5 h-8 sm:h-9 md:h-10",
                            "text-xs sm:text-sm",
                            "transition-all duration-200 hover:scale-105",
                            "shadow-lg hover:shadow-xl",
                            "drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]"
                        )}
                    >
                        <MessageCircle className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        <span className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">Vibe Chat</span>
                    </Button>
                </div>
            </div>
        </Card>
    )
}
