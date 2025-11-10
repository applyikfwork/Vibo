'use client';

import { useState, useEffect } from 'react';
import type { EmotionCategory } from '@/lib/types';

export interface SocialProofData {
  vibeId: string;
  feelCount: number;
  feelCountLast24h: number;
  trendingScore: number;
  cityRank?: number;
  cityName?: string;
}

export function useSocialProof(vibeId: string) {
  const [data, setData] = useState<SocialProofData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!vibeId) {
      setIsLoading(false);
      return;
    }

    const loadSocialProof = async () => {
      try {
        const response = await fetch(`/api/social-proof/${vibeId}`);
        if (!response.ok) {
          throw new Error('Failed to load social proof data');
        }
        const result = await response.json();
        setData(result.data);
      } catch (err) {
        console.error('Error loading social proof:', err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSocialProof();
  }, [vibeId]);

  return { data, isLoading, error };
}

export function useCityTrending(city?: string) {
  const [trendingEmotion, setTrendingEmotion] = useState<{
    emotion: EmotionCategory;
    count: number;
    percentage: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!city) {
      setIsLoading(false);
      return;
    }

    const loadTrending = async () => {
      try {
        const response = await fetch(`/api/city-trending/${city}`);
        if (!response.ok) {
          throw new Error('Failed to load trending data');
        }
        const result = await response.json();
        setTrendingEmotion(result.data);
      } catch (err) {
        console.error('Error loading trending data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadTrending();
  }, [city]);

  return { trendingEmotion, isLoading };
}
