import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// No generated Database types exist for this project, so the client is
// intentionally untyped (`any`) — row shapes are validated manually via the
// row-mapping functions in this directory instead.
let client: SupabaseClient<any, any, any> | null = null;

// Service-role client — server-side only. Bypasses RLS, never expose this key
// or this client to the browser.
export function getSupabase(): SupabaseClient<any, any, any> {
  if (client) return client;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars");
  }

  client = createClient(url, key, {
    auth: { persistSession: false },
  });
  return client;
}
