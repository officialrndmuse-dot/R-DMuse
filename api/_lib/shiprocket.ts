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

export type ShippingRateResult =
  | { ok: true; rate: number }
  | { ok: false; reason: "unserviceable" }
  | { ok: false; reason: "error" };

// Live shipping cost for a delivery pincode from Shiprocket's own courier
// serviceability check -- the same rate Shiprocket would actually charge,
// rather than the flat placeholder rate in src/lib/pricing.ts. Picks the
// recommended courier's rate, falling back to the cheapest available one.
export async function getShippingRate(
  deliveryPincode: string,
  weightKg: number,
  cod: boolean
): Promise<ShippingRateResult> {
  const pickupPincode = process.env.SHIPROCKET_PICKUP_PINCODE;
  if (!pickupPincode) return { ok: false, reason: "error" };

  try {
    const token = await getToken();
    const params = new URLSearchParams({
      pickup_postcode: pickupPincode,
      delivery_postcode: deliveryPincode,
      weight: String(Math.max(weightKg, 0.1)),
      cod: cod ? "1" : "0",
    });

    const res = await fetch(`${BASE_URL}/courier/serviceability/?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return { ok: false, reason: "error" };

    const data = (await res.json()) as {
      data?: {
        available_courier_companies?: { rate: number; courier_company_id: number }[];
        recommended_courier_id?: number;
      };
    };
    const couriers = data.data?.available_courier_companies ?? [];
    if (couriers.length === 0) return { ok: false, reason: "unserviceable" };

    const recommendedId = data.data?.recommended_courier_id;
    const chosen =
      couriers.find((c) => c.courier_company_id === recommendedId) ??
      couriers.reduce((a, b) => (a.rate <= b.rate ? a : b));
    return { ok: true, rate: Math.round(chosen.rate) };
  } catch {
    return { ok: false, reason: "error" };
  }
}

export interface AwbAssignResult {
  awbCode: string;
  courierName: string;
}

// Auto-assigns Shiprocket's recommended courier and generates an AWB for the
// shipment (no courier_id passed = Shiprocket picks the recommended one).
// Best-effort: returns null on failure instead of throwing -- a missing AWB
// must not fail checkout, and can still be assigned manually from the
// Shiprocket dashboard.
export async function assignAWB(shipmentId: string): Promise<AwbAssignResult | null> {
  const token = await getToken();
  const res = await fetch(`${BASE_URL}/courier/assign/awb`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ shipment_id: Number(shipmentId) }),
  });

  if (!res.ok) {
    console.error("Shiprocket AWB assignment failed:", res.status, await res.text());
    return null;
  }

  const data = (await res.json()) as {
    response?: { data?: { awb_code?: string | number; courier_name?: string } };
  };
  const awbCode = data.response?.data?.awb_code;
  if (!awbCode) return null;
  return { awbCode: String(awbCode), courierName: data.response?.data?.courier_name ?? "" };
}

export interface TrackingEvent {
  date: string;
  status: string;
  activity: string;
  location: string;
}

export interface TrackingInfo {
  currentStatus: string;
  edd: string | null;
  trackUrl: string | null;
  events: TrackingEvent[];
}

// Live tracking straight from Shiprocket -- the same scan history shown on
// Shiprocket's own tracking page.
export async function trackShipment(awbCode: string): Promise<TrackingInfo | null> {
  const token = await getToken();
  const res = await fetch(`${BASE_URL}/courier/track/awb/${encodeURIComponent(awbCode)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;

  const data = (await res.json()) as {
    tracking_data?: {
      track_url?: string;
      shipment_track?: { current_status?: string; edd?: string }[];
      shipment_track_activities?: { date?: string; status?: string; activity?: string; location?: string }[];
    };
  };
  const tracking = data.tracking_data;
  if (!tracking) return null;

  const summary = tracking.shipment_track?.[0];
  const activities = tracking.shipment_track_activities ?? [];

  return {
    currentStatus: summary?.current_status ?? "In transit",
    edd: summary?.edd ?? null,
    trackUrl: tracking.track_url ?? null,
    events: activities.map((a) => ({
      date: a.date ?? "",
      status: a.status ?? "",
      activity: a.activity ?? "",
      location: a.location ?? "",
    })),
  };
}
