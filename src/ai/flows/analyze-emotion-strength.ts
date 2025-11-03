'use server';

import { ai } from '@/ai/genkit';
import {
  AnalyzeEmotionStrengthInputSchema,
  AnalyzeEmotionStrengthOutputSchema,
} from '@/lib/schemas';
import type { EmotionCategory } from '@/lib/types';
import { z } from 'zod';

type AnalyzeEmotionStrengthInput = z.infer<typeof AnalyzeEmotionStrengthInputSchema>;
type AnalyzeEmotionStrengthOutput = z.infer<typeof AnalyzeEmotionStrengthOutputSchema>;

export async function analyzeEmotionStrength(input: AnalyzeEmotionStrengthInput): Promise<AnalyzeEmotionStrengthOutput> {
  return analyzeEmotionStrengthFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeEmotionStrengthPrompt',
  input: { schema: AnalyzeEmotionStrengthInputSchema },
  output: { schema: AnalyzeEmotionStrengthOutputSchema },
  prompt: `You are an expert sentiment analyst specializing in emotional intensity measurement. Your task is to analyze text and determine how STRONG or INTENSE the expressed emotion is.

Analyze the following text:
"{{{text}}}"

The primary emotion detected is: {{{emotion}}}

Determine the emotional intensity/strength on a scale from 0.0 to 1.0:

**Intensity Scale Guidelines:**
- 0.0 - 0.2: Very mild, barely noticeable emotion (e.g., "feeling slightly happy")
- 0.3 - 0.4: Mild emotion, present but not dominant (e.g., "I'm a bit sad today")
- 0.5 - 0.6: Moderate emotion, clearly expressed (e.g., "I'm feeling really motivated!")
- 0.7 - 0.8: Strong emotion, intense expression (e.g., "I'm so incredibly lonely", "Absolutely furious!")
- 0.9 - 1.0: Extreme emotion, overwhelming intensity (e.g., "I'm completely devastated", "Best day of my entire life!!!")

**Factors to consider:**
- Use of intensifiers (very, extremely, absolutely, completely)
- Exclamation marks and capitalization
- Emotional words and descriptive language
- Context and situation described
- Overall tone and energy level

Provide your response with:
1. emotionStrength: A decimal number between 0.0 and 1.0
2. reasoning: A brief 1-2 sentence explanation

Your response MUST be in the specified JSON format.`,
});

const analyzeEmotionStrengthFlow = ai.defineFlow(
  {
    name: 'analyzeEmotionStrengthFlow',
    inputSchema: AnalyzeEmotionStrengthInputSchema,
    outputSchema: AnalyzeEmotionStrengthOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
