'use client';

import { Card } from '@/components/ui/card';
import type { VibeStreak, EmotionExplorerProgress } from '@/lib/types';
import { getStreakEncouragementMessage } from '@/lib/streak-tracking';
import { Flame, Trophy, Sparkles } from 'lucide-react';

interface VibeStreakCardProps {
  vibeStreak: VibeStreak | null;
  emotionExplorer: EmotionExplorerProgress | null;
}

export function VibeStreakCard({ vibeStreak, emotionExplorer }: VibeStreakCardProps) {
  const currentStreak = vibeStreak?.currentStreak || 0;
  const longestStreak = vibeStreak?.longestStreak || 0;
  const exploredCount = emotionExplorer?.totalUniqueEmotions || 0;
  const explorerLevel = emotionExplorer?.explorerLevel || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="p-6 bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-orange-500/20 rounded-full">
            <Flame className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h3 className="font-bold text-orange-800 dark:text-orange-200">Vibe Streak</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">Keep the fire burning!</p>
          </div>
        </div>

        <div className="text-center py-4">
          <div className="text-5xl font-bold text-orange-600 mb-2">
            {currentStreak}
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
            {getStreakEncouragementMessage(currentStreak)}
          </p>
          
          <div className="flex items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Trophy className="w-4 h-4 text-orange-500" />
              <span className="text-gray-600 dark:text-gray-400">
                Best: <span className="font-bold text-orange-600">{longestStreak}</span>
              </span>
            </div>
          </div>
        </div>

        {currentStreak >= 3 && (
          <div className="mt-4 p-3 bg-orange-500/10 rounded-lg text-center">
            <p className="text-xs font-medium text-orange-700 dark:text-orange-300">
              🎉 {currentStreak} days in a row! Amazing!
            </p>
          </div>
        )}
      </Card>

      <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-blue-500/20 rounded-full">
            <Sparkles className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-bold text-blue-800 dark:text-blue-200">Emotion Explorer</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">Discover all emotions</p>
          </div>
        </div>

        <div className="text-center py-4">
          <div className="text-4xl font-bold text-blue-600 mb-2">
            {exploredCount}/16
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
            Emotions explored
          </p>
          
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                style={{ width: `${(exploredCount / 16) * 100}%` }}
              />
            </div>
            <span className="text-xs font-bold text-blue-600">
              {Math.round((exploredCount / 16) * 100)}%
            </span>
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-400">
            Explorer Level: <span className="font-bold text-blue-600">{explorerLevel}</span>
          </div>
        </div>

        {exploredCount >= 10 && (
          <div className="mt-4 p-3 bg-blue-500/10 rounded-lg text-center">
            <p className="text-xs font-medium text-blue-700 dark:text-blue-300">
              🌟 You're an Emotion Master!
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
