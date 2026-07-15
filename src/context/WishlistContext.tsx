import {
  createContext, useContext, useEffect, useMemo, useState,
  type ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import { authedFetch } from "../lib/api";
import type { WishlistItem } from "../types";

interface WishlistValue {
  ids: Set<string>;
  has: (productId: string) => boolean;
  toggle: (productId: string) => Promise<void>;
}

const WishlistContext = createContext<WishlistValue | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { status, getIdToken } = useAuth();
  const [ids, setIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (status !== "signedIn") {
      setIds(new Set());
      return;
    }
    getIdToken().then(async (idToken) => {
      const res = await authedFetch("/api/account/wishlist", idToken);
      if (res.ok) {
        const items: WishlistItem[] = await res.json();
        setIds(new Set(items.map((i) => i.productId)));
      }
    });
  }, [status, getIdToken]);

  const value = useMemo<WishlistValue>(
    () => ({
      ids,
      has: (productId) => ids.has(productId),
      toggle: async (productId) => {
        const idToken = await getIdToken();
        if (!idToken) return; // caller (ProductCard) redirects to login instead
        const isWishlisted = ids.has(productId);

        // Optimistic update
        setIds((prev) => {
          const next = new Set(prev);
          isWishlisted ? next.delete(productId) : next.add(productId);
          return next;
        });

        if (isWishlisted) {
          await authedFetch(`/api/account/wishlist/${productId}`, idToken, { method: "DELETE" });
        } else {
          await authedFetch("/api/account/wishlist", idToken, {
            method: "POST",
            body: JSON.stringify({ productId }),
          });
        }
      },
    }),
    [ids, getIdToken]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used inside <WishlistProvider>");
  return ctx;
}
