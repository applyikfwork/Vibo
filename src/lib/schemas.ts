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
