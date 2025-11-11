'use client';

import { useEffect, useState, useCallback } from 'react';
import { useUser } from '@/firebase';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useRouter } from 'next/navigation';
import { SwipeableVibeDeck } from '@/components/feed/SwipeableVibeDeck';
import { MoodSelector } from '@/components/feed/MoodSelector';
import type { Vibe, EmotionCategory } from '@/lib/types';

export default function EmotionFeedPage() {
  const { user, isUserLoading: authLoading } = useUser();
  const { profile, isLoading: profileLoading, refetch: refetchProfile } = useUserProfile();
  const [vibes, setVibes] = useState<Vibe[]>([]);
  const [vibeCache, setVibeCache] = useState<Vibe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastTimestamp, setLastTimestamp] = useState<number | null>(null);
  const [currentMood, setCurrentMood] = useState<EmotionCategory | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (authLoading || profileLoading) return;

    if (!user) {
      router.push('/login');
      return;
    }

    const checkOnboarding = async () => {
      try {
        const response = await fetch(`/api/feed/preferences?userId=${user.uid}`);
        const data = await response.json();

        if (data.success && data.isNewUser) {
          router.push('/onboarding/emotions');
          return;
        }

        const hasMood = profile?.currentMood || profile?.preferredMoods?.[0];
        const hasCompletedOnboarding = profile?.onboardingCompleted;

        if (!hasMood && !hasCompletedOnboarding) {
          setIsLoading(false);
          return;
        }

        await loadFeed();
      } catch (err) {
        console.error('Error checking onboarding:', err);
        setError('Failed to load feed');
        setIsLoading(false);
      }
    };

    checkOnboarding();
  }, [user, authLoading, profileLoading, router, profile]);

  const loadFeed = async (append = false) => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const userMood = profile?.currentMood || profile?.preferredMoods?.[0] || (profile?.onboardingCompleted ? 'Happy' : null);
    
    if (!userMood) {
      setIsLoading(false);
      return;
    }

    if (append) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const response = await fetch('/api/feed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          userMood: userMood,
          limit: 30,
          afterTimestamp: append ? lastTimestamp : null,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to fetch feed');
      }

      const newVibes = result.feed || [];
      
      if (append) {
        setVibes(prev => [...prev, ...newVibes]);
      } else {
        setVibes(newVibes);
      }

      if (newVibes.length > 0) {
        const lastVibe = newVibes[newVibes.length - 1];
        const timestamp = lastVibe.timestamp?.seconds 
          ? lastVibe.timestamp.seconds * 1000
          : lastVibe.timestamp?.toMillis?.()
          || Date.now();
        setLastTimestamp(timestamp);
      }
      
      const updatedCache = append ? [...vibeCache, ...newVibes] : newVibes;
      const last10 = updatedCache.slice(-10);
      setVibeCache(last10);
      
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('vibe-cache', JSON.stringify(last10));
        } catch (e) {
          console.error('Failed to cache vibes:', e);
        }
      }
    } catch (err) {
      console.error('Error loading feed:', err);
      setError(err instanceof Error ? err.message : 'Failed to load feed');
    } finally {
      if (append) {
        setIsLoadingMore(false);
      } else {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('vibe-cache');
        if (cached) {
          setVibeCache(JSON.parse(cached));
        }
      } catch (e) {
        console.error('Failed to load cached vibes:', e);
      }
    }
  }, []);

  const loadMoreVibes = async () => {
    if (isLoadingMore) return;
    console.log('Loading more vibes...');
    await loadFeed(true);
  };

  const handleMoodChange = useCallback(async (newMood: EmotionCategory) => {
    setCurrentMood(newMood);
    refetchProfile();
    setLastTimestamp(null);
    setTimeout(() => {
      loadFeed(false);
    }, 500);
  }, [refetchProfile, loadFeed]);

  if (authLoading || profileLoading || isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-pink-600">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-xl font-medium">Loading your vibe feed...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-red-600 to-pink-600 p-6">
        <div className="text-center max-w-md">
          <p className="text-white text-xl font-medium mb-4">Oops! Something went wrong</p>
          <p className="text-white/80 mb-6">{error}</p>
          <button
            onClick={() => loadFeed()}
            className="px-6 py-3 bg-white text-red-600 rounded-full font-semibold hover:bg-white/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const hasMood = profile?.currentMood || profile?.preferredMoods?.[0];
  const hasCompletedOnboarding = profile?.onboardingCompleted;

  if (!hasMood && !hasCompletedOnboarding) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 p-6">
        <div className="text-center max-w-md">
          <div className="mb-6">
            <div className="text-6xl mb-4 animate-bounce">✨</div>
            <h1 className="text-white text-3xl font-bold mb-2">Welcome to Emotion Feed!</h1>
            <p className="text-white/90 text-lg mb-4">
              Discover vibes that match your feelings
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-white/20">
            {user && (
              <div className="mb-6">
                <p className="text-white/80 mb-4">
                  Select your current vibe to get started:
                </p>
                <div className="flex justify-center">
                  <MoodSelector
                    userId={user.uid}
                    currentMood={null}
                    onMoodChange={handleMoodChange}
                  />
                </div>
              </div>
            )}
            <p className="text-white/80 mb-4">
              Or complete the full onboarding to select multiple emotions
            </p>
            <p className="text-white text-sm">
              Select 3-5 emotions in the next step! 🎯
            </p>
          </div>

          <button
            onClick={() => router.push('/onboarding/emotions')}
            className="w-full px-8 py-4 bg-white text-purple-600 rounded-full font-bold text-lg hover:bg-white/90 transition-all transform hover:scale-105 shadow-lg mb-3"
          >
            Complete Full Onboarding 🚀
          </button>
          
          <button
            onClick={() => router.push('/')}
            className="text-white/80 hover:text-white text-sm underline"
          >
            Go to Home instead
          </button>
        </div>
      </div>
    );
  }

  const userMood = currentMood || profile?.currentMood || profile?.preferredMoods?.[0] || 'Happy';

  return (
    <div className="relative">
      <div className="absolute top-6 left-6 z-50">
        <MoodSelector
          userId={user!.uid}
          currentMood={userMood}
          onMoodChange={handleMoodChange}
        />
      </div>
      
      <SwipeableVibeDeck
        vibes={vibes}
        userMood={userMood}
        onNeedMore={loadMoreVibes}
      />
    </div>
  );
}
