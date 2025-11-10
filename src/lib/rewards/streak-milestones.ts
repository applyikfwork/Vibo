export interface StreakMilestone {
  streakDays: number;
  name: string;
  description: string;
  xpReward: number;
  coinReward: number;
  badgeId?: string;
  specialReward?: string;
}

export const STREAK_MILESTONES: StreakMilestone[] = [
  {
    streakDays: 3,
    name: '3-Day Streak',
    description: 'Posted for 3 consecutive days',
    xpReward: 50,
    coinReward: 25,
    specialReward: 'Streak badge glow effect',
  },
  {
    streakDays: 7,
    name: 'Week Warrior',
    description: 'Completed a full week',
    xpReward: 1000,
    coinReward: 100,
    badgeId: 'consistent',
    specialReward: 'Fire emoji effect',
  },
  {
    streakDays: 14,
    name: 'Two Week Champion',
    description: 'Posted for two weeks straight',
    xpReward: 250,
    coinReward: 150,
    specialReward: 'Double fire effect',
  },
  {
    streakDays: 30,
    name: 'Monthly Legend',
    description: 'A full month of vibing',
    xpReward: 2000,
    coinReward: 500,
    badgeId: 'dedicated',
    specialReward: 'Halo effect on profile',
  },
  {
    streakDays: 60,
    name: 'Two Month Master',
    description: 'Incredible dedication',
    xpReward: 1000,
    coinReward: 750,
    specialReward: 'Golden aura',
  },
  {
    streakDays: 100,
    name: 'Century Achiever',
    description: '100 days of continuous vibing',
    xpReward: 5000,
    coinReward: 2000,
    badgeId: 'unstoppable',
    specialReward: 'Diamond streak badge',
  },
  {
    streakDays: 365,
    name: 'Annual Legend',
    description: 'A full year of daily vibes',
    xpReward: 10000,
    coinReward: 5000,
    specialReward: 'Crown and rainbow effect',
  },
];

export function getStreakMilestone(streakDays: number): StreakMilestone | null {
  return STREAK_MILESTONES.find(m => m.streakDays === streakDays) || null;
}

export function getNextStreakMilestone(currentStreak: number): StreakMilestone | null {
  for (const milestone of STREAK_MILESTONES) {
    if (milestone.streakDays > currentStreak) {
      return milestone;
    }
  }
  return null;
}

export function getAllAchievedMilestones(currentStreak: number): StreakMilestone[] {
  return STREAK_MILESTONES.filter(m => m.streakDays <= currentStreak);
}

export function getStreakProgress(currentStreak: number): {
  current: number;
  nextMilestone: StreakMilestone | null;
  daysToNext: number;
  percentage: number;
} {
  const next = getNextStreakMilestone(currentStreak);
  
  if (!next) {
    return {
      current: currentStreak,
      nextMilestone: null,
      daysToNext: 0,
      percentage: 100,
    };
  }

  const achieved = STREAK_MILESTONES.filter(m => m.streakDays <= currentStreak);
  const previousMilestone = achieved.length > 0 ? achieved[achieved.length - 1] : null;
  const previousDays = previousMilestone ? previousMilestone.streakDays : 0;
  
  const progress = currentStreak - previousDays;
  const required = next.streakDays - previousDays;
  const percentage = Math.min((progress / required) * 100, 100);

  return {
    current: currentStreak,
    nextMilestone: next,
    daysToNext: next.streakDays - currentStreak,
    percentage,
  };
}
