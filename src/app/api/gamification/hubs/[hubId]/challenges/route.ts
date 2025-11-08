import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';

export async function GET(
  req: NextRequest,
  { params }: { params: { hubId: string } }
) {
  try {
    const admin = await getFirebaseAdmin();
    const db = admin.firestore();
    const hubId = params.hubId;

    const authHeader = req.headers.get('Authorization');
    let userId: string | null = null;

    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const decodedToken = await admin.auth().verifyIdToken(token);
        userId = decodedToken.uid;
      } catch (error) {
        console.log('Auth token invalid, returning challenges without user progress');
      }
    }

    const hubChallengesMap: { [key: string]: any[] } = {
      'motivation-hub': [
        {
          id: 'motivation-streak-7',
          name: '7-Day Motivation Streak',
          description: 'Post a motivational vibe every day for 7 days',
          type: 'weekly',
          target: 7,
          reward: { xp: 100, coins: 50 },
          icon: '🔥',
          difficulty: 'hard'
        },
        {
          id: 'motivation-inspire-5',
          name: 'Inspire 5 People',
          description: 'Get 5 people to react to your motivation posts',
          type: 'daily',
          target: 5,
          reward: { xp: 30, coins: 15 },
          icon: '💫',
          difficulty: 'medium'
        },
        {
          id: 'motivation-share-goals',
          name: 'Share Your Goals',
          description: 'Post about your goals and get 3 supportive comments',
          type: 'weekly',
          target: 3,
          reward: { xp: 50, coins: 25 },
          icon: '🎯',
          difficulty: 'medium'
        }
      ],
      'alone-zone': [
        {
          id: 'alone-support-3',
          name: 'Support 3 Members',
          description: 'Leave supportive comments on 3 posts in the Alone Zone',
          type: 'daily',
          target: 3,
          reward: { xp: 25, coins: 10 },
          icon: '🤗',
          difficulty: 'easy'
        },
        {
          id: 'alone-share-feelings',
          name: 'Express Your Feelings',
          description: 'Share how you\'re feeling and receive 5 reactions',
          type: 'weekly',
          target: 5,
          reward: { xp: 40, coins: 20 },
          icon: '💭',
          difficulty: 'medium'
        },
        {
          id: 'alone-voice-note',
          name: 'Share a Voice Note',
          description: 'Record a voice note about your feelings',
          type: 'weekly',
          target: 1,
          reward: { xp: 50, coins: 25 },
          icon: '🎙️',
          difficulty: 'medium'
        }
      ],
      'happy-vibes': [
        {
          id: 'happy-spread-joy-10',
          name: 'Spread Joy to 10 People',
          description: 'React to 10 happy vibes with positive emojis',
          type: 'daily',
          target: 10,
          reward: { xp: 20, coins: 10 },
          icon: '🌟',
          difficulty: 'easy'
        },
        {
          id: 'happy-daily-gratitude',
          name: 'Daily Gratitude',
          description: 'Post something you\'re grateful for every day this week',
          type: 'weekly',
          target: 7,
          reward: { xp: 80, coins: 40 },
          icon: '🙏',
          difficulty: 'hard'
        },
        {
          id: 'happy-celebrate-wins',
          name: 'Celebrate Small Wins',
          description: 'Post 3 small wins or happy moments',
          type: 'weekly',
          target: 3,
          reward: { xp: 45, coins: 20 },
          icon: '🎉',
          difficulty: 'easy'
        }
      ],
      'study-support': [
        {
          id: 'study-help-5',
          name: 'Help 5 Students',
          description: 'Leave helpful comments on 5 study-related posts',
          type: 'daily',
          target: 5,
          reward: { xp: 35, coins: 15 },
          icon: '🤝',
          difficulty: 'medium'
        },
        {
          id: 'study-progress-update',
          name: 'Weekly Progress Check',
          description: 'Share your study progress 3 times this week',
          type: 'weekly',
          target: 3,
          reward: { xp: 60, coins: 30 },
          icon: '📈',
          difficulty: 'medium'
        },
        {
          id: 'study-exam-prep',
          name: 'Exam Prep Champion',
          description: 'Post study tips and get 10 reactions from fellow students',
          type: 'weekly',
          target: 10,
          reward: { xp: 75, coins: 35 },
          icon: '🏆',
          difficulty: 'hard'
        }
      ],
      'chill-corner': [
        {
          id: 'chill-relax-moments',
          name: 'Share 3 Chill Moments',
          description: 'Post 3 peaceful or relaxing moments from your week',
          type: 'weekly',
          target: 3,
          reward: { xp: 45, coins: 20 },
          icon: '🌸',
          difficulty: 'easy'
        },
        {
          id: 'chill-meditation',
          name: 'Mindfulness Practice',
          description: 'Share a mindfulness or meditation experience',
          type: 'weekly',
          target: 1,
          reward: { xp: 40, coins: 20 },
          icon: '🧘',
          difficulty: 'easy'
        },
        {
          id: 'chill-support-10',
          name: 'Spread Calm Vibes',
          description: 'React to 10 chill posts with calming emojis',
          type: 'daily',
          target: 10,
          reward: { xp: 25, coins: 10 },
          icon: '☮️',
          difficulty: 'easy'
        }
      ]
    };

    const challenges = hubChallengesMap[hubId] || [];

    if (userId) {
      const userDoc = await db.collection('users').doc(userId).get();
      const userData = userDoc.data();
      const hubChallenges = userData?.hubChallenges || {};
      const userProgress = hubChallenges[hubId] || {};

      const challengesWithProgress = challenges.map(challenge => ({
        ...challenge,
        progress: userProgress[challenge.id]?.progress || 0,
        completed: userProgress[challenge.id]?.completed || false,
        completedAt: userProgress[challenge.id]?.completedAt || null
      }));

      return NextResponse.json({ challenges: challengesWithProgress });
    }

    return NextResponse.json({ challenges });
  } catch (error: any) {
    console.error('Error fetching hub challenges:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { hubId: string } }
) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const admin = await getFirebaseAdmin();
    const decodedToken = await admin.auth().verifyIdToken(token);
    const userId = decodedToken.uid;
    const hubId = params.hubId;

    const { challengeId, progress } = await req.json();

    if (!challengeId || progress === undefined) {
      return NextResponse.json(
        { error: 'Challenge ID and progress required' },
        { status: 400 }
      );
    }

    const db = admin.firestore();
    const userRef = db.collection('users').doc(userId);

    await db.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists) {
        throw new Error('User not found');
      }

      const userData = userDoc.data();
      const hubChallenges = userData?.hubChallenges || {};
      const userHubProgress = hubChallenges[hubId] || {};
      
      userHubProgress[challengeId] = {
        progress,
        completed: false,
        lastUpdated: Timestamp.now()
      };

      hubChallenges[hubId] = userHubProgress;
      transaction.update(userRef, { hubChallenges });
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating challenge progress:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
