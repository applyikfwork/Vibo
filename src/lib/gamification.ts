import { Badge, Mission, StoreItem } from './types';

export const LEVEL_XP_REQUIREMENTS = [
  0, 100, 250, 500, 1000, 1500, 2500, 4000, 6000, 8500,
  11500, 15000, 19000, 24000, 30000, 37000, 45000, 54000, 64000, 75000
];

export function calculateLevel(xp: number): number {
  let level = 1;
  for (let i = 0; i < LEVEL_XP_REQUIREMENTS.length; i++) {
    if (xp >= LEVEL_XP_REQUIREMENTS[i]) {
      level = i + 1;
    } else {
      break;
    }
  }
  return level;
}

export function getXPForNextLevel(currentXP: number): number {
  const currentLevel = calculateLevel(currentXP);
  if (currentLevel >= LEVEL_XP_REQUIREMENTS.length) {
    return LEVEL_XP_REQUIREMENTS[LEVEL_XP_REQUIREMENTS.length - 1] + 10000;
  }
  return LEVEL_XP_REQUIREMENTS[currentLevel];
}

export function getProgressToNextLevel(currentXP: number): { current: number; needed: number; percentage: number } {
  const currentLevel = calculateLevel(currentXP);
  const currentLevelXP = LEVEL_XP_REQUIREMENTS[currentLevel - 1] || 0;
  const nextLevelXP = getXPForNextLevel(currentXP);
  const current = currentXP - currentLevelXP;
  const needed = nextLevelXP - currentLevelXP;
  const percentage = Math.min((current / needed) * 100, 100);
  return { current, needed, percentage };
}

export const XP_REWARDS = {
  POST_VIBE: 10,
  REACT_TO_VIBE: 2,
  HELPFUL_COMMENT: 5,
  COMPLETE_DAILY_CHALLENGE: 50,
  COMPLETE_WEEKLY_CHALLENGE: 200,
  VOICE_NOTE: 15,
  RECEIVE_HELPFUL_VOTE: 3,
  FIRST_POST_OF_DAY: 20,
  POSTING_STREAK_BONUS: 10,
  JOIN_COMMUNITY_HUB: 25,
  PARTICIPATE_IN_EVENT: 100,
};

export const COIN_REWARDS = {
  POST_VIBE: 5,
  COMPLETE_DAILY_CHALLENGE: 20,
  COMPLETE_WEEKLY_CHALLENGE: 100,
  LEVEL_UP: 50,
  RECEIVE_HELPFUL_VOTE: 2,
  WEEKLY_TOP_10_LEADERBOARD: 500,
  CITY_TOP_10_LEADERBOARD: 300,
  REACTION_STREAK_MILESTONE: 10,
  POSTING_STREAK_7_DAYS: 100,
  GIFT_FROM_OTHER_USER: 0,
};

