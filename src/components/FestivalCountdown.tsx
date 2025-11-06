'use client';

import { useEffect, useState } from 'react';
import type { IndianFestival } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';

export function FestivalCountdown() {
  const [upcomingFestivals, setUpcomingFestivals] = useState<(IndianFestival & { daysUntil?: number })[]>([]);
  const [currentSeason, setCurrentSeason] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchFestivals() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/festivals/upcoming?days=60');
        
        if (response.ok) {
          const data = await response.json();
          setUpcomingFestivals(data.upcoming || []);
          setCurrentSeason(data.currentSeason || '');
        }
      } catch (error) {
        console.error('Error fetching festivals:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchFestivals();
  }, []);

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-orange-500/10 border-2 border-purple-500/30">
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <p className="ml-3 text-purple-600 dark:text-purple-400">Loading festivals...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (upcomingFestivals.length === 0) {
    return null;
  }

  const nextFestival = upcomingFestivals[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-orange-500/10 border-2 border-purple-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">🎊</span>
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Upcoming Festivals
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Next Festival - Featured */}
          <div className="bg-gradient-to-r from-orange-500/20 via-pink-500/20 to-purple-500/20 p-4 rounded-lg border border-orange-500/30">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-3xl">{nextFestival.associatedEmotions[0] === 'Festival Joy' ? '🎊' : '🪔'}</span>
                  <div>
                    <h3 className="text-xl font-bold text-purple-700 dark:text-purple-300">
                      {nextFestival.englishName}
                    </h3>
                    <p className="text-sm text-purple-600/70 dark:text-purple-400/70">
                      {nextFestival.name}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  {nextFestival.description}
                </p>
                <div className="bg-white/50 dark:bg-black/50 p-3 rounded-md">
                  <p className="text-xs font-semibold text-purple-700 dark:text-purple-300 mb-1">
                    Mood Prep Tips:
                  </p>
                  <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-1">
                    {nextFestival.moodPrepTips.slice(0, 3).map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-1">
                        <span className="text-purple-500">✓</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="ml-4 text-center">
                <div className="bg-gradient-to-br from-orange-500 to-pink-500 text-white rounded-full w-20 h-20 flex flex-col items-center justify-center shadow-lg">
                  <span className="text-3xl font-bold">{nextFestival.daysUntil}</span>
                  <span className="text-xs">days</span>
                </div>
              </div>
            </div>
          </div>

          {/* Other Upcoming Festivals */}
          {upcomingFestivals.length > 1 && (
            <>
              <Separator />
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Also Coming Soon:</p>
                {upcomingFestivals.slice(1, 4).map((festival, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-md bg-white/30 dark:bg-black/30 hover:bg-white/50 dark:hover:bg-black/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🎉</span>
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                          {festival.englishName}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {festival.name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-purple-600 dark:text-purple-400">
                        {festival.daysUntil} days
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Healing Content for Next Festival */}
          {nextFestival.healingContent.length > 0 && (
            <>
              <Separator />
              <div className="bg-purple-100/50 dark:bg-purple-900/20 p-3 rounded-lg">
                <p className="text-xs font-semibold text-purple-700 dark:text-purple-300 mb-2">
                  💜 Emotional Support for {nextFestival.englishName}:
                </p>
                <p className="text-xs text-gray-700 dark:text-gray-300 italic">
                  "{nextFestival.healingContent[0]}"
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
