'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FestivalCountdown } from './FestivalCountdown';
import { AstrologyDashboard } from './AstrologyDashboard';
import { useUser } from '@/firebase';
import { useUserProfile } from '@/hooks/useUserProfile';
import type { ZodiacSign, EmotionCategory } from '@/lib/types';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { updateIndianFeatures } from '@/app/profile/actions';
import { useState as useReactState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface IndianFeaturesProps {
  currentMood?: EmotionCategory;
}

const zodiacSigns: ZodiacSign[] = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

export function IndianFeatures({ currentMood }: IndianFeaturesProps) {
  const { user } = useUser();
  const { profile, isLoading: isProfileLoading, refetch } = useUserProfile();
  const [activeTab, setActiveTab] = useReactState<string>('festivals');
  const [selectedZodiac, setSelectedZodiac] = useReactState<ZodiacSign | undefined>(undefined);
  const [isSaving, setIsSaving] = useReactState(false);
  const { toast } = useToast();

  // Use profile zodiac sign or fallback to selection or default
  const zodiacSign = profile?.zodiacSign || selectedZodiac || 'Aries';
  const needsSetup = !profile?.zodiacSign;

  const handleSaveZodiac = async () => {
    if (!user || !selectedZodiac) return;
    
    setIsSaving(true);
    const result = await updateIndianFeatures({
      userId: user.uid,
      zodiacSign: selectedZodiac,
      enableAstrology: true,
      enableSpiritualSuggestions: true,
    });

    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.message,
      });
    } else {
      toast({
        title: 'Success',
        description: 'Your zodiac sign has been saved!',
      });
      // Refetch profile to update UI immediately
      refetch();
    }
    setIsSaving(false);
  };

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

      {/* Zodiac Setup Card (show if no zodiac sign set) */}
      {needsSetup && user && !user.isAnonymous && (
        <Card className="mb-4 p-4 bg-gradient-to-r from-purple-100/50 to-pink-100/50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-300/50">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-sm font-semibold text-purple-700 dark:text-purple-300 mb-2">
                ⭐ Set Your Zodiac Sign for Personalized Horoscope
              </p>
              <Select value={selectedZodiac} onValueChange={(value) => setSelectedZodiac(value as ZodiacSign)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select your zodiac sign..." />
                </SelectTrigger>
                <SelectContent>
                  {zodiacSigns.map((sign) => (
                    <SelectItem key={sign} value={sign}>
                      {sign}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={handleSaveZodiac} 
              disabled={!selectedZodiac || isSaving}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </Card>
      )}

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
