import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/firebase/admin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const scope = searchParams.get('scope') || 'city';
    const city = searchParams.get('city');

    const admin = await getFirebaseAdmin();
    const db = admin.firestore();

    let query = db.collection('users').orderBy('xp', 'desc').limit(20);

    if (scope === 'city' && city) {
      query = query.where('location.city', '==', city) as any;
    }

    const snapshot = await query.get();

    const leaderboard = snapshot.docs.map((doc, index) => {
      const data = doc.data();
      return {
        userId: doc.id,
        displayName: data.displayName || 'Anonymous Viber',
        avatarUrl: data.photoURL,
        xp: data.xp || 0,
        rank: index + 1,
        cityBadges: data.cityBadges || [],
      };
    });

    return NextResponse.json({ leaderboard });
  } catch (error: any) {
    console.error('Error in leaderboard API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
