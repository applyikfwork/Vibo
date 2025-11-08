import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/firebase/admin';
import { HubNotificationPreferences } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const admin = await getFirebaseAdmin();
    const db = admin.firestore();
    const token = authHeader.substring(7);
    const decodedToken = await admin.auth().verifyIdToken(token);
    const userId = decodedToken.uid;

    const prefsDoc = await db.collection('hub-notification-preferences').doc(userId).get();

    if (!prefsDoc.exists) {
      const defaultPrefs: HubNotificationPreferences = {
        userId,
        enableHubNotifications: true,
        notifyNewPosts: true,
        notifyChallenges: true,
        notifyMilestones: true,
        notifyTrendingPosts: false,
        mutedHubs: []
      };

      await db.collection('hub-notification-preferences').doc(userId).set(defaultPrefs);

      return NextResponse.json({ preferences: defaultPrefs });
    }

    return NextResponse.json({ preferences: prefsDoc.data() });

  } catch (error: any) {
    console.error('Error fetching notification preferences:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const admin = await getFirebaseAdmin();
    const db = admin.firestore();
    const token = authHeader.substring(7);
    const decodedToken = await admin.auth().verifyIdToken(token);
    const userId = decodedToken.uid;

    const updates = await req.json();

    const allowedFields = [
      'enableHubNotifications',
      'notifyNewPosts',
      'notifyChallenges',
      'notifyMilestones',
      'notifyTrendingPosts',
      'quietHoursStart',
      'quietHoursEnd',
      'mutedHubs'
    ];

    const sanitizedUpdates: Partial<HubNotificationPreferences> = {};
    for (const field of allowedFields) {
      if (field in updates) {
        sanitizedUpdates[field as keyof HubNotificationPreferences] = updates[field];
      }
    }

    if (Object.keys(sanitizedUpdates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    await db.collection('hub-notification-preferences').doc(userId).set(
      { ...sanitizedUpdates, userId },
      { merge: true }
    );

    const updatedDoc = await db.collection('hub-notification-preferences').doc(userId).get();

    return NextResponse.json({
      preferences: updatedDoc.data(),
      message: 'Notification preferences updated successfully'
    });

  } catch (error: any) {
    console.error('Error updating notification preferences:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
