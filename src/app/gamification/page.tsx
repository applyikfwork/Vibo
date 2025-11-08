'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/firebase/provider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileLevel } from '@/components/gamification/ProfileLevel';
import { MissionCard } from '@/components/gamification/MissionCard';
import { StoreItemCard } from '@/components/gamification/StoreItemCard';
import { LeaderboardTable } from '@/components/gamification/LeaderboardTable';
import { Mission, StoreItem, LeaderboardEntry } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { getAuth } from 'firebase/auth';

export default function GamificationPage() {
  const { user } = useUser();
  const { toast } = useToast();
  const [userStats, setUserStats] = useState({
    xp: 0,
    coins: 0,
    level: 1,
    badges: [],
    totalVibesPosted: 0,
    totalReactionsGiven: 0,
    postingStreak: 0
  });
  const [dailyMissions, setDailyMissions] = useState<Mission[]>([]);
  const [weeklyMissions, setWeeklyMissions] = useState<Mission[]>([]);
  const [storeItems, setStoreItems] = useState<StoreItem[]>([]);
  const [nationalLeaderboard, setNationalLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [cityLeaderboard, setCityLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasingItem, setPurchasingItem] = useState<string | null>(null);

  const fetchUserStats = async () => {
    if (!user) return;

    try {
      const token = await getAuth().currentUser?.getIdToken();
      const response = await fetch('/api/gamification/rewards', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUserStats(data);
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const fetchMissions = async () => {
    if (!user) return;

    try {
      const token = await getAuth().currentUser?.getIdToken();
      const response = await fetch('/api/gamification/missions', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDailyMissions(data.dailyMissions || []);
        setWeeklyMissions(data.weeklyMissions || []);
      }
    } catch (error) {
      console.error('Error fetching missions:', error);
    }
  };

  const fetchStore = async () => {
    try {
      const response = await fetch('/api/gamification/store');
      if (response.ok) {
        const data = await response.json();
        setStoreItems(data.items || []);
      }
    } catch (error) {
      console.error('Error fetching store:', error);
    }
  };

  const fetchLeaderboards = async () => {
    try {
      const [nationalRes, cityRes] = await Promise.all([
        fetch(`/api/gamification/leaderboards?type=national&userId=${user?.uid}`),
        fetch(`/api/gamification/leaderboards?type=city&userId=${user?.uid}`)
      ]);

      if (nationalRes.ok) {
        const data = await nationalRes.json();
        setNationalLeaderboard(data.leaderboard || []);
      }

      if (cityRes.ok) {
        const data = await cityRes.json();
        setCityLeaderboard(data.leaderboard || []);
      }
    } catch (error) {
      console.error('Error fetching leaderboards:', error);
    }
  };

  const handlePurchase = async (itemId: string) => {
    if (!user) return;

    setPurchasingItem(itemId);
    try {
      const token = await getAuth().currentUser?.getIdToken();
      const response = await fetch('/api/gamification/store', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ itemId })
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Purchase Successful! 🎉',
          description: `You bought ${data.item.name}`,
        });
        await fetchUserStats();
      } else {
        toast({
          title: 'Purchase Failed',
          description: data.error || 'Something went wrong',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to purchase item',
        variant: 'destructive'
      });
    } finally {
      setPurchasingItem(null);
    }
  };

  const handleClaimReward = async (mission: Mission) => {
    if (!user) return;

    try {
      const token = await getAuth().currentUser?.getIdToken();
      const response = await fetch('/api/gamification/rewards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          action: mission.type === 'daily' ? 'COMPLETE_DAILY_CHALLENGE' : 'COMPLETE_WEEKLY_CHALLENGE',
          metadata: { missionId: mission.id }
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: 'Reward Claimed! 🎉',
          description: `+${data.rewards.xp} XP, +${data.rewards.coins} Coins`,
        });
        await Promise.all([fetchUserStats(), fetchMissions()]);
      }
    } catch (error) {
      console.error('Error claiming reward:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchUserStats(),
        fetchMissions(),
        fetchStore(),
        fetchLeaderboards()
      ]);
      setLoading(false);
    };

    if (user) {
      loadData();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Please sign in to access gamification features</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin text-4xl">⚡</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent mb-2">
            Vibee Gamification
          </h1>
          <p className="text-gray-400">Feel. Share. Earn. Rise through emotions.</p>
        </div>

        <ProfileLevel
          xp={userStats.xp}
          coins={userStats.coins}
          badges={userStats.badges}
          className="mb-8"
        />

        <Tabs defaultValue="challenges" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="challenges">🎯 Challenges</TabsTrigger>
            <TabsTrigger value="leaderboards">🏆 Leaderboards</TabsTrigger>
            <TabsTrigger value="store">🛒 Store</TabsTrigger>
          </TabsList>

          <TabsContent value="challenges" className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Daily Missions</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dailyMissions.map((mission) => (
                  <MissionCard
                    key={mission.id}
                    mission={mission}
                    onComplete={() => handleClaimReward(mission)}
                  />
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Weekly Challenges</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {weeklyMissions.map((mission) => (
                  <MissionCard
                    key={mission.id}
                    mission={mission}
                    onComplete={() => handleClaimReward(mission)}
                  />
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="leaderboards" className="space-y-8">
            <LeaderboardTable
              entries={nationalLeaderboard}
              currentUserId={user.uid}
              title="🇮🇳 India Leaderboard"
            />

            {cityLeaderboard.length > 0 && (
              <LeaderboardTable
                entries={cityLeaderboard}
                currentUserId={user.uid}
                title="📍 City Leaderboard"
              />
            )}
          </TabsContent>

          <TabsContent value="store">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {storeItems.map((item) => (
                <StoreItemCard
                  key={item.id}
                  item={item}
                  userCoins={userStats.coins}
                  onPurchase={handlePurchase}
                  isPurchasing={purchasingItem === item.id}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}