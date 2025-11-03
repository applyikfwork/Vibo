import { useState, useEffect, useCallback } from 'react';
import type { EmotionCategory } from '@/lib/types';

export type MoodTransition = {
  from: EmotionCategory | null;
  to: EmotionCategory;
  timestamp: Date;
  transitionSpeed: 'instant' | 'smooth' | 'gradual';
};

export function useMoodFlow(initialMood: EmotionCategory | null = null) {
  const [currentMood, setCurrentMood] = useState<EmotionCategory | null>(initialMood);
  const [previousMood, setPreviousMood] = useState<EmotionCategory | null>(null);
  const [moodHistory, setMoodHistory] = useState<MoodTransition[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const changeMood = useCallback((newMood: EmotionCategory | null) => {
    if (newMood === currentMood) return;

    setIsTransitioning(true);
    setPreviousMood(currentMood);

    if (currentMood && newMood) {
      const transition: MoodTransition = {
        from: currentMood,
        to: newMood,
        timestamp: new Date(),
        transitionSpeed: 'smooth',
      };
      setMoodHistory((prev) => [...prev, transition]);
    }

    setTimeout(() => {
      setCurrentMood(newMood);
      setIsTransitioning(false);
    }, 300);
  }, [currentMood]);

  const getMoodPattern = useCallback(() => {
    if (moodHistory.length < 2) return null;
    
    const recentHistory = moodHistory.slice(-5);
    const pattern = recentHistory.map(t => `${t.from} → ${t.to}`).join(' → ');
    
    return {
      pattern,
      transitions: recentHistory,
      mostCommonTransition: getMostCommonTransition(moodHistory),
    };
  }, [moodHistory]);

  return {
    currentMood,
    previousMood,
    moodHistory,
    isTransitioning,
    changeMood,
    getMoodPattern,
  };
}

function getMostCommonTransition(history: MoodTransition[]): string | null {
  if (history.length === 0) return null;

  const counts: Record<string, number> = {};
  history.forEach((t) => {
    const key = `${t.from} → ${t.to}`;
    counts[key] = (counts[key] || 0) + 1;
  });

  let maxCount = 0;
  let mostCommon = null;

  for (const [transition, count] of Object.entries(counts)) {
    if (count > maxCount) {
      maxCount = count;
      mostCommon = transition;
    }
  }

  return mostCommon;
}
