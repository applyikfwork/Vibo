'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { EMOTION_ICONS, getMoodColor } from '@/lib/geo-utils';
import { EmotionCategory } from '@/lib/types';
import { Target, Trophy, Zap, MapPin, Star, Gift } from 'lucide-react';
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';

interface VibeChallenge {
  id: string;
  type: 'daily' | 'weekly' | 'city' | 'special';
  title: string;
  description: string;
  emotion?: EmotionCategory;
  target: number;
  current: number;
  reward: {
    xp: number;
    coins: number;
    badge?: string;
  };
  expiresIn?: string;
  isCompleted: boolean;
  participants?: number;
}

interface GeoUnlockable {
  id: string;
  name: string;
  description: string;
  location: string;
  icon: string;
  isUnlocked: boolean;
  requiredVisits: number;
  currentVisits: number;
}

export function VibeChallengesPanel() {
  const [challenges, setChallenges] = useState<VibeChallenge[]>([]);
  const [unlockables, setUnlockables] = useState<GeoUnlockable[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    loadChallenges();
    loadUnlockables();
  }, []);

  const loadChallenges = () => {
    const mockChallenges: VibeChallenge[] = [
      {
        id: '1',
        type: 'daily',
        title: 'Spread 10 Happy Vibes',
        description: 'Share happiness in your neighborhood today',
        emotion: 'Happy',
        target: 10,
        current: 7,
        reward: { xp: 100, coins: 50, badge: '😊 Happiness Spreader' },
        expiresIn: '8h 32m',
        isCompleted: false,
      },
      {
        id: '2',
        type: 'weekly',
        title: 'Create a Calm Zone',
        description: 'Post 20 calm vibes in your area this week',
        emotion: 'Chill',
        target: 20,
        current: 12,
        reward: { xp: 500, coins: 250, badge: '🧘 Zen Master' },
        expiresIn: '3d 14h',
        isCompleted: false,
        participants: 847,
      },
      {
        id: '3',
        type: 'city',
        title: 'Delhi Happiness Battle',
        description: 'Help Delhi win the happiest city challenge!',
        emotion: 'Happy',
        target: 1000,
        current: 742,
        reward: { xp: 1000, coins: 500, badge: '🏆 City Champion' },
        expiresIn: '6d 23h',
        isCompleted: false,
        participants: 2341,
      },
      {
        id: '4',
        type: 'special',
        title: 'Weekend Motivation Boost',
        description: 'Post motivated vibes on Saturday or Sunday',
        emotion: 'Motivated',
        target: 5,
        current: 3,
        reward: { xp: 250, coins: 125, badge: '🔥 Weekend Warrior' },
        expiresIn: '1d 8h',
        isCompleted: false,
      },
      {
        id: '5',
        type: 'daily',
        title: 'Support Network',
        description: 'React to 15 vibes from people nearby',
        target: 15,
        current: 15,
        reward: { xp: 150, coins: 75 },
        expiresIn: '5h 12m',
        isCompleted: true,
      },
    ];

    setChallenges(mockChallenges);
  };

  const loadUnlockables = () => {
    const mockUnlockables: GeoUnlockable[] = [
      {
        id: '1',
        name: 'Coffee Shop Pioneer',
        description: 'First to post from this famous coffee shop',
        location: 'Cafe Aroma, Connaught Place',
        icon: '☕',
        isUnlocked: false,
        requiredVisits: 1,
        currentVisits: 0,
      },
      {
        id: '2',
        name: 'Park Regular',
        description: 'Post from the park 5 times',
        location: 'Lodhi Gardens',
        icon: '🌳',
        isUnlocked: false,
        requiredVisits: 5,
        currentVisits: 3,
      },
      {
        id: '3',
        name: 'Metro Mood Master',
        description: 'Post from 10 different metro stations',
        location: 'Delhi Metro Network',
        icon: '🚇',
        isUnlocked: true,
        requiredVisits: 10,
        currentVisits: 10,
      },
      {
        id: '4',
        name: 'Temple Serenity',
        description: 'Share peaceful vibes from famous temples',
        location: 'ISKCON Temple',
        icon: '🛕',
        isUnlocked: false,
        requiredVisits: 3,
        currentVisits: 1,
      },
    ];

    setUnlockables(mockUnlockables);
  };

  const claimReward = (challenge: VibeChallenge) => {
    if (!challenge.isCompleted) return;
    
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 5000);
    
    setChallenges(prev => prev.filter(c => c.id !== challenge.id));
  };

  const getChallengeIcon = (type: string) => {
    switch (type) {
      case 'daily': return <Zap className="h-4 w-4" />;
      case 'weekly': return <Target className="h-4 w-4" />;
      case 'city': return <Trophy className="h-4 w-4" />;
      case 'special': return <Star className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  return (
    <>
      {showConfetti && <Confetti recycle={false} numberOfPieces={500} />}
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Vibe Challenges & Unlockables
          </CardTitle>
          <CardDescription>
            Complete challenges to earn rewards and unlock exclusive achievements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="challenges" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="challenges">Active Challenges</TabsTrigger>
              <TabsTrigger value="unlockables">Geo Unlockables</TabsTrigger>
            </TabsList>

            <TabsContent value="challenges" className="space-y-4 mt-4">
              {challenges.map((challenge, index) => (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card
                    className={challenge.isCompleted ? 'border-green-500' : ''}
                    style={
                      challenge.emotion
                        ? { borderLeft: `4px solid ${getMoodColor(challenge.emotion)}` }
                        : {}
                    }
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {getChallengeIcon(challenge.type)}
                            <Badge variant="outline" className="capitalize">
                              {challenge.type}
                            </Badge>
                            {challenge.emotion && (
                              <span className="text-xl">
                                {EMOTION_ICONS[challenge.emotion]}
                              </span>
                            )}
                          </div>
                          <CardTitle className="text-base">
                            {challenge.title}
                          </CardTitle>
                          <CardDescription>{challenge.description}</CardDescription>
                        </div>
                        {challenge.isCompleted && (
                          <Badge className="bg-green-500">✓ Completed</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-semibold">
                            {challenge.current} / {challenge.target}
                          </span>
                        </div>
                        <Progress
                          value={(challenge.current / challenge.target) * 100}
                          className="h-2"
                        />
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex gap-3">
                          <span className="text-muted-foreground">
                            🏅 {challenge.reward.xp} XP
                          </span>
                          <span className="text-muted-foreground">
                            💰 {challenge.reward.coins} Coins
                          </span>
                        </div>
                        {challenge.expiresIn && (
                          <span className="text-xs text-muted-foreground">
                            ⏱️ {challenge.expiresIn}
                          </span>
                        )}
                      </div>

                      {challenge.participants && (
                        <div className="text-xs text-muted-foreground">
                          👥 {challenge.participants.toLocaleString()} participants
                        </div>
                      )}

                      {challenge.reward.badge && (
                        <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-2 text-sm">
                          <Gift className="h-4 w-4 inline mr-2" />
                          <span className="font-semibold">Badge Reward:</span> {challenge.reward.badge}
                        </div>
                      )}

                      {challenge.isCompleted && (
                        <Button
                          onClick={() => claimReward(challenge)}
                          className="w-full bg-green-600 hover:bg-green-700"
                        >
                          Claim Rewards 🎁
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </TabsContent>

            <TabsContent value="unlockables" className="space-y-4 mt-4">
              {unlockables.map((unlockable, index) => (
                <motion.div
                  key={unlockable.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={unlockable.isUnlocked ? 'bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20' : ''}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="text-4xl">{unlockable.icon}</div>
                          <div className="flex-1">
                            <CardTitle className="text-base flex items-center gap-2">
                              {unlockable.name}
                              {unlockable.isUnlocked && (
                                <Badge className="bg-yellow-500">
                                  ✓ Unlocked
                                </Badge>
                              )}
                            </CardTitle>
                            <CardDescription>{unlockable.description}</CardDescription>
                            <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {unlockable.location}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {!unlockable.isUnlocked && (
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-muted-foreground">Visits</span>
                            <span className="font-semibold">
                              {unlockable.currentVisits} / {unlockable.requiredVisits}
                            </span>
                          </div>
                          <Progress
                            value={(unlockable.currentVisits / unlockable.requiredVisits) * 100}
                            className="h-2"
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </>
  );
}
