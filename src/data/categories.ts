import type { Product } from "../types";

// Static UI metadata (filter-chip labels) — categories themselves are a
// fixed set, not managed through the CRM.
export const categories: { id: Product["category"]; label: string }[] = [
  { id: "bags", label: "Bags" },
  { id: "earrings", label: "Earrings" },
  { id: "festive", label: "Festive & Navratri" },
  { id: "hair", label: "Hair" },
  { id: "bangles", label: "Bangles" },
];
