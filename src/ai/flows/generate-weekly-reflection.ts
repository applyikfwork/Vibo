'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const WeeklyReflectionInputSchema = z.object({
  userId: z.string(),
  weeklyEmotions: z.array(z.object({
    emotion: z.string(),
    count: z.number(),
    date: z.string(),
  })),
  moodTransitions: z.array(z.string()),
  topEngagedContent: z.array(z.object({
    emotion: z.string(),
    vibeText: z.string(),
  })),
  mostHelpfulContent: z.array(z.object({
    emotion: z.string(),
    description: z.string(),
  })),
});

const WeeklyReflectionOutputSchema = z.object({
  summary: z.string().describe('A warm, compassionate summary of the user\'s emotional week'),
  emotionalPattern: z.string().describe('Key emotional patterns observed this week'),
  growthMoments: z.array(z.string()).describe('Moments where the user showed emotional growth or resilience'),
  healingInsights: z.array(z.string()).describe('What types of content helped heal or uplift the user'),
  encouragement: z.string().describe('Encouraging message for the week ahead'),
  dominantEmotions: z.array(z.string()).describe('Top 3 emotions this week'),
  connectionScore: z.number().min(0).max(10).describe('How connected the user was with their emotions (0-10)'),
});

export type WeeklyReflectionInput = z.infer<typeof WeeklyReflectionInputSchema>;
export type WeeklyReflectionOutput = z.infer<typeof WeeklyReflectionOutputSchema>;

const generateWeeklyReflectionFlow = ai.defineFlow(
  {
    name: 'generateWeeklyReflection',
    inputSchema: WeeklyReflectionInputSchema,
    outputSchema: WeeklyReflectionOutputSchema,
  },
  async (input: WeeklyReflectionInput) => {
    const emotionSummary = input.weeklyEmotions
      .map(e => `${e.emotion} (${e.count} times on ${e.date})`)
      .join(', ');

    const transitionSummary = input.moodTransitions.join(' → ');

    const prompt = `You are a compassionate AI emotional wellness companion analyzing a user's weekly emotional journey on Vibee OS, an emotion-based social platform.

Here's their emotional week:

📊 Emotions this week: ${emotionSummary}

🔄 Mood transitions: ${transitionSummary}

💫 Content they engaged with most:
${input.topEngagedContent.map(c => `- ${c.emotion}: "${c.vibeText}"`).join('\n')}

❤️ Content that helped them:
${input.mostHelpfulContent.map(c => `- ${c.emotion}: ${c.description}`).join('\n')}

Generate a warm, personal weekly reflection that:
1. Summarizes their emotional journey with empathy
2. Identifies meaningful patterns without judgment
3. Celebrates moments of growth or resilience
4. Notes what types of content helped them heal or feel better
5. Offers genuine encouragement for the week ahead
6. Lists their top 3 dominant emotions
7. Rates their emotional connection (0-10, where 10 is fully in touch with feelings)

Keep the tone warm, supportive, and human - like a caring friend who truly understands.`;

    const result = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp',
      prompt,
      output: {
        schema: WeeklyReflectionOutputSchema,
      },
    });

    return result.output!;
  }
);

export async function getWeeklyReflection(input: WeeklyReflectionInput): Promise<WeeklyReflectionOutput> {
  return generateWeeklyReflectionFlow(input);
}
