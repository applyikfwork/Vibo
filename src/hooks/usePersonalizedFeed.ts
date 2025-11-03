import { useState, useEffect } from 'react';
import type { RankedVibe, EmotionCategory } from '@/lib/types';

export type PersonalizedFeedResult = {
  feed: RankedVibe[];
  zones: {
    myVibeZone: RankedVibe[];
    healingZone: RankedVibe[];
    exploreZone: RankedVibe[];
  };
  metadata?: {
    totalVibes: number;
    rankedVibes: number;
    userMood: string;
    algorithm: string;
  };
};

export function usePersonalizedFeed(
  userId: string | null,
  userMood: EmotionCategory | null,
  enabled: boolean = true
) {
  const [data, setData] = useState<PersonalizedFeedResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!enabled || !userId || !userMood) {
      setData(null);
      return;
    }

    const fetchFeed = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/feed', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            userMood,
            limit: 30,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch feed: ${response.statusText}`);
        }

        const result = await response.json();
        
        if (result.success) {
          setData({
            feed: result.feed,
            zones: result.zones,
            metadata: result.metadata,
          });
        } else {
          throw new Error(result.error || 'Failed to fetch personalized feed');
        }
      } catch (err) {
        console.error('Error fetching personalized feed:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeed();
  }, [userId, userMood, enabled]);

  const refetch = () => {
    if (userId && userMood) {
      setIsLoading(true);
    }
  };

  return { data, isLoading, error, refetch };
}
