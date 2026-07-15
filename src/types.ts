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
  sku?: string;         // falls back to `id` if absent
  weightKg?: number;    // falls back to a default via getShippingDims()
  lengthCm?: number;
  breadthCm?: number;
  heightCm?: number;
}

export interface CartItem {
  product: Product;
  qty: number;
}

// ---- Orders (checkout / Shiprocket / Razorpay) ----

export type PaymentMethod = "razorpay" | "cod";
export type PaymentStatus = "pending" | "paid" | "failed" | "cod_pending";
export type OrderStatus = "created" | "confirmed" | "shipped" | "delivered" | "cancelled";

export interface OrderAddress {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string; // default "India"
}

export interface OrderItem {
  productId: string;
  sku: string;
  name: string;
  price: number;
  qty: number;
  weightKg: number;
  lengthCm: number;
  breadthCm: number;
  heightCm: number;
}

export interface Order {
  id: string;
  createdAt: string;
  address: OrderAddress;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  shiprocketOrderId?: string;
  shiprocketShipmentId?: string;
  awbCode?: string;
  courierName?: string;
  status: OrderStatus;
  userId?: string; // Supabase Auth uid, if placed while signed in
}

// ---- Customer accounts ----

export interface Profile {
  id: string; // Supabase Auth uid
  name: string | null;
  phone: string | null;
  email: string | null;
  createdAt: string;
}

// Admin-only: a registered customer enriched with order aggregates.
export interface CustomerSummary {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  orderCount: number;
  totalSpent: number;
  lastOrderAt: string | null;
  joinedAt: string;
}

export interface Address {
  id: string;
  label?: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
}

export interface WishlistItem {
  id: string;
  productId: string;
  createdAt: string;
}

export type ReturnStatus = "requested" | "approved" | "rejected" | "completed";

export interface ReturnRequest {
  id: string;
  orderId: string;
  reason: string;
  itemIds?: string[];
  status: ReturnStatus;
  requestedAt: string;
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
