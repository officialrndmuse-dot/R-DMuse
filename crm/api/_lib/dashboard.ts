import { getSupabase } from "./supabase.js";

export interface DashboardStats {
  todayOrders: number;
  todayRevenue: number;
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  pendingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  pendingReturns: number;
}

// Aggregated in application code (small dataset — a boutique store, not
// enterprise scale) rather than SQL aggregate queries, matching the same
// approach already used in listAllCustomers.
export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = getSupabase();

  const [ordersRes, customersRes, returnsRes] = await Promise.all([
    supabase.from("orders").select("total, status, created_at"),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("returns").select("id", { count: "exact", head: true }).eq("status", "requested"),
  ]);
  if (ordersRes.error) throw new Error(`Failed to load dashboard: ${ordersRes.error.message}`);
  if (customersRes.error) throw new Error(`Failed to load dashboard: ${customersRes.error.message}`);
  if (returnsRes.error) throw new Error(`Failed to load dashboard: ${returnsRes.error.message}`);

  const orders = (ordersRes.data ?? []) as { total: number; status: string; created_at: string }[];
  const todayStr = new Date().toISOString().slice(0, 10);

  let todayOrders = 0;
  let todayRevenue = 0;
  let totalRevenue = 0;
  let pendingOrders = 0;
  let shippedOrders = 0;
  let deliveredOrders = 0;

  for (const o of orders) {
    totalRevenue += o.total;
    if (o.created_at.slice(0, 10) === todayStr) {
      todayOrders += 1;
      todayRevenue += o.total;
    }
    if (o.status === "created") pendingOrders += 1;
    if (o.status === "shipped") shippedOrders += 1;
    if (o.status === "delivered") deliveredOrders += 1;
  }

  return {
    todayOrders,
    todayRevenue,
    totalRevenue,
    totalOrders: orders.length,
    totalCustomers: customersRes.count ?? 0,
    pendingOrders,
    shippedOrders,
    deliveredOrders,
    pendingReturns: returnsRes.count ?? 0,
  };
}
