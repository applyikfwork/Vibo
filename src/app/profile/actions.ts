'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { getFirebaseAdmin } from '@/firebase/admin';


const profileSchema = z.object({
    userId: z.string(),
    displayName: z.string().min(2, { message: "Display name must be at least 2 characters" }).max(50, { message: "Display name must be 50 characters or less"}),
});

const indianFeaturesSchema = z.object({
    userId: z.string(),
    zodiacSign: z.enum(['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']).optional(),
    enableAstrology: z.boolean().optional(),
    enableSpiritualSuggestions: z.boolean().optional(),
});

export async function updateIndianFeatures(data: {
    userId: string;
    zodiacSign?: 'Aries' | 'Taurus' | 'Gemini' | 'Cancer' | 'Leo' | 'Virgo' | 'Libra' | 'Scorpio' | 'Sagittarius' | 'Capricorn' | 'Aquarius' | 'Pisces';
    enableAstrology?: boolean;
    enableSpiritualSuggestions?: boolean;
}) {
    const validatedFields = indianFeaturesSchema.safeParse(data);

    if (!validatedFields.success) {
        return {
            error: true,
            message: 'Invalid input.',
        };
    }

    const { userId, zodiacSign, enableAstrology, enableSpiritualSuggestions } = validatedFields.data;
    
    try {
        const admin = getFirebaseAdmin();
        if (!admin.apps.length) {
          throw new Error("Firebase Admin SDK is not initialized. Check server logs.");
        }
        
        const firestore = admin.firestore();
        
        // Update firestore user document
        const userDocRef = firestore.collection('users').doc(userId);
        const updateData: any = {};
        
        if (zodiacSign) updateData.zodiacSign = zodiacSign;
        if (enableAstrology !== undefined) updateData.enableAstrology = enableAstrology;
        if (enableSpiritualSuggestions !== undefined) updateData.enableSpiritualSuggestions = enableSpiritualSuggestions;
        
        // Use set with merge to create document if it doesn't exist
        await userDocRef.set(updateData, { merge: true });
        
        revalidatePath('/');
        revalidatePath('/profile');
        revalidatePath('/settings');
        
        return { error: false, message: 'Indian features updated successfully.' };

    } catch (e: any) {
        console.error("Error updating Indian features:", e);
        
        if (e.message.includes('FIREBASE_PRIVATE_KEY') || e.message.includes('Admin SDK')) {
             return {
                error: true,
                message: 'Firebase Admin credentials are not configured on the server.',
            };
        }
        
        return {
            error: true,
            message: e.message || 'An unexpected error occurred while updating settings.',
        };
    }
}

export async function updateProfileSettings(data: { userId: string, displayName: string }) {
    const validatedFields = profileSchema.safeParse(data);

    if (!validatedFields.success) {
        return {
            error: true,
            message: validatedFields.error.flatten().fieldErrors.displayName?.[0] || 'Invalid input.',
        };
    }

    const { userId, displayName } = validatedFields.data;
    
    try {
        const admin = getFirebaseAdmin();
        if (!admin.apps.length) {
          throw new Error("Firebase Admin SDK is not initialized. Check server logs.");
        }
        
        const auth = admin.auth();
        const firestore = admin.firestore();
        
        // Update auth user
        await auth.updateUser(userId, { displayName });

        // Update firestore user document
        const userDocRef = firestore.collection('users').doc(userId);
        await userDocRef.update({
             displayName: displayName
        });
        
        revalidatePath('/profile');
        revalidatePath('/settings');
        
        return { error: false, message: 'Profile updated successfully.' };

    } catch (e: any) {
        console.error("Error updating profile:", e);
        
        if (e.message.includes('FIREBASE_PRIVATE_KEY') || e.message.includes('Admin SDK')) {
             return {
                error: true,
                message: 'Firebase Admin credentials are not configured on the server.',
            };
        }
        
        return {
            error: true,
            message: e.message || 'An unexpected error occurred while updating your profile.',
        };
    }
}
