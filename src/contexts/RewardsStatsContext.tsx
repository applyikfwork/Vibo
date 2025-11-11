'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useUser } from '@/firebase/provider';
import { getAuth } from 'firebase/auth';
import { calculateLevel } from '@/lib/rewards/level-system';

type RewardsStats = {
  xp: number;
  coins: number;
  gems: number;
  karma: number;
  level: number;
  postingStreak: number;
  badges: any[];
};

type RewardsStatsContextType = {
  stats: RewardsStats;
  loading: boolean;
  error: string | null;
  refreshStats: (force?: boolean) => Promise<void>;
};

const defaultStats: RewardsStats = {
  xp: 0,
  coins: 0,
  gems: 0,
  karma: 100,
  level: 1,
  postingStreak: 0,
  badges: [],
};

const RewardsStatsContext = createContext<RewardsStatsContextType>({
  stats: defaultStats,
  loading: true,
  error: null,
  refreshStats: async () => {},
});

export function useRewardsStats() {
  return useContext(RewardsStatsContext);
}

export function RewardsStatsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const [stats, setStats] = useState<RewardsStats>(defaultStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState(0);

  const fetchStats = useCallback(async (force = false) => {
    if (!user) {
      setStats(defaultStats);
      setLoading(false);
      return;
    }

    const now = Date.now();
    if (!force && now - lastFetchTime < 30000) {
      return;
    }

    try {
      setError(null);
      const token = await getAuth().currentUser?.getIdToken();
      
      if (!token) {
        setError('Authentication required');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/gamification/rewards', {
        headers: {
          Authorization: `Bearer ${token}`
        },
        next: { revalidate: 30 }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch rewards stats');
      }

      const data = await response.json();
      const level = calculateLevel(data.xp || 0);
      
      setStats({
        xp: data.xp || 0,
        coins: data.coins || 0,
        gems: data.gems || 0,
        karma: data.karma || 100,
        level,
        postingStreak: data.postingStreak || 0,
        badges: data.badges || [],
      });
      
      setLastFetchTime(now);
    } catch (err: any) {
      console.error('Error fetching rewards stats:', err);
      setError(err.message || 'Failed to load rewards');
    } finally {
      setLoading(false);
    }
  }, [user, lastFetchTime]);

  useEffect(() => {
    if (user) {
      fetchStats();
    } else {
      setStats(defaultStats);
      setLoading(false);
    }
  }, [user]);

  const refreshStats = useCallback(async (force = true) => {
    await fetchStats(force);
  }, [fetchStats]);

  return (
    <RewardsStatsContext.Provider value={{ stats, loading, error, refreshStats }}>
      {children}
    </RewardsStatsContext.Provider>
  );
}
