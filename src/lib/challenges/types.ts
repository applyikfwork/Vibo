import { Timestamp } from 'firebase/firestore';

// Challenge Archetypes
export type ChallengeArchetype =
  | 'emotion_exploration'
  | 'social_connector'
  | 'discovery_quest'
  | 'streak_builder'
  | 'location_explorer'
  | 'festival_special'
  | 'flash_challenge';

// Challenge Difficulty Levels
export type ChallengeDifficulty = 'easy' | 'medium' | 'hard' | 'expert';

// Challenge Cadence
export type ChallengeCadence = 'hourly' | 'daily' | 'weekly' | 'festival' | 'special';

// Challenge Status
export type ChallengeStatus = 'active' | 'completed' | 'expired' | 'claimed';

// Reward Structure
export interface ChallengeReward {
  xp: number;
  coins: number;
  gems?: number;
  badges?: string[];
  unlocks?: string[]; // Profile unlocks like frames, themes
}

// Challenge Template (Static Archetype Definition)
export interface ChallengeTemplate {
  id: string;
  archetype: ChallengeArchetype;
  name: string;
  description: string;
  icon: string;
  difficulty: ChallengeDifficulty;
  cadence: ChallengeCadence;
  baseReward: ChallengeReward;
  targetRange: {
    min: number;
    max: number;
  };
  requiredSignals: string[]; // e.g., ['emotion_history', 'location', 'streak']
  promptTemplate: string; // Template for AI personalization
  cooldownHours?: number; // Minimum hours between same archetype
}

// Challenge Instance (Materialized for a specific time window)
export interface ChallengeInstance {
  id: string;
  templateId: string;
  archetype: ChallengeArchetype;
  cadence: ChallengeCadence;
  difficulty: ChallengeDifficulty;
  
  // AI-Personalized Fields
  title: string;
  description: string;
  motivationalMessage: string;
  target: number;
  targetDescription: string; // e.g., "3 different emotions", "5 reactions"
  
  // Reward
  reward: ChallengeReward;
  
  // Timing
  createdAt: Timestamp;
  expiresAt: Timestamp;
  startedAt?: Timestamp;
  
  // Visibility & Limits
  maxParticipants?: number; // For flash challenges
  currentParticipants?: number;
  
  // Metadata
  metadata: {
    generatedBy: 'ai' | 'template' | 'manual';
    aiPrompt?: string;
    aiResponse?: string;
    festivalId?: string;
    cityTarget?: string;
  };
}

// User Challenge Progress (Per-user state)
export interface UserChallengeProgress {
  id: string; // Format: `${userId}_${challengeInstanceId}`
  userId: string;
  challengeInstanceId: string;
  challengeTemplateId: string;
  archetype: ChallengeArchetype;
  
  // Progress Tracking
  current: number;
  target: number;
  status: ChallengeStatus;
  
  // Timing
  assignedAt: Timestamp;
  startedAt?: Timestamp;
  completedAt?: Timestamp;
  claimedAt?: Timestamp;
  expiresAt: Timestamp;
  
  // Reward Snapshot (frozen at assignment)
  rewardSnapshot: ChallengeReward;
  
  // Completion Proof
  completionProof?: {
    vibeIds?: string[];
    reactionIds?: string[];
    locationIds?: string[];
    metadata?: Record<string, any>;
  };
  
  // Celebration State
  celebrationShown?: boolean;
}

// User Challenge Summary (Stored on user doc for fast reads)
export interface UserChallengeSummary {
  id: string;
  archetype: ChallengeArchetype;
  title: string;
  current: number;
  target: number;
  expiresAt: Timestamp;
  reward: ChallengeReward;
  status: ChallengeStatus;
}

// User Signals for AI Personalization
export interface UserChallengeSignals {
  userId: string;
  
  // Emotion Patterns
  emotionHistory: {
    emotion: string;
    count: number;
    lastUsed?: Timestamp;
  }[];
  unusedEmotions: string[];
  favoriteEmotion?: string;
  
  // Social Patterns
  reactionCount: number;
  commentCount: number;
  averageReactionsPerDay: number;
  
  // Location Patterns
  currentCity?: string;
  visitedCities: string[];
  currentLocation?: {
    lat: number;
    lng: number;
  };
  
  // Engagement Patterns
  currentStreak: number;
  longestStreak: number;
  lastActiveDate?: Timestamp;
  averagePostsPerDay: number;
  
  // User Profile
  level: number;
  tier: string;
  timezone: string;
  
  // Recent Challenge History
  recentCompletions: {
    archetype: ChallengeArchetype;
    completedAt: Timestamp;
  }[];
  completionRate: number; // 0-1, percentage of completed vs assigned
  averageDifficulty: ChallengeDifficulty;
  
  // Festival Context
  upcomingFestivals?: {
    id: string;
    name: string;
    date: string;
  }[];
}

// AI Personalization Request
export interface ChallengePersonalizationRequest {
  templateId: string;
  archetype: ChallengeArchetype;
  difficulty: ChallengeDifficulty;
  userSignals: UserChallengeSignals;
  contextualHints?: {
    timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
    dayOfWeek?: string;
    festivalContext?: string;
  };
}

// AI Personalization Response
export interface ChallengePersonalizationResponse {
  title: string;
  description: string;
  motivationalMessage: string;
  target: number;
  targetDescription: string;
  difficultyAdjustment?: ChallengeDifficulty; // AI can suggest difficulty change
  estimatedCompletionTime?: string; // e.g., "15 minutes", "2 hours"
}

// Challenge Analytics
export interface ChallengeAnalytics {
  userId: string;
  totalChallengesAssigned: number;
  totalChallengesCompleted: number;
  totalChallengesExpired: number;
  completionRate: number;
  
  // Per Archetype
  archetypeStats: {
    archetype: ChallengeArchetype;
    assigned: number;
    completed: number;
    completionRate: number;
    averageCompletionTime: number; // hours
  }[];
  
  // Rewards Earned
  totalXPFromChallenges: number;
  totalCoinsFromChallenges: number;
  totalGemsFromChallenges: number;
  badgesEarned: string[];
  
  // Streaks
  currentChallengeStreak: number; // consecutive days completing at least 1 challenge
  longestChallengeStreak: number;
  
  // Last Updated
  lastUpdated: Timestamp;
}
