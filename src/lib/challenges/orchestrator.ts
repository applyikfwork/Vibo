/**
 * Challenge Orchestrator Service
 * Generates and assigns challenges based on cadence (hourly, daily, weekly, festival)
 */

import { Timestamp } from 'firebase-admin/firestore';
import {
  ChallengeInstance,
  ChallengeTemplate,
  UserChallengeSignals,
  UserChallengeSummary,
  ChallengeDifficulty,
  ChallengeArchetype,
} from './types';
import { CHALLENGE_TEMPLATES, calculateChallengeReward } from './templates';
import { personalizeChallenge } from './ai-personalizer';

/**
 * Generate challenge instances for a specific cadence
 */
export async function generateChallengeInstances(
  cadence: 'hourly' | 'daily' | 'weekly' | 'festival',
  festivalContext?: { id: string; name: string; date: string }
): Promise<ChallengeInstance[]> {
  const templates = CHALLENGE_TEMPLATES.filter(t => t.cadence === cadence);
  const instances: ChallengeInstance[] = [];

  for (const template of templates) {
    // Skip festival challenges if no festival context
    if (template.archetype === 'festival_special' && !festivalContext) {
      continue;
    }

    const instance = await createChallengeInstance(template, festivalContext);
    instances.push(instance);
  }

  return instances;
}

/**
 * Create a single challenge instance from template
 */
async function createChallengeInstance(
  template: ChallengeTemplate,
  festivalContext?: { id: string; name: string; date: string }
): Promise<ChallengeInstance> {
  const now = Timestamp.now();
  const expiresAt = calculateExpiry(template.cadence);

  // Calculate target (middle of range for template-based)
  const target = Math.floor(
    (template.targetRange.min + template.targetRange.max) / 2
  );

  const instance: ChallengeInstance = {
    id: generateChallengeId(template),
    templateId: template.id,
    archetype: template.archetype,
    cadence: template.cadence,
    difficulty: template.difficulty,
    title: template.name,
    description: template.description,
    motivationalMessage: 'Complete this challenge to earn rewards!',
    target,
    targetDescription: `${target} actions`,
    reward: calculateChallengeReward(template.baseReward, template.difficulty),
    createdAt: now,
    expiresAt,
    metadata: {
      generatedBy: 'template',
      festivalId: festivalContext?.id,
    },
  };

  // Add flash challenge limits
  if (template.archetype === 'flash_challenge') {
    instance.maxParticipants = 100;
    instance.currentParticipants = 0;
  }

  return instance;
}

/**
 * Assign personalized challenges to a user
 */
export async function assignChallengesToUser(
  userId: string,
  userSignals: UserChallengeSignals,
  maxChallenges: number = 5
): Promise<UserChallengeSummary[]> {
  // Select appropriate challenges based on user signals
  const selectedTemplates = selectChallengesForUser(userSignals, maxChallenges);
  
  const summaries: UserChallengeSummary[] = [];

  for (const template of selectedTemplates) {
    try {
      // Determine difficulty based on user's completion rate
      const difficulty = determineDifficulty(userSignals);

      // Personalize using AI
      const personalized = await personalizeChallenge({
        templateId: template.id,
        archetype: template.archetype,
        difficulty,
        userSignals,
        contextualHints: {
          timeOfDay: getTimeOfDay(),
          dayOfWeek: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
        },
      });

      const expiresAt = calculateExpiry(template.cadence);
      const reward = calculateChallengeReward(template.baseReward, difficulty);

      const summary: UserChallengeSummary = {
        id: `${userId}_${template.id}_${Date.now()}`,
        archetype: template.archetype,
        title: personalized.title,
        current: 0,
        target: personalized.target,
        expiresAt,
        reward,
        status: 'active',
      };

      summaries.push(summary);
    } catch (error) {
      console.error(`Error personalizing challenge ${template.id}:`, error);
      // Skip this challenge on error
    }
  }

  return summaries;
}

/**
 * Select appropriate challenges for user based on signals
 */
