import type { 
  Vibe, 
  EmotionCategory, 
  RankedVibe, 
  FeedZone, 
  UserProfile,
  BoostTrigger,
  EmotionMatchConfig 
} from './types';
import { Timestamp } from 'firebase/firestore';

// Emotion matching configurations
const EMOTION_MATCH_CONFIGS: Record<EmotionCategory, EmotionMatchConfig> = {
  'Sad': {
    primaryEmotion: 'Sad',
    complementaryEmotions: ['Motivated', 'Happy', 'Chill', 'Funny'],
    oppositeEmotions: ['Angry', 'Neutral', 'Lonely'],
  },
  'Happy': {
    primaryEmotion: 'Happy',
    complementaryEmotions: ['Motivated', 'Chill', 'Funny'],
    oppositeEmotions: ['Sad', 'Lonely', 'Angry'],
  },
  'Motivated': {
    primaryEmotion: 'Motivated',
    complementaryEmotions: ['Happy', 'Chill', 'Funny'],
    oppositeEmotions: ['Sad', 'Lonely', 'Angry'],
  },
  'Lonely': {
    primaryEmotion: 'Lonely',
    complementaryEmotions: ['Chill', 'Happy', 'Motivated', 'Funny'],
    oppositeEmotions: ['Angry', 'Neutral'],
  },
  'Chill': {
    primaryEmotion: 'Chill',
    complementaryEmotions: ['Happy', 'Motivated', 'Funny'],
    oppositeEmotions: ['Angry', 'Sad'],
  },
  'Angry': {
    primaryEmotion: 'Angry',
    complementaryEmotions: ['Chill', 'Motivated', 'Funny'],
    oppositeEmotions: ['Happy', 'Sad', 'Lonely'],
  },
  'Neutral': {
    primaryEmotion: 'Neutral',
    complementaryEmotions: ['Chill', 'Happy', 'Funny'],
    oppositeEmotions: ['Angry', 'Sad', 'Motivated'],
  },
  'Funny': {
    primaryEmotion: 'Funny',
    complementaryEmotions: ['Happy', 'Chill', 'Motivated'],
    oppositeEmotions: ['Sad', 'Angry', 'Lonely'],
  },
};

// Emotion-specific decay rates
const DECAY_RATES: Record<EmotionCategory, number> = {
  'Sad': 0.92,        // Slower decay for emotional posts
  'Lonely': 0.93,     // Slower decay to allow empathy spread
  'Angry': 0.88,      // Moderate decay
  'Happy': 0.9,       // Standard decay
  'Motivated': 0.85,  // Faster decay (short energy bursts)
  'Chill': 0.91,      // Slower decay
  'Neutral': 0.9,     // Standard decay
  'Funny': 0.87,      // Faster decay for humor
};

/**
 * Stage 2: Vibe Match Engine - Calculate Emotion Relevance Score (ERS)
 * ERS = (Emotion Match * 0.6) + (Emotion Complement * 0.4)
 */
export function calculateEmotionRelevanceScore(
  userMood: EmotionCategory,
  postEmotion: EmotionCategory
): number {
  const config = EMOTION_MATCH_CONFIGS[userMood];
  
  // Perfect match
  if (userMood === postEmotion) {
    return 1.0; // High ERS for relatable content
  }
  
  // Complementary emotion (healing)
  if (config.complementaryEmotions.includes(postEmotion)) {
    return 0.75; // High ERS for healing content
  }
  
  // Opposite emotion
  if (config.oppositeEmotions.includes(postEmotion)) {
    return 0.3; // Low ERS for contrasting content
  }
  
  // Default medium score
  return 0.5;
}

/**
 * Stage 3: Dynamic Feed Formula - Calculate VibeScore
 * VibeScore = (ERS * 0.5) + (Reactions * 0.2) + (Freshness * 0.15) + (EngagementTime * 0.1) + (DiversityBoost * 0.05)
 */
