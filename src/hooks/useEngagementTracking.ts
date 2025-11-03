import { useEffect, useRef, useState } from 'react';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { useFirestore } from '@/firebase';

export function useViewDurationTracking(vibeId: string, enabled: boolean = true) {
  const firestore = useFirestore();
  const startTimeRef = useRef<number>(Date.now());
  const [viewDuration, setViewDuration] = useState(0);

  useEffect(() => {
    if (!enabled || !vibeId || !firestore) return;

    startTimeRef.current = Date.now();

    const handleVisibilityChange = () => {
      if (document.hidden) {
        const duration = (Date.now() - startTimeRef.current) / 1000; // seconds
        setViewDuration(prev => prev + duration);
      } else {
        startTimeRef.current = Date.now();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      // Save final view duration on unmount
      const finalDuration = (Date.now() - startTimeRef.current) / 1000;
      if (finalDuration > 1) { // Only save if viewed for more than 1 second
        const vibeRef = doc(firestore, 'all-vibes', vibeId);
        updateDoc(vibeRef, {
          totalViewDuration: increment(finalDuration),
          viewCount: increment(1),
        }).catch(err => console.error('Failed to update view duration:', err));
      }
    };
  }, [vibeId, enabled, firestore]);

  return viewDuration;
}

export function useSessionTracking(userId: string) {
  const [sessionStart] = useState(Date.now());
  const [activeTime, setActiveTime] = useState<'Morning' | 'Afternoon' | 'Evening' | 'Night'>('Morning');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setActiveTime('Morning');
    else if (hour >= 12 && hour < 17) setActiveTime('Afternoon');
    else if (hour >= 17 && hour < 21) setActiveTime('Evening');
    else setActiveTime('Night');
  }, []);

  const getSessionDuration = () => {
    return (Date.now() - sessionStart) / (1000 * 60); // minutes
  };

  return { activeTime, getSessionDuration };
}
