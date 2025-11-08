import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/firebase/admin';
import { CommunityHub, EmotionCategory } from '@/lib/types';
import { Timestamp } from 'firebase-admin/firestore';

const COMMUNITY_HUBS: Omit<CommunityHub, 'memberCount' | 'topContributors' | 'recentActivityCount' | 'trendingScore'>[] = [
  {
    id: 'motivation-hub',
    name: 'Motivation Station',
    description: 'Share your drive and inspire others to achieve their goals',
    theme: 'Motivated' as EmotionCategory,
    icon: '💪'
  },
  {
    id: 'alone-zone',
    name: 'Alone Zone',
    description: 'A safe space for when you need solitude and understanding',
    theme: 'Lonely' as EmotionCategory,
    icon: '🌙'
  },
  {
    id: 'happy-vibes',
    name: 'Happy Vibes Only',
    description: 'Spread joy and celebrate the good moments',
    theme: 'Happy' as EmotionCategory,
    icon: '😊'
  },
  {
    id: 'study-support',
    name: 'Study Support',
    description: 'Students helping students through exam stress',
    theme: 'Exam Stress' as EmotionCategory,
    icon: '📚'
  },
  {
    id: 'chill-corner',
    name: 'Chill Corner',
    description: 'Relax, unwind, and share peaceful moments',
    theme: 'Chill' as EmotionCategory,
    icon: '🧘'
  }
];

export async function GET(req: NextRequest) {
  try {
    const admin = await getFirebaseAdmin();
    const db = admin.firestore();

    const userCreatedHubsSnapshot = await db
      .collection('community-hubs')
      .get();

    const userCreatedHubs = userCreatedHubsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Omit<CommunityHub, 'memberCount' | 'topContributors' | 'recentActivityCount' | 'trendingScore'>[];

    const allHubs = [...COMMUNITY_HUBS, ...userCreatedHubs];

    const hubsWithStats = await Promise.all(
      allHubs.map(async (hub) => {
        try {
          const membersSnapshot = await db
            .collection('users')
            .where('joinedHubs', 'array-contains', hub.id)
            .count()
            .get();

          let topContributors: string[] = [];
          try {
            const topContributorsSnapshot = await db
              .collection('users')
              .where('joinedHubs', 'array-contains', hub.id)
              .orderBy('xp', 'desc')
              .limit(3)
              .get();
            topContributors = topContributorsSnapshot.docs.map(doc => doc.id);
          } catch (indexError: any) {
            if (indexError.code === 9) {
              console.log(`Composite index needed for hub ${hub.id}. Top contributors will be empty.`);
            } else {
              throw indexError;
            }
          }

          const now = new Date();
          const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          
          let recentActivityCount = 0;
          try {
            const recentActivitySnapshot = await db
              .collection('all-vibes')
              .where('emotion', '==', hub.theme)
              .where('timestamp', '>', Timestamp.fromDate(twentyFourHoursAgo))
              .count()
              .get();
            recentActivityCount = recentActivitySnapshot.data().count;
          } catch (indexError: any) {
            if (indexError.code === 9) {
              console.log(`Composite index needed for recent activity on hub ${hub.id}. Recent activity count will be 0.`);
            } else {
              throw indexError;
            }
          }

          return {
            ...hub,
            memberCount: membersSnapshot.data().count,
            topContributors,
            recentActivityCount,
            trendingScore: recentActivityCount * 1.5
          };
        } catch (error) {
          console.error(`Error fetching stats for hub ${hub.id}:`, error);
          return {
            ...hub,
            memberCount: 0,
            topContributors: [],
            recentActivityCount: 0,
            trendingScore: 0
          };
        }
      })
    );

    return NextResponse.json({ hubs: hubsWithStats });
  } catch (error: any) {
    console.error('Error fetching community hubs:', error);
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

    const { hubId, action } = await req.json();

    if (!hubId || !action) {
      return NextResponse.json(
        { error: 'Hub ID and action are required' },
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
    const joinedHubs = userData?.joinedHubs || [];

    if (action === 'join') {
      if (!joinedHubs.includes(hubId)) {
        joinedHubs.push(hubId);
        await userRef.update({ joinedHubs });

        if (joinedHubs.length === 5) {
          const badgeRef = db.collection('users').doc(userId);
          const userSnapshot = await badgeRef.get();
          const existingBadges = userSnapshot.data()?.badges || [];
          
          const hasBadge = existingBadges.some((b: any) => b.id === 'community-builder');
          if (!hasBadge) {
            existingBadges.push({
              id: 'community-builder',
              name: 'Community Builder',
              icon: '🏘️',
              earnedAt: Timestamp.now()
            });
            await badgeRef.update({ badges: existingBadges });
          }
        }

        return NextResponse.json({ success: true, joined: true });
      }
    } else if (action === 'leave') {
      const index = joinedHubs.indexOf(hubId);
      if (index > -1) {
        joinedHubs.splice(index, 1);
        await userRef.update({ joinedHubs });
        return NextResponse.json({ success: true, joined: false });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error managing hub membership:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}