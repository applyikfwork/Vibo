'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, Flame, Zap, Crown } from 'lucide-react';
import { EmotionCategory } from '@/lib/types';

type CityBattle = {
  id: string;
  title: string;
  description: string;
  targetEmotion: EmotionCategory;
  cities: {
    name: string;
    count: number;
    percentage: number;
    isWinning: boolean;
    xpBonus: number;
  }[];
  endsAt: Date;
  reward: {
    xp: number;
    coins: number;
    badge?: string;
  };
  isActive: boolean;
};

export function CityBattleCard({ city }: { city: string }) {
  const [battles, setBattles] = useState<CityBattle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateTodaysBattle();
  }, [city]);

  const generateTodaysBattle = () => {
    // Generate a daily battle
    const cities = ['Delhi', 'Mumbai', 'Bangalore', 'Pune', 'Hyderabad', 'Chennai'];
    const emotions: EmotionCategory[] = ['Happy', 'Motivated', 'Chill', 'Festival Joy'];
    
    // Pick 2-3 competing cities
    const competingCities = [city];
    const otherCities = cities.filter(c => c !== city);
    competingCities.push(
      otherCities[Math.floor(Math.random() * otherCities.length)]
    );
    
    if (Math.random() > 0.5 && otherCities.length > 1) {
      const third = otherCities.filter(c => !competingCities.includes(c));
      competingCities.push(third[Math.floor(Math.random() * third.length)]);
    }

    const targetEmotion = emotions[Math.floor(Math.random() * emotions.length)];
    
    // Generate realistic counts
    const baseCounts = competingCities.map(() => 500 + Math.floor(Math.random() * 500));
    const total = baseCounts.reduce((sum, count) => sum + count, 0);
    
    const cityData = competingCities.map((cityName, index) => ({
      name: cityName,
      count: baseCounts[index],
      percentage: (baseCounts[index] / total) * 100,
      isWinning: false,
      xpBonus: 0,
    }));

    // Determine winner
    const maxCount = Math.max(...baseCounts);
    const winnerIndex = baseCounts.indexOf(maxCount);
    cityData[winnerIndex].isWinning = true;
    cityData[winnerIndex].xpBonus = 15;

    const endTime = new Date();
    endTime.setHours(23, 59, 59, 999);

    const battle: CityBattle = {
      id: `battle-${Date.now()}`,
      title: `${targetEmotion} Challenge`,
      description: `Which city can share the most ${targetEmotion.toLowerCase()} vibes today?`,
      targetEmotion,
      cities: cityData,
      endsAt: endTime,
      reward: {
        xp: 500,
        coins: 100,
        badge: `${targetEmotion} Champion`,
      },
      isActive: true,
    };

    setBattles([battle]);
    setLoading(false);
  };

  const getEmotionColor = (emotion: EmotionCategory) => {
    const colors: Record<EmotionCategory, string> = {
      'Happy': 'from-yellow-400 to-orange-500',
      'Motivated': 'from-orange-400 to-red-500',
      'Chill': 'from-green-400 to-teal-500',
      'Festival Joy': 'from-purple-400 to-pink-500',
      'Sad': 'from-blue-400 to-indigo-500',
      'Lonely': 'from-purple-400 to-blue-500',
      'Angry': 'from-red-400 to-orange-600',
      'Neutral': 'from-gray-400 to-gray-600',
      'Funny': 'from-pink-400 to-rose-500',
      'Missing Home': 'from-blue-400 to-purple-500',
      'Exam Stress': 'from-red-500 to-orange-600',
      'Wedding Excitement': 'from-pink-400 to-red-500',
      'Religious Peace': 'from-purple-400 to-indigo-500',
      'Family Bonding': 'from-orange-400 to-yellow-500',
      'Career Anxiety': 'from-red-500 to-gray-600',
      'Festive Nostalgia': 'from-yellow-400 to-orange-500',
    };
    return colors[emotion] || colors['Happy'];
  };

  const getTimeRemaining = (endDate: Date): string => {
    const now = new Date();
    const diff = endDate.getTime() - now.getTime();
    
    if (diff <= 0) return 'Ended';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m remaining`;
  };

  if (loading || battles.length === 0) {
    return null;
  }

  const battle = battles[0];

  return (
    <Card className="overflow-hidden border-2">
      <div className={`h-2 bg-gradient-to-r ${getEmotionColor(battle.targetEmotion)}`} />
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="h-6 w-6 text-orange-500" />
            <CardTitle className="text-2xl">Today's Battle</CardTitle>
          </div>
          <Badge variant="destructive" className="gap-1 animate-pulse">
            <Trophy className="h-3 w-3" />
            LIVE
          </Badge>
        </div>
        <CardDescription>
          {battle.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Battle Stats */}
        <div className="space-y-4">
          {battle.cities.map((cityData, index) => (
            <motion.div
              key={cityData.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative p-4 rounded-lg border-2 ${
                cityData.isWinning
                  ? 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border-yellow-400'
                  : 'bg-card border-border'
              }`}
            >
              {cityData.isWinning && (
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute -top-3 -right-3"
                >
                  <Crown className="h-8 w-8 text-yellow-500" />
                </motion.div>
              )}

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg">{cityData.name}</h3>
                    {cityData.isWinning && (
                      <Badge className="bg-yellow-500 text-white">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Leading!
                      </Badge>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{cityData.count.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">vibes</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Progress value={cityData.percentage} className="h-3" />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {cityData.percentage.toFixed(1)}% of total
                    </span>
                    {cityData.isWinning && (
                      <span className="text-yellow-600 dark:text-yellow-400 font-semibold">
                        +{cityData.xpBonus}% XP Bonus!
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Battle Info */}
        <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg border">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold">Battle Rewards</h4>
            <Badge variant="secondary">
              {getTimeRemaining(battle.endsAt)}
            </Badge>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                +{battle.reward.xp}
              </div>
              <div className="text-xs text-muted-foreground">XP</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                +{battle.reward.coins}
              </div>
              <div className="text-xs text-muted-foreground">Coins</div>
            </div>
            <div className="text-center">
              <Trophy className="h-6 w-6 mx-auto mb-1 text-orange-500" />
              <div className="text-xs text-muted-foreground">Badge</div>
            </div>
          </div>
        </div>

        {/* Join Battle Button */}
        <Button className="w-full" size="lg">
          <Zap className="mr-2 h-4 w-4" />
          Share {battle.targetEmotion} Vibe & Earn {battle.cities.find(c => c.name === city)?.isWinning ? battle.cities.find(c => c.name === city)?.xpBonus : 0}% Bonus
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          Winners announced at midnight • Everyone gets base rewards
        </p>
      </CardContent>
    </Card>
  );
}
