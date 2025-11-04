
import { NextRequest, NextResponse } from 'next/server';
import { getWeeklyReflection, type WeeklyReflectionInput } from '@/ai/flows/generate-weekly-reflection';
import { getFirebaseAdmin } from '@/firebase/admin';
import type { Vibe, EmotionCategory } from '@/lib/types';
import { Timestamp } from 'firebase-admin/firestore';

export async function POST(request: NextRequest) {
  try {
    const admin = await getFirebaseAdmin();
    if (!admin.apps.length) {
      throw new Error("Firebase Admin SDK is not initialized. Check server logs.");
    }
    const db = admin.firestore();

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoTimestamp = Timestamp.fromDate(weekAgo);

    const vibesSnapshot = await db
      .collection('users')
      .doc(userId)
      .collection('vibes')
      .where('timestamp', '>=', weekAgoTimestamp)
      .get();

    if (vibesSnapshot.empty) {
      return NextResponse.json({
        success: true,
        reflection: {
          summary: "You haven't shared any vibes this week. Start sharing your feelings to get personalized insights!",
          emotionalPattern: "No data available for this week",
          growthMoments: [],
          healingInsights: [],
          encouragement: "Try sharing how you're feeling this week to get meaningful reflections.",
          dominantEmotions: [],
          connectionScore: 0,
        },
      });
    }

    const emotionCounts: Record<string, { count: number; dates: string[] }> = {};
    const vibeTexts: Array<{ emotion: string; vibeText: string }> = [];

    vibesSnapshot.docs.forEach((doc) => {
      const vibe = doc.data() as Vibe;
      if (vibe.emotion && vibe.timestamp) {
        const emotion = vibe.emotion;
        const date = (vibe.timestamp as any).toDate().toLocaleDateString();

        if (!emotionCounts[emotion]) {
          emotionCounts[emotion] = { count: 0, dates: [] };
        }
        emotionCounts[emotion].count++;
        if (!emotionCounts[emotion].dates.includes(date)) {
          emotionCounts[emotion].dates.push(date);
        }

        vibeTexts.push({
          emotion,
          vibeText: vibe.text.substring(0, 100),
        });
      }
    });

    const weeklyEmotions = Object.entries(emotionCounts).flatMap(
      ([emotion, data]) =>
        data.dates.map((date) => ({
          emotion,
          count: data.count,
          date,
        }))
    );
    
    const emotionSequence = vibesSnapshot.docs
        .map(doc => doc.data().emotion as EmotionCategory)
        .filter(Boolean);

    const moodTransitions = emotionSequence.slice(0, 5);

    const vibeMemorySnapshot = await db
      .collection('vibeMemory')
      .doc(userId)
      .get();

    let mostHelpfulContent: Array<{ emotion: string; description: string }> = [];
    
    if (vibeMemorySnapshot.exists) {
      const memoryData = vibeMemorySnapshot.data();
      const patterns = memoryData?.emotionPatterns || {};
      
      mostHelpfulContent = Object.entries(patterns)
        .filter(([, data]: any) => data.preferredHealing?.length > 0)
        .map(([emotion, data]: any) => ({
          emotion,
          description: `Content about ${data.preferredHealing.join(', ')} helped when feeling ${emotion}`,
        }));
    }

    const input: WeeklyReflectionInput = {
      userId,
      weeklyEmotions,
      moodTransitions,
      topEngagedContent: vibeTexts.slice(0, 5),
      mostHelpfulContent,
    };

    const reflection = await getWeeklyReflection(input);
     if (!reflection) {
      throw new Error('The AI model failed to return a reflection. Please try again later.');
    }

    return NextResponse.json({
      success: true,
      reflection,
    });
  } catch (error: any) {
    console.error('Error generating weekly reflection:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to generate reflection',
      },
      { status: 500 }
    );
  }
}
