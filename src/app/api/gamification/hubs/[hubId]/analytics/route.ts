import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/firebase/admin';

export async function GET(
  req: NextRequest,
  { params }: { params: { hubId: string } }
) {
  try {
    const admin = await getFirebaseAdmin();
    const db = admin.firestore();
    const hubId = params.hubId;

    const hubThemeMap: { [key: string]: string } = {
      'motivation-hub': 'Motivated',
      'alone-zone': 'Lonely',
      'happy-vibes': 'Happy',
      'study-support': 'Exam Stress',
      'chill-corner': 'Chill'
    };

    const theme = hubThemeMap[hubId];
    if (!theme) {
      return NextResponse.json({ error: 'Invalid hub ID' }, { status: 400 });
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const vibesSnapshot = await db
      .collection('all-vibes')
      .where('emotion', '==', theme)
      .where('timestamp', '>', thirtyDaysAgo)
      .orderBy('timestamp', 'asc')
      .get();

    const dailyData: { [key: string]: { posts: number; reactions: number } } = {};
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateKey = date.toISOString().split('T')[0];
      dailyData[dateKey] = { posts: 0, reactions: 0 };
    }

    for (const vibeDoc of vibesSnapshot.docs) {
      const vibeData = vibeDoc.data();
      const vibeDate = vibeData.timestamp?.toDate();
      if (vibeDate) {
        const dateKey = vibeDate.toISOString().split('T')[0];
        if (dailyData[dateKey]) {
          dailyData[dateKey].posts += 1;
        }
      }

      const reactionsSnapshot = await db
        .collection('all-vibes')
        .doc(vibeDoc.id)
        .collection('reactions')
        .get();

      if (vibeDate) {
        const dateKey = vibeDate.toISOString().split('T')[0];
        if (dailyData[dateKey]) {
          dailyData[dateKey].reactions += reactionsSnapshot.size;
        }
      }
    }

    const chartData = Object.keys(dailyData)
      .sort()
      .map(date => ({
        date,
        posts: dailyData[date].posts,
        reactions: dailyData[date].reactions
      }));

    const totalPosts = vibesSnapshot.size;
    const totalReactions = chartData.reduce((sum, day) => sum + day.reactions, 0);
    const avgPostsPerDay = totalPosts / 30;
    const avgReactionsPerPost = totalPosts > 0 ? totalReactions / totalPosts : 0;

    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastWeekVibes = vibesSnapshot.docs.filter(doc => {
      const timestamp = doc.data().timestamp?.toDate();
      return timestamp && timestamp > sevenDaysAgo;
    });

    const previousWeekStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const previousWeekVibes = vibesSnapshot.docs.filter(doc => {
      const timestamp = doc.data().timestamp?.toDate();
      return timestamp && timestamp > previousWeekStart && timestamp <= sevenDaysAgo;
    });

    const weekOverWeekGrowth = previousWeekVibes.length > 0
      ? ((lastWeekVibes.length - previousWeekVibes.length) / previousWeekVibes.length) * 100
      : 0;

    const peakActivityHour = await calculatePeakActivityHour(db, theme);

    return NextResponse.json({
      chartData,
      stats: {
        totalPosts,
        totalReactions,
        avgPostsPerDay: Math.round(avgPostsPerDay * 10) / 10,
        avgReactionsPerPost: Math.round(avgReactionsPerPost * 10) / 10,
        weekOverWeekGrowth: Math.round(weekOverWeekGrowth * 10) / 10,
        peakActivityHour
      }
    });
  } catch (error: any) {
    console.error('Error fetching hub analytics:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

async function calculatePeakActivityHour(db: any, theme: string): Promise<number> {
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const vibesSnapshot = await db
    .collection('all-vibes')
    .where('emotion', '==', theme)
    .where('timestamp', '>', oneDayAgo)
    .get();

  const hourCounts: { [hour: number]: number } = {};
  for (let i = 0; i < 24; i++) {
    hourCounts[i] = 0;
  }

  vibesSnapshot.docs.forEach((doc: any) => {
    const timestamp = doc.data().timestamp?.toDate();
    if (timestamp) {
      const hour = timestamp.getHours();
      hourCounts[hour] += 1;
    }
  });

  let peakHour = 12;
  let maxCount = 0;
  for (const [hour, count] of Object.entries(hourCounts)) {
    if (count > maxCount) {
      maxCount = count;
      peakHour = parseInt(hour);
    }
  }

  return peakHour;
}
