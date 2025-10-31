'use server';

/**
 * @fileOverview This file defines a Genkit flow to suggest an emoji based on the sentiment of the user's text input.
 *
 * - suggestEmoji - A function that takes text as input and returns a suggested emoji.
 * - SuggestEmojiInput - The input type for the suggestEmoji function.
 * - SuggestEmojiOutput - The return type for the suggestEmoji function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestEmojiInputSchema = z.object({
  text: z
    .string()
    .describe('The text input from the user expressing their current feeling.'),
});
export type SuggestEmojiInput = z.infer<typeof SuggestEmojiInputSchema>;

const SuggestEmojiOutputSchema = z.object({
  emoji: z
    .string()
    .describe(
      'A single emoji that best represents the sentiment of the input text.'
    ),
});
export type SuggestEmojiOutput = z.infer<typeof SuggestEmojiOutputSchema>;

export async function suggestEmoji(input: SuggestEmojiInput): Promise<SuggestEmojiOutput> {
  return suggestEmojiFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestEmojiPrompt',
  input: {schema: SuggestEmojiInputSchema},
  output: {schema: SuggestEmojiOutputSchema},
  prompt: `You are an AI assistant designed to suggest a single emoji that best represents the sentiment of the given text.

  Text: {{{text}}}

  Respond with ONLY the single, most appropriate emoji for the sentiment expressed in the text. Do not include any other text or explanation.  If no sentiment is detected, return a neutral emoji such as 😶.`,
});

const suggestEmojiFlow = ai.defineFlow(
  {
    name: 'suggestEmojiFlow',
    inputSchema: SuggestEmojiInputSchema,
    outputSchema: SuggestEmojiOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
