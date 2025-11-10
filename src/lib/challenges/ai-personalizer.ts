// Integration with blueprint:javascript_gemini
// Using Google Gemini AI for challenge personalization

import { GoogleGenAI } from "@google/genai";
import {
  ChallengeTemplate,
  ChallengePersonalizationRequest,
  ChallengePersonalizationResponse,
  UserChallengeSignals,
} from './types';
import { getTemplateById } from './templates';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

/**
 * Generate personalized challenge using Gemini AI
 */
export async function personalizeChallenge(
  request: ChallengePersonalizationRequest
): Promise<ChallengePersonalizationResponse> {
  const template = getTemplateById(request.templateId);
  
  if (!template) {
    throw new Error(`Template not found: ${request.templateId}`);
  }

  // Calculate target based on difficulty and template range
  const target = calculateTarget(template, request.difficulty, request.userSignals);
  
  // Build context-aware prompt
  const prompt = buildPersonalizationPrompt(template, request, target);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: `You are an expert at creating personalized, motivational challenges for an emotional wellness app called Vibee OS. 
Your challenges should be:
- Personal and relevant to the user's patterns
- Encouraging and positive in tone
- Clear and actionable
- Culturally sensitive (app is for Indian users)
- Brief but impactful (title: 5-8 words, description: 20-30 words, motivation: 15-25 words)

Always respond in valid JSON format with these exact fields:
{
  "title": "short engaging title",
  "description": "clear description of what to do",
  "motivationalMessage": "encouraging message that inspires action",
  "targetDescription": "specific description like '3 different emotions' or '5 reactions'"
}`,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            motivationalMessage: { type: "string" },
            targetDescription: { type: "string" },
          },
          required: ["title", "description", "motivationalMessage", "targetDescription"],
        },
      },
      contents: prompt,
    });

    const rawJson = response.text;
    
    if (!rawJson) {
      throw new Error("Empty response from Gemini AI");
    }

    const aiResponse = JSON.parse(rawJson);

    return {
      title: aiResponse.title,
      description: aiResponse.description,
      motivationalMessage: aiResponse.motivationalMessage,
      target,
      targetDescription: aiResponse.targetDescription,
      estimatedCompletionTime: estimateCompletionTime(template.archetype, target),
    };

  } catch (error) {
    console.error('Error personalizing challenge with Gemini:', error);
    
    // Fallback to template-based generation
    return generateFallbackChallenge(template, target, request.userSignals);
  }
}

/**
 * Build personalization prompt from template and user signals
 */
function buildPersonalizationPrompt(
  template: ChallengeTemplate,
  request: ChallengePersonalizationRequest,
  target: number
): string {
  const { userSignals, contextualHints } = request;
  
  // Replace template variables
  let prompt = template.promptTemplate
    .replace('{emotionHistory}', formatEmotionHistory(userSignals.emotionHistory))
    .replace('{unusedEmotions}', userSignals.unusedEmotions.join(', ') || 'none')
    .replace('{favoriteEmotion}', userSignals.favoriteEmotion || 'unknown')
    .replace('{reactionCount}', String(userSignals.reactionCount))
    .replace('{currentCity}', userSignals.currentCity || 'your city')
    .replace('{visitedCities}', userSignals.visitedCities.join(', ') || 'none yet')
    .replace('{currentStreak}', String(userSignals.currentStreak))
    .replace('{longestStreak}', String(userSignals.longestStreak))
    .replace('{lastActiveDate}', userSignals.lastActiveDate?.toDate().toLocaleDateString() || 'unknown')
    .replace('{level}', String(userSignals.level))
    .replace('{tier}', userSignals.tier)
    .replace('{targetCount}', String(target))
    .replace('{averageReactionsPerDay}', String(userSignals.averageReactionsPerDay.toFixed(1)))
    .replace('{completionRate}', `${(userSignals.completionRate * 100).toFixed(0)}%`)
    .replace('{timeOfDay}', contextualHints?.timeOfDay || 'day');

  // Add festival context if applicable
  if (template.archetype === 'festival_special' && userSignals.upcomingFestivals?.[0]) {
    const festival = userSignals.upcomingFestivals[0];
    prompt = prompt
      .replace('{festivalName}', festival.name)
      .replace('{festivalDate}', festival.date);
  }

  // Add flash challenge urgency
  if (template.archetype === 'flash_challenge') {
    prompt = prompt
      .replace('{timeRemaining}', '2 hours')
      .replace('{slotsRemaining}', '47 slots');
  }

  return prompt;
}

/**
 * Calculate target based on difficulty and user signals
 */
