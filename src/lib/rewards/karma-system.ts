import type { Timestamp } from 'firebase/firestore';

export type KarmaAction =
  | 'quality_vibe'
  | 'helpful_comment'
  | 'content_shared'
  | 'complete_challenge'
  | 'daily_streak'
  | 'spam_detected'
  | 'reported_content'
  | 'no_engagement'
  | 'inactive_period';

export type KarmaTier = {
  name: string;
  minKarma: number;
  maxKarma: number;
  visibility: 'limited' | 'normal' | 'boosted' | 'featured';
  feedBoost: number;
  description: string;
};

export const KARMA_CONFIGS: Record<KarmaAction, { karma: number; description: string }> = {
  quality_vibe: { karma: 5, description: 'Your vibe got 10+ reactions' },
  helpful_comment: { karma: 3, description: 'Your comment was helpful' },
  content_shared: { karma: 10, description: 'Someone shared your content' },
  complete_challenge: { karma: 2, description: 'Completed a challenge' },
  daily_streak: { karma: 1, description: 'Daily login streak' },
  spam_detected: { karma: -20, description: 'Spam behavior detected' },
  reported_content: { karma: -50, description: 'Content reported and verified' },
  no_engagement: { karma: -5, description: 'No engagement on 10 consecutive posts' },
  inactive_period: { karma: -10, description: 'Inactive for 30 days' },
};

export const KARMA_TIERS: KarmaTier[] = [
  {
    name: 'Limited',
    minKarma: 0,
    maxKarma: 50,
    visibility: 'limited',
    feedBoost: 0.5,
    description: 'Reduced visibility in feeds',
  },
  {
    name: 'New User',
    minKarma: 51,
    maxKarma: 100,
    visibility: 'normal',
    feedBoost: 1.0,
    description: 'Standard visibility',
  },
  {
    name: 'Trusted',
    minKarma: 101,
    maxKarma: 500,
    visibility: 'normal',
    feedBoost: 1.2,
    description: 'Good standing member',
  },
  {
    name: 'Respected',
    minKarma: 501,
    maxKarma: 1000,
    visibility: 'boosted',
    feedBoost: 1.5,
    description: 'Respected community member',
  },
  {
    name: 'Community Leader',
    minKarma: 1001,
    maxKarma: Infinity,
    visibility: 'featured',
    feedBoost: 2.0,
    description: 'Featured in feeds with priority',
  },
];

export const DEFAULT_KARMA = 100;

export function getKarmaTier(karma: number): KarmaTier {
  for (const tier of KARMA_TIERS) {
    if (karma >= tier.minKarma && karma <= tier.maxKarma) {
      return tier;
    }
  }
  return KARMA_TIERS[1];
}

export function calculateKarmaChange(
  action: KarmaAction,
  metadata: {
    currentKarma?: number;
    verificationRequired?: boolean;
    verified?: boolean;
  } = {}
): { karma: number; newTotal: number; blocked: boolean; reason?: string } {
  const config = KARMA_CONFIGS[action];
  if (!config) {
    return { karma: 0, newTotal: metadata.currentKarma || DEFAULT_KARMA, blocked: true, reason: 'Invalid karma action' };
  }

  if (metadata.verificationRequired && !metadata.verified) {
    return { karma: 0, newTotal: metadata.currentKarma || DEFAULT_KARMA, blocked: true, reason: 'Verification required' };
  }

  const currentKarma = metadata.currentKarma || DEFAULT_KARMA;
  const karmaChange = config.karma;
  const newTotal = Math.max(0, currentKarma + karmaChange);

  return { karma: karmaChange, newTotal, blocked: false };
}

export function getKarmaImpact(karma: number): {
  tier: KarmaTier;
  feedVisibility: string;
  recommendationBoost: number;
  restrictions: string[];
} {
  const tier = getKarmaTier(karma);
  const restrictions: string[] = [];

  if (tier.visibility === 'limited') {
    restrictions.push('Reduced feed visibility');
    restrictions.push('Content requires manual review');
    restrictions.push('Limited posting frequency');
  }

  return {
    tier,
    feedVisibility: tier.visibility,
    recommendationBoost: tier.feedBoost,
    restrictions,
  };
}

export function shouldApplyKarma(
  action: KarmaAction,
  userHistory: {
    recentActions: { action: KarmaAction; timestamp: Timestamp }[];
    lastKarmaUpdate?: Timestamp;
  }
): boolean {
  const now = Date.now();
  const oneHourAgo = now - 60 * 60 * 1000;

  const recentSameActions = userHistory.recentActions.filter(a => {
    const ts = (a.timestamp as any).toMillis ? (a.timestamp as any).toMillis() : a.timestamp;
    return a.action === action && ts > oneHourAgo;
  });

  if (action === 'daily_streak' && recentSameActions.length > 0) {
    return false;
  }

  if (['spam_detected', 'reported_content'].includes(action) && recentSameActions.length > 5) {
    return false;
  }

  return true;
}
