'use client';

import { useState, useEffect } from 'react';
import { VibeCard } from './VibeCard';
import { useUser } from '@/firebase';
import { usePersonalizedFeed } from '@/hooks/usePersonalizedFeed';
import { useMoodFlow } from '@/hooks/useMoodFlow';
import { useVibeMemory } from '@/hooks/useVibeMemory';
import type { EmotionCategory } from '@/lib/types';
import { emotions } from '@/lib/data';
import { Skeleton } from './ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Heart, Compass, TrendingUp } from 'lucide-react';

export function SmartVibeFeed() {
  const { user } = useUser();
  const { currentMood, previousMood, isTransitioning, changeMood, getMoodPattern } = useMoodFlow();
  const { trackInteraction } = useVibeMemory(user?.uid || null);
  const { data, isLoading, error } = usePersonalizedFeed(
    user?.uid || null,
    currentMood,
    !!currentMood
  );

  const handleMoodChange = (newMood: EmotionCategory | null) => {
    changeMood(newMood);
  };

  const handleVibeInteraction = (
    vibeId: string,
    emotion: EmotionCategory,
    type: 'view' | 'react' | 'comment',
    duration: number = 0
  ) => {
    if (currentMood && user?.uid) {
      trackInteraction(vibeId, emotion, type, duration, currentMood, 'neutral');
    }
  };

  if (!currentMood) {
    const moodPattern = getMoodPattern();
    
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            🧠 How are you feeling right now?
          </h3>
          <p className="text-gray-600 mb-6">
            Select your current vibe to see personalized content that matches or heals your mood
          </p>
          {moodPattern && (
            <div className="mb-4 p-3 bg-purple-50 rounded-lg">
              <p className="text-xs text-purple-600 flex items-center justify-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Your mood journey: {moodPattern.mostCommonTransition}
              </p>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {emotions.map((emotion) => (
            <button
              key={emotion.name}
              onClick={() => handleMoodChange(emotion.name)}
              className="group relative overflow-hidden rounded-2xl p-6 text-center transition-all hover:scale-105 hover:shadow-xl bg-white/80 backdrop-blur-sm border-2 border-transparent hover:border-purple-300"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${emotion.gradient} opacity-10 group-hover:opacity-20 transition-opacity`} />
              <div className="relative">
                <div className="text-4xl mb-2">{emotion.emoji}</div>
                <div className="font-semibold text-gray-800">{emotion.name}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-48 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 bg-red-50 rounded-lg">
        <p className="text-red-600 font-semibold mb-2">Failed to load personalized feed</p>
        <p className="text-sm text-red-500">{error.message}</p>
      </div>
    );
  }

  if (!data) return null;

  const { zones } = data;

  return (
    <motion.div 
      key={currentMood}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-12"
    >
      <div className="flex items-center justify-between bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
        <div className="flex items-center gap-3">
          <motion.span 
            key={`emoji-${currentMood}`}
            initial={{ scale: 0.8, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="text-3xl"
          >
            {emotions.find(e => e.name === currentMood)?.emoji}
          </motion.span>
          <div>
            <p className="text-sm text-gray-600">Currently feeling</p>
            <p className="font-bold text-lg">{currentMood}</p>
            {previousMood && (
              <p className="text-xs text-gray-400">
                Previously: {previousMood}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={() => handleMoodChange(null)}
          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-semibold hover:scale-105 transition-transform"
        >
          Change Mood
        </button>
      </div>
      
      {isTransitioning && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-3 text-center"
        >
          <p className="text-sm text-purple-700">
            ✨ Refreshing your feed for your new vibe...
          </p>
        </motion.div>
      )}

      {zones.myVibeZone.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="w-6 h-6 text-purple-600" />
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
                My Vibe Zone
              </h2>
            </div>
            <p className="text-gray-600 text-sm">
              Posts that match your current vibe - you're not alone in this feeling
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {zones.myVibeZone.map((vibe, index) => (
                <motion.div
                  key={vibe.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <VibeCard vibe={vibe} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.section>
      )}

      {zones.healingZone.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <Heart className="w-6 h-6 text-pink-600" />
              <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-pink-400 bg-clip-text text-transparent">
                Healing Zone
              </h2>
            </div>
            <p className="text-gray-600 text-sm">
              Uplifting content to shift your emotional state in a positive direction
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {zones.healingZone.map((vibe, index) => (
                <motion.div
                  key={vibe.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <VibeCard vibe={vibe} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.section>
      )}

      {zones.exploreZone.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <Compass className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                Explore Vibes
              </h2>
            </div>
            <p className="text-gray-600 text-sm">
              Discover trending vibes from the global community
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {zones.exploreZone.map((vibe, index) => (
                <motion.div
                  key={vibe.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <VibeCard vibe={vibe} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.section>
      )}

      {data.metadata && (
        <div className="text-center text-xs text-gray-400 py-4">
          <p>{data.metadata.algorithm} - {data.metadata.rankedVibes} vibes ranked emotionally for you</p>
        </div>
      )}
    </motion.div>
  );
}
