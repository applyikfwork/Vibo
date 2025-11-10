export type LevelConfig = {
  level: number;
  requiredXP: number;
  title: string;
  unlocks: string[];
  coinReward: number;
};

export const LEVEL_CONFIGS: LevelConfig[] = [
  { level: 1, requiredXP: 0, title: 'Newbie', unlocks: ['Basic profile'], coinReward: 0 },
  { level: 2, requiredXP: 100, title: 'Explorer', unlocks: ['Profile color'], coinReward: 50 },
  { level: 3, requiredXP: 300, title: 'Contributor', unlocks: ['Custom emoji reactions'], coinReward: 50 },
  { level: 4, requiredXP: 600, title: 'Active', unlocks: ['Profile themes'], coinReward: 50 },
  { level: 5, requiredXP: 1000, title: 'Active Member', unlocks: ['Custom profile color', 'Badge frames'], coinReward: 100 },
  { level: 6, requiredXP: 1500, title: 'Regular', unlocks: ['Priority support'], coinReward: 50 },
  { level: 7, requiredXP: 2100, title: 'Dedicated', unlocks: ['Special reactions'], coinReward: 50 },
  { level: 8, requiredXP: 2800, title: 'Committed', unlocks: ['Advanced filters'], coinReward: 50 },
  { level: 9, requiredXP: 3600, title: 'Enthusiast', unlocks: ['Profile backgrounds'], coinReward: 50 },
  { level: 10, requiredXP: 5000, title: 'Community Regular', unlocks: ['Animated badge', 'VIP flair'], coinReward: 100 },
  { level: 11, requiredXP: 6500, title: 'Supporter', unlocks: ['Custom frames'], coinReward: 50 },
  { level: 12, requiredXP: 8200, title: 'Advocate', unlocks: ['Featured profile'], coinReward: 50 },
  { level: 13, requiredXP: 10100, title: 'Champion', unlocks: ['Exclusive badges'], coinReward: 50 },
  { level: 14, requiredXP: 12300, title: 'Hero', unlocks: ['Priority in feeds'], coinReward: 50 },
  { level: 15, requiredXP: 15000, title: 'Vibe Master', unlocks: ['Featured User badge', 'Custom colors'], coinReward: 150 },
  { level: 16, requiredXP: 18000, title: 'Influencer', unlocks: ['Special challenges'], coinReward: 50 },
  { level: 17, requiredXP: 21500, title: 'Trendsetter', unlocks: ['Trending boost'], coinReward: 50 },
  { level: 18, requiredXP: 25500, title: 'Mentor', unlocks: ['Help others badge'], coinReward: 50 },
  { level: 19, requiredXP: 30000, title: 'Guide', unlocks: ['Community guide'], coinReward: 50 },
  { level: 20, requiredXP: 35000, title: 'Emotion Guide', unlocks: ['Profile video', 'Advanced analytics'], coinReward: 200 },
  { level: 21, requiredXP: 40500, title: 'Ambassador', unlocks: ['Ambassador badge'], coinReward: 50 },
  { level: 22, requiredXP: 46500, title: 'Expert', unlocks: ['Expert flair'], coinReward: 50 },
  { level: 23, requiredXP: 53000, title: 'Master', unlocks: ['Master badge'], coinReward: 50 },
  { level: 24, requiredXP: 60000, title: 'Elite', unlocks: ['Elite features'], coinReward: 50 },
  { level: 25, requiredXP: 65000, title: 'City Legend', unlocks: ['Custom username color', 'City leader'], coinReward: 200 },
  { level: 26, requiredXP: 71000, title: 'Regional Star', unlocks: ['Regional badge'], coinReward: 50 },
  { level: 27, requiredXP: 77500, title: 'State Champion', unlocks: ['State leader'], coinReward: 50 },
  { level: 28, requiredXP: 84500, title: 'National Hero', unlocks: ['National recognition'], coinReward: 50 },
  { level: 29, requiredXP: 92000, title: 'Legend', unlocks: ['Legend status'], coinReward: 50 },
  { level: 30, requiredXP: 100000, title: 'National Icon', unlocks: ['Exclusive emoji reactions', 'Icon badge'], coinReward: 300 },
  { level: 31, requiredXP: 110000, title: 'Superstar', unlocks: ['Superstar flair'], coinReward: 50 },
  { level: 32, requiredXP: 121000, title: 'Phenomenon', unlocks: ['Phenomenon badge'], coinReward: 50 },
  { level: 33, requiredXP: 133000, title: 'Inspiration', unlocks: ['Inspire others'], coinReward: 50 },
  { level: 34, requiredXP: 146000, title: 'Visionary', unlocks: ['Visionary badge'], coinReward: 50 },
  { level: 35, requiredXP: 160000, title: 'Pioneer', unlocks: ['Pioneer features'], coinReward: 100 },
  { level: 36, requiredXP: 175000, title: 'Trailblazer', unlocks: ['Trailblazer badge'], coinReward: 50 },
  { level: 37, requiredXP: 191000, title: 'Revolutionary', unlocks: ['Revolutionary flair'], coinReward: 50 },
  { level: 38, requiredXP: 208000, title: 'Luminary', unlocks: ['Luminary status'], coinReward: 50 },
  { level: 39, requiredXP: 226000, title: 'Icon', unlocks: ['Icon recognition'], coinReward: 50 },
  { level: 40, requiredXP: 245000, title: 'Living Legend', unlocks: ['Living legend badge'], coinReward: 100 },
  { level: 41, requiredXP: 265000, title: 'Mythic', unlocks: ['Mythic effects'], coinReward: 50 },
  { level: 42, requiredXP: 286000, title: 'Eternal', unlocks: ['Eternal badge'], coinReward: 50 },
  { level: 43, requiredXP: 308000, title: 'Transcendent', unlocks: ['Transcendent flair'], coinReward: 50 },
  { level: 44, requiredXP: 331000, title: 'Cosmic', unlocks: ['Cosmic effects'], coinReward: 50 },
  { level: 45, requiredXP: 355000, title: 'Divine', unlocks: ['Divine badge'], coinReward: 100 },
  { level: 46, requiredXP: 380000, title: 'Supreme', unlocks: ['Supreme status'], coinReward: 50 },
  { level: 47, requiredXP: 406000, title: 'Ultimate', unlocks: ['Ultimate features'], coinReward: 50 },
  { level: 48, requiredXP: 433000, title: 'Apex', unlocks: ['Apex badge'], coinReward: 50 },
  { level: 49, requiredXP: 461000, title: 'Zenith', unlocks: ['Zenith flair'], coinReward: 50 },
  { level: 50, requiredXP: 500000, title: 'Vibee Legend', unlocks: ['Legend of Vibee', 'All features unlocked', 'Permanent recognition'], coinReward: 500 },
];

