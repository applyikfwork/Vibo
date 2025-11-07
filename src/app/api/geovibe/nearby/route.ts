import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';
import { geohashQueryBounds, distanceBetween } from 'geofire-common';
import type { Location, Vibe } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { location, radiusKm = 10, sortBy = 'recent' } = body;

    if (!location || !location.lat || !location.lng) {
      return NextResponse.json(
        { error: 'Location with lat/lng is required' },
        { status: 400 }
      );
    }

    const admin = await getFirebaseAdmin();
    const db = admin.firestore();

    const center: [number, number] = [location.lat, location.lng];
    const radiusInM = radiusKm * 1000;

    const bounds = geohashQueryBounds(center, radiusInM);
    const promises = [];

    for (const b of bounds) {
      const q = db
        .collection('all-vibes')
        .orderBy('location.geohash')
        .startAt(b[0])
        .endAt(b[1]);

      promises.push(q.get());
    }

    const snapshots = await Promise.all(promises);

    const matchingVibes: Vibe[] = [];

    const vibeIds: string[] = [];
    const vibeDataMap = new Map<string, any>();

    for (const snap of snapshots) {
      for (const doc of snap.docs) {
        const data = doc.data();
        
        if (!data.location || !data.location.lat || !data.location.lng) {
          continue;
        }

        const vibeCenter: [number, number] = [data.location.lat, data.location.lng];
        const distanceInKm = distanceBetween(center, vibeCenter);
        const distanceInM = distanceInKm * 1000;

        if (distanceInM <= radiusInM) {
          vibeIds.push(doc.id);
          vibeDataMap.set(doc.id, { ...data, distance: distanceInKm });
        }
      }
    }

    const countPromises = vibeIds.map(async (vibeId) => {
      const [reactionsSnapshot, commentsSnapshot] = await Promise.all([
        db.collection('all-vibes').doc(vibeId).collection('reactions').get(),
        db.collection('all-vibes').doc(vibeId).collection('comments').get(),
      ]);

      return {
        vibeId,
        reactionCount: reactionsSnapshot.size,
        commentCount: commentsSnapshot.size,
      };
    });

    const counts = await Promise.all(countPromises);

    for (const { vibeId, reactionCount, commentCount } of counts) {
      const vibeData = vibeDataMap.get(vibeId);
      if (vibeData) {
        matchingVibes.push({
          id: vibeId,
          ...vibeData,
          reactionCount,
          commentCount,
        } as Vibe);
      }
    }

    let sortedVibes = matchingVibes;

    if (sortBy === 'distance') {
      sortedVibes = matchingVibes.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    } else if (sortBy === 'popular') {
      sortedVibes = matchingVibes.sort((a, b) => {
        const scoreA = (a.reactionCount || 0) + (a.commentCount || 0) * 2;
        const scoreB = (b.reactionCount || 0) + (b.commentCount || 0) * 2;
        return scoreB - scoreA;
      });
    } else {
      sortedVibes = matchingVibes.sort((a, b) => {
        const timeA = (a.timestamp as any)._seconds || 0;
        const timeB = (b.timestamp as any)._seconds || 0;
        return timeB - timeA;
      });
    }

    return NextResponse.json({ vibes: sortedVibes.slice(0, 30) });
  } catch (error: any) {
    console.error('Error in nearby API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
