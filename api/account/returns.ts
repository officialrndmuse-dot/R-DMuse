import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAuthedUser } from "../_lib/auth.js";
import { listReturnsForUser, createReturn } from "../_lib/returns.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = await requireAuthedUser(req, res);
  if (!user) return;

  if (req.method === "GET") {
    res.status(200).json(await listReturnsForUser(user.uid));
    return;
  }

  if (req.method === "POST") {
    const orderId = typeof req.body?.orderId === "string" ? req.body.orderId : "";
    const reason = typeof req.body?.reason === "string" ? req.body.reason.trim() : "";
    const itemIds = Array.isArray(req.body?.itemIds) ? req.body.itemIds : undefined;
    if (!orderId || !reason) {
      res.status(400).json({ error: "orderId and reason are required" });
      return;
    }
    try {
      const created = await createReturn(user.uid, orderId, reason, itemIds);
      res.status(201).json(created);
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : "Failed to create return" });
    }
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}
