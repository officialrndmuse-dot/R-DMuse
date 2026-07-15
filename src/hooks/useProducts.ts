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

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    supabase
      .from("products")
      .select()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (!error && data) setProducts((data as unknown as ProductRow[]).map(rowToProduct));
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
  const [product, setProduct] = useState<Product | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || !supabase) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    supabase
      .from("products")
      .select()
      .eq("id", id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        setProduct(!error && data ? rowToProduct(data as unknown as ProductRow) : undefined);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return { product, loading };
}
