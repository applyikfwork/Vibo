import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/firebase/admin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Missing userId' },
        { status: 400 }
      );
    }

    const admin = await getFirebaseAdmin();
    const db = admin.firestore();

    const userInterestsDoc = await db.collection('user-interests').doc(userId).get();

    if (!userInterestsDoc.exists) {
      return NextResponse.json({
        success: true,
        preferences: null,
        isNewUser: true,
      });
    }

    return NextResponse.json({
      success: true,
      preferences: userInterestsDoc.data(),
      isNewUser: false,
    });
  } catch (error) {
    console.error('Error fetching preferences:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch preferences' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, selectedEmotions, contentPreferences } = body;

    if (!userId || !selectedEmotions) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const admin = await getFirebaseAdmin();
    const db = admin.firestore();

    const emotionAffinity: Record<string, number> = {};
    selectedEmotions.forEach((emotion: string) => {
      emotionAffinity[emotion] = 5;
    });

    await db.collection('user-interests').doc(userId).set({
      userId,
      emotionAffinity,
      contentStyle: contentPreferences || {
        shortText: 1,
        mediumText: 1,
        longText: 1,
      },
      avgListenRate: 0.5,
      totalEngagements: 0,
      onboardingCompleted: true,
      lastUpdated: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving preferences:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save preferences' },
      { status: 500 }
    );
  }
}
