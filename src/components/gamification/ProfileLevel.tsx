'use client';

import { useEffect, useState } from 'react';
import { calculateLevel, getProgressToNextLevel } from '@/lib/gamification';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/lib/types';

interface ProfileLevelProps {
  xp: number;
  coins: number;
  badges?: Badge[];
  className?: string;
}

export function ProfileLevel({ xp, coins, badges = [], className = '' }: ProfileLevelProps) {
  const [mounted, setMounted] = useState(false);
  const level = calculateLevel(xp);
  const progress = getProgressToNextLevel(xp);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className={`bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl p-6 border border-purple-500/30 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Level {level}
            </h3>
            <span className="text-sm text-gray-400">{xp} XP</span>
          </div>
          <p className="text-sm text-gray-400 mt-1">
            {progress.current}/{progress.needed} XP to Level {level + 1}
          </p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1">
            <span className="text-2xl">🪙</span>
            <span className="text-xl font-bold text-yellow-400">{coins}</span>
          </div>
          <p className="text-xs text-gray-400">VibeCoins</p>
        </div>
      </div>

      <Progress value={progress.percentage} className="h-3 mb-4" />

      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-400">Badges:</span>
        <div className="flex gap-1">
          {badges.slice(0, 5).map((badge, idx) => (
            <div
              key={idx}
              className="text-2xl hover:scale-125 transition-transform cursor-pointer"
              title={badge.name}
            >
              {badge.icon}
            </div>
          ))}
          {badges.length > 5 && (
            <div className="text-sm text-gray-400 ml-1">+{badges.length - 5} more</div>
          )}
        </div>
      </div>
    </div>
  );
}
