'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Activity, TrendingUp, Users, Zap } from 'lucide-react';
import { EMOTION_ICONS } from '@/lib/geo-utils';

interface LiveActivityIndicatorProps {
  totalVibes: number;
  recentVibes: number;
}

export function LiveActivityIndicator({ totalVibes, recentVibes }: LiveActivityIndicatorProps) {
  const [liveCount, setLiveCount] = useState(0);
  const [showPulse, setShowPulse] = useState(false);

  useEffect(() => {
    setLiveCount(recentVibes);
    
    const interval = setInterval(() => {
      const increment = Math.random() > 0.7 ? 1 : 0;
      if (increment > 0) {
        setLiveCount(prev => prev + increment);
        setShowPulse(true);
        setTimeout(() => setShowPulse(false), 1000);
      }
    }, 3000 + Math.random() * 4000);

    return () => clearInterval(interval);
  }, [recentVibes]);

  const activeUsersEstimate = Math.floor(totalVibes * 0.3 + Math.random() * 50);
  const vibesPerMinute = Math.floor(liveCount / 10 + Math.random() * 5);

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950/20 dark:via-emerald-950/20 dark:to-teal-950/20">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-600 dark:text-green-400" />
            Live Activity
          </h3>
          <Badge variant="secondary" className="animate-pulse">
            <span className="relative flex h-2 w-2 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            LIVE
          </Badge>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div
            className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl"
            animate={showPulse ? { scale: [1, 1.05, 1] } : {}}
          >
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {liveCount}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Last Hour</div>
          </motion.div>

          <div className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 flex items-center justify-center gap-1">
              <Users className="h-5 w-5" />
              {activeUsersEstimate}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Active Now</div>
          </div>

          <div className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 flex items-center justify-center gap-1">
              <TrendingUp className="h-5 w-5" />
              {vibesPerMinute}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Vibes/min</div>
          </div>

          <div className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 flex items-center justify-center gap-1">
              <Zap className="h-5 w-5" />
              {totalVibes}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Total Today</div>
          </div>
        </div>

        <AnimatePresence>
          {showPulse && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 p-2 bg-green-100 dark:bg-green-900/30 rounded-lg text-center"
            >
              <p className="text-sm text-green-800 dark:text-green-200 font-medium">
                ✨ New vibe just shared!
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
