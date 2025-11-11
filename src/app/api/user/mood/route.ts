import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/firebase/admin';
import type { EmotionCategory } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const { userId, currentMood } = await request.json();

    if (!userId || !currentMood) {
      return NextResponse.json(
        { success: false, error: 'Missing userId or currentMood' },
        { status: 400 }
      );
    }

    const admin = await getFirebaseAdmin();
    const db = admin.firestore();

    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    const now = new Date();

    const moodEntry = {
      emotion: currentMood as EmotionCategory,
      timestamp: now,
    };

    const existingMoods = userData?.preferredMoods || [];
    const updatedPreferredMoods = existingMoods.includes(currentMood)
      ? existingMoods
      : [...existingMoods, currentMood].slice(0, 5);

    const existingMoodHistory = userData?.moodHistory || [];
    const updatedMoodHistory = [...existingMoodHistory, moodEntry].slice(-50);

    await userRef.update({
      currentMood: currentMood,
      preferredMoods: updatedPreferredMoods,
      moodHistory: updatedMoodHistory,
      lastMoodUpdate: now,
    });

    const interestsRef = db.collection('user-interests').doc(userId);
    const interestsDoc = await interestsRef.get();

    if (interestsDoc.exists) {
      const interestsData = interestsDoc.data();
      const emotionAffinity = interestsData?.emotionAffinity || {};

      if (!emotionAffinity[currentMood]) {
        emotionAffinity[currentMood] = 5;
      } else {
        emotionAffinity[currentMood] = Math.min(10, emotionAffinity[currentMood] + 1);
      }

      await interestsRef.update({
        emotionAffinity,
        focusEmotion: currentMood,
        focusEmotionTimestamp: now,
        lastUpdated: now,
      });
    } else {
      const emotionAffinity: Record<string, number> = {};
      emotionAffinity[currentMood] = 5;

      await interestsRef.set({
        userId,
        emotionAffinity,
        focusEmotion: currentMood,
        focusEmotionTimestamp: now,
        contentStyle: {
          shortText: 1,
          mediumText: 1,
          longText: 1,
        },
        avgListenRate: 0.5,
        totalEngagements: 0,
        onboardingCompleted: true,
        lastUpdated: now,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Mood updated successfully',
      currentMood,
    });
  } catch (error: any) {
    console.error('Error updating mood:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update mood' },
      { status: 500 }
    );
  }
}
