import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/firebase/admin';
import { updateEmotionWeights, getCurrentTimeSlot } from '@/lib/emotion-intelligence';
import { calculateVibeStreak, updateEmotionExplorer } from '@/lib/streak-tracking';
import type { EmotionCategory } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const admin = await getFirebaseAdmin();
    const db = admin.firestore();
    const auth = admin.auth();

    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    let decodedToken;
    
    try {
      decodedToken = await auth.verifyIdToken(token);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const userId = decodedToken.uid;
    const body = await request.json();
    const { emotion, interactionType } = body as {
      emotion: EmotionCategory;
      interactionType: 'view' | 'react' | 'post' | 'comment';
    };

    if (!emotion || !interactionType) {
      return NextResponse.json(
        { success: false, error: 'Emotion and interaction type are required' },
        { status: 400 }
      );
    }

    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    const userData = userDoc.data() || {};

    const currentWeights = userData.interestProfile?.emotionWeights || {};
    const newWeights = updateEmotionWeights(currentWeights, emotion, interactionType);

    const updates: any = {
      'interestProfile.emotionWeights': newWeights,
      'interestProfile.lastUpdated': new Date(),
    };

    if (interactionType === 'post') {
      const streak = calculateVibeStreak(
        userData.vibeStreak?.lastVibeDate,
        userData.vibeStreak?.currentStreak || 0,
        userData.vibeStreak?.longestStreak || 0
      );
      updates['vibeStreak'] = streak;

      const explorerProgress = updateEmotionExplorer(
        userData.emotionExplorer,
        emotion
      );
      updates['emotionExplorer'] = explorerProgress;
    }

    if (!userData.interestProfile?.timePattern?.includes(getCurrentTimeSlot())) {
      const currentPattern = userData.interestProfile?.timePattern || [];
      updates['interestProfile.timePattern'] = [...new Set([...currentPattern, getCurrentTimeSlot()])];
    }

    await userRef.update(updates);

    return NextResponse.json({
      success: true,
      data: {
        emotionWeights: newWeights,
        vibeStreak: updates.vibeStreak,
        emotionExplorer: updates.emotionExplorer,
      },
    });

  } catch (error) {
    console.error('Error updating emotion intelligence:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update emotion intelligence' },
      { status: 500 }
    );
  }
}
