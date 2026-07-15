import { getSupabase } from "./supabase.js";
import type { WishlistItem } from "../../src/types.js";

interface WishlistRow {
  id: string;
  product_id: string;
  created_at: string;
}

function rowToItem(row: WishlistRow): WishlistItem {
  return { id: row.id, productId: row.product_id, createdAt: row.created_at };
}

export async function listWishlist(userId: string): Promise<WishlistItem[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("wishlist")
    .select()
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Failed to list wishlist: ${error.message}`);
  return (data as unknown as WishlistRow[]).map(rowToItem);
}

export async function addWishlistItem(userId: string, productId: string): Promise<void> {
  const supabase = getSupabase();
  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id")
    .eq("id", productId)
    .maybeSingle();
  if (productError) throw new Error(`Failed to look up product: ${productError.message}`);
  if (!product) throw new Error("Unknown product");

  const { error } = await supabase
    .from("wishlist")
    .insert({ user_id: userId, product_id: productId });
  // Unique (user_id, product_id) conflict = already wishlisted, treat as success.
  if (error && error.code !== "23505") throw new Error(`Failed to add to wishlist: ${error.message}`);
}

export async function removeWishlistItem(userId: string, productId: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("wishlist")
    .delete()
    .eq("user_id", userId)
    .eq("product_id", productId);
  if (error) throw new Error(`Failed to remove from wishlist: ${error.message}`);
}
