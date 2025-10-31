'use client';

import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
    const authorInitial = vibe.isAnonymous ? 'H' : (vibe.author.name ? vibe.author.name.charAt(0) : 'A');
    
    const timeAgo = vibe.timestamp ? formatDistanceToNow(vibe.timestamp.toDate(), { addSuffix: true }) : 'just now';

    return (
        <Card className={cn(
            "flex flex-col h-full overflow-hidden border-0 shadow-lg text-white transition-transform duration-300 ease-in-out hover:-translate-y-1.5",
            "bg-gradient-to-br",
            emotion?.gradient
        )}>
            <CardContent className="p-6 flex-grow flex flex-col">
                <div className="flex items-center mb-4">
                    <Avatar className="h-8 w-8 mr-3 border-2 border-white/50">
                        {!vibe.isAnonymous && vibe.author.avatarUrl && <AvatarImage src={vibe.author.avatarUrl} alt={authorName} data-ai-hint="person portrait" />}
                        <AvatarFallback className="bg-white/30 text-white font-bold">{authorInitial}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold text-sm drop-shadow-sm">{authorName}</p>
                        <p className="text-xs opacity-80 drop-shadow-sm">{timeAgo}</p>
                    </div>
                </div>
                <div className="flex-grow text-xl font-medium leading-snug mb-4">
                    <span className="text-3xl mr-2 drop-shadow">{vibe.emoji}</span>
                    <span className="drop-shadow-sm">{vibe.text}</span>
                </div>
            </CardContent>
            <CardFooter className="p-3 bg-black/10 flex justify-end gap-2">
                <Button variant="ghost" size="sm" className="text-white/80 hover:bg-white/20 hover:text-white rounded-full">
                    <Heart className="h-4 w-4 mr-2" />
                    React
                </Button>
                <Button variant="ghost" size="sm" className="text-white/80 hover:bg-white/20 hover:text-white rounded-full">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Vibe Chat
                </Button>
            </CardFooter>
        </Card>
    )
}