export function calculateVibeScore(
  vibe: Vibe,
  ers: number,
  userProfile?: UserProfile
): number {
  const now = Date.now();
  const postTime = vibe.timestamp?.toMillis() || now;
  const ageInHours = (now - postTime) / (1000 * 60 * 60);
  
  // Freshness score (1.0 for new posts, decaying over 24 hours)
  const freshnessScore = Math.max(0, 1 - (ageInHours / 24));
  
  // Reaction score (normalized)
  const reactionCount = vibe.reactionCount || 0;
  const reactionScore = Math.min(1, reactionCount / 20); // Cap at 20 reactions = 1.0
  
  // Engagement time score (normalized)
  const viewDuration = vibe.viewDuration || 0;
  const engagementScore = Math.min(1, viewDuration / 60); // Cap at 60 seconds = 1.0
  
  // Diversity boost
  const diversityScore = vibe.diversityScore || 0.5;
  
  // Boost score
  const boostScore = vibe.boostScore || 0;
  
  // Calculate weighted VibeScore
  const baseScore = 
    (ers * 0.5) +
    (reactionScore * 0.2) +
    (freshnessScore * 0.15) +
    (engagementScore * 0.1) +
    (diversityScore * 0.05);
  
  // Apply boost
  const finalScore = baseScore + boostScore;
  
  return Math.min(1, finalScore); // Cap at 1.0
}

/**
 * Stage 4: Smart Vibe Zones - Classify posts into zones
 */
export function classifyVibeZone(
  vibe: Vibe,
  userMood: EmotionCategory,
  ers: number
): FeedZone {
  const config = EMOTION_MATCH_CONFIGS[userMood];
  
  // My Vibe Zone: Exact match
  if (vibe.emotion === userMood) {
    return 'my-vibe';
  }
  
  // Healing Zone: Complementary emotions
  if (config.complementaryEmotions.includes(vibe.emotion)) {
    return 'healing';
  }
  
  // Explore Zone: Everything else
  return 'explore';
}

/**
 * Stage 7: Post Boost System - Calculate boost scores
 */
export function calculateBoostScore(
  vibe: Vibe,
  reactions: any[] = [],
  comments: any[] = [],
  userPreviousMood?: EmotionCategory
): { boostScore: number; triggers: BoostTrigger[] } {
  const triggers: BoostTrigger[] = [];
  let totalBoost = 0;
  
  const now = Date.now();
  const postTime = vibe.timestamp?.toMillis() || now;
  const ageInMinutes = (now - postTime) / (1000 * 60);
  
  // Support Boost: 5+ positive comments
  const positiveComments = comments.filter(c => 
    c.text?.toLowerCase().includes('love') ||
    c.text?.toLowerCase().includes('support') ||
    c.text?.toLowerCase().includes('here for you')
  );
  if (positiveComments.length >= 5) {
    totalBoost += 0.2;
    triggers.push({ type: 'support', score: 0.2, triggered: true });
  }
  
  // Energy Boost: High engagement in first 10 mins
  if (ageInMinutes <= 10 && reactions.length >= 3) {
    totalBoost += 0.3;
    triggers.push({ type: 'energy', score: 0.3, triggered: true });
  }
  
  // Conversation Boost: 3+ replies
  if (comments.length >= 3) {
    totalBoost += 0.1;
    triggers.push({ type: 'conversation', score: 0.1, triggered: true });
  }
  
  // Emotional Balance Boost: Calming content after negative mood
  // Triggers when post has healing emotion after user had intense negative emotion
  if (userPreviousMood) {
    const negativeIntenseEmotions: EmotionCategory[] = ['Angry', 'Sad', 'Lonely'];
    const calmingEmotions: EmotionCategory[] = ['Chill', 'Happy', 'Motivated', 'Funny'];
    
    if (negativeIntenseEmotions.includes(userPreviousMood) && 
        calmingEmotions.includes(vibe.emotion)) {
      totalBoost += 0.4;
      triggers.push({ type: 'emotional_balance', score: 0.4, triggered: true });
    }
  }
  
  // Anonymous Compassion: Anonymous user receives comforting replies
  if (vibe.isAnonymous && positiveComments.length >= 3) {
    totalBoost += 0.25;
    triggers.push({ type: 'anonymous_compassion', score: 0.25, triggered: true });
  }
  
  return { boostScore: totalBoost, triggers };
}

