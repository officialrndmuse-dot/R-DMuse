import { useMemo } from "react";
import { products as localProducts } from "../data/products";
import type { Category, Product } from "../types";

// MVP: reads from local data. To use a real API later, replace the body
// with a fetch to json-server: fetch("http://localhost:4000/products").
export function useProducts() {
  return localProducts;
}

export interface Filters {
  category?: Category | "all";
  query?: string;
  sort?: "featured" | "price-asc" | "price-desc" | "rating";
}

// Pure, testable filtering + sorting used by the catalog page.
export function filterProducts(all: Product[], f: Filters): Product[] {
  let out = [...all];
  if (f.category && f.category !== "all") {
    out = out.filter((p) => p.category === f.category);
  }
  if (f.query && f.query.trim()) {
    const q = f.query.toLowerCase();
    out = out.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    );
  }
  switch (f.sort) {
    case "price-asc": out.sort((a, b) => a.price - b.price); break;
    case "price-desc": out.sort((a, b) => b.price - a.price); break;
    case "rating": out.sort((a, b) => b.rating - a.rating); break;
    default: break; // "featured" keeps source order
  }
  return out;
}

export function useProduct(id?: string) {
  const all = useProducts();
  return useMemo(() => all.find((p) => p.id === id), [all, id]);
}
