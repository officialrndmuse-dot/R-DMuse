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

// liveShippingRate: the real Shiprocket-quoted cost for this delivery
// pincode, when available (see api/_lib/shiprocket.ts's getShippingRate).
// Falls back to the flat placeholder rate if Shiprocket couldn't be reached —
// the free-shipping-over-threshold perk still applies either way.
export function computeOrderTotals(subtotal: number, liveShippingRate?: number | null): OrderTotals {
  const baseRate = liveShippingRate ?? SHIPPING_FLAT;
  const shipping = subtotal >= FREE_SHIP_OVER ? 0 : baseRate;
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
