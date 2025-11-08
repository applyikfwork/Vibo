'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RewardsStore } from '@/components/rewards/RewardsStore';
import { useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { RewardToast } from '@/components/rewards/RewardToast';
import { 
  REWARD_CONFIGS, 
  DAILY_CAPS, 
  GIFT_CONFIGS 
} from '@/lib/rewards/reward-engine';
import { TIER_CONFIGS } from '@/lib/rewards/tier-system';
import { SURPRISE_BOXES, BADGES_CATALOG } from '@/lib/rewards/constants';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import { Flame, TrendingUp, Award, Calendar, Zap, Gift as GiftIcon, Target, Star, Crown, Sparkles } from 'lucide-react';
import confetti from 'react-confetti';

export default function RewardsSystemPage() {
  const { user } = useUser();
  const { toast } = useToast();
  const [showRewardToast, setShowRewardToast] = useState(false);
  const [rewardData, setRewardData] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [analytics, setAnalytics] = useState<any>(null);
  const [userStats, setUserStats] = useState<any>(null);
  const [streak, setStreak] = useState(0);
  const [dailyReward, setDailyReward] = useState<any>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [seasonalEvent, setSeasonalEvent] = useState<any>(null);

  const handleTestReward = async (action: string) => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Not Logged In',
        description: 'Please log in to test rewards',
      });
      return;
    }

    setIsProcessing(true);

    try {
      const idToken = await user.getIdToken();
      const response = await fetch('/api/rewards/award', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({ 
          action,
          metadata: {
            deviceFingerprint: 'test-device',
          },
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setRewardData(data);
        setShowRewardToast(true);
        toast({
          title: 'Reward Earned! 🎉',
          description: `+${data.xpGained} XP, +${data.coinsGained} Coins`,
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: data.error || 'Failed to award reward',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to process reward',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOpenBox = async (boxType: 'small' | 'lucky' | 'premium') => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Not Logged In',
        description: 'Please log in to open boxes',
      });
      return;
    }

    setIsProcessing(true);

    try {
      const idToken = await user.getIdToken();
      const response = await fetch('/api/rewards/boxes/open', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({ boxType }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: `${boxType.charAt(0).toUpperCase() + boxType.slice(1)} Box Opened! 🎁`,
          description: data.reward.description,
        });
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: data.error || 'Failed to open box',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to open box',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const response = await fetch('/api/gamification/rewards/analytics?days=30', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setAnalytics(data);
          setStreak(data.insights?.currentStreak || 0);
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
      }
    };

    const fetchUserStats = async () => {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const response = await fetch('/api/gamification/rewards', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setUserStats(data);
        }
      } catch (error) {
        console.error('Error fetching user stats:', error);
      }
    };

    const checkDailyReward = () => {
      const lastClaim = localStorage.getItem('lastDailyRewardClaim');
      const today = new Date().toDateString();
      if (lastClaim !== today) {
        setDailyReward({
          available: true,
          xp: 50 + (streak * 10),
          coins: 25 + (streak * 5),
          streak: streak + 1
        });
      }
    };

    const checkSeasonalEvent = () => {
      const month = new Date().getMonth();
      const events: any = {
        0: { name: 'New Year Boost', multiplier: 2, icon: '🎉', color: 'from-blue-400 to-purple-400' },
        1: { name: 'Love Month', multiplier: 1.5, icon: '💝', color: 'from-pink-400 to-red-400' },
        10: { name: 'Festival Season', multiplier: 2, icon: '🪔', color: 'from-orange-400 to-yellow-400' },
        11: { name: 'Year End Celebration', multiplier: 2.5, icon: '✨', color: 'from-purple-400 to-pink-400' },
      };
      setSeasonalEvent(events[month] || null);
    };

    if (user) {
      fetchAnalytics();
      fetchUserStats();
      checkDailyReward();
      checkSeasonalEvent();
    }
  }, [user, streak]);

  const claimDailyReward = async () => {
    if (!dailyReward?.available) return;
    setIsProcessing(true);
    try {
      localStorage.setItem('lastDailyRewardClaim', new Date().toDateString());
      toast({
        title: `Daily Reward Claimed! 🎁`,
        description: `+${dailyReward.xp} XP, +${dailyReward.coins} Coins`,
      });
      setStreak(dailyReward.streak);
      setDailyReward({ ...dailyReward, available: false });
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to claim daily reward',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8 relative">
      {showConfetti && <div className="fixed inset-0 z-50 pointer-events-none">
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-6xl animate-bounce">🎉</div>
        </div>
      </div>}
      
      <RewardToast
        xpGained={rewardData?.xpGained}
        coinsGained={rewardData?.coinsGained}
        gemsGained={rewardData?.gemsGained}
        badgeEarned={rewardData?.newBadges?.[0]}
        leveledUp={rewardData?.leveledUp}
        newLevel={rewardData?.newLevel}
        tierChanged={rewardData?.tierChanged}
        newTier={rewardData?.newTier}
        show={showRewardToast}
        onClose={() => setShowRewardToast(false)}
      />

      <div className="relative">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent mb-2 animate-gradient">
          ✨ Vibee Rewards Powerhouse
        </h1>
        <p className="text-lg text-muted-foreground">
          Advanced Multi-Currency Economy with Real-Time Analytics
        </p>
      </div>

      {seasonalEvent && (
        <Card className={`bg-gradient-to-r ${seasonalEvent.color} border-none shadow-2xl animate-pulse`}>
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-3 text-2xl">
              <span className="text-4xl">{seasonalEvent.icon}</span>
              {seasonalEvent.name}
              <Badge className="bg-white/20 text-white border-white/40">
                {seasonalEvent.multiplier}x REWARDS
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-white/90">
            All rewards are multiplied by {seasonalEvent.multiplier}x during this special event!
          </CardContent>
        </Card>
      )}

      {dailyReward?.available && (
        <Card className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 border-none shadow-2xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-3 text-2xl">
              <Calendar className="h-8 w-8" />
              Daily Reward Available!
              <Badge className="bg-white/20 text-white border-white/40">
                {streak} Day Streak 🔥
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-white">
              <div className="bg-white/20 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold">+{dailyReward.xp}</div>
                <div className="text-sm">XP</div>
              </div>
              <div className="bg-white/20 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold">+{dailyReward.coins}</div>
                <div className="text-sm">Coins</div>
              </div>
            </div>
            <Button 
              onClick={claimDailyReward}
              disabled={isProcessing}
              className="w-full bg-white text-orange-600 hover:bg-white/90 font-bold text-lg py-6"
            >
              🎁 Claim Daily Reward
            </Button>
          </CardContent>
        </Card>
      )}

      {user && analytics && (
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-purple-500/40">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <Flame className="h-8 w-8 text-purple-400" />
                <span className="text-3xl">🔥</span>
              </div>
              <div className="text-3xl font-bold text-white">{streak} Days</div>
              <div className="text-sm text-gray-300">Current Streak</div>
              <Progress value={(streak % 30) / 30 * 100} className="mt-2 h-2" />
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border-yellow-500/40">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="h-8 w-8 text-yellow-400" />
                <span className="text-3xl">⭐</span>
              </div>
              <div className="text-3xl font-bold text-white">{analytics.totals?.xpEarned || 0}</div>
              <div className="text-sm text-gray-300">Total XP (30d)</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 border-orange-500/40">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <Award className="h-8 w-8 text-orange-400" />
                <span className="text-3xl">🪙</span>
              </div>
              <div className="text-3xl font-bold text-white">{analytics.totals?.coinsEarned || 0}</div>
              <div className="text-sm text-gray-300">Total Coins (30d)</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-pink-500/20 to-pink-600/20 border-pink-500/40">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <Zap className="h-8 w-8 text-pink-400" />
                <span className="text-3xl">🎯</span>
              </div>
              <div className="text-3xl font-bold text-white">{analytics.actionBreakdown?.[0]?.count || 0}</div>
              <div className="text-sm text-gray-300">Top Action</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="analytics" className="w-full">
        <TabsList className="grid w-full grid-cols-8 bg-gray-800/50">
          <TabsTrigger value="analytics">📊 Analytics</TabsTrigger>
          <TabsTrigger value="achievements">🏆 Achievements</TabsTrigger>
          <TabsTrigger value="overview">📝 Overview</TabsTrigger>
          <TabsTrigger value="earning">💰 Earning</TabsTrigger>
          <TabsTrigger value="tiers">⭐ Tiers</TabsTrigger>
          <TabsTrigger value="boxes">🎁 Boxes</TabsTrigger>
          <TabsTrigger value="badges">🎖️ Badges</TabsTrigger>
          <TabsTrigger value="store">🛒 Store</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-6">
          {analytics && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>30-Day Earning Trends</CardTitle>
                  <CardDescription>Track your XP and coin accumulation over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={analytics.dailyActivity || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="date" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: '#1F2937',
                          border: '1px solid #374151',
                          borderRadius: '8px'
                        }}
                      />
                      <Area type="monotone" dataKey="xp" stackId="1" stroke="#A855F7" fill="#A855F7" fillOpacity={0.6} />
                      <Area type="monotone" dataKey="coins" stackId="2" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.6} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Action Breakdown</CardTitle>
                    <CardDescription>Your most frequent activities</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={analytics.actionBreakdown?.slice(0, 5) || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="action" stroke="#9CA3AF" />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: '#1F2937',
                            border: '1px solid #374151',
                            borderRadius: '8px'
                          }}
                        />
                        <Bar dataKey="count" fill="#EC4899" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Performance Metrics</CardTitle>
                    <CardDescription>Your reward statistics</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Avg XP/Day</span>
                        <span className="font-bold">{Math.round(analytics.averages?.xpPerDay || 0)}</span>
                      </div>
                      <Progress value={(analytics.averages?.xpPerDay / 200) * 100} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Avg Coins/Day</span>
                        <span className="font-bold">{Math.round(analytics.averages?.coinsPerDay || 0)}</span>
                      </div>
                      <Progress value={(analytics.averages?.coinsPerDay / 100) * 100} className="h-2" />
                    </div>
                    <div className="p-4 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-lg">
                      <div className="text-sm text-muted-foreground">Most Active Day</div>
                      <div className="text-2xl font-bold">
                        {analytics.insights?.mostActiveDay?.date || 'N/A'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {analytics.insights?.mostActiveDay?.xp || 0} XP earned
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Achievement Showcase</CardTitle>
              <CardDescription>Your earned achievements and progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {userStats?.badges?.map((badgeId: string) => {
                  const badge = BADGES_CATALOG[badgeId as keyof typeof BADGES_CATALOG];
                  return badge && (
                    <Card key={badgeId} className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/40">
                      <CardContent className="pt-6 text-center">
                        <div className="text-6xl mb-2">{badge.icon}</div>
                        <div className="font-bold text-lg">{badge.name}</div>
                        <Badge variant="outline" className="mt-2">{badge.rarity}</Badge>
                        <p className="text-sm text-muted-foreground mt-2">{badge.description}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              {(!userStats?.badges || userStats.badges.length === 0) && (
                <div className="text-center py-12 text-muted-foreground">
                  <Award className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>No achievements yet. Start earning to unlock badges!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Multi-Currency Economy</CardTitle>
              <CardDescription>Three core currencies power the Vibee ecosystem</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg bg-gradient-to-br from-yellow-50 to-yellow-100">
                <div className="text-4xl mb-2">⭐</div>
                <h3 className="font-bold text-lg">XP (Experience)</h3>
                <p className="text-sm text-muted-foreground">Non-exchangeable progression currency for leveling up and unlocking prestige</p>
              </div>
              <div className="p-4 border rounded-lg bg-gradient-to-br from-orange-50 to-orange-100">
                <div className="text-4xl mb-2">🪙</div>
                <h3 className="font-bold text-lg">VibeCoins</h3>
                <p className="text-sm text-muted-foreground">Spendable currency for boosts, cosmetics, and premium items</p>
                <p className="text-xs font-semibold mt-2">Daily Cap: {DAILY_CAPS.MAX_COINS_EARNED} coins</p>
              </div>
              <div className="p-4 border rounded-lg bg-gradient-to-br from-purple-50 to-purple-100">
                <div className="text-4xl mb-2">💎</div>
                <h3 className="font-bold text-lg">Gems</h3>
                <p className="text-sm text-muted-foreground">Premium currency for exclusive items and event passes</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <span>✅</span> Anti-Fraud Protection
                  </h4>
                  <p className="text-sm text-muted-foreground">Velocity checks, anomaly detection, and device fingerprinting</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <span>🎯</span> Mission System
                  </h4>
                  <p className="text-sm text-muted-foreground">Daily, weekly, and seasonal missions with auto-reset</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <span>🎁</span> Gift System
                  </h4>
                  <p className="text-sm text-muted-foreground">Send roses, stars, and crowns to show appreciation</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <span>🏆</span> Leaderboards
                  </h4>
                  <p className="text-sm text-muted-foreground">Global, city, and giver leaderboards</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <span>🎪</span> Seasonal Pass
                  </h4>
                  <p className="text-sm text-muted-foreground">Free and premium tracks with exclusive rewards</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <span>🏙️</span> City Challenges
                  </h4>
                  <p className="text-sm text-muted-foreground">Community challenges with contributor tracking</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="earning" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Earning Rules - Test Rewards</CardTitle>
              <CardDescription>Click to earn rewards and see the system in action</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(REWARD_CONFIGS).map(([action, config]) => (
                <div key={action} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-semibold">{action.replace(/_/g, ' ').toUpperCase()}</p>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      {config.xp > 0 && <span>⭐ +{config.xp} XP</span>}
                      {config.coins > 0 && <span>🪙 +{config.coins} Coins</span>}
                      {config.dailyLimit && <span className="text-xs">(Limit: {config.dailyLimit}/day)</span>}
                    </div>
                  </div>
                  <Button
                    onClick={() => handleTestReward(action)}
                    disabled={isProcessing}
                    size="sm"
                  >
                    Test Earn
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Gift Configs</CardTitle>
              <CardDescription>Send gifts to show appreciation</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-4">
              {Object.entries(GIFT_CONFIGS).map(([type, config]) => (
                <div key={type} className="p-4 border rounded-lg text-center">
                  <div className="text-4xl mb-2">
                    {type === 'rose' ? '🌹' : type === 'star' ? '⭐' : '👑'}
                  </div>
                  <h3 className="font-bold capitalize">{type}</h3>
                  <p className="text-sm">Cost: {config.cost} coins</p>
                  <p className="text-xs text-muted-foreground">
                    Recipient gets: +{config.recipientXP} XP, +{config.recipientCoins} coins
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tiers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tier Progression System</CardTitle>
              <CardDescription>Unlock perks as you level up</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {TIER_CONFIGS.map((tier) => (
                <div key={tier.tier} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold capitalize">{tier.tier}</h3>
                    <Badge variant={tier.tier === 'legend' ? 'default' : 'secondary'}>
                      Level {tier.minLevel}-{tier.maxLevel === Infinity ? '∞' : tier.maxLevel}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {tier.minXP} - {tier.maxXP === Infinity ? '∞' : tier.maxXP} XP
                  </p>
                  <div className="space-y-1 text-sm">
                    <p>• Daily Coin Cap Bonus: +{tier.perks.dailyCoinCapBonus}</p>
                    <p>• Create Challenges: {tier.perks.canCreateChallenges ? '✅' : '❌'}</p>
                    <p>• Leaderboard: {tier.perks.leaderboardVisibility}</p>
                    {tier.perks.specialBadge && <p>• Special Badge: {tier.perks.specialBadge}</p>}
                    {tier.perks.cosmeticUnlocks && (
                      <p>• Cosmetics: {tier.perks.cosmeticUnlocks.join(', ')}</p>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="boxes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Surprise Boxes</CardTitle>
              <CardDescription>Open boxes to get random rewards</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-4">
              {Object.entries(SURPRISE_BOXES).map(([key, box]) => (
                <div key={key} className="p-4 border rounded-lg text-center">
                  <div className="text-4xl mb-2">🎁</div>
                  <h3 className="font-bold text-lg">{box.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {box.costCurrency === 'free' ? 'FREE' : `${box.cost} ${box.costCurrency}`}
                  </p>
                  <div className="text-xs text-left space-y-1 mb-3">
                    {box.possibleRewards.map((reward, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span className="capitalize">{reward.type}</span>
                        <Badge variant="outline" className="text-xs">
                          {(reward.dropRate * 100).toFixed(0)}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                  <Button
                    onClick={() => handleOpenBox(box.type)}
                    disabled={isProcessing}
                    size="sm"
                    className="w-full"
                  >
                    Open Box
                  </Button>
                  {box.dailyLimit && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Limit: {box.dailyLimit}/day
                    </p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="badges" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Badges Catalog</CardTitle>
              <CardDescription>Collect badges by completing achievements</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(BADGES_CATALOG).map(([key, badge]) => (
                <div key={key} className="p-4 border rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">{badge.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold">{badge.name}</h3>
                        <Badge variant="outline" className="text-xs">
                          {badge.rarity}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {badge.description}
                      </p>
                      <p className="text-xs font-medium">
                        📋 {badge.requirement}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="store">
          <RewardsStore />
        </TabsContent>
      </Tabs>

      <Card className="bg-gradient-to-r from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle>API Endpoints</CardTitle>
          <CardDescription>Available reward system endpoints</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 font-mono text-sm">
          <div><span className="text-green-600">POST</span> /api/rewards/award - Award rewards for actions</div>
          <div><span className="text-green-600">POST</span> /api/rewards/spend - Purchase items from store</div>
          <div><span className="text-green-600">POST</span> /api/rewards/gift - Send gifts to users</div>
          <div><span className="text-green-600">POST</span> /api/rewards/missions/claim - Claim mission rewards</div>
          <div><span className="text-green-600">POST</span> /api/rewards/boxes/open - Open surprise boxes</div>
          <div><span className="text-blue-600">GET</span> /api/rewards/leaderboard - Fetch leaderboard</div>
          <div><span className="text-green-600">POST</span> /api/rewards/city-challenge/complete - Complete city challenges</div>
        </CardContent>
      </Card>
    </div>
  );
}
