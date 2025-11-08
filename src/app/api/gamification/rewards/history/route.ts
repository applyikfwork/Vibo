import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';

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

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const type = searchParams.get('type');
    const action = searchParams.get('action');
    const startAfter = searchParams.get('startAfter');

    const db = admin.firestore();
    let query = db
      .collection('reward-transactions')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc');

    if (type && (type === 'earn' || type === 'spend')) {
      query = query.where('type', '==', type);
    }

    if (action) {
      query = query.where('action', '==', action);
    }

    if (startAfter) {
      const startAfterDoc = await db
        .collection('reward-transactions')
        .doc(startAfter)
        .get();
      if (startAfterDoc.exists) {
        query = query.startAfter(startAfterDoc);
      }
    }

    query = query.limit(Math.min(limit, 100));

    const snapshot = await query.get();
    const transactions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate().toISOString()
    }));

    const totalEarnedSnapshot = await db
      .collection('reward-transactions')
      .where('userId', '==', userId)
      .where('type', '==', 'earn')
      .select('xpChange', 'coinsChange')
      .get();

    const totalSpentSnapshot = await db
      .collection('reward-transactions')
      .where('userId', '==', userId)
      .where('type', '==', 'spend')
      .select('coinsChange')
      .get();

    let totalXPEarned = 0;
    let totalCoinsEarned = 0;
    totalEarnedSnapshot.forEach(doc => {
      const data = doc.data();
      totalXPEarned += data.xpChange || 0;
      totalCoinsEarned += data.coinsChange || 0;
    });

    let totalCoinsSpent = 0;
    totalSpentSnapshot.forEach(doc => {
      const data = doc.data();
      totalCoinsSpent += Math.abs(data.coinsChange || 0);
    });

    return NextResponse.json({
      transactions,
      pagination: {
        hasMore: snapshot.size === limit,
        lastDocId: snapshot.docs[snapshot.docs.length - 1]?.id
      },
      summary: {
        totalXPEarned,
        totalCoinsEarned,
        totalCoinsSpent,
        netCoins: totalCoinsEarned - totalCoinsSpent,
        transactionCount: transactions.length
      }
    });

  } catch (error: any) {
    console.error('Error fetching reward history:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch reward history' },
      { status: 500 }
    );
  }
}
