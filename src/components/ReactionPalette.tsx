'use client';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { Zap } from "lucide-react";
import { useFirestore, useUser } from "@/firebase";
import { collection, serverTimestamp } from "firebase/firestore";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import type { Reaction } from "@/lib/types";

const reactionEmojis = ['🤗', '🙏', '❤️', '✨', '🔥'];

export function ReactionPalette({ vibeId }: { vibeId: string }) {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const handleReaction = (emoji: string) => {
    if (!user || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Not logged in',
        description: 'You need to be logged in to react.',
      });
      return;
    }
     if (user.isAnonymous) {
      toast({
        variant: 'destructive',
        title: 'Anonymous User',
        description: 'You must have an account to react.',
      });
      return;
    }

    const reactionsRef = collection(firestore, 'all-vibes', vibeId, 'reactions');
    const newReaction: Omit<Reaction, 'id'> = {
      vibeId,
      userId: user.uid,
      emoji,
      timestamp: serverTimestamp(),
      author: {
        name: user.displayName || 'A User',
        avatarUrl: user.photoURL || '',
      }
    };

    addDocumentNonBlocking(reactionsRef, newReaction);

    toast({
      title: 'Reaction sent!',
      description: `You reacted with ${emoji}`,
    });
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
            variant="ghost" 
            size="sm" 
            className={cn(
                "text-white bg-white/25 hover:bg-white/40 backdrop-blur-md",
                "border-2 border-white/40 hover:border-white/60",
                "rounded-full font-bold",
                "px-3 sm:px-4 h-8 sm:h-9 lg:h-10 lg:px-5",
                "text-xs sm:text-sm lg:text-base",
                "transition-all duration-300 hover:scale-110",
                "shadow-[0_4px_20px_rgba(255,255,255,0.3)] hover:shadow-[0_6px_30px_rgba(255,255,255,0.5)]",
                "drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]"
            )}
        >
            <Zap className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 fill-current" />
            <span className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">React</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2 bg-white/80 backdrop-blur-md border-white/50 rounded-full shadow-lg">
        <div className="flex gap-1">
          {reactionEmojis.map(emoji => (
            <button
              key={emoji}
              onClick={() => handleReaction(emoji)}
              className="text-2xl p-2 rounded-full hover:bg-white/50 transition-all duration-200 hover:scale-125"
            >
              {emoji}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
