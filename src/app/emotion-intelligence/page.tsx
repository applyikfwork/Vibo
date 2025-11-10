import { EmotionIntelligenceDashboard } from '@/components/EmotionIntelligenceDashboard';

export const metadata = {
  title: 'Emotion Intelligence | Vibo',
  description: 'Track your emotional patterns, build streaks, and grow your emotion intelligence with personalized insights.',
};

export default function EmotionIntelligencePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
      <EmotionIntelligenceDashboard />
    </div>
  );
}
