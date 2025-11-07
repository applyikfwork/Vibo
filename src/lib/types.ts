import { Timestamp } from "firebase/firestore";
import { z } from 'zod';
import { DiagnoseVibeInputSchema, DiagnoseVibeOutputSchema } from './schemas';

export type EmotionCategory = 
  | 'Happy' | 'Sad' | 'Chill' | 'Motivated' | 'Lonely' | 'Angry' | 'Neutral' | 'Funny'
  | 'Festival Joy' | 'Missing Home' | 'Exam Stress' | 'Wedding Excitement' 
  | 'Religious Peace' | 'Family Bonding' | 'Career Anxiety' | 'Festive Nostalgia';

export type ZodiacSign = 
  | 'Aries' | 'Taurus' | 'Gemini' | 'Cancer' | 'Leo' | 'Virgo'
  | 'Libra' | 'Scorpio' | 'Sagittarius' | 'Capricorn' | 'Aquarius' | 'Pisces';

export type HinduMonth = 
  | 'Chaitra' | 'Vaishakha' | 'Jyeshtha' | 'Ashadha' | 'Shravana' | 'Bhadrapada'
  | 'Ashwin' | 'Kartika' | 'Margashirsha' | 'Pausha' | 'Magha' | 'Phalguna';

export type Author = {
  name: string;
  avatarUrl: string;
};

export type InteractionStyle = 'Supportive' | 'Motivated' | 'Calm' | 'Empathetic';

export type MoodHistoryEntry = {
  emotion: EmotionCategory;
  timestamp: Timestamp;
  vibeId?: string;
};

export type ExamSchedule = {
  examName: string;
  examDate: Timestamp;
  subject: string;
  importance: 'high' | 'medium' | 'low';
};

export type Location = {
  lat: number;
  lng: number;
  city?: string;
  state?: string;
  country?: string;
  geohash?: string;
};

export type UserProfile = {
    id: string;
    username: string;
    email: string;
    displayName?: string;
    anonymous?: boolean;
    currentMood?: EmotionCategory;
    moodHistory?: MoodHistoryEntry[];
    interactionStyle?: InteractionStyle;
    averageSessionTime?: number;
    activeTimePreference?: 'Morning' | 'Afternoon' | 'Evening' | 'Night';
    vibeAffinityScores?: Record<EmotionCategory, number>;
    lastMoodUpdate?: Timestamp;
    zodiacSign?: ZodiacSign;
    dateOfBirth?: Timestamp;
    enableAstrology?: boolean;
    enableSpiritualSuggestions?: boolean;
    isStudent?: boolean;
    parentLinkedUserId?: string;
    enableStudyReminders?: boolean;
    examSchedule?: ExamSchedule[];
    lastStudyBreakReminder?: Timestamp;
    consecutiveStressHours?: number;
    location?: Location;
    enableLocationSharing?: boolean;
    xp?: number;
    cityBadges?: string[];
};

export type Vibe = {
  id: string;
  userId: string;
  text: string;
  emoji: string;
  emotion: EmotionCategory;
  backgroundColor: string;
  timestamp: Timestamp;
  tagIds?: string[];
  author: Author;
  isAnonymous: boolean;
  viewCount?: number;
  isVoiceNote?: boolean;
  audioUrl?: string;
  audioDuration?: number;
  emotionStrength?: number;
  reactionCount?: number;
  commentCount?: number;
  viewDuration?: number;
  emotionMatchScore?: number;
  diversityScore?: number;
  vibeScore?: number;
  boostScore?: number;
  lastDecayUpdate?: Timestamp;
  location?: Location;
  distance?: number;
};

export type Comment = {
  id: string;
  vibeId: string;
  userId: string;
  text: string;
  timestamp: Timestamp;
  author: Author;
  isAnonymous: boolean;
};

export type Reaction = {
  id: string;
  vibeId: string;
  userId: string;
  emoji: string;
  timestamp: Timestamp;
  author: Author;
};

export type Emotion = {
  name: EmotionCategory;
  emoji: string;
  gradient: string;
};

export type MoodHistoryData = {
  day: string;
  Happy: number;
  Sad: number;
  Chill: number;
  Motivated: number;
  Lonely: number;
};

export type DiagnoseVibeInput = z.infer<typeof DiagnoseVibeInputSchema>;
export type DiagnoseVibeOutput = z.infer<typeof DiagnoseVibeOutputSchema>;

import type { AnalyzeEmotionStrengthInputSchema, AnalyzeEmotionStrengthOutputSchema } from './schemas';
export type AnalyzeEmotionStrengthInput = z.infer<typeof AnalyzeEmotionStrengthInputSchema>;
export type AnalyzeEmotionStrengthOutput = z.infer<typeof AnalyzeEmotionStrengthOutputSchema>;

import type { DailyHoroscopeInputSchema, DailyHoroscopeOutputSchema } from './schemas';
export type DailyHoroscopeInput = z.infer<typeof DailyHoroscopeInputSchema>;
export type DailyHoroscopeOutput = z.infer<typeof DailyHoroscopeOutputSchema>;

export type FeedZone = 'my-vibe' | 'healing' | 'explore';

export type RankedVibe = Vibe & {
  zone: FeedZone;
  emotionRelevanceScore: number;
  calculatedVibeScore: number;
  reasonForRanking?: string;
};

export type EmotionMatchConfig = {
  primaryEmotion: EmotionCategory;
  complementaryEmotions: EmotionCategory[];
  oppositeEmotions: EmotionCategory[];
};

export type BoostTrigger = {
  type: 'support' | 'energy' | 'conversation' | 'emotional_balance' | 'anonymous_compassion';
  score: number;
  triggered: boolean;
};

export type FeedAlgorithmInput = {
  userId: string;
  userMood: EmotionCategory;
  userProfile: UserProfile;
  limit?: number;
};

export type FeedAlgorithmOutput = {
  vibes: RankedVibe[];
  myVibeZone: RankedVibe[];
  healingZone: RankedVibe[];
  exploreZone: RankedVibe[];
};

export type CityMoodPulse = {
  city: string;
  state?: string;
  country?: string;
  timestamp: Timestamp;
  totalVibes: number;
  moodBreakdown: Record<EmotionCategory, number>;
  dominantMood: EmotionCategory;
  happinessPercentage: number;
  activeUsers: number;
};

export type CityChallenge = {
  id: string;
  city: string;
  title: string;
  description: string;
  goal: number;
  current: number;
  reward: {
    xp: number;
    badge?: string;
  };
  startDate: Timestamp;
  endDate: Timestamp;
  isActive: boolean;
  participants: string[];
};

export type MoodZone = {
  id: string;
  emotion: EmotionCategory;
  location: Location;
  userIds: string[];
  createdAt: Timestamp;
  isActive: boolean;
};
