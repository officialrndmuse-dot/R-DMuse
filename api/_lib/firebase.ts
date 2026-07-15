import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

let app: App | null = null;

function getFirebaseApp(): App {
  if (app) return app;
  if (getApps().length > 0) {
    app = getApps()[0]!;
    return app;
  }

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!raw) throw new Error("Missing FIREBASE_SERVICE_ACCOUNT_KEY env var");

  // Accept either raw JSON or base64-encoded JSON.
  const json = raw.trim().startsWith("{") ? raw : Buffer.from(raw, "base64").toString("utf8");
  const serviceAccount = JSON.parse(json);

  app = initializeApp({ credential: cert(serviceAccount) });
  return app;
}

export interface VerifiedFirebaseUser {
  uid: string;
  phone: string | null;
  email: string | null;
}

export async function verifyFirebaseToken(idToken: string): Promise<VerifiedFirebaseUser | null> {
  try {
    const decoded = await getAuth(getFirebaseApp()).verifyIdToken(idToken);
    return {
      uid: decoded.uid,
      phone: decoded.phone_number ?? null,
      email: decoded.email ?? null,
    };
  } catch {
    return null;
  }
}
