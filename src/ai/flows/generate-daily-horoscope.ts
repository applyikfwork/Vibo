'use server';

import { ai } from '@/ai/genkit';
import { DailyHoroscopeInputSchema, DailyHoroscopeOutputSchema } from '@/lib/schemas';
import { z } from 'zod';

export type DailyHoroscopeInput = z.infer<typeof DailyHoroscopeInputSchema>;
export type DailyHoroscopeOutput = z.infer<typeof DailyHoroscopeOutputSchema>;

export async function generateDailyHoroscope(input: DailyHoroscopeInput): Promise<DailyHoroscopeOutput> {
  return dailyHoroscopeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'dailyHoroscopePrompt',
  input: { schema: DailyHoroscopeInputSchema },
  output: { schema: DailyHoroscopeOutputSchema },
  prompt: `You are an expert Vedic astrologer and emotional wellness guide, deeply knowledgeable in both Western astrology and Indian spiritual traditions.

Generate a compassionate and insightful daily horoscope for {{{zodiacSign}}} sign.

{{#if currentMood}}
The person is currently feeling: {{{currentMood}}}
Consider this in your emotional forecast.
{{/if}}

Your horoscope should:
1. **Emotional Forecast**: Predict their emotional journey today with warmth and cultural awareness (2-3 sentences)
2. **Mood Advice**: Give practical, culturally-relevant advice for managing emotions (Indian context)
3. **Lucky Emotion**: Which emotion will serve them best today and WHY
4. **Challenge Emotion**: Which emotion to be mindful of (not fearful, just aware)
5. **Spiritual Focus**: Suggest a simple spiritual practice (mantra, meditation, prayer) relevant to Indian tradition
6. **Connection Score**: Rate their emotional connection strength today (0-10)

Important:
- Be warm, personal, and encouraging
- Reference Indian cultural elements (festivals, family values, spirituality)
- Keep advice practical for modern Indian life
- Use culturally appropriate language
- Acknowledge current mood if provided
- Make it feel personalized, not generic

Example tone: "Dear Leo, today the cosmic energies align beautifully with your fiery spirit. You might feel particularly motivated in the morning - channel this into meaningful work. Family interactions bring joy, especially if you reach out first. However, be mindful of impatience in the afternoon. Take a moment for Hanuman Chalisa to center yourself. Overall connection: 7/10 - A promising day!"`,
});

const dailyHoroscopeFlow = ai.defineFlow(
  {
    name: 'dailyHoroscopeFlow',
    inputSchema: DailyHoroscopeInputSchema,
    outputSchema: DailyHoroscopeOutputSchema,
  },
  async (input: DailyHoroscopeInput) => {
    const { output } = await prompt(input);
    return output!;
  }
);
