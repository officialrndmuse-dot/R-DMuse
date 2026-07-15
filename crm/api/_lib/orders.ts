import { getSupabase } from "./supabase.js";
import type { Order, OrderItem, PaymentMethod, PaymentStatus, OrderStatus } from "../../src/types.js";

// Row shape as stored in Supabase (snake_case columns, see supabase/schema.sql
// in the storefront app — this CRM reads the same tables, no schema of its own).
interface OrderRow {
  id: string;
  order_number: string | null;
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

export async function listAllOrders(): Promise<Order[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase.from("orders").select().order("created_at", { ascending: false });
  if (error) throw new Error(`Failed to list orders: ${error.message}`);
  return (data as unknown as OrderRow[]).map(rowToOrder);
}
