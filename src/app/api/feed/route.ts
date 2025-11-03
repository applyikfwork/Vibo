import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore as getAdminFirestore } from 'firebase-admin/firestore';
import type { Vibe, EmotionCategory, UserProfile, RankedVibe } from '@/lib/types';
import { 
  rankVibesForUser, 
  generateSmartVibeFeed,
  calculateBoostScore 
} from '@/lib/feed-algorithm';

if (!getApps().length) {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    console.error('Missing Firebase Admin credentials. Required environment variables:', {
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: !!projectId,
      FIREBASE_CLIENT_EMAIL: !!clientEmail,
      FIREBASE_PRIVATE_KEY: !!privateKey,
    });
  } else {
    try {
      initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, '\n'),
        }),
      });
    } catch (error) {
      console.error('Firebase admin initialization error:', error);
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, userMood, limit: requestLimit = 30 } = body;

    if (!userId || !userMood) {
      return NextResponse.json(
        { error: 'userId and userMood are required' },
        { status: 400 }
      );
    }

    // Check if Firebase Admin is initialized
    if (!getApps().length) {
      return NextResponse.json(
        { 
          error: 'Firebase Admin not initialized',
          details: 'Missing required environment variables: FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL',
          hint: 'Please set up Firebase Admin credentials in your environment variables'
        },
        { status: 500 }
      );
    }

    const db = getAdminFirestore();

    // Fetch user profile
    let userProfile: UserProfile | undefined;
    let userPreviousMood: EmotionCategory | undefined;
    try {
      const userDoc = await db.collection('users').doc(userId).get();
      if (userDoc.exists) {
        userProfile = { id: userDoc.id, ...userDoc.data() } as UserProfile;
        // Extract previous mood from mood history
        if (userProfile.moodHistory && userProfile.moodHistory.length > 1) {
          // Sort mood history by timestamp (most recent first)
          const sortedHistory = [...userProfile.moodHistory].sort((a, b) => 
            (b.timestamp as any)._seconds - (a.timestamp as any)._seconds
          );
          // Get the second-most-recent mood (index 1), as index 0 is the current mood
          userPreviousMood = sortedHistory[1]?.emotion;
        }
      }
    } catch (error) {
      console.log('Could not fetch user profile, continuing without it');
    }

    // Fetch vibes from all-vibes collection
    const vibesSnapshot = await db
      .collection('all-vibes')
      .orderBy('timestamp', 'desc')
      .limit(requestLimit * 2) // Fetch more to have enough for ranking
      .get();

    const vibes: Vibe[] = [];
    
    for (const doc of vibesSnapshot.docs) {
      const data = doc.data();
      
      // Fetch reactions count
      const reactionsSnapshot = await db
        .collection('all-vibes')
        .doc(doc.id)
        .collection('reactions')
        .get();
      
      // Fetch comments count
      const commentsSnapshot = await db
        .collection('all-vibes')
        .doc(doc.id)
        .collection('comments')
        .get();
      
      // Calculate boost score
      const { boostScore } = calculateBoostScore(
        { ...data, id: doc.id } as Vibe,
        reactionsSnapshot.docs.map(d => d.data()),
        commentsSnapshot.docs.map(d => d.data()),
        userPreviousMood
      );
      
      vibes.push({
        id: doc.id,
        ...data,
        reactionCount: reactionsSnapshot.size,
        commentCount: commentsSnapshot.size,
        boostScore,
      } as Vibe);
    }

    // Rank vibes using the algorithm
    const rankedVibes = rankVibesForUser(vibes, userMood as EmotionCategory, userProfile);

    // Generate Smart Vibe Zones
    const { myVibeZone, healingZone, exploreZone } = generateSmartVibeFeed(rankedVibes);

    // Combine zones in order: My Vibe -> Healing -> Explore
    const orderedFeed: RankedVibe[] = [
      ...myVibeZone,
      ...healingZone,
      ...exploreZone,
    ];

    return NextResponse.json({
      success: true,
      feed: orderedFeed,
      zones: {
        myVibeZone,
        healingZone,
        exploreZone,
      },
      metadata: {
        totalVibes: vibes.length,
        rankedVibes: rankedVibes.length,
        userMood,
        algorithm: 'Vibee Feed Algorithm v1.0',
      },
    });

  } catch (error) {
    console.error('Feed API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate personalized feed', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// GET endpoint for simple requests
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('userId');
  const userMood = searchParams.get('userMood');

  if (!userId || !userMood) {
    return NextResponse.json(
      { error: 'userId and userMood query parameters are required' },
      { status: 400 }
    );
  }

  // Call POST with extracted params
  return POST(
    new NextRequest(request.url, {
      method: 'POST',
      body: JSON.stringify({ userId, userMood }),
    })
  );
}
