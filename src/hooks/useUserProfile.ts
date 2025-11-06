'use client';

import { useEffect, useState } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';

export function useUserProfile() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [profile, setProfile] = useState<Partial<UserProfile> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  useEffect(() => {
    async function fetchProfile() {
      if (!user || !firestore) {
        setProfile(null);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          setProfile(userDoc.data() as Partial<UserProfile>);
        } else {
          setProfile(null);
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError(err as Error);
        setProfile(null);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfile();
  }, [user, firestore, refetchTrigger]);

  const refetch = () => setRefetchTrigger(prev => prev + 1);

  return { profile, isLoading, error, refetch };
}
