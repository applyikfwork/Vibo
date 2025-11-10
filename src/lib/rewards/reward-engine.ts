import type { Timestamp } from 'firebase/firestore';

export type RewardAction = 
  | 'post_vibe'
  | 'react_vibe'
  | 'helpful_comment'
  | 'receive_heart'
  | 'complete_daily_mission'
  | 'complete_weekly_challenge'
  | 'city_challenge_contribution'
  | 'invite_friend'
  | 'watch_ad'
  | 'gift_user'
  | 'first_post_today'
  | 'helpful_comment_bonus'
  | 'receive_gift';

export type RewardConfig = {
  xp: number;
  coins: number;
  gems?: number;
  dailyLimit?: number;
  requiresVerification?: boolean;
};

export const REWARD_CONFIGS: Record<RewardAction, RewardConfig> = {
  post_vibe: {
    xp: 10,
    coins: 0,
    dailyLimit: 3,
  },
  first_post_today: {
    xp: 5,
    coins: 0,
    dailyLimit: 1,
  },
  react_vibe: {
    xp: 2,
    coins: 0,
    dailyLimit: 10,
  },
  helpful_comment: {
    xp: 5,
    coins: 0,
    dailyLimit: 5,
  },
  helpful_comment_bonus: {
    xp: 10,
    coins: 0,
    dailyLimit: 5,
    requiresVerification: true,
  },
  receive_heart: {
    xp: 2,
    coins: 0,
    dailyLimit: 100,
  },
  complete_daily_mission: {
    xp: 50,
    coins: 25,
  },
  complete_weekly_challenge: {
    xp: 150,
    coins: 100,
  },
  city_challenge_contribution: {
    xp: 50,
    coins: 25,
  },
  invite_friend: {
    xp: 300,
    coins: 300,
    requiresVerification: true,
  },
  watch_ad: {
    xp: 0,
    coins: 100,
    dailyLimit: 10,
  },
  gift_user: {
    xp: 0,
    coins: 0,
  },
  receive_gift: {
    xp: 5,
    coins: 5,
  },
};

export const DAILY_CAPS = {
  MAX_COINS_EARNED: 500,
  MAX_XP_FROM_REACTIONS: 20,
  MAX_XP_EARNED: 89,
  MAX_XP_FROM_POSTS: 30,
  MAX_XP_FROM_COMMENTS: 25,
  MAX_XP_FROM_SHARES: 9,
};

export const GIFT_CONFIGS = {
  rose: { cost: 10, recipientXP: 5, recipientCoins: 5 },
  star: { cost: 25, recipientXP: 10, recipientCoins: 10 },
  crown: { cost: 200, recipientXP: 50, recipientCoins: 50 },
};

export const RATE_LIMITS = {
  post_vibe: { maxPer5Min: 5, maxPerHour: 20 },
  react_vibe: { maxPer5Min: 30, maxPerHour: 200 },
  helpful_comment: { maxPer5Min: 10, maxPerHour: 50 },
  gift_user: { maxPer5Min: 3, maxPerHour: 20 },
};

export const FRAUD_THRESHOLDS = {
  velocity: {
    posts_per_5_min: 10,
    reactions_per_5_min: 50,
    coins_earned_per_hour: 500,
  },
  anomaly: {
    coins_vs_median_multiplier: 5,
    xp_vs_median_multiplier: 5,
  },
  collaboration: {
    reciprocal_reaction_threshold: 0.8,
    min_interactions_to_flag: 20,
  },
};

import { calculateLevel as calcLevel } from './level-system';

export function calculateLevel(xp: number): number {
  return calcLevel(xp);
}

export function calculateTier(xp: number, level: number): 'bronze' | 'silver' | 'gold' | 'platinum' | 'legend' {
  if (xp >= 50000 || level >= 51) return 'legend';
  if (xp >= 20000 || level >= 31) return 'platinum';
  if (xp >= 7500 || level >= 16) return 'gold';
  if (xp >= 2500 || level >= 6) return 'silver';
  return 'bronze';
}

export function getTierPerks(tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'legend') {
  const perks = {
    bronze: { dailyCoinCapBonus: 0, canCreateChallenges: false, leaderboardVisibility: 'public' as const },
    silver: { dailyCoinCapBonus: 200, canCreateChallenges: false, leaderboardVisibility: 'public' as const },
    gold: { dailyCoinCapBonus: 400, canCreateChallenges: true, leaderboardVisibility: 'top' as const },
    platinum: { dailyCoinCapBonus: 600, canCreateChallenges: true, leaderboardVisibility: 'top' as const },
    legend: { dailyCoinCapBonus: 1000, canCreateChallenges: true, leaderboardVisibility: 'elite' as const },
  };
  return perks[tier];
}