/**
 * Stage 8: Cooldown & Decay System
 */
export function applyDecayToScore(
  vibe: Vibe,
  currentScore: number
): number {
  const now = Date.now();
  const postTime = vibe.timestamp?.toMillis() || now;
  const ageInHours = (now - postTime) / (1000 * 60 * 60);
  
  // No decay for posts less than 1 hour old
  if (ageInHours < 1) {
    return currentScore;
  }
  
  // Apply emotion-specific decay after 24 hours
  if (ageInHours >= 24) {
    const decayRate = DECAY_RATES[vibe.emotion] || 0.9;
    return currentScore * decayRate;
  }
  
  return currentScore;
}

/**
 * Stage 9: Adaptive Learning - Update Vibe Affinity Scores
 */
export function updateVibeAffinityScore(
  currentScores: Record<EmotionCategory, number> = {} as Record<EmotionCategory, number>,
  interactedEmotion: EmotionCategory,
  interactionType: 'view' | 'react' | 'comment'
): Record<EmotionCategory, number> {
  const scores = { ...currentScores };
  
  // Initialize if not exists
  if (!scores[interactedEmotion]) {
    scores[interactedEmotion] = 0.5;
  }
  
  // Increase affinity based on interaction type
  const boost = {
    'view': 0.02,
    'react': 0.05,
    'comment': 0.1,
  }[interactionType];
  
  scores[interactedEmotion] = Math.min(1, scores[interactedEmotion] + boost);
  
  return scores;
}

/**
 * Main Feed Ranking Algorithm
 * Combines all stages to rank vibes for a user
 */
export function rankVibesForUser(
  vibes: Vibe[],
  userMood: EmotionCategory,
  userProfile?: UserProfile
): RankedVibe[] {
  const rankedVibes: RankedVibe[] = vibes.map(vibe => {
    // Calculate ERS
    const ers = calculateEmotionRelevanceScore(userMood, vibe.emotion);
    
    // Apply affinity scores if available
    const affinityBoost = userProfile?.vibeAffinityScores?.[vibe.emotion] || 0.5;
    const adjustedERS = (ers * 0.7) + (affinityBoost * 0.3);
    
    // Calculate VibeScore
    let vibeScore = calculateVibeScore(vibe, adjustedERS, userProfile);
    
    // Apply decay
    vibeScore = applyDecayToScore(vibe, vibeScore);
    
    // Classify zone
    const zone = classifyVibeZone(vibe, userMood, adjustedERS);
    
    return {
      ...vibe,
      zone,
      emotionRelevanceScore: adjustedERS,
      calculatedVibeScore: vibeScore,
      reasonForRanking: `ERS: ${adjustedERS.toFixed(2)}, Score: ${vibeScore.toFixed(2)}`,
    };
  });
  
  // Sort by calculated score (descending)
  return rankedVibes.sort((a, b) => b.calculatedVibeScore - a.calculatedVibeScore);
}

/**
 * Generate feed with Smart Vibe Zones
 */
export function generateSmartVibeFeed(
  rankedVibes: RankedVibe[]
): {
  myVibeZone: RankedVibe[];
  healingZone: RankedVibe[];
  exploreZone: RankedVibe[];
} {
  const myVibeZone = rankedVibes
    .filter(v => v.zone === 'my-vibe')
    .slice(0, 3);
  
  const healingZone = rankedVibes
    .filter(v => v.zone === 'healing')
    .slice(0, 3);
  
  const exploreZone = rankedVibes
    .filter(v => v.zone === 'explore')
    .slice(0, 4);
  
  return { myVibeZone, healingZone, exploreZone };
}
