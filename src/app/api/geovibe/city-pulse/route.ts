import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';
import type { CityMoodPulse, EmotionCategory } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');

    if (!city) {
      return NextResponse.json(
        { error: 'City parameter is required' },
        { status: 400 }
      );
    }

    const admin = await getFirebaseAdmin();
    const db = admin.firestore();

    const oneDayAgo = Timestamp.fromDate(new Date(Date.now() - 24 * 60 * 60 * 1000));

    const vibesSnapshot = await db
      .collection('all-vibes')
      .where('location.city', '==', city)
      .where('timestamp', '>=', oneDayAgo)
      .get();

    if (vibesSnapshot.empty) {
      return NextResponse.json({ pulse: null });
    }

    const moodBreakdown: Record<string, number> = {};
    const userSet = new Set<string>();
    let totalVibes = 0;

    vibesSnapshot.docs.forEach((doc) => {
      const vibe = doc.data();
      totalVibes++;
      userSet.add(vibe.userId);

      const emotion = vibe.emotion as EmotionCategory;
      moodBreakdown[emotion] = (moodBreakdown[emotion] || 0) + 1;
    });

    const dominantMood = Object.entries(moodBreakdown).sort(([, a], [, b]) => b - a)[0][0] as EmotionCategory;

    const positiveEmotions = ['Happy', 'Chill', 'Motivated', 'Festival Joy', 'Wedding Excitement', 'Religious Peace', 'Family Bonding'];
    const positiveCount = Object.entries(moodBreakdown)
      .filter(([emotion]) => positiveEmotions.includes(emotion))
      .reduce((sum, [, count]) => sum + count, 0);
    
    const happinessPercentage = (positiveCount / totalVibes) * 100;

    const pulse = {
      city,
      timestamp: Timestamp.now().toDate().toISOString(),
      totalVibes,
      moodBreakdown: moodBreakdown as Record<EmotionCategory, number>,
      dominantMood,
      happinessPercentage,
      activeUsers: userSet.size,
    };

    return NextResponse.json({ pulse });
  } catch (error: any) {
    console.error('Error in city-pulse API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
