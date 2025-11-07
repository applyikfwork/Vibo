import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';

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

    const snapshot = await db
      .collection('mood-zones')
      .where('city', '==', city)
      .orderBy('emotionIntensity', 'desc')
      .limit(20)
      .get();

    const zones = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        lastUpdated: data.lastUpdated?.toDate?.()?.toISOString() || data.lastUpdated,
      };
    });

    return NextResponse.json({ zones });
  } catch (error: any) {
    console.error('Error fetching mood zones:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getFirebaseAdmin();
    const db = admin.firestore();
    const body = await request.json();
    const { city } = body;

    if (!city) {
      return NextResponse.json({ error: 'City is required' }, { status: 400 });
    }

    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const vibesSnapshot = await db
      .collection('all-vibes')
      .where('location.city', '==', city)
      .where('timestamp', '>=', Timestamp.fromDate(twentyFourHoursAgo))
      .get();

    const emotionClusters = new Map<string, any[]>();
    
    vibesSnapshot.docs.forEach(doc => {
      const vibe = doc.data();
      if (!vibe.location) return;
      
      const key = `${Math.round(vibe.location.lat * 100) / 100}-${Math.round(vibe.location.lng * 100) / 100}`;
      
      if (!emotionClusters.has(key)) {
        emotionClusters.set(key, []);
      }
      emotionClusters.get(key)!.push({
        ...vibe,
        id: doc.id,
      });
    });

    const zones: any[] = [];
    const now = Timestamp.now();

    for (const [key, vibes] of emotionClusters.entries()) {
      if (vibes.length < 5) continue;

      const emotionCounts: Record<string, number> = {};
      let totalLat = 0;
      let totalLng = 0;

      vibes.forEach(vibe => {
        emotionCounts[vibe.emotion] = (emotionCounts[vibe.emotion] || 0) + 1;
        totalLat += vibe.location.lat;
        totalLng += vibe.location.lng;
      });

      const dominantEmotion = Object.entries(emotionCounts)
        .sort((a, b) => b[1] - a[1])[0][0];
      
      const emotionIntensity = (emotionCounts[dominantEmotion] / vibes.length) * 100;

      let zoneType: 'hotspot' | 'calm' | 'energetic' | 'supportive' = 'hotspot';
      if (['Happy', 'Motivated', 'Festival Joy'].includes(dominantEmotion)) {
        zoneType = 'energetic';
      } else if (['Chill', 'Religious Peace', 'Neutral'].includes(dominantEmotion)) {
        zoneType = 'calm';
      } else if (['Sad', 'Lonely', 'Exam Stress'].includes(dominantEmotion)) {
        zoneType = 'supportive';
      }

      zones.push({
        name: `${dominantEmotion} Zone - ${city}`,
        city,
        center: {
          lat: totalLat / vibes.length,
          lng: totalLng / vibes.length,
        },
        radiusKm: 0.5,
        dominantEmotion,
        emotionIntensity,
        vibeCount: vibes.length,
        lastUpdated: now,
        zoneType,
      });
    }

    const batch = db.batch();
    await db.collection('mood-zones').where('city', '==', city).get()
      .then(snapshot => {
        snapshot.docs.forEach(doc => batch.delete(doc.ref));
      });

    zones.forEach(zone => {
      const zoneRef = db.collection('mood-zones').doc();
      batch.set(zoneRef, zone);
    });

    await batch.commit();

    return NextResponse.json({
      success: true,
      zonesCreated: zones.length,
      zones,
    });
  } catch (error: any) {
    console.error('Error generating mood zones:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
