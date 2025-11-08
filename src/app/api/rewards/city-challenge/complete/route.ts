import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/firebase/admin';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const admin = await getFirebaseAdmin();
    const decodedToken = await admin.auth().verifyIdToken(token);
    const adminUserId = decodedToken.uid;

    const body = await req.json();
    const { challengeId } = body as { challengeId: string };

    if (!challengeId) {
      return NextResponse.json({ error: 'Challenge ID is required' }, { status: 400 });
    }

    const db = admin.firestore();

    const result = await db.runTransaction(async (transaction) => {
      const challengeRef = db.collection('city-challenges').doc(challengeId);
      const challengeDoc = await transaction.get(challengeRef);

      if (!challengeDoc.exists) {
        throw new Error('Challenge not found');
      }

      const challengeData = challengeDoc.data()!;

      if (!challengeData.isActive) {
        throw new Error('Challenge is not active');
      }

      if (challengeData.current < challengeData.goal) {
        throw new Error('Challenge goal not yet reached');
      }

      if (challengeData.rewardsDistributed) {
        throw new Error('Rewards already distributed');
      }

      const contributors = challengeData.contributors || [];
      const contributorUserIds = contributors.map((c: any) => c.userId);

      const rewardXP = challengeData.reward.xp || 50;
      const rewardCoins = challengeData.reward.coins || 0;
      const rewardBadge = challengeData.reward.badge;

      const updates: any[] = [];

      for (const userId of contributorUserIds) {
        const userRef = db.collection('users').doc(userId);
        const userDoc = await transaction.get(userRef);

        if (!userDoc.exists) continue;

        const userData = userDoc.data()!;
        const newXP = (userData.xp || 0) + rewardXP;
        const newCoins = (userData.coins || 0) + rewardCoins;

        const userUpdate: any = {
          xp: newXP,
          coins: newCoins,
        };

        if (rewardBadge) {
          userUpdate.badges = FieldValue.arrayUnion({
            id: rewardBadge,
            earnedAt: Timestamp.now(),
            category: 'city',
            rarity: 'epic',
            meta: {
              reason: `Contributed to city challenge: ${challengeData.title}`,
              cityName: challengeData.city,
              date: new Date().toISOString(),
            },
          });
        }

        transaction.update(userRef, userUpdate);

        transaction.set(db.collection('reward-transactions').doc(), {
          userId,
          type: 'earn',
          action: 'city_challenge_completion',
          xpChange: rewardXP,
          coinsChange: rewardCoins,
          timestamp: Timestamp.now(),
          metadata: {
            challengeId,
            challengeTitle: challengeData.title,
            city: challengeData.city,
          },
          reviewStatus: 'approved',
        });

        updates.push({
          userId,
          xpGained: rewardXP,
          coinsGained: rewardCoins,
          badgeEarned: rewardBadge,
        });
      }

      transaction.update(challengeRef, {
        completedAt: Timestamp.now(),
        rewardsDistributed: true,
        isActive: false,
      });

      return {
        contributorCount: contributorUserIds.length,
        totalXPDistributed: rewardXP * contributorUserIds.length,
        totalCoinsDistributed: rewardCoins * contributorUserIds.length,
        updates,
      };
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error('Error completing city challenge:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
