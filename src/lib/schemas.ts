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
