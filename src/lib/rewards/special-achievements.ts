export interface SpecialAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
  coinReward: number;
  criteria: {
    type: string;
    requirement: any;
  };
  isOneTime: boolean;
  category: 'first_time' | 'milestone' | 'exploration' | 'mastery';
}

export const SPECIAL_ACHIEVEMENTS: SpecialAchievement[] = [
  {
    id: 'first_vibe_in_emotion',
    name: 'New Emotion Unlocked',
    description: 'Posted your first vibe in a new emotion',
    icon: '✨',
    xpReward: 100,
    coinReward: 50,
    criteria: {
      type: 'first_emotion_vibe',
      requirement: 'any',
    },
    isOneTime: false,
    category: 'first_time',
  },
  {
    id: 'explore_all_8_emotions',
    name: 'Emotion Explorer',
    description: 'Explored all 8 basic emotions',
    icon: '🎭',
    xpReward: 500,
    coinReward: 250,
    criteria: {
      type: 'unique_emotions',
      requirement: 8,
    },
    isOneTime: true,
    category: 'exploration',
  },
  {
    id: 'explore_all_16_emotions',
    name: 'Complete Emotion Master',
    description: 'Explored all 16 emotions',
    icon: '🌟',
    xpReward: 1000,
    coinReward: 500,
    criteria: {
      type: 'unique_emotions',
      requirement: 16,
    },
    isOneTime: true,
    category: 'mastery',
  },
  {
    id: '100_reactions_received',
    name: 'Beloved Creator',
    description: 'Received 100 total reactions',
    icon: '❤️',
    xpReward: 200,
    coinReward: 100,
    criteria: {
      type: 'total_reactions',
      requirement: 100,
    },
    isOneTime: true,
    category: 'milestone',
  },
  {
    id: '1000_reactions_received',
    name: 'Super Popular',
    description: 'Received 1000 total reactions',
    icon: '💫',
    xpReward: 1000,
    coinReward: 500,
    criteria: {
      type: 'total_reactions',
      requirement: 1000,
    },
    isOneTime: true,
    category: 'milestone',
  },
  {
    id: 'first_month_streak',
    name: 'Monthly Dedication',
    description: 'Completed your first month streak',
    icon: '📅',
    xpReward: 2000,
    coinReward: 1000,
    criteria: {
      type: 'streak_days',
      requirement: 30,
    },
    isOneTime: true,
    category: 'milestone',
  },
  {
    id: 'city_ambassador',
    name: 'City Ambassador',
    description: 'Reached top 10 in your city',
    icon: '🏆',
    xpReward: 1500,
    coinReward: 750,
    criteria: {
      type: 'city_rank',
      requirement: 10,
    },
    isOneTime: false,
    category: 'mastery',
  },
  {
    id: 'complete_profile',
    name: 'Profile Complete',
    description: 'Filled out your complete profile',
    icon: '👤',
    xpReward: 50,
    coinReward: 25,
    criteria: {
      type: 'profile_completion',
      requirement: 100,
    },
    isOneTime: true,
    category: 'first_time',
  },
  {
    id: 'first_voice_note',
    name: 'Voice Activated',
    description: 'Posted your first voice note',
    icon: '🎤',
    xpReward: 75,
    coinReward: 40,
    criteria: {
      type: 'voice_notes',
      requirement: 1,
    },
    isOneTime: true,
    category: 'first_time',
  },
  {
    id: '50_voice_notes',
    name: 'Voice Master',
    description: 'Posted 50 voice notes',
    icon: '🎙️',
    xpReward: 300,
    coinReward: 200,
    criteria: {
      type: 'voice_notes',
      requirement: 50,
    },
    isOneTime: true,
    category: 'milestone',
  },
  {
    id: 'first_challenge_complete',
    name: 'Challenge Accepted',
    description: 'Completed your first challenge',
    icon: '🎯',
    xpReward: 100,
    coinReward: 50,
    criteria: {
      type: 'challenges_completed',
      requirement: 1,
    },
    isOneTime: true,
    category: 'first_time',
  },
  {
    id: '10_cities_visited',
    name: 'City Explorer',
    description: 'Posted from 10 different cities',
    icon: '🗺️',
    xpReward: 500,
    coinReward: 300,
    criteria: {
      type: 'unique_cities',
      requirement: 10,
    },
    isOneTime: true,
    category: 'exploration',
  },
];

export function checkAchievementEligibility(
  achievementId: string,
  userStats: {
    uniqueEmotions?: number;
    totalReactions?: number;
    streakDays?: number;
    cityRank?: number;
    profileCompletion?: number;
    voiceNotes?: number;
    challengesCompleted?: number;
    uniqueCities?: number;
    [key: string]: any;
  }
): boolean {
  const achievement = SPECIAL_ACHIEVEMENTS.find(a => a.id === achievementId);
  if (!achievement) return false;

  const { criteria } = achievement;

  switch (criteria.type) {
    case 'unique_emotions':
      return (userStats.uniqueEmotions || 0) >= criteria.requirement;
    case 'total_reactions':
      return (userStats.totalReactions || 0) >= criteria.requirement;
    case 'streak_days':
      return (userStats.streakDays || 0) >= criteria.requirement;
    case 'city_rank':
      return (userStats.cityRank || Infinity) <= criteria.requirement;
    case 'profile_completion':
      return (userStats.profileCompletion || 0) >= criteria.requirement;
    case 'voice_notes':
      return (userStats.voiceNotes || 0) >= criteria.requirement;
    case 'challenges_completed':
      return (userStats.challengesCompleted || 0) >= criteria.requirement;
    case 'unique_cities':
      return (userStats.uniqueCities || 0) >= criteria.requirement;
    default:
      return false;
  }
}

export function getEligibleAchievements(
  userStats: any,
  completedAchievements: string[]
): SpecialAchievement[] {
  const eligible: SpecialAchievement[] = [];

  for (const achievement of SPECIAL_ACHIEVEMENTS) {
    if (achievement.isOneTime && completedAchievements.includes(achievement.id)) {
      continue;
    }

    if (checkAchievementEligibility(achievement.id, userStats)) {
      eligible.push(achievement);
    }
  }

  return eligible;
}

export function getAchievementsByCategory(category: SpecialAchievement['category']): SpecialAchievement[] {
  return SPECIAL_ACHIEVEMENTS.filter(a => a.category === category);
}
