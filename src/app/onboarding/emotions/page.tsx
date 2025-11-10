'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronRight, Check } from 'lucide-react';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import type { EmotionCategory } from '@/lib/types';

const EMOTIONS: { emotion: EmotionCategory; emoji: string; description: string; color: string }[] = [
  { emotion: 'Happy', emoji: '😊', description: 'Joyful and content', color: 'from-yellow-400 to-orange-400' },
  { emotion: 'Sad', emoji: '😢', description: 'Feeling down or blue', color: 'from-blue-500 to-indigo-600' },
  { emotion: 'Chill', emoji: '😌', description: 'Relaxed and peaceful', color: 'from-teal-400 to-cyan-500' },
  { emotion: 'Motivated', emoji: '🔥', description: 'Energized and driven', color: 'from-orange-500 to-red-500' },
  { emotion: 'Lonely', emoji: '💔', description: 'Seeking connection', color: 'from-purple-500 to-pink-600' },
  { emotion: 'Angry', emoji: '😠', description: 'Frustrated or upset', color: 'from-red-600 to-orange-700' },
  { emotion: 'Neutral', emoji: '😐', description: 'Just vibing', color: 'from-gray-500 to-gray-600' },
  { emotion: 'Funny', emoji: '😂', description: 'Playful and lighthearted', color: 'from-green-400 to-yellow-400' },
  { emotion: 'Festival Joy', emoji: '🎉', description: 'Celebrating life', color: 'from-pink-400 to-purple-500' },
  { emotion: 'Missing Home', emoji: '🏠', description: 'Homesick and nostalgic', color: 'from-blue-400 to-purple-500' },
  { emotion: 'Exam Stress', emoji: '📚', description: 'Studying hard', color: 'from-red-500 to-yellow-500' },
  { emotion: 'Wedding Excitement', emoji: '💒', description: 'Celebrating love', color: 'from-pink-400 to-red-400' },
  { emotion: 'Religious Peace', emoji: '🕉️', description: 'Spiritual calm', color: 'from-amber-300 to-orange-400' },
  { emotion: 'Family Bonding', emoji: '👨‍👩‍👧‍👦', description: 'Together with loved ones', color: 'from-green-400 to-teal-500' },
  { emotion: 'Career Anxiety', emoji: '💼', description: 'Work stress', color: 'from-indigo-600 to-blue-700' },
  { emotion: 'Festive Nostalgia', emoji: '🎊', description: 'Missing celebrations', color: 'from-purple-400 to-pink-500' },
];

export default function EmotionOnboardingPage() {
  const [selectedEmotions, setSelectedEmotions] = useState<EmotionCategory[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useUser();
  const router = useRouter();

  const toggleEmotion = (emotion: EmotionCategory) => {
    if (selectedEmotions.includes(emotion)) {
      setSelectedEmotions(prev => prev.filter(e => e !== emotion));
    } else if (selectedEmotions.length < 5) {
      setSelectedEmotions(prev => [...prev, emotion]);
    }
  };

  const handleContinue = async () => {
    if (!user || selectedEmotions.length < 3) return;

    setIsSubmitting(true);
    try {
      await fetch('/api/feed/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          selectedEmotions,
          contentPreferences: {
            shortText: 1,
            mediumText: 1,
            longText: 1,
          },
        }),
      });

      router.push('/emotion-feed');
    } catch (error) {
      console.error('Failed to save preferences:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 p-6">
      <div className="max-w-4xl mx-auto py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            What's your current vibe?
          </h1>
          <p className="text-xl text-white/90">
            Select 3-5 emotions to personalize your feed
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map((num) => (
              <div
                key={num}
                className={`w-3 h-3 rounded-full transition-all ${
                  selectedEmotions.length >= num 
                    ? 'bg-white scale-110' 
                    : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {EMOTIONS.map((item, index) => {
            const isSelected = selectedEmotions.includes(item.emotion);
            const isDisabled = !isSelected && selectedEmotions.length >= 5;

            return (
              <motion.button
                key={item.emotion}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => toggleEmotion(item.emotion)}
                disabled={isDisabled}
                className={`relative p-6 rounded-2xl border-2 transition-all ${
                  isSelected
                    ? 'border-white bg-white/20 backdrop-blur-sm scale-105'
                    : isDisabled
                    ? 'border-white/20 bg-white/5 opacity-50 cursor-not-allowed'
                    : 'border-white/40 bg-white/10 backdrop-blur-sm hover:bg-white/20 hover:scale-105'
                }`}
              >
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white flex items-center justify-center"
                  >
                    <Check className="w-4 h-4 text-purple-600" />
                  </motion.div>
                )}
                <div className="text-5xl mb-3">{item.emoji}</div>
                <div className="text-white font-semibold mb-1">{item.emotion}</div>
                <div className="text-white/70 text-xs">{item.description}</div>
              </motion.button>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <button
            onClick={handleContinue}
            disabled={selectedEmotions.length < 3 || isSubmitting}
            className={`px-8 py-4 rounded-full font-semibold text-lg transition-all flex items-center gap-2 mx-auto ${
              selectedEmotions.length >= 3
                ? 'bg-white text-purple-600 hover:bg-white/90 hover:scale-105'
                : 'bg-white/20 text-white/50 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Setting up your feed...
              </>
            ) : (
              <>
                Continue to Feed
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
          {selectedEmotions.length < 3 && (
            <p className="text-white/70 mt-4 text-sm">
              Please select at least 3 emotions to continue
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
