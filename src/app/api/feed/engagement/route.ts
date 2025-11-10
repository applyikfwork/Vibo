import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      vibeId,
      emotion,
      textLength,
      viewDuration,
      listenedMs,
      completed,
      interactions,
    } = body;

    if (!userId || !vibeId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const admin = await getFirebaseAdmin();
    const db = admin.firestore();

    const engagementId = `${userId}_${vibeId}_${Date.now()}`;

    await db.collection('feed-engagement').doc(engagementId).set({
      userId,
      vibeId,
      emotion,
      textLength,
      viewDuration: viewDuration || 0,
      listenedMs: listenedMs || 0,
      completed: completed || false,
      interactions: interactions || {},
      timestamp: FieldValue.serverTimestamp(),
    });

    const userInterestsRef = db.collection('user-interests').doc(userId);
    const userInterests = await userInterestsRef.get();

    if (!userInterests.exists) {
      await userInterestsRef.set({
        userId,
        emotionAffinity: { [emotion]: 1 },
        contentStyle: {
          shortText: textLength < 50 ? 1 : 0,
          mediumText: textLength >= 50 && textLength < 200 ? 1 : 0,
          longText: textLength >= 200 ? 1 : 0,
        },
        avgListenRate: completed ? 1 : listenedMs ? listenedMs / 30000 : 0,
        totalEngagements: 1,
        lastUpdated: FieldValue.serverTimestamp(),
      });
    } else {
      const data = userInterests.data();
      const currentAffinity = data?.emotionAffinity || {};
      const currentStyle = data?.contentStyle || { shortText: 0, mediumText: 0, longText: 0 };
      const totalEngagements = (data?.totalEngagements || 0) + 1;

      let styleKey = 'shortText';
      if (textLength >= 200) styleKey = 'longText';
      else if (textLength >= 50) styleKey = 'mediumText';

      const updates: any = {
        [`emotionAffinity.${emotion}`]: (currentAffinity[emotion] || 0) + 1,
        [`contentStyle.${styleKey}`]: (currentStyle[styleKey] || 0) + 1,
        totalEngagements,
        lastUpdated: FieldValue.serverTimestamp(),
      };

      if (completed || listenedMs) {
        const currentAvgListenRate = data?.avgListenRate || 0;
        const newListenRate = completed ? 1 : listenedMs ? Math.min(1, listenedMs / 30000) : 0;
        updates.avgListenRate = (currentAvgListenRate * (totalEngagements - 1) + newListenRate) / totalEngagements;
      }

      if (interactions?.interest) {
        updates[`emotionAffinity.${emotion}`] = (currentAffinity[emotion] || 0) + 2;
      }

      if (interactions?.moreLikeThis) {
        updates[`emotionAffinity.${emotion}`] = (currentAffinity[emotion] || 0) + 3;
        updates.focusEmotion = emotion;
        updates.focusEmotionTimestamp = FieldValue.serverTimestamp();
      }

      await userInterestsRef.update(updates);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking engagement:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to track engagement' },
      { status: 500 }
    );
  }
}
