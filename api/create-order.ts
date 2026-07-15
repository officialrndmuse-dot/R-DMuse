import type { VercelRequest, VercelResponse } from "@vercel/node";
import { computeOrderTotals } from "../src/lib/pricing.js";
import { validateAddress } from "./_lib/validate.js";
import { resolveOrderItems } from "./_lib/cart.js";
import { insertOrder, setRazorpayOrderId, markShipmentCreated } from "./_lib/orders.js";
import { createShiprocketOrder } from "./_lib/shiprocket.js";
import { createRazorpayOrder } from "./_lib/razorpay.js";
import { getAuthedUser } from "./_lib/auth.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const body = req.body ?? {};
    const address = validateAddress(body.address);
    const { items, subtotal } = resolveOrderItems(body.items);
    const { shipping, tax, total } = computeOrderTotals(subtotal);

    const paymentMethod = body.paymentMethod === "razorpay" ? "razorpay" : "cod";

    // Optional — guest checkout (no Authorization header) is unaffected.
    const authedUser = await getAuthedUser(req);

    const order = await insertOrder({
      address,
      items,
      subtotal,
      shipping,
      tax,
      total,
      paymentMethod,
      userId: authedUser?.uid,
    });

    if (paymentMethod === "razorpay") {
      const rzpOrder = await createRazorpayOrder(Math.round(total * 100), order.id);
      await setRazorpayOrderId(order.id, rzpOrder.id);
      res.status(200).json({
        orderId: order.id,
        paymentRequired: true,
        razorpay: {
          orderId: rzpOrder.id,
          amount: rzpOrder.amount,
          currency: rzpOrder.currency,
          keyId: process.env.RAZORPAY_KEY_ID,
        },
      });
      return;
    }

    // COD: push to Shiprocket immediately. If Shiprocket fails, the order is
    // still valid (customer pays on delivery regardless) — don't fail the
    // checkout over a shipping-API hiccup; it stays in "created" status for
    // a manual/retry follow-up rather than "confirmed".
    try {
      const shipment = await createShiprocketOrder(order);
      await markShipmentCreated(order.id, shipment);
      res.status(200).json({ orderId: order.id, paymentRequired: false, status: "confirmed" });
    } catch (shiprocketError) {
      console.error("Shiprocket order creation failed for order", order.id, shiprocketError);
      res.status(200).json({ orderId: order.id, paymentRequired: false, status: "created" });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create order";
    res.status(400).json({ error: message });
  }
}