export const BADGE_DEFINITIONS: Omit<Badge, 'earnedAt'>[] = [
  {
    id: 'good-viber',
    name: 'Good Viber',
    description: '3 positive posts in a row',
    icon: '🌞',
    requirement: '3 consecutive positive emotion posts',
    rarity: 'common',
    category: 'positivity'
  },
  {
    id: 'kind-heart',
    name: 'Kind Heart',
    description: '10 supportive comments',
    icon: '💬',
    requirement: '10 helpful comments',
    rarity: 'common',
    category: 'empathy'
  },
  {
    id: 'streak-master',
    name: 'Streak Master',
    description: '7-day posting streak',
    icon: '🔥',
    requirement: 'Post for 7 consecutive days',
    rarity: 'rare',
    category: 'consistency'
  },
  {
    id: 'helper-hero',
    name: 'Helper Hero',
    description: '100 coins gifted to others',
    icon: '🎁',
    requirement: 'Gift 100 coins to other users',
    rarity: 'rare',
    category: 'generosity'
  },
  {
    id: 'vibe-legend',
    name: 'Vibe Legend',
    description: 'Top 1% city leaderboard',
    icon: '💎',
    requirement: 'Reach top 1% in your city',
    rarity: 'legendary',
    category: 'achievement'
  },
  {
    id: 'emotion-explorer',
    name: 'Emotion Explorer',
    description: 'Post in 10 different emotions',
    icon: '🎨',
    requirement: 'Experience 10 different emotions',
    rarity: 'rare',
    category: 'achievement'
  },
  {
    id: 'voice-master',
    name: 'Voice Master',
    description: '50 voice notes posted',
    icon: '🎤',
    requirement: 'Post 50 voice notes',
    rarity: 'epic',
    category: 'achievement'
  },
  {
    id: 'community-builder',
    name: 'Community Builder',
    description: 'Join 5 community hubs',
    icon: '🏘️',
    requirement: 'Join 5 different hubs',
    rarity: 'rare',
    category: 'achievement'
  },
  {
    id: 'festival-champion',
    name: 'Festival Champion',
    description: 'Complete 3 festival events',
    icon: '🎉',
    requirement: 'Participate in 3 festivals',
    rarity: 'epic',
    category: 'achievement'
  },
  {
    id: 'reaction-magnet',
    name: 'Reaction Magnet',
    description: 'Receive 100 reactions',
    icon: '✨',
    requirement: 'Get 100 total reactions',
    rarity: 'rare',
    category: 'achievement'
  },
  {
    id: 'mood-match-guru',
    name: 'Mood Match Guru',
    description: '5 reaction streaks with others',
    icon: '🤝',
    requirement: '5 mutual reaction streaks',
    rarity: 'epic',
    category: 'empathy'
  },
  {
    id: 'first-vibe',
    name: 'First Vibe',
    description: 'Posted your first vibe',
    icon: '🌟',
    requirement: 'Post your first vibe',
    rarity: 'common',
    category: 'achievement'
  },
  {
    id: 'level-10-master',
    name: 'Level 10 Master',
    description: 'Reached level 10',
    icon: '🏆',
    requirement: 'Reach level 10',
    rarity: 'epic',
    category: 'achievement'
  },
  {
    id: 'india-pride',
    name: 'India Pride',
    description: 'Top 10 national leaderboard',
    icon: '🇮🇳',
    requirement: 'Reach top 10 nationally',
    rarity: 'legendary',
    category: 'achievement'
  }
];

export const DAILY_MISSIONS: Omit<Mission, 'current' | 'completedAt' | 'isCompleted'>[] = [
  {
    id: 'daily-post',
    type: 'daily',
    title: 'Share Your Vibe',
    description: 'Post 1 vibe today',
    target: 1,
    reward: { xp: 20, coins: 10 }
  },
  {
    id: 'daily-react',
    type: 'daily',
    title: 'Spread the Love',
    description: 'React to 5 vibes',
    target: 5,
    reward: { xp: 10, coins: 5 }
  },
  {
    id: 'daily-comment',
    type: 'daily',
    title: 'Be Supportive',
    description: 'Leave 3 helpful comments',
    target: 3,
    reward: { xp: 30, coins: 15 }
  }
];

export const WEEKLY_MISSIONS: Omit<Mission, 'current' | 'completedAt' | 'isCompleted'>[] = [
  {
    id: 'weekly-smiles',
    type: 'weekly',
    title: 'Spread 10 Smiles',
    description: 'Get 10 heart reactions in a week',
    target: 10,
    reward: { xp: 200, coins: 100 }
  },
  {
    id: 'weekly-community-hero',
    type: 'weekly',
    title: 'Community Hero',
    description: 'Comment on 20 posts',
    target: 20,
    reward: { xp: 150, coins: 75 }
  },
  {
    id: 'weekly-voice-champion',
    type: 'weekly',
    title: 'Voice Champion',
    description: 'Post 5 voice notes',
    target: 5,
    reward: { xp: 250, coins: 125 }
  },
  {
    id: 'weekly-emotion-explorer',
    type: 'weekly',
    title: 'Emotion Explorer',
    description: 'Post in 5 different emotions',
    target: 5,
    reward: { xp: 180, coins: 90 }
  }
];

