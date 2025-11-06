'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FestivalCountdown } from './FestivalCountdown';
import { AstrologyDashboard } from './AstrologyDashboard';
import { useUser } from '@/firebase/hooks';
import type { ZodiacSign, EmotionCategory } from '@/lib/types';
import { motion } from 'framer-motion';

interface IndianFeaturesProps {
  currentMood?: EmotionCategory;
  userZodiacSign?: ZodiacSign;
}

export function IndianFeatures({ currentMood, userZodiacSign }: IndianFeaturesProps) {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<string>('festivals');

  // Default zodiac for demo purposes (should be from user profile in production)
  const zodiacSign = userZodiacSign || 'Aries';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full"
    >
      <div className="mb-4 text-center">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent mb-1">
          Bharat Special Features
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Festivals, Astrology & Spiritual Wellness for Indian Users
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-purple-100/50 dark:bg-purple-900/20">
          <TabsTrigger 
            value="festivals" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white"
          >
            <span className="mr-2">🎊</span>
            Festivals
          </TabsTrigger>
          <TabsTrigger 
            value="astrology"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
          >
            <span className="mr-2">⭐</span>
            Astrology
          </TabsTrigger>
        </TabsList>

        <TabsContent value="festivals" className="mt-4">
          <FestivalCountdown />
        </TabsContent>

        <TabsContent value="astrology" className="mt-4">
          <AstrologyDashboard 
            zodiacSign={zodiacSign} 
            currentMood={currentMood} 
          />
        </TabsContent>
      </Tabs>

      {/* Quick Tips */}
      <div className="mt-6 p-4 bg-gradient-to-r from-purple-100/50 via-pink-100/50 to-orange-100/50 dark:from-purple-900/10 dark:via-pink-900/10 dark:to-orange-900/10 rounded-lg border border-purple-300/30 dark:border-purple-700/30">
        <p className="text-xs font-semibold text-purple-700 dark:text-purple-300 mb-2">
          💡 Pro Tips:
        </p>
        <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-1">
          <li>✓ Post your festival vibes to connect with others celebrating</li>
          <li>✓ Use spiritual mantras when feeling stressed or anxious</li>
          <li>✓ Check your horoscope daily for emotional guidance</li>
          <li>✓ Festival countdown helps you prepare emotionally</li>
        </ul>
      </div>
    </motion.div>
  );
}
