import {
  createContext, useContext, useEffect, useMemo, useReducer,
  type ReactNode,
} from "react";
import type { CartItem, Product } from "../types";

// ---- State + actions ----
interface CartState { items: CartItem[]; }

type Action =
  | { type: "ADD"; product: Product; qty?: number }
  | { type: "REMOVE"; id: string }
  | { type: "SET_QTY"; id: string; qty: number }
  | { type: "CLEAR" };

const STORAGE_KEY = "rndmuse.cart";

function reducer(state: CartState, action: Action): CartState {
  switch (action.type) {
    case "ADD": {
      const qty = action.qty ?? 1;
      const existing = state.items.find((i) => i.product.id === action.product.id);
      if (existing) {
        // Don't exceed available stock
        const capped = Math.min(existing.qty + qty, action.product.stock);
        return {
          items: state.items.map((i) =>
            i.product.id === action.product.id ? { ...i, qty: capped } : i
          ),
        };
      }
      return { items: [...state.items, { product: action.product, qty }] };
    }
    case "REMOVE":
      return { items: state.items.filter((i) => i.product.id !== action.id) };
    case "SET_QTY":
      return {
        items: state.items
          .map((i) =>
            i.product.id === action.id
              ? { ...i, qty: Math.max(1, Math.min(action.qty, i.product.stock)) }
              : i
          )
          .filter((i) => i.qty > 0),
      };
    case "CLEAR":
      return { items: [] };
    default:
      return state;
  }
}

// Lazy init from localStorage so the cart survives refreshes
function init(): CartState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { items: JSON.parse(raw) } : { items: [] };
  } catch {
    return { items: [] };
  }
}

interface CartValue {
  items: CartItem[];
  count: number;         // total units
  subtotal: number;      // ₹ before tax/shipping
  add: (product: Product, qty?: number) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, init);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
  }, [state.items]);

  const value = useMemo<CartValue>(() => {
    const count = state.items.reduce((n, i) => n + i.qty, 0);
    const subtotal = state.items.reduce((s, i) => s + i.qty * i.product.price, 0);
    return {
      items: state.items,
      count,
      subtotal,
      add: (product, qty) => dispatch({ type: "ADD", product, qty }),
      remove: (id) => dispatch({ type: "REMOVE", id }),
      setQty: (id, qty) => dispatch({ type: "SET_QTY", id, qty }),
      clear: () => dispatch({ type: "CLEAR" }),
    };
  }, [state.items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// Handy hook — throws if used outside the provider
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
