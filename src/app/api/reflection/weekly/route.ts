import { NextRequest, NextResponse } from 'next/server';
import { getWeeklyReflection, type WeeklyReflectionInput } from '@/ai/flows/generate-weekly-reflection';
import admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error: any) {
    console.log('Firebase admin initialization skipped:', error.message);
  }
}

const db = admin.firestore();

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const vibesSnapshot = await db
      .collection('vibes')
      .where('userId', '==', userId)
      .where('createdAt', '>=', weekAgo)
      .get();

    if (vibesSnapshot.empty) {
      return NextResponse.json({
        success: true,
        reflection: {
          summary: "You haven't shared any vibes this week yet. Start sharing your feelings to get personalized insights!",
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
      const vibe = doc.data();
      const emotion = vibe.emotion;
      const date = vibe.createdAt.toDate().toLocaleDateString();

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
    });

    const weeklyEmotions = Object.entries(emotionCounts).flatMap(
      ([emotion, data]) =>
        data.dates.map((date) => ({
          emotion,
          count: data.count,
          date,
        }))
    );

    const emotionSequence = Object.keys(emotionCounts);
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
