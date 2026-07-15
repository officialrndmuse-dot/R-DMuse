// Subset of the storefront's types.ts — only what the CRM reads/displays.

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
  country: string;
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
  orderNumber: string;
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
  userId?: string;
}

export interface Profile {
  id: string; // Supabase Auth uid
  name: string | null;
  phone: string | null;
  email: string | null;
  createdAt: string;
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

export type ReturnStatus = "requested" | "approved" | "rejected" | "completed";

export interface ReturnRequest {
  id: string;
  orderId: string;
  reason: string;
  itemIds?: string[];
  status: ReturnStatus;
  requestedAt: string;
}

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
