import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/firebase/admin';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';
import {
  RewardAction,
  calculateReward,
  calculateLevel,
  calculateTier,
  shouldResetDailyCaps,
  checkVelocityLimit,
  detectAnomalousEarning,
  FRAUD_THRESHOLDS,
} from '@/lib/rewards/reward-engine';
import { incrementMissionProgress, shouldResetDailyMissions, shouldResetWeeklyMissions, generateDailyMissions, generateWeeklyMissions } from '@/lib/rewards/missions-service';
import { detectCollaborationRing, shouldTriggerManualReview, calculateSanction } from '@/lib/rewards/fraud-detection';
import type { Mission } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const admin = await getFirebaseAdmin();
    const decodedToken = await admin.auth().verifyIdToken(token);
    const userId = decodedToken.uid;

    const body = await req.json();
    const { 
      action, 
      metadata = {},
      idempotencyKey 
    } = body as { 
      action: string; 
      metadata?: Record<string, any>;
      idempotencyKey?: string;
    };

    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 });
    }

    const db = admin.firestore();

    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const deviceFingerprint = metadata.deviceFingerprint || 'unknown';

    if (idempotencyKey) {
      const idempotencyDoc = await db
        .collection('reward-transactions')
        .where('userId', '==', userId)
        .where('idempotencyKey', '==', idempotencyKey)
        .limit(1)
        .get();

      if (!idempotencyDoc.empty) {
        const existing = idempotencyDoc.docs[0].data();
        return NextResponse.json({
          success: true,
          isDuplicate: true,
          xpGained: existing.xpChange || 0,
          coinsGained: existing.coinsChange || 0,
          gemsGained: existing.gemsChange || 0,
        });
      }
    }

    const recentActions = await db
      .collection('reward-transactions')
      .where('userId', '==', userId)
      .where('action', '==', action)
      .orderBy('timestamp', 'desc')
      .limit(200)
      .get();

    const recentActionsList = recentActions.docs.map(doc => ({
      timestamp: doc.data().timestamp,
    }));

    const velocityCheck = checkVelocityLimit(action as RewardAction, recentActionsList);
    if (!velocityCheck.allowed) {
      return NextResponse.json({
        error: 'Rate limit exceeded',
        message: velocityCheck.reason,
      }, { status: 429 });
    }

    const result = await db.runTransaction(async (transaction) => {
      const userRef = db.collection('users').doc(userId);
      const userDoc = await transaction.get(userRef);

      if (!userDoc.exists) {
        throw new Error('User not found');
      }

      const userData = userDoc.data()!;

      if (userData.accountStatus === 'suspended' || userData.accountStatus === 'banned') {
        throw new Error('Account is suspended or banned');
      }

      const currentXP = userData.xp || 0;
      const currentCoins = userData.coins || 0;
      const currentGems = userData.gems || 0;
      const currentLevel = userData.level || 1;
      const currentTier = userData.tier || 'bronze';
      const fraudFlags = userData.fraudFlags || 0;

      let dailyCoinsEarned = userData.dailyCoinsEarned || 0;
      let dailyXPEarned = userData.dailyXPEarned || 0;
      let dailyReactionXP = userData.dailyReactionXP || 0;
      let lastDailyCapReset = userData.lastDailyCapReset;

      if (shouldResetDailyCaps(lastDailyCapReset)) {
        dailyCoinsEarned = 0;
        dailyXPEarned = 0;
        dailyReactionXP = 0;
        lastDailyCapReset = Timestamp.now();
      }

      const isFirstPostToday = action === 'post_vibe' && userData.lastPostDate && shouldResetDailyCaps(userData.lastPostDate);

      const reward = calculateReward(action as RewardAction, {
        ...metadata,
        isFirstPostToday,
        userTier: currentTier,
        currentDailyCoins: dailyCoinsEarned,
        currentDailyXP: dailyXPEarned,
        currentDailyReactionXP: action === 'react_vibe' ? dailyReactionXP : 0,
      });

      if (reward.blocked) {
        throw new Error(reward.blockReason || 'Reward blocked');
      }

      const newXP = currentXP + reward.xp;
      const newCoins = currentCoins + reward.coins;
      const newGems = currentGems + reward.gems;
      const newLevel = calculateLevel(newXP);
      const newTier = calculateTier(newXP, newLevel);
      const leveledUp = newLevel > currentLevel;
      const tierChanged = newTier !== currentTier;

      dailyCoinsEarned += reward.coins;
      dailyXPEarned += reward.xp;
      if (action === 'react_vibe') {
        dailyReactionXP += reward.xp;
      }

      let dailyMissions = userData.dailyMissions || [];
      let weeklyMissions = userData.weeklyMissions || [];
      let lastDailyMissionReset = userData.lastDailyMissionReset;
      let lastWeeklyMissionReset = userData.lastWeeklyMissionReset;

      if (shouldResetDailyMissions(lastDailyMissionReset)) {
        dailyMissions = generateDailyMissions();
        lastDailyMissionReset = Timestamp.now();
      }

      if (shouldResetWeeklyMissions(lastWeeklyMissionReset)) {
        weeklyMissions = generateWeeklyMissions();
        lastWeeklyMissionReset = Timestamp.now();
      }

      dailyMissions = incrementMissionProgress(dailyMissions, action, metadata.incrementBy || 1);
      weeklyMissions = incrementMissionProgress(weeklyMissions, action, metadata.incrementBy || 1);

      const today = new Date().toISOString().split('T')[0];
      const dailyStatsRef = db.collection('daily-stats').doc(`${userId}_${today}`);
      const dailyStatsDoc = await transaction.get(dailyStatsRef);

      if (dailyStatsDoc.exists) {
        transaction.update(dailyStatsRef, {
          coinsEarned: FieldValue.increment(reward.coins),
          xpEarned: FieldValue.increment(reward.xp),
        });
      } else {
        transaction.set(dailyStatsRef, {
          userId,
          date: today,
          coinsEarned: reward.coins,
          xpEarned: reward.xp,
          vibesPosted: action === 'post_vibe' ? 1 : 0,
          reactionsGiven: action === 'react_vibe' ? 1 : 0,
          commentsGiven: action === 'helpful_comment' ? 1 : 0,
        });
      }

      const cohortMediansSnapshot = await db
        .collection('daily-stats')
        .where('date', '==', today)
        .limit(100)
        .get();

      let medianDailyCoins = 0;
      let medianDailyXP = 0;

      if (!cohortMediansSnapshot.empty) {
        const coins = cohortMediansSnapshot.docs.map(d => d.data().coinsEarned || 0);
        const xp = cohortMediansSnapshot.docs.map(d => d.data().xpEarned || 0);
        medianDailyCoins = median(coins);
        medianDailyXP = median(xp);
      }

      const anomalyCheck = detectAnomalousEarning(
        dailyCoinsEarned + reward.coins,
        dailyXPEarned + reward.xp,
        medianDailyCoins,
        medianDailyXP
      );

      let reviewStatus: 'pending' | 'approved' | 'flagged' | 'rolled_back' = 'approved';
      let newFraudFlags = fraudFlags;

      if (anomalyCheck.isFraudulent) {
        newFraudFlags += 1;
        reviewStatus = 'flagged';

        transaction.set(db.collection('fraud-checks').doc(), {
          userId,
          checkType: 'anomaly',
          timestamp: Timestamp.now(),
          flagReason: anomalyCheck.reason || 'Anomalous earning detected',
          severity: anomalyCheck.severity,
          autoResolved: false,
          manualReview: anomalyCheck.severity === 'critical' || anomalyCheck.severity === 'high',
          metadata: {
            dailyCoins: dailyCoinsEarned + reward.coins,
            dailyXP: dailyXPEarned + reward.xp,
            medianCoins: medianDailyCoins,
            medianXP: medianDailyXP,
          },
        });

        if (shouldTriggerManualReview(newFraudFlags, anomalyCheck.severity)) {
          const sanction = calculateSanction(newFraudFlags, anomalyCheck.severity, fraudFlags > 5);
          transaction.update(userRef, {
            accountStatus: sanction.action === 'ban' ? 'banned' : 
                          sanction.action === 'suspension' ? 'suspended' : 
                          'under_review',
          });

          if (sanction.action === 'rollback' || sanction.action === 'suspension' || sanction.action === 'ban') {
            throw new Error(sanction.message);
          }
        }
      }

      const newBadges: string[] = [];
      if (tierChanged) {
        const tierBadges: Record<string, string> = {
          silver: 'silver_tier',
          gold: 'gold_tier_creator',
          platinum: 'platinum_elite',
          legend: 'legend_status',
        };
        if (tierBadges[newTier]) {
          newBadges.push(tierBadges[newTier]);
        }
      }

      transaction.update(userRef, {
        xp: newXP,
        coins: newCoins,
        gems: newGems,
        level: newLevel,
        tier: newTier,
        dailyCoinsEarned,
        dailyXPEarned,
        dailyReactionXP,
        lastDailyCapReset,
        dailyMissions,
        weeklyMissions,
        lastDailyMissionReset,
        lastWeeklyMissionReset,
        deviceFingerprint,
        lastIpAddress: clientIp,
        fraudFlags: newFraudFlags,
        ...(action === 'post_vibe' && { lastPostDate: Timestamp.now() }),
        ...(newBadges.length > 0 && {
          badges: FieldValue.arrayUnion(
            ...newBadges.map(id => ({
              id,
              earnedAt: Timestamp.now(),
              category: 'achievement',
              rarity: 'epic',
            }))
          ),
        }),
      });

      const transactionDoc = {
        userId,
        type: 'earn' as const,
        action,
        xpChange: reward.xp,
        coinsChange: reward.coins,
        gemsChange: reward.gems,
        timestamp: Timestamp.now(),
        metadata,
        ...(idempotencyKey && { idempotencyKey }),
        deviceFingerprint,
        ipAddress: clientIp,
        reviewStatus,
        isFraudulent: anomalyCheck.isFraudulent,
      };

      transaction.set(db.collection('reward-transactions').doc(), transactionDoc);

      return {
        xpGained: reward.xp,
        coinsGained: reward.coins,
        gemsGained: reward.gems,
        newXP,
        newCoins,
        newGems,
        newLevel,
        newTier,
        leveledUp,
        tierChanged,
        newBadges,
        missionsCompleted: [
          ...dailyMissions.filter((m: Mission) => m.isCompleted && !m.claimed),
          ...weeklyMissions.filter((m: Mission) => m.isCompleted && !m.claimed),
        ],
      };
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error('Error awarding rewards:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

function median(arr: number[]): number {
  if (arr.length === 0) return 0;
  const sorted = arr.slice().sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}
