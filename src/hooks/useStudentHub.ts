'use client';

import { useState, useEffect, useCallback } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { StudentHubService } from '@/lib/student-hub-services';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import type { StudentProfile } from '@/lib/student-hub-services';

export function useStudentHub() {
  const firestore = useFirestore();
  const { user } = useUser();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [service, setService] = useState<StudentHubService | null>(null);

  useEffect(() => {
    if (firestore) {
      setService(new StudentHubService(firestore));
    }
  }, [firestore]);

  useEffect(() => {
    if (!user || !firestore) {
      setLoading(false);
      return;
    }

    const loadProfile = async () => {
      try {
        const profileRef = doc(firestore, 'student-profiles', user.uid);
        const profileDoc = await getDoc(profileRef);

        if (profileDoc.exists()) {
          setProfile(profileDoc.data() as StudentProfile);
        } else {
          // Create default profile
          const defaultProfile: StudentProfile = {
            userId: user.uid,
            examStressModeEnabled: false,
            studyBreakRemindersEnabled: false,
            stressVibeCount: 0,
            totalStudyTime: 0,
            currentMoodTrend: 'stable',
            weeklyMoodSummary: {
              happy: 0,
              stressed: 0,
              sad: 0,
              motivated: 0,
            },
          };
          
          await setDoc(profileRef, defaultProfile);
          setProfile(defaultProfile);
        }
      } catch (error) {
        console.error('Error loading student profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user, firestore]);

  const toggleExamStressMode = useCallback(async (enabled: boolean) => {
    if (!service || !user) return;

    try {
      if (enabled) {
        await service.enableExamStressMode(user.uid);
      } else {
        await service.disableExamStressMode(user.uid);
      }
      
      setProfile(prev => prev ? { ...prev, examStressModeEnabled: enabled } : null);
    } catch (error) {
      console.error('Error toggling exam stress mode:', error);
    }
  }, [service, user]);

  const toggleStudyBreakReminders = useCallback(async (enabled: boolean) => {
    if (!service || !user) return;

    try {
      if (enabled) {
        await service.enableStudyBreakReminders(user.uid);
      } else {
        await service.disableStudyBreakReminders(user.uid);
      }
      
      setProfile(prev => prev ? { ...prev, studyBreakRemindersEnabled: enabled } : null);
    } catch (error) {
      console.error('Error toggling study break reminders:', error);
    }
  }, [service, user]);

  const checkBreakNeeded = useCallback(async (): Promise<boolean> => {
    if (!service || !user) return false;

    try {
      return await service.checkIfBreakNeeded(user.uid);
    } catch (error) {
      console.error('Error checking if break needed:', error);
      return false;
    }
  }, [service, user]);

  const recordBreak = useCallback(async (durationMinutes: number) => {
    if (!service || !user) return;

    try {
      await service.recordBreakTaken(user.uid, durationMinutes);
    } catch (error) {
      console.error('Error recording break:', error);
    }
  }, [service, user]);

  const joinPeerCircle = useCallback(async (topic: 'exam-stress' | 'career-anxiety' | 'general-support'): Promise<string | null> => {
    if (!service || !user) return null;

    try {
      return await service.joinStudentCircle(user.uid, topic);
    } catch (error) {
      console.error('Error joining peer circle:', error);
      return null;
    }
  }, [service, user]);

  const linkParent = useCallback(async (parentEmail: string) => {
    if (!service || !user) return;

    try {
      await service.linkParentAccount(user.uid, parentEmail);
      setProfile(prev => prev ? { ...prev, linkedParentEmail: parentEmail } : null);
    } catch (error) {
      console.error('Error linking parent account:', error);
    }
  }, [service, user]);

  const updateMoodTrend = useCallback(async () => {
    if (!service || !user) return;

    try {
      await service.updateMoodTrend(user.uid);
    } catch (error) {
      console.error('Error updating mood trend:', error);
    }
  }, [service, user]);

  return {
    profile,
    loading,
    toggleExamStressMode,
    toggleStudyBreakReminders,
    checkBreakNeeded,
    recordBreak,
    joinPeerCircle,
    linkParent,
    updateMoodTrend,
  };
}
