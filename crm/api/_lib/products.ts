import { getSupabase } from "./supabase.js";
import type { Product } from "../../src/types.js";

interface ProductRow {
  id: string;
  name: string;
  category: Product["category"];
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
  created_at: string;
  updated_at: string;
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
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export interface ProductInput {
  name: string;
  category: Product["category"];
  price: number;
  mrp?: number | null;
  stock: number;
  image: string;
  rating?: number;
  tags: string[];
  description: string;
  sku?: string | null;
  weightKg: number;
  lengthCm: number;
  breadthCm: number;
  heightCm: number;
}

function inputToRow(input: ProductInput) {
  return {
    name: input.name,
    category: input.category,
    price: input.price,
    mrp: input.mrp ?? null,
    stock: input.stock,
    image: input.image,
    rating: input.rating ?? 5,
    tags: input.tags,
    description: input.description,
    sku: input.sku ?? null,
    weight_kg: input.weightKg,
    length_cm: input.lengthCm,
    breadth_cm: input.breadthCm,
    height_cm: input.heightCm,
  };
}

export async function listProducts(): Promise<Product[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("products")
    .select()
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Failed to list products: ${error.message}`);
  return (data as ProductRow[]).map(rowToProduct);
}

export async function getProduct(id: string): Promise<Product | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase.from("products").select().eq("id", id).maybeSingle();
  if (error) throw new Error(`Failed to get product: ${error.message}`);
  return data ? rowToProduct(data as ProductRow) : null;
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const supabase = getSupabase();
  const { data, error } = await supabase.from("products").insert(inputToRow(input)).select().single();
  if (error) throw new Error(`Failed to create product: ${error.message}`);
  return rowToProduct(data as ProductRow);
}

export async function updateProduct(id: string, input: ProductInput): Promise<Product | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("products")
    .update(inputToRow(input))
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) throw new Error(`Failed to update product: ${error.message}`);
  return data ? rowToProduct(data as ProductRow) : null;
}

export async function deleteProduct(id: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(`Failed to delete product: ${error.message}`);
}
