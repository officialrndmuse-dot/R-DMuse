// ---- Core data models ----

export type Category = "bags" | "earrings" | "festive" | "hair" | "bangles";

export interface Product {
  id: string;
  name: string;
  category: Category;
  price: number;        // in INR (₹)
  mrp?: number;         // optional strike-through price
  image: string;        // image URL or /public path
  rating: number;       // 0–5
  stock: number;        // units available
  tags: string[];
  description: string;
}

export interface CartItem {
  product: Product;
  qty: number;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;         // simple paragraphs separated by \n\n
  cover: string;
  author: string;
  date: string;         // ISO date
  tags: string[];
}
