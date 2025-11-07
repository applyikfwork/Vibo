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
import type { DiagnoseVibeInput, DiagnoseVibeOutput, EmotionCategory } from '@/lib/types';

export async function diagnoseVibe(input: DiagnoseVibeInput): Promise<DiagnoseVibeOutput> {
  return diagnoseVibeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'diagnoseVibePrompt',
  input: { schema: DiagnoseVibeInputSchema },
  output: { schema: DiagnoseVibeOutputSchema },
  prompt: `You are an expert sentiment analyst specializing in emotional and cultural context, particularly for Indian users. Your task is to analyze the user's text and determine the most fitting emotion from a predefined list. You must also suggest a single, representative emoji.

Analyze the following text:
"{{{text}}}"

From the text, determine the primary emotion. The available emotions are:

**Core Emotions:**
- Happy
- Sad
- Chill
- Motivated
- Lonely
- Angry
- Neutral
- Funny

**Festival & Occasion Emotions (Indian Context):**
- Festival Joy (use when text mentions festivals, celebrations, Diwali, Holi, Eid, etc.)
- Missing Home (use when text expresses longing for family, hometown, or nostalgia)
- Exam Stress (use when text mentions exams, tests, studies, academic pressure)
- Wedding Excitement (use when text mentions weddings, marriage, shaadi, celebrations)
- Religious Peace (use when text mentions prayer, meditation, temple, spirituality, devotion)
- Family Bonding (use when text celebrates family time, reunions, togetherness)
- Career Anxiety (use when text expresses job stress, work pressure, career concerns)
- Festive Nostalgia (use when text reminisces about past festivals or celebrations)

**Guidelines:**
- Be culturally aware - recognize Indian festivals, family values, and occasions
- If text mentions specific festivals (Diwali, Holi, Raksha Bandhan, etc.), prefer "Festival Joy" or "Festive Nostalgia"
- If text mentions missing parents, siblings, or hometown, use "Missing Home"
- If text mentions exams, boards, JEE, NEET, etc., use "Exam Stress"
- Consider context - "feeling festive" = Festival Joy, "missing last Diwali" = Festive Nostalgia

Your response MUST be in the specified JSON format and include both the determined emotion and a single, suitable emoji. The emotion must be one of the exact strings from the list above.`,
});

const diagnoseVibeFlow = ai.defineFlow(
  {
    name: 'diagnoseVibeFlow',
    inputSchema: DiagnoseVibeInputSchema,
    outputSchema: DiagnoseVibeOutputSchema,
  },
  async input => {
    try {
      const { output } = await prompt(input);
      
      // Validate that the detected emotion is valid
      const validEmotions = [
        'Happy', 'Sad', 'Chill', 'Motivated', 'Lonely', 'Angry', 'Neutral', 'Funny',
        'Festival Joy', 'Missing Home', 'Exam Stress', 'Wedding Excitement',
        'Religious Peace', 'Family Bonding', 'Career Anxiety', 'Festive Nostalgia'
      ];
      
      if (output && !validEmotions.includes(output.emotion)) {
        console.warn(`Invalid emotion detected: ${output.emotion}. Falling back to Neutral.`);
        return {
          emotion: 'Neutral' as EmotionCategory,
          emoji: output.emoji || '😐',
        };
      }
      
      return output!;
    } catch (error) {
      console.error('Error in diagnoseVibe flow:', error);
      // Fallback to neutral emotion on error
      return {
        emotion: 'Neutral' as EmotionCategory,
        emoji: '😐',
      };
    }
  }
);
