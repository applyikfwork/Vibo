import { NextRequest, NextResponse } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';
import { getFirebaseAdmin } from '@/firebase/admin';
import { DAILY_MISSIONS, WEEKLY_MISSIONS } from '@/lib/gamification';
import { Mission } from '@/lib/types';

function shouldResetDailyMissions(lastReset: Timestamp | undefined): boolean {
  if (!lastReset) return true;
  const lastResetDate = lastReset.toDate();
  const now = new Date();
  return lastResetDate.toDateString() !== now.toDateString();
}

function shouldResetWeeklyMissions(lastReset: Timestamp | undefined): boolean {
  if (!lastReset) return true;
  const lastResetDate = lastReset.toDate();
  const now = new Date();
  
  const daysSinceReset = Math.floor((now.getTime() - lastResetDate.getTime()) / (1000 * 60 * 60 * 24));
  return daysSinceReset >= 7;
}

function initializeMissions(templates: any[], type: 'daily' | 'weekly'): Mission[] {
  const expiresAt = new Date();
  if (type === 'daily') {
    expiresAt.setHours(23, 59, 59, 999);
  } else {
    expiresAt.setDate(expiresAt.getDate() + 7);
  }

  return templates.map(template => ({
    ...template,
    current: 0,
    isCompleted: false,
    expiresAt: Timestamp.fromDate(expiresAt)
  }));
}

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

    const db = admin.firestore();
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data();
    let dailyMissions = userData?.dailyMissions || [];
    let weeklyMissions = userData?.weeklyMissions || [];
    const specialMissions = userData?.specialMissions || [];

    if (shouldResetDailyMissions(userData?.lastDailyMissionReset)) {
      dailyMissions = initializeMissions(DAILY_MISSIONS, 'daily');
      await userRef.update({
        dailyMissions,
        lastDailyMissionReset: Timestamp.now()
      });
    }

    if (shouldResetWeeklyMissions(userData?.lastWeeklyMissionReset)) {
      weeklyMissions = initializeMissions(WEEKLY_MISSIONS, 'weekly');
      await userRef.update({
        weeklyMissions,
        lastWeeklyMissionReset: Timestamp.now()
      });
    }

    return NextResponse.json({
      dailyMissions,
      weeklyMissions,
      specialMissions
    });

  } catch (error: any) {
    console.error('Error fetching missions:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const admin = await getFirebaseAdmin();
    const decodedToken = await admin.auth().verifyIdToken(token);
    const userId = decodedToken.uid;

    const { missionId, missionType, incrementBy = 1 } = await req.json();

    if (!missionId || !missionType) {
      return NextResponse.json(
        { error: 'Mission ID and type are required' },
        { status: 400 }
      );
    }

    const db = admin.firestore();
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data();
    const missionField = `${missionType}Missions`;
    const missions = userData?.[missionField] || [];

    const missionIndex = missions.findIndex((m: Mission) => m.id === missionId);
    if (missionIndex === -1) {
      return NextResponse.json({ error: 'Mission not found' }, { status: 404 });
    }

    const mission = missions[missionIndex];
    if (mission.isCompleted) {
      return NextResponse.json(
        { error: 'Mission already completed' },
        { status: 400 }
      );
    }

    mission.current = Math.min(mission.current + incrementBy, mission.target);

    if (mission.current >= mission.target && !mission.isCompleted) {
      mission.isCompleted = true;
      mission.completedAt = Timestamp.now();
    }

    missions[missionIndex] = mission;

    await userRef.update({
      [missionField]: missions
    });

    return NextResponse.json({
      success: true,
      mission,
      completed: mission.isCompleted
    });

  } catch (error: any) {
    console.error('Error updating mission:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}