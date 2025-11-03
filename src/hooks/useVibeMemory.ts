import { useState, useEffect, useCallback } from 'react';
import type { EmotionCategory } from '@/lib/types';
import { initializeFirebase } from '@/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export type EmotionalInteraction = {
  vibeId: string;
  emotion: EmotionCategory;
  interactionType: 'view' | 'react' | 'comment' | 'skip';
  duration: number;
  timestamp: Date;
  userMoodAtTime: EmotionCategory;
  helpfulness: 'helpful' | 'neutral' | 'unhelpful';
};

export type VibeMemory = {
  userId: string;
  interactions: EmotionalInteraction[];
  emotionPatterns: Record<EmotionCategory, {
    mostEngagedContent: string[];
    averageDuration: number;
    preferredHealing: EmotionCategory[];
    skipPatterns: string[];
  }>;
  lastUpdated: Date;
};

export function useVibeMemory(userId: string | null) {
  const [memory, setMemory] = useState<VibeMemory | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!userId) {
      setMemory(null);
      return;
    }

    const loadMemory = async () => {
      setIsLoading(true);
      try {
        const { firestore } = initializeFirebase();
        const memoryDoc = await getDoc(doc(firestore, 'vibeMemory', userId));
        if (memoryDoc.exists()) {
          const data = memoryDoc.data() as VibeMemory;
          setMemory({
            ...data,
            lastUpdated: (data.lastUpdated as any).toDate(),
            interactions: data.interactions.map(i => ({
              ...i,
              timestamp: (i.timestamp as any).toDate(),
            })),
          });
        } else {
          setMemory({
            userId,
            interactions: [],
            emotionPatterns: {} as any,
            lastUpdated: new Date(),
          });
        }
      } catch (error) {
        console.error('Error loading vibe memory:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMemory();
  }, [userId]);

  const trackInteraction = useCallback(async (
    vibeId: string,
    emotion: EmotionCategory,
    interactionType: EmotionalInteraction['interactionType'],
    duration: number,
    userMoodAtTime: EmotionCategory,
    helpfulness: EmotionalInteraction['helpfulness'] = 'neutral'
  ) => {
    if (!userId || !memory) return;

    const newInteraction: EmotionalInteraction = {
      vibeId,
      emotion,
      interactionType,
      duration,
      timestamp: new Date(),
      userMoodAtTime,
      helpfulness,
    };

    const updatedMemory: VibeMemory = {
      ...memory,
      interactions: [...memory.interactions, newInteraction],
      lastUpdated: new Date(),
    };

    updatedMemory.emotionPatterns = analyzePatterns(updatedMemory.interactions);

    setMemory(updatedMemory);

    try {
      const { firestore } = initializeFirebase();
      await setDoc(doc(firestore, 'vibeMemory', userId), updatedMemory);
    } catch (error) {
      console.error('Error saving vibe memory:', error);
    }
  }, [userId, memory]);

  const getInsights = useCallback(() => {
    if (!memory || memory.interactions.length === 0) {
      return null;
    }

    const totalInteractions = memory.interactions.length;
    const emotionDistribution: Record<string, number> = {};
    let totalDuration = 0;

    memory.interactions.forEach((interaction) => {
      emotionDistribution[interaction.emotion] = 
        (emotionDistribution[interaction.emotion] || 0) + 1;
      totalDuration += interaction.duration;
    });

    const mostEngagedEmotion = Object.entries(emotionDistribution)
      .sort(([, a], [, b]) => b - a)[0]?.[0];

    return {
      totalInteractions,
      averageSessionDuration: totalDuration / totalInteractions,
      mostEngagedEmotion,
      emotionDistribution,
      patterns: memory.emotionPatterns,
    };
  }, [memory]);

  return {
    memory,
    isLoading,
    trackInteraction,
    getInsights,
  };
}

function analyzePatterns(interactions: EmotionalInteraction[]): VibeMemory['emotionPatterns'] {
  const patterns: VibeMemory['emotionPatterns'] = {} as any;

  const emotionGroups = interactions.reduce((acc, interaction) => {
    if (!acc[interaction.userMoodAtTime]) {
      acc[interaction.userMoodAtTime] = [];
    }
    acc[interaction.userMoodAtTime].push(interaction);
    return acc;
  }, {} as Record<EmotionCategory, EmotionalInteraction[]>);

  for (const [emotion, group] of Object.entries(emotionGroups)) {
    const engaged = group
      .filter(i => i.interactionType !== 'skip' && i.duration > 5000)
      .map(i => i.vibeId);
    
    const skipped = group
      .filter(i => i.interactionType === 'skip')
      .map(i => i.emotion);

    const healing = group
      .filter(i => i.helpfulness === 'helpful' && i.emotion !== i.userMoodAtTime)
      .map(i => i.emotion);

    const avgDuration = group.reduce((sum, i) => sum + i.duration, 0) / group.length;

    patterns[emotion as EmotionCategory] = {
      mostEngagedContent: [...new Set(engaged)],
      averageDuration: avgDuration,
      preferredHealing: [...new Set(healing)] as EmotionCategory[],
      skipPatterns: [...new Set(skipped)],
    };
  }

  return patterns;
}
