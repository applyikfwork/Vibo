import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';
import {
  RewardAction,
  calculateReward,
  calculateLevel,
  calculateTier,
  shouldResetDailyCaps,
  checkVelocityLimit,
} from '@/lib/rewards/reward-engine';
import { incrementMissionProgress, shouldResetDailyMissions, shouldResetWeeklyMissions, generateDailyMissions, generateWeeklyMissions } from '@/lib/rewards/missions-service';

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
      const currentXP = userData.xp || 0;
      const currentCoins = userData.coins || 0;
      const currentGems = userData.gems || 0;
      const currentLevel = userData.level || 1;
      const currentTier = userData.tier || 'bronze';

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
        ...(action === 'post_vibe' && { lastPostDate: Timestamp.now() }),
        ...(newBadges.length > 0 && {
          badges: admin.firestore.FieldValue.arrayUnion(
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
        type: 'earn',
        action,
        xpChange: reward.xp,
        coinsChange: reward.coins,
        gemsChange: reward.gems,
        timestamp: Timestamp.now(),
        metadata,
        ...(idempotencyKey && { idempotencyKey }),
        deviceFingerprint: metadata.deviceFingerprint,
        reviewStatus: 'approved',
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
          ...dailyMissions.filter(m => m.isCompleted && !m.claimed),
          ...weeklyMissions.filter(m => m.isCompleted && !m.claimed),
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
