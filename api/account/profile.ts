import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAuthedUser } from "../_lib/auth.js";
import { getOrCreateProfile, updateProfileName } from "../_lib/profiles.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = await requireAuthedUser(req, res);
  if (!user) return;

  if (req.method === "GET") {
    const profile = await getOrCreateProfile(user);
    res.status(200).json(profile);
    return;
  }

  if (req.method === "PUT") {
    const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
    if (!name) {
      res.status(400).json({ error: "Name is required" });
      return;
    }
    const profile = await updateProfileName(user.uid, name);
    res.status(200).json(profile);
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}
