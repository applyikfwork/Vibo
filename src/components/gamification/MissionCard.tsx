'use client';

import { Mission } from '@/lib/types';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

interface MissionCardProps {
  mission: Mission;
  onComplete?: () => void;
}

export function MissionCard({ mission, onComplete }: MissionCardProps) {
  const percentage = (mission.current / mission.target) * 100;
  const isCompleted = mission.isCompleted;

  const rarityColors = {
    daily: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
    weekly: 'from-purple-500/20 to-pink-500/20 border-purple-500/30',
    special: 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30',
    event: 'from-green-500/20 to-emerald-500/20 border-green-500/30'
  };

  return (
    <div
      className={`bg-gradient-to-br ${
        rarityColors[mission.type]
      } rounded-xl p-4 border ${isCompleted ? 'opacity-60' : ''}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-white">{mission.title}</h4>
            {isCompleted && <span className="text-xl">✅</span>}
          </div>
          <p className="text-sm text-gray-300 mt-1">{mission.description}</p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">
              Progress: {mission.current}/{mission.target}
            </span>
            <span className="text-gray-400">{percentage.toFixed(0)}%</span>
          </div>
          <Progress value={percentage} className="h-2" />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-3 text-sm">
            {mission.reward.xp > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-yellow-400">⚡</span>
                <span className="text-yellow-400 font-bold">+{mission.reward.xp} XP</span>
              </div>
            )}
            {mission.reward.coins > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-yellow-400">🪙</span>
                <span className="text-yellow-400 font-bold">+{mission.reward.coins}</span>
              </div>
            )}
          </div>

          {isCompleted && onComplete && (
            <Button
              size="sm"
              onClick={onComplete}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            >
              Claim Reward
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
