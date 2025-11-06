'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { zodiacData, spiritualHealingGuide, hinduCalendarInfo } from '@/lib/astrology';
import type { ZodiacSign, EmotionCategory, DailyHoroscopeOutput } from '@/lib/types';
import { Progress } from '@/components/ui/progress';

interface AstrologyDashboardProps {
  zodiacSign: ZodiacSign;
  currentMood?: EmotionCategory;
}

export function AstrologyDashboard({ zodiacSign, currentMood }: AstrologyDashboardProps) {
  const [horoscope, setHoroscope] = useState<DailyHoroscopeOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const zodiacInfo = zodiacData[zodiacSign];
  const spiritualGuide = currentMood ? spiritualHealingGuide[currentMood] : null;
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todayInfo = hinduCalendarInfo.auspiciousDays.find(d => d.day === today);

  useEffect(() => {
    async function fetchHoroscope() {
      setIsLoading(true);
      try {
        const response = await fetch('/api/astrology/daily-horoscope', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ zodiacSign, currentMood }),
        });
        
        if (response.ok) {
          const data = await response.json();
          setHoroscope(data);
        }
      } catch (error) {
        console.error('Failed to fetch horoscope:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchHoroscope();
  }, [zodiacSign, currentMood]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      {/* Zodiac Info Card */}
      <Card className="bg-gradient-to-br from-purple-500/10 via-indigo-500/10 to-blue-500/10 border-2 border-purple-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-3xl">{zodiacInfo.emoji}</span>
            <div>
              <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Your Emotional Stars Today
              </span>
              <p className="text-sm font-normal text-gray-600 dark:text-gray-400">
                {zodiacSign} ({zodiacInfo.hindiName}) • {zodiacInfo.dateRange}
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Zodiac Details */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/50 dark:bg-black/50 p-3 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400">Element</p>
              <p className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                {zodiacInfo.element}
              </p>
            </div>
            <div className="bg-white/50 dark:bg-black/50 p-3 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400">Ruling Planet</p>
              <p className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                {zodiacInfo.rulingPlanet}
              </p>
            </div>
            <div className="bg-white/50 dark:bg-black/50 p-3 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400">Lucky Day</p>
              <p className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                {zodiacInfo.luckyDay}
              </p>
            </div>
            <div className="bg-white/50 dark:bg-black/50 p-3 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400">Spiritual Color</p>
              <p className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                {zodiacInfo.spiritualColor}
              </p>
            </div>
          </div>

          {/* Emotional Strengths */}
          <div>
            <p className="text-xs font-semibold text-purple-700 dark:text-purple-300 mb-2">
              Your Emotional Strengths:
            </p>
            <div className="flex flex-wrap gap-2">
              {zodiacInfo.emotionalStrengths.map((emotion, idx) => (
                <Badge key={idx} variant="secondary" className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                  {emotion}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Horoscope */}
      {isLoading ? (
        <Card className="bg-gradient-to-br from-orange-500/10 to-pink-500/10 border-2 border-orange-500/30">
          <CardContent className="py-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <p className="ml-3 text-purple-600 dark:text-purple-400">Reading the stars...</p>
            </div>
          </CardContent>
        </Card>
      ) : horoscope ? (
        <Card className="bg-gradient-to-br from-orange-500/10 to-pink-500/10 border-2 border-orange-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">⭐</span>
              <span className="bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                Today's Emotional Forecast
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Emotional Forecast */}
            <div className="bg-white/50 dark:bg-black/50 p-4 rounded-lg">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {horoscope.emotionalForecast}
              </p>
            </div>

            {/* Connection Score */}
            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-purple-700 dark:text-purple-300">
                  Emotional Connection Strength
                </p>
                <p className="text-lg font-bold text-purple-700 dark:text-purple-300">
                  {horoscope.connectionScore}/10
                </p>
              </div>
              <Progress value={horoscope.connectionScore * 10} className="h-2" />
            </div>

            <Separator />

            {/* Lucky & Challenge Emotions */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-green-100/50 dark:bg-green-900/20 p-3 rounded-lg">
                <p className="text-xs font-semibold text-green-700 dark:text-green-300 mb-1">
                  ✨ Lucky Emotion
                </p>
                <p className="text-sm font-bold text-green-800 dark:text-green-200">
                  {horoscope.luckyEmotion}
                </p>
              </div>
              <div className="bg-amber-100/50 dark:bg-amber-900/20 p-3 rounded-lg">
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-300 mb-1">
                  ⚠️ Be Mindful Of
                </p>
                <p className="text-sm font-bold text-amber-800 dark:text-amber-200">
                  {horoscope.challengeEmotion}
                </p>
              </div>
            </div>

            {/* Mood Advice */}
            <div className="bg-blue-100/50 dark:bg-blue-900/20 p-4 rounded-lg">
              <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2">
                💡 Today's Mood Advice:
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {horoscope.moodAdvice}
              </p>
            </div>

            {/* Spiritual Focus */}
            <div className="bg-purple-100/50 dark:bg-purple-900/20 p-4 rounded-lg">
              <p className="text-xs font-semibold text-purple-700 dark:text-purple-300 mb-2">
                🕉️ Spiritual Focus:
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {horoscope.spiritualFocus}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Spiritual Healing Guide (if current mood is set) */}
      {spiritualGuide && (
        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-2 border-amber-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">🙏</span>
              <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                Spiritual Healing for {currentMood}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Mantra */}
            <div className="bg-white/50 dark:bg-black/50 p-3 rounded-lg">
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-300 mb-1">
                Sacred Mantra:
              </p>
              <p className="text-lg font-bold text-amber-800 dark:text-amber-200 mb-1">
                {spiritualGuide.mantra}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 italic">
                {spiritualGuide.mantraTranslation}
              </p>
            </div>

            {/* Meditation & Breathing */}
            <div className="grid grid-cols-1 gap-3">
              <div className="bg-orange-100/50 dark:bg-orange-900/20 p-3 rounded-lg">
                <p className="text-xs font-semibold text-orange-700 dark:text-orange-300 mb-1">
                  🧘 Meditation:
                </p>
                <p className="text-xs text-gray-700 dark:text-gray-300">
                  {spiritualGuide.meditation}
                </p>
              </div>
              <div className="bg-orange-100/50 dark:bg-orange-900/20 p-3 rounded-lg">
                <p className="text-xs font-semibold text-orange-700 dark:text-orange-300 mb-1">
                  🌬️ Breathing:
                </p>
                <p className="text-xs text-gray-700 dark:text-gray-300">
                  {spiritualGuide.breathingTechnique}
                </p>
              </div>
            </div>

            {/* Mudra */}
            <div className="bg-amber-100/50 dark:bg-amber-900/20 p-3 rounded-lg">
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-300 mb-1">
                👌 Mudra (Hand Gesture):
              </p>
              <p className="text-xs text-gray-700 dark:text-gray-300">
                {spiritualGuide.mudra}
              </p>
            </div>

            {/* Spiritual Advice */}
            <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 p-4 rounded-lg border border-amber-500/30">
              <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                💫 "{spiritualGuide.spiritualAdvice}"
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hindu Calendar Today */}
      {todayInfo && (
        <Card className="bg-gradient-to-br from-green-500/10 to-teal-500/10 border-2 border-green-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">📅</span>
              <span className="bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                Today in Hindu Calendar
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="bg-white/50 dark:bg-black/50 p-3 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400">Deity of the Day</p>
              <p className="text-sm font-semibold text-green-700 dark:text-green-300">
                {todayInfo.deity}
              </p>
            </div>
            <div className="bg-white/50 dark:bg-black/50 p-3 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400">Auspicious For</p>
              <p className="text-sm font-semibold text-green-700 dark:text-green-300">
                {todayInfo.activity}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
