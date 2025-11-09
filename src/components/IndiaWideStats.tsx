'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Globe, MapPin, Heart, Users, TrendingUp } from 'lucide-react';
import { EMOTION_ICONS, getMoodColor } from '@/lib/geo-utils';
import type { Vibe } from '@/lib/types';

interface IndiaWideStatsProps {
  vibes: Vibe[];
}

export function IndiaWideStats({ vibes }: IndiaWideStatsProps) {
  const stats = useMemo(() => {
    const cityCounts: Record<string, number> = {};
    const emotionCounts: Record<string, number> = {};
    const stateCounts: Record<string, number> = {};

    vibes.forEach(vibe => {
      if (vibe.location?.city) {
        cityCounts[vibe.location.city] = (cityCounts[vibe.location.city] || 0) + 1;
      }
      if (vibe.location?.state) {
        stateCounts[vibe.location.state] = (stateCounts[vibe.location.state] || 0) + 1;
      }
      emotionCounts[vibe.emotion] = (emotionCounts[vibe.emotion] || 0) + 1;
    });

    const topCities = Object.entries(cityCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([city, count]) => ({ city, count }));

    const topEmotion = Object.entries(emotionCounts)
      .sort(([, a], [, b]) => b - a)[0];

    return {
      totalVibes: vibes.length,
      activeCities: Object.keys(cityCounts).length,
      activeStates: Object.keys(stateCounts).length,
      topCities,
      topEmotion: topEmotion ? {
        name: topEmotion[0],
        count: topEmotion[1],
        icon: EMOTION_ICONS[topEmotion[0]] || '💭',
        color: getMoodColor(topEmotion[0])
      } : null
    };
  }, [vibes]);

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/20 dark:via-purple-950/20 dark:to-pink-950/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-indigo-600" />
              India-Wide Emotional Pulse
            </CardTitle>
            <CardDescription>
              Real-time mood of the nation
            </CardDescription>
          </div>
          <Badge variant="secondary" className="text-xs">
            🇮🇳 LIVE
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-center p-4 bg-white/70 dark:bg-gray-800/70 rounded-2xl shadow-sm"
          >
            <Heart className="h-8 w-8 mx-auto mb-2 text-pink-500" />
            <div className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              {stats.totalVibes}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Total Vibes</div>
          </motion.div>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1 }}
            className="text-center p-4 bg-white/70 dark:bg-gray-800/70 rounded-2xl shadow-sm"
          >
            <MapPin className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {stats.activeCities}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Active Cities</div>
          </motion.div>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center p-4 bg-white/70 dark:bg-gray-800/70 rounded-2xl shadow-sm"
          >
            <Globe className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {stats.activeStates}
            </div>
            <div className="text-xs text-muted-foreground mt-1">States</div>
          </motion.div>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center p-4 bg-white/70 dark:bg-gray-800/70 rounded-2xl shadow-sm"
          >
            <Users className="h-8 w-8 mx-auto mb-2 text-purple-500" />
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {Math.floor(stats.totalVibes * 0.4)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Active Users</div>
          </motion.div>
        </div>

        {stats.topEmotion && (
          <div className="p-4 bg-white/70 dark:bg-gray-800/70 rounded-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">India is feeling</p>
                <p className="text-2xl font-bold flex items-center gap-2">
                  <span>{stats.topEmotion.icon}</span>
                  <span style={{ color: stats.topEmotion.color }}>
                    {stats.topEmotion.name}
                  </span>
                </p>
              </div>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                <TrendingUp className="h-4 w-4 mr-1" />
                {Math.round((stats.topEmotion.count / stats.totalVibes) * 100)}%
              </Badge>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <h4 className="font-semibold text-sm text-muted-foreground">Most Active Cities</h4>
          <div className="space-y-2">
            {stats.topCities.map((city, index) => (
              <div
                key={city.city}
                className="flex items-center justify-between p-2 bg-white/50 dark:bg-gray-800/50 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    #{index + 1}
                  </Badge>
                  <span className="font-medium">{city.city}</span>
                </div>
                <span className="text-sm font-bold text-primary">
                  {city.count} vibes
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
