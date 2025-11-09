'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Sparkles, Gift, Zap, X } from 'lucide-react';
import Confetti from 'react-confetti';

type Milestone = {
  id: string;
  title: string;
  description: string;
  type: 'city' | 'emotion' | 'personal' | 'community';
  reward: {
    xp: number;
    coins: number;
  };
  celebration: string;
};

export function MilestoneCelebration({ 
  vibes, 
  city 
}: { 
  vibes: any[]; 
  city: string;
}) {
  const [activeMilestone, setActiveMilestone] = useState<Milestone | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [checkedMilestones, setCheckedMilestones] = useState<Set<string>>(new Set());

  useEffect(() => {
    checkForMilestones();
  }, [vibes, city]);

  const checkForMilestones = () => {
    const totalVibes = vibes.length;
    
    // Define milestone thresholds
    const milestones: { threshold: number; milestone: Milestone }[] = [
      {
        threshold: 100,
        milestone: {
          id: '100-vibes',
          title: '🎊 100 Vibes Milestone!',
          description: `${city} has reached 100 shared vibes!`,
          type: 'city',
          reward: { xp: 50, coins: 25 },
          celebration: `${city} community is thriving!`,
        },
      },
      {
        threshold: 500,
        milestone: {
          id: '500-vibes',
          title: '🎉 500 Vibes Milestone!',
          description: `Amazing! ${city} has 500+ shared emotions!`,
          type: 'city',
          reward: { xp: 100, coins: 50 },
          celebration: `Half a thousand voices heard!`,
        },
      },
      {
        threshold: 1000,
        milestone: {
          id: '1000-vibes',
          title: '🏆 1,000 Vibes Milestone!',
          description: `Incredible! ${city} has reached 1,000 vibes!`,
          type: 'city',
          reward: { xp: 200, coins: 100 },
          celebration: `${city} is a Vibe Champion City!`,
        },
      },
      {
        threshold: 5000,
        milestone: {
          id: '5000-vibes',
          title: '👑 5,000 Vibes Milestone!',
          description: `Legendary! ${city} has 5,000+ shared vibes!`,
          type: 'city',
          reward: { xp: 500, coins: 250 },
          celebration: `${city} is in the Hall of Fame!`,
        },
      },
    ];

    // Find the highest achieved milestone that hasn't been shown yet
    for (let i = milestones.length - 1; i >= 0; i--) {
      const { threshold, milestone } = milestones[i];
      if (totalVibes >= threshold && !checkedMilestones.has(milestone.id)) {
        setActiveMilestone(milestone);
        setShowConfetti(true);
        setCheckedMilestones(prev => new Set(prev).add(milestone.id));
        
        // Auto-hide after 8 seconds
        setTimeout(() => {
          setShowConfetti(false);
        }, 8000);
        
        break;
      }
    }
  };

  const handleDismiss = () => {
    setActiveMilestone(null);
    setShowConfetti(false);
  };

  const getMilestoneColor = (type: Milestone['type']) => {
    switch (type) {
      case 'city':
        return 'from-purple-500 to-pink-500';
      case 'emotion':
        return 'from-blue-500 to-cyan-500';
      case 'personal':
        return 'from-orange-500 to-yellow-500';
      case 'community':
        return 'from-green-500 to-teal-500';
      default:
        return 'from-gray-500 to-slate-500';
    }
  };

  if (!activeMilestone) return null;

  return (
    <>
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <Confetti
            recycle={false}
            numberOfPieces={500}
            gravity={0.3}
          />
        </div>
      )}

      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 50 }}
          transition={{ type: 'spring', duration: 0.6 }}
          className="fixed bottom-4 right-4 z-40 max-w-md"
        >
          <Card className={`border-4 bg-gradient-to-br ${getMilestoneColor(activeMilestone.type)} p-1`}>
            <div className="bg-card rounded-lg">
              <CardContent className="p-6 relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={handleDismiss}
                >
                  <X className="h-4 w-4" />
                </Button>

                <motion.div
                  animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                  transition={{ repeat: 3, duration: 0.5 }}
                  className="mb-4"
                >
                  <Trophy className="h-16 w-16 mx-auto text-yellow-500" />
                </motion.div>

                <h3 className="text-2xl font-bold text-center mb-2">
                  {activeMilestone.title}
                </h3>

                <p className="text-center text-muted-foreground mb-4">
                  {activeMilestone.description}
                </p>

                <div className="flex items-center justify-center gap-2 mb-4">
                  <Badge className={`bg-gradient-to-r ${getMilestoneColor(activeMilestone.type)} text-white px-4 py-2`}>
                    <Sparkles className="h-4 w-4 mr-2" />
                    {activeMilestone.celebration}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Zap className="h-4 w-4 text-purple-600" />
                      <span className="text-2xl font-bold text-purple-600">+{activeMilestone.reward.xp}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">XP</div>
                  </div>

                  <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Gift className="h-4 w-4 text-yellow-600" />
                      <span className="text-2xl font-bold text-yellow-600">+{activeMilestone.reward.coins}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">Coins</div>
                  </div>
                </div>

                <Button
                  onClick={handleDismiss}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  Awesome! Thanks!
                </Button>

                <p className="text-xs text-center text-muted-foreground mt-3">
                  Everyone in {city} gets bonus rewards! 🎉
                </p>
              </CardContent>
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
