import { NextRequest, NextResponse } from 'next/server';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { getFirebaseAdmin } from '@/firebase/admin';
import { calculateLevel, COIN_REWARDS } from '@/lib/gamification';

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

    const { missionId, missionType } = await req.json();

    if (!missionId || !missionType) {
      return NextResponse.json(
        { error: 'Mission ID and type are required' },
        { status: 400 }
      );
    }

    const db = admin.firestore();
    const userRef = db.collection('users').doc(userId);

    const result = await db.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);

      if (!userDoc.exists) {
        throw new Error('User not found');
      }

      const userData = userDoc.data();
      const missionField = `${missionType}Missions`;
      const missions = userData?.[missionField] || [];

      const mission = missions.find((m: any) => m.id === missionId);

      if (!mission) {
        throw new Error('Mission not found');
      }

      if (!mission.isCompleted) {
        throw new Error('Mission not completed yet');
      }

      if (mission.claimed) {
        throw new Error('Reward already claimed');
      }

      const currentXP = userData?.xp || 0;
      const currentCoins = userData?.coins || 0;
      const currentLevel = userData?.level || 1;

      const xpGain = mission.reward?.xp || 0;
      const coinGain = mission.reward?.coins || 0;

      const newXP = currentXP + xpGain;
      const newLevel = calculateLevel(newXP);

      let leveledUp = false;
      let levelUpBonus = 0;
      
      if (newLevel > currentLevel) {
        leveledUp = true;
        const levelsGained = newLevel - currentLevel;
        levelUpBonus = COIN_REWARDS.LEVEL_UP * levelsGained;
      }

      const newCoins = currentCoins + coinGain + levelUpBonus;

      const updatedMissions = missions.map((m: any) => {
        if (m.id === missionId) {
          return {
            ...m,
            claimed: true,
            claimedAt: Timestamp.now()
          };
        }
        return m;
      });

      transaction.update(userRef, {
        [missionField]: updatedMissions,
        xp: FieldValue.increment(xpGain),
        coins: FieldValue.increment(newCoins - currentCoins),
        level: newLevel
      });

      const transactionRef = db.collection('reward-transactions').doc();
      transaction.set(transactionRef, {
        userId,
        type: 'earn',
        action: `CLAIM_${missionType.toUpperCase()}_MISSION`,
        xpChange: xpGain,
        coinsChange: newCoins - currentCoins,
        timestamp: Timestamp.now(),
        metadata: {
          missionId,
          missionTitle: mission.title,
          missionType
        }
      });

      return {
        xpGain,
        coinGain: newCoins - currentCoins,
        newXP,
        newCoins,
        newLevel,
        leveledUp,
        previousLevel: currentLevel
      };
    });

    return NextResponse.json({
      success: true,
      rewards: {
        xp: result.xpGain,
        coins: result.coinGain,
        totalXP: result.newXP,
        totalCoins: result.newCoins,
        level: result.newLevel,
        leveledUp: result.leveledUp
      }
    });

  } catch (error: any) {
    console.error('Error claiming mission reward:', error);

    if (error.message === 'Mission not found') {
      return NextResponse.json({ error: 'Mission not found' }, { status: 404 });
    }

    if (error.message === 'Mission not completed yet') {
      return NextResponse.json(
        { error: 'Complete the mission first before claiming the reward' },
        { status: 400 }
      );
    }

    if (error.message === 'Reward already claimed') {
      return NextResponse.json(
        { error: 'You have already claimed this reward' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
