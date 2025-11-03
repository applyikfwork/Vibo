'use server';

import admin from 'firebase-admin';

// Check if the app is already initialized to prevent re-initialization errors.
if (!admin.apps.length) {
  try {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    if (!privateKey) {
      throw new Error("FIREBASE_PRIVATE_KEY environment variable is not set.");
    }
    
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Replace the escaped newline characters with actual newlines.
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error) {
    console.error('Firebase admin initialization error:', error);
    // Depending on the desired behavior, you might want to throw the error
    // or handle it gracefully. For now, we log it.
  }
}

const firebaseAdmin = admin;
export default firebaseAdmin;

/**
 * Gets the initialized Firebase Admin SDK instance.
 * It's structured this way to be easily mocked for testing if needed.
 */
export const getFirebaseAdmin = () => {
    return firebaseAdmin;
}
