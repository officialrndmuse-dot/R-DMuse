import type { VercelRequest, VercelResponse } from "@vercel/node";
import { verifyFirebaseToken, type VerifiedFirebaseUser } from "./firebase.js";

function extractToken(req: VercelRequest): string | null {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return null;
  const token = header.slice(7).trim();
  return token || null;
}

// Verifies the Bearer token if present. Returns null if missing/invalid —
// callers decide whether that's fatal (e.g. create-order allows anonymous).
export async function getAuthedUser(req: VercelRequest): Promise<VerifiedFirebaseUser | null> {
  const token = extractToken(req);
  if (!token) return null;
  return verifyFirebaseToken(token);
}

export async function requireAuthedUser(
  req: VercelRequest,
  res: VercelResponse
): Promise<VerifiedFirebaseUser | null> {
  const user = await getAuthedUser(req);
  if (!user) {
    res.status(401).json({ error: "Not authenticated" });
    return null;
  }
  return user;
}

function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export async function requireAdmin(
  req: VercelRequest,
  res: VercelResponse
): Promise<VerifiedFirebaseUser | null> {
  const user = await requireAuthedUser(req, res);
  if (!user) return null; // requireAuthedUser already responded

  const allowed = adminEmails();
  if (!user.email || !allowed.includes(user.email.toLowerCase())) {
    res.status(403).json({ error: "Not authorized" });
    return null;
  }
  return user;
}
