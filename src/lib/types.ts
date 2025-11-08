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

export type FestivalEvent = {
  id: string;
  title: string;
  description: string;
  city: string;
  state?: string;
  targetEmotion: EmotionCategory;
  startDate: Timestamp;
  endDate: Timestamp;
  goal: number;
  current: number;
  participants: string[];
  rewards: {
    xp: number;
    badge: string;
    specialEmoji?: string;
  };
  festivalType: 'cultural' | 'national' | 'religious' | 'seasonal';
  isActive: boolean;
  bannerImage?: string;
  location?: Location;
};

export type MoodZone = {
  id: string;
  name: string;
  city: string;
  center: Location;
  radiusKm: number;
  dominantEmotion: EmotionCategory;
  emotionIntensity: number;
  vibeCount: number;
  lastUpdated: Timestamp;
  boundary?: {
    lat: number;
    lng: number;
  }[];
  zoneType: 'hotspot' | 'calm' | 'energetic' | 'supportive';
  activeHours?: {
    start: number;
    end: number;
  };
};

export type CityMoodAggregate = {
  city: string;
  date: string;
  emotionCounts: Record<EmotionCategory, number>;
  totalVibes: number;
  dominantEmotion: EmotionCategory;
  averageIntensity: number;
  activeUsers: number;
  moodZones: string[];
  lastAggregated: Timestamp;
};

export type Badge = {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: string;
  earnedAt?: Timestamp;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: 'positivity' | 'empathy' | 'consistency' | 'generosity' | 'achievement' | 'city' | 'seasonal' | 'gift';
  meta?: {
    reason?: string;
    date?: string;
    seasonId?: string;
    cityName?: string;
    animated?: boolean;
    soundEffect?: string;
  };
  isTradeable?: boolean;
  isGiftable?: boolean;
};

export type Mission = {
  id: string;
  type: 'daily' | 'weekly' | 'special' | 'event' | 'seasonal';
  title: string;
  description: string;
  target: number;
  current: number;
  reward: {
    xp: number;
    coins: number;
    gems?: number;
    badge?: string;
    items?: string[];
  };
  expiresAt?: Timestamp;
  completedAt?: Timestamp;
  isCompleted: boolean;
  claimed?: boolean;
  claimedAt?: Timestamp;
  conditions?: {
    action: string;
    minCharLength?: number;
    requiresVerification?: boolean;
  };
  isPremium?: boolean;
};

export type InventoryItem = {
  id: string;
  itemId: string;
  name: string;
  type: 'boost' | 'badge' | 'theme' | 'filter' | 'skip_token' | 'profile_frame' | 'cosmetic' | 'consumable';
  quantity: number;
  acquiredAt: Timestamp;
  expiresAt?: Timestamp;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  metadata?: Record<string, any>;
};

export type RewardTransaction = {
  id: string;
  userId: string;
  type: 'earn' | 'spend' | 'gift' | 'receive';
  action: string;
  xpChange?: number;
  coinsChange?: number;
  gemsChange?: number;
  timestamp: Timestamp;
  metadata?: Record<string, any>;
  idempotencyKey?: string;
  deviceFingerprint?: string;
  ipAddress?: string;
  isFraudulent?: boolean;
  reviewStatus?: 'pending' | 'approved' | 'flagged' | 'rolled_back';
  targetUserId?: string;
};

export type ReactionStreak = {
  userId: string;
  username: string;
  streakCount: number;
  lastInteraction: Timestamp;
};

export type CommunityHub = {
  id: string;
  name: string;
  description: string;
  theme: EmotionCategory;
  icon: string;
  memberCount: number;
  activeChallenge?: Mission;
  topContributors: string[];
  recentActivityCount?: number;
  trendingScore?: number;
};

export type HubRecommendation = {
  hub: CommunityHub;
  matchScore: number;
  reasons: string[];
  emotionMatch: number;
  activityLevel: 'high' | 'medium' | 'low';
};

export type HubNotification = {
  id: string;
  hubId: string;
  hubName: string;
  hubIcon: string;
  type: 'new_post' | 'challenge_update' | 'milestone' | 'trending_post' | 'new_member';
  title: string;
  message: string;
  timestamp: Timestamp;
  read: boolean;
  actionUrl?: string;
  metadata?: {
    postId?: string;
    challengeId?: string;
    milestoneType?: string;
    memberCount?: number;
  };
};

export type HubNotificationPreferences = {
  userId: string;
  enableHubNotifications: boolean;
  notifyNewPosts: boolean;
  notifyChallenges: boolean;
  notifyMilestones: boolean;
  notifyTrendingPosts: boolean;
  quietHoursStart?: number;
  quietHoursEnd?: number;
  mutedHubs: string[];
};

export type LeaderboardEntry = {
  rank: number;
  userId: string;
  username: string;
  displayName?: string;
  xp: number;
  level: number;
  badges: Badge[];
  profileImage?: string;
  mood?: EmotionCategory;
  city?: string;
};

