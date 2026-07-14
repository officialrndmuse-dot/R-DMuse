import { Link } from "react-router-dom";
import { useProducts } from "../hooks/useProducts";
import { categories } from "../data/products";
import { ProductList } from "../components/ProductList";

export function Home() {
  const products = useProducts();
  const featured = products.slice(0, 4);

  return (
    <div>
      {/* HERO — the signature moment: the wordmark as art */}
      <section className="relative overflow-hidden bg-plum text-ivory">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:py-28">
          <p className="mb-4 text-sm uppercase tracking-[0.3em] text-brassLite">
            Ethnic × Modern · For every age
          </p>
          <h1 className="max-w-3xl font-display text-5xl leading-[1.05] sm:text-7xl">
            Adorn your
            <span className="italic text-brass"> every mood.</span>
          </h1>
          <p className="mt-6 max-w-lg text-ivory/70">
            Bags, earrings and festive picks — handpicked by Ronit &amp; Dhruv.
            One place for the pieces that finish every look.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/shop" className="rounded-full bg-brass px-6 py-3 text-sm font-semibold text-plum hover:bg-brassLite">
              Shop the collection
            </Link>
            <Link to="/shop?category=festive" className="rounded-full border border-ivory/30 px-6 py-3 text-sm font-semibold hover:bg-ivory/10">
              Navratri edit
            </Link>
          </div>
        </div>
      </section>

      {/* CATEGORY NAV */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="flex flex-wrap gap-3">
          {categories.map((c) => (
            <Link
              key={c.id}
              to={`/shop?category=${c.id}`}
              className="rounded-full border border-plum/15 bg-white px-5 py-2 text-sm font-medium text-plum shadow-soft hover:border-brass"
            >
              {c.label}
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED */}
      <section className="mx-auto max-w-6xl px-4 pb-10">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-3xl text-plum">Featured pieces</h2>
          <Link to="/shop" className="text-sm font-medium text-brass hover:underline">
            View all →
          </Link>
        </div>
        <ProductList products={featured} />
      </section>
    </div>
  );
}
