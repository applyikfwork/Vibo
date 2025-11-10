'use client';

import { Badge } from '@/lib/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { motion } from 'framer-motion';

interface BadgeShowcaseProps {
  badges: Badge[];
  maxDisplay?: number;
  size?: 'small' | 'medium' | 'large';
  showProgress?: boolean;
}

export function BadgeShowcase({ badges, maxDisplay = 12, size = 'medium', showProgress = false }: BadgeShowcaseProps) {
  const earnedBadges = badges.filter(b => b.earnedAt).slice(0, maxDisplay);
  
  const sizeClasses = {
    small: 'w-8 h-8 text-lg',
    medium: 'w-12 h-12 text-2xl',
    large: 'w-16 h-16 text-3xl',
  };

  const rarityColors = {
    common: 'from-gray-400 to-gray-600',
    rare: 'from-blue-400 to-blue-600',
    epic: 'from-purple-400 to-purple-600',
    legendary: 'from-yellow-400 to-yellow-600',
  };

  const rarityGlow = {
    common: 'shadow-gray-500/50',
    rare: 'shadow-blue-500/50',
    epic: 'shadow-purple-500/50',
    legendary: 'shadow-yellow-500/50 animate-pulse',
  };

  if (earnedBadges.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p className="text-sm">No badges earned yet. Complete challenges to earn badges!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
      {earnedBadges.map((badge, index) => (
        <TooltipProvider key={badge.id}>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                className="relative"
              >
                <div
                  className={`${sizeClasses[size]} rounded-full bg-gradient-to-br ${rarityColors[badge.rarity]} flex items-center justify-center shadow-lg ${rarityGlow[badge.rarity]} cursor-pointer transform transition-transform hover:scale-110`}
                >
                  <span className="drop-shadow-lg">{badge.icon}</span>
                </div>
                {badge.rarity === 'legendary' && (
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-yellow-400"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 0, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                )}
              </motion.div>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <div className="text-center">
                <div className="text-2xl mb-1">{badge.icon}</div>
                <div className="font-bold">{badge.name}</div>
                <div className="text-xs text-gray-400 capitalize">{badge.rarity}</div>
                <div className="text-sm mt-1">{badge.description}</div>
                {badge.earnedAt && (
                  <div className="text-xs text-gray-500 mt-2">
                    Earned {new Date((badge.earnedAt as any).seconds * 1000).toLocaleDateString()}
                  </div>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
    </div>
  );
}
