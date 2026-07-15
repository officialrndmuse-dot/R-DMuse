import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getOrder, syncStatusFromShiprocket } from "./_lib/orders.js";
import { trackShipment, type TrackingInfo } from "./_lib/shiprocket.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const orderId = typeof req.query.orderId === "string" ? req.query.orderId : undefined;
  if (!orderId) {
    res.status(400).json({ error: "Missing orderId" });
    return;
  }

  const order = await getOrder(orderId);
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  let status = order.status;
  let tracking: TrackingInfo | null = null;
  if (order.awbCode) {
    try {
      tracking = await trackShipment(order.awbCode);
      if (tracking) {
        const synced = await syncStatusFromShiprocket(orderId, tracking.currentStatus);
        if (synced) status = synced;
      }
    } catch (err) {
      console.error("Shiprocket tracking fetch failed for order", orderId, err);
    }
  }

  // Whitelist client-safe fields only.
  res.status(200).json({
    id: order.id,
    orderNumber: order.orderNumber,
    createdAt: order.createdAt,
    items: order.items,
    subtotal: order.subtotal,
    shipping: order.shipping,
    tax: order.tax,
    total: order.total,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    status,
    awbCode: order.awbCode,
    courierName: order.courierName,
    tracking,
  });
}
