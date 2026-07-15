import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Uses the anon/public key only (safe to expose) — it can never read/write
// orders/profiles/addresses/returns directly, since those tables have RLS
// enabled with zero public policies. It's used purely to obtain a session
// JWT; all actual data access goes through api/ functions using the
// service-role key after verifying that JWT + the ADMIN_EMAILS allow-list
// server-side.
function createSupabaseClient(): SupabaseClient | null {
  if (!url || !anonKey) {
    console.warn(
      "Supabase auth not configured (missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY) — sign-in is disabled."
    );
    return null;
  }
  try {
    return createClient(url, anonKey);
  } catch (err) {
    console.error(
      "Supabase auth misconfigured (VITE_SUPABASE_URL must be a valid https:// URL) — sign-in is disabled.",
      err
    );
    return null;
  }
}

export const supabase: SupabaseClient | null = createSupabaseClient();
