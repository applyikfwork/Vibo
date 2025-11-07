import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';

export async function POST(request: NextRequest) {
  try {
    const admin = await getFirebaseAdmin();
    const db = admin.firestore();
    
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const vibesSnapshot = await db
      .collection('all-vibes')
      .where('timestamp', '>=', Timestamp.fromDate(twentyFourHoursAgo))
      .where('location.city', '!=', null)
      .get();

    const cityData = new Map<string, any>();

    vibesSnapshot.docs.forEach(doc => {
      const vibe = doc.data();
      const city = vibe.location?.city;
      
      if (!city) return;

      if (!cityData.has(city)) {
        cityData.set(city, {
          city,
          date: new Date().toISOString().split('T')[0],
          emotionCounts: {},
          totalVibes: 0,
          activeUsers: new Set(),
          moodZones: [],
        });
      }

      const data = cityData.get(city);
      data.emotionCounts[vibe.emotion] = (data.emotionCounts[vibe.emotion] || 0) + 1;
      data.totalVibes++;
      data.activeUsers.add(vibe.userId);
    });

    const aggregates: any[] = [];
    const batch = db.batch();

    for (const [city, data] of cityData.entries()) {
      const emotionEntries = Object.entries(data.emotionCounts) as [string, number][];
      const dominantEmotion = emotionEntries.sort((a, b) => b[1] - a[1])[0]?.[0] || 'Neutral';
      
      const totalEmotionStrength = emotionEntries.reduce((sum, [_, count]) => sum + count, 0);
      const averageIntensity = totalEmotionStrength / data.totalVibes;

      const aggregate = {
        city,
        date: data.date,
        emotionCounts: data.emotionCounts,
        totalVibes: data.totalVibes,
        dominantEmotion,
        averageIntensity,
        activeUsers: data.activeUsers.size,
        moodZones: [],
        lastAggregated: Timestamp.now(),
      };

      aggregates.push(aggregate);

      const aggRef = db.collection('city-mood-aggregates').doc(`${city}-${data.date}`);
      batch.set(aggRef, aggregate, { merge: true });
    }

    await batch.commit();

    return NextResponse.json({
      success: true,
      citiesAggregated: cityData.size,
      aggregates,
      message: `Successfully aggregated mood data for ${cityData.size} cities`,
    });
  } catch (error: any) {
    console.error('Error aggregating city moods:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    const admin = await getFirebaseAdmin();
    const db = admin.firestore();

    if (city) {
      const aggDoc = await db.collection('city-mood-aggregates').doc(`${city}-${date}`).get();
      
      if (!aggDoc.exists) {
        return NextResponse.json({
          aggregate: null,
          message: 'No aggregate data found for this city and date',
        });
      }

      const data = aggDoc.data();
      return NextResponse.json({
        aggregate: {
          ...data,
          lastAggregated: data?.lastAggregated?.toDate?.()?.toISOString() || data?.lastAggregated,
        },
      });
    }

    const snapshot = await db
      .collection('city-mood-aggregates')
      .where('date', '==', date)
      .orderBy('totalVibes', 'desc')
      .limit(50)
      .get();

    const aggregates = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        lastAggregated: data.lastAggregated?.toDate?.()?.toISOString() || data.lastAggregated,
      };
    });

    return NextResponse.json({ aggregates });
  } catch (error: any) {
    console.error('Error fetching aggregates:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
