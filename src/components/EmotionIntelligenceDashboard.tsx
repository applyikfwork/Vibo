'use client';

import { useEmotionIntelligence } from '@/hooks/useEmotionIntelligence';
import { useVibeStreaks } from '@/hooks/useVibeStreaks';
import { MoodGraphCard } from './MoodGraphCard';
import { VibeStreakCard } from './VibeStreakCard';
import { DailyEmotionChallengeCard } from './DailyEmotionChallengeCard';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Card } from './ui/card';
import { Brain, TrendingUp } from 'lucide-react';

export function EmotionIntelligenceDashboard() {
  const { emotionInsights, interestProfile, isLoading: insightsLoading } = useEmotionIntelligence();
  const { vibeStreak, emotionExplorer, isLoading: streaksLoading } = useVibeStreaks();
  const { profile } = useUserProfile();

  if (insightsLoading || streaksLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-3 mb-3">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Emotion Intelligence
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Understand your emotional patterns and grow your vibe journey
        </p>
      </div>

      <MoodGraphCard emotionInsights={emotionInsights} />

      <VibeStreakCard vibeStreak={vibeStreak} emotionExplorer={emotionExplorer} />

      <DailyEmotionChallengeCard 
        challenge={profile?.dailyEmotionChallenge || null}
        onStartChallenge={() => console.log('Start challenge')}
      />

      {interestProfile && (
        <Card className="p-6 bg-gradient-to-br from-indigo-500/10 to-blue-500/10 border-indigo-500/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-indigo-500/20 rounded-full">
              <TrendingUp className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-bold text-indigo-800 dark:text-indigo-200">Your Interest Profile</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">Personalized insights</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Location Cluster</p>
              <p className="text-lg font-bold text-indigo-600">📍 {interestProfile.locationCluster}</p>
            </div>

            <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Active Time</p>
              <p className="text-lg font-bold text-indigo-600">
                🕐 {interestProfile.timePattern.join(', ')}
              </p>
            </div>

            <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Preferred Format</p>
              <p className="text-lg font-bold text-indigo-600">
                {interestProfile.formatPref[0] === 'voice' ? '🎤 Voice' : '📝 Text'}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
