import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';
import { STORE_ITEMS_CATALOG } from '@/lib/rewards/constants';

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
    const { itemId, currency = 'coins' } = body as { 
      itemId: string; 
      currency?: 'coins' | 'gems';
    };

    if (!itemId) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }

    const db = admin.firestore();

    let storeItem: any = null;
    for (const category of Object.values(STORE_ITEMS_CATALOG)) {
      const item = category.find((i: any) => i.id === itemId);
      if (item) {
        storeItem = item;
        break;
      }
    }

    if (!storeItem) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    if (storeItem.currency === 'gems' && currency !== 'gems') {
      return NextResponse.json({ error: 'This item requires gems' }, { status: 400 });
    }

    const price = currency === 'gems' ? storeItem.gemPrice : storeItem.price;
    if (!price) {
      return NextResponse.json({ error: 'Item not available for this currency' }, { status: 400 });
    }

    const result = await db.runTransaction(async (transaction) => {
      const userRef = db.collection('users').doc(userId);
      const userDoc = await transaction.get(userRef);

      if (!userDoc.exists) {
        throw new Error('User not found');
      }

      const userData = userDoc.data()!;
      const currentCoins = userData.coins || 0;
      const currentGems = userData.gems || 0;

      if (currency === 'gems') {
        if (currentGems < price) {
          throw new Error('Insufficient gems');
        }
      } else {
        if (currentCoins < price) {
          throw new Error('Insufficient coins');
        }
      }

      const newCoins = currency === 'coins' ? currentCoins - price : currentCoins;
      const newGems = currency === 'gems' ? currentGems - price : currentGems;

      const updates: any = {
        coins: newCoins,
        gems: newGems,
      };

      if (storeItem.type === 'boost') {
        const activeBoosts = userData.activeBoosts || [];
        activeBoosts.push({
          itemId: storeItem.id,
          expiresAt: Timestamp.fromMillis(Date.now() + (storeItem.effectDuration * 1000)),
        });
        updates.activeBoosts = activeBoosts;
      } else if (storeItem.type === 'profile_frame') {
        updates.profileFrame = storeItem.id;
      } else if (storeItem.type === 'cosmetic') {
        updates.activeCosmetics = admin.firestore.FieldValue.arrayUnion(storeItem.id);
      } else {
        const inventory = userData.inventory || [];
        const existingItem = inventory.find((i: any) => i.itemId === itemId);
        if (existingItem) {
          existingItem.quantity += 1;
          updates.inventory = inventory;
        } else {
          updates.inventory = admin.firestore.FieldValue.arrayUnion({
            id: `${itemId}_${Date.now()}`,
            itemId: storeItem.id,
            name: storeItem.name,
            type: storeItem.type,
            quantity: 1,
            acquiredAt: Timestamp.now(),
            rarity: storeItem.rarity,
          });
        }
      }

      transaction.update(userRef, updates);

      transaction.set(db.collection('reward-transactions').doc(), {
        userId,
        type: 'spend',
        action: `purchase_${storeItem.type}`,
        coinsChange: currency === 'coins' ? -price : 0,
        gemsChange: currency === 'gems' ? -price : 0,
        timestamp: Timestamp.now(),
        metadata: {
          itemId: storeItem.id,
          itemName: storeItem.name,
          currency,
        },
        reviewStatus: 'approved',
      });

      return {
        newCoins,
        newGems,
        purchasedItem: storeItem.name,
      };
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error('Error purchasing item:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
