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

export async function listReturnsForUser(userId: string): Promise<ReturnRequest[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("returns")
    .select()
    .eq("user_id", userId)
    .order("requested_at", { ascending: false });
  if (error) throw new Error(`Failed to list returns: ${error.message}`);
  return (data as unknown as ReturnRow[]).map(rowToReturn);
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
}

export async function listAllReturns(): Promise<AdminReturnRow[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("returns")
    .select("*, orders(customer_name)")
    .order("requested_at", { ascending: false });
  if (error) throw new Error(`Failed to list returns: ${error.message}`);
  return (data as unknown as (ReturnRow & { orders: { customer_name: string } | null })[]).map((row) => ({
    ...rowToReturn(row),
    orderCustomerName: row.orders?.customer_name ?? "—",
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
