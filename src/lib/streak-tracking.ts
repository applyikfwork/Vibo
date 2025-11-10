import type { 
  UserProfile, 
  VibeStreak, 
  EmotionExplorerProgress, 
  EmotionCategory
} from './types';
import { Timestamp } from 'firebase/firestore';

function getTimestampInMillis(timestamp: any): number {
  if (!timestamp) return Date.now();
  if (typeof timestamp === 'number') return timestamp;
  if (timestamp instanceof Date) return timestamp.getTime();
  if (timestamp.toMillis && typeof timestamp.toMillis === 'function') return timestamp.toMillis();
  if (timestamp.seconds) return timestamp.seconds * 1000;
  return Date.now();
}

export function calculateVibeStreak(
  lastPostDate?: Timestamp,
  currentStreak: number = 0,
  longestStreak: number = 0
): VibeStreak {
  const now = new Date();
  const todayDateString = now.toISOString().split('T')[0];

  if (!lastPostDate) {
    return {
      currentStreak: 1,
      longestStreak: Math.max(1, longestStreak),
      lastVibeDate: { seconds: Date.now() / 1000, nanoseconds: 0 } as any as Timestamp
    };
  }

  const lastPostMillis = getTimestampInMillis(lastPostDate);
  const lastPostDate_obj = new Date(lastPostMillis);
  const lastPostDateString = lastPostDate_obj.toISOString().split('T')[0];

  if (todayDateString === lastPostDateString) {
    return {
      currentStreak,
      longestStreak,
      lastVibeDate: lastPostDate
    };
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayDateString = yesterday.toISOString().split('T')[0];

  if (lastPostDateString === yesterdayDateString) {
    const newStreak = currentStreak + 1;
    return {
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, longestStreak),
      lastVibeDate: { seconds: Date.now() / 1000, nanoseconds: 0 } as any as Timestamp
    };
  } else {
    return {
      currentStreak: 1,
      longestStreak,
      lastVibeDate: { seconds: Date.now() / 1000, nanoseconds: 0 } as any as Timestamp
    };
  }
}

export function updateEmotionExplorer(
  currentProgress: EmotionExplorerProgress | undefined,
  newEmotion: EmotionCategory
): EmotionExplorerProgress {
  const explored = currentProgress?.emotionsExplored || [];
  
  if (!explored.includes(newEmotion)) {
    const newExplored = [...explored, newEmotion];
    const uniqueCount = newExplored.length;
    const level = Math.floor(uniqueCount / 3);
    
    return {
      emotionsExplored: newExplored,
      totalUniqueEmotions: uniqueCount,
      explorerLevel: level,
      lastExploredEmotion: newEmotion,
      lastExploredDate: { seconds: Date.now() / 1000, nanoseconds: 0 } as any as Timestamp
    };
  }
  
  return currentProgress || {
    emotionsExplored: [newEmotion],
    totalUniqueEmotions: 1,
    explorerLevel: 0,
    lastExploredEmotion: newEmotion,
    lastExploredDate: { seconds: Date.now() / 1000, nanoseconds: 0 } as any as Timestamp
  };
}

export function checkStreakMilestones(streak: number): {
  isMilestone: boolean;
  milestone?: number;
  reward?: { xp: number; coins: number; badge?: string };
} {
  const milestones = [3, 7, 14, 30, 60, 100];
  
  if (milestones.includes(streak)) {
    const rewards: Record<number, { xp: number; coins: number; badge?: string }> = {
      3: { xp: 50, coins: 20, badge: '3-Day Streak' },
      7: { xp: 100, coins: 50, badge: 'Week Warrior' },
      14: { xp: 200, coins: 100, badge: '2-Week Champion' },
      30: { xp: 500, coins: 250, badge: 'Monthly Master' },
      60: { xp: 1000, coins: 500, badge: '60-Day Legend' },
      100: { xp: 2000, coins: 1000, badge: '100-Day Titan' }
    };
    
    return {
      isMilestone: true,
      milestone: streak,
      reward: rewards[streak]
    };
  }
  
  return { isMilestone: false };
}

export function checkEmotionExplorerMilestones(explorerProgress: EmotionExplorerProgress): {
  isMilestone: boolean;
  milestone?: string;
  reward?: { xp: number; coins: number; badge?: string };
} {
  const count = explorerProgress.totalUniqueEmotions;
  
  const milestones: Record<number, { name: string; xp: number; coins: number; badge: string }> = {
    5: { name: '5 Emotions', xp: 30, coins: 15, badge: 'Emotion Novice' },
    10: { name: '10 Emotions', xp: 100, coins: 50, badge: 'Emotion Explorer' },
    15: { name: '15 Emotions', xp: 300, coins: 150, badge: 'Emotion Master' },
    16: { name: 'All Emotions', xp: 500, coins: 300, badge: 'Emotion Guru' }
  };
  
  if (milestones[count]) {
    return {
      isMilestone: true,
      milestone: milestones[count].name,
      reward: {
        xp: milestones[count].xp,
        coins: milestones[count].coins,
        badge: milestones[count].badge
      }
    };
  }
  
  return { isMilestone: false };
}

export function getStreakEncouragementMessage(streak: number): string {
  if (streak === 0) return "Start your vibe streak today! 🌟";
  if (streak === 1) return "Great start! Keep the momentum going! 🔥";
  if (streak < 3) return `${streak} day streak! You're on fire! 🔥`;
  if (streak < 7) return `${streak} day streak! Amazing dedication! ⚡`;
  if (streak < 14) return `${streak} day streak! You're unstoppable! 🚀`;
  if (streak < 30) return `${streak} day streak! Legendary status! 👑`;
  return `${streak} day streak! You're a Vibe Master! 🏆`;
}
