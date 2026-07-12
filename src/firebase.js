import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

// Web app config. Values are read from Vite env vars (.env.local) so secrets
// stay out of source control. See .env.example for the keys to fill in from
// Firebase Console > Project settings > Your apps > Web app (SDK config).
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FB_API_KEY,
  authDomain:
    import.meta.env.VITE_FB_AUTH_DOMAIN ||
    "accessenabled-3e90e.firebaseapp.com",
  projectId: import.meta.env.VITE_FB_PROJECT_ID || "accessenabled-3e90e",
  storageBucket:
    import.meta.env.VITE_FB_STORAGE_BUCKET ||
    "accessenabled-3e90e.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FB_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FB_APP_ID,
};

const hasRequiredConfig =
  !!firebaseConfig.apiKey &&
  !!firebaseConfig.authDomain &&
  !!firebaseConfig.projectId &&
  !!firebaseConfig.appId;

let app = null;
let firebaseInitError = "";

if (!hasRequiredConfig) {
  firebaseInitError =
    "Firebase config is missing. Set VITE_FB_API_KEY and VITE_FB_APP_ID in your environment.";
} else {
  try {
    app = initializeApp(firebaseConfig);
  } catch (err) {
    firebaseInitError =
      err?.message || "Failed to initialize Firebase. Check your config.";
  }
}

export const auth = app ? getAuth(app) : null;
export const googleProvider = new GoogleAuthProvider();
export const db = app ? getFirestore(app) : null;
export const storage = app ? getStorage(app) : null;
// Scan engine runs in us-central1 by default.
export const functions = app ? getFunctions(app, "us-central1") : null;
export const firebaseReady = !!app;
export const firebaseError = firebaseInitError;

export default app;
