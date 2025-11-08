import { useCallback, useEffect, useState, useRef } from 'react';
import { useToast } from './use-toast';
import { HubNotification } from '@/lib/types';
import { initializeFirebase } from '@/firebase';
import { collection, query, where, onSnapshot, orderBy, limit, Timestamp } from 'firebase/firestore';

interface HubNotificationsOptions {
  userId: string | null;
  joinedHubs: string[];
  enableNotifications?: boolean;
}

export function useHubNotifications({
  userId,
  joinedHubs,
  enableNotifications = true
}: HubNotificationsOptions) {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<HubNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const lastNotificationTime = useRef<Date>(new Date());
  const hasPermission = useRef(false);
  const cleanupRef = useRef<(() => void) | null>(null);

  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      hasPermission.current = permission === 'granted';
      return permission === 'granted';
    }
    hasPermission.current = Notification.permission === 'granted';
    return Notification.permission === 'granted';
  }, []);

  const showBrowserNotification = useCallback((notification: HubNotification) => {
    if (!enableNotifications) return;

    if ('Notification' in window && Notification.permission === 'granted') {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        tag: `hub-${notification.hubId}-${notification.type}`,
        data: {
          url: notification.actionUrl || `/hubs/${notification.hubId}`
        },
        requireInteraction: notification.type === 'milestone'
      });

      browserNotification.onclick = () => {
        window.focus();
        if (notification.actionUrl) {
          window.location.href = notification.actionUrl;
        } else {
          window.location.href = `/hubs/${notification.hubId}`;
        }
        browserNotification.close();
      };
    } else {
      toast({
        title: `${notification.hubIcon} ${notification.title}`,
        description: notification.message,
        duration: 5000,
      });
    }
  }, [toast, enableNotifications]);

  const checkHubActivity = useCallback(async () => {
    if (!userId || joinedHubs.length === 0 || !enableNotifications) return;

    try {
      const { firestore } = initializeFirebase();
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

      const unsubscribes: (() => void)[] = [];

      for (const hubId of joinedHubs) {
        const hubThemeMap: { [key: string]: string } = {
          'motivation-hub': 'Motivated',
          'alone-zone': 'Lonely',
          'happy-vibes': 'Happy',
          'study-support': 'Exam Stress',
          'chill-corner': 'Chill'
        };

        const hubNames: { [key: string]: string } = {
          'motivation-hub': 'Motivation Station',
          'alone-zone': 'Alone Zone',
          'happy-vibes': 'Happy Vibes Only',
          'study-support': 'Study Support',
          'chill-corner': 'Chill Corner'
        };

        const hubIcons: { [key: string]: string } = {
          'motivation-hub': '💪',
          'alone-zone': '🌙',
          'happy-vibes': '😊',
          'study-support': '📚',
          'chill-corner': '🧘'
        };

        const theme = hubThemeMap[hubId];
        const hubName = hubNames[hubId];
        const hubIcon = hubIcons[hubId];

        if (!theme) continue;

        const vibesQuery = query(
          collection(firestore, 'all-vibes'),
          where('emotion', '==', theme),
          where('timestamp', '>', Timestamp.fromDate(fiveMinutesAgo)),
          orderBy('timestamp', 'desc'),
          limit(5)
        );

        const unsubscribe = onSnapshot(vibesQuery, (snapshot) => {
          if (snapshot.empty) return;

          const newPosts = snapshot.docs.filter(doc => {
            const postTime = doc.data().timestamp?.toDate();
            return postTime && postTime > lastNotificationTime.current;
          });

          if (newPosts.length > 0) {
            const latestPost = newPosts[0];
            const postData = latestPost.data();

            if (postData.userId !== userId) {
              const notification: HubNotification = {
                id: `${hubId}-new-post-${latestPost.id}`,
                hubId,
                hubName,
                hubIcon,
                type: 'new_post',
                title: `New post in ${hubName}`,
                message: `${postData.author?.name || 'Someone'} just shared their ${theme} vibe`,
                timestamp: Timestamp.now(),
                read: false,
                actionUrl: `/vibe/${latestPost.id}`,
                metadata: {
                  postId: latestPost.id
                }
              };

              setNotifications(prev => [notification, ...prev].slice(0, 50));
              setUnreadCount(prev => prev + 1);
              showBrowserNotification(notification);
            }
          }
        });

        unsubscribes.push(unsubscribe);
      }

      return () => {
        unsubscribes.forEach(unsub => unsub());
      };
    } catch (error) {
      console.error('Error checking hub activity:', error);
    }
  }, [userId, joinedHubs, enableNotifications, showBrowserNotification]);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  useEffect(() => {
    if (!userId || !enableNotifications) return;

    requestNotificationPermission();
    
    let isMounted = true;
    
    const setupListeners = async () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
      const cleanup = await checkHubActivity();
      if (isMounted) {
        cleanupRef.current = cleanup || null;
      } else if (cleanup) {
        cleanup();
      }
    };

    const interval = setInterval(() => {
      if (isMounted) {
        setupListeners();
      }
    }, 5 * 60 * 1000);

    setupListeners();

    return () => {
      isMounted = false;
      clearInterval(interval);
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, [userId, enableNotifications, checkHubActivity, requestNotificationPermission]);

  useEffect(() => {
    lastNotificationTime.current = new Date();
  }, [joinedHubs]);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    hasPermission: hasPermission.current
  };
}
