'use client';

import { useState, useEffect } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import type { EmotionInsights, UserInterestProfile, EmotionCategory } from '@/lib/types';
import { buildEmotionInsights, buildUserInterestProfile } from '@/lib/emotion-intelligence';

export function useEmotionIntelligence() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [emotionInsights, setEmotionInsights] = useState<EmotionInsights | null>(null);
  const [interestProfile, setInterestProfile] = useState<UserInterestProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user || !firestore) return;

    const loadEmotionIntelligence = async () => {
      setIsLoading(true);
      try {
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          if (userData.emotionInsights) {
            setEmotionInsights(userData.emotionInsights);
          }
          
          if (userData.interestProfile) {
            setInterestProfile(userData.interestProfile);
          }
          
          if (!userData.emotionInsights || !userData.interestProfile) {
            const reactionsQuery = query(
              collection(firestore, 'reactions'),
              where('userId', '==', user.uid),
              orderBy('timestamp', 'desc'),
              limit(100)
            );
            const reactionsSnapshot = await getDocs(reactionsQuery);
            const reactions = reactionsSnapshot.docs.map(doc => doc.data());
            
            const vibesQuery = query(
              collection(firestore, 'vibes'),
              where('userId', '==', user.uid),
              orderBy('timestamp', 'desc'),
              limit(50)
            );
            const vibesSnapshot = await getDocs(vibesQuery);
            const vibes = vibesSnapshot.docs.map(doc => doc.data());
            
            const insights = buildEmotionInsights(userData, reactions as any);
            const profile = buildUserInterestProfile(userData, vibes as any);
            
            setEmotionInsights(insights);
            setInterestProfile(profile);
            
            await updateDoc(userDocRef, {
              emotionInsights: insights,
              interestProfile: profile
            });
          }
        }
      } catch (err) {
        console.error('Error loading emotion intelligence:', err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    loadEmotionIntelligence();
  }, [user, firestore]);

  const refreshIntelligence = async () => {
    if (!user || !firestore) return;
    
    setIsLoading(true);
    try {
      const reactionsQuery = query(
        collection(firestore, 'reactions'),
        where('userId', '==', user.uid),
        orderBy('timestamp', 'desc'),
        limit(100)
      );
      const reactionsSnapshot = await getDocs(reactionsQuery);
      const reactions = reactionsSnapshot.docs.map(doc => doc.data());
      
      const vibesQuery = query(
        collection(firestore, 'vibes'),
        where('userId', '==', user.uid),
        orderBy('timestamp', 'desc'),
        limit(50)
      );
      const vibesSnapshot = await getDocs(vibesQuery);
      const vibes = vibesSnapshot.docs.map(doc => doc.data());
      
      const userDocRef = doc(firestore, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      const userData = userDoc.data() || {};
      
      const insights = buildEmotionInsights(userData, reactions as any);
      const profile = buildUserInterestProfile(userData, vibes as any);
      
      setEmotionInsights(insights);
      setInterestProfile(profile);
      
      await updateDoc(userDocRef, {
        emotionInsights: insights,
        interestProfile: profile
      });
    } catch (err) {
      console.error('Error refreshing intelligence:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    emotionInsights,
    interestProfile,
    isLoading,
    error,
    refreshIntelligence
  };
}
