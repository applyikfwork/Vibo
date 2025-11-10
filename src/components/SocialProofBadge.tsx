'use client';

import { Users, TrendingUp, MapPin } from 'lucide-react';

interface SocialProofBadgeProps {
  feelCount: number;
  feelCountLast24h?: number;
  isTrending?: boolean;
  cityRank?: number;
  cityName?: string;
  variant?: 'compact' | 'full';
}

export function SocialProofBadge({
  feelCount,
  feelCountLast24h,
  isTrending,
  cityRank,
  cityName,
  variant = 'compact'
}: SocialProofBadgeProps) {
  if (feelCount === 0 && !feelCountLast24h && !isTrending) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      {feelCount > 0 && (
        <div className="flex items-center gap-1 px-2 py-1 bg-purple-500/10 text-purple-700 dark:text-purple-300 rounded-full">
          <Users className="w-3 h-3" />
          <span className="font-medium">
            {feelCount} {feelCount === 1 ? 'person' : 'people'} felt this
          </span>
        </div>
      )}

      {feelCountLast24h && feelCountLast24h > 0 && variant === 'full' && (
        <div className="flex items-center gap-1 px-2 py-1 bg-blue-500/10 text-blue-700 dark:text-blue-300 rounded-full">
          <span className="font-medium">{feelCountLast24h} in last 24h</span>
        </div>
      )}

      {isTrending && (
        <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-700 dark:text-orange-300 rounded-full animate-pulse">
          <TrendingUp className="w-3 h-3" />
          <span className="font-bold">Trending</span>
        </div>
      )}

      {cityRank && cityRank <= 5 && cityName && variant === 'full' && (
        <div className="flex items-center gap-1 px-2 py-1 bg-green-500/10 text-green-700 dark:text-green-300 rounded-full">
          <MapPin className="w-3 h-3" />
          <span className="font-medium">
            #{cityRank} in {cityName}
          </span>
        </div>
      )}
    </div>
  );
}
