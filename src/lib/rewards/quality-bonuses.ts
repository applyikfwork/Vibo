export type QualityBonus = 
  | 'viral_vibe'
  | 'trending_city'
  | 'helpful_comment_milestone'
  | 'vibe_shared'
  | 'reaction_milestone'
  | 'comment_milestone';

export interface QualityBonusConfig {
  id: QualityBonus;
  name: string;
  description: string;
  xpReward: number;
  coinReward?: number;
  criteria: {
    type: string;
    threshold: number;
    timeframe?: string;
  };
}

export const QUALITY_BONUS_CONFIGS: QualityBonusConfig[] = [
  {
    id: 'viral_vibe',
    name: 'Viral Vibe',
    description: 'Your vibe got 10+ reactions',
    xpReward: 25,
    coinReward: 10,
    criteria: {
      type: 'vibe_reactions',
      threshold: 10,
    },
  },
  {
    id: 'trending_city',
    name: 'Trending in City',
    description: 'Your vibe is trending in your city',
    xpReward: 50,
    coinReward: 25,
    criteria: {
      type: 'city_trending',
      threshold: 1,
    },
  },
  {
    id: 'helpful_comment_milestone',
    name: 'Helpful Comment',
    description: 'Your comment got 5+ likes',
    xpReward: 10,
    coinReward: 5,
    criteria: {
      type: 'comment_likes',
      threshold: 5,
    },
  },
  {
    id: 'vibe_shared',
    name: 'Content Shared',
    description: 'Someone shared your vibe',
    xpReward: 15,
    coinReward: 10,
    criteria: {
      type: 'vibe_shares',
      threshold: 1,
    },
  },
  {
    id: 'reaction_milestone',
    name: '100 Reactions Received',
    description: 'Received 100 total reactions',
    xpReward: 200,
    coinReward: 100,
    criteria: {
      type: 'total_reactions',
      threshold: 100,
    },
  },
  {
    id: 'comment_milestone',
    name: '50 Comments Received',
    description: 'Received 50 total comments',
    xpReward: 150,
    coinReward: 75,
    criteria: {
      type: 'total_comments',
      threshold: 50,
    },
  },
];

export function checkQualityBonus(
  bonusType: QualityBonus,
  metadata: {
    reactionCount?: number;
    isTrending?: boolean;
    commentLikes?: number;
    shareCount?: number;
    totalReactions?: number;
    totalComments?: number;
  }
): { eligible: boolean; xp: number; coins: number } {
  const bonus = QUALITY_BONUS_CONFIGS.find(b => b.id === bonusType);
  if (!bonus) {
    return { eligible: false, xp: 0, coins: 0 };
  }

  let eligible = false;

  switch (bonus.criteria.type) {
    case 'vibe_reactions':
      eligible = (metadata.reactionCount || 0) >= bonus.criteria.threshold;
      break;
    case 'city_trending':
      eligible = metadata.isTrending || false;
      break;
    case 'comment_likes':
      eligible = (metadata.commentLikes || 0) >= bonus.criteria.threshold;
      break;
    case 'vibe_shares':
      eligible = (metadata.shareCount || 0) >= bonus.criteria.threshold;
      break;
    case 'total_reactions':
      eligible = (metadata.totalReactions || 0) >= bonus.criteria.threshold;
      break;
    case 'total_comments':
      eligible = (metadata.totalComments || 0) >= bonus.criteria.threshold;
      break;
    default:
      eligible = false;
  }

  if (!eligible) {
    return { eligible: false, xp: 0, coins: 0 };
  }

  return {
    eligible: true,
    xp: bonus.xpReward,
    coins: bonus.coinReward || 0,
  };
}

export function getAvailableQualityBonuses(metadata: {
  reactionCount?: number;
  isTrending?: boolean;
  commentLikes?: number;
  shareCount?: number;
  totalReactions?: number;
  totalComments?: number;
}): QualityBonusConfig[] {
  const eligible: QualityBonusConfig[] = [];

  for (const bonus of QUALITY_BONUS_CONFIGS) {
    const check = checkQualityBonus(bonus.id, metadata);
    if (check.eligible) {
      eligible.push(bonus);
    }
  }

  return eligible;
}
