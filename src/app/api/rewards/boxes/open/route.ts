import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/firebase/admin';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';
import { SURPRISE_BOXES } from '@/lib/rewards/constants';

function selectRandomReward(possibleRewards: any[]) {
  const totalRate = possibleRewards.reduce((sum, r) => sum + r.dropRate, 0);
  let random = Math.random() * totalRate;

  for (const reward of possibleRewards) {
    random -= reward.dropRate;
    if (random <= 0) {
      return reward;
    }
  }

  return possibleRewards[0];
}

function calculateRewardAmount(reward: any) {
  const range = reward.maxAmount - reward.minAmount;
  return Math.floor(Math.random() * range) + reward.minAmount;
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

    const body = await req.json();
    const { boxType = 'small' } = body as { boxType?: 'small' | 'lucky' | 'premium' };

    const boxConfig = SURPRISE_BOXES[boxType];
    if (!boxConfig) {
      return NextResponse.json({ error: 'Invalid box type' }, { status: 400 });
    }

    const db = admin.firestore();

    const today = new Date().toISOString().split('T')[0];
    const boxOpenKey = `${userId}_${boxType}_${today}`;

    const existingOpens = await db
      .collection('box-opens')
      .where('userId', '==', userId)
      .where('boxType', '==', boxType)
      .where('date', '==', today)
      .get();

    if (existingOpens.size >= (boxConfig.dailyLimit || Infinity)) {
      return NextResponse.json({
        error: 'Daily limit reached for this box type',
      }, { status: 429 });
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
      const currentXP = userData.xp || 0;

      if (boxConfig.costCurrency === 'coins' && currentCoins < boxConfig.cost) {
        throw new Error('Insufficient coins');
      }

      if (boxConfig.costCurrency === 'gems' && currentGems < boxConfig.cost) {
        throw new Error('Insufficient gems');
      }

      const selectedReward = selectRandomReward(boxConfig.possibleRewards);
      const amount = calculateRewardAmount(selectedReward);

      let newCoins = currentCoins;
      let newGems = currentGems;
      let newXP = currentXP;

      if (boxConfig.costCurrency === 'coins') {
        newCoins -= boxConfig.cost;
      } else if (boxConfig.costCurrency === 'gems') {
        newGems -= boxConfig.cost;
      }

      const updates: any = {
        coins: newCoins,
        gems: newGems,
      };

      let rewardDescription = '';

      if (selectedReward.type === 'coins') {
        newCoins += amount;
        updates.coins = newCoins;
        rewardDescription = `${amount} coins`;
      } else if (selectedReward.type === 'xp') {
        newXP += amount;
        updates.xp = newXP;
        rewardDescription = `${amount} XP`;
      } else if (selectedReward.type === 'badge') {
        updates.badges = FieldValue.arrayUnion({
          id: selectedReward.itemId,
          earnedAt: Timestamp.now(),
          category: 'achievement' as const,
          rarity: selectedReward.rarity as any,
          meta: {
            reason: `Opened ${boxConfig.name}`,
            date: new Date().toISOString(),
          },
        });
        rewardDescription = `Badge: ${selectedReward.itemId}`;
      } else if (selectedReward.type === 'item') {
        updates.inventory = FieldValue.arrayUnion({
          id: `${selectedReward.itemId}_${Date.now()}`,
          itemId: selectedReward.itemId,
          name: selectedReward.itemId,
          type: 'cosmetic' as const,
          quantity: amount,
          acquiredAt: Timestamp.now(),
          rarity: selectedReward.rarity as any,
        });
        rewardDescription = `${amount}x ${selectedReward.itemId}`;
      }

      transaction.update(userRef, updates);

      transaction.set(db.collection('box-opens').doc(), {
        userId,
        boxType,
        date: today,
        reward: {
          type: selectedReward.type,
          amount,
          rarity: selectedReward.rarity,
          itemId: selectedReward.itemId,
        },
        timestamp: Timestamp.now(),
      });

      transaction.set(db.collection('reward-transactions').doc(), {
        userId,
        type: boxConfig.costCurrency === 'free' ? 'earn' : 'spend',
        action: 'open_surprise_box',
        coinsChange: boxConfig.costCurrency === 'coins' ? -boxConfig.cost : (selectedReward.type === 'coins' ? amount : 0),
        gemsChange: boxConfig.costCurrency === 'gems' ? -boxConfig.cost : 0,
        xpChange: selectedReward.type === 'xp' ? amount : 0,
        timestamp: Timestamp.now(),
        metadata: {
          boxType,
          rewardType: selectedReward.type,
          rewardAmount: amount,
          rewardRarity: selectedReward.rarity,
        },
        reviewStatus: 'approved',
      });

      return {
        newCoins,
        newGems,
        newXP,
        reward: {
          type: selectedReward.type,
          amount,
          rarity: selectedReward.rarity,
          description: rewardDescription,
          itemId: selectedReward.itemId,
        },
      };
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error('Error opening surprise box:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
