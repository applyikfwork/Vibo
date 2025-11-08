
import { NextRequest, NextResponse } from 'next/server';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { getFirebaseAdmin } from '@/firebase/admin';
import { 
  calculateLevel, 
  XP_REWARDS, 
  COIN_REWARDS, 
  getNewlyEarnedBadges,
  BADGE_DEFINITIONS 
} from '@/lib/gamification';

interface RewardMetadata extends Record<string, any> {
  vibeId?: string;
  targetUserId?: string;
  commentId?: string;
  idempotencyKey?: string;
}

const VALID_ACTIONS = [
  'POST_VIBE',
  'REACT_TO_VIBE',
  'HELPFUL_COMMENT',
  'VOICE_NOTE',
  'RECEIVE_HELPFUL_VOTE',
  'COMPLETE_DAILY_CHALLENGE',
  'COMPLETE_WEEKLY_CHALLENGE',
  'JOIN_COMMUNITY_HUB',
  'PARTICIPATE_IN_EVENT'
] as const;

type RewardAction = typeof VALID_ACTIONS[number];

const RATE_LIMITS: Record<string, { count: number; windowMs: number }> = {
  POST_VIBE: { count: 50, windowMs: 3600000 },
  REACT_TO_VIBE: { count: 100, windowMs: 3600000 },
  HELPFUL_COMMENT: { count: 60, windowMs: 3600000 },
  VOICE_NOTE: { count: 30, windowMs: 3600000 },
};

async function checkRateLimit(
  db: FirebaseFirestore.Firestore,
  userId: string,
  action: string
): Promise<boolean> {
  const limit = RATE_LIMITS[action];
  if (!limit) return true;

  const now = Date.now();
  const windowStart = now - limit.windowMs;

  const recentTransactions = await db
    .collection('reward-transactions')
    .where('userId', '==', userId)
    .where('action', '==', action)
    .where('timestamp', '>', Timestamp.fromMillis(windowStart))
    .get();

  return recentTransactions.size < limit.count;
}

