'use client';

import { useEffect, useCallback } from 'react';
import { useStudentHub } from './useStudentHub';
import { useToast } from './use-toast';

export function useStudyBreakNotifications() {
  const { profile, checkBreakNeeded, recordBreak } = useStudentHub();
  const { toast } = useToast();

  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  }, []);

  const showBreakNotification = useCallback(() => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification('⏰ Study Break Reminder', {
        body: "You've been stressed for over 2 hours. Time for a 10-minute break! 🧘‍♂️",
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        tag: 'study-break',
        requireInteraction: true,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } else {
      // Fallback to toast notification
      toast({
        title: '⏰ Study Break Reminder',
        description: "You've been stressed for over 2 hours. Time for a 10-minute break! 🧘‍♂️",
        duration: 10000,
      });
    }
  }, [toast]);

  const checkAndNotify = useCallback(async () => {
    if (!profile?.studyBreakRemindersEnabled) return;

    const breakNeeded = await checkBreakNeeded();
    if (breakNeeded) {
      showBreakNotification();
    }
  }, [profile, checkBreakNeeded, showBreakNotification]);

  // Check every 15 minutes
  useEffect(() => {
    if (!profile?.studyBreakRemindersEnabled) return;

    requestNotificationPermission();

    const interval = setInterval(() => {
      checkAndNotify();
    }, 15 * 60 * 1000); // 15 minutes

    // Initial check
    checkAndNotify();

    return () => clearInterval(interval);
  }, [profile, checkAndNotify, requestNotificationPermission]);

  return {
    recordBreak,
    checkAndNotify,
  };
}
