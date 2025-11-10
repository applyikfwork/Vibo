import type { Badge } from '../types';
import type { Timestamp } from 'firebase/firestore';

export type BadgeCategory = 
  | 'emotion'
  | 'location'
  | 'streak'
  | 'festival'
  | 'challenge'
  | 'social'
  | 'exclusive';

export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: BadgeCategory;
  rarity: BadgeRarity;
  requirement: string;
  criteria: {
    type: string;
    threshold?: number;
    specificValues?: string[];
    timeframe?: string;
  };
  coinReward?: number;
  xpReward?: number;
  isHidden?: boolean;
}

export const BADGE_CATALOG: BadgeDefinition[] = [
  {
    id: 'happy_explorer',
    name: 'Happy Explorer',
    description: 'Post 5 Happy vibes',
    icon: '😊',
    category: 'emotion',
    rarity: 'common',
    requirement: 'Post 5 vibes with Happy emotion',
    criteria: { type: 'emotion_posts', threshold: 5, specificValues: ['Happy'] },
    coinReward: 25,
    xpReward: 50,
  },
  {
    id: 'sad_supporter',
    name: 'Sad Supporter',
    description: 'Post 5 Sad vibes',
    icon: '😢',
    category: 'emotion',
    rarity: 'common',
    requirement: 'Post 5 vibes with Sad emotion',
    criteria: { type: 'emotion_posts', threshold: 5, specificValues: ['Sad'] },
    coinReward: 25,
    xpReward: 50,
  },
  {
    id: 'chill_master',
    name: 'Chill Master',
    description: 'Post 5 Chill vibes',
    icon: '😌',
    category: 'emotion',
    rarity: 'common',
    requirement: 'Post 5 vibes with Chill emotion',
    criteria: { type: 'emotion_posts', threshold: 5, specificValues: ['Chill'] },
    coinReward: 25,
    xpReward: 50,
  },
  {
    id: 'motivation_guru',
    name: 'Motivation Guru',
    description: 'Post 5 Motivated vibes',
    icon: '💪',
    category: 'emotion',
    rarity: 'common',
    requirement: 'Post 5 vibes with Motivated emotion',
    criteria: { type: 'emotion_posts', threshold: 5, specificValues: ['Motivated'] },
    coinReward: 25,
    xpReward: 50,
  },
  {
    id: 'lonely_companion',
    name: 'Lonely Companion',
    description: 'Post 5 Lonely vibes',
    icon: '🥺',
    category: 'emotion',
    rarity: 'common',
    requirement: 'Post 5 vibes with Lonely emotion',
    criteria: { type: 'emotion_posts', threshold: 5, specificValues: ['Lonely'] },
    coinReward: 25,
    xpReward: 50,
  },
  {
    id: 'emotion_collector',
    name: 'Emotion Collector',
    description: 'Try all 8 basic emotions',
    icon: '🎭',
    category: 'emotion',
    rarity: 'rare',
    requirement: 'Post at least one vibe in each of the 8 basic emotions',
    criteria: { type: 'unique_emotions', threshold: 8 },
    coinReward: 100,
    xpReward: 200,
  },
  {
    id: 'emotion_master',
    name: 'Emotion Master',
    description: '100+ vibes in each emotion',
    icon: '👑',
    category: 'emotion',
    rarity: 'legendary',
    requirement: 'Post 100+ vibes in each emotion category',
    criteria: { type: 'emotion_mastery', threshold: 100 },
    coinReward: 500,
    xpReward: 1000,
  },
  {
    id: 'all_emotions_explored',
    name: 'Complete Emotion Explorer',
    description: 'Explored all 16 emotions',
    icon: '🌈',
    category: 'emotion',
    rarity: 'epic',
    requirement: 'Post vibes in all 16 emotion categories',
    criteria: { type: 'unique_emotions', threshold: 16 },
    coinReward: 300,
    xpReward: 500,
  },
  
  {
    id: 'neighborhood_hero',
    name: 'Neighborhood Hero',
    description: 'Top contributor in your area',
    icon: '🏘️',
    category: 'location',
    rarity: 'rare',
    requirement: 'Be in top 10 contributors in your neighborhood',
    criteria: { type: 'neighborhood_rank', threshold: 10 },
    coinReward: 150,
    xpReward: 300,
  },
  {
    id: 'city_champion',
    name: 'City Champion',
    description: '#1 in city this week',
    icon: '🏆',
    category: 'location',
    rarity: 'epic',
    requirement: 'Reach #1 rank in your city leaderboard',
    criteria: { type: 'city_rank', threshold: 1, timeframe: 'weekly' },
    coinReward: 300,
    xpReward: 500,
  },
  {
    id: 'national_traveler',
    name: 'National Traveler',
    description: 'Post from 10+ cities',
    icon: '🗺️',
    category: 'location',
    rarity: 'epic',
    requirement: 'Post vibes from 10 different cities',
    criteria: { type: 'unique_cities', threshold: 10 },
    coinReward: 250,
    xpReward: 400,
  },
  {
    id: 'state_explorer',
    name: 'State Explorer',
    description: 'Post from 5 different states',
    icon: '🚀',
    category: 'location',
    rarity: 'rare',
    requirement: 'Post vibes from 5 different states',
    criteria: { type: 'unique_states', threshold: 5 },
    coinReward: 200,
    xpReward: 350,
  },
  
  {
    id: 'consistent',
    name: 'Consistent',
    description: '7 day streak',
    icon: '🔥',
    category: 'streak',
    rarity: 'common',
    requirement: 'Post vibes for 7 consecutive days',
    criteria: { type: 'posting_streak', threshold: 7 },
    coinReward: 50,
    xpReward: 100,
  },
  {
    id: 'dedicated',
    name: 'Dedicated',
    description: '30 day streak',
    icon: '⭐',
    category: 'streak',
    rarity: 'rare',
    requirement: 'Post vibes for 30 consecutive days',
    criteria: { type: 'posting_streak', threshold: 30 },
    coinReward: 200,
    xpReward: 400,
  },
  {
    id: 'unstoppable',
    name: 'Unstoppable',
    description: '100 day streak',
    icon: '💎',
    category: 'streak',
    rarity: 'legendary',
    requirement: 'Post vibes for 100 consecutive days',
    criteria: { type: 'posting_streak', threshold: 100 },
    coinReward: 1000,
    xpReward: 2000,
  },
  {
    id: 'week_warrior',
    name: 'Week Warrior',
    description: '14 day streak',
    icon: '⚔️',
    category: 'streak',
    rarity: 'common',
    requirement: 'Post vibes for 14 consecutive days',
    criteria: { type: 'posting_streak', threshold: 14 },
    coinReward: 100,
    xpReward: 200,
  },
  {
    id: 'month_champion',
    name: 'Month Champion',
    description: '60 day streak',
    icon: '🏅',
    category: 'streak',
    rarity: 'epic',
    requirement: 'Post vibes for 60 consecutive days',
    criteria: { type: 'posting_streak', threshold: 60 },
    coinReward: 500,
    xpReward: 1000,
  },
  
  {
    id: 'diwali_2024',
    name: 'Diwali 2024 Champion',
    description: 'Participated in Diwali 2024',
    icon: '🪔',
    category: 'festival',
    rarity: 'epic',
    requirement: 'Post 10+ Happy vibes during Diwali week',
    criteria: { type: 'festival_participation', specificValues: ['diwali_2024'], threshold: 10 },
    coinReward: 250,
    xpReward: 500,
  },
  {
    id: 'holi_celebration',
    name: 'Holi Celebration Master',
    description: 'Holi celebration expert',
    icon: '🎨',
    category: 'festival',
    rarity: 'epic',
    requirement: 'Post 15+ vibes during Holi festival',
    criteria: { type: 'festival_participation', specificValues: ['holi'], threshold: 15 },
    coinReward: 250,
    xpReward: 500,
  },
  {
    id: 'dussehra_warrior',
    name: 'Dussehra Warrior',
    description: 'Celebrated Dussehra with vibes',
    icon: '🏹',
    category: 'festival',
    rarity: 'rare',
    requirement: 'Post vibes during Dussehra',
    criteria: { type: 'festival_participation', specificValues: ['dussehra'], threshold: 5 },
    coinReward: 150,
    xpReward: 300,
  },
  
  {
    id: 'challenge_starter',
    name: 'Challenge Starter',
    description: 'Complete 5 challenges',
    icon: '🎯',
    category: 'challenge',
    rarity: 'common',
    requirement: 'Complete 5 challenges of any type',
    criteria: { type: 'challenges_completed', threshold: 5 },
    coinReward: 50,
    xpReward: 100,
  },
  {
    id: 'challenge_hunter',
    name: 'Challenge Hunter',
    description: 'Complete 50 challenges',
    icon: '🎖️',
    category: 'challenge',
    rarity: 'rare',
    requirement: 'Complete 50 challenges',
    criteria: { type: 'challenges_completed', threshold: 50 },
    coinReward: 300,
    xpReward: 600,
  },
  {
    id: 'challenge_legend',
    name: 'Challenge Legend',
    description: 'Complete 500 challenges',
    icon: '👑',
    category: 'challenge',
    rarity: 'legendary',
    requirement: 'Complete 500 challenges',
    criteria: { type: 'challenges_completed', threshold: 500 },
    coinReward: 2000,
    xpReward: 5000,
  },
  {
    id: 'daily_champion',
    name: 'Daily Champion',
    description: 'Complete 30 daily challenges',
    icon: '📅',
    category: 'challenge',
    rarity: 'rare',
    requirement: 'Complete 30 daily challenges',
    criteria: { type: 'daily_challenges_completed', threshold: 30 },
    coinReward: 200,
    xpReward: 400,
  },
  
  {
    id: 'supportive',
    name: 'Supportive',
    description: '100 helpful comments',
    icon: '💬',
    category: 'social',
    rarity: 'common',
    requirement: 'Leave 100 helpful comments',
    criteria: { type: 'helpful_comments', threshold: 100 },
    coinReward: 100,
    xpReward: 200,
  },
  {
    id: 'community_builder',
    name: 'Community Builder',
    description: '1000 reactions given',
    icon: '❤️',
    category: 'social',
    rarity: 'rare',
    requirement: 'Give 1000 reactions to other vibes',
    criteria: { type: 'reactions_given', threshold: 1000 },
    coinReward: 300,
    xpReward: 500,
  },
  {
    id: 'inspiration',
    name: 'Inspiration',
    description: 'Your vibes got 10k+ views',
    icon: '✨',
    category: 'social',
    rarity: 'epic',
    requirement: 'Accumulate 10,000 views on your vibes',
    criteria: { type: 'total_views', threshold: 10000 },
    coinReward: 500,
    xpReward: 1000,
  },
  {
    id: 'viral_sensation',
    name: 'Viral Sensation',
    description: 'One vibe with 1000+ reactions',
    icon: '🌟',
    category: 'social',
    rarity: 'legendary',
    requirement: 'Get 1000+ reactions on a single vibe',
    criteria: { type: 'single_vibe_reactions', threshold: 1000 },
    coinReward: 1000,
    xpReward: 2500,
  },
  {
    id: 'trending_creator',
    name: 'Trending Creator',
    description: 'Have a vibe trending in your city',
    icon: '📈',
    category: 'social',
    rarity: 'epic',
    requirement: 'Have a vibe reach trending status',
    criteria: { type: 'trending_vibe', threshold: 1 },
    coinReward: 400,
    xpReward: 800,
  },
  
  {
    id: 'founding_member',
    name: 'Founding Member',
    description: 'Joined in first month',
    icon: '🏛️',
    category: 'exclusive',
    rarity: 'legendary',
    requirement: 'Create account in first month of launch',
    criteria: { type: 'join_date', timeframe: 'first_month' },
    coinReward: 500,
    xpReward: 1000,
    isHidden: false,
  },
  {
    id: 'beta_tester',
    name: 'Beta Tester',
    description: 'Active in beta',
    icon: '🧪',
    category: 'exclusive',
    rarity: 'epic',
    requirement: 'Participate in beta testing',
    criteria: { type: 'beta_participation' },
    coinReward: 300,
    xpReward: 600,
  },
  {
    id: 'top_100',
    name: 'Top 100',
    description: 'Leaderboard achievement',
    icon: '🏆',
    category: 'exclusive',
    rarity: 'legendary',
    requirement: 'Reach top 100 on global leaderboard',
    criteria: { type: 'leaderboard_rank', threshold: 100 },
    coinReward: 1000,
    xpReward: 2500,
  },
  {
    id: 'staff_favorite',
    name: 'Staff Favorite',
    description: 'Curated by team',
    icon: '⭐',
    category: 'exclusive',
    rarity: 'legendary',
    requirement: 'Content featured by Vibee team',
    criteria: { type: 'staff_featured' },
    coinReward: 800,
    xpReward: 2000,
    isHidden: true,
  },
  
  {
    id: 'prolific_creator',
    name: 'Prolific Creator',
    description: '50 vibes posted',
    icon: '📝',
    category: 'social',
    rarity: 'common',
    requirement: 'Post 50 vibes',
    criteria: { type: 'total_vibes', threshold: 50 },
    coinReward: 75,
    xpReward: 150,
  },
  {
    id: 'mega_creator',
    name: 'Mega Creator',
    description: '500 vibes posted',
    icon: '🎬',
    category: 'social',
    rarity: 'rare',
    requirement: 'Post 500 vibes',
    criteria: { type: 'total_vibes', threshold: 500 },
    coinReward: 400,
    xpReward: 800,
  },
  {
    id: 'conversation_starter',
    name: 'Conversation Starter',
    description: '100 comments given',
    icon: '💭',
    category: 'social',
    rarity: 'common',
    requirement: 'Leave 100 comments',
    criteria: { type: 'comments_given', threshold: 100 },
    coinReward: 100,
    xpReward: 200,
  },
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Post 50 vibes before 8 AM',
    icon: '🌅',
    category: 'exclusive',
    rarity: 'rare',
    requirement: 'Post 50 vibes in morning hours',
    criteria: { type: 'time_based_posts', timeframe: 'morning', threshold: 50 },
    coinReward: 150,
    xpReward: 300,
  },
  {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Post 50 vibes after 10 PM',
    icon: '🌙',
    category: 'exclusive',
    rarity: 'rare',
    requirement: 'Post 50 vibes in night hours',
    criteria: { type: 'time_based_posts', timeframe: 'night', threshold: 50 },
    coinReward: 150,
    xpReward: 300,
  },
  {
    id: 'weekend_warrior',
    name: 'Weekend Warrior',
    description: 'Post vibes every weekend for a month',
    icon: '🎉',
    category: 'streak',
    rarity: 'rare',
    requirement: 'Post on weekends for 4 consecutive weeks',
    criteria: { type: 'weekend_streak', threshold: 4 },
    coinReward: 200,
    xpReward: 400,
  },
  {
    id: 'voice_master',
    name: 'Voice Master',
    description: 'Post 100 voice notes',
    icon: '🎤',
    category: 'social',
    rarity: 'rare',
    requirement: 'Post 100 voice note vibes',
    criteria: { type: 'voice_notes', threshold: 100 },
    coinReward: 250,
    xpReward: 500,
  },
  {
    id: 'gift_giver',
    name: 'Gift Giver',
    description: 'Send 50 gifts to others',
    icon: '🎁',
    category: 'social',
    rarity: 'rare',
    requirement: 'Send 50 gifts to other users',
    criteria: { type: 'gifts_sent', threshold: 50 },
    coinReward: 300,
    xpReward: 600,
  },
  {
    id: 'local_legend',
    name: 'Local Legend',
    description: '1000+ vibes from your city',
    icon: '🌆',
    category: 'location',
    rarity: 'epic',
    requirement: 'Post 1000 vibes from your home city',
    criteria: { type: 'city_vibes', threshold: 1000 },
    coinReward: 600,
    xpReward: 1200,
  },
];