export function calculateReward(
  action: RewardAction,
  metadata: {
    isFirstPostToday?: boolean;
    helpfulVoteCount?: number;
    userTier?: 'bronze' | 'silver' | 'gold' | 'platinum' | 'legend';
    currentDailyCoins?: number;
    currentDailyXP?: number;
    currentDailyReactionXP?: number;
  } = {}
): { xp: number; coins: number; gems: number; blocked: boolean; blockReason?: string } {
  const config = REWARD_CONFIGS[action];
  if (!config) {
    return { xp: 0, coins: 0, gems: 0, blocked: true, blockReason: 'Invalid action' };
  }

  let xp = config.xp;
  let coins = config.coins;
  let gems = config.gems || 0;

  if (action === 'post_vibe' && metadata.isFirstPostToday) {
    coins += REWARD_CONFIGS.first_post_today.coins;
  }

  if (action === 'helpful_comment' && metadata.helpfulVoteCount && metadata.helpfulVoteCount >= 5) {
    coins += REWARD_CONFIGS.helpful_comment_bonus.coins;
  }

  const tierPerks = metadata.userTier ? getTierPerks(metadata.userTier) : null;
  const dailyCoinCap = DAILY_CAPS.MAX_COINS_EARNED + (tierPerks?.dailyCoinCapBonus || 0);

  const currentDailyCoins = metadata.currentDailyCoins || 0;
  const currentDailyXP = metadata.currentDailyXP || 0;
  const currentDailyReactionXP = metadata.currentDailyReactionXP || 0;

  if (currentDailyCoins + coins > dailyCoinCap) {
    return { xp: 0, coins: 0, gems: 0, blocked: true, blockReason: 'Daily coin cap reached' };
  }

  if (action === 'react_vibe' && currentDailyReactionXP + xp > DAILY_CAPS.MAX_XP_FROM_REACTIONS) {
    return { xp: 0, coins: 0, gems: 0, blocked: true, blockReason: 'Daily reaction XP cap reached' };
  }

  if (currentDailyXP + xp > DAILY_CAPS.MAX_XP_EARNED) {
    return { xp: 0, coins: 0, gems: 0, blocked: true, blockReason: 'Daily XP cap reached' };
  }

  return { xp, coins, gems, blocked: false };
}

export function shouldResetDailyCaps(lastReset: Timestamp | undefined): boolean {
  if (!lastReset) return true;

  const now = new Date();
  const lastResetDate = (lastReset as any).toDate ? (lastReset as any).toDate() : 
                        typeof lastReset === 'object' && 'seconds' in lastReset ? new Date((lastReset as any).seconds * 1000) :
                        new Date();

  return now.getDate() !== lastResetDate.getDate() || 
         now.getMonth() !== lastResetDate.getMonth() || 
         now.getFullYear() !== lastResetDate.getFullYear();
}

export function checkVelocityLimit(
  action: RewardAction,
  recentActions: { timestamp: Timestamp }[]
): { allowed: boolean; reason?: string } {
  const limit = RATE_LIMITS[action as keyof typeof RATE_LIMITS];
  if (!limit) return { allowed: true };

  const now = Date.now();
  const fiveMinAgo = now - 5 * 60 * 1000;
  const oneHourAgo = now - 60 * 60 * 1000;

  const recentFiveMin = recentActions.filter(a => {
    const ts = (a.timestamp as any).toMillis ? (a.timestamp as any).toMillis() : a.timestamp;
    return ts > fiveMinAgo;
  }).length;

  const recentHour = recentActions.filter(a => {
    const ts = (a.timestamp as any).toMillis ? (a.timestamp as any).toMillis() : a.timestamp;
    return ts > oneHourAgo;
  }).length;

  if (recentFiveMin >= limit.maxPer5Min) {
    return { allowed: false, reason: `Too many ${action} actions in 5 minutes` };
  }

  if (recentHour >= limit.maxPerHour) {
    return { allowed: false, reason: `Too many ${action} actions in 1 hour` };
  }

  return { allowed: true };
}

export function detectAnomalousEarning(
  dailyCoins: number,
  dailyXP: number,
  medianDailyCoins: number,
  medianDailyXP: number
): { isFraudulent: boolean; severity: 'low' | 'medium' | 'high' | 'critical'; reason?: string } {
  const coinMultiplier = medianDailyCoins > 0 ? dailyCoins / medianDailyCoins : 0;
  const xpMultiplier = medianDailyXP > 0 ? dailyXP / medianDailyXP : 0;

  if (coinMultiplier > FRAUD_THRESHOLDS.anomaly.coins_vs_median_multiplier * 2) {
    return { isFraudulent: true, severity: 'critical', reason: 'Coin earning far exceeds normal patterns' };
  }

  if (coinMultiplier > FRAUD_THRESHOLDS.anomaly.coins_vs_median_multiplier) {
    return { isFraudulent: true, severity: 'high', reason: 'Coin earning significantly above median' };
  }

  if (xpMultiplier > FRAUD_THRESHOLDS.anomaly.xp_vs_median_multiplier) {
    return { isFraudulent: true, severity: 'medium', reason: 'XP earning significantly above median' };
  }

  return { isFraudulent: false, severity: 'low' };
}

export function calculateMinCharLengthForComment(action: RewardAction): number {
  if (action === 'helpful_comment') {
    return 10;
  }
  return 0;
}
