import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';
import { GIFT_CONFIGS } from '@/lib/rewards/reward-engine';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const admin = await getFirebaseAdmin();
    const decodedToken = await admin.auth().verifyIdToken(token);
    const fromUserId = decodedToken.uid;

    const body = await req.json();
    const { toUserId, giftType, message } = body as { 
      toUserId: string; 
      giftType: 'rose' | 'star' | 'crown';
      message?: string;
    };

    if (!toUserId || !giftType) {
      return NextResponse.json(
        { error: 'Recipient user ID and gift type are required' },
        { status: 400 }
      );
    }

    if (fromUserId === toUserId) {
      return NextResponse.json(
        { error: 'Cannot send gift to yourself' },
        { status: 400 }
      );
    }

    const giftConfig = GIFT_CONFIGS[giftType];
    if (!giftConfig) {
      return NextResponse.json({ error: 'Invalid gift type' }, { status: 400 });
    }

    const db = admin.firestore();

    const result = await db.runTransaction(async (transaction) => {
      const fromUserRef = db.collection('users').doc(fromUserId);
      const toUserRef = db.collection('users').doc(toUserId);

      const [fromUserDoc, toUserDoc] = await Promise.all([
        transaction.get(fromUserRef),
        transaction.get(toUserRef),
      ]);

      if (!fromUserDoc.exists) {
        throw new Error('Sender not found');
      }

      if (!toUserDoc.exists) {
        throw new Error('Recipient not found');
      }

      const fromUserData = fromUserDoc.data()!;
      const toUserData = toUserDoc.data()!;

      const senderCoins = fromUserData.coins || 0;
      if (senderCoins < giftConfig.cost) {
        throw new Error('Insufficient coins to send gift');
      }

      const senderNewCoins = senderCoins - giftConfig.cost;
      const senderGiverPoints = (fromUserData.giverPoints || 0) + 1;

      const recipientCoins = toUserData.coins || 0;
      const recipientXP = toUserData.xp || 0;
      const recipientNewCoins = recipientCoins + giftConfig.recipientCoins;
      const recipientNewXP = recipientXP + giftConfig.recipientXP;

      transaction.update(fromUserRef, {
        coins: senderNewCoins,
        giverPoints: senderGiverPoints,
      });

      transaction.update(toUserRef, {
        coins: recipientNewCoins,
        xp: recipientNewXP,
      });

      const giftDoc = {
        type: giftType,
        fromUserId,
        toUserId,
        cost: giftConfig.cost,
        reward: {
          xp: giftConfig.recipientXP,
          coins: giftConfig.recipientCoins,
        },
        message,
        timestamp: Timestamp.now(),
      };

      transaction.set(db.collection('gifts').doc(), giftDoc);

      transaction.set(db.collection('reward-transactions').doc(), {
        userId: fromUserId,
        type: 'gift',
        action: 'send_gift',
        coinsChange: -giftConfig.cost,
        timestamp: Timestamp.now(),
        targetUserId: toUserId,
        metadata: {
          giftType,
          message,
        },
        reviewStatus: 'approved',
      });

      transaction.set(db.collection('reward-transactions').doc(), {
        userId: toUserId,
        type: 'receive',
        action: 'receive_gift',
        xpChange: giftConfig.recipientXP,
        coinsChange: giftConfig.recipientCoins,
        timestamp: Timestamp.now(),
        metadata: {
          giftType,
          fromUserId,
          message,
        },
        reviewStatus: 'approved',
      });

      return {
        senderNewCoins,
        senderGiverPoints,
        recipientGained: {
          xp: giftConfig.recipientXP,
          coins: giftConfig.recipientCoins,
        },
      };
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error('Error sending gift:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
