'use server';

import { getSdks, initializeFirebase } from '@/firebase';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
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

    const { firestore } = getSdks(initializeFirebase());

    try {
        const userDocRef = doc(firestore, 'users', userId);
        await updateDoc(userDocRef, {
             displayName: displayName
        });
        
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

const deleteVibeSchema = z.object({
  userId: z.string(),
  vibeId: z.string(),
});

export async function deleteVibe(data: { userId: string, vibeId: string }) {
    const validatedFields = deleteVibeSchema.safeParse(data);

    if (!validatedFields.success) {
        return {
            error: true,
            message: 'Invalid input for deleting vibe.',
        };
    }
    
    const { userId, vibeId } = validatedFields.data;
    const { firestore } = getSdks(initializeFirebase());

    try {
        const batch = writeBatch(firestore);

        const userVibeRef = doc(firestore, 'users', userId, 'vibes', vibeId);
        batch.delete(userVibeRef);

        const globalVibeRef = doc(firestore, 'all-vibes', vibeId);
        batch.delete(globalVibeRef);
        
        await batch.commit();

        revalidatePath('/');
        revalidatePath('/profile');
        revalidatePath(`/vibe/${vibeId}`);

        return { error: false, message: 'Vibe deleted successfully.' };
    } catch (e: any) {
        console.error("Error deleting vibe:", e);
        return {
            error: true,
            message: e.message || 'An unexpected error occurred while deleting the vibe.',
        };
    }
}
