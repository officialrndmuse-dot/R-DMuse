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
