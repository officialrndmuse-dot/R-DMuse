import { getSupabase } from "./supabase.js";
import type { Profile } from "../../src/types.js";
import type { AuthedUser } from "./auth.js";

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

export async function getOrCreateProfile(user: AuthedUser): Promise<Profile> {
  const supabase = getSupabase();
  const { data: existing } = await supabase.from("profiles").select().eq("id", user.uid).maybeSingle();
  if (existing) return rowToProfile(existing as ProfileRow);

  const { data, error } = await supabase
    .from("profiles")
    .insert({ id: user.uid, phone: user.phone, email: user.email })
    .select()
    .single();
  if (error || !data) throw new Error(`Failed to create profile: ${error?.message}`);
  return rowToProfile(data as ProfileRow);
}

export async function updateProfileName(userId: string, name: string): Promise<Profile> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("profiles")
    .update({ name })
    .eq("id", userId)
    .select()
    .single();
  if (error || !data) throw new Error(`Failed to update profile: ${error?.message}`);
  return rowToProfile(data as ProfileRow);
}
