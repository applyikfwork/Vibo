import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/firebase/admin';
import { calculateLevel } from '@/lib/gamification';
import { LeaderboardEntry } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'national';
    const city = searchParams.get('city');
    const limit = parseInt(searchParams.get('limit') || '10');
    const userId = searchParams.get('userId');

    const admin = await getFirebaseAdmin();
    const db = admin.firestore();

    let query = db.collection('users')
      .where('xp', '>', 0)
      .orderBy('xp', 'desc')
      .limit(Math.min(limit, 100));

    if (type === 'city' && city) {
      query = query.where('location.city', '==', city);
    } else if (type === 'friends' && userId) {
      const userDoc = await db.collection('users').doc(userId).get();
      const followingList = userDoc.data()?.following || [];
      
      if (followingList.length === 0) {
        return NextResponse.json({ leaderboard: [], userRank: null });
      }

      const friendsData = await db.collection('users')
        .where('id', 'in', followingList.slice(0, 10))
        .get();

      const leaderboard = friendsData.docs
        .map(doc => {
          const data = doc.data();
          return {
            rank: 0,
            userId: doc.id,
            username: data.username || 'Anonymous',
            displayName: data.displayName,
            xp: data.xp || 0,
            level: calculateLevel(data.xp || 0),
            badges: data.badges || [],
            mood: data.currentMood,
            city: data.location?.city
          } as LeaderboardEntry;
        })
        .sort((a, b) => b.xp - a.xp)
        .map((entry, index) => ({ ...entry, rank: index + 1 }));

      return NextResponse.json({ leaderboard, userRank: null });
    }

    const snapshot = await query.get();
    const leaderboard: LeaderboardEntry[] = snapshot.docs.map((doc, index) => {
      const data = doc.data();
      return {
        rank: index + 1,
        userId: doc.id,
        username: data.username || 'Anonymous',
        displayName: data.displayName,
        xp: data.xp || 0,
        level: calculateLevel(data.xp || 0),
        badges: data.badges || [],
        mood: data.currentMood,
        city: data.location?.city
      };
    });

    let userRank = null;
    if (userId) {
      const userIndex = leaderboard.findIndex(entry => entry.userId === userId);
      if (userIndex !== -1) {
        userRank = userIndex + 1;
      } else {
        const userDoc = await db.collection('users').doc(userId).get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          const userXP = userData?.xp || 0;
          
          const higherRankedCount = await db.collection('users')
            .where('xp', '>', userXP)
            .count()
            .get();
          
          userRank = higherRankedCount.data().count + 1;
        }
      }
    }

    return NextResponse.json({
      leaderboard,
      userRank,
      type,
      city
    });

  } catch (error: any) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
