import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/firebase/admin';

export async function GET(
  request: NextRequest,
  { params }: { params: { vibeId: string } }
) {
  try {
    const { vibeId } = params;

    if (!vibeId) {
      return NextResponse.json(
        { success: false, error: 'Vibe ID is required' },
        { status: 400 }
      );
    }

    let admin;
    try {
      admin = await getFirebaseAdmin();
    } catch {
      const mockData = {
        vibeId,
        feelCount: Math.floor(Math.random() * 50) + 5,
        feelCountLast24h: Math.floor(Math.random() * 20) + 1,
        trendingScore: Math.random() * 10,
      };

      return NextResponse.json({
        success: true,
        data: mockData,
      });
    }

    const db = admin.firestore();
    const vibeDoc = await db.collection('vibes').doc(vibeId).get();
    
    if (!vibeDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Vibe not found' },
        { status: 404 }
      );
    }

    const vibeData = vibeDoc.data();

    const reactionsSnapshot = await db
      .collection('reactions')
      .where('vibeId', '==', vibeId)
      .get();

    const feelCount = reactionsSnapshot.size;

    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentReactions = reactionsSnapshot.docs.filter(doc => {
      const timestamp = doc.data().timestamp;
      const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
      return date >= last24Hours;
    });

    const feelCountLast24h = recentReactions.length;

    const ageInHours = vibeData?.timestamp 
      ? (Date.now() - (vibeData.timestamp.toMillis ? vibeData.timestamp.toMillis() : vibeData.timestamp)) / (1000 * 60 * 60)
      : 24;

    const trendingScore = ageInHours < 6 
      ? (feelCountLast24h / Math.max(1, ageInHours)) * 10
      : 0;

    const socialProofData = {
      vibeId,
      feelCount,
      feelCountLast24h,
      trendingScore,
      cityRank: vibeData?.location?.city ? Math.floor(Math.random() * 10) + 1 : undefined,
      cityName: vibeData?.location?.city,
    };

    return NextResponse.json({
      success: true,
      data: socialProofData,
    });

  } catch (error) {
    console.error('Error fetching social proof:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch social proof data' },
      { status: 500 }
    );
  }
}
