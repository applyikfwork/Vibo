import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';

export async function GET(req: NextRequest) {
  try {
    const admin = await getFirebaseAdmin();
    const db = admin.firestore();

    const battlesSnapshot = await db
      .collection('hub-battles')
      .where('endDate', '>', Timestamp.now())
      .where('status', '==', 'active')
      .orderBy('endDate', 'asc')
      .limit(10)
      .get();

    const battles = battlesSnapshot.docs.map(doc => {
      const data = doc.data();
      const endDate = data.endDate.toDate();
      const now = new Date();
      const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        id: doc.id,
        name: data.name,
        hubs: data.hubNames || [],
        score: data.scores || [0, 0],
        endDate: `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}`
      };
    });

    if (battles.length === 0) {
      return NextResponse.json({
        battles: [
          { id: 1, name: 'Happy vs Chill', hubs: ['Happy Vibes Only', 'Chill Corner'], score: [1250, 1180], endDate: '3 days' },
          { id: 2, name: 'Motivation Showdown', hubs: ['Motivation Station', 'Study Support'], score: [890, 920], endDate: '5 days' }
        ]
      });
    }

    return NextResponse.json({ battles });
  } catch (error: any) {
    console.error('Error fetching battles:', error);
    return NextResponse.json({
      battles: [
        { id: 1, name: 'Happy vs Chill', hubs: ['Happy Vibes Only', 'Chill Corner'], score: [1250, 1180], endDate: '3 days' },
        { id: 2, name: 'Motivation Showdown', hubs: ['Motivation Station', 'Study Support'], score: [890, 920], endDate: '5 days' }
      ]
    });
  }
}
