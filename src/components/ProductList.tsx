import type { Product } from "../types";
import { ProductCard } from "./ProductCard";

export function ProductList({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div className="rounded-xl2 border border-dashed border-plum/20 p-12 text-center text-plum/60">
        No pieces match that search yet. Try another category or keyword.
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
