import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/firebase/admin';

const generateDemoChallenges = (city: string) => {
  const now = new Date();
  const yesterdayMs = now.getTime() - 24 * 60 * 60 * 1000;
  const tomorrowMs = now.getTime() + 24 * 60 * 60 * 1000;
  const nextWeekMs = now.getTime() + 7 * 24 * 60 * 60 * 1000;

  return [
    {
      id: 'demo-challenge-1',
      title: `${city} Happiness Wave`,
      description: `Help ${city} reach 1000 happy vibes this week!`,
      city,
      targetEmotion: 'Happy',
      goal: 1000,
      current: 742,
      participants: ['demo-user-1', 'demo-user-2', 'demo-user-3'],
      contributors: [],
      reward: { xp: 500, coins: 250, badge: `${city} Joy Spreader` },
      startDate: {
        seconds: Math.floor(yesterdayMs / 1000),
        nanoseconds: 0,
      },
      endDate: {
        seconds: Math.floor(nextWeekMs / 1000),
        nanoseconds: 0,
      },
      isActive: true,
    },
    {
      id: 'demo-challenge-2',
      title: 'Weekend Calm Initiative',
      description: 'Share peaceful vibes this weekend',
      city,
      targetEmotion: 'Chill',
      goal: 500,
      current: 287,
      participants: ['demo-user-4', 'demo-user-5'],
      contributors: [],
      reward: { xp: 300, coins: 150, badge: 'Weekend Peace Keeper' },
      startDate: {
        seconds: Math.floor(yesterdayMs / 1000),
        nanoseconds: 0,
      },
      endDate: {
        seconds: Math.floor(tomorrowMs / 1000),
        nanoseconds: 0,
      },
      isActive: true,
    },
  ];
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');

    if (!city) {
      return NextResponse.json({ challenges: [] });
    }

    try {
      const admin = await getFirebaseAdmin();
      const db = admin.firestore();

      const { Timestamp } = await import('firebase-admin/firestore');
      const now = Timestamp.now();

      const snapshot = await db
        .collection('city-challenges')
        .where('city', '==', city)
        .where('endDate', '>', now)
        .get();

      if (snapshot.empty) {
        return NextResponse.json({ challenges: generateDemoChallenges(city) });
      }

      const challenges = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          startDate: data.startDate ? { seconds: data.startDate.seconds, nanoseconds: data.startDate.nanoseconds } : undefined,
          endDate: data.endDate ? { seconds: data.endDate.seconds, nanoseconds: data.endDate.nanoseconds } : undefined,
          completedAt: data.completedAt ? { seconds: data.completedAt.seconds, nanoseconds: data.completedAt.nanoseconds } : undefined,
        };
      });

      return NextResponse.json({ challenges });
    } catch (firebaseError: any) {
      console.log('Firebase admin not available, using demo data:', firebaseError.message);
      return NextResponse.json({ challenges: generateDemoChallenges(city) });
    }
  } catch (error: any) {
    console.error('Error in challenges API:', error);
    const { searchParams } = new URL(request.url);
    const fallbackCity = searchParams.get('city') || 'City';
    return NextResponse.json({ challenges: generateDemoChallenges(fallbackCity) });
  }
}
