'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PenLine, Users, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type TypingActivity = {
  count: number;
  action: 'sharing' | 'reacting' | 'viewing';
  location?: string;
};

export function TypingActivityIndicator({ city }: { city?: string }) {
  const [activity, setActivity] = useState<TypingActivity>({ count: 0, action: 'viewing' });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Randomly show/hide typing indicator
    const visibilityInterval = setInterval(() => {
      const shouldShow = Math.random() > 0.4; // 60% chance to show
      setIsVisible(shouldShow);
      
      if (shouldShow) {
        // Generate random activity
        const actions: TypingActivity['action'][] = ['sharing', 'reacting', 'viewing'];
        const action = actions[Math.floor(Math.random() * actions.length)];
        const count = Math.floor(Math.random() * 12) + 1; // 1-12 people
        
        setActivity({
          count,
          action,
          location: city || 'near you',
        });
      }
    }, 8000 + Math.random() * 4000); // Every 8-12 seconds

    return () => clearInterval(visibilityInterval);
  }, [city]);

  const getActivityText = () => {
    const { count, action, location } = activity;
    const plural = count > 1 ? 'people' : 'person';
    
    switch (action) {
      case 'sharing':
        return `${count} ${plural} sharing vibes ${location ? `in ${location}` : ''} right now`;
      case 'reacting':
        return `${count} ${plural} reacting to vibes ${location ? `in ${location}` : ''} right now`;
      case 'viewing':
        return `${count} ${plural} viewing emotions ${location ? `near ${location}` : ''} right now`;
      default:
        return `${count} ${plural} active right now`;
    }
  };

  const getActivityIcon = () => {
    switch (activity.action) {
      case 'sharing':
        return <PenLine className="h-3 w-3" />;
      case 'reacting':
        return <Users className="h-3 w-3" />;
      case 'viewing':
        return <MapPin className="h-3 w-3" />;
      default:
        return <Users className="h-3 w-3" />;
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="inline-block"
        >
          <Badge variant="secondary" className="gap-2 py-1.5 px-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-blue-200 dark:border-blue-800">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              {getActivityIcon()}
            </motion.div>
            
            <span className="text-xs font-medium text-blue-900 dark:text-blue-100">
              ✨ {getActivityText()}
            </span>
            
            {/* Animated dots */}
            <div className="flex gap-0.5">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-1 h-1 rounded-full bg-blue-600 dark:bg-blue-400"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.5,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>
          </Badge>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
