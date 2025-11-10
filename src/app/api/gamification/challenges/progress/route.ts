import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';

/**
 * POST /api/gamification/challenges/progress
 * Update challenge progress
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
    const { challengeId, incrementBy = 1, metadata = {} } = body;

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

      let challengeUpdated = false;
      let completedChallenge = null;

      const updatedChallenges = activeChallenges.map((challenge: any) => {
        if (challenge.id === challengeId && challenge.status === 'active') {
          challengeUpdated = true;

          const newCurrent = Math.min(
            challenge.current + incrementBy,
            challenge.target
          );

          // Check if completed
          if (newCurrent >= challenge.target) {
            completedChallenge = {
              ...challenge,
              current: newCurrent,
              status: 'completed',
              completedAt: Timestamp.now(),
            };
            return completedChallenge;
          }

          return {
            ...challenge,
            current: newCurrent,
          };
        }
        return challenge;
      });

      if (!challengeUpdated) {
        throw new Error('Challenge not found or already completed');
      }

      transaction.update(userRef, {
        activeChallenges: updatedChallenges,
      });

      // If completed, log to challenge history
      if (completedChallenge) {
        const historyRef = db
          .collection('challenge-history')
          .doc(`${userId}_${challengeId}`);

        transaction.set(historyRef, {
          userId,
          challengeId,
          archetype: completedChallenge.archetype,
          completedAt: Timestamp.now(),
          reward: completedChallenge.reward,
          metadata,
        });
      }

      return {
        challenge: updatedChallenges.find((c: any) => c.id === challengeId),
        completed: !!completedChallenge,
      };
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error('Error updating challenge progress:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
