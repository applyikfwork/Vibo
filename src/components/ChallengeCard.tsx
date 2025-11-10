'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Trophy, Star, Zap, CheckCircle } from 'lucide-react';
import { useUser } from '@/firebase';
import type { UserChallengeSummary } from '@/lib/challenges/types';
import { Progress } from './ui/progress';
import confetti from 'canvas-confetti';

interface ChallengeCardProps {
  challenge: UserChallengeSummary;
  onComplete?: (challengeId: string) => void;
}

export function ChallengeCard({ challenge, onComplete }: ChallengeCardProps) {
  const { user } = useUser();
  const [timeRemaining, setTimeRemaining] = useState('');
  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const expiryTime = challenge.expiresAt.toMillis();
      const diff = expiryTime - now;

      if (diff <= 0) {
        setTimeRemaining('Expired');
        clearInterval(interval);
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (hours > 24) {
          const days = Math.floor(hours / 24);
          setTimeRemaining(`${days}d ${hours % 24}h left`);
        } else if (hours > 0) {
          setTimeRemaining(`${hours}h ${minutes}m left`);
        } else {
          setTimeRemaining(`${minutes}m left`);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [challenge.expiresAt]);

  const progressPercent = (challenge.current / challenge.target) * 100;
  const isCompleted = challenge.status === 'completed';
  const isClaimed = challenge.status === 'claimed';

  const archetypeColors: Record<string, { from: string; to: string; icon: string }> = {
    emotion_exploration: { from: 'from-purple-500', to: 'to-pink-500', icon: '🎭' },
    social_connector: { from: 'from-blue-500', to: 'to-cyan-500', icon: '🤝' },
    discovery_quest: { from: 'from-green-500', to: 'to-emerald-500', icon: '🔍' },
    streak_builder: { from: 'from-orange-500', to: 'to-red-500', icon: '🔥' },
    location_explorer: { from: 'from-indigo-500', to: 'to-purple-500', icon: '📍' },
    festival_special: { from: 'from-yellow-500', to: 'to-orange-500', icon: '🎊' },
    flash_challenge: { from: 'from-pink-500', to: 'to-red-500', icon: '⚡' },
  };

  const colors = archetypeColors[challenge.archetype] || archetypeColors.emotion_exploration;

  const handleClaim = async () => {
    if (!user || isCompleting || !isCompleted) return;

    try {
      setIsCompleting(true);
      const token = await user.getIdToken();

      const response = await fetch('/api/gamification/challenges/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ challengeId: challenge.id }),
      });

      if (response.ok) {
        // Trigger confetti
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#a855f7', '#ec4899', '#3b82f6'],
        });

        onComplete?.(challenge.id);
      }
    } catch (error) {
      console.error('Error claiming challenge:', error);
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      className={`relative overflow-hidden rounded-2xl shadow-xl transition-all ${
        isCompleted ? 'ring-4 ring-green-400 ring-offset-2' : ''
      }`}
    >
      {/* Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.from} ${colors.to} opacity-90`} />
      
      {/* Glass Morphism Overlay */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />

      {/* Content */}
      <div className="relative p-6 text-white">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-4xl">{colors.icon}</span>
            <div>
              <h3 className="font-bold text-lg line-clamp-2">{challenge.title}</h3>
              <p className="text-white/80 text-xs capitalize">
                {challenge.archetype.replace(/_/g, ' ')}
              </p>
            </div>
          </div>
          
          {isCompleted && !isClaimed && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="bg-green-500 rounded-full p-2"
            >
              <CheckCircle className="w-5 h-5" />
            </motion.div>
          )}
        </div>

        {/* Progress Ring */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              Progress: {challenge.current} / {challenge.target}
            </span>
            <span className="text-sm font-bold">{Math.round(progressPercent)}%</span>
          </div>
          <Progress value={progressPercent} className="h-3 bg-white/30" />
        </div>

        {/* Timer */}
        <div className="flex items-center gap-2 mb-4 text-sm">
          <Clock className="w-4 h-4" />
          <span className={timeRemaining === 'Expired' ? 'text-red-200 font-bold' : 'font-medium'}>
            {timeRemaining}
          </span>
        </div>

        {/* Rewards */}
        <div className="bg-white/20 rounded-lg p-3 mb-4 backdrop-blur-sm">
          <div className="flex items-center gap-1 mb-2">
            <Trophy className="w-4 h-4" />
            <span className="text-xs font-semibold">Rewards</span>
          </div>
          <div className="flex gap-3 text-sm">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-300" />
              <span className="font-bold">{challenge.reward.xp} XP</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-yellow-300 font-bold">🪙</span>
              <span className="font-bold">{challenge.reward.coins}</span>
            </div>
            {challenge.reward.gems && challenge.reward.gems > 0 && (
              <div className="flex items-center gap-1">
                <Zap className="w-4 h-4 text-cyan-300" />
                <span className="font-bold">{challenge.reward.gems}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        {isCompleted && !isClaimed ? (
          <button
            onClick={handleClaim}
            disabled={isCompleting}
            className="w-full bg-white text-purple-600 font-bold py-3 rounded-lg hover:bg-white/90 transition-all disabled:opacity-50 shadow-lg"
          >
            {isCompleting ? 'Claiming...' : '🎉 Claim Rewards!'}
          </button>
        ) : isClaimed ? (
          <div className="w-full bg-green-500 text-white font-bold py-3 rounded-lg text-center">
            ✓ Claimed!
          </div>
        ) : (
          <button className="w-full bg-white/30 text-white font-semibold py-3 rounded-lg hover:bg-white/40 transition-all backdrop-blur-sm">
            View Progress →
          </button>
        )}
      </div>

      {/* Pulse Animation for Active Challenges */}
      {!isCompleted && progressPercent > 70 && (
        <div className="absolute top-2 right-2">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [1, 0.7, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
            className="w-3 h-3 bg-yellow-300 rounded-full"
          />
        </div>
      )}
    </motion.div>
  );
}
