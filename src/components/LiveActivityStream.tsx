'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, MapPin, TrendingUp, Users, Radio } from 'lucide-react';
import { EmotionCategory, Vibe } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';

type ActivityEvent = {
  id: string;
  type: 'vibe_shared' | 'wave_started' | 'milestone_reached' | 'users_active';
  timestamp: Date;
  data: {
    userName?: string;
    emotion?: EmotionCategory;
    city?: string;
    location?: string;
    count?: number;
    message?: string;
  };
};

export function LiveActivityStream({ vibes, city }: { vibes: Vibe[]; city: string }) {
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [liveCount, setLiveCount] = useState(0);

  useEffect(() => {
    generateInitialActivities();
    
    // Simulate new activities every 5-15 seconds
    const interval = setInterval(() => {
      addNewActivity();
    }, 5000 + Math.random() * 10000);

    // Update live count every 3 seconds
    const liveInterval = setInterval(() => {
      setLiveCount(Math.floor(4 + Math.random() * 8));
    }, 3000);

    return () => {
      clearInterval(interval);
      clearInterval(liveInterval);
    };
  }, [vibes, city]);

  const generateInitialActivities = () => {
    const recent = vibes
      .slice(0, 10)
      .map((vibe, index) => generateActivityFromVibe(vibe, index));
    
    setActivities(recent);
  };

  const getTimestampInMillis = (timestamp: any): number => {
    if (!timestamp) return Date.now();
    if (typeof timestamp === 'number') return timestamp;
    if (timestamp instanceof Date) return timestamp.getTime();
    if (timestamp.toMillis && typeof timestamp.toMillis === 'function') return timestamp.toMillis();
    if (timestamp.seconds) return timestamp.seconds * 1000;
    return Date.now();
  };

  const generateActivityFromVibe = (vibe: Vibe, index: number): ActivityEvent => {
    const timestamp = vibe.createdAt || vibe.timestamp;
    const timeDate = new Date(getTimestampInMillis(timestamp));
    
    return {
      id: `${vibe.id}-${index}`,
      type: 'vibe_shared',
      timestamp: timeDate,
      data: {
        userName: vibe.author.name,
        emotion: vibe.emotion,
        city: vibe.location?.city || city,
        location: vibe.location?.city || 'nearby',
      },
    };
  };

  const addNewActivity = () => {
    const activityTypes: ActivityEvent['type'][] = ['vibe_shared', 'wave_started', 'users_active'];
    const type = activityTypes[Math.floor(Math.random() * activityTypes.length)];

    let newActivity: ActivityEvent;

    switch (type) {
      case 'vibe_shared':
        if (vibes.length === 0) return;
        const randomVibe = vibes[Math.floor(Math.random() * vibes.length)];
        newActivity = {
          id: `activity-${Date.now()}`,
          type: 'vibe_shared',
          timestamp: new Date(),
          data: {
            userName: randomVibe.author.name,
            emotion: randomVibe.emotion,
            city: randomVibe.location?.city || city,
          },
        };
        break;

      case 'wave_started':
        const emotions: EmotionCategory[] = ['Happy', 'Chill', 'Motivated', 'Funny'];
        newActivity = {
          id: `wave-${Date.now()}`,
          type: 'wave_started',
          timestamp: new Date(),
          data: {
            emotion: emotions[Math.floor(Math.random() * emotions.length)],
            city,
            message: 'Wave detected',
          },
        };
        break;

      case 'users_active':
        newActivity = {
          id: `users-${Date.now()}`,
          type: 'users_active',
          timestamp: new Date(),
          data: {
            count: Math.floor(10 + Math.random() * 40),
            city,
          },
        };
        break;
    }

    setActivities(prev => [newActivity, ...prev].slice(0, 20));
  };

  const getEmotionColor = (emotion: EmotionCategory) => {
    const colors: Record<EmotionCategory, string> = {
      'Happy': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'Sad': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'Chill': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'Motivated': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'Lonely': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'Angry': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'Neutral': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
      'Funny': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      'Festival Joy': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'Missing Home': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'Exam Stress': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'Wedding Excitement': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      'Religious Peace': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'Family Bonding': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'Career Anxiety': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'Festive Nostalgia': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    };
    return colors[emotion] || colors['Neutral'];
  };

  const getActivityIcon = (type: ActivityEvent['type']) => {
    switch (type) {
      case 'vibe_shared':
        return <MapPin className="h-4 w-4" />;
      case 'wave_started':
        return <TrendingUp className="h-4 w-4" />;
      case 'users_active':
        return <Users className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getActivityText = (activity: ActivityEvent): string => {
    switch (activity.type) {
      case 'vibe_shared':
        return `${activity.data.userName} shared a ${activity.data.emotion} vibe in ${activity.data.city}`;
      case 'wave_started':
        return `${activity.data.emotion} Wave spreading across ${activity.data.city}!`;
      case 'users_active':
        return `${activity.data.count} people viewing emotions near you`;
      default:
        return 'Activity detected';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Radio className="h-5 w-5 text-red-500 animate-pulse" />
              Live Activity Stream
            </CardTitle>
            <CardDescription>
              Real-time vibe sharing happening right now
            </CardDescription>
          </div>
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <Badge variant="destructive" className="gap-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              LIVE
            </Badge>
          </motion.div>
        </div>
      </CardHeader>
      <CardContent>
        {liveCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg border border-blue-200 dark:border-blue-800"
          >
            <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
              ✨ {liveCount} people are sharing their vibes right now...
            </p>
          </motion.div>
        )}

        <ScrollArea className="h-[400px] pr-4">
          <AnimatePresence mode="popLayout">
            {activities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="mb-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1 text-muted-foreground">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {getActivityText(activity)}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                      </p>
                      {activity.data.emotion && (
                        <Badge variant="secondary" className={getEmotionColor(activity.data.emotion)}>
                          {activity.data.emotion}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
