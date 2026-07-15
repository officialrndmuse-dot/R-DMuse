import { getSupabase } from "./supabase.js";
import type { Profile, CustomerSummary } from "../../src/types.js";

interface ProfileRow {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  created_at: string;
}

function rowToProfile(row: ProfileRow): Profile {
  return { id: row.id, name: row.name, phone: row.phone, email: row.email, createdAt: row.created_at };
}

export async function getProfile(id: string): Promise<Profile | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase.from("profiles").select().eq("id", id).maybeSingle();
  if (error) throw new Error(`Failed to fetch profile: ${error.message}`);
  return data ? rowToProfile(data as ProfileRow) : null;
}

// Every registered customer, enriched with order aggregates. Aggregated in
// application code rather than a SQL join, since orders.user_id has no
// declared FK relationship for PostgREST embedding, and the data volume here
// is small (a boutique store, not enterprise scale).
export async function listAllCustomers(): Promise<CustomerSummary[]> {
  const supabase = getSupabase();

  const [{ data: profiles, error: profilesError }, { data: orders, error: ordersError }] = await Promise.all([
    supabase.from("profiles").select().order("created_at", { ascending: false }),
    supabase.from("orders").select("user_id, total, created_at").not("user_id", "is", null),
  ]);
  if (profilesError) throw new Error(`Failed to list customers: ${profilesError.message}`);
  if (ordersError) throw new Error(`Failed to list customer orders: ${ordersError.message}`);

  const stats = new Map<string, { count: number; total: number; last: string }>();
  for (const o of (orders ?? []) as { user_id: string; total: number; created_at: string }[]) {
    const s = stats.get(o.user_id) ?? { count: 0, total: 0, last: o.created_at };
    s.count += 1;
    s.total += o.total;
    if (o.created_at > s.last) s.last = o.created_at;
    stats.set(o.user_id, s);
  }

  return (profiles as ProfileRow[]).map((row) => {
    const s = stats.get(row.id);
    return {
      id: row.id,
      name: row.name,
      phone: row.phone,
      email: row.email,
      orderCount: s?.count ?? 0,
      totalSpent: s?.total ?? 0,
      lastOrderAt: s?.last ?? null,
      joinedAt: row.created_at,
    };
  });
}
