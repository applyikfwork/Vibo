import type { Firestore } from 'firebase-admin/firestore';
import { getKarmaTier, calculateKarmaChange, DEFAULT_KARMA } from './karma-system';
import { calculateLevel, getLevelConfig } from './level-system';
import { BADGE_CATALOG, checkBadgeEligibility } from './badge-system';
import { QUALITY_BONUS_CONFIGS, checkQualityBonus } from './quality-bonuses';
import { STREAK_MILESTONES } from './streak-milestones';
import { SPECIAL_ACHIEVEMENTS } from './special-achievements';

export interface RewardAction {
  type: 'post_vibe' | 'react' | 'comment' | 'share' | 'daily_login' | 'challenge_complete' | 'mission_complete' | 'quality_bonus' | 'streak_milestone' | 'badge_earn' | 'special_achievement';
  userId: string;
  metadata?: {
    vibeId?: string;
    challengeId?: string;
    missionId?: string;
    badgeId?: string;
    achievementId?: string;
    emotionType?: string;
    reactionCount?: number;
    streakDays?: number;
  };
}

export interface RewardResult {
  success: boolean;
  xpEarned: number;
  coinsEarned: number;
  gemsEarned: number;
  karmaChange: number;
  newTotals: {
    xp: number;
    coins: number;
    gems: number;
    karma: number;
    level: number;
  };
  badges?: any[];
  cappedByDaily?: boolean;
  message?: string;
  transactionId?: string;
}

export interface DailyCaps {
  post_vibe: { limit: number; current: number };
  react: { limit: number; current: number };
  comment: { limit: number; current: number };
  share: { limit: number; current: number };
  lastReset: Date;
}

const DEFAULT_DAILY_CAPS: DailyCaps = {
  post_vibe: { limit: 3, current: 0 },
  react: { limit: 10, current: 0 },
  comment: { limit: 5, current: 0 },
  share: { limit: 3, current: 0 },
  lastReset: new Date(),
};

export class RewardsOrchestrationService {
  constructor(private db: Firestore) {}

  private async getDailyCaps(userId: string): Promise<DailyCaps> {
    const capsDoc = await this.db.collection('daily-caps').doc(userId).get();
    
    if (!capsDoc.exists) {
      await this.db.collection('daily-caps').doc(userId).set(DEFAULT_DAILY_CAPS);
      return DEFAULT_DAILY_CAPS;
    }

    const caps = capsDoc.data() as DailyCaps;
    const lastReset = caps.lastReset instanceof Date ? caps.lastReset : (caps.lastReset as any).toDate();
    const now = new Date();
    const hoursSinceReset = (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60);

    if (hoursSinceReset >= 24) {
      const resetCaps = {
        ...DEFAULT_DAILY_CAPS,
        lastReset: now,
      };
      await this.db.collection('daily-caps').doc(userId).set(resetCaps);
      return resetCaps;
    }

    return caps;
  }

  private async incrementDailyCap(userId: string, action: string): Promise<boolean> {
    const caps = await this.getDailyCaps(userId);
    const capKey = action as keyof Omit<DailyCaps, 'lastReset'>;
    
    if (!caps[capKey]) {
      return true;
    }

    if (caps[capKey].current >= caps[capKey].limit) {
      return false;
    }

    caps[capKey].current += 1;
    await this.db.collection('daily-caps').doc(userId).update({
      [capKey]: caps[capKey],
    });

    return true;
  }

  private async validateVibePost(vibeId: string, userId: string): Promise<boolean> {
    const vibeDoc = await this.db.collection('vibes').doc(vibeId).get();
    return vibeDoc.exists && vibeDoc.data()?.userId === userId;
  }

  private async validateReaction(userId: string): Promise<number> {
    const reactionsSnapshot = await this.db
      .collection('reactions')
      .where('userId', '==', userId)
      .count()
      .get();
    return reactionsSnapshot.data().count;
  }

  private async validateComment(userId: string): Promise<number> {
    const commentsSnapshot = await this.db
      .collection('comments')
      .where('userId', '==', userId)
      .count()
      .get();
    return commentsSnapshot.data().count;
  }

