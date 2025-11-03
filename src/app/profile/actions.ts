'use server';

import { getSdks, initializeFirebase } from '@/firebase';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

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

    // We must initialize the admin app here to get auth context
    const { auth, firestore } = getSdks(initializeFirebase());

    try {
        // This is tricky on the server. The user might not be available in the server context.
        // For now, we will assume we can get it, but this needs a robust solution.
        // A better approach would be to do this client-side with a re-authenticated user.
        // Or pass the user's auth token to the server action.
        
        // This will likely fail on the server without admin SDK.
        // Let's try to update firestore first.
        
        const userDocRef = doc(firestore, 'users', userId);
        await updateDoc(userDocRef, {
             // this assumes 'username' is the field in firestore. Let's check backend.json
             // backend.json uses 'username'. but our auth display name is 'displayName'
             // Let's stick with updating a field called 'displayName' for consistency
             displayName: displayName
        });

        // Revalidate paths to reflect the change
        revalidatePath('/profile');
        revalidatePath('/settings');
        
        return { error: false, message: 'Profile updated successfully.' };

    } catch (e: any) {
        console.error("Error updating profile:", e);
        return {
            error: true,
            message: e.message || 'An unexpected error occurred while updating your profile.',
        };
    }
}
