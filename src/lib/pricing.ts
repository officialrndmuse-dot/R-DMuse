import type { Product } from "../types";

// Placeholder rates — wire to real GST logic later
export const TAX_RATE = 0.03;        // 3% placeholder
export const SHIPPING_FLAT = 79;     // ₹79 flat
export const FREE_SHIP_OVER = 1499;  // free above this subtotal

export interface OrderTotals {
  shipping: number;
  tax: number;
  total: number;
}

export function computeOrderTotals(subtotal: number): OrderTotals {
  const shipping = subtotal >= FREE_SHIP_OVER ? 0 : SHIPPING_FLAT;
  const tax = Math.round(subtotal * TAX_RATE);
  const total = subtotal + shipping + tax;
  return { shipping, tax, total };
}

// Shiprocket needs weight/dimensions per item for rate calculation.
// TODO(rnd-muse): fill in real per-product weight/dimensions before going live —
// these defaults are rough placeholders (small accessory box).
const DEFAULT_WEIGHT_KG = 0.2;
const DEFAULT_LENGTH_CM = 15;
const DEFAULT_BREADTH_CM = 10;
const DEFAULT_HEIGHT_CM = 5;

export function getShippingDims(product: Pick<Product, "weightKg" | "lengthCm" | "breadthCm" | "heightCm">) {
  return {
    weightKg: product.weightKg ?? DEFAULT_WEIGHT_KG,
    lengthCm: product.lengthCm ?? DEFAULT_LENGTH_CM,
    breadthCm: product.breadthCm ?? DEFAULT_BREADTH_CM,
    heightCm: product.heightCm ?? DEFAULT_HEIGHT_CM,
  };
}
