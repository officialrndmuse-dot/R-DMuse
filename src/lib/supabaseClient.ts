import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Account features (login, orders history, wishlist, etc.) depend on this,
// but the rest of the site (catalog, guest checkout) must keep working even
// before it's configured — so this stays null instead of throwing.
// Uses the anon/public key only (safe to expose) — it can never read/write
// orders/profiles/addresses/wishlist/returns directly, since those tables
// have RLS enabled with zero public policies. It's used purely to obtain a
// session/JWT; all actual data access goes through api/ functions using the
// service-role key after verifying that JWT server-side.
export const supabase: SupabaseClient | null =
  url && anonKey
    ? createClient(url, anonKey)
    : (console.warn(
        "Supabase auth not configured (missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY) — account features are disabled."
      ),
      null);
