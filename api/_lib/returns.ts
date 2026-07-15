import { getSupabase } from "./supabase.js";
import type { ReturnRequest, ReturnStatus } from "../../src/types.js";

interface ReturnRow {
  id: string;
  order_id: string;
  reason: string;
  item_ids: string[] | null;
  status: ReturnStatus;
  requested_at: string;
}

function rowToReturn(row: ReturnRow): ReturnRequest {
  return {
    id: row.id,
    orderId: row.order_id,
    reason: row.reason,
    itemIds: row.item_ids ?? undefined,
    status: row.status,
    requestedAt: row.requested_at,
  };
}

export async function listReturnsForUser(userId: string): Promise<(ReturnRequest & { orderNumber: string })[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("returns")
    .select("*, orders(order_number)")
    .eq("user_id", userId)
    .order("requested_at", { ascending: false });
  if (error) throw new Error(`Failed to list returns: ${error.message}`);
  return (data as unknown as (ReturnRow & { orders: { order_number: string | null } | null })[]).map((row) => ({
    ...rowToReturn(row),
    orderNumber: row.orders?.order_number ?? row.order_id.slice(0, 8).toUpperCase(),
  }));
}

export async function createReturn(
  userId: string,
  orderId: string,
  reason: string,
  itemIds?: string[]
): Promise<ReturnRequest> {
  const supabase = getSupabase();

  // Ownership check — the order must belong to this user.
  const { data: order } = await supabase
    .from("orders")
    .select("id")
    .eq("id", orderId)
    .eq("user_id", userId)
    .maybeSingle();
  if (!order) throw new Error("Order not found");

  const { data, error } = await supabase
    .from("returns")
    .insert({ order_id: orderId, user_id: userId, reason, item_ids: itemIds ?? null })
    .select()
    .single();
  if (error || !data) throw new Error(`Failed to create return: ${error?.message}`);
  return rowToReturn(data as ReturnRow);
}

// ---- Admin ----

export interface AdminReturnRow extends ReturnRequest {
  orderCustomerName: string;
  orderNumber: string;
}

export async function listAllReturns(): Promise<AdminReturnRow[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("returns")
    .select("*, orders(customer_name, order_number)")
    .order("requested_at", { ascending: false });
  if (error) throw new Error(`Failed to list returns: ${error.message}`);
  return (
    data as unknown as (ReturnRow & {
      orders: { customer_name: string; order_number: string | null } | null;
    })[]
  ).map((row) => ({
    ...rowToReturn(row),
    orderCustomerName: row.orders?.customer_name ?? "—",
    orderNumber: row.orders?.order_number ?? row.order_id.slice(0, 8).toUpperCase(),
  }));
}

export async function updateReturnStatus(id: string, status: ReturnStatus): Promise<ReturnRequest | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("returns")
    .update({ status })
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) throw new Error(`Failed to update return: ${error.message}`);
  return data ? rowToReturn(data as ReturnRow) : null;
}