export type StoreItem = {
  id: string;
  name: string;
  description: string;
  type: 'boost' | 'badge' | 'theme' | 'filter' | 'skip_token' | 'profile_frame' | 'cosmetic' | 'gift';
  price: number;
  gemPrice?: number;
  icon: string;
  isLimitedTime?: boolean;
  expiresAt?: Timestamp;
  stock?: number;
  effectDuration?: number;
  currency: 'coins' | 'gems' | 'both';
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  seasonalOnly?: boolean;
  seasonId?: string;
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
    coins?: number;
    gems?: number;
    level?: number;
    tier?: 'bronze' | 'silver' | 'gold' | 'platinum' | 'legend';
    badges?: Badge[];
    dailyMissions?: Mission[];
    weeklyMissions?: Mission[];
    specialMissions?: Mission[];
    seasonalMissions?: Mission[];
    inventory?: InventoryItem[];
    postingStreak?: number;
    lastPostDate?: Timestamp;
    reactionStreaks?: ReactionStreak[];
    helpfulCommentsGiven?: number;
    helpfulCommentsReceived?: number;
    lastDailyMissionReset?: Timestamp;
    lastWeeklyMissionReset?: Timestamp;
    totalVibesPosted?: number;
    totalReactionsGiven?: number;
    totalCommentsGiven?: number;
    joinedHubs?: string[];
    isPremium?: boolean;
    premiumExpiresAt?: Timestamp;
    seasonPassOwned?: string[];
    currentSeasonPassId?: string;
    dailyCoinsEarned?: number;
    dailyXPEarned?: number;
    dailyReactionXP?: number;
    lastDailyCapReset?: Timestamp;
    deviceFingerprint?: string;
    giverPoints?: number;
    profileFrame?: string;
    activeCosmetics?: string[];
    fraudFlags?: number;
    accountStatus?: 'active' | 'under_review' | 'suspended' | 'banned';
};

export type Vibe = {
  id: string;
  userId: string;
  text: string;
  emoji: string;
  emotion: EmotionCategory;
  backgroundColor: string;
  timestamp: Timestamp;
  createdAt?: Timestamp;
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
  isDemo?: boolean;
};

export type Comment = {
  id: string;
  vibeId: string;
  userId: string;
  text: string;
  timestamp: Timestamp;
  author: Author;
  isAnonymous: boolean;
  helpfulCount?: number;
  helpfulVoters?: string[];
  isFeatured?: boolean;
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
    coins: number;
    badge?: string;
  };
  startDate: Timestamp;
  endDate: Timestamp;
  isActive: boolean;
  participants: string[];
  contributors: {
    userId: string;
    contributionCount: number;
  }[];
  completedAt?: Timestamp;
  rewardsDistributed?: boolean;
};

export type GiftType = 'rose' | 'star' | 'crown';

export type Gift = {
  id: string;
  type: GiftType;
  fromUserId: string;
  toUserId: string;
  cost: number;
  reward: {
    xp: number;
    coins: number;
    badge?: string;
  };
  message?: string;
  timestamp: Timestamp;
};

export type SeasonPass = {
  id: string;
  name: string;
  description: string;
  seasonNumber: number;
  startDate: Timestamp;
  endDate: Timestamp;
  coinCost: number;
  gemCost?: number;
  freeTracks: Mission[];
  premiumTracks: Mission[];
  isActive: boolean;
};

export type SurpriseBox = {
  id: string;
  name: string;
  type: 'small' | 'lucky' | 'premium';
  cost: number;
  costCurrency: 'coins' | 'gems' | 'free';
  possibleRewards: {
    type: 'coins' | 'xp' | 'badge' | 'item';
    minAmount: number;
    maxAmount: number;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    dropRate: number;
    itemId?: string;
  }[];
  dailyLimit?: number;
};

export type UserTier = {
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'legend';
  minXP: number;
  maxXP: number;
  minLevel: number;
  maxLevel: number;
  perks: {
    dailyCoinCapBonus: number;
    canCreateChallenges: boolean;
    leaderboardVisibility: 'public' | 'top' | 'elite';
    specialBadge?: string;
    cosmeticUnlocks?: string[];
  };
};

export type FraudCheck = {
  id: string;
  userId: string;
  checkType: 'velocity' | 'anomaly' | 'ip_check' | 'device_check' | 'collaboration_ring';
  timestamp: Timestamp;
  flagReason: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  autoResolved: boolean;
  manualReview?: boolean;
  resolution?: 'approved' | 'warning' | 'rollback' | 'suspension' | 'ban';
  resolvedAt?: Timestamp;
  resolvedBy?: string;
  metadata?: Record<string, any>;
};

export type DailyStats = {
  userId: string;
  date: string;
  coinsEarned: number;
  xpEarned: number;
  vibesPosted: number;
  reactionsGiven: number;
  commentsGiven: number;
  helpfulComments: number;
  missionsCompleted: number;
  giftsReceived: number;
  giftsSent: number;
};

export type Leaderboard = {
  id: string;
  type: 'global' | 'city' | 'weekly' | 'giver';
  period: 'daily' | 'weekly' | 'monthly' | 'all_time';
  city?: string;
  entries: LeaderboardEntry[];
  lastUpdated: Timestamp;
};
