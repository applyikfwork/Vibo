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
     throw new Error(`
        -----------------------------------------------------------------
        Firebase Admin credentials not found in environment variables.
        Server-side Firebase operations require these variables to be set.
        
        Please create a .env.local file in your project root and add:
        FIREBASE_PROJECT_ID=...
        FIREBASE_CLIENT_EMAIL=...
        FIREBASE_PRIVATE_KEY=...
        
        You can find these credentials in your Firebase project's 
        service account settings.
        -----------------------------------------------------------------
      `);
  }

  return cert({
    projectId,
    clientEmail,
    privateKey,
  });
}


function initializeAdminApp(): App {
    if (getApps().some(app => app.name === 'admin')) {
        return getApp('admin');
    }

    const serviceAccount = getServiceAccount();
    return initializeApp({
        credential: serviceAccount,
    }, 'admin');
}

export async function getAdminSdks() {
  const adminApp = initializeAdminApp();
  const adminAuth = getAuth(adminApp);
  const adminFirestore = getFirestore(adminApp);

  return {
    auth: adminAuth,
    firestore: adminFirestore,
    app: adminApp,
  };
}
