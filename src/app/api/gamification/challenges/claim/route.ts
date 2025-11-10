import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/firebase/admin';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';

/**
 * POST /api/gamification/challenges/claim
 * Claim rewards for a completed challenge
 */
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
    const { challengeId } = body;

    if (!challengeId) {
      return NextResponse.json(
        { error: 'Challenge ID is required' },
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

      const userData = userDoc.data()!;
      const activeChallenges = userData.activeChallenges || [];

      const challenge = activeChallenges.find((c: any) => c.id === challengeId);

      if (!challenge) {
        throw new Error('Challenge not found');
      }

      if (challenge.status !== 'completed') {
        throw new Error('Challenge is not completed');
      }

      // Award rewards
      const currentXP = userData.xp || 0;
      const currentCoins = userData.coins || 0;
      const currentGems = userData.gems || 0;

      const newXP = currentXP + challenge.reward.xp;
      const newCoins = currentCoins + challenge.reward.coins;
      const newGems = currentGems + (challenge.reward.gems || 0);

      // Update challenge status to claimed
      const updatedChallenges = activeChallenges.map((c: any) => {
        if (c.id === challengeId) {
          return {
            ...c,
            status: 'claimed',
            claimedAt: Timestamp.now(),
          };
        }
        return c;
      });

      const updateData: any = {
        xp: newXP,
        coins: newCoins,
        gems: newGems,
        activeChallenges: updatedChallenges,
      };

      // Add badges if any
      if (challenge.reward.badges && challenge.reward.badges.length > 0) {
        updateData.badges = FieldValue.arrayUnion(
          ...challenge.reward.badges.map((id: string) => ({
            id,
            earnedAt: Timestamp.now(),
            category: 'challenge',
            rarity: 'rare',
          }))
        );
      }

      // Track challenge completion
      const recentCompletions = userData.recentChallengeCompletions || [];
      recentCompletions.unshift({
        archetype: challenge.archetype,
        completedAt: Timestamp.now(),
      });

      // Keep only last 20 completions
      updateData.recentChallengeCompletions = recentCompletions.slice(0, 20);

      // Update completion rate
      const totalAssigned = (userData.totalChallengesAssigned || 0) + 1;
      const totalCompleted = (userData.totalChallengesCompleted || 0) + 1;
      updateData.totalChallengesAssigned = totalAssigned;
      updateData.totalChallengesCompleted = totalCompleted;
      updateData.challengeCompletionRate = totalCompleted / totalAssigned;

      transaction.update(userRef, updateData);

      // Log transaction
      const transactionRef = db.collection('reward-transactions').doc();
      transaction.set(transactionRef, {
        userId,
        type: 'earn',
        action: 'complete_challenge',
        xpChange: challenge.reward.xp,
        coinsChange: challenge.reward.coins,
        gemsChange: challenge.reward.gems || 0,
        timestamp: Timestamp.now(),
        metadata: {
          challengeId,
          challengeArchetype: challenge.archetype,
          challengeTitle: challenge.title,
        },
        reviewStatus: 'approved',
        isFraudulent: false,
      });

      return {
        xpGained: challenge.reward.xp,
        coinsGained: challenge.reward.coins,
        gemsGained: challenge.reward.gems || 0,
        badgesEarned: challenge.reward.badges || [],
        newXP,
        newCoins,
        newGems,
      };
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error('Error claiming challenge reward:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
