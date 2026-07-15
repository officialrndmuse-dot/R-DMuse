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
