import { getSupabase } from "./supabase.js";
import type { Address } from "../../src/types.js";

interface AddressRow {
  id: string;
  label: string | null;
  name: string;
  phone: string;
  address_line: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  is_default: boolean;
}

function rowToAddress(row: AddressRow): Address {
  return {
    id: row.id,
    label: row.label ?? undefined,
    name: row.name,
    phone: row.phone,
    address: row.address_line,
    city: row.city,
    state: row.state,
    pincode: row.pincode,
    country: row.country,
    isDefault: row.is_default,
  };
}

export interface AddressInput {
  label?: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

export async function listAddresses(userId: string): Promise<Address[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("addresses")
    .select()
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Failed to list addresses: ${error.message}`);
  return (data as unknown as AddressRow[]).map(rowToAddress);
}

async function unsetOtherDefaults(userId: string, exceptId?: string): Promise<void> {
  const supabase = getSupabase();
  let query = supabase.from("addresses").update({ is_default: false }).eq("user_id", userId);
  if (exceptId) query = query.neq("id", exceptId);
  await query;
}

export async function insertAddress(userId: string, input: AddressInput): Promise<Address> {
  const supabase = getSupabase();
  if (input.isDefault) await unsetOtherDefaults(userId);

  const { data, error } = await supabase
    .from("addresses")
    .insert({
      user_id: userId,
      label: input.label ?? null,
      name: input.name,
      phone: input.phone,
      address_line: input.address,
      city: input.city,
      state: input.state,
      pincode: input.pincode,
      is_default: !!input.isDefault,
    })
    .select()
    .single();
  if (error || !data) throw new Error(`Failed to add address: ${error?.message}`);
  return rowToAddress(data as AddressRow);
}

export async function updateAddress(
  id: string,
  userId: string,
  input: AddressInput
): Promise<Address | null> {
  const supabase = getSupabase();
  if (input.isDefault) await unsetOtherDefaults(userId, id);

  const { data, error } = await supabase
    .from("addresses")
    .update({
      label: input.label ?? null,
      name: input.name,
      phone: input.phone,
      address_line: input.address,
      city: input.city,
      state: input.state,
      pincode: input.pincode,
      is_default: !!input.isDefault,
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .maybeSingle();
  if (error) throw new Error(`Failed to update address: ${error.message}`);
  return data ? rowToAddress(data as AddressRow) : null;
}

export async function deleteAddress(id: string, userId: string): Promise<boolean> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("addresses")
    .delete()
    .eq("id", id)
    .eq("user_id", userId)
    .select("id");
  if (error) throw new Error(`Failed to delete address: ${error.message}`);
  return (data?.length ?? 0) > 0;
}
