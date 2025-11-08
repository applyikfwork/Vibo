'use client';

import { useEffect, useState, useCallback } from 'react';
import { useUser } from '@/firebase/provider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ProfileLevel } from '@/components/gamification/ProfileLevel';
import { MissionCard } from '@/components/gamification/MissionCard';
import { StoreItemCard } from '@/components/gamification/StoreItemCard';
import { LeaderboardTable } from '@/components/gamification/LeaderboardTable';
import { RewardHistory } from '@/components/gamification/RewardHistory';
import { Mission, StoreItem, LeaderboardEntry } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { getAuth } from 'firebase/auth';
import { Zap, TrendingUp, Users, Star, Trophy, Flame, Target, Award, Sparkles } from 'lucide-react';

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
  const [comboMultiplier, setComboMultiplier] = useState(1);
  const [showComboAnimation, setShowComboAnimation] = useState(false);
  const [recentActions, setRecentActions] = useState<string[]>([]);
  const [friendsData, setFriendsData] = useState<any[]>([]);

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

  const triggerCombo = useCallback(() => {
    const now = Date.now();
    const newActions = [...recentActions, now.toString()].slice(-5);
    const timeWindow = 60000;
    const actionsInWindow = newActions.filter(t => now - parseInt(t) < timeWindow);
    
    if (actionsInWindow.length >= 3) {
      const multiplier = Math.min(actionsInWindow.length, 5);
      setComboMultiplier(multiplier);
      setShowComboAnimation(true);
      setTimeout(() => setShowComboAnimation(false), 2000);
    }
    setRecentActions(actionsInWindow);
  }, [recentActions]);

  const handleClaimReward = async (mission: Mission) => {
    if (!user) return;

    if (mission.claimed) {
      toast({
        title: 'Already Claimed',
        description: 'You have already claimed this reward',
        variant: 'destructive'
      });
      return;
    }

    if (!mission.isCompleted) {
      toast({
        title: 'Not Completed',
        description: 'Complete the mission first before claiming the reward',
        variant: 'destructive'
      });
      return;
    }

    try {
      const token = await getAuth().currentUser?.getIdToken();
      const response = await fetch('/api/gamification/missions/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          missionId: mission.id,
          missionType: mission.type
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        triggerCombo();
        
        const multipliedXP = Math.round(data.rewards.xp * comboMultiplier);
        const multipliedCoins = Math.round(data.rewards.coins * comboMultiplier);
        
        toast({
          title: comboMultiplier > 1 ? `🔥 ${comboMultiplier}x COMBO! Reward Claimed!` : '🎉 Reward Claimed!',
          description: `You earned ${multipliedXP} XP and ${multipliedCoins} coins!`,
          duration: 5000
        });

        if (data.rewards.leveledUp) {
          toast({
            title: '🎊 Level Up!',
            description: `You reached Level ${data.rewards.level}! 🚀`,
            duration: 5000
          });
        }

        await Promise.all([fetchUserStats(), fetchMissions()]);
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'Failed to claim reward',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error claiming reward:', error);
      toast({
        title: 'Error',
        description: 'Failed to claim reward',
        variant: 'destructive'
      });
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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black py-8 px-4 relative">
      {showComboAnimation && (
        <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
          <div className="text-9xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent animate-bounce">
            {comboMultiplier}x COMBO!
          </div>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent mb-2">
            Vibee Gamification Powerhouse
          </h1>
          <p className="text-gray-400">Feel. Share. Earn. Rise through emotions with combos & competition.</p>
        </div>

        {comboMultiplier > 1 && (
          <Card className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/40 mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center gap-3">
                <Zap className="h-8 w-8 text-yellow-400 animate-pulse" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{comboMultiplier}x Combo Active!</div>
                  <div className="text-sm text-gray-300">Complete more actions quickly to increase your multiplier</div>
                </div>
                <Flame className="h-8 w-8 text-orange-400 animate-pulse" />
              </div>
              <Progress value={(comboMultiplier / 5) * 100} className="mt-4 h-2" />
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-purple-500/40">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <Trophy className="h-8 w-8 text-purple-400" />
                <span className="text-3xl">👑</span>
              </div>
              <div className="text-3xl font-bold text-white">Level {userStats.level}</div>
              <div className="text-sm text-gray-300">Current Level</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border-yellow-500/40">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <Star className="h-8 w-8 text-yellow-400" />
                <span className="text-3xl">⭐</span>
              </div>
              <div className="text-3xl font-bold text-white">{userStats.xp}</div>
              <div className="text-sm text-gray-300">Total XP</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 border-orange-500/40">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <Award className="h-8 w-8 text-orange-400" />
                <span className="text-3xl">🪙</span>
              </div>
              <div className="text-3xl font-bold text-white">{userStats.coins}</div>
              <div className="text-sm text-gray-300">VibeCoins</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-pink-500/20 to-pink-600/20 border-pink-500/40">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <Flame className="h-8 w-8 text-pink-400" />
                <span className="text-3xl">🔥</span>
              </div>
              <div className="text-3xl font-bold text-white">{userStats.postingStreak}</div>
              <div className="text-sm text-gray-300">Day Streak</div>
            </CardContent>
          </Card>
        </div>

        <ProfileLevel
          xp={userStats.xp}
          coins={userStats.coins}
          badges={userStats.badges}
          className="mb-8"
        />

        <Tabs defaultValue="challenges" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8 bg-gray-800/50">
            <TabsTrigger value="challenges">🎯 Challenges</TabsTrigger>
            <TabsTrigger value="friends">👥 Friends</TabsTrigger>
            <TabsTrigger value="leaderboards">🏆 Leaderboards</TabsTrigger>
            <TabsTrigger value="store">🛒 Store</TabsTrigger>
            <TabsTrigger value="history">📜 History</TabsTrigger>
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

          <TabsContent value="friends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-6 w-6" />
                  Friend Comparison
                </CardTitle>
                <CardDescription>See how you stack up against your friends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {friendsData.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-gray-400">
                      <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p>No friend data available. Connect with friends to compare progress!</p>
                    </div>
                  ) : (
                    friendsData.map((friend, idx) => (
                      <Card key={idx} className="bg-gray-800/30 border-gray-700">
                        <CardContent className="pt-6">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                              {friend.name?.[0] || '?'}
                            </div>
                            <div>
                              <div className="font-bold text-white">{friend.name}</div>
                              <div className="text-sm text-gray-400">Level {friend.level}</div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">XP</span>
                              <span className={`font-bold ${friend.xp > userStats.xp ? 'text-red-400' : 'text-green-400'}`}>
                                {friend.xp}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">Coins</span>
                              <span className={`font-bold ${friend.coins > userStats.coins ? 'text-red-400' : 'text-green-400'}`}>
                                {friend.coins}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-blue-500/40">
              <CardHeader>
                <CardTitle>Your Ranking</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-3xl font-bold text-white mb-1">
                      {nationalLeaderboard.findIndex(e => e.userId === user?.uid) + 1 || '-'}
                    </div>
                    <div className="text-sm text-gray-400">National Rank</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-white mb-1">
                      {cityLeaderboard.findIndex(e => e.userId === user?.uid) + 1 || '-'}
                    </div>
                    <div className="text-sm text-gray-400">City Rank</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-white mb-1">{userStats.badges?.length || 0}</div>
                    <div className="text-sm text-gray-400">Badges</div>
                  </div>
                </div>
              </CardContent>
            </Card>
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

          <TabsContent value="history">
            <RewardHistory />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}