import { products } from "../../src/data/products.js";
import { getShippingDims } from "../../src/lib/pricing.js";
import type { OrderItem } from "../../src/types.js";

export interface CartInputLine {
  productId: string;
  qty: number;
}

// Rebuilds order line items from the authoritative product catalog —
// price/weight/dimensions are never trusted from the client.
export function resolveOrderItems(cart: unknown): { items: OrderItem[]; subtotal: number } {
  if (!Array.isArray(cart) || cart.length === 0) {
    throw new Error("Cart is empty");
  }

  const items: OrderItem[] = cart.map((line: CartInputLine) => {
    const product = products.find((p) => p.id === line.productId);
    if (!product) throw new Error(`Unknown product: ${line.productId}`);

    const qty = Math.floor(Number(line.qty));
    if (!Number.isFinite(qty) || qty < 1 || qty > product.stock) {
      throw new Error(`Invalid quantity for ${product.name}`);
    }

    const dims = getShippingDims(product);
    return {
      productId: product.id,
      sku: product.sku ?? product.id,
      name: product.name,
      price: product.price,
      qty,
      ...dims,
    };
  });

  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  return { items, subtotal };
}
