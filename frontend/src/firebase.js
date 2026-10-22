// Firebase SDK setup — Authentication only
// Data storage is handled by MongoDB via the backend API

import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBo-AwFJbhHZBlEe4TQ6crmoxuOOsmSAaE",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "crop-f141c.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "crop-f141c",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "crop-f141c.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "566523124427",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:566523124427:web:40c9850477b4a86c60d94e",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-4NFVTPLGWL"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Auth instance
export const auth = getAuth(app);

// Google provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

// ─── Auth helpers ─────────────────────────────────────────────

/**
 * Register a new user with email & password.
 * Also sets the display name on the Firebase profile.
 */
export async function firebaseRegister(name, email, password) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName: name });
  return credential.user;
}

/**
 * Sign in with email & password.
 */
export async function firebaseLogin(email, password) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

/**
 * Sign in / register via Google popup.
 */
export async function firebaseGoogleSignIn() {
  const credential = await signInWithPopup(auth, googleProvider);
  return credential.user;
}

/**
 * Sign out the current user.
 */
export async function firebaseLogout() {
  await signOut(auth);
}

/**
 * Subscribe to auth state changes.
 * Returns the unsubscribe function.
 */
export function onFirebaseAuthStateChanged(callback) {
  return onAuthStateChanged(auth, callback);
}

export default app;
