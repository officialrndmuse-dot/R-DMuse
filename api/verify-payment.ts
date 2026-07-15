import type { VercelRequest, VercelResponse } from "@vercel/node";
import { verifyRazorpaySignature } from "./_lib/razorpay.js";
import { getOrder, markPaid, markPaymentFailed, markShipmentCreated, markCourierAssigned } from "./_lib/orders.js";
import { createShiprocketOrder, assignAWB } from "./_lib/shiprocket.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body ?? {};

    if (!orderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      res.status(400).json({ error: "Missing payment verification fields" });
      return;
    }

    const valid = verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    if (!valid) {
      await markPaymentFailed(orderId);
      res.status(400).json({ error: "Payment verification failed" });
      return;
    }

    await markPaid(orderId, razorpay_payment_id);

    const order = await getOrder(orderId);
    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    // Payment is captured at this point regardless of what happens below —
    // a Shiprocket hiccup must not be reported to the client as a failure.
    try {
      const shipment = await createShiprocketOrder(order);
      await markShipmentCreated(orderId, shipment);
      try {
        const awb = await assignAWB(shipment.shiprocketShipmentId);
        if (awb) await markCourierAssigned(orderId, awb);
      } catch (awbError) {
        console.error("AWB assignment failed for order", orderId, awbError);
      }
    } catch (shiprocketError) {
      console.error("Shiprocket order creation failed for order", orderId, shiprocketError);
    }

    res.status(200).json({ success: true, orderId });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Payment verification failed";
    res.status(400).json({ error: message });
  }
}
