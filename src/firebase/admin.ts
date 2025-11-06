'use server';

import admin from 'firebase-admin';

let adminApp: admin.app.App | undefined;

function initializeAdmin() {
  if (admin.apps.length > 0) {
    return admin.apps[0];
  }
  
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const projectId = process.env.FIREBASE_PROJECT_ID;

  if (!privateKey) {
    throw new Error("FIREBASE_PRIVATE_KEY environment variable is not set or is empty.");
  }
  if (!clientEmail) {
    throw new Error("FIREBASE_CLIENT_EMAIL environment variable is not set or is empty.");
  }
  if (!projectId) {
    throw new Error("FIREBASE_PROJECT_ID environment variable is not set or is empty.");
  }

  try {
    return admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error: any) {
    throw new Error(`Firebase admin initialization error: ${error.message}`);
  }
}

/**
 * Gets the initialized Firebase Admin SDK instance.
 * It's structured this way to be easily mocked for testing if needed
 * and to ensure initialization only happens once.
 */
export async function getFirebaseAdmin() {
  if (!adminApp) {
    adminApp = initializeAdmin()!;
  }
  return adminApp;
}
