import type { 
  UserProfile, 
  EmotionCategory, 
  EmotionInsights, 
  UserInterestProfile,
  TimeSlot,
  Vibe,
  Reaction
} from './types';
import { Timestamp } from 'firebase/firestore';

export function getCurrentTimeSlot(): TimeSlot {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Morning';
  if (hour >= 12 && hour < 17) return 'Afternoon';
  if (hour >= 17 && hour < 21) return 'Evening';
  return 'Night';
}

export function calculateMoodGraph(
  moodHistory: { emotion: EmotionCategory; timestamp: Timestamp }[] = []
): Record<EmotionCategory, number> {
  const moodGraph: Record<string, number> = {};
  
  if (moodHistory.length === 0) {
    return {
      'Happy': 0.5,
      'Sad': 0.2,
      'Chill': 0.4,
      'Motivated': 0.6,
      'Lonely': 0.2,
      'Angry': 0.1,
      'Neutral': 0.3,
      'Funny': 0.4,
      'Festival Joy': 0.3,
      'Missing Home': 0.2,
      'Exam Stress': 0.2,
      'Wedding Excitement': 0.3,
      'Religious Peace': 0.4,
      'Family Bonding': 0.5,
      'Career Anxiety': 0.3,
      'Festive Nostalgia': 0.3,
    } as Record<EmotionCategory, number>;
  }

  const emotionCounts: Record<string, number> = {};
  moodHistory.forEach(entry => {
    emotionCounts[entry.emotion] = (emotionCounts[entry.emotion] || 0) + 1;
  });

  const totalCount = moodHistory.length;
  Object.keys(emotionCounts).forEach(emotion => {
    moodGraph[emotion] = emotionCounts[emotion] / totalCount;
  });

  const allEmotions: EmotionCategory[] = [
    'Happy', 'Sad', 'Chill', 'Motivated', 'Lonely', 'Angry', 'Neutral', 'Funny',
    'Festival Joy', 'Missing Home', 'Exam Stress', 'Wedding Excitement',
    'Religious Peace', 'Family Bonding', 'Career Anxiety', 'Festive Nostalgia'
  ];

  allEmotions.forEach(emotion => {
    if (!moodGraph[emotion]) {
      moodGraph[emotion] = 0.1;
    }
  });

  return moodGraph as Record<EmotionCategory, number>;
}

export function analyzeReactionPatterns(
  reactions: { emotion: EmotionCategory; timestamp: Timestamp }[] = []
): EmotionInsights['reactionPattern'] {
  if (reactions.length === 0) {
    return {
      mostReactedEmotion: 'Happy',
      reactionFrequency: {
        'Happy': 1,
        'Sad': 0,
        'Chill': 0,
        'Motivated': 0,
        'Lonely': 0,
        'Angry': 0,
        'Neutral': 0,
        'Funny': 0,
        'Festival Joy': 0,
        'Missing Home': 0,
        'Exam Stress': 0,
        'Wedding Excitement': 0,
        'Religious Peace': 0,
        'Family Bonding': 0,
        'Career Anxiety': 0,
        'Festive Nostalgia': 0,
      } as Record<EmotionCategory, number>
    };
  }

  const frequency: Record<string, number> = {};
  reactions.forEach(reaction => {
    frequency[reaction.emotion] = (frequency[reaction.emotion] || 0) + 1;
  });

  const mostReacted = Object.entries(frequency).sort((a, b) => b[1] - a[1])[0];

  return {
    mostReactedEmotion: mostReacted[0] as EmotionCategory,
    reactionFrequency: frequency as Record<EmotionCategory, number>
  };
}

export function analyzeTimeBasedMoods(
  moodHistory: { emotion: EmotionCategory; timestamp: Timestamp }[] = []
): Record<TimeSlot, EmotionCategory[]> {
  const timeSlotMoods: Record<TimeSlot, EmotionCategory[]> = {
    'Morning': [],
    'Afternoon': [],
    'Evening': [],
    'Night': []
  };

  moodHistory.forEach(entry => {
    const timestamp = entry.timestamp;
    let date: Date;

    if (timestamp instanceof Timestamp) {
      date = timestamp.toDate();
    } else if (timestamp && typeof timestamp === 'object' && 'seconds' in timestamp) {
      date = new Date((timestamp as any).seconds * 1000);
    } else {
      date = new Date();
    }

    const hour = date.getHours();
    let slot: TimeSlot;
    
    if (hour >= 5 && hour < 12) slot = 'Morning';
    else if (hour >= 12 && hour < 17) slot = 'Afternoon';
    else if (hour >= 17 && hour < 21) slot = 'Evening';
    else slot = 'Night';

    if (!timeSlotMoods[slot].includes(entry.emotion)) {
      timeSlotMoods[slot].push(entry.emotion);
    }
  });

  return timeSlotMoods;
}

