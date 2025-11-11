'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, Sparkles } from 'lucide-react';
import type { EmotionCategory } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const EMOTIONS: { emotion: EmotionCategory; emoji: string; color: string }[] = [
  { emotion: 'Happy', emoji: '😊', color: 'from-yellow-400 to-orange-400' },
  { emotion: 'Sad', emoji: '😢', color: 'from-blue-500 to-indigo-600' },
  { emotion: 'Chill', emoji: '😌', color: 'from-teal-400 to-cyan-500' },
  { emotion: 'Motivated', emoji: '🔥', color: 'from-orange-500 to-red-500' },
  { emotion: 'Lonely', emoji: '💔', color: 'from-purple-500 to-pink-600' },
  { emotion: 'Angry', emoji: '😠', color: 'from-red-600 to-orange-700' },
  { emotion: 'Neutral', emoji: '😐', color: 'from-gray-500 to-gray-600' },
  { emotion: 'Funny', emoji: '😂', color: 'from-green-400 to-yellow-400' },
  { emotion: 'Festival Joy', emoji: '🎉', color: 'from-pink-400 to-purple-500' },
  { emotion: 'Missing Home', emoji: '🏠', color: 'from-blue-400 to-purple-500' },
  { emotion: 'Exam Stress', emoji: '📚', color: 'from-red-500 to-yellow-500' },
  { emotion: 'Wedding Excitement', emoji: '💒', color: 'from-pink-400 to-red-400' },
  { emotion: 'Religious Peace', emoji: '🕉️', color: 'from-amber-300 to-orange-400' },
  { emotion: 'Family Bonding', emoji: '👨‍👩‍👧‍👦', color: 'from-green-400 to-teal-500' },
  { emotion: 'Career Anxiety', emoji: '💼', color: 'from-indigo-600 to-blue-700' },
  { emotion: 'Festive Nostalgia', emoji: '🎊', color: 'from-purple-400 to-pink-500' },
];

interface MoodSelectorProps {
  userId: string;
  currentMood?: EmotionCategory | null;
  onMoodChange: (mood: EmotionCategory) => void;
}

export function MoodSelector({ userId, currentMood, onMoodChange }: MoodSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const currentEmotion = EMOTIONS.find(e => e.emotion === currentMood);

  const handleSelectMood = async (mood: EmotionCategory) => {
    if (mood === currentMood) {
      setIsOpen(false);
      return;
    }

    setIsUpdating(true);
    
    try {
      const response = await fetch('/api/user/mood', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          currentMood: mood,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to update mood');
      }

      onMoodChange(mood);
      
      toast({
        title: 'Vibe Updated!',
        description: `Your feed will now show ${mood} vibes 🎯`,
      });
      
      setIsOpen(false);
    } catch (error: any) {
      console.error('Error updating mood:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to update vibe',
        description: error.message || 'Please try again',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isUpdating}
        className="flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {currentEmotion ? (
          <>
            <span className="text-2xl">{currentEmotion.emoji}</span>
            <span className="font-semibold text-gray-800">{currentEmotion.emotion}</span>
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5 text-purple-600" />
            <span className="font-semibold text-gray-800">Select Vibe</span>
          </>
        )}
        <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute top-full mt-2 left-0 w-80 max-h-96 overflow-y-auto bg-white rounded-2xl shadow-2xl border border-purple-200 z-50 p-4"
          >
            <div className="grid grid-cols-2 gap-2">
              {EMOTIONS.map((item) => {
                const isSelected = item.emotion === currentMood;
                
                return (
                  <button
                    key={item.emotion}
                    onClick={() => handleSelectMood(item.emotion)}
                    disabled={isUpdating}
                    className={`relative p-3 rounded-xl border-2 transition-all ${
                      isSelected
                        ? 'border-purple-500 bg-purple-50 scale-105'
                        : 'border-gray-200 bg-white hover:bg-gray-50 hover:border-purple-300 hover:scale-105'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isSelected && (
                      <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <div className="text-3xl mb-1">{item.emoji}</div>
                    <div className="text-sm font-semibold text-gray-800">{item.emotion}</div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
