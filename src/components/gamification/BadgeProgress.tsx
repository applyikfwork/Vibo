'use client';

import { BadgeDefinition, getBadgeProgress, BADGE_CATALOG } from '@/lib/rewards/badge-system';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';

interface BadgeProgressProps {
  userStats: any;
  category?: string;
  maxDisplay?: number;
}

export function BadgeProgress({ userStats, category, maxDisplay = 10 }: BadgeProgressProps) {
  let badgesToShow = BADGE_CATALOG;
  
  if (category) {
    badgesToShow = badgesToShow.filter(b => b.category === category);
  }

  badgesToShow = badgesToShow
    .filter(b => !b.isHidden)
    .slice(0, maxDisplay);

  const rarityColors = {
    common: 'text-gray-600 border-gray-300',
    rare: 'text-blue-600 border-blue-300',
    epic: 'text-purple-600 border-purple-300',
    legendary: 'text-yellow-600 border-yellow-300',
  };

  return (
    <div className="space-y-3">
      {badgesToShow.map((badge) => {
        const progress = getBadgeProgress(badge.id, userStats);
        const isCompleted = progress >= 100;

        return (
          <Card
            key={badge.id}
            className={`p-4 border-2 ${isCompleted ? 'bg-green-50 border-green-300' : rarityColors[badge.rarity]}`}
          >
            <div className="flex items-start gap-3">
              <div className={`text-3xl ${isCompleted ? 'animate-bounce' : ''}`}>
                {badge.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <div className="font-semibold">{badge.name}</div>
                  <div className="text-xs px-2 py-1 rounded-full bg-gray-100 capitalize">
                    {badge.rarity}
                  </div>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  {badge.description}
                </div>
                {!isCompleted && (
                  <div className="space-y-1">
                    <Progress value={progress} className="h-2" />
                    <div className="text-xs text-gray-500">
                      {progress.toFixed(0)}% Complete
                    </div>
                  </div>
                )}
                {isCompleted && (
                  <div className="text-sm font-semibold text-green-600">
                    ✓ Completed! Earn {badge.xpReward} XP + {badge.coinReward} Coins
                  </div>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
