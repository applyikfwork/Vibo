import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/firebase/admin';
import type { EmotionCategory } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const emotions = searchParams.get('emotions')?.split(',') || [];

    if (emotions.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Missing emotions parameter' },
        { status: 400 }
      );
    }

    const admin = await getFirebaseAdmin();
    const db = admin.firestore();

    const vibesPromises = emotions.map(async (emotion) => {
      const vibesSnapshot = await db
        .collection('vibes')
        .where('emotion', '==', emotion)
        .orderBy('reactionCount', 'desc')
        .limit(5)
        .get();

      return vibesSnapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
        viewCount: Math.floor(Math.random() * 50) + 10,
      }));
    });

    const vibesArrays = await Promise.all(vibesPromises);
    const allVibes = vibesArrays.flat();

    allVibes.sort(() => Math.random() - 0.5);

    return NextResponse.json({
      success: true,
      vibes: allVibes.slice(0, 20),
      metadata: {
        emotions,
        count: allVibes.length,
        source: 'starter-feed',
      },
    });
  } catch (error) {
    console.error('Error fetching starter feed:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch starter feed' },
      { status: 500 }
    );
  }
}
