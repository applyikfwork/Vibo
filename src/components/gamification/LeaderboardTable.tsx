'use client';

import { LeaderboardEntry } from '@/lib/types';

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
  title?: string;
}

export function LeaderboardTable({ entries, currentUserId, title }: LeaderboardTableProps) {
  const getMedalForRank = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `#${rank}`;
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-2xl p-6 border border-indigo-500/30">
      {title && <h3 className="text-2xl font-bold text-white mb-4">{title}</h3>}

      <div className="space-y-2">
        {entries.map((entry) => (
          <div
            key={entry.userId}
            className={`flex items-center gap-4 p-3 rounded-xl transition-all ${
              entry.userId === currentUserId
                ? 'bg-yellow-500/20 border border-yellow-500/50 scale-105'
                : 'bg-white/5 hover:bg-white/10'
            }`}
          >
            <div className="text-2xl font-bold w-12 text-center">
              {getMedalForRank(entry.rank)}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-white">{entry.displayName || entry.username}</h4>
                {entry.mood && (
                  <span className="text-sm px-2 py-0.5 rounded-full bg-white/10">
                    {entry.mood}
                  </span>
                )}
                {entry.city && (
                  <span className="text-xs text-gray-400">📍 {entry.city}</span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-sm text-gray-400">Level {entry.level}</span>
                {entry.badges && entry.badges.length > 0 && (
                  <div className="flex gap-1">
                    {entry.badges.slice(0, 3).map((badge, idx) => (
                      <span key={idx} className="text-sm" title={badge.name}>
                        {badge.icon}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center gap-1">
                <span className="text-yellow-400">⚡</span>
                <span className="text-lg font-bold text-yellow-400">{entry.xp}</span>
              </div>
              <p className="text-xs text-gray-400">XP</p>
            </div>
          </div>
        ))}
      </div>

      {entries.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <p>No entries yet. Be the first to earn XP!</p>
        </div>
      )}
    </div>
  );
}
