import type { VercelRequest, VercelResponse } from "@vercel/node";
import { resolveOrderItems } from "./_lib/cart.js";
import { getShippingRate } from "./_lib/shiprocket.js";
import { computeOrderTotals } from "../src/lib/pricing.js";

const PINCODE_RE = /^\d{6}$/;

// Live quote for the checkout page's order summary, using the same
// Shiprocket lookup create-order.ts uses to actually charge shipping --
// this just lets the customer see the real number before placing the order.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { pincode, items, paymentMethod } = req.body ?? {};
  if (typeof pincode !== "string" || !PINCODE_RE.test(pincode)) {
    res.status(400).json({ error: "Invalid pincode" });
    return;
  }

  try {
    const { items: resolved, subtotal } = await resolveOrderItems(items);
    const totalWeightKg = resolved.reduce((sum, i) => sum + i.weightKg * i.qty, 0);
    const rateResult = await getShippingRate(pincode, totalWeightKg, paymentMethod === "cod");

    if (!rateResult.ok && rateResult.reason === "unserviceable") {
      res.status(200).json({ serviceable: false });
      return;
    }

    const liveShipping = rateResult.ok ? rateResult.rate : null;
    const { shipping, tax, total } = computeOrderTotals(subtotal, liveShipping);
    res.status(200).json({ serviceable: true, subtotal, shipping, tax, total, live: rateResult.ok });
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : "Failed to calculate shipping" });
  }
}