function selectChallengesForUser(
  signals: UserChallengeSignals,
  maxChallenges: number
): ChallengeTemplate[] {
  const candidates: Array<{ template: ChallengeTemplate; score: number }> = [];

  for (const template of CHALLENGE_TEMPLATES) {
    // Skip if user recently completed this archetype (cooldown)
    if (isInCooldown(template, signals.recentCompletions)) {
      continue;
    }

    // Calculate relevance score
    let score = 50; // Base score

    // Boost emotion exploration if user hasn't tried many emotions
    if (
      template.archetype === 'emotion_exploration' &&
      signals.unusedEmotions.length > 8
    ) {
      score += 30;
    }

    // Boost social connector if user has low reaction count
    if (
      template.archetype === 'social_connector' &&
      signals.averageReactionsPerDay < 3
    ) {
      score += 25;
    }

    // Boost streak builder if user has an active streak
    if (
      template.archetype === 'streak_builder' &&
      signals.currentStreak > 0
    ) {
      score += 40;
    }

    // Boost location explorer if user has location data
    if (
      template.archetype === 'location_explorer' &&
      signals.currentLocation
    ) {
      score += 20;
    }

    // Boost festival special if there are upcoming festivals
    if (
      template.archetype === 'festival_special' &&
      signals.upcomingFestivals &&
      signals.upcomingFestivals.length > 0
    ) {
      score += 50;
    }

    // Boost flash challenges for high-engagement users
    if (template.archetype === 'flash_challenge' && signals.level > 5) {
      score += 15;
    }

    candidates.push({ template, score });
  }

  // Sort by score and take top N
  return candidates
    .sort((a, b) => b.score - a.score)
    .slice(0, maxChallenges)
    .map(c => c.template);
}

/**
 * Check if template is in cooldown period
 */
function isInCooldown(
  template: ChallengeTemplate,
  recentCompletions: UserChallengeSignals['recentCompletions']
): boolean {
  if (!template.cooldownHours) return false;

  const cooldownMs = template.cooldownHours * 60 * 60 * 1000;
  const now = Date.now();

  const recentCompletion = recentCompletions.find(
    c => c.archetype === template.archetype
  );

  if (!recentCompletion) return false;

  const completedAt = recentCompletion.completedAt.toMillis();
  return now - completedAt < cooldownMs;
}

/**
 * Determine difficulty based on user's performance
 */
function determineDifficulty(signals: UserChallengeSignals): ChallengeDifficulty {
  const { completionRate, level } = signals;

  // High performers get harder challenges
  if (completionRate > 0.8 && level > 10) return 'expert';
  if (completionRate > 0.7 && level > 5) return 'hard';
  if (completionRate > 0.5) return 'medium';
  
  return 'easy';
}

/**
 * Calculate expiry time based on cadence
 */
function calculateExpiry(cadence: string): Timestamp {
  const now = new Date();
  let expiryDate = new Date(now);

  switch (cadence) {
    case 'hourly':
      expiryDate.setHours(expiryDate.getHours() + 2);
      break;
    case 'daily':
      expiryDate.setHours(23, 59, 59, 999);
      break;
    case 'weekly':
      expiryDate.setDate(expiryDate.getDate() + 7);
      break;
    case 'festival':
      expiryDate.setDate(expiryDate.getDate() + 3); // 3 days for festivals
      break;
    default:
      expiryDate.setHours(23, 59, 59, 999);
  }

  return Timestamp.fromDate(expiryDate);
}

/**
 * Generate unique challenge ID
 */
function generateChallengeId(template: ChallengeTemplate): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${template.archetype}_${timestamp}_${random}`;
}

/**
 * Get current time of day
 */
function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

/**
 * Build user signals from user data
 */
export function buildUserSignals(
  userData: any,
  userId: string
): UserChallengeSignals {
  const allEmotions = [
    'Happy',
    'Sad',
    'Angry',
    'Excited',
    'Calm',
    'Anxious',
    'Grateful',
    'Motivated',
    'Confused',
    'Proud',
    'Lonely',
    'Hopeful',
    'Stressed',
    'Peaceful',
    'Festival Joy',
    'Overwhelmed',
  ];

  const emotionHistory = userData.emotionHistory || [];
  const usedEmotions = emotionHistory.map((e: any) => e.emotion);
  const unusedEmotions = allEmotions.filter(e => !usedEmotions.includes(e));

  return {
    userId,
    emotionHistory,
    unusedEmotions,
    favoriteEmotion: emotionHistory[0]?.emotion,
    reactionCount: userData.reactionCount || 0,
    commentCount: userData.commentCount || 0,
    averageReactionsPerDay: userData.averageReactionsPerDay || 0,
    currentCity: userData.city || 'your city',
    visitedCities: userData.visitedCities || [],
    currentLocation: userData.currentLocation,
    currentStreak: userData.currentStreak || 0,
    longestStreak: userData.longestStreak || 0,
    lastActiveDate: userData.lastActiveDate,
    averagePostsPerDay: userData.averagePostsPerDay || 0,
    level: userData.level || 1,
    tier: userData.tier || 'bronze',
    timezone: userData.timezone || 'Asia/Kolkata',
    recentCompletions: userData.recentChallengeCompletions || [],
    completionRate: userData.challengeCompletionRate || 0.5,
    averageDifficulty: userData.averageChallengeDifficulty || 'easy',
    upcomingFestivals: userData.upcomingFestivals || [],
  };
}
