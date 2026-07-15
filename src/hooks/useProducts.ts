import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import type { Category, Product } from "../types";

// Row shape as stored in Supabase (snake_case columns, see supabase/schema.sql)
interface ProductRow {
  id: string;
  name: string;
  category: Category;
  price: number;
  mrp: number | null;
  stock: number;
  image: string;
  rating: number;
  tags: string[];
  description: string;
  sku: string | null;
  weight_kg: number;
  length_cm: number;
  breadth_cm: number;
  height_cm: number;
}

function rowToProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    price: row.price,
    mrp: row.mrp ?? undefined,
    stock: row.stock,
    image: row.image,
    rating: row.rating,
    tags: row.tags,
    description: row.description,
    sku: row.sku ?? undefined,
    weightKg: row.weight_kg,
    lengthCm: row.length_cm,
    breadthCm: row.breadth_cm,
    heightCm: row.height_cm,
  };
}

// Module-level cache: the catalog is small and changes only via the CRM, so
// one fetch per browser session is enough — without this, every page
// (Home, Catalog, ProductDetail, Wishlist) re-fetches the full list on every
// navigation. A hard refresh picks up CRM edits; an already-open tab won't
// see them until then, which is an acceptable trade-off for a small catalog.
let cache: Product[] | null = null;
let inflight: Promise<Product[]> | null = null;

function fetchAllProducts(): Promise<Product[]> {
  if (cache) return Promise.resolve(cache);
  if (inflight) return inflight;
  if (!supabase) return Promise.resolve([]);

  inflight = Promise.resolve(
    supabase
      .from("products")
      .select()
      .then(({ data, error }) => {
        const result = !error && data ? (data as unknown as ProductRow[]).map(rowToProduct) : [];
        cache = result;
        inflight = null;
        return result;
      })
  );
  return inflight;
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>(cache ?? []);
  const [loading, setLoading] = useState(!cache);

  useEffect(() => {
    if (cache) {
      setProducts(cache);
      setLoading(false);
      return;
    }
    let cancelled = false;
    fetchAllProducts().then((result) => {
      if (cancelled) return;
      setProducts(result);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return { products, loading };
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
  const [product, setProduct] = useState<Product | undefined>(() =>
    id ? cache?.find((p) => p.id === id) : undefined
  );
  const [loading, setLoading] = useState(!cache);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    fetchAllProducts().then((result) => {
      if (cancelled) return;
      setProduct(result.find((p) => p.id === id));
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return { product, loading };
}
