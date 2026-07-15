import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAuthedUser } from "../../_lib/auth.js";
import { removeWishlistItem } from "../../_lib/wishlist.js";

// [id] here is the productId (what the frontend has on hand from ProductCard),
// not the wishlist row's own uuid.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "DELETE") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const user = await requireAuthedUser(req, res);
  if (!user) return;

  const productId = typeof req.query.id === "string" ? req.query.id : undefined;
  if (!productId) {
    res.status(400).json({ error: "Missing productId" });
    return;
  }

  await removeWishlistItem(user.uid, productId);
  res.status(204).end();
}
