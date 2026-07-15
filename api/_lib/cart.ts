import { getSupabase } from "./supabase.js";
import type { OrderItem } from "../../src/types.js";

export interface CartInputLine {
  productId: string;
  qty: number;
}

interface ProductRow {
  id: string;
  name: string;
  price: number;
  stock: number;
  sku: string | null;
  weight_kg: number;
  length_cm: number;
  breadth_cm: number;
  height_cm: number;
}

// Rebuilds order line items from the authoritative product catalog —
// price/weight/dimensions are never trusted from the client.
export async function resolveOrderItems(
  cart: unknown
): Promise<{ items: OrderItem[]; subtotal: number }> {
  if (!Array.isArray(cart) || cart.length === 0) {
    throw new Error("Cart is empty");
  }
  const lines = cart as CartInputLine[];

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("products")
    .select()
    .in("id", lines.map((l) => l.productId));
  if (error) throw new Error(`Failed to load products: ${error.message}`);
  const rows = data as ProductRow[];

  const items: OrderItem[] = lines.map((line) => {
    const product = rows.find((p) => p.id === line.productId);
    if (!product) throw new Error(`Unknown product: ${line.productId}`);

    const qty = Math.floor(Number(line.qty));
    if (!Number.isFinite(qty) || qty < 1 || qty > product.stock) {
      throw new Error(`Invalid quantity for ${product.name}`);
    }

    return {
      productId: product.id,
      sku: product.sku ?? product.id,
      name: product.name,
      price: product.price,
      qty,
      weightKg: product.weight_kg,
      lengthCm: product.length_cm,
      breadthCm: product.breadth_cm,
      heightCm: product.height_cm,
    };
  });

  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  return { items, subtotal };
}
