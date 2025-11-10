import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/firebase/admin';
import { getAuth } from 'firebase-admin/auth';
import { calculateKarmaChange, getKarmaTier, DEFAULT_KARMA } from '@/lib/rewards/karma-system';
import type { Timestamp } from 'firebase/firestore';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await getAuth().verifyIdToken(token);
    const userId = decodedToken.uid;

    const admin = await getFirebaseAdmin();
    const adminDb = admin.firestore();
    const userDoc = await adminDb.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data();
    const karma = userData?.karma || DEFAULT_KARMA;
    const tier = getKarmaTier(karma);

    return NextResponse.json({
      karma,
      tier: tier.name,
      visibility: tier.visibility,
      feedBoost: tier.feedBoost,
      description: tier.description,
      minKarma: tier.minKarma,
      maxKarma: tier.maxKarma,
    });
  } catch (error) {
    console.error('Error fetching karma:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await getAuth().verifyIdToken(token);
    const userId = decodedToken.uid;

    return NextResponse.json({ 
      error: 'Karma updates must be triggered server-side only. This endpoint is for internal use.',
      message: 'Karma is automatically updated when you perform quality actions like posting vibes, receiving reactions, or completing challenges.',
    }, { status: 403 });
  } catch (error) {
    console.error('Error in karma endpoint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
