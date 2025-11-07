'use client';
import {
  Auth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  User,
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): void {
  signInAnonymously(authInstance);
}

/** Initiate email/password sign-up (non-blocking). */
export async function initiateEmailSignUp(
  authInstance: Auth, 
  email: string, 
  password: string
): Promise<User> {
  try {
    const userCredential = await createUserWithEmailAndPassword(authInstance, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Email SignUp Error:", error);
    throw error;
  }
}

/** Initiate email/password sign-in (non-blocking). */
export async function initiateEmailSignIn(authInstance: Auth, email: string, password: string): Promise<User> {
  try {
    const userCredential = await signInWithEmailAndPassword(authInstance, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Email SignIn Error:", error);
    if (error instanceof FirebaseError && error.code === 'auth/invalid-credential') {
        throw new Error('Invalid email or password.');
    }
    throw error;
  }
}
