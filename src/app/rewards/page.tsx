'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/firebase/provider';
import { getAuth } from 'firebase/auth';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { BadgeShowcase } from '@/components/gamification/BadgeShowcase';
import { BadgeProgress } from '@/components/gamification/BadgeProgress';
import { KarmaDisplay } from '@/components/gamification/KarmaDisplay';
import { calculateLevel } from '@/lib/rewards/level-system';
import { getProgressToNextLevel, getLevelConfig } from '@/lib/rewards/level-system';
import { getStreakProgress } from '@/lib/rewards/streak-milestones';
import { motion } from 'framer-motion';

export default function RewardsPage() {
  const { user } = useUser();
  const [userStats, setUserStats] = useState({
    xp: 0,
    coins: 0,
    gems: 0,
    karma: 100,
    level: 1,
    badges: [],
    postingStreak: 0,
    totalVibesPosted: 0,
    totalReactionsGiven: 0,
    totalReactionsReceived: 0,
    helpfulCommentsGiven: 0,
    uniqueEmotions: 0,
    challengesCompleted: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserStats();
    }
  }, [user]);

  const fetchUserStats = async () => {
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
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your rewards...</p>
        </div>
      </div>
    );
  }

  const level = calculateLevel(userStats.xp);
  const levelConfig = getLevelConfig(level);
  const levelProgress = getProgressToNextLevel(userStats.xp, level);
  const streakProgress = getStreakProgress(userStats.postingStreak || 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            💎 Rewards Dashboard
          </h1>
          <p className="text-gray-600">Track your progress, earn rewards, and unlock achievements!</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-700 text-white">
              <div className="text-sm opacity-90">Experience</div>
              <div className="text-3xl font-bold">{userStats.xp}</div>
              <div className="text-xs mt-2">Level {level} - {levelConfig.title}</div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6 bg-gradient-to-br from-yellow-500 to-yellow-700 text-white">
              <div className="text-sm opacity-90">Vibee Coins</div>
              <div className="text-3xl font-bold">{userStats.coins}</div>
              <div className="text-xs mt-2">Spendable currency</div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6 bg-gradient-to-br from-pink-500 to-pink-700 text-white">
              <div className="text-sm opacity-90">Gems</div>
              <div className="text-3xl font-bold">{userStats.gems || 0}</div>
              <div className="text-xs mt-2">Premium currency</div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-700 text-white">
              <div className="text-sm opacity-90">Karma Score</div>
              <div className="text-3xl font-bold">{userStats.karma}</div>
              <div className="text-xs mt-2">Quality rating</div>
            </Card>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                ⬆️ Level Progress
              </h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-semibold">Level {level}: {levelConfig.title}</span>
                    <span className="text-sm text-gray-500">
                      {levelProgress.xpToNext} XP to next level
                    </span>
                  </div>
                  <Progress value={levelProgress.percentage} className="h-4" />
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-sm font-semibold mb-2">Unlocked Features:</div>
                  <ul className="text-sm space-y-1">
                    {levelConfig.unlocks.map((unlock, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        {unlock}
                      </li>
                    ))}
                  </ul>
                </div>
                {levelProgress.nextLevel && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-sm font-semibold mb-2">Next Unlock at Level {level + 1}:</div>
                    <ul className="text-sm space-y-1">
                      {levelProgress.nextLevel.unlocks.map((unlock, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="text-gray-400">○</span>
                          {unlock}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                🔥 Vibe Streak
              </h2>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-6xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                    {userStats.postingStreak || 0}
                  </div>
                  <div className="text-sm text-gray-500">Day Streak</div>
                </div>
                {streakProgress.nextMilestone && (
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-semibold">Next Milestone: {streakProgress.nextMilestone.name}</span>
                      <span className="text-sm text-gray-500">
                        {streakProgress.daysToNext} days to go
                      </span>
                    </div>
                    <Progress value={streakProgress.percentage} className="h-4" />
                    <div className="mt-2 text-sm text-gray-600">
                      Reward: {streakProgress.nextMilestone.xpReward} XP + {streakProgress.nextMilestone.coinReward} Coins
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        </div>

        <Tabs defaultValue="badges" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="badges">🏆 Badges</TabsTrigger>
            <TabsTrigger value="karma">⚡ Karma</TabsTrigger>
            <TabsTrigger value="progress">📊 Progress</TabsTrigger>
            <TabsTrigger value="stats">📈 Stats</TabsTrigger>
          </TabsList>

          <TabsContent value="badges" className="mt-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4">Your Badge Collection</h3>
                <BadgeShowcase badges={userStats.badges} maxDisplay={24} size="medium" />
                
                <div className="mt-8">
                  <h3 className="text-xl font-bold mb-4">Available Badges</h3>
                  <BadgeProgress userStats={userStats} maxDisplay={20} />
                </div>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="karma" className="mt-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <KarmaDisplay karma={userStats.karma} />
            </motion.div>
          </TabsContent>

          <TabsContent value="progress" className="mt-6">
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-6">Earning Progress</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Emotions Explored</div>
                  <div className="flex items-center gap-3">
                    <Progress value={(userStats.uniqueEmotions / 16) * 100} className="flex-1 h-3" />
                    <span className="font-semibold">{userStats.uniqueEmotions}/16</span>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Challenges Completed</div>
                  <div className="flex items-center gap-3">
                    <Progress value={Math.min((userStats.challengesCompleted / 50) * 100, 100)} className="flex-1 h-3" />
                    <span className="font-semibold">{userStats.challengesCompleted}</span>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Reactions Given</div>
                  <div className="flex items-center gap-3">
                    <Progress value={Math.min((userStats.totalReactionsGiven / 1000) * 100, 100)} className="flex-1 h-3" />
                    <span className="font-semibold">{userStats.totalReactionsGiven}</span>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Reactions Received</div>
                  <div className="flex items-center gap-3">
                    <Progress value={Math.min((userStats.totalReactionsReceived / 1000) * 100, 100)} className="flex-1 h-3" />
                    <span className="font-semibold">{userStats.totalReactionsReceived}</span>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="stats" className="mt-6">
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-6">Your Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">{userStats.totalVibesPosted}</div>
                  <div className="text-sm text-gray-500">Total Vibes Posted</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{userStats.totalReactionsGiven}</div>
                  <div className="text-sm text-gray-500">Reactions Given</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-pink-600">{userStats.totalReactionsReceived}</div>
                  <div className="text-sm text-gray-500">Reactions Received</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{userStats.helpfulCommentsGiven}</div>
                  <div className="text-sm text-gray-500">Helpful Comments</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">{userStats.postingStreak}</div>
                  <div className="text-sm text-gray-500">Current Streak</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600">{userStats.badges.length}</div>
                  <div className="text-sm text-gray-500">Badges Earned</div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