export function checkBadgeEligibility(
  badgeId: string,
  userStats: {
    emotionPosts?: Record<string, number>;
    uniqueEmotions?: number;
    uniqueCities?: number;
    uniqueStates?: number;
    postingStreak?: number;
    challengesCompleted?: number;
    dailyChallengesCompleted?: number;
    helpfulComments?: number;
    reactionsGiven?: number;
    totalViews?: number;
    totalVibes?: number;
    commentsGiven?: number;
    voiceNotes?: number;
    giftsSent?: number;
    joinDate?: Timestamp;
    leaderboardRank?: number;
    [key: string]: any;
  }
): boolean {
  const badge = BADGE_CATALOG.find(b => b.id === badgeId);
  if (!badge) return false;

  const { criteria } = badge;

  switch (criteria.type) {
    case 'emotion_posts':
      if (criteria.specificValues && criteria.threshold) {
        const emotion = criteria.specificValues[0];
        return (userStats.emotionPosts?.[emotion] || 0) >= criteria.threshold;
      }
      return false;
      
    case 'unique_emotions':
      return (userStats.uniqueEmotions || 0) >= (criteria.threshold || 0);
      
    case 'unique_cities':
      return (userStats.uniqueCities || 0) >= (criteria.threshold || 0);
      
    case 'unique_states':
      return (userStats.uniqueStates || 0) >= (criteria.threshold || 0);
      
    case 'posting_streak':
      return (userStats.postingStreak || 0) >= (criteria.threshold || 0);
      
    case 'challenges_completed':
      return (userStats.challengesCompleted || 0) >= (criteria.threshold || 0);
      
    case 'daily_challenges_completed':
      return (userStats.dailyChallengesCompleted || 0) >= (criteria.threshold || 0);
      
    case 'helpful_comments':
      return (userStats.helpfulComments || 0) >= (criteria.threshold || 0);
      
    case 'reactions_given':
      return (userStats.reactionsGiven || 0) >= (criteria.threshold || 0);
      
    case 'total_views':
      return (userStats.totalViews || 0) >= (criteria.threshold || 0);
      
    case 'total_vibes':
      return (userStats.totalVibes || 0) >= (criteria.threshold || 0);
      
    case 'comments_given':
      return (userStats.commentsGiven || 0) >= (criteria.threshold || 0);
      
    case 'voice_notes':
      return (userStats.voiceNotes || 0) >= (criteria.threshold || 0);
      
    case 'gifts_sent':
      return (userStats.giftsSent || 0) >= (criteria.threshold || 0);
      
    case 'leaderboard_rank':
      return (userStats.leaderboardRank || Infinity) <= (criteria.threshold || 0);
      
    default:
      return false;
  }
}

