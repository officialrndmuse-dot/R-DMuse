import { getSupabase } from "./supabase";
import type { Order, OrderAddress, OrderItem, PaymentMethod, PaymentStatus, OrderStatus } from "../../src/types";

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
}

function rowToOrder(row: OrderRow): Order {
  return {
    id: row.id,
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
