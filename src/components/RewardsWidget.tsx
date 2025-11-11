'use client';

import { useRewardsStats } from '@/contexts/RewardsStatsContext';
import { useUser } from '@/firebase/provider';
import Link from 'next/link';
import { Trophy, Coins, Zap, Flame } from 'lucide-react';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';

export function RewardsWidget() {
  const { user } = useUser();
  const { stats, loading, error } = useRewardsStats();

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="hidden md:flex items-center gap-3">
        <Skeleton className="h-9 w-64 rounded-full" />
      </div>
    );
  }

  if (error) {
    return null;
  }

  return (
    <Link href="/gamification">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="hidden md:flex items-center gap-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-full px-4 py-2 border-2 border-purple-200/50 hover:border-purple-300 transition-all duration-300 hover:shadow-lg cursor-pointer"
      >
        <div className="flex items-center gap-1.5">
          <Trophy className="w-4 h-4 text-purple-600" />
          <span className="text-sm font-semibold text-purple-900">{stats.level}</span>
        </div>
        
        <div className="w-px h-4 bg-purple-200" />
        
        <div className="flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-yellow-600" />
          <span className="text-sm font-semibold text-gray-900">{stats.xp}</span>
        </div>
        
        <div className="w-px h-4 bg-purple-200" />
        
        <div className="flex items-center gap-1.5">
          <Coins className="w-4 h-4 text-orange-600" />
          <span className="text-sm font-semibold text-gray-900">{stats.coins}</span>
        </div>
        
        {stats.postingStreak > 0 && (
          <>
            <div className="w-px h-4 bg-purple-200" />
            <div className="flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-red-500" />
              <span className="text-sm font-semibold text-gray-900">{stats.postingStreak}</span>
            </div>
          </>
        )}
      </motion.div>
    </Link>
  );
}
