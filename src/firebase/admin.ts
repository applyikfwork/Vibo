'use server';

import admin from 'firebase-admin';

let adminApp: admin.app.App | undefined;

function initializeAdmin() {
  if (admin.apps.length > 0) {
    return admin.apps[0];
  }
  
  const privateKeyBase64 = process.env.FIREBASE_PRIVATE_KEY;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  if (!privateKeyBase64) {
    throw new Error("FIREBASE_PRIVATE_KEY environment variable is not set or is empty. Please ensure it is Base64 encoded.");
  }
  if (!clientEmail) {
    throw new Error("FIREBASE_CLIENT_EMAIL environment variable is not set or is empty.");
  }
  if (!projectId) {
    throw new Error("NEXT_PUBLIC_FIREBASE_PROJECT_ID environment variable is not set or is empty.");
  }

  try {
    // Decode the Base64 private key
    const privateKey = Buffer.from(privateKeyBase64, 'base64').toString('utf8');

    return admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  } catch (error: any) {
    // Provide a more detailed error message for easier debugging
    if (error.code === 'ERR_INVALID_ARG_TYPE') {
         throw new Error(`Failed to decode Base64 private key. Make sure the FIREBASE_PRIVATE_KEY environment variable is a valid Base64 encoded string. Original error: ${error.message}`);
    }
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
