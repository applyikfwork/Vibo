import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/firebase/admin';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';
import { claimMissionReward } from '@/lib/rewards/missions-service';
import { calculateLevel, calculateTier } from '@/lib/rewards/reward-engine';
import type { Mission } from '@/lib/types';

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
    const { missionId, missionType = 'daily' } = body as { 
      missionId: string; 
      missionType?: 'daily' | 'weekly' | 'seasonal';
    };

    if (!missionId) {
      return NextResponse.json({ error: 'Mission ID is required' }, { status: 400 });
    }

    const db = admin.firestore();

    const result = await db.runTransaction(async (transaction) => {
      const userRef = db.collection('users').doc(userId);
      const userDoc = await transaction.get(userRef);

      if (!userDoc.exists) {
        throw new Error('User not found');
      }

      const userData = userDoc.data()!;
      const missionField = missionType === 'daily' ? 'dailyMissions' : 
                            missionType === 'weekly' ? 'weeklyMissions' : 
                            'seasonalMissions';
      
      const missions = userData[missionField] || [];
      const missionIndex = missions.findIndex((m: any) => m.id === missionId);

      if (missionIndex === -1) {
        throw new Error('Mission not found');
      }

      const mission = missions[missionIndex];

      if (!mission.isCompleted) {
        throw new Error('Mission not yet completed');
      }

      if (mission.claimed) {
        throw new Error('Mission reward already claimed');
      }

      const claimedMission = claimMissionReward(mission);
      missions[missionIndex] = claimedMission;

      const currentXP = userData.xp || 0;
      const currentCoins = userData.coins || 0;
      const currentGems = userData.gems || 0;

      const newXP = currentXP + mission.reward.xp;
      const newCoins = currentCoins + mission.reward.coins;
      const newGems = currentGems + (mission.reward.gems || 0);

      const currentLevel = userData.level || 1;
      const newLevel = calculateLevel(newXP);
      const newTier = calculateTier(newXP, newLevel);
      const leveledUp = newLevel > currentLevel;

      const updates: any = {
        [missionField]: missions,
        xp: newXP,
        coins: newCoins,
        gems: newGems,
        level: newLevel,
        tier: newTier,
      };

      if (mission.reward.badge) {
        updates.badges = FieldValue.arrayUnion({
          id: mission.reward.badge,
          earnedAt: Timestamp.now(),
          category: 'achievement' as const,
          rarity: 'rare' as const,
          meta: {
            reason: `Completed mission: ${mission.title}`,
            date: new Date().toISOString(),
          },
        });
      }

      if (mission.reward.items && mission.reward.items.length > 0) {
        const newItems = mission.reward.items.map((itemId: string) => ({
          id: `${itemId}_${Date.now()}`,
          itemId,
          name: itemId,
          type: 'reward' as const,
          quantity: 1,
          acquiredAt: Timestamp.now(),
        }));
        updates.inventory = FieldValue.arrayUnion(...newItems);
      }

      transaction.update(userRef, updates);

      transaction.set(db.collection('reward-transactions').doc(), {
        userId,
        type: 'earn',
        action: 'claim_mission',
        xpChange: mission.reward.xp,
        coinsChange: mission.reward.coins,
        gemsChange: mission.reward.gems || 0,
        timestamp: Timestamp.now(),
        metadata: {
          missionId: mission.id,
          missionTitle: mission.title,
          missionType,
        },
        reviewStatus: 'approved',
      });

      return {
        xpGained: mission.reward.xp,
        coinsGained: mission.reward.coins,
        gemsGained: mission.reward.gems || 0,
        badgeEarned: mission.reward.badge,
        itemsEarned: mission.reward.items,
        newXP,
        newCoins,
        newGems,
        newLevel,
        newTier,
        leveledUp,
      };
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error('Error claiming mission:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
