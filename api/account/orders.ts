import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAuthedUser } from "../_lib/auth.js";
import { listOrdersForUser } from "../_lib/orders.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const user = await requireAuthedUser(req, res);
  if (!user) return;

  const orders = await listOrdersForUser(user.uid);
  res.status(200).json(
    orders.map((order) => ({
      id: order.id,
      createdAt: order.createdAt,
      items: order.items,
      total: order.total,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      status: order.status,
      awbCode: order.awbCode,
      courierName: order.courierName,
    }))
  );
}
