import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAuthedUser } from "../_lib/auth.js";
import { listWishlist, addWishlistItem } from "../_lib/wishlist.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = await requireAuthedUser(req, res);
  if (!user) return;

  if (req.method === "GET") {
    res.status(200).json(await listWishlist(user.uid));
    return;
  }

  if (req.method === "POST") {
    const productId = typeof req.body?.productId === "string" ? req.body.productId : "";
    if (!productId) {
      res.status(400).json({ error: "Missing productId" });
      return;
    }
    try {
      await addWishlistItem(user.uid, productId);
      res.status(201).json({ ok: true });
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : "Failed to add" });
    }
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}
