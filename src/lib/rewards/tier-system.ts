import type { UserTier } from '../types';

export const TIER_CONFIGS: UserTier[] = [
  {
    tier: 'bronze',
    minXP: 0,
    maxXP: 2499,
    minLevel: 1,
    maxLevel: 5,
    perks: {
      dailyCoinCapBonus: 0,
      canCreateChallenges: false,
      leaderboardVisibility: 'public',
    },
  },
  {
    tier: 'silver',
    minXP: 2500,
    maxXP: 7499,
    minLevel: 6,
    maxLevel: 15,
    perks: {
      dailyCoinCapBonus: 200,
      canCreateChallenges: false,
      leaderboardVisibility: 'public',
      cosmeticUnlocks: ['silver_badge', 'silver_frame'],
    },
  },
  {
    tier: 'gold',
    minXP: 7500,
    maxXP: 19999,
    minLevel: 16,
    maxLevel: 30,
    perks: {
      dailyCoinCapBonus: 400,
      canCreateChallenges: true,
      leaderboardVisibility: 'top',
      specialBadge: 'gold_tier_creator',
      cosmeticUnlocks: ['gold_badge', 'gold_frame', 'gold_theme'],
    },
  },
  {
    tier: 'platinum',
    minXP: 20000,
    maxXP: 49999,
    minLevel: 31,
    maxLevel: 50,
    perks: {
      dailyCoinCapBonus: 600,
      canCreateChallenges: true,
      leaderboardVisibility: 'top',
      specialBadge: 'platinum_elite',
      cosmeticUnlocks: ['platinum_badge', 'platinum_frame', 'platinum_theme', 'exclusive_emojis'],
    },
  },
  {
    tier: 'legend',
    minXP: 50000,
    maxXP: Infinity,
    minLevel: 51,
    maxLevel: Infinity,
    perks: {
      dailyCoinCapBonus: 1000,
      canCreateChallenges: true,
      leaderboardVisibility: 'elite',
      specialBadge: 'legend_status',
      cosmeticUnlocks: ['legend_badge', 'legend_frame', 'legend_theme', 'legend_animations', 'custom_effects'],
    },
  },
];

export function getUserTier(xp: number): UserTier {
  for (const tier of TIER_CONFIGS) {
    if (xp >= tier.minXP && xp <= tier.maxXP) {
      return tier;
    }
  }
  return TIER_CONFIGS[0];
}

export function getTierByName(tierName: 'bronze' | 'silver' | 'gold' | 'platinum' | 'legend'): UserTier {
  return TIER_CONFIGS.find(t => t.tier === tierName) || TIER_CONFIGS[0];
}

export function getNextTier(currentTier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'legend'): UserTier | null {
  const currentIndex = TIER_CONFIGS.findIndex(t => t.tier === currentTier);
  if (currentIndex === -1 || currentIndex === TIER_CONFIGS.length - 1) {
    return null;
  }
  return TIER_CONFIGS[currentIndex + 1];
}

export function getProgressToNextTier(xp: number, currentTier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'legend'): {
  currentXP: number;
  requiredXP: number;
  percentage: number;
  nextTier: UserTier | null;
} {
  const tier = getTierByName(currentTier);
  const next = getNextTier(currentTier);

  if (!next) {
    return {
      currentXP: xp,
      requiredXP: tier.maxXP,
      percentage: 100,
      nextTier: null,
    };
  }

  const progress = xp - tier.minXP;
  const required = next.minXP - tier.minXP;
  const percentage = Math.min((progress / required) * 100, 100);

  return {
    currentXP: xp,
    requiredXP: next.minXP,
    percentage,
    nextTier: next,
  };
}
