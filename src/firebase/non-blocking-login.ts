'use client';
import {
  Auth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  User,
} from 'firebase/auth';

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): void {
  signInAnonymously(authInstance);
}

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string, callback: (user: User | null) => void): void {
  createUserWithEmailAndPassword(authInstance, email, password)
    .then(userCredential => callback(userCredential.user))
    .catch(error => {
      console.error("Email SignUp Error:", error);
      callback(null);
    });
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): void {
  signInWithEmailAndPassword(authInstance, email, password)
    .catch(error => {
        // Errors will be caught by the onAuthStateChanged listener in the provider
        console.error("Email SignIn Error:", error);
    });
}
