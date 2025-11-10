import type { Vibe, EmotionCategory, RankedVibe, UserProfile } from '../types';
import { calculateEmotionRelevanceScore, applyDecayToScore } from '../feed-algorithm';

export interface UserInterests {
  userId: string;
  emotionAffinity: Record<EmotionCategory, number>;
  contentStyle: {
    shortText: number;
    mediumText: number;
    longText: number;
  };
  avgListenRate: number;
  totalEngagements: number;
  focusEmotion?: EmotionCategory;
  focusEmotionTimestamp?: any;
}

function getTimestampInMillis(timestamp: any): number {
  if (!timestamp) return Date.now();
  if (typeof timestamp === 'number') return timestamp;
  if (timestamp instanceof Date) return timestamp.getTime();
  if (timestamp.toMillis && typeof timestamp.toMillis === 'function') return timestamp.toMillis();
  if (timestamp.seconds) return timestamp.seconds * 1000;
  return Date.now();
}

export function calculateRecommendationScore(
  vibe: Vibe,
  userMood: EmotionCategory,
  userInterests?: UserInterests,
  userProfile?: UserProfile
): number {
  const ers = calculateEmotionRelevanceScore(userMood, vibe.emotion);
  
  let emotionMatchScore = ers;
  if (userInterests) {
    const affinity = userInterests.emotionAffinity[vibe.emotion] || 0;
    const totalAffinity = Object.values(userInterests.emotionAffinity).reduce((a, b) => a + b, 0);
    const normalizedAffinity = totalAffinity > 0 ? affinity / totalAffinity : 0.5;
    
    emotionMatchScore = (ers * 0.6) + (normalizedAffinity * 0.4);
    
    if (userInterests.focusEmotion === vibe.emotion) {
      const focusTime = userInterests.focusEmotionTimestamp 
        ? getTimestampInMillis(userInterests.focusEmotionTimestamp)
        : 0;
      const hoursSinceFocus = (Date.now() - focusTime) / (1000 * 60 * 60);
      
      if (hoursSinceFocus < 1) {
        emotionMatchScore = Math.min(1, emotionMatchScore + 0.3);
      }
    }
  }

  const now = Date.now();
  const postTime = vibe.timestamp ? getTimestampInMillis(vibe.timestamp) : now;
  const ageInHours = (now - postTime) / (1000 * 60 * 60);
  
  const freshnessScore = Math.max(0, 1 - (ageInHours / 24));

  let engagementScore = 0.5;
  
  if (vibe.reactionCount || vibe.viewDuration || vibe.viewCount) {
    const reactionScore = vibe.reactionCount ? Math.min(1, vibe.reactionCount / 20) : 0;
    const viewDurationScore = vibe.viewDuration ? Math.min(1, vibe.viewDuration / 60) : 0;
    const viewCountScore = vibe.viewCount ? Math.min(1, vibe.viewCount / 100) : 0;
    
    engagementScore = (reactionScore * 0.4) + (viewDurationScore * 0.3) + (viewCountScore * 0.3);
  }

  if (userInterests && vibe.text) {
    const textLength = vibe.text.length;
    let contentStyleBoost = 0;
    
    const totalStyleEngagements = 
      userInterests.contentStyle.shortText +
      userInterests.contentStyle.mediumText +
      userInterests.contentStyle.longText;
    
    if (totalStyleEngagements > 0) {
      if (textLength < 50) {
        contentStyleBoost = userInterests.contentStyle.shortText / totalStyleEngagements;
      } else if (textLength < 200) {
        contentStyleBoost = userInterests.contentStyle.mediumText / totalStyleEngagements;
      } else {
        contentStyleBoost = userInterests.contentStyle.longText / totalStyleEngagements;
      }
    }
    
    engagementScore = (engagementScore * 0.8) + (contentStyleBoost * 0.2);
  }

  if (vibe.isVoiceNote && userInterests && userInterests.avgListenRate > 0.7) {
    engagementScore = Math.min(1, engagementScore + 0.1);
  }

  const baseScore = 
    (emotionMatchScore * 0.5) +
    (freshnessScore * 0.25) +
    (engagementScore * 0.25);

  const finalScore = applyDecayToScore(vibe, baseScore);

  return Math.min(1, Math.max(0, finalScore));
}

export function rankVibesWithEngagement(
  vibes: Vibe[],
  userMood: EmotionCategory,
  userInterests?: UserInterests,
  userProfile?: UserProfile
): RankedVibe[] {
  const rankedVibes: RankedVibe[] = vibes.map(vibe => {
    const score = calculateRecommendationScore(vibe, userMood, userInterests, userProfile);
    const ers = calculateEmotionRelevanceScore(userMood, vibe.emotion);
    
    let zone: 'my-vibe' | 'healing' | 'explore' = 'explore';
    if (vibe.emotion === userMood) {
      zone = 'my-vibe';
    } else if (ers >= 0.7) {
      zone = 'healing';
    }

    return {
      ...vibe,
      zone,
      emotionRelevanceScore: ers,
      calculatedVibeScore: score,
      reasonForRanking: `Emotion: ${(score * 0.5).toFixed(2)}, Fresh: ${(score * 0.25).toFixed(2)}, Engage: ${(score * 0.25).toFixed(2)}`,
    };
  });

  return rankedVibes.sort((a, b) => b.calculatedVibeScore - a.calculatedVibeScore);
}
