import { Link, useNavigate } from "react-router-dom";
import type { Product } from "../types";
import { inr } from "../lib/format";
import { Stars } from "./Stars";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const { has, toggle } = useWishlist();
  const { status } = useAuth();
  const navigate = useNavigate();
  const soldOut = product.stock <= 0;
  const wishlisted = has(product.id);

  const onWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (status !== "signedIn") {
      navigate("/account/login");
      return;
    }
    toggle(product.id);
  };

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl2 bg-white shadow-soft">
      <Link to={`/product/${product.id}`} className="relative block aspect-square overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {product.mrp && !soldOut && (
          <span className="absolute left-3 top-3 rounded-full bg-brass px-2 py-1 text-[11px] font-bold text-plum">
            Save {inr(product.mrp - product.price)}
          </span>
        )}
        {soldOut && (
          <span className="absolute inset-0 grid place-items-center bg-plum/50 text-sm font-semibold text-ivory">
            Sold out
          </span>
        )}
        <button
          type="button"
          onClick={onWishlistClick}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-lg shadow-soft"
        >
          {wishlisted ? "♥" : "♡"}
        </button>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-display text-lg leading-snug text-plum hover:underline">
            {product.name}
          </h3>
        </Link>
        <div className="mt-1"><Stars rating={product.rating} /></div>

        <div className="mt-3 flex items-center gap-2">
          <span className="text-lg font-semibold text-ink">{inr(product.price)}</span>
          {product.mrp && (
            <span className="text-sm text-plum/40 line-through">{inr(product.mrp)}</span>
          )}
        </div>

        <button
          type="button"
          onClick={() => add(product)}
          disabled={soldOut}
          className="mt-4 rounded-full bg-plum py-2 text-sm font-medium text-ivory transition-colors hover:bg-berry disabled:cursor-not-allowed disabled:opacity-40"
        >
          {soldOut ? "Sold out" : "Add to cart"}
        </button>
      </div>
    </div>
  );
}
