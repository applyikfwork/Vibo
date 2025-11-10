'use client';

import { useState, useEffect } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import type { VibeStreak, EmotionExplorerProgress } from '@/lib/types';

export function useVibeStreaks() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [vibeStreak, setVibeStreak] = useState<VibeStreak | null>(null);
  const [emotionExplorer, setEmotionExplorer] = useState<EmotionExplorerProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user || !firestore) {
      setIsLoading(false);
      return;
    }

    const loadStreaks = async () => {
      try {
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setVibeStreak(userData.vibeStreak || {
            currentStreak: 0,
            longestStreak: 0,
            lastVibeDate: null
          });
          
          setEmotionExplorer(userData.emotionExplorer || {
            emotionsExplored: [],
            totalUniqueEmotions: 0,
            explorerLevel: 0
          });
        }
      } catch (err) {
        console.error('Error loading streaks:', err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStreaks();
  }, [user, firestore]);

  return { vibeStreak, emotionExplorer, isLoading, error };
}
