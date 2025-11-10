import { ChallengeTemplate, ChallengeDifficulty } from './types';

/**
 * 7 Challenge Archetype Templates
 * These are static templates that get personalized via AI
 */

export const CHALLENGE_TEMPLATES: ChallengeTemplate[] = [
  // 1. Emotion Exploration 🎭
  {
    id: 'emotion_exploration_1',
    archetype: 'emotion_exploration',
    name: 'Emotion Explorer',
    description: 'Discover and express emotions you haven\'t tried yet',
    icon: '🎭',
    difficulty: 'easy',
    cadence: 'daily',
    baseReward: {
      xp: 50,
      coins: 25,
      badges: ['emotion_explorer'],
    },
    targetRange: { min: 1, max: 5 },
    requiredSignals: ['emotion_history', 'unusedEmotions'],
    promptTemplate: `Generate a personalized emotion exploration challenge.
User has tried these emotions: {emotionHistory}
User hasn't tried: {unusedEmotions}
Current level: {level}, Tier: {tier}
Time of day: {timeOfDay}

Create an engaging challenge that encourages them to explore {targetCount} new emotion(s).
Make it personal, encouraging, and explain why trying new emotions helps emotional wellness.`,
    cooldownHours: 24,
  },
  
  // 2. Social Connector 🤝
  {
    id: 'social_connector_1',
    archetype: 'social_connector',
    name: 'Social Butterfly',
    description: 'Connect with others through reactions and support',
    icon: '🤝',
    difficulty: 'easy',
    cadence: 'daily',
    baseReward: {
      xp: 40,
      coins: 20,
    },
    targetRange: { min: 3, max: 10 },
    requiredSignals: ['reactionCount', 'currentCity'],
    promptTemplate: `Generate a social connection challenge.
User's reaction history: {reactionCount} reactions given
User's city: {currentCity}
Current engagement: {averageReactionsPerDay} reactions/day
User level: {level}

Create a challenge to react to {targetCount} vibes from people with different emotions or from their city.
Make it feel like they're building community and supporting others.`,
    cooldownHours: 12,
  },
  
  // 3. Discovery Quests 🔍
  {
    id: 'discovery_quest_1',
    archetype: 'discovery_quest',
    name: 'Vibe Detective',
    description: 'Discover vibes from new places and perspectives',
    icon: '🔍',
    difficulty: 'medium',
    cadence: 'daily',
    baseReward: {
      xp: 60,
      coins: 30,
      badges: ['vibe_detective'],
    },
    targetRange: { min: 3, max: 8 },
    requiredSignals: ['currentCity', 'emotionHistory'],
    promptTemplate: `Generate a discovery quest challenge.
User's city: {currentCity}
Emotions user likes: {favoriteEmotion}
User has visited: {visitedCities}
Level: {level}

Create a fun quest to discover {targetCount} vibes from specific locations, emotions, or contexts.
Make it feel like an adventure with a clear goal.`,
    cooldownHours: 24,
  },
  
  // 4. Streak Builder 🔥
  {
    id: 'streak_builder_1',
    archetype: 'streak_builder',
    name: 'Streak Champion',
    description: 'Build consistency by posting for consecutive days',
    icon: '🔥',
    difficulty: 'medium',
    cadence: 'weekly',
    baseReward: {
      xp: 100,
      coins: 50,
      badges: ['streak_champion'],
    },
    targetRange: { min: 3, max: 7 },
    requiredSignals: ['currentStreak', 'lastActiveDate'],
    promptTemplate: `Generate a streak building challenge.
User's current streak: {currentStreak} days
User's longest streak: {longestStreak} days
Last active: {lastActiveDate}
Level: {level}

Create a {targetCount}-day streak challenge. Make it encouraging and mention grace periods.
Celebrate their existing progress and motivate them to extend it.`,
    cooldownHours: 168, // 7 days
  },
  
  // 5. Location Explorer 📍
  {
    id: 'location_explorer_1',
    archetype: 'location_explorer',
    name: 'City Navigator',
    description: 'Share vibes from different neighborhoods and locations',
    icon: '📍',
    difficulty: 'medium',
    cadence: 'weekly',
    baseReward: {
      xp: 75,
      coins: 40,
      badges: ['city_navigator'],
      unlocks: ['location_frame'],
    },
    targetRange: { min: 2, max: 5 },
    requiredSignals: ['currentCity', 'visitedCities', 'currentLocation'],
    promptTemplate: `Generate a location exploration challenge.
User's city: {currentCity}
User has explored: {visitedCities}
Level: {level}

Create a challenge to share vibes from {targetCount} different neighborhoods or locations.
Make it feel like they're mapping the emotional landscape of their city.`,
    cooldownHours: 72,
  },
  
  // 6. Festival Specials 🎊
  {
    id: 'festival_special_1',
    archetype: 'festival_special',
    name: 'Festival Spirit',
    description: 'Celebrate cultural festivals with joyful vibes',
    icon: '🎊',
    difficulty: 'easy',
    cadence: 'festival',
    baseReward: {
      xp: 80,
      coins: 50,
      gems: 5,
      badges: ['festival_champion'],
    },
    targetRange: { min: 3, max: 10 },
    requiredSignals: ['upcomingFestivals', 'currentCity'],
    promptTemplate: `Generate a festival celebration challenge.
Upcoming festival: {festivalName} on {festivalDate}
User's city: {currentCity}
Level: {level}

Create an exciting challenge to share {targetCount} Festival Joy vibes during {festivalName}.
Make it culturally relevant and celebratory. Include festival traditions if appropriate.`,
    cooldownHours: 48,
  },
  
  // 7. Flash Challenges ⚡
  {
    id: 'flash_challenge_1',
    archetype: 'flash_challenge',
    name: 'Flash Mission',
    description: 'Limited time, limited slots - act fast!',
    icon: '⚡',
    difficulty: 'hard',
    cadence: 'hourly',
    baseReward: {
      xp: 200,
      coins: 100,
      gems: 10,
      badges: ['flash_champion'],
    },
    targetRange: { min: 5, max: 15 },
    requiredSignals: ['level', 'completionRate'],
    promptTemplate: `Generate an exciting flash challenge with urgency.
User level: {level}
User completion rate: {completionRate}
Time remaining: {timeRemaining}
Slots remaining: {slotsRemaining}

Create a high-energy challenge to complete {targetCount} actions within {timeRemaining}.
Make it feel exclusive and urgent. Use action words and create FOMO.`,
    cooldownHours: 6,
  },
];

// Difficulty multipliers for rewards
export const DIFFICULTY_MULTIPLIERS: Record<ChallengeDifficulty, number> = {
  easy: 1.0,
  medium: 1.5,
  hard: 2.0,
  expert: 3.0,
};

// Helper to get templates by archetype
export function getTemplatesByArchetype(archetype: string): ChallengeTemplate[] {
  return CHALLENGE_TEMPLATES.filter(t => t.archetype === archetype);
}

// Helper to get template by ID
export function getTemplateById(id: string): ChallengeTemplate | undefined {
  return CHALLENGE_TEMPLATES.find(t => t.id === id);
}

// Helper to calculate reward with difficulty multiplier
export function calculateChallengeReward(
  baseReward: ChallengeTemplate['baseReward'],
  difficulty: ChallengeDifficulty
) {
  const multiplier = DIFFICULTY_MULTIPLIERS[difficulty];
  return {
    xp: Math.floor(baseReward.xp * multiplier),
    coins: Math.floor(baseReward.coins * multiplier),
    gems: baseReward.gems ? Math.floor(baseReward.gems * multiplier) : undefined,
    badges: baseReward.badges,
    unlocks: baseReward.unlocks,
  };
}
