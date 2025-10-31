'use server';

import { diagnoseVibe } from '@/ai/flows/diagnose-vibe';
import type { DiagnoseVibeInput } from '@/ai/flows/diagnose-vibe';
import { z } from 'zod';
import { getEmotionByName } from '@/lib/data';

const schema = z.object({
  text: z.string().min(3, { message: 'Must be at least 3 characters' }),
});

export type FormState = {
  message: string;
  emoji?: string;
  error?: boolean;
};

// This action is no longer used for suggesting emojis separately,
// but could be repurposed or removed. For now, we leave it.
export async function getEmojiSuggestion(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = schema.safeParse({
    text: formData.get('vibeText'),
  });

  if (!validatedFields.success) {
    return {
      message: validatedFields.error.flatten().fieldErrors.text?.[0] || 'Invalid input.',
      error: true,
    };
  }

  try {
    const result = await diagnoseVibe({ text: validatedFields.data.text });
    const emotionDetails = getEmotionByName(result.emotion);
    if (emotionDetails) {
      return { message: 'Suggestion complete!', emoji: result.emoji };
    }
    return { message: 'Could not generate an emoji.', error: true };
  } catch (e) {
    console.error(e);
    return { message: 'An error occurred while suggesting an emoji.', error: true };
  }
}

export async function getVibeDiagnosis(text: string) {
  if (!text || text.trim().length < 3) {
    throw new Error('Vibe text must be at least 3 characters long.');
  }
  return await diagnoseVibe({ text });
}
