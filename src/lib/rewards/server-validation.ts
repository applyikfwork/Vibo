import type { Firestore } from 'firebase-admin/firestore';

export async function validateReactionCount(
  db: Firestore,
  vibeId: string,
  threshold: number
): Promise<boolean> {
  const reactionsSnapshot = await db
    .collection('reactions')
    .where('vibeId', '==', vibeId)
    .count()
    .get();
  
  return reactionsSnapshot.data().count >= threshold;
}

export async function validateUserReactionCount(
  db: Firestore,
  userId: string
): Promise<number> {
  const reactionsSnapshot = await db
    .collection('reactions')
    .where('userId', '==', userId)
    .count()
    .get();
  
  return reactionsSnapshot.data().count;
}

export async function validateUserVibeCount(
  db: Firestore,
  userId: string
): Promise<number> {
  const vibesSnapshot = await db
    .collection('vibes')
    .where('userId', '==', userId)
    .count()
    .get();
  
  return vibesSnapshot.data().count;
}

export async function validateUserStreak(
  db: Firestore,
  userId: string
): Promise<number> {
  const userDoc = await db.collection('users').doc(userId).get();
  const userData = userDoc.data();
  return userData?.postingStreak || 0;
}

export async function validateQualityVibe(
  db: Firestore,
  vibeId: string
): Promise<{ isQuality: boolean; reactionCount: number }> {
  const reactionsSnapshot = await db
    .collection('reactions')
    .where('vibeId', '==', vibeId)
    .count()
    .get();
  
  const reactionCount = reactionsSnapshot.data().count;
  const isQuality = reactionCount >= 10;
  
  return { isQuality, reactionCount };
}

export async function awardKarmaServerSide(
  db: Firestore,
  userId: string,
  action: string,
  karmaChange: number,
  reason: string
): Promise<{ success: boolean; newKarma: number }> {
  const userRef = db.collection('users').doc(userId);
  const userDoc = await userRef.get();
  
  if (!userDoc.exists) {
    throw new Error('User not found');
  }
  
  const userData = userDoc.data();
  const currentKarma = userData?.karma || 100;
  const newKarma = Math.max(0, currentKarma + karmaChange);
  
  await userRef.update({
    karma: newKarma,
    lastKarmaUpdate: new Date(),
  });
  
  await db.collection('karma-transactions').add({
    userId,
    action,
    karmaChange,
    newKarma,
    reason,
    timestamp: new Date(),
  });
  
  return { success: true, newKarma };
}

export async function checkAndAwardBadgeServerSide(
  db: Firestore,
  userId: string,
  badgeId: string,
  xpReward: number,
  coinReward: number
): Promise<{ success: boolean; awarded: boolean; reason?: string }> {
  const userRef = db.collection('users').doc(userId);
  const userDoc = await userRef.get();
  
  if (!userDoc.exists) {
    return { success: false, awarded: false, reason: 'User not found' };
  }
  
  const userData = userDoc.data();
  const badges = userData?.badges || [];
  
  const alreadyEarned = badges.some((b: any) => b.id === badgeId);
  if (alreadyEarned) {
    return { success: false, awarded: false, reason: 'Badge already earned' };
  }
  
  const newBadge = {
    id: badgeId,
    earnedAt: new Date(),
  };
  
  const currentXP = userData?.xp || 0;
  const currentCoins = userData?.coins || 0;
  
  await userRef.update({
    badges: [...badges, newBadge],
    xp: currentXP + xpReward,
    coins: currentCoins + coinReward,
  });
  
  await db.collection('reward-transactions').add({
    userId,
    type: 'earn',
    action: `badge_earned_${badgeId}`,
    xpChange: xpReward,
    coinsChange: coinReward,
    timestamp: new Date(),
    metadata: { badgeId },
  });
  
  return { success: true, awarded: true };
}
