'use client';

import { Card } from '@/components/ui/card';
import type { EmotionInsights, EmotionCategory, Emotion } from '@/lib/types';
import { emotions } from '@/lib/data';

interface MoodGraphCardProps {
  emotionInsights: EmotionInsights | null;
}

export function MoodGraphCard({ emotionInsights }: MoodGraphCardProps) {
  if (!emotionInsights) {
    return (
      <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
        <h3 className="text-lg font-bold mb-4 text-purple-800 dark:text-purple-200">Your Emotion Graph</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">Start vibing to see your emotional patterns!</p>
      </Card>
    );
  }

  const moodGraph = emotionInsights.moodGraph;
  const sortedEmotions = Object.entries(moodGraph)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8);

  return (
    <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-purple-800 dark:text-purple-200">Your Emotion Graph</h3>
        <span className="text-2xl">📊</span>
      </div>
      
      <div className="space-y-3">
        {sortedEmotions.map(([emotion, score]) => {
          const emotionData = emotions.find((e: Emotion) => e.name === emotion);
          const percentage = Math.round(score * 100);
          
          return (
            <div key={emotion} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span className="text-lg">{emotionData?.emoji || '🎭'}</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">{emotion}</span>
                </span>
                <span className="text-purple-600 dark:text-purple-400 font-bold">{percentage}%</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-purple-200 dark:border-purple-800">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Diversity Score: <span className="font-bold text-purple-600">{Math.round(emotionInsights.emotionDiversity * 100)}%</span>
        </p>
      </div>
    </Card>
  );
}
