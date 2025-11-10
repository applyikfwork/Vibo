import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/firebase/admin';
import { getAuth } from 'firebase-admin/auth';
import { BADGE_CATALOG, checkBadgeEligibility, getBadgesByCategory } from '@/lib/rewards/badge-system';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await getAuth().verifyIdToken(token);
    const userId = decodedToken.uid;

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const admin = await getFirebaseAdmin();
    const adminDb = admin.firestore();
    const userDoc = await adminDb.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data();
    const earnedBadges = userData?.badges || [];

    let badges = category ? getBadgesByCategory(category as any) : BADGE_CATALOG;
    
    badges = badges.filter(b => !b.isHidden);

    const badgesWithStatus = badges.map(badge => {
      const earned = earnedBadges.find((eb: any) => eb.id === badge.id);
      return {
        ...badge,
        earned: !!earned,
        earnedAt: earned?.earnedAt || null,
      };
    });

    return NextResponse.json({
      badges: badgesWithStatus,
      totalBadges: BADGE_CATALOG.length,
      earnedCount: earnedBadges.length,
    });
  } catch (error) {
    console.error('Error fetching badges:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await getAuth().verifyIdToken(token);
    const userId = decodedToken.uid;

    const body = await request.json();
    const { badgeId } = body;

    if (!badgeId) {
      return NextResponse.json({ error: 'Badge ID is required' }, { status: 400 });
    }

    const badge = BADGE_CATALOG.find(b => b.id === badgeId);
    if (!badge) {
      return NextResponse.json({ error: 'Badge not found' }, { status: 404 });
    }

    const admin = await getFirebaseAdmin();
    const adminDb = admin.firestore();
    const userRef = adminDb.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data();
    
    const serverUserStats = {
      emotionPosts: userData?.emotionPosts || {},
      uniqueEmotions: userData?.uniqueEmotions || 0,
      uniqueCities: userData?.uniqueCities || 0,
      uniqueStates: userData?.uniqueStates || 0,
      postingStreak: userData?.postingStreak || 0,
      challengesCompleted: userData?.challengesCompleted || 0,
      dailyChallengesCompleted: userData?.dailyChallengesCompleted || 0,
      helpfulCommentsGiven: userData?.helpfulCommentsGiven || 0,
      totalReactionsGiven: userData?.totalReactionsGiven || 0,
      totalViews: userData?.totalViews || 0,
      totalVibesPosted: userData?.totalVibesPosted || 0,
      totalCommentsGiven: userData?.totalCommentsGiven || 0,
      voiceNotes: userData?.voiceNotes || 0,
      giftsSent: userData?.giftsSent || 0,
      leaderboardRank: userData?.leaderboardRank || Infinity,
    };

    const eligible = checkBadgeEligibility(badgeId, serverUserStats);
    if (!eligible) {
      return NextResponse.json({ 
        error: 'Not eligible for this badge based on your actual stats',
        eligible: false,
      }, { status: 400 });
    }

    const badges = userData?.badges || [];
    
    const alreadyEarned = badges.some((b: any) => b.id === badgeId);
    if (alreadyEarned) {
      return NextResponse.json({ 
        error: 'Badge already earned',
        alreadyEarned: true,
      }, { status: 400 });
    }

    const newBadge = {
      id: badge.id,
      name: badge.name,
      description: badge.description,
      icon: badge.icon,
      category: badge.category,
      rarity: badge.rarity,
      requirement: badge.requirement,
      earnedAt: new Date(),
    };

    const currentXP = userData?.xp || 0;
    const currentCoins = userData?.coins || 0;

    await userRef.update({
      badges: [...badges, newBadge],
      xp: currentXP + (badge.xpReward || 0),
      coins: currentCoins + (badge.coinReward || 0),
    });

    await adminDb.collection('reward-transactions').add({
      userId,
      type: 'earn',
      action: `badge_earned_${badgeId}`,
      xpChange: badge.xpReward || 0,
      coinsChange: badge.coinReward || 0,
      timestamp: new Date(),
      metadata: { badgeId, badgeName: badge.name },
    });

    return NextResponse.json({
      success: true,
      badge: newBadge,
      xpEarned: badge.xpReward || 0,
      coinsEarned: badge.coinReward || 0,
    });
  } catch (error) {
    console.error('Error awarding badge:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
