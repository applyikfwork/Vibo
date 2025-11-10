'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { DailyEmotionChallenge, Emotion } from '@/lib/types';
import { emotions } from '@/lib/data';
import { Target, CheckCircle2 } from 'lucide-react';

interface DailyEmotionChallengeCardProps {
  challenge: DailyEmotionChallenge | null;
  onStartChallenge?: () => void;
}

export function DailyEmotionChallengeCard({ challenge, onStartChallenge }: DailyEmotionChallengeCardProps) {
  if (!challenge) {
    return (
      <Card className="p-6 bg-gradient-to-br from-green-500/10 to-teal-500/10 border-green-500/20">
        <div className="text-center">
          <div className="p-4 bg-green-500/20 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Target className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-bold text-green-800 dark:text-green-200 mb-2">
            Daily Emotion Challenge
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Start a challenge to earn rewards!
          </p>
          <Button onClick={onStartChallenge} className="bg-green-600 hover:bg-green-700">
            Start Today's Challenge
          </Button>
        </div>
      </Card>
    );
  }

  const emotionData = emotions.find((e: Emotion) => e.name === challenge.targetEmotion);
  const progress = (challenge.currentProgress / challenge.targetCount) * 100;

  return (
    <Card className="p-6 bg-gradient-to-br from-green-500/10 to-teal-500/10 border-green-500/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-green-500/20 rounded-full">
            {challenge.isCompleted ? (
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            ) : (
              <Target className="w-6 h-6 text-green-600" />
            )}
          </div>
          <div>
            <h3 className="font-bold text-green-800 dark:text-green-200">Daily Challenge</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">Today's mission</p>
          </div>
        </div>
        {challenge.isCompleted && (
          <span className="text-2xl">✅</span>
        )}
      </div>

      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-3xl">{emotionData?.emoji || '🎯'}</span>
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Find <span className="font-bold text-green-600">{challenge.targetCount}</span> {challenge.targetEmotion} vibes
            </p>
            <p className="text-xs text-gray-500">
              Progress: {challenge.currentProgress}/{challenge.targetCount}
            </p>
          </div>
        </div>

        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-green-500 to-teal-500 transition-all duration-500"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      <div className="p-3 bg-green-500/10 rounded-lg">
        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Rewards:</p>
        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1">
            <span className="text-yellow-500">⚡</span>
            <span className="font-bold text-green-600">+{challenge.reward.xp} XP</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="text-amber-500">🪙</span>
            <span className="font-bold text-green-600">+{challenge.reward.coins} Coins</span>
          </span>
          {challenge.reward.badge && (
            <span className="flex items-center gap-1">
              <span>🏆</span>
              <span className="font-bold text-green-600">{challenge.reward.badge}</span>
            </span>
          )}
        </div>
      </div>

      {challenge.isCompleted && (
        <div className="mt-4 p-3 bg-green-500/20 rounded-lg text-center">
          <p className="text-sm font-medium text-green-700 dark:text-green-300">
            🎉 Challenge completed! Come back tomorrow for a new one.
          </p>
        </div>
      )}
    </Card>
  );
}