export function calculateLevel(xp: number): number {
  for (let i = LEVEL_CONFIGS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_CONFIGS[i].requiredXP) {
      return LEVEL_CONFIGS[i].level;
    }
  }
  return 1;
}

export function getLevelConfig(level: number): LevelConfig {
  return LEVEL_CONFIGS.find(l => l.level === level) || LEVEL_CONFIGS[0];
}

export function getNextLevelConfig(currentLevel: number): LevelConfig | null {
  const nextLevel = currentLevel + 1;
  return LEVEL_CONFIGS.find(l => l.level === nextLevel) || null;
}

export function getProgressToNextLevel(xp: number, currentLevel: number): {
  currentXP: number;
  requiredXP: number;
  xpToNext: number;
  percentage: number;
  nextLevel: LevelConfig | null;
} {
  const current = getLevelConfig(currentLevel);
  const next = getNextLevelConfig(currentLevel);

  if (!next) {
    return {
      currentXP: xp,
      requiredXP: current.requiredXP,
      xpToNext: 0,
      percentage: 100,
      nextLevel: null,
    };
  }

  const xpInCurrentLevel = xp - current.requiredXP;
  const xpNeededForNextLevel = next.requiredXP - current.requiredXP;
  const percentage = Math.min((xpInCurrentLevel / xpNeededForNextLevel) * 100, 100);

  return {
    currentXP: xp,
    requiredXP: next.requiredXP,
    xpToNext: next.requiredXP - xp,
    percentage,
    nextLevel: next,
  };
}

export function getRecentlyUnlockedFeatures(oldLevel: number, newLevel: number): string[] {
  const unlocks: string[] = [];
  
  for (let level = oldLevel + 1; level <= newLevel; level++) {
    const config = getLevelConfig(level);
    if (config) {
      unlocks.push(...config.unlocks);
    }
  }
  
  return unlocks;
}

export function getTotalCoinsEarnedFromLevels(currentLevel: number): number {
  let total = 0;
  for (let level = 1; level <= currentLevel; level++) {
    const config = getLevelConfig(level);
    if (config) {
      total += config.coinReward;
    }
  }
  return total;
}
