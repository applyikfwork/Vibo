'use server';

import { suggestEmoji } from '@/ai/flows/suggest-emoji-based-on-sentiment';
import { z } from 'zod';

const schema = z.object({
    text: z.string().min(3, { message: 'Must be at least 3 characters' }),
});

export type FormState = {
    message: string;
    emoji?: string;
    error?: boolean;
};

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
        const result = await suggestEmoji({ text: validatedFields.data.text });
        if (result.emoji) {
            return { message: 'Suggestion complete!', emoji: result.emoji };
        }
        return { message: 'Could not generate an emoji.', error: true };
    } catch (e) {
        console.error(e);
        return { message: 'An error occurred while suggesting an emoji.', error: true };
    }
}
