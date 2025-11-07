import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const isActive = searchParams.get('isActive');

    const admin = await getFirebaseAdmin();
    const db = admin.firestore();

    let query = db.collection('festival-events').orderBy('startDate', 'desc');

    if (city) {
      query = query.where('city', '==', city) as any;
    }

    if (isActive === 'true') {
      query = query.where('isActive', '==', true) as any;
    }

    const snapshot = await query.limit(50).get();

    const events = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      startDate: doc.data().startDate?.toDate?.()?.toISOString() || doc.data().startDate,
      endDate: doc.data().endDate?.toDate?.()?.toISOString() || doc.data().endDate,
    }));

    const now = new Date();
    const activeEvents = events.filter((event: any) => {
      const endDate = new Date(event.endDate);
      return endDate > now;
    });

    return NextResponse.json({ 
      events: isActive === 'true' ? activeEvents : events,
      total: events.length,
    });
  } catch (error: any) {
    console.error('Error fetching festival events:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

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
    const {
      title,
      description,
      city,
      state,
      targetEmotion,
      startDate,
      endDate,
      goal,
      festivalType,
      rewards,
      bannerImage,
      location,
    } = body;

    if (!title || !city || !targetEmotion || !startDate || !endDate || !goal) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const db = admin.firestore();
    const eventData = {
      title,
      description,
      city,
      state,
      targetEmotion,
      startDate: Timestamp.fromDate(new Date(startDate)),
      endDate: Timestamp.fromDate(new Date(endDate)),
      goal,
      current: 0,
      participants: [],
      rewards: rewards || { xp: 100, badge: `${title} Participant` },
      festivalType: festivalType || 'cultural',
      isActive: true,
      bannerImage,
      location,
      createdBy: userId,
      createdAt: Timestamp.now(),
    };

    const eventRef = await db.collection('festival-events').add(eventData);

    return NextResponse.json({
      success: true,
      eventId: eventRef.id,
      message: 'Festival event created successfully',
    });
  } catch (error: any) {
    console.error('Error creating festival event:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
