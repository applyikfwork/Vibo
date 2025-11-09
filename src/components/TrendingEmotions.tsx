'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { TrendingUp, Flame } from 'lucide-react';
import { EMOTION_ICONS, getMoodColor } from '@/lib/geo-utils';
import type { Vibe } from '@/lib/types';

interface TrendingEmotionsProps {
  vibes: Vibe[];
  cityName?: string;
}

export function TrendingEmotions({ vibes, cityName }: TrendingEmotionsProps) {
  const emotionStats = useMemo(() => {
    const stats: Record<string, number> = {};
    vibes.forEach(vibe => {
      stats[vibe.emotion] = (stats[vibe.emotion] || 0) + 1;
    });

    const total = vibes.length;
    return Object.entries(stats)
      .map(([emotion, count]) => ({
        emotion,
        count,
        percentage: Math.round((count / total) * 100),
        color: getMoodColor(emotion),
        icon: EMOTION_ICONS[emotion] || '💭'
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [vibes]);

  const topEmotion = emotionStats[0];

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-600" />
              Trending Emotions
            </CardTitle>
            <CardDescription>
              {cityName ? `What ${cityName} is feeling` : 'Real-time emotion breakdown'}
            </CardDescription>
          </div>
          {topEmotion && (
            <div className="text-4xl">{topEmotion.icon}</div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {emotionStats.map((stat, index) => (
            <motion.div
              key={stat.emotion}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{stat.icon}</span>
                  <span className="font-semibold">{stat.emotion}</span>
                  {index === 0 && (
                    <Badge variant="secondary" className="text-xs">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      #1
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold" style={{ color: stat.color }}>
                    {stat.percentage}%
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({stat.count})
                  </span>
                </div>
              </div>
              <Progress 
                value={stat.percentage} 
                className="h-2"
                style={{
                  // @ts-ignore
                  '--progress-background': stat.color
                }}
              />
            </motion.div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t">
          <p className="text-sm text-center text-muted-foreground">
            Based on {vibes.length} vibes • Updated live
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
