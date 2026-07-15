import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useProduct } from "../hooks/useProducts";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";
import { inr } from "../lib/format";
import { Stars } from "../components/Stars";
import { QuantityStepper } from "../components/QuantityStepper";

export function ProductDetail() {
  const { id } = useParams();
  const { product, loading } = useProduct(id);
  const { add } = useCart();
  const { has, toggle } = useWishlist();
  const { status } = useAuth();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  if (loading) {
    return <div className="mx-auto max-w-6xl px-4 py-20 text-center text-plum/50">Loading…</div>;
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-20 text-center">
        <h1 className="text-3xl text-plum">Piece not found</h1>
        <Link to="/shop" className="mt-4 inline-block text-brass hover:underline">
          ← Back to shop
        </Link>
      </div>
    );
  }

  const soldOut = product.stock <= 0;
  const wishlisted = has(product.id);

  const handleAdd = () => {
    add(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const handleWishlist = () => {
    if (status !== "signedIn") {
      navigate("/account/login");
      return;
    }
    toggle(product.id);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Link to="/shop" className="text-sm text-plum/60 hover:text-plum">← Shop</Link>

      <div className="mt-6 grid gap-10 md:grid-cols-2">
        <div className="overflow-hidden rounded-xl2 bg-white shadow-soft">
          <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
        </div>

        <div>
          <h1 className="font-display text-4xl text-plum">{product.name}</h1>
          <div className="mt-2 flex items-center gap-3">
            <Stars rating={product.rating} />
            <span className="text-sm text-plum/50">{product.rating.toFixed(1)} rating</span>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <span className="text-3xl font-semibold">{inr(product.price)}</span>
            {product.mrp && (
              <span className="text-lg text-plum/40 line-through">{inr(product.mrp)}</span>
            )}
          </div>

          <p className="mt-5 leading-relaxed text-ink/80">{product.description}</p>

          <p className={`mt-4 text-sm ${soldOut ? "text-red-600" : "text-plum/60"}`}>
            {soldOut ? "Currently sold out" : `${product.stock} in stock`}
          </p>

          {!soldOut && (
            <div className="mt-6 flex items-center gap-4">
              <QuantityStepper value={qty} max={product.stock} onChange={setQty} />
              <button
                type="button"
                onClick={handleAdd}
                className="rounded-full bg-plum px-8 py-3 text-sm font-semibold text-ivory hover:bg-berry"
              >
                {added ? "Added ✓" : "Add to cart"}
              </button>
              <button
                type="button"
                onClick={handleWishlist}
                aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                className="grid h-11 w-11 place-items-center rounded-full border border-plum/20 text-lg hover:border-brass"
              >
                {wishlisted ? "♥" : "♡"}
              </button>
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-2">
            {product.tags.map((t) => (
              <span key={t} className="rounded-full bg-blush/30 px-3 py-1 text-xs text-plum">
                #{t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
