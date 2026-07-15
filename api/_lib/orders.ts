import { getSupabase } from "./supabase.js";
import type { Order, OrderAddress, OrderItem, PaymentMethod, PaymentStatus, OrderStatus } from "../../src/types.js";

// Row shape as stored in Supabase (snake_case columns, see supabase/schema.sql)
interface OrderRow {
  id: string;
  created_at: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  address_line: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  shiprocket_order_id: string | null;
  shiprocket_shipment_id: string | null;
  awb_code: string | null;
  courier_name: string | null;
  status: OrderStatus;
  user_id: string | null;
  order_number: string | null;
}

// 15-digit timestamp+random string, shown to customers as "ORD-<this>".
// Existing rows predating this column fall back to a shortened id.
function generateOrderNumber(): string {
  const rand2 = Math.floor(10 + Math.random() * 90);
  return `${Date.now()}${rand2}`;
}

function rowToOrder(row: OrderRow): Order {
  return {
    id: row.id,
    orderNumber: row.order_number ?? row.id.slice(0, 8).toUpperCase(),
    createdAt: row.created_at,
    address: {
      name: row.customer_name,
      email: row.customer_email,
      phone: row.customer_phone,
      address: row.address_line,
      city: row.city,
      state: row.state,
      pincode: row.pincode,
      country: row.country,
    },
    items: row.items,
    subtotal: row.subtotal,
    shipping: row.shipping,
    tax: row.tax,
    total: row.total,
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    razorpayOrderId: row.razorpay_order_id ?? undefined,
    razorpayPaymentId: row.razorpay_payment_id ?? undefined,
    shiprocketOrderId: row.shiprocket_order_id ?? undefined,
    shiprocketShipmentId: row.shiprocket_shipment_id ?? undefined,
    awbCode: row.awb_code ?? undefined,
    courierName: row.courier_name ?? undefined,
    status: row.status,
    userId: row.user_id ?? undefined,
  };
}

export interface NewOrderInput {
  address: OrderAddress;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  userId?: string;
}

export async function insertOrder(input: NewOrderInput): Promise<Order> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("orders")
    .insert({
      customer_name: input.address.name,
      customer_email: input.address.email,
      customer_phone: input.address.phone,
      address_line: input.address.address,
      city: input.address.city,
      state: input.address.state,
      pincode: input.address.pincode,
      country: input.address.country || "India",
      items: input.items,
      subtotal: input.subtotal,
      shipping: input.shipping,
      tax: input.tax,
      total: input.total,
      payment_method: input.paymentMethod,
      payment_status: input.paymentMethod === "cod" ? "cod_pending" : "pending",
      status: "created",
      user_id: input.userId ?? null,
      order_number: generateOrderNumber(),
    })
    .select()
    .single();

  if (error || !data) throw new Error(`Failed to insert order: ${error?.message}`);
  return rowToOrder(data as unknown as OrderRow);
}

export async function getOrder(orderId: string): Promise<Order | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase.from("orders").select().eq("id", orderId).maybeSingle();
  if (error) throw new Error(`Failed to fetch order: ${error.message}`);
  if (!data) return null;
  return rowToOrder(data as unknown as OrderRow);
}

export async function listOrdersForUser(userId: string): Promise<Order[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("orders")
    .select()
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Failed to list orders: ${error.message}`);
  return (data as unknown as OrderRow[]).map(rowToOrder);
}

// Attaches any prior guest orders (placed with no account) to this user,
// matched by phone number. orders.customer_phone is a bare 10-digit number
// (see api/_lib/validate.ts); the auth phone is E.164 (+91XXXXXXXXXX).
export async function claimGuestOrders(userId: string, authPhone: string): Promise<number> {
  const barePhone = authPhone.replace(/^\+91/, "");
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("orders")
    .update({ user_id: userId })
    .eq("customer_phone", barePhone)
    .is("user_id", null)
    .select("id");
  if (error) throw new Error(`Failed to claim orders: ${error.message}`);
  return data?.length ?? 0;
}

export async function setRazorpayOrderId(orderId: string, razorpayOrderId: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("orders")
    .update({ razorpay_order_id: razorpayOrderId })
    .eq("id", orderId);
  if (error) throw new Error(`Failed to set razorpay order id: ${error.message}`);
}

export async function markPaymentFailed(orderId: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.from("orders").update({ payment_status: "failed" }).eq("id", orderId);
  if (error) throw new Error(`Failed to mark payment failed: ${error.message}`);
}

export async function markPaid(orderId: string, razorpayPaymentId: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("orders")
    .update({ payment_status: "paid", razorpay_payment_id: razorpayPaymentId })
    .eq("id", orderId);
  if (error) throw new Error(`Failed to mark order paid: ${error.message}`);
}

export interface ShiprocketResult {
  shiprocketOrderId: string;
  shiprocketShipmentId: string;
}

export async function markShipmentCreated(orderId: string, result: ShiprocketResult): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("orders")
    .update({
      shiprocket_order_id: result.shiprocketOrderId,
      shiprocket_shipment_id: result.shiprocketShipmentId,
      status: "confirmed",
    })
    .eq("id", orderId);
  if (error) throw new Error(`Failed to mark shipment created: ${error.message}`);
}

export async function markCourierAssigned(
  orderId: string,
  result: { awbCode: string; courierName: string }
): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("orders")
    .update({ awb_code: result.awbCode, courier_name: result.courierName })
    .eq("id", orderId);
  if (error) throw new Error(`Failed to mark courier assigned: ${error.message}`);
}

const STATUS_RANK: Record<OrderStatus, number> = {
  created: 0,
  confirmed: 1,
  shipped: 2,
  delivered: 3,
  cancelled: 4,
};

// Opportunistically advances our own status field to match Shiprocket's live
// tracking status whenever a customer checks the tracking page -- only ever
// moves forward, and never touches an order that's already delivered/cancelled.
// Returns the order's resulting status either way, so callers don't need to
// re-derive it themselves.
export async function syncStatusFromShiprocket(
  orderId: string,
  shiprocketStatus: string
): Promise<OrderStatus | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase.from("orders").select("status").eq("id", orderId).maybeSingle();
  if (error || !data) return null;
  const current = (data as { status: OrderStatus }).status;
  if (current === "cancelled" || current === "delivered") return current;

  const normalized = shiprocketStatus.toLowerCase();
  let next: OrderStatus = current;
  if (normalized.includes("delivered")) next = "delivered";
  else if (/out for delivery|in transit|shipped|picked up/.test(normalized)) next = "shipped";

  if (STATUS_RANK[next] <= STATUS_RANK[current]) return current;

  const { error: updateError } = await supabase.from("orders").update({ status: next }).eq("id", orderId);
  if (updateError) return current;
  return next;
}
