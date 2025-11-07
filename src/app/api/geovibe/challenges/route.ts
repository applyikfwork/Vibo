import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');

    if (!city) {
      return NextResponse.json({ challenges: [] });
    }

    const admin = await getFirebaseAdmin();
    const db = admin.firestore();

    const now = Timestamp.now();

    const snapshot = await db
      .collection('city-challenges')
      .where('city', '==', city)
      .where('endDate', '>', now)
      .get();

    const challenges = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ challenges });
  } catch (error: any) {
    console.error('Error in challenges API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
