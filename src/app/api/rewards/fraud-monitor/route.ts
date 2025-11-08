import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';
import { checkForFraud, shouldTriggerManualReview, calculateSanction } from '@/lib/rewards/fraud-detection';

export async function POST(req: NextRequest) {
  try {
    const admin = await getFirebaseAdmin();
    const db = admin.firestore();

    const usersSnapshot = await db.collection('users')
      .where('accountStatus', '==', 'active')
      .limit(100)
      .get();

    const results = [];

    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const userData = userDoc.data();

      const today = new Date().toISOString().split('T')[0];
      const recentTransactions = await db
        .collection('reward-transactions')
        .where('userId', '==', userId)
        .where('type', '==', 'earn')
        .orderBy('timestamp', 'desc')
        .limit(200)
        .get();

      const dailyStatsDoc = await db
        .collection('daily-stats')
        .doc(`${userId}_${today}`)
        .get();

      const dailyStats = dailyStatsDoc.exists ? dailyStatsDoc.data() : {
        coinsEarned: 0,
        xpEarned: 0,
      };

      const cohortMedians = await calculateCohortMedians(db);

      const fraudCheck = await checkForFraud(
        userId,
        recentTransactions.docs.map(d => d.data()),
        {
          dailyCoins: dailyStats?.coinsEarned || 0,
          dailyXP: dailyStats?.xpEarned || 0,
          deviceFingerprint: userData.deviceFingerprint,
          ipAddress: userData.lastIpAddress,
        },
        cohortMedians
      );

      if (fraudCheck) {
        await db.collection('fraud-checks').add(fraudCheck);

        const fraudFlags = (userData.fraudFlags || 0) + 1;
        const needsManualReview = shouldTriggerManualReview(fraudFlags, fraudCheck.severity);

        if (needsManualReview) {
          const sanction = calculateSanction(
            fraudFlags,
            fraudCheck.severity,
            fraudFlags > 5
          );

          await db.collection('users').doc(userId).update({
            fraudFlags,
            accountStatus: sanction.action === 'ban' ? 'banned' : 
                          sanction.action === 'suspension' ? 'suspended' : 
                          'under_review',
          });

          results.push({
            userId,
            fraudCheck,
            sanction,
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      flaggedUsers: results.length,
      results,
    });
  } catch (error: any) {
    console.error('Error running fraud monitor:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

async function calculateCohortMedians(db: any) {
  const today = new Date().toISOString().split('T')[0];
  const statsSnapshot = await db
    .collection('daily-stats')
    .where('date', '==', today)
    .get();

  const coins = statsSnapshot.docs.map((d: any) => d.data().coinsEarned || 0);
  const xp = statsSnapshot.docs.map((d: any) => d.data().xpEarned || 0);

  return {
    medianDailyCoins: median(coins),
    medianDailyXP: median(xp),
  };
}

function median(arr: number[]): number {
  if (arr.length === 0) return 0;
  const sorted = arr.slice().sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}
