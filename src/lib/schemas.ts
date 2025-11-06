import { z } from 'zod';
import { emotions } from '@/lib/data';
import type { EmotionCategory } from '@/lib/types';

// Dynamically generate the list of emotion names for the Zod schema
const emotionNames = emotions.map(e => e.name) as [EmotionCategory, ...EmotionCategory[]];

export const DiagnoseVibeInputSchema = z.object({
  text: z
    .string()
    .describe('The text input from the user expressing their current feeling, thought, or mood.'),
});

export const DiagnoseVibeOutputSchema = z.object({
  emotion: z
    .enum(emotionNames)
    .describe('The primary emotion detected in the text.'),
  emoji: z
    .string()
    .describe('A single emoji that best represents the detected emotion and text.'),
});

export const AnalyzeEmotionStrengthInputSchema = z.object({
  text: z
    .string()
    .describe('The text to analyze for emotional intensity.'),
  emotion: z
    .enum(emotionNames)
    .describe('The primary emotion category to analyze intensity for.'),
});

export const AnalyzeEmotionStrengthOutputSchema = z.object({
  emotionStrength: z
    .number()
    .min(0)
    .max(1)
    .describe('The intensity/strength of the emotion from 0 (very mild) to 1 (extremely intense).'),
  reasoning: z
    .string()
    .describe('Brief explanation of why this intensity score was given.'),
});

export const DailyHoroscopeInputSchema = z.object({
  zodiacSign: z
    .string()
    .describe('The zodiac sign for which to generate the horoscope.'),
  currentMood: z
    .string()
    .optional()
    .describe('The user\'s current emotional state.'),
});

export const DailyHoroscopeOutputSchema = z.object({
  emotionalForecast: z
    .string()
    .describe('Prediction of emotional state for today based on zodiac.'),
  moodAdvice: z
    .string()
    .describe('Specific advice for managing emotions today.'),
  luckyEmotion: z
    .enum(emotionNames)
    .describe('The emotion that will bring most benefit today.'),
  challengeEmotion: z
    .enum(emotionNames)
    .describe('The emotion to be mindful of today.'),
  spiritualFocus: z
    .string()
    .describe('Spiritual practice or focus for the day.'),
  connectionScore: z
    .number()
    .min(0)
    .max(10)
    .describe('Expected emotional connection strength today (0-10).'),
});
