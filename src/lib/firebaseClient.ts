import { initializeApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
const appId = import.meta.env.VITE_FIREBASE_APP_ID;

// Account features (login, orders history, wishlist, etc.) depend on this,
// but the rest of the site (catalog, guest checkout) must keep working even
// before Firebase is configured — so this stays null instead of throwing.
export const firebaseAuth: Auth | null =
  apiKey && authDomain && projectId && appId
    ? getAuth(initializeApp({ apiKey, authDomain, projectId, appId }))
    : (console.warn(
        "Firebase not configured (missing VITE_FIREBASE_* env vars) — account features are disabled."
      ),
      null);
