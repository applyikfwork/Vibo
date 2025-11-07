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

    const { action, metadata } = await req.json();

    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 });
    }

    const db = admin.firestore();
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data();
    const currentXP = userData?.xp || 0;
    const currentCoins = userData?.coins || 0;
    const currentLevel = calculateLevel(currentXP);

    let xpGain = 0;
    let coinGain = 0;
    let newBadges: any[] = [];
    let leveledUp = false;

    switch (action) {
      case 'POST_VIBE':
        xpGain = XP_REWARDS.POST_VIBE;
        coinGain = COIN_REWARDS.POST_VIBE;
        
        const isFirstPostToday = !userData?.lastPostDate || 
          new Date(userData.lastPostDate.toDate()).toDateString() !== new Date().toDateString();
        
        if (isFirstPostToday) {
          xpGain += XP_REWARDS.FIRST_POST_OF_DAY;
        }

        const postingStreak = userData?.postingStreak || 0;
        if (postingStreak >= 7) {
          xpGain += XP_REWARDS.POSTING_STREAK_BONUS;
        }

        await userRef.update({
          totalVibesPosted: FieldValue.increment(1),
          lastPostDate: Timestamp.now()
        });
        break;

      case 'REACT_TO_VIBE':
        xpGain = XP_REWARDS.REACT_TO_VIBE;
        await userRef.update({
          totalReactionsGiven: FieldValue.increment(1)
        });
        break;

      case 'HELPFUL_COMMENT':
        xpGain = XP_REWARDS.HELPFUL_COMMENT;
        await userRef.update({
          totalCommentsGiven: FieldValue.increment(1)
        });
        break;

      case 'VOICE_NOTE':
        xpGain = XP_REWARDS.VOICE_NOTE;
        coinGain = COIN_REWARDS.POST_VIBE;
        break;

      case 'RECEIVE_HELPFUL_VOTE':
        xpGain = XP_REWARDS.RECEIVE_HELPFUL_VOTE;
        coinGain = COIN_REWARDS.RECEIVE_HELPFUL_VOTE;
        await userRef.update({
          helpfulCommentsReceived: FieldValue.increment(1)
        });
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

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const newXP = currentXP + xpGain;
    const newCoins = currentCoins + coinGain;
    const newLevel = calculateLevel(newXP);

    if (newLevel > currentLevel) {
      leveledUp = true;
      coinGain += COIN_REWARDS.LEVEL_UP;
    }

    await userRef.update({
      xp: FieldValue.increment(xpGain),
      coins: FieldValue.increment(coinGain),
      level: newLevel
    });

    const updatedUserDoc = await userRef.get();
    const updatedUserData = updatedUserDoc.data();

    const earnedBadges = getNewlyEarnedBadges({
      totalVibesPosted: updatedUserData?.totalVibesPosted,
      totalCommentsGiven: updatedUserData?.totalCommentsGiven,
      postingStreak: updatedUserData?.postingStreak,
      helpfulCommentsGiven: updatedUserData?.helpfulCommentsGiven,
      joinedHubs: updatedUserData?.joinedHubs,
      badges: updatedUserData?.badges,
      level: newLevel,
      xp: newXP
    });

    if (earnedBadges.length > 0) {
      newBadges = earnedBadges.map(badge => ({
        ...badge,
        earnedAt: Timestamp.now()
      }));

      await userRef.update({
        badges: FieldValue.arrayUnion(...newBadges)
      });
    }

    const transactionRef = db.collection('reward-transactions').doc();
    await transactionRef.set({
      userId,
      type: 'earn',
      action,
      xpChange: xpGain,
      coinsChange: coinGain,
      timestamp: Timestamp.now(),
      metadata: metadata || {}
    });

    return NextResponse.json({
      success: true,
      rewards: {
        xp: xpGain,
        coins: coinGain,
        totalXP: newXP,
        totalCoins: newCoins,
        level: newLevel,
        leveledUp,
        newBadges: newBadges.map(b => ({
          id: b.id,
          name: b.name,
          icon: b.icon,
          rarity: b.rarity
        }))
      }
    });

  } catch (error: any) {
    console.error('Error awarding rewards:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
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
      helpfulCommentsReceived: userData?.helpfulCommentsReceived || 0
    });

  } catch (error: any) {
    console.error('Error fetching rewards:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
