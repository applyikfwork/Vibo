import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@/firebase';
import { EmotionCategory, Location } from '@/lib/types';

interface GeoVibeNotification {
  id: string;
  type: 'achievement' | 'neighborhood' | 'storm' | 'wave' | 'challenge';
  title: string;
  message: string;
  emotion?: EmotionCategory;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

export function useGeoVibeNotifications(userLocation?: Location) {
  const { user } = useUser();
  const [notifications, setNotifications] = useState<GeoVibeNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    checkForNotifications();

    const interval = setInterval(checkForNotifications, 60000);
    return () => clearInterval(interval);
  }, [user, userLocation]);

  const checkForNotifications = useCallback(async () => {
    if (!user || !userLocation) return;

    const newNotifications: GeoVibeNotification[] = [];

    if (Math.random() > 0.7) {
      newNotifications.push({
        id: `notif-${Date.now()}`,
        type: 'neighborhood',
        title: 'Your neighborhood needs happy vibes!',
        message: 'Post now to boost the mood in your area and earn +50 XP',
        emotion: 'Happy',
        timestamp: new Date(),
        read: false,
      });
    }

    if (Math.random() > 0.85) {
      newNotifications.push({
        id: `notif-${Date.now()}-1`,
        type: 'achievement',
        title: 'First calm vibe of the day!',
        message: 'You\'re the first to post a calm vibe in your area today! +50 XP',
        emotion: 'Chill',
        timestamp: new Date(),
        read: false,
      });
    }

    if (Math.random() > 0.9) {
      newNotifications.push({
        id: `notif-${Date.now()}-2`,
        type: 'storm',
        title: 'Emotional storm detected',
        message: '5 people near you feeling stressed. Want to send support?',
        emotion: 'Sad',
        timestamp: new Date(),
        read: false,
        actionUrl: '/geovibe',
      });
    }

    if (Math.random() > 0.8) {
      newNotifications.push({
        id: `notif-${Date.now()}-3`,
        type: 'wave',
        title: 'Wave of Joy spreading!',
        message: 'Happy vibes are flowing through your city right now 🌊',
        emotion: 'Happy',
        timestamp: new Date(),
        read: false,
      });
    }

    if (Math.random() > 0.75) {
      const similarCount = Math.floor(Math.random() * 10) + 1;
      newNotifications.push({
        id: `notif-${Date.now()}-4`,
        type: 'neighborhood',
        title: 'Similar vibes detected!',
        message: `${similarCount} people near you feeling similar emotions - want to connect?`,
        timestamp: new Date(),
        read: false,
      });
    }

    if (newNotifications.length > 0) {
      setNotifications(prev => [...newNotifications, ...prev].slice(0, 20));
      setUnreadCount(prev => prev + newNotifications.length);
      
      if ('Notification' in window && Notification.permission === 'granted') {
        newNotifications.forEach(notif => {
          new Notification(notif.title, {
            body: notif.message,
            icon: '/icon-192x192.png',
            badge: '/icon-192x192.png',
          });
        });
      }
    }
  }, [user, userLocation]);

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    setUnreadCount(0);
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    requestNotificationPermission,
  };
}