export function getBadgesByCategory(category: BadgeCategory): BadgeDefinition[] {
  return BADGE_CATALOG.filter(b => b.category === category);
}

export function getBadgesByRarity(rarity: BadgeRarity): BadgeDefinition[] {
  return BADGE_CATALOG.filter(b => b.rarity === rarity);
}

export function getEarnedBadges(userBadges: Badge[]): Badge[] {
  return userBadges.filter(b => b.earnedAt);
}

export function getBadgeProgress(badgeId: string, userStats: any): number {
  const badge = BADGE_CATALOG.find(b => b.id === badgeId);
  if (!badge || !badge.criteria.threshold) return 0;

  const { criteria } = badge;
  const threshold = criteria.threshold || 1;
  let current = 0;

  switch (criteria.type) {
    case 'emotion_posts':
      if (criteria.specificValues) {
        const emotion = criteria.specificValues[0];
        current = userStats.emotionPosts?.[emotion] || 0;
      }
      break;
    case 'unique_emotions':
      current = userStats.uniqueEmotions || 0;
      break;
    case 'posting_streak':
      current = userStats.postingStreak || 0;
      break;
    case 'challenges_completed':
      current = userStats.challengesCompleted || 0;
      break;
    case 'helpful_comments':
      current = userStats.helpfulComments || 0;
      break;
    case 'reactions_given':
      current = userStats.reactionsGiven || 0;
      break;
    case 'total_vibes':
      current = userStats.totalVibes || 0;
      break;
    default:
      current = 0;
  }

  return Math.min((current / threshold) * 100, 100);
}
