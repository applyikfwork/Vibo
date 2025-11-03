'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { getFirebaseAdmin } from '@/firebase/admin';


const profileSchema = z.object({
    userId: z.string(),
    displayName: z.string().min(2, { message: "Display name must be at least 2 characters" }).max(50, { message: "Display name must be 50 characters or less"}),
});

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
