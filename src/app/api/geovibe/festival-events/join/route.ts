import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const admin = await getFirebaseAdmin();
    
    const decodedToken = await admin.auth().verifyIdToken(token);
    const userId = decodedToken.uid;

    const body = await request.json();
    const { eventId } = body;

    if (!eventId) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }

    const db = admin.firestore();
    
    await db.runTransaction(async (transaction) => {
      const eventRef = db.collection('festival-events').doc(eventId);
      const userRef = db.collection('users').doc(userId);

      const eventDoc = await transaction.get(eventRef);
      
      if (!eventDoc.exists) {
        throw new Error('Festival event not found');
      }

      const eventData = eventDoc.data();
      
      if (!eventData?.isActive) {
        throw new Error('This festival event is no longer active');
      }

      if (eventData.participants?.includes(userId)) {
        throw new Error('You have already joined this event');
      }

      const endDate = eventData.endDate?.toDate();
      if (endDate && endDate < new Date()) {
        throw new Error('This festival event has ended');
      }

      transaction.update(eventRef, {
        participants: FieldValue.arrayUnion(userId),
      });

      transaction.update(userRef, {
        xp: FieldValue.increment(10),
        festivalEvents: FieldValue.arrayUnion(eventId),
      });
    });

    return NextResponse.json({
      success: true,
      message: 'Successfully joined the festival event',
      xpEarned: 10,
    });
  } catch (error: any) {
    console.error('Error joining festival event:', error);
    
    if (error.message.includes('not found') || error.message.includes('no longer active') || error.message.includes('already joined') || error.message.includes('has ended')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
