import { useCallback, useRef } from 'react';
import { useUser } from '@/firebase';
import type { EmotionCategory } from '@/lib/types';

interface EngagementData {
  userId: string;
  vibeId: string;
  emotion: EmotionCategory;
  textLength: number;
  viewStartTime: number;
  listenedMs?: number;
  completed?: boolean;
  interactions: {
    interest?: boolean;
    share?: boolean;
    skip?: boolean;
    reactions?: string[];
    moreLikeThis?: boolean;
  };
}

export function useFeedEngagement() {
  const { user } = useUser();
  const engagementDataRef = useRef<Map<string, EngagementData>>(new Map());
  const listenProgressRef = useRef<Map<string, { lastReported: number }>>(new Map());

  const trackView = useCallback((vibeId: string, emotion: EmotionCategory, textLength: number) => {
    if (!user) return;

    const data: EngagementData = {
      userId: user.uid,
      vibeId,
      emotion,
      textLength,
      viewStartTime: Date.now(),
      interactions: {},
    };

    engagementDataRef.current.set(vibeId, data);
  }, [user]);

  const trackInteraction = useCallback(async (
    vibeId: string,
    type: 'interest' | 'share' | 'react' | 'skip' | 'more-like-this',
    emoji?: string
  ) => {
    if (!user) return;

    const data = engagementDataRef.current.get(vibeId);
    if (!data) return;

    if (type === 'interest') {
      data.interactions.interest = true;
    } else if (type === 'share') {
      data.interactions.share = true;
    } else if (type === 'skip') {
      data.interactions.skip = true;
    } else if (type === 'react' && emoji) {
      if (!data.interactions.reactions) {
        data.interactions.reactions = [];
      }
      data.interactions.reactions.push(emoji);
    } else if (type === 'more-like-this') {
      data.interactions.moreLikeThis = true;
    }

    try {
      await fetch('/api/feed/engagement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          viewDuration: (Date.now() - data.viewStartTime) / 1000,
        }),
      });
    } catch (error) {
      console.error('Failed to track interaction:', error);
    }
  }, [user]);

  const trackListenProgress = useCallback((vibeId: string, currentTime: number, duration: number) => {
    if (!user) return;

    const progressData = listenProgressRef.current.get(vibeId) || { lastReported: 0 };

    if (currentTime - progressData.lastReported >= 5) {
      const data = engagementDataRef.current.get(vibeId);
      
      if (!data) {
        console.warn('No engagement data found for vibe:', vibeId);
        return;
      }

      data.listenedMs = currentTime * 1000;
      data.completed = currentTime >= duration * 0.9;

      listenProgressRef.current.set(vibeId, { lastReported: currentTime });

      fetch('/api/feed/engagement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          listenedMs: currentTime * 1000,
          completed: currentTime >= duration * 0.9,
          viewDuration: (Date.now() - data.viewStartTime) / 1000,
        }),
      }).catch(error => {
        console.error('Failed to track listen progress:', error);
      });
    }
  }, [user]);

  return {
    trackView,
    trackInteraction,
    trackListenProgress,
  };
}
