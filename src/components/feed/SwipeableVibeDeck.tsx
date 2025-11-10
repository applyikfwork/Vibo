'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import type { Vibe } from '@/lib/types';
import { VibeCardFullScreen } from './VibeCardFullScreen';
import { useFeedEngagement } from '@/hooks/feed/useFeedEngagement';

interface SwipeableVibeDeckProps {
  vibes: Vibe[];
  onNeedMore?: () => void;
  userMood: string;
}

export function SwipeableVibeDeck({ vibes, onNeedMore, userMood }: SwipeableVibeDeckProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [prefetchedAudio, setPrefetchedAudio] = useState<Set<string>>(new Set());
  const { trackView, trackInteraction, trackListenProgress } = useFeedEngagement();
  const viewStartTimeRef = useRef<number>(Date.now());

  const currentVibe = vibes[currentIndex];
  const nextVibe = vibes[currentIndex + 1];
  const prevVibe = vibes[currentIndex - 1];

  useEffect(() => {
    if (!currentVibe) return;

    viewStartTimeRef.current = Date.now();
    trackView(currentVibe.id, currentVibe.emotion, currentVibe.text?.length || 0);

    return () => {
      const duration = (Date.now() - viewStartTimeRef.current) / 1000;
      if (duration > 1) {
      }
    };
  }, [currentVibe, trackView]);

  useEffect(() => {
    const prefetchNext = async () => {
      for (let i = 1; i <= 2; i++) {
        const nextVibeIndex = currentIndex + i;
        if (vibes[nextVibeIndex]?.audioUrl && !prefetchedAudio.has(vibes[nextVibeIndex].audioUrl!)) {
          try {
            const audio = new Audio();
            audio.preload = 'metadata';
            audio.src = vibes[nextVibeIndex].audioUrl!;
            setPrefetchedAudio(prev => new Set([...prev, vibes[nextVibeIndex].audioUrl!]));
          } catch (error) {
            console.error('Failed to prefetch audio:', error);
          }
        }
      }
    };

    prefetchNext();
  }, [currentIndex, vibes, prefetchedAudio]);

  useEffect(() => {
    if (currentIndex >= vibes.length - 3 && onNeedMore) {
      onNeedMore();
    }
  }, [currentIndex, vibes.length, onNeedMore]);

  const handleSwipe = useCallback((direction: number) => {
    if (direction > 0 && currentIndex < vibes.length - 1) {
      setDirection(1);
      setCurrentIndex(prev => prev + 1);
    } else if (direction < 0 && currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex, vibes.length]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    const threshold = 50;
    const velocity = info.velocity.y;
    const offset = info.offset.y;

    if (Math.abs(velocity) > 500 || Math.abs(offset) > threshold) {
      if (offset < 0) {
        handleSwipe(1);
      } else if (offset > 0) {
        handleSwipe(-1);
      }
    }
  };

  const handleInteraction = async (type: 'interest' | 'share' | 'react' | 'skip' | 'more-like-this', emoji?: string) => {
    if (!currentVibe) return;

    await trackInteraction(currentVibe.id, type, emoji);

    if (type === 'skip' || type === 'interest' || type === 'more-like-this') {
      handleSwipe(1);
    }
  };

  const handleListenProgress = (vibeId: string, currentTime: number, duration: number) => {
    trackListenProgress(vibeId, currentTime, duration);
  };

  if (!currentVibe) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-pink-600">
        <div className="text-white text-center">
          <p className="text-xl">No more vibes to show</p>
          <p className="text-sm mt-2 opacity-80">Check back later for fresh content</p>
        </div>
      </div>
    );
  }

  const slideVariants = {
    enter: (direction: number) => ({
      y: direction > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      y: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      y: direction > 0 ? '-100%' : '100%',
      opacity: 0,
    }),
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={currentVibe.id}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            y: { type: 'spring', stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
          }}
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
          className="absolute inset-0"
        >
          <VibeCardFullScreen
            vibe={currentVibe}
            onInteraction={handleInteraction}
            onListenProgress={handleListenProgress}
          />
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-20 left-0 right-0 flex justify-center items-center gap-1 px-4 pointer-events-none z-10">
        {vibes.slice(Math.max(0, currentIndex - 2), currentIndex + 3).map((_, idx) => {
          const actualIndex = Math.max(0, currentIndex - 2) + idx;
          return (
            <div
              key={actualIndex}
              className={`h-1 rounded-full transition-all duration-300 ${
                actualIndex === currentIndex 
                  ? 'w-8 bg-white' 
                  : 'w-1 bg-white/40'
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}
