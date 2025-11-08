'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';

interface RewardToastProps {
  xpGained?: number;
  coinsGained?: number;
  gemsGained?: number;
  badgeEarned?: string;
  leveledUp?: boolean;
  newLevel?: number;
  tierChanged?: boolean;
  newTier?: string;
  show: boolean;
  onClose: () => void;
}

export function RewardToast({
  xpGained,
  coinsGained,
  gemsGained,
  badgeEarned,
  leveledUp,
  newLevel,
  tierChanged,
  newTier,
  show,
  onClose,
}: RewardToastProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (show && (leveledUp || tierChanged || badgeEarned)) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [show, leveledUp, tierChanged, badgeEarned]);

  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => onClose(), 5000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <>
      {showConfetti && (
        <Confetti
          width={typeof window !== 'undefined' ? window.innerWidth : 300}
          height={typeof window !== 'undefined' ? window.innerHeight : 200}
          recycle={false}
          numberOfPieces={200}
        />
      )}

      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl shadow-2xl p-6 min-w-[320px]">
            {leveledUp && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="text-center mb-4"
              >
                <div className="text-5xl mb-2">🎉</div>
                <div className="text-2xl font-bold">Level Up!</div>
                <div className="text-xl">You reached Level {newLevel}</div>
              </motion.div>
            )}

            {tierChanged && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="text-center mb-4"
              >
                <div className="text-5xl mb-2">👑</div>
                <div className="text-2xl font-bold">Tier Upgrade!</div>
                <div className="text-xl capitalize">{newTier} Tier Achieved</div>
              </motion.div>
            )}

            {badgeEarned && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, type: 'spring' }}
                className="text-center mb-4"
              >
                <div className="text-5xl mb-2">🏆</div>
                <div className="text-lg font-semibold">New Badge Earned!</div>
                <div className="text-sm opacity-90">{badgeEarned}</div>
              </motion.div>
            )}

            <div className="flex gap-4 justify-center items-center text-center">
              {xpGained && xpGained > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-center gap-2"
                >
                  <span className="text-2xl">⭐</span>
                  <div>
                    <div className="text-2xl font-bold">+{xpGained}</div>
                    <div className="text-xs opacity-90">XP</div>
                  </div>
                </motion.div>
              )}

              {coinsGained && coinsGained > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-2"
                >
                  <span className="text-2xl">🪙</span>
                  <div>
                    <div className="text-2xl font-bold">+{coinsGained}</div>
                    <div className="text-xs opacity-90">Coins</div>
                  </div>
                </motion.div>
              )}

              {gemsGained && gemsGained > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center gap-2"
                >
                  <span className="text-2xl">💎</span>
                  <div>
                    <div className="text-2xl font-bold">+{gemsGained}</div>
                    <div className="text-xs opacity-90">Gems</div>
                  </div>
                </motion.div>
              )}
            </div>

            <button
              onClick={onClose}
              className="mt-4 w-full bg-white/20 hover:bg-white/30 rounded-lg py-2 px-4 transition-colors"
            >
              Awesome!
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
