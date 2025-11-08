import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/firebase/admin';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const type = searchParams.get('type') || 'global';
    const period = searchParams.get('period') || 'all_time';
    const city = searchParams.get('city');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);

    const admin = await getFirebaseAdmin();
    const db = admin.firestore();

    let query = db.collection('users');

    if (type === 'city' && city) {
      query = query.where('location.city', '==', city) as any;
    }

    if (type === 'giver') {
      query = query.orderBy('giverPoints', 'desc') as any;
    } else {
      query = query.orderBy('xp', 'desc') as any;
    }

    query = query.limit(limit) as any;

    const snapshot = await query.get();

    const entries = snapshot.docs.map((doc, index) => {
      const data = doc.data();
      return {
        rank: index + 1,
        userId: doc.id,
        username: data.username || 'Anonymous',
        displayName: data.displayName,
        xp: data.xp || 0,
        level: data.level || 1,
        tier: data.tier || 'bronze',
        badges: (data.badges || []).slice(0, 5),
        city: data.location?.city,
        giverPoints: type === 'giver' ? data.giverPoints || 0 : undefined,
      };
    });

    const leaderboard = {
      id: `${type}_${period}_${Date.now()}`,
      type,
      period,
      city,
      entries,
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json({ leaderboard });
  } catch (error: any) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