export function calculateEmotionDiversity(
  moodHistory: { emotion: EmotionCategory }[] = []
): number {
  if (moodHistory.length === 0) return 0;
  
  const uniqueEmotions = new Set(moodHistory.map(entry => entry.emotion));
  const totalPossibleEmotions = 16;
  
  return uniqueEmotions.size / totalPossibleEmotions;
}

export function buildEmotionInsights(
  userProfile: Partial<UserProfile>,
  reactions: { emotion: EmotionCategory; timestamp: Timestamp }[] = []
): EmotionInsights {
  const moodHistory = userProfile.moodHistory || [];
  
  return {
    moodGraph: calculateMoodGraph(moodHistory),
    reactionPattern: analyzeReactionPatterns(reactions),
    timeBasedMoods: analyzeTimeBasedMoods(moodHistory),
    emotionDiversity: calculateEmotionDiversity(moodHistory),
    lastUpdated: Timestamp.now()
  };
}

export function buildUserInterestProfile(
  userProfile: Partial<UserProfile>,
  vibes: Vibe[] = []
): UserInterestProfile {
  const emotionWeights = userProfile.vibeAffinityScores || {} as Record<EmotionCategory, number>;
  
  const locationCluster = userProfile.location?.city || 'Unknown';
  
  const timePattern: TimeSlot[] = [];
  if (userProfile.activeTimePreference) {
    timePattern.push(userProfile.activeTimePreference);
  } else {
    timePattern.push(getCurrentTimeSlot());
  }
  
  const voiceVibes = vibes.filter(v => v.isVoiceNote);
  const formatPref: ('text' | 'voice')[] = voiceVibes.length > vibes.length * 0.3 
    ? ['voice', 'text'] 
    : ['text', 'voice'];

  return {
    emotionWeights,
    locationCluster,
    timePattern,
    formatPref,
    lastUpdated: Timestamp.now()
  };
}

export function updateEmotionWeights(
  currentWeights: Record<EmotionCategory, number> = {} as Record<EmotionCategory, number>,
  newEmotion: EmotionCategory,
  interactionType: 'view' | 'react' | 'post' | 'comment'
): Record<EmotionCategory, number> {
  const weights = { ...currentWeights };
  
  if (!weights[newEmotion]) {
    weights[newEmotion] = 0.5;
  }
  
  const boost = {
    'view': 0.02,
    'react': 0.05,
    'post': 0.08,
    'comment': 0.1,
  }[interactionType];
  
  weights[newEmotion] = Math.min(1, weights[newEmotion] + boost);
  
  return weights;
}

export function shouldSendEmotionNotification(
  userProfile: Partial<UserProfile>,
  matchingVibesCount: number,
  targetEmotion: EmotionCategory
): boolean {
  if (!userProfile.emotionNotificationsEnabled) return false;
  
  const now = Date.now();
  const lastNotification = userProfile.lastEmotionNotification;
  
  if (lastNotification) {
    const timeSinceLastNotification = now - (
      lastNotification instanceof Timestamp 
        ? lastNotification.toMillis() 
        : (lastNotification as any).seconds * 1000
    );
    
    const oneHourInMs = 60 * 60 * 1000;
    if (timeSinceLastNotification < oneHourInMs) {
      return false;
    }
  }
  
  return matchingVibesCount >= 3;
}

export function generateDailyEmotionChallenge(userId: string): {
  id: string;
  date: string;
  targetEmotion: EmotionCategory;
  targetCount: number;
  currentProgress: number;
  isCompleted: boolean;
  reward: { xp: number; coins: number; badge?: string };
  expiresAt: Timestamp;
} {
  const emotions: EmotionCategory[] = ['Happy', 'Motivated', 'Chill', 'Funny', 'Festival Joy'];
  const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
  
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0];
  
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);
  
  return {
    id: `challenge-${userId}-${dateStr}`,
    date: dateStr,
    targetEmotion: randomEmotion,
    targetCount: 3,
    currentProgress: 0,
    isCompleted: false,
    reward: {
      xp: 50,
      coins: 20,
      badge: 'Emotion Explorer'
    },
    expiresAt: Timestamp.fromDate(endOfDay)
  };
}
