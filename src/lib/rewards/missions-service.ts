import type { Mission } from '../types';
import { Timestamp } from 'firebase/firestore';

export const DAILY_MISSIONS: Omit<Mission, 'id' | 'current' | 'isCompleted' | 'completedAt' | 'claimed' | 'claimedAt'>[] = [
  {
    type: 'daily',
    title: 'Share Your Vibe',
    description: 'Post 3 vibes today',
    target: 3,
    reward: { xp: 30, coins: 10 },
    conditions: { action: 'post_vibe' },
  },
  {
    type: 'daily',
    title: 'Spread Positivity',
    description: 'React to 10 vibes',
    target: 10,
    reward: { xp: 20, coins: 5 },
    conditions: { action: 'react_vibe' },
  },
  {
    type: 'daily',
    title: 'Be Helpful',
    description: 'Leave 5 helpful comments',
    target: 5,
    reward: { xp: 25, coins: 10 },
    conditions: { action: 'helpful_comment', minCharLength: 10 },
  },
  {
    type: 'daily',
    title: 'Community Builder',
    description: 'Interact with 15 different vibes (react or comment)',
    target: 15,
    reward: { xp: 40, coins: 15 },
    conditions: { action: 'interact_vibes' },
  },
];

export const WEEKLY_MISSIONS: Omit<Mission, 'id' | 'current' | 'isCompleted' | 'completedAt' | 'claimed' | 'claimedAt' | 'expiresAt'>[] = [
  {
    type: 'weekly',
    title: 'Weekly Warrior',
    description: 'Post vibes for 5 different days this week',
    target: 5,
    reward: { xp: 200, coins: 100 },
    conditions: { action: 'post_vibe_unique_days' },
  },
  {
    type: 'weekly',
    title: 'Support Champion',
    description: 'Receive 50 reactions across all your vibes',
    target: 50,
    reward: { xp: 150, coins: 75 },
    conditions: { action: 'receive_reactions' },
  },
  {
    type: 'weekly',
    title: 'Helpful Hero',
    description: 'Get 10 of your comments marked as helpful',
    target: 10,
    reward: { xp: 250, coins: 150, badge: 'helpful_hero' },
    conditions: { action: 'helpful_votes', requiresVerification: true },
  },
  {
    type: 'weekly',
    title: 'City Pride',
    description: 'Participate in a city challenge',
    target: 1,
    reward: { xp: 100, coins: 50, badge: 'city_contributor' },
    conditions: { action: 'city_challenge_participation' },
  },
];

export function generateDailyMissions(): Mission[] {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  return DAILY_MISSIONS.map((mission, index) => ({
    ...mission,
    id: `daily_${now.toISOString().split('T')[0]}_${index}`,
    current: 0,
    isCompleted: false,
    expiresAt: Timestamp.fromDate(tomorrow),
  }));
}

export function generateWeeklyMissions(): Mission[] {
  const now = new Date();
  const nextMonday = new Date(now);
  nextMonday.setDate(now.getDate() + ((7 - now.getDay() + 1) % 7 || 7));
  nextMonday.setHours(0, 0, 0, 0);

  return WEEKLY_MISSIONS.map((mission, index) => ({
    ...mission,
    id: `weekly_${getWeekNumber(now)}_${index}`,
    current: 0,
    isCompleted: false,
    expiresAt: Timestamp.fromDate(nextMonday),
  }));
}

function getWeekNumber(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getFullYear()}-W${weekNo}`;
}

export function shouldResetDailyMissions(lastReset: Timestamp | undefined): boolean {
  if (!lastReset) return true;

  const now = new Date();
  const lastResetDate = (lastReset as any).toDate ? (lastReset as any).toDate() : new Date(lastReset);

  return now.getDate() !== lastResetDate.getDate() || 
         now.getMonth() !== lastResetDate.getMonth() || 
         now.getFullYear() !== lastResetDate.getFullYear();
}

export function shouldResetWeeklyMissions(lastReset: Timestamp | undefined): boolean {
  if (!lastReset) return true;

  const now = new Date();
  const lastResetDate = (lastReset as any).toDate ? (lastReset as any).toDate() : new Date(lastReset);

  return getWeekNumber(now) !== getWeekNumber(lastResetDate);
}

export function incrementMissionProgress(
  missions: Mission[],
  action: string,
  incrementBy: number = 1
): Mission[] {
  return missions.map(mission => {
    if (mission.isCompleted || !mission.conditions || mission.conditions.action !== action) {
      return mission;
    }

    const newCurrent = mission.current + incrementBy;
    const isCompleted = newCurrent >= mission.target;

    return {
      ...mission,
      current: Math.min(newCurrent, mission.target),
      isCompleted,
      completedAt: isCompleted && !mission.completedAt ? Timestamp.now() : mission.completedAt,
    };
  });
}

export function claimMissionReward(mission: Mission): Mission {
  if (!mission.isCompleted || mission.claimed) {
    return mission;
  }

  return {
    ...mission,
    claimed: true,
    claimedAt: Timestamp.now(),
  };
}

export function getMissionsNeedingReset(
  dailyMissions: Mission[],
  weeklyMissions: Mission[],
  lastDailyReset: Timestamp | undefined,
  lastWeeklyReset: Timestamp | undefined
): {
  needsDailyReset: boolean;
  needsWeeklyReset: boolean;
  newDailyMissions?: Mission[];
  newWeeklyMissions?: Mission[];
} {
  const needsDailyReset = shouldResetDailyMissions(lastDailyReset);
  const needsWeeklyReset = shouldResetWeeklyMissions(lastWeeklyReset);

  return {
    needsDailyReset,
    needsWeeklyReset,
    newDailyMissions: needsDailyReset ? generateDailyMissions() : undefined,
    newWeeklyMissions: needsWeeklyReset ? generateWeeklyMissions() : undefined,
  };
}