  private async validateChallengeCompletion(challengeId: string, userId: string): Promise<boolean> {
    const progressDoc = await this.db
      .collection('challenge-progress')
      .doc(`${userId}_${challengeId}`)
      .get();
    
    return progressDoc.exists && progressDoc.data()?.completed === true;
  }

  private async validateMissionCompletion(missionId: string, userId: string): Promise<boolean> {
    const progressDoc = await this.db
      .collection('mission-progress')
      .doc(`${userId}_${missionId}`)
      .get();
    
    return progressDoc.exists && progressDoc.data()?.completed === true;
  }

  private async getVibeReactionCount(vibeId: string): Promise<number> {
    const reactionsSnapshot = await this.db
      .collection('reactions')
      .where('vibeId', '==', vibeId)
      .count()
      .get();
    return reactionsSnapshot.data().count;
  }

  private async getUserStats(userId: string): Promise<any> {
    const userDoc = await this.db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      throw new Error('User not found');
    }

    const userData = userDoc.data();
    return {
      xp: userData?.xp || 0,
      coins: userData?.coins || 0,
      gems: userData?.gems || 0,
      karma: userData?.karma || DEFAULT_KARMA,
      level: userData?.level || 1,
      badges: userData?.badges || [],
      postingStreak: userData?.postingStreak || 0,
      totalVibesPosted: userData?.totalVibesPosted || 0,
      totalReactionsGiven: userData?.totalReactionsGiven || 0,
      totalCommentsGiven: userData?.totalCommentsGiven || 0,
      emotionPosts: userData?.emotionPosts || {},
      uniqueEmotions: userData?.uniqueEmotions || 0,
      uniqueCities: userData?.uniqueCities || 0,
      challengesCompleted: userData?.challengesCompleted || 0,
    };
  }

  private async createTransaction(
    userId: string,
    action: string,
    xpChange: number,
    coinsChange: number,
    gemsChange: number,
    karmaChange: number,
    metadata: any
  ): Promise<string> {
    const transactionRef = await this.db.collection('reward-transactions').add({
      userId,
      action,
      xpChange,
      coinsChange,
      gemsChange,
      karmaChange,
      metadata,
      timestamp: new Date(),
      source: 'ROS',
    });

    return transactionRef.id;
  }

  async awardReward(action: RewardAction): Promise<RewardResult> {
    const { type, userId, metadata } = action;

    try {
      const userStats = await this.getUserStats(userId);
      let xpEarned = 0;
      let coinsEarned = 0;
      let gemsEarned = 0;
      let karmaChange = 0;
      let cappedByDaily = false;

      switch (type) {
        case 'post_vibe': {
          if (!metadata?.vibeId) {
            return { success: false, xpEarned: 0, coinsEarned: 0, gemsEarned: 0, karmaChange: 0, newTotals: userStats, message: 'Vibe ID required' };
          }

          const isValid = await this.validateVibePost(metadata.vibeId, userId);
          if (!isValid) {
            return { success: false, xpEarned: 0, coinsEarned: 0, gemsEarned: 0, karmaChange: 0, newTotals: userStats, message: 'Invalid vibe' };
          }

          const canIncrement = await this.incrementDailyCap(userId, 'post_vibe');
          if (!canIncrement) {
            cappedByDaily = true;
            return { success: false, xpEarned: 0, coinsEarned: 0, gemsEarned: 0, karmaChange: 0, newTotals: userStats, cappedByDaily, message: 'Daily post limit reached' };
          }

          xpEarned = 10;
          coinsEarned = 5;
          karmaChange = 5;
          break;
        }

        case 'react': {
          const canIncrement = await this.incrementDailyCap(userId, 'react');
          if (!canIncrement) {
            cappedByDaily = true;
            return { success: false, xpEarned: 0, coinsEarned: 0, gemsEarned: 0, karmaChange: 0, newTotals: userStats, cappedByDaily, message: 'Daily reaction limit reached' };
          }

          xpEarned = 2;
          break;
        }

        case 'comment': {
          const canIncrement = await this.incrementDailyCap(userId, 'comment');
          if (!canIncrement) {
            cappedByDaily = true;
            return { success: false, xpEarned: 0, coinsEarned: 0, gemsEarned: 0, karmaChange: 0, newTotals: userStats, cappedByDaily, message: 'Daily comment limit reached' };
          }

          xpEarned = 5;
          karmaChange = 3;
          break;
        }

        case 'share': {
          const canIncrement = await this.incrementDailyCap(userId, 'share');
          if (!canIncrement) {
            cappedByDaily = true;
            return { success: false, xpEarned: 0, coinsEarned: 0, gemsEarned: 0, karmaChange: 0, newTotals: userStats, cappedByDaily, message: 'Daily share limit reached' };
          }

          xpEarned = 3;
          coinsEarned = 2;
          karmaChange = 10;
          break;
        }

        case 'daily_login': {
          xpEarned = 5;
          break;
        }

        case 'challenge_complete': {
          if (!metadata?.challengeId) {
            return { success: false, xpEarned: 0, coinsEarned: 0, gemsEarned: 0, karmaChange: 0, newTotals: userStats, message: 'Challenge ID required' };
          }

          const isValid = await this.validateChallengeCompletion(metadata.challengeId, userId);
          if (!isValid) {
            return { success: false, xpEarned: 0, coinsEarned: 0, gemsEarned: 0, karmaChange: 0, newTotals: userStats, message: 'Challenge not completed' };
          }

          xpEarned = 50;
          coinsEarned = 25;
          karmaChange = 2;
          break;
        }

        case 'mission_complete': {
          if (!metadata?.missionId) {
            return { success: false, xpEarned: 0, coinsEarned: 0, gemsEarned: 0, karmaChange: 0, newTotals: userStats, message: 'Mission ID required' };
          }

          const isValid = await this.validateMissionCompletion(metadata.missionId, userId);
          if (!isValid) {
            return { success: false, xpEarned: 0, coinsEarned: 0, gemsEarned: 0, karmaChange: 0, newTotals: userStats, message: 'Mission not completed' };
          }

          xpEarned = 30;
          coinsEarned = 15;
          break;
        }

        case 'quality_bonus': {
          if (!metadata?.vibeId) {
            return { success: false, xpEarned: 0, coinsEarned: 0, gemsEarned: 0, karmaChange: 0, newTotals: userStats, message: 'Vibe ID required' };
          }

          const reactionCount = await this.getVibeReactionCount(metadata.vibeId);
          
          if (reactionCount >= 10) {
            const bonus = checkQualityBonus('viral_vibe', { reactionCount });
            if (bonus.eligible) {
              xpEarned = bonus.xp;
              coinsEarned = bonus.coins;
            }
          }
          break;
        }

        case 'streak_milestone': {
          if (!metadata?.streakDays) {
            return { success: false, xpEarned: 0, coinsEarned: 0, gemsEarned: 0, karmaChange: 0, newTotals: userStats, message: 'Streak days required' };
          }

          const milestone = STREAK_MILESTONES.find(m => m.streakDays === metadata.streakDays);
          if (milestone) {
            xpEarned = milestone.xpReward;
            coinsEarned = milestone.coinReward;
          }
          break;
        }

        default:
          return { success: false, xpEarned: 0, coinsEarned: 0, gemsEarned: 0, karmaChange: 0, newTotals: userStats, message: 'Unknown action type' };
      }

      const newXP = userStats.xp + xpEarned;
      const newCoins = userStats.coins + coinsEarned;
      const newGems = userStats.gems + gemsEarned;
      const newKarma = Math.max(0, userStats.karma + karmaChange);
      const newLevel = calculateLevel(newXP);

      await this.db.collection('users').doc(userId).update({
        xp: newXP,
        coins: newCoins,
        gems: newGems,
        karma: newKarma,
        level: newLevel,
        lastRewardUpdate: new Date(),
      });

      const transactionId = await this.createTransaction(
        userId,
        type,
        xpEarned,
        coinsEarned,
        gemsEarned,
        karmaChange,
        metadata || {}
      );

      return {
        success: true,
        xpEarned,
        coinsEarned,
        gemsEarned,
        karmaChange,
        newTotals: {
          xp: newXP,
          coins: newCoins,
          gems: newGems,
          karma: newKarma,
          level: newLevel,
        },
        cappedByDaily,
        transactionId,
      };
    } catch (error) {
      console.error('ROS Error:', error);
      throw error;
    }
  }

  async checkAndAwardBadge(userId: string, badgeId: string): Promise<RewardResult> {
    try {
      const badge = BADGE_CATALOG.find(b => b.id === badgeId);
      if (!badge) {
        return { 
          success: false, 
          xpEarned: 0, 
          coinsEarned: 0, 
          gemsEarned: 0, 
          karmaChange: 0, 
          newTotals: await this.getUserStats(userId),
          message: 'Badge not found' 
        };
      }

      const userStats = await this.getUserStats(userId);

      const alreadyEarned = userStats.badges.some((b: any) => b.id === badgeId);
      if (alreadyEarned) {
        return { 
          success: false, 
          xpEarned: 0, 
          coinsEarned: 0, 
          gemsEarned: 0, 
          karmaChange: 0, 
          newTotals: userStats,
          message: 'Badge already earned' 
        };
      }

      const serverStats = {
        emotionPosts: userStats.emotionPosts,
        uniqueEmotions: userStats.uniqueEmotions,
        uniqueCities: userStats.uniqueCities,
        postingStreak: userStats.postingStreak,
        challengesCompleted: userStats.challengesCompleted,
        totalVibesPosted: userStats.totalVibesPosted,
        totalReactionsGiven: userStats.totalReactionsGiven,
        totalCommentsGiven: userStats.totalCommentsGiven,
      };

      const eligible = checkBadgeEligibility(badgeId, serverStats);
      if (!eligible) {
        return { 
          success: false, 
          xpEarned: 0, 
          coinsEarned: 0, 
          gemsEarned: 0, 
          karmaChange: 0, 
          newTotals: userStats,
          message: 'Not eligible for this badge' 
        };
      }

      const newBadge = {
        id: badge.id,
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
        category: badge.category,
        rarity: badge.rarity,
        earnedAt: new Date(),
      };

      const xpEarned = badge.xpReward || 0;
      const coinsEarned = badge.coinReward || 0;

      const newXP = userStats.xp + xpEarned;
      const newCoins = userStats.coins + coinsEarned;
      const newLevel = calculateLevel(newXP);

      await this.db.collection('users').doc(userId).update({
        badges: [...userStats.badges, newBadge],
        xp: newXP,
        coins: newCoins,
        level: newLevel,
      });

      const transactionId = await this.createTransaction(
        userId,
        `badge_earned_${badgeId}`,
        xpEarned,
        coinsEarned,
        0,
        0,
        { badgeId, badgeName: badge.name }
      );

      return {
        success: true,
        xpEarned,
        coinsEarned,
        gemsEarned: 0,
        karmaChange: 0,
        newTotals: {
          xp: newXP,
          coins: newCoins,
          gems: userStats.gems,
          karma: userStats.karma,
          level: newLevel,
        },
        badges: [newBadge],
        transactionId,
      };
    } catch (error) {
      console.error('ROS Badge Error:', error);
      throw error;
    }
  }

  async spendCurrency(
    userId: string,
    coins: number = 0,
    gems: number = 0,
    reason: string,
    metadata?: any
  ): Promise<RewardResult> {
    try {
      const userStats = await this.getUserStats(userId);

      if (userStats.coins < coins) {
        return {
          success: false,
          xpEarned: 0,
          coinsEarned: 0,
          gemsEarned: 0,
          karmaChange: 0,
          newTotals: userStats,
          message: 'Insufficient coins',
        };
      }

      if (userStats.gems < gems) {
        return {
          success: false,
          xpEarned: 0,
          coinsEarned: 0,
          gemsEarned: 0,
          karmaChange: 0,
          newTotals: userStats,
          message: 'Insufficient gems',
        };
      }

      const newCoins = userStats.coins - coins;
      const newGems = userStats.gems - gems;

      await this.db.collection('users').doc(userId).update({
        coins: newCoins,
        gems: newGems,
      });

      const transactionId = await this.createTransaction(
        userId,
        reason,
        0,
        -coins,
        -gems,
        0,
        metadata || {}
      );

      return {
        success: true,
        xpEarned: 0,
        coinsEarned: -coins,
        gemsEarned: -gems,
        karmaChange: 0,
        newTotals: {
          xp: userStats.xp,
          coins: newCoins,
          gems: newGems,
          karma: userStats.karma,
          level: userStats.level,
        },
        transactionId,
      };
    } catch (error) {
      console.error('ROS Spend Error:', error);
      throw error;
    }
  }
}
