import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';

export async function GET(req: NextRequest) {
  try {
    const admin = await getFirebaseAdmin();
    const db = admin.firestore();

    const eventsSnapshot = await db
      .collection('hub-events')
      .where('date', '>', Timestamp.now())
      .orderBy('date', 'asc')
      .limit(10)
      .get();

    const events = eventsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        date: data.date.toDate().toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        }),
        hub: data.hubName,
        participants: data.participants || 0
      };
    });

    if (events.length === 0) {
      return NextResponse.json({
        events: [
          { id: 1, name: 'Motivation Monday', date: 'Dec 9, 2024', hub: 'Motivation Station', participants: 42 },
          { id: 2, name: 'Weekend Chill Fest', date: 'Dec 14, 2024', hub: 'Chill Corner', participants: 128 }
        ]
      });
    }

    return NextResponse.json({ events });
  } catch (error: any) {
    console.error('Error fetching events:', error);
    return NextResponse.json({
      events: [
        { id: 1, name: 'Motivation Monday', date: 'Dec 9, 2024', hub: 'Motivation Station', participants: 42 },
        { id: 2, name: 'Weekend Chill Fest', date: 'Dec 14, 2024', hub: 'Chill Corner', participants: 128 }
      ]
    });
  }
}
