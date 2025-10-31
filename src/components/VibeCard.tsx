'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, Heart } from 'lucide-react';
import type { Vibe } from '@/lib/types';
import { getEmotionByName } from '@/lib/data';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface VibeCardProps {
    vibe: Vibe;
}

export function VibeCard({ vibe }: VibeCardProps) {
    const emotion = getEmotionByName(vibe.emotion);
    const authorName = vibe.isAnonymous ? 'Hidden Soul' : vibe.author.name;
    
    const timeAgo = vibe.timestamp ? formatDistanceToNow(vibe.timestamp.toDate(), { addSuffix: true }) : 'just now';

    return (
        <Card className={cn(
            "rounded-3xl p-4 text-white shadow-lg transition-all duration-400 ease-in-out hover:scale-102 hover:-translate-y-1",
            "flex flex-col",
            "bg-gradient-to-br",
            emotion?.gradient
        )}>
            {/* Vibe Header */}
            <div className="flex justify-between items-center text-sm opacity-85 mb-3">
                <span className="font-semibold drop-shadow-sm">{authorName}</span>
                <span className="drop-shadow-sm">{timeAgo}</span>
            </div>

            {/* Vibe Content */}
            <div className="flex flex-col items-center justify-center text-center flex-grow my-3">
                <span className={cn(
                    "text-5xl mb-2",
                    emotion?.name === 'Happy' && "drop-shadow-[0_2px_4px_rgba(255,217,61,0.5)]",
                )}>
                    {vibe.emoji}
                </span>
                <p className="text-lg font-medium leading-snug drop-shadow-sm">{vibe.text}</p>
            </div>

            {/* Vibe Actions */}
            <div className="flex justify-around mt-2 pt-3 border-t border-white/20">
                <Button variant="ghost" size="sm" className="text-white/90 hover:bg-white/10 hover:text-white rounded-full">
                    <Heart className="h-4 w-4 mr-2" />
                    React
                </Button>
                <Button variant="ghost" size="sm" className="text-white/90 hover:bg-white/10 hover:text-white rounded-full">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Vibe Chat
                </Button>
            </div>
        </Card>
    )
}
