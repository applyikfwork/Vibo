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

    const searchParams = req.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '20');
    const lastVibeId = searchParams.get('lastVibeId');

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

    let query = db
      .collection('all-vibes')
      .where('emotion', '==', theme)
      .orderBy('timestamp', 'desc')
      .limit(limit);

    if (lastVibeId) {
      const lastDoc = await db.collection('all-vibes').doc(lastVibeId).get();
      if (lastDoc.exists) {
        query = query.startAfter(lastDoc);
      }
    }

    const snapshot = await query.get();
    
    const vibes = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const data = doc.data();
        
        const reactionsSnapshot = await db
          .collection('all-vibes')
          .doc(doc.id)
          .collection('reactions')
          .get();

        const commentsSnapshot = await db
          .collection('all-vibes')
          .doc(doc.id)
          .collection('comments')
          .get();

        return {
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate?.()?.toISOString() || new Date().toISOString(),
          reactionCount: reactionsSnapshot.size,
          commentCount: commentsSnapshot.size
        };
      })
    );

    return NextResponse.json({
      vibes,
      hasMore: snapshot.docs.length === limit,
      lastVibeId: snapshot.docs[snapshot.docs.length - 1]?.id || null
    });
  } catch (error: any) {
    console.error('Error fetching hub feed:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
