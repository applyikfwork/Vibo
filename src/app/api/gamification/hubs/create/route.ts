import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';

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

    const { name, description, icon, creatorId } = await req.json();

    if (!name || !description) {
      return NextResponse.json(
        { error: 'Hub name and description are required' },
        { status: 400 }
      );
    }

    const db = admin.firestore();
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data();
    const userTier = userData?.tier || 'Bronze';

    const tierRequirements: { [key: string]: number } = {
      'Bronze': 1,
      'Silver': 2,
      'Gold': 3,
      'Platinum': 5,
      'Diamond': 8,
      'Legend': 15
    };

    const userCreatedHubsSnapshot = await db
      .collection('community-hubs')
      .where('creatorId', '==', userId)
      .count()
      .get();

    const userCreatedHubsCount = userCreatedHubsSnapshot.data().count;
    const allowedHubs = tierRequirements[userTier] || 0;

    if (userCreatedHubsCount >= allowedHubs) {
      return NextResponse.json(
        { 
          error: `Your ${userTier} tier allows ${allowedHubs} hub${allowedHubs !== 1 ? 's' : ''}. Upgrade to create more hubs!`,
          currentCount: userCreatedHubsCount,
          allowedCount: allowedHubs
        },
        { status: 403 }
      );
    }

    const hubId = `user-hub-${userId}-${Date.now()}`;

    const newHub = {
      id: hubId,
      name,
      description,
      icon: icon || '🎯',
      theme: 'General',
      creatorId: userId,
      createdAt: Timestamp.now(),
      memberCount: 1,
      isUserCreated: true,
      topContributors: [userId],
      recentActivityCount: 0,
      trendingScore: 0
    };

    await db.collection('community-hubs').doc(hubId).set(newHub);

    const joinedHubs = userData?.joinedHubs || [];
    if (!joinedHubs.includes(hubId)) {
      joinedHubs.push(hubId);
      await userRef.update({ joinedHubs });
    }

    return NextResponse.json({
      success: true,
      hub: newHub,
      message: 'Hub created successfully'
    });

  } catch (error: any) {
    console.error('Error creating hub:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
