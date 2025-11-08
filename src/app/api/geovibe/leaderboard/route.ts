import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/firebase/admin';

const generateDemoLeaderboard = (city?: string | null) => {
  const names = [
    'Priya Sharma',
    'Arjun Patel',
    'Sneha Kumar',
    'Rohan Gupta',
    'Ananya Singh',
    'Vikram Reddy',
    'Kavya Iyer',
    'Aditya Mehta',
    'Ishita Joshi',
    'Rahul Verma',
  ];

  return names.map((name, index) => ({
    userId: `demo-user-${index + 1}`,
    displayName: name,
    avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
    xp: 5000 - index * 450,
    rank: index + 1,
    cityBadges: index < 3 ? [`${city || 'City'} Champion`] : [],
  }));
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const scope = searchParams.get('scope') || 'city';
    const city = searchParams.get('city');

    try {
      const admin = await getFirebaseAdmin();
      const db = admin.firestore();

      let query = db.collection('users').orderBy('xp', 'desc').limit(20);

      if (scope === 'city' && city) {
        query = query.where('location.city', '==', city) as any;
      }

      const snapshot = await query.get();

      if (snapshot.empty) {
        return NextResponse.json({ leaderboard: generateDemoLeaderboard(city) });
      }

      const leaderboard = snapshot.docs.map((doc, index) => {
        const data = doc.data();
        return {
          userId: doc.id,
          displayName: data.displayName || 'Anonymous Viber',
          avatarUrl: data.photoURL,
          xp: data.xp || 0,
          rank: index + 1,
          cityBadges: data.cityBadges || [],
        };
      });

      return NextResponse.json({ leaderboard });
    } catch (firebaseError: any) {
      console.log('Firebase admin not available, using demo data:', firebaseError.message);
      return NextResponse.json({ leaderboard: generateDemoLeaderboard(city) });
    }
  } catch (error: any) {
    console.error('Error in leaderboard API:', error);
    return NextResponse.json({ leaderboard: generateDemoLeaderboard(null) });
  }
}
