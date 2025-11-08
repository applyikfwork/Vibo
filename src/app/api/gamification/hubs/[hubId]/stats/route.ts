import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/firebase/admin';

export async function GET(
  req: NextRequest,
  { params }: { params: { hubId: string } }
) {
  try {
    const admin = await getFirebaseAdmin();
    const db = admin.firestore();
    const hubId = params.hubId;

    const hubThemeMap: { [key: string]: string } = {
      'motivation-hub': 'Motivated',
      'alone-zone': 'Lonely',
      'happy-vibes': 'Happy',
      'study-support': 'Exam Stress',
      'chill-corner': 'Chill'
    };

    const theme = hubThemeMap[hubId];
    if (!theme) {
      return NextResponse.json({ error: 'Invalid hub ID' }, { status: 400 });
    }

    const membersSnapshot = await db
      .collection('users')
      .where('joinedHubs', 'array-contains', hubId)
      .get();

    const memberCount = membersSnapshot.size;

    const topContributors = await db
      .collection('users')
      .where('joinedHubs', 'array-contains', hubId)
      .orderBy('xp', 'desc')
      .limit(10)
      .get();

    const contributors = topContributors.docs.map((doc, index) => ({
      rank: index + 1,
      userId: doc.id,
      name: doc.data().displayName || 'Anonymous User',
      avatarUrl: doc.data().photoURL || '',
      xp: doc.data().xp || 0,
      level: doc.data().level || 1,
      badges: doc.data().badges || []
    }));

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const recentVibesSnapshot = await db
      .collection('all-vibes')
      .where('emotion', '==', theme)
      .where('timestamp', '>', sevenDaysAgo)
      .get();

    const weeklyPostCount = recentVibesSnapshot.size;

    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayVibesSnapshot = await db
      .collection('all-vibes')
      .where('emotion', '==', theme)
      .where('timestamp', '>', todayStart)
      .get();

    const todayPostCount = todayVibesSnapshot.size;

    let totalReactions = 0;
    const allVibesSnapshot = await db
      .collection('all-vibes')
      .where('emotion', '==', theme)
      .limit(100)
      .get();

    for (const vibeDoc of allVibesSnapshot.docs) {
      const reactionsSnapshot = await db
        .collection('all-vibes')
        .doc(vibeDoc.id)
        .collection('reactions')
        .get();
      totalReactions += reactionsSnapshot.size;
    }

    const moodTrend = weeklyPostCount > 0 ? 
      (todayPostCount / weeklyPostCount * 7 > 1.2 ? 'rising' : 
       todayPostCount / weeklyPostCount * 7 < 0.8 ? 'falling' : 'stable') : 'stable';

    return NextResponse.json({
      hubId,
      theme,
      memberCount,
      topContributors: contributors,
      stats: {
        weeklyPostCount,
        todayPostCount,
        totalReactions,
        moodTrend,
        activeMembers: contributors.length
      }
    });
  } catch (error: any) {
    console.error('Error fetching hub stats:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
