import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAuthedUser } from "../_lib/auth.js";
import { listWishlist, addWishlistItem, removeWishlistItem } from "../_lib/wishlist.js";

// GET/POST operate on the collection. DELETE takes ?id=<productId> (query
// param instead of a nested [id].ts route, to stay under Vercel's Hobby-plan
// 12-serverless-function cap).
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

  if (req.method === "DELETE") {
    const productId = typeof req.query.id === "string" ? req.query.id : undefined;
    if (!productId) {
      res.status(400).json({ error: "Missing productId" });
      return;
    }
    await removeWishlistItem(user.uid, productId);
    res.status(204).end();
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}
