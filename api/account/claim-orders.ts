import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAuthedUser } from "../_lib/auth.js";
import { claimGuestOrders } from "../_lib/orders.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const user = await requireAuthedUser(req, res);
  if (!user) return;

  if (!user.phone) {
    res.status(200).json({ claimed: 0 });
    return;
  }

  const claimed = await claimGuestOrders(user.uid, user.phone);
  res.status(200).json({ claimed });
}
