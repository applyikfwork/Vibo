
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getApps, initializeApp, cert } from 'firebase-admin/app';

// Helper function to initialize the admin app
function initializeAdminApp() {
  if (getApps().some(app => app.name === 'admin')) {
    return getApps().find(app => app.name === 'admin')!;
  }
  
  // This will fail if env vars are not set, which is expected.
  // The error should be caught by the calling function.
  const serviceAccount = cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  });

  return initializeApp({ credential: serviceAccount }, 'admin');
}

function getAdminSdks() {
    const adminApp = initializeAdminApp();
    return {
        auth: getAuth(adminApp),
        firestore: getFirestore(adminApp),
    };
}


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
        const { firestore, auth } = getAdminSdks();
        
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
        
        if (e.message.includes('FIREBASE_PROJECT_ID')) {
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
