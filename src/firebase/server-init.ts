// IMPORTANT: This file should not be used on the client.
import { initializeApp, getApp, getApps, App, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

function getServiceAccount() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  // Replace escaped newlines from the environment variable
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        `
        -----------------------------------------------------------------
        Firebase Admin credentials not found in environment variables.
        Server-side Firebase operations will fail.
        
        Please populate .env.local with:
        FIREBASE_PROJECT_ID=...
        FIREBASE_CLIENT_EMAIL=...
        FIREBASE_PRIVATE_KEY=...
        
        You can get these from your project's service account settings
        in the Firebase console.
        -----------------------------------------------------------------
        `
      );
    }
    // In production, you might want to throw an error
    return null;
  }

  return cert({
    projectId,
    clientEmail,
    privateKey,
  });
}


let adminApp: App;

if (!getApps().length) {
    const serviceAccount = getServiceAccount();
    if(serviceAccount) {
         adminApp = initializeApp({
            credential: serviceAccount,
        });
    } else {
        // Fallback or dummy initialization if credentials are not available
        // This will likely fail on actual operations but prevents crashing on import.
        adminApp = initializeApp();
    }
} else {
  adminApp = getApp();
}

const adminAuth = getAuth(adminApp);
const adminFirestore = getFirestore(adminApp);

export async function getAdminSdks() {
  return {
    auth: adminAuth,
    firestore: adminFirestore,
    app: adminApp,
  };
}