export const STORE_ITEMS: StoreItem[] = [
  {
    id: 'boost-my-vibe',
    name: 'Boost My Vibe',
    description: 'Push your post to the top of Explore feed for 2 hours',
    type: 'boost',
    price: 200,
    icon: '🚀',
    effectDuration: 7200
  },
  {
    id: 'premium-badge',
    name: 'Premium Badge',
    description: 'Special rainbow frame for your profile',
    type: 'badge',
    price: 150,
    icon: '💖'
  },
  {
    id: 'custom-mood-theme-sunset',
    name: 'Sunset Theme',
    description: 'Beautiful orange-pink gradient for your profile',
    type: 'theme',
    price: 300,
    icon: '🌅'
  },
  {
    id: 'custom-mood-theme-ocean',
    name: 'Ocean Theme',
    description: 'Calm blue wave gradient for your profile',
    type: 'theme',
    price: 300,
    icon: '🌊'
  },
  {
    id: 'custom-mood-theme-forest',
    name: 'Forest Theme',
    description: 'Fresh green nature gradient for your profile',
    type: 'theme',
    price: 300,
    icon: '🌲'
  },
  {
    id: 'ai-mood-filter',
    name: 'AI Mood Filter',
    description: 'Use premium AI filters on your posts',
    type: 'filter',
    price: 500,
    icon: '🎬'
  },
  {
    id: 'challenge-skip-token',
    name: 'Challenge Skip',
    description: 'Skip one daily task and still get the reward',
    type: 'skip_token',
    price: 100,
    icon: '🎯'
  },
  {
    id: 'mega-boost',
    name: 'Mega Boost',
    description: 'Feature your vibe on Explore for 24 hours',
    type: 'boost',
    price: 800,
    icon: '⚡',
    effectDuration: 86400
  },
  {
    id: 'golden-badge',
    name: 'Golden Badge',
    description: 'Exclusive golden star frame',
    type: 'badge',
    price: 500,
    icon: '⭐'
  },
  {
    id: 'festival-special-badge',
    name: 'Festival Special',
    description: 'Limited edition Diwali badge',
    type: 'badge',
    price: 1000,
    icon: '🪔',
    isLimitedTime: true
  }
];

export function checkBadgeEligibility(
  badgeId: string,
  userStats: {
    totalVibesPosted?: number;
    totalCommentsGiven?: number;
    postingStreak?: number;
    helpfulCommentsGiven?: number;
    joinedHubs?: string[];
    badges?: Badge[];
    xp?: number;
    level?: number;
  }
): boolean {
  const badge = BADGE_DEFINITIONS.find(b => b.id === badgeId);
  if (!badge) return false;

  const alreadyEarned = userStats.badges?.some(b => b.id === badgeId);
  if (alreadyEarned) return false;

  switch (badgeId) {
    case 'first-vibe':
      return (userStats.totalVibesPosted || 0) >= 1;
    case 'kind-heart':
      return (userStats.helpfulCommentsGiven || 0) >= 10;
    case 'streak-master':
      return (userStats.postingStreak || 0) >= 7;
    case 'community-builder':
      return (userStats.joinedHubs || []).length >= 5;
    case 'level-10-master':
      return (userStats.level || 1) >= 10;
    case 'voice-master':
      return (userStats.totalVibesPosted || 0) >= 50;
    default:
      return false;
  }
}

export function getNewlyEarnedBadges(
  userStats: {
    totalVibesPosted?: number;
    totalCommentsGiven?: number;
    postingStreak?: number;
    helpfulCommentsGiven?: number;
    joinedHubs?: string[];
    badges?: Badge[];
    xp?: number;
    level?: number;
  }
): Badge[] {
  const newBadges: Badge[] = [];
  
  for (const badgeDef of BADGE_DEFINITIONS) {
    if (checkBadgeEligibility(badgeDef.id, userStats)) {
      newBadges.push({ ...badgeDef });
    }
  }
  
  return newBadges;
}

export function calculateCoinsFromXP(xpGained: number): number {
  return Math.floor(xpGained / 10);
}