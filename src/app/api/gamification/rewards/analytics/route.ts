import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const admin = await getFirebaseAdmin();
    const decodedToken = await admin.auth().verifyIdToken(token);
    const userId = decodedToken.uid;

    const { searchParams } = new URL(req.url);
    const daysParam = searchParams.get('days');
    const days = daysParam ? parseInt(daysParam, 10) : 30;

    const db = admin.firestore();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const transactions = await db
      .collection('reward-transactions')
      .where('userId', '==', userId)
      .where('timestamp', '>=', Timestamp.fromDate(startDate))
      .orderBy('timestamp', 'asc')
      .get();

    const actionCounts: Record<string, number> = {};
    const dailyXP: Record<string, number> = {};
    const dailyCoins: Record<string, number> = {};
    let totalXP = 0;
    let totalCoins = 0;

    transactions.forEach(doc => {
      const data = doc.data();
      const action = data.action || 'unknown';
      const date = data.timestamp?.toDate().toISOString().split('T')[0];

      actionCounts[action] = (actionCounts[action] || 0) + 1;

      if (data.type === 'earn') {
        totalXP += data.xpChange || 0;
        totalCoins += data.coinsChange || 0;

        if (date) {
          dailyXP[date] = (dailyXP[date] || 0) + (data.xpChange || 0);
          dailyCoins[date] = (dailyCoins[date] || 0) + (data.coinsChange || 0);
        }
      }
    });

    const actionBreakdown = Object.entries(actionCounts)
      .map(([action, count]) => ({ action, count }))
      .sort((a, b) => b.count - a.count);

    const dailyActivity = Object.entries(dailyXP).map(([date, xp]) => ({
      date,
      xp,
      coins: dailyCoins[date] || 0
    }));

    const averageXPPerDay = dailyActivity.length > 0 
      ? totalXP / dailyActivity.length 
      : 0;

    const mostActiveDay = dailyActivity.length > 0
      ? dailyActivity.reduce((max, day) => day.xp > max.xp ? day : max, dailyActivity[0])
      : null;

    return NextResponse.json({
      period: {
        days,
        startDate: startDate.toISOString(),
        endDate: new Date().toISOString()
      },
      totals: {
        xp: totalXP,
        coins: totalCoins,
        transactions: transactions.size
      },
      averages: {
        xpPerDay: Math.round(averageXPPerDay),
        transactionsPerDay: Math.round(transactions.size / Math.max(days, 1))
      },
      breakdown: {
        byAction: actionBreakdown,
        dailyActivity
      },
      insights: {
        mostActiveDay,
        streakDays: calculateActiveStreak(dailyActivity),
        topAction: actionBreakdown[0]?.action || 'none'
      }
    });

  } catch (error: any) {
    console.error('Error fetching reward analytics:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

function calculateActiveStreak(dailyActivity: Array<{ date: string; xp: number }>): number {
  if (dailyActivity.length === 0) return 0;

  const sortedDays = dailyActivity
    .filter(day => day.xp > 0)
    .map(day => new Date(day.date))
    .sort((a, b) => b.getTime() - a.getTime());

  if (sortedDays.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const mostRecent = new Date(sortedDays[0]);
  mostRecent.setHours(0, 0, 0, 0);
  
  const daysDiff = Math.floor((today.getTime() - mostRecent.getTime()) / (1000 * 60 * 60 * 24));
  if (daysDiff > 1) return 0;

  let streak = 1;
  for (let i = 1; i < sortedDays.length; i++) {
    const current = new Date(sortedDays[i]);
    const previous = new Date(sortedDays[i - 1]);
    
    current.setHours(0, 0, 0, 0);
    previous.setHours(0, 0, 0, 0);
    
    const diff = Math.floor((previous.getTime() - current.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diff === 1) {
      streak++;
    } else if (diff > 1) {
      break;
    }
  }

  return streak;
}
