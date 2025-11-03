import { Timestamp } from "firebase/firestore";
import { z } from 'zod';
import { DiagnoseVibeInputSchema, DiagnoseVibeOutputSchema } from './schemas';

export type EmotionCategory = 'Happy' | 'Sad' | 'Chill' | 'Motivated' | 'Lonely' | 'Angry' | 'Neutral';

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

export type UserProfile = {
    id: string;
    username: string;
    email: string;
    displayName?: string;
    anonymous?: boolean;
    // Algorithm fields
    currentMood?: EmotionCategory;
    moodHistory?: MoodHistoryEntry[];
    interactionStyle?: InteractionStyle;
    averageSessionTime?: number; // in minutes
    activeTimePreference?: 'Morning' | 'Afternoon' | 'Evening' | 'Night';
    vibeAffinityScores?: Record<EmotionCategory, number>; // Tracks emotional preferences
    lastMoodUpdate?: Timestamp;
};

export type Vibe = {
  id: string;
  userId: string;
  text: string;
  emoji: string;
  emotion: EmotionCategory;
  backgroundColor: string; // This should be the tailwind gradient class string
  timestamp: Timestamp;
  tagIds?: string[];
  // Denormalized author data for easier feed display
  author: Author;
  isAnonymous: boolean;
  viewCount?: number;
  // Algorithm signals
  emotionStrength?: number; // 0-1, AI-analyzed sentiment intensity
  reactionCount?: number; // Total reactions
  commentCount?: number; // Total comments
  viewDuration?: number; // Average view time in seconds
  emotionMatchScore?: number; // Calculated per-user
  diversityScore?: number; // Global diversity metric
  vibeScore?: number; // Final ranking score
  boostScore?: number; // Temporary boost from engagement
  lastDecayUpdate?: Timestamp; // For decay system
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
  gradient: string; // tailwind gradient class
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

// Algorithm-specific types
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
