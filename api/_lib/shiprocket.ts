import type { Order } from "../../src/types.js";

const BASE_URL = "https://apiv2.shiprocket.in/v1/external";

// Module-level cache — lives only for the duration of a warm serverless
// instance. Cold starts just re-login, which is cheap and infrequent enough
// (token is valid ~10 days) not to need a DB-backed cache for phase 1.
let cachedToken: { token: string; expiresAt: number } | null = null;

async function getToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token;
  }

  const email = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;
  if (!email || !password) {
    throw new Error("Missing SHIPROCKET_EMAIL or SHIPROCKET_PASSWORD env vars");
  }

  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    throw new Error(`Shiprocket auth failed: ${res.status} ${await res.text()}`);
  }

  const data = (await res.json()) as { token: string };
  // Token is valid ~10 days; refresh a day early to be safe.
  cachedToken = { token: data.token, expiresAt: Date.now() + 9 * 24 * 60 * 60 * 1000 };
  return data.token;
}

export interface ShiprocketOrderResult {
  shiprocketOrderId: string;
  shiprocketShipmentId: string;
}

export async function createShiprocketOrder(order: Order): Promise<ShiprocketOrderResult> {
  const pickupLocation = process.env.SHIPROCKET_PICKUP_LOCATION;
  if (!pickupLocation) {
    throw new Error("Missing SHIPROCKET_PICKUP_LOCATION env var");
  }

  const token = await getToken();

  const totalWeightKg = order.items.reduce((sum, i) => sum + i.weightKg * i.qty, 0);
  // Conservative box estimate: dimensions of the single largest item.
  const biggest = order.items.reduce((a, b) =>
    a.lengthCm * a.breadthCm * a.heightCm >= b.lengthCm * b.breadthCm * b.heightCm ? a : b
  );

  const payload = {
    order_id: order.id,
    order_date: order.createdAt.slice(0, 10),
    pickup_location: pickupLocation,
    billing_customer_name: order.address.name,
    billing_last_name: "",
    billing_address: order.address.address,
    billing_city: order.address.city,
    billing_pincode: order.address.pincode,
    billing_state: order.address.state,
    billing_country: order.address.country || "India",
    billing_email: order.address.email,
    billing_phone: order.address.phone,
    shipping_is_billing: true,
    order_items: order.items.map((item) => ({
      name: item.name,
      sku: item.sku,
      units: item.qty,
      selling_price: item.price,
    })),
    payment_method: order.paymentMethod === "cod" ? "COD" : "Prepaid",
    sub_total: order.total,
    length: biggest.lengthCm,
    breadth: biggest.breadthCm,
    height: biggest.heightCm,
    weight: totalWeightKg,
  };

  const res = await fetch(`${BASE_URL}/orders/create/adhoc`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Shiprocket order creation failed: ${res.status} ${await res.text()}`);
  }

  const data = (await res.json()) as { order_id: number; shipment_id: number };
  return {
    shiprocketOrderId: String(data.order_id),
    shiprocketShipmentId: String(data.shipment_id),
  };
}
