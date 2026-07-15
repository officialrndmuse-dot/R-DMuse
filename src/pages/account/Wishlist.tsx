import { Link } from "react-router-dom";
import { useWishlist } from "../../context/WishlistContext";
import { AccountLayout } from "../../components/account/AccountLayout";
import { ProductCard } from "../../components/ProductCard";
import { useProducts } from "../../hooks/useProducts";

export function Wishlist() {
  const { ids } = useWishlist();
  const { products } = useProducts();
  const items = products.filter((p) => ids.has(p.id));

  return (
    <AccountLayout>
      <h1 className="text-2xl text-plum">Wishlist</h1>

      {items.length === 0 ? (
        <div className="mt-6 rounded-xl2 bg-white p-8 text-center shadow-soft">
          <p className="text-plum/60">Nothing saved yet — tap the heart on any product to add it here.</p>
          <Link to="/shop" className="mt-3 inline-block text-sm text-brass hover:underline">
            Browse the shop →
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </AccountLayout>
  );
}
