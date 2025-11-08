import { NextRequest, NextResponse } from 'next/server';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { getFirebaseAdmin } from '@/firebase/admin';
import { STORE_ITEMS } from '@/lib/gamification';

export async function GET(req: NextRequest) {
  try {
    return NextResponse.json({
      items: STORE_ITEMS
    });
  } catch (error: any) {
    console.error('Error fetching store items:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
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

    const { itemId, quantity = 1 } = await req.json();

    if (!itemId) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }

    const item = STORE_ITEMS.find(i => i.id === itemId);
    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    const totalCost = item.price * quantity;

    const db = admin.firestore();
    const userRef = db.collection('users').doc(userId);

    const result = await db.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);

      if (!userDoc.exists) {
        throw new Error('User not found');
      }

      const userData = userDoc.data();
      const currentCoins = userData?.coins || 0;

      if (currentCoins < totalCost) {
        throw new Error('Insufficient coins');
      }

      const inventory = userData?.inventory || [];
      const existingItemIndex = inventory.findIndex(
        (i: any) => i.itemId === itemId
      );

      const purchasedItem = {
        id: `${itemId}-${Date.now()}`,
        itemId: item.id,
        name: item.name,
        type: item.type,
        quantity,
        acquiredAt: Timestamp.now(),
        ...(item.effectDuration && {
          expiresAt: Timestamp.fromMillis(Date.now() + item.effectDuration * 1000)
        })
      };

      if (existingItemIndex !== -1) {
        inventory[existingItemIndex].quantity += quantity;
      } else {
        inventory.push(purchasedItem);
      }

      transaction.update(userRef, {
        coins: FieldValue.increment(-totalCost),
        inventory
      });

      const transactionRef = db.collection('reward-transactions').doc();
      transaction.set(transactionRef, {
        userId,
        type: 'spend',
        action: 'PURCHASE_ITEM',
        coinsChange: -totalCost,
        timestamp: Timestamp.now(),
        metadata: {
          itemId,
          itemName: item.name,
          quantity
        }
      });

      return {
        purchasedItem,
        newBalance: currentCoins - totalCost
      };
    });

    return NextResponse.json({
      success: true,
      item: result.purchasedItem,
      coinsRemaining: result.newBalance
    });

  } catch (error: any) {
    console.error('Error purchasing item:', error);
    
    if (error.message === 'Insufficient coins') {
      return NextResponse.json(
        { error: 'You do not have enough coins for this purchase' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}