function getIdempotencyDocId(userId: string, idempotencyKey: string): string {
  return `${userId}_${idempotencyKey}`;
}

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
    const { action, metadata = {} } = body as { action: string; metadata?: RewardMetadata };

    if (!action || !VALID_ACTIONS.includes(action as RewardAction)) {
      return NextResponse.json(
        { error: 'Invalid or missing action' },
        { status: 400 }
      );
    }

    const db = admin.firestore();

    const withinRateLimit = await checkRateLimit(db, userId, action);
    if (!withinRateLimit) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          message: 'You are performing this action too frequently. Please try again later.'
        },
        { status: 429 }
      );
    }

    let idempotencyDocId: string | null = null;
    if (metadata.idempotencyKey) {
      idempotencyDocId = getIdempotencyDocId(userId, metadata.idempotencyKey);
    }

    const result = await db.runTransaction(async (transaction) => {
      const userRef = db.collection('users').doc(userId);
      
      if (idempotencyDocId) {
        const idempotencyRef = db.collection('reward-transactions').doc(idempotencyDocId);
        const idempotencyDoc = await transaction.get(idempotencyRef);
        
        if (idempotencyDoc.exists) {
          const existingData = idempotencyDoc.data();
          const userDoc = await transaction.get(userRef);
          const userData = userDoc.data();
          
          return {
            xpGain: existingData?.xpChange || 0,
            coinGain: existingData?.coinsChange || 0,
            newXP: userData?.xp || 0,
            newCoins: userData?.coins || 0,
            newLevel: userData?.level || 1,
            leveledUp: false,
            newBadges: [],
            isDuplicate: true
          };
        }
      }
      
      const userDoc = await transaction.get(userRef);

      if (!userDoc.exists) {
        throw new Error('User not found');
      }

      const userData = userDoc.data();
      const currentXP = userData?.xp || 0;
      const currentCoins = userData?.coins || 0;
      const currentLevel = calculateLevel(currentXP);

      let xpGain = 0;
      let coinGain = 0;
      let additionalUpdates: Record<string, any> = {};

      switch (action) {
        case 'POST_VIBE':
          xpGain = XP_REWARDS.POST_VIBE;
          coinGain = COIN_REWARDS.POST_VIBE;
          
          const lastPostDate = userData?.lastPostDate;
          const isFirstPostToday = !lastPostDate || 
            new Date(lastPostDate.toDate()).toDateString() !== new Date().toDateString();
          
          if (isFirstPostToday) {
            xpGain += XP_REWARDS.FIRST_POST_OF_DAY;
          }

          const postingStreak = userData?.postingStreak || 0;
          if (postingStreak >= 7) {
            xpGain += XP_REWARDS.POSTING_STREAK_BONUS;
            if (postingStreak === 7) {
              coinGain += COIN_REWARDS.POSTING_STREAK_7_DAYS;
            }
          }

          additionalUpdates.totalVibesPosted = FieldValue.increment(1);
          additionalUpdates.lastPostDate = Timestamp.now();
          break;

        case 'REACT_TO_VIBE':
          xpGain = XP_REWARDS.REACT_TO_VIBE;
          additionalUpdates.totalReactionsGiven = FieldValue.increment(1);
          break;

        case 'HELPFUL_COMMENT':
          xpGain = XP_REWARDS.HELPFUL_COMMENT;
          additionalUpdates.totalCommentsGiven = FieldValue.increment(1);
          break;

        case 'VOICE_NOTE':
          xpGain = XP_REWARDS.VOICE_NOTE;
          coinGain = COIN_REWARDS.POST_VIBE;
          additionalUpdates.totalVibesPosted = FieldValue.increment(1);
          additionalUpdates.lastPostDate = Timestamp.now();
          break;

        case 'RECEIVE_HELPFUL_VOTE':
          xpGain = XP_REWARDS.RECEIVE_HELPFUL_VOTE;
          coinGain = COIN_REWARDS.RECEIVE_HELPFUL_VOTE;
          additionalUpdates.helpfulCommentsReceived = FieldValue.increment(1);
          break;

        case 'COMPLETE_DAILY_CHALLENGE':
          xpGain = XP_REWARDS.COMPLETE_DAILY_CHALLENGE;
          coinGain = COIN_REWARDS.COMPLETE_DAILY_CHALLENGE;
          break;

        case 'COMPLETE_WEEKLY_CHALLENGE':
          xpGain = XP_REWARDS.COMPLETE_WEEKLY_CHALLENGE;
          coinGain = COIN_REWARDS.COMPLETE_WEEKLY_CHALLENGE;
          break;

        case 'JOIN_COMMUNITY_HUB':
          xpGain = XP_REWARDS.JOIN_COMMUNITY_HUB;
          break;

        case 'PARTICIPATE_IN_EVENT':
          xpGain = XP_REWARDS.PARTICIPATE_IN_EVENT;
          break;
      }

      const newXP = currentXP + xpGain;
      const newLevel = calculateLevel(newXP);
      let leveledUp = false;
      let levelUpBonus = 0;

      if (newLevel > currentLevel) {
        leveledUp = true;
        levelUpBonus = COIN_REWARDS.LEVEL_UP * (newLevel - currentLevel);
      }

      const totalCoinGain = coinGain + levelUpBonus;
      const newCoins = currentCoins + totalCoinGain;

      const projectedUserData = {
        ...userData,
        xp: newXP,
        level: newLevel,
        totalVibesPosted: (userData?.totalVibesPosted || 0) + (action === 'POST_VIBE' || action === 'VOICE_NOTE' ? 1 : 0),
        totalCommentsGiven: (userData?.totalCommentsGiven || 0) + (action === 'HELPFUL_COMMENT' ? 1 : 0),
        totalReactionsGiven: (userData?.totalReactionsGiven || 0) + (action === 'REACT_TO_VIBE' ? 1 : 0),
        helpfulCommentsReceived: (userData?.helpfulCommentsReceived || 0) + (action === 'RECEIVE_HELPFUL_VOTE' ? 1 : 0),
        postingStreak: userData?.postingStreak || 0,
        helpfulCommentsGiven: userData?.helpfulCommentsGiven || 0,
        joinedHubs: userData?.joinedHubs || [],
        badges: userData?.badges || []
      };

      const earnedBadges = getNewlyEarnedBadges({
        totalVibesPosted: projectedUserData.totalVibesPosted,
        totalCommentsGiven: projectedUserData.totalCommentsGiven,
        postingStreak: projectedUserData.postingStreak,
        helpfulCommentsGiven: projectedUserData.helpfulCommentsGiven,
        joinedHubs: projectedUserData.joinedHubs,
        badges: projectedUserData.badges,
        level: newLevel,
        xp: newXP
      });

      const newBadges = earnedBadges.map(badge => ({
        ...badge,
        earnedAt: Timestamp.now()
      }));

      const userUpdates: Record<string, any> = {
        xp: FieldValue.increment(xpGain),
        coins: FieldValue.increment(totalCoinGain),
        level: newLevel,
        ...additionalUpdates
      };

      if (newBadges.length > 0) {
        userUpdates.badges = FieldValue.arrayUnion(...newBadges);
      }

      transaction.update(userRef, userUpdates);

      const transactionRef = idempotencyDocId 
        ? db.collection('reward-transactions').doc(idempotencyDocId)
        : db.collection('reward-transactions').doc();
        
      transaction.set(transactionRef, {
        userId,
        type: 'earn',
        action,
        xpChange: xpGain,
        coinsChange: totalCoinGain,
        timestamp: Timestamp.now(),
        metadata: {
          ...metadata,
          levelUpBonus,
          earnedBadgeIds: newBadges.map(b => b.id)
        }
      });

      return {
        xpGain,
        coinGain: totalCoinGain,
        newXP,
        newCoins,
        newLevel,
        leveledUp,
        newBadges,
        isDuplicate: false
      };
    });

    return NextResponse.json({
      success: true,
      duplicate: result.isDuplicate || false,
      rewards: {
        xp: result.xpGain,
        coins: result.coinGain,
        totalXP: result.newXP,
        totalCoins: result.newCoins,
        level: result.newLevel,
        leveledUp: result.leveledUp,
        newBadges: result.newBadges.map((b: any) => ({
          id: b.id,
          name: b.name,
          icon: b.icon,
          rarity: b.rarity
        }))
      }
    });

  } catch (error: any) {
    console.error('Error awarding rewards:', error);
    
    if (error.message === 'User not found') {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(
      { 
        error: error.message || 'Failed to award rewards',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const admin = await getFirebaseAdmin();
    const decodedToken = await admin.auth().verifyIdToken(token);
    const userId = decodedToken.uid;

    const db = admin.firestore();
    const userDoc = await db.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data();
    const xp = userData?.xp || 0;
    const level = calculateLevel(xp);

    return NextResponse.json({
      xp,
      coins: userData?.coins || 0,
      level,
      badges: userData?.badges || [],
      totalVibesPosted: userData?.totalVibesPosted || 0,
      totalReactionsGiven: userData?.totalReactionsGiven || 0,
      totalCommentsGiven: userData?.totalCommentsGiven || 0,
      postingStreak: userData?.postingStreak || 0,
      helpfulCommentsReceived: userData?.helpfulCommentsReceived || 0,
      joinedHubs: userData?.joinedHubs || []
    });

  } catch (error: any) {
    console.error('Error fetching rewards:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
