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

function calculateLocationProximityScore(
  userLocation?: { lat: number; lng: number },
  vibeLocation?: { lat: number; lng: number }
): number {
  if (!userLocation || !vibeLocation) return 0.5;
  
  const toRad = (value: number) => (value * Math.PI) / 180;
  
  const R = 6371;
  const dLat = toRad(vibeLocation.lat - userLocation.lat);
  const dLon = toRad(vibeLocation.lng - userLocation.lng);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(userLocation.lat)) * Math.cos(toRad(vibeLocation.lat)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  if (distance < 5) return 1.0;
  if (distance < 10) return 0.9;
  if (distance < 25) return 0.7;
  if (distance < 50) return 0.5;
  if (distance < 100) return 0.3;
  return 0.1;
}

function calculateDiversityBoost(
  vibe: Vibe,
  recentVibes: Vibe[] = []
): number {
  if (recentVibes.length === 0) return 0.5;
  
  const sameAuthorCount = recentVibes.filter(v => v.userId === vibe.userId).length;
  const sameEmotionCount = recentVibes.filter(v => v.emotion === vibe.emotion).length;
  
  const authorDiversity = 1 - Math.min(1, sameAuthorCount / recentVibes.length);
  const emotionDiversity = 1 - Math.min(1, sameEmotionCount / recentVibes.length);
  
  return (authorDiversity * 0.6) + (emotionDiversity * 0.4);
}

function calculateColdStartBoost(
  vibe: Vibe,
  userProfile?: UserProfile
): number {
  const now = Date.now();
  const postTime = vibe.timestamp ? getTimestampInMillis(vibe.timestamp) : now;
  const ageInHours = (now - postTime) / (1000 * 60 * 60);
  
  const isNewVibe = ageInHours < 2;
  const hasLowEngagement = (vibe.reactionCount || 0) < 3 && (vibe.viewCount || 0) < 10;
  
  if (isNewVibe && hasLowEngagement) {
    return 1.0;
  }
  
  if (vibe.metadata?.coldStartBoost) {
    return vibe.metadata.coldStartBoost;
  }
  
  return 0;
}

export function calculateRecommendationScore(
  vibe: Vibe,
  userMood: EmotionCategory,
  userInterests?: UserInterests,
  userProfile?: UserProfile,
  recentVibes?: Vibe[]
): number {
  const ers = calculateEmotionRelevanceScore(userMood, vibe.emotion);
  
  let emotionMatchScore = ers;
  if (userInterests) {
    const affinity = userInterests.emotionAffinity[vibe.emotion] || 0;
    const totalAffinity = Object.values(userInterests.emotionAffinity).reduce((a, b) => a + b, 0);
    const normalizedAffinity = totalAffinity > 0 ? affinity / totalAffinity : 0.5;
    
    emotionMatchScore = (ers * 0.7) + (normalizedAffinity * 0.3);
    
    if (userInterests.focusEmotion === vibe.emotion) {
      const focusTime = userInterests.focusEmotionTimestamp 
        ? getTimestampInMillis(userInterests.focusEmotionTimestamp)
        : 0;
      const hoursSinceFocus = (Date.now() - focusTime) / (1000 * 60 * 60);
      
      if (hoursSinceFocus < 1) {
        emotionMatchScore = Math.min(1, emotionMatchScore + 0.2);
      }
    }
  }

  const now = Date.now();
  const postTime = vibe.timestamp ? getTimestampInMillis(vibe.timestamp) : now;
  const ageInHours = (now - postTime) / (1000 * 60 * 60);
  
  const freshnessScore = Math.max(0, 1 - (ageInHours / 24));

  let engagementQualityScore = 0.5;
  
  if (vibe.reactionCount || vibe.viewDuration || vibe.viewCount || vibe.commentCount) {
    const reactionScore = vibe.reactionCount ? Math.min(1, vibe.reactionCount / 20) : 0;
    const viewDurationScore = vibe.viewDuration ? Math.min(1, vibe.viewDuration / 60) : 0;
    const viewCountScore = vibe.viewCount ? Math.min(1, vibe.viewCount / 100) : 0;
    const commentScore = vibe.commentCount ? Math.min(1, vibe.commentCount / 10) : 0;
    
    engagementQualityScore = (reactionScore * 0.35) + (commentScore * 0.35) + (viewDurationScore * 0.2) + (viewCountScore * 0.1);
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
    
    engagementQualityScore = (engagementQualityScore * 0.8) + (contentStyleBoost * 0.2);
  }

  if (vibe.isVoiceNote && userInterests && userInterests.avgListenRate > 0.7) {
    engagementQualityScore = Math.min(1, engagementQualityScore + 0.15);
  }

  const locationProximityScore = calculateLocationProximityScore(
    userProfile?.location,
    vibe.location
  );

  const diversityBoost = calculateDiversityBoost(vibe, recentVibes);

  const coldStartBoost = calculateColdStartBoost(vibe, userProfile);

  const baseScore = 
    (emotionMatchScore * 0.40) +
    (freshnessScore * 0.20) +
    (engagementQualityScore * 0.15) +
    (locationProximityScore * 0.10) +
    (diversityBoost * 0.10) +
    (coldStartBoost * 0.05);

  const finalScore = applyDecayToScore(vibe, baseScore);

  return Math.min(1, Math.max(0, finalScore));
}

export function rankVibesWithEngagement(
  vibes: Vibe[],
  userMood: EmotionCategory,
  userInterests?: UserInterests,
  userProfile?: UserProfile,
  recentVibes?: Vibe[]
): RankedVibe[] {
  const rankedVibes: RankedVibe[] = vibes.map(vibe => {
    const score = calculateRecommendationScore(vibe, userMood, userInterests, userProfile, recentVibes);
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
      reasonForRanking: `Emotion: ${(score * 0.40).toFixed(2)}, Fresh: ${(score * 0.20).toFixed(2)}, Quality: ${(score * 0.15).toFixed(2)}, Loc: ${(score * 0.10).toFixed(2)}, Div: ${(score * 0.10).toFixed(2)}, Cold: ${(score * 0.05).toFixed(2)}`,
    };
  });

  return rankedVibes.sort((a, b) => b.calculatedVibeScore - a.calculatedVibeScore);
}
