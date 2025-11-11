'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChallengeCard } from './ChallengeCard';
import { useUser } from '@/firebase';
import { Skeleton } from './ui/skeleton';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import type { UserChallengeSummary } from '@/lib/challenges/types';

export function ChallengeDock() {
  const { user } = useUser();
  const [challenges, setChallenges] = useState<UserChallengeSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRotating, setIsRotating] = useState(false);

  useEffect(() => {
    if (user) {
      fetchActiveChallenges();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  // Separate effect for auto-rotation that depends on challenges
  useEffect(() => {
    if (!user || challenges.length <= 1) return;
    
    const interval = setInterval(() => {
      handleNext();
    }, 8000);

    return () => clearInterval(interval);
  }, [user, challenges.length]);

  const fetchActiveChallenges = async () => {
    try {
      setIsLoading(true);
      const token = await user?.getIdToken();
      
      if (!token) return;

      const response = await fetch('/api/gamification/challenges/active', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setChallenges(data.challenges || []);
      }
    } catch (error) {
      console.error('Error fetching challenges:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (isRotating || challenges.length <= 1) return;
    setIsRotating(true);
    setCurrentIndex((prev) => (prev + 1) % challenges.length);
    setTimeout(() => setIsRotating(false), 500);
  };

  const handlePrev = () => {
    if (isRotating || challenges.length <= 1) return;
    setIsRotating(true);
    setCurrentIndex((prev) => (prev - 1 + challenges.length) % challenges.length);
    setTimeout(() => setIsRotating(false), 500);
  };

  const handleChallengeComplete = async (challengeId: string) => {
    // Refresh challenges after completion
    await fetchActiveChallenges();
  };

  // Show CTA for non-authenticated users
  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-12"
      >
        <div className="bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 rounded-2xl p-8 md:p-12 text-center border-2 border-purple-200 shadow-xl">
          <div className="flex justify-center mb-4">
            <Sparkles className="w-12 h-12 text-purple-500 animate-pulse" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Unlock AI-Powered Challenges!
          </h2>
          <p className="text-gray-700 text-lg mb-6 max-w-2xl mx-auto">
            Get personalized daily challenges that help you explore emotions, connect with others, and earn rewards. 
            Each challenge is tailored just for you using AI!
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 max-w-3xl mx-auto">
            <div className="bg-white/60 rounded-lg p-4">
              <div className="text-3xl mb-2">🎭</div>
              <div className="font-semibold text-purple-700">Emotion Exploration</div>
              <div className="text-sm text-gray-600">Try new feelings</div>
            </div>
            <div className="bg-white/60 rounded-lg p-4">
              <div className="text-3xl mb-2">🏆</div>
              <div className="font-semibold text-pink-700">Earn Rewards</div>
              <div className="text-sm text-gray-600">XP, coins & badges</div>
            </div>
            <div className="bg-white/60 rounded-lg p-4">
              <div className="text-3xl mb-2">🤝</div>
              <div className="font-semibold text-blue-700">Social Connection</div>
              <div className="text-sm text-gray-600">Connect with vibes</div>
            </div>
          </div>
          <a
            href="/login"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all"
          >
            <Sparkles className="w-5 h-5" />
            Sign In to Start Challenges
          </a>
        </div>
      </motion.div>
    );
  }

  if (isLoading) {
    return (
      <div className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-purple-500" />
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Your Challenges
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (challenges.length === 0) {
    return (
      <div className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-purple-500" />
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Your Challenges
          </h2>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-8 text-center">
          <p className="text-gray-600 mb-2">No active challenges right now</p>
          <p className="text-sm text-gray-500">Check back soon for new personalized challenges!</p>
        </div>
      </div>
    );
  }

  // Show up to 3 challenges at once on larger screens
  const visibleChallenges = challenges.slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mb-12"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-500 animate-pulse" />
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
            Challenge Dock
          </h2>
        </div>
        
        {challenges.length > 3 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={isRotating}
              className="p-2 rounded-full bg-white/80 hover:bg-white shadow-md hover:shadow-lg transition-all disabled:opacity-50"
              aria-label="Previous challenges"
            >
              <ChevronLeft className="w-5 h-5 text-purple-600" />
            </button>
            <span className="text-sm text-gray-600 font-medium">
              {currentIndex + 1} / {challenges.length}
            </span>
            <button
              onClick={handleNext}
              disabled={isRotating}
              className="p-2 rounded-full bg-white/80 hover:bg-white shadow-md hover:shadow-lg transition-all disabled:opacity-50"
              aria-label="Next challenges"
            >
              <ChevronRight className="w-5 h-5 text-purple-600" />
            </button>
          </div>
        )}
      </div>

      {/* Challenge Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {visibleChallenges.map((challenge, index) => (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <ChallengeCard
                challenge={challenge}
                onComplete={handleChallengeComplete}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Progress Indicator */}
      {challenges.length > 3 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: Math.ceil(challenges.length / 3) }).map((_, idx) => (
            <div
              key={idx}
              className={`h-2 rounded-full transition-all ${
                Math.floor(currentIndex / 3) === idx
                  ? 'w-8 bg-gradient-to-r from-purple-500 to-pink-500'
                  : 'w-2 bg-gray-300'
              }`}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