function calculateTarget(
  template: ChallengeTemplate,
  difficulty: string,
  signals: UserChallengeSignals
): number {
  const { min, max } = template.targetRange;
  const range = max - min;
  
  // Base target on difficulty
  let targetPercent = 0.3; // easy
  if (difficulty === 'medium') targetPercent = 0.5;
  if (difficulty === 'hard') targetPercent = 0.7;
  if (difficulty === 'expert') targetPercent = 1.0;
  
  // Adjust based on user's completion rate
  if (signals.completionRate > 0.8) {
    targetPercent = Math.min(1.0, targetPercent + 0.2); // Make it harder for high achievers
  } else if (signals.completionRate < 0.4) {
    targetPercent = Math.max(0.2, targetPercent - 0.2); // Make it easier for struggling users
  }
  
  const target = Math.round(min + (range * targetPercent));
  return Math.max(min, Math.min(max, target));
}

/**
 * Format emotion history for prompt
 */
function formatEmotionHistory(
  history: { emotion: string; count: number }[]
): string {
  if (!history || history.length === 0) return 'no emotions shared yet';
  
  return history
    .slice(0, 5)
    .map(e => `${e.emotion} (${e.count}x)`)
    .join(', ');
}

/**
 * Estimate completion time based on archetype and target
 */
function estimateCompletionTime(archetype: string, target: number): string {
  const timePerAction: Record<string, number> = {
    emotion_exploration: 5, // 5 min per emotion post
    social_connector: 2, // 2 min per reaction
    discovery_quest: 10, // 10 min per discovery
    streak_builder: 1440, // 1 day per streak day
    location_explorer: 30, // 30 min per location
    festival_special: 8, // 8 min per festival vibe
    flash_challenge: 3, // 3 min per action
  };

  const minutes = (timePerAction[archetype] || 5) * target;
  
  if (minutes < 60) return `${minutes} minutes`;
  if (minutes < 1440) return `${Math.round(minutes / 60)} hours`;
  return `${Math.round(minutes / 1440)} days`;
}

/**
 * Fallback challenge generation (template-based, no AI)
 */
function generateFallbackChallenge(
  template: ChallengeTemplate,
  target: number,
  signals: UserChallengeSignals
): ChallengePersonalizationResponse {
  const archetypeTitles: Record<string, string> = {
    emotion_exploration: `Try ${target} New Emotions`,
    social_connector: `React to ${target} Vibes`,
    discovery_quest: `Discover ${target} Vibes`,
    streak_builder: `${target}-Day Streak Challenge`,
    location_explorer: `Explore ${target} Locations`,
    festival_special: `Share ${target} Festival Vibes`,
    flash_challenge: `Complete ${target} Actions Fast!`,
  };

  const archetypeDescriptions: Record<string, string> = {
    emotion_exploration: `Share vibes expressing ${target} different emotions you haven't tried recently`,
    social_connector: `Connect with ${target} vibes from people in your community`,
    discovery_quest: `Discover and explore ${target} vibes from different perspectives`,
    streak_builder: `Post at least one vibe for ${target} consecutive days`,
    location_explorer: `Share vibes from ${target} different neighborhoods or locations`,
    festival_special: `Celebrate with ${target} festive vibes during this special occasion`,
    flash_challenge: `Quick mission: Complete ${target} actions within 2 hours!`,
  };

  const archetypeMotivation: Record<string, string> = {
    emotion_exploration: "Exploring new emotions helps you understand yourself better!",
    social_connector: "Your support brightens someone's day. Keep spreading positivity!",
    discovery_quest: "Every discovery brings new perspectives and connections.",
    streak_builder: "Consistency builds habits. You've got this!",
    location_explorer: "Map your city's emotional landscape and discover hidden gems.",
    festival_special: "Celebrate culture and spread joy with your community!",
    flash_challenge: "Act fast, earn big! You're among the top vibers.",
  };

  return {
    title: archetypeTitles[template.archetype] || template.name,
    description: archetypeDescriptions[template.archetype] || template.description,
    motivationalMessage: archetypeMotivation[template.archetype] || "You can do this!",
    target,
    targetDescription: `${target} ${template.archetype.replace('_', ' ')}`,
    estimatedCompletionTime: estimateCompletionTime(template.archetype, target),
  };
}

/**
 * Batch personalize multiple challenges
 */
export async function personalizeChallenges(
  requests: ChallengePersonalizationRequest[]
): Promise<ChallengePersonalizationResponse[]> {
  return Promise.all(requests.map(req => personalizeChallenge(req)));
}
