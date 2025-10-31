'use server';

/**
 * @fileOverview This file defines a Genkit flow to diagnose a user's vibe from text,
 * determining the primary emotion, a suitable emoji, and a corresponding background color.
 *
 * - diagnoseVibe - A function that takes text as input and returns a full vibe diagnosis.
 */

import { ai } from '@/ai/genkit';
import {
  DiagnoseVibeInputSchema,
  DiagnoseVibeOutputSchema,
} from '@/lib/schemas';
import type { DiagnoseVibeInput, DiagnoseVibeOutput } from '@/lib/types';

export async function diagnoseVibe(input: DiagnoseVibeInput): Promise<DiagnoseVibeOutput> {
  return diagnoseVibeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'diagnoseVibePrompt',
  input: { schema: DiagnoseVibeInputSchema },
  output: { schema: DiagnoseVibeOutputSchema },
  prompt: `You are an expert sentiment analyst. Your task is to analyze the user's text and determine the most fitting emotion from a predefined list. You must also suggest a single, representative emoji.

Analyze the following text:
"{{{text}}}"

From the text, determine the primary emotion. The available emotions are:
- Happy
- Sad
- Chill
- Motivated
- Lonely
- Angry
- Neutral

Your response MUST be in the specified JSON format and include both the determined emotion and a single, suitable emoji. The emotion must be one of the exact strings from the list above.`,
});

const diagnoseVibeFlow = ai.defineFlow(
  {
    name: 'diagnoseVibeFlow',
    inputSchema: DiagnoseVibeInputSchema,
    outputSchema: DiagnoseVibeOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
