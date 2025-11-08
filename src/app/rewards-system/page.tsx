'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
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

export default function RewardsSystemPage() {
  const { user } = useUser();
  const { toast } = useToast();
  const [showRewardToast, setShowRewardToast] = useState(false);
  const [rewardData, setRewardData] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

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

  return (
    <div className="container mx-auto p-6 space-y-8">
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

      <div>
        <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent mb-2">
          🔥 Vibee Rewards System
        </h1>
        <p className="text-lg text-muted-foreground">
          Complete Powerful Multi-Currency Economy & Gamification
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="earning">Earning</TabsTrigger>
          <TabsTrigger value="tiers">Tiers</TabsTrigger>
          <TabsTrigger value="boxes">Boxes</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="store">Store</TabsTrigger>
        </TabsList>

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
