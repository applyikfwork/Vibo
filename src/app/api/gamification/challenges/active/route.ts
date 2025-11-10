import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';
import { assignChallengesToUser, buildUserSignals } from '@/lib/challenges/orchestrator';

/**
 * GET /api/gamification/challenges/active
 * Fetch active challenges for the authenticated user
 */
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
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data()!;
    const activeChallenges = userData.activeChallenges || [];

    // Filter out expired challenges
    const now = Timestamp.now();
    const validChallenges = activeChallenges.filter(
      (challenge: any) => challenge.expiresAt.toMillis() > now.toMillis()
    );

    // If challenges have expired, update user doc
    if (validChallenges.length !== activeChallenges.length) {
      await userRef.update({
        activeChallenges: validChallenges,
      });
    }

    // If user has no active challenges, generate new ones
    if (validChallenges.length === 0) {
      const userSignals = buildUserSignals(userData, userId);
      const newChallenges = await assignChallengesToUser(userId, userSignals, 5);

      await userRef.update({
        activeChallenges: newChallenges,
      });

      return NextResponse.json({
        challenges: newChallenges,
        generated: true,
      });
    }

    return NextResponse.json({
      challenges: validChallenges,
      generated: false,
    });
  } catch (error: any) {
    console.error('Error fetching active challenges:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
