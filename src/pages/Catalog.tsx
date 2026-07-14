import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useProducts, filterProducts, type Filters } from "../hooks/useProducts";
import { categories } from "../data/products";
import { ProductList } from "../components/ProductList";
import type { Category } from "../types";
import type { ReactNode } from "react";

export function Catalog() {
  const all = useProducts();
  const [params, setParams] = useSearchParams();

  // Category is driven by the URL (?category=…) so links + back button work
  const category = (params.get("category") as Category | null) ?? "all";
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Filters["sort"]>("featured");

  const results = useMemo(
    () => filterProducts(all, { category, query, sort }),
    [all, category, query, sort]
  );

  const setCategory = (c: Category | "all") => {
    if (c === "all") params.delete("category");
    else params.set("category", c);
    setParams(params, { replace: true });
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-4xl text-plum">Shop all</h1>
      <p className="mt-2 text-plum/60">{results.length} pieces</p>

      {/* Controls */}
      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <FilterChip active={category === "all"} onClick={() => setCategory("all")}>
            All
          </FilterChip>
          {categories.map((c) => (
            <FilterChip key={c.id} active={category === c.id} onClick={() => setCategory(c.id)}>
              {c.label}
            </FilterChip>
          ))}
        </div>

        <div className="flex gap-3">
          <label className="sr-only" htmlFor="search">Search products</label>
          <input
            id="search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search…"
            className="rounded-full border border-plum/20 bg-white px-4 py-2 text-sm focus:border-brass"
          />
          <label className="sr-only" htmlFor="sort">Sort products</label>
          <select
            id="sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as Filters["sort"])}
            className="rounded-full border border-plum/20 bg-white px-4 py-2 text-sm focus:border-brass"
          >
            <option value="featured">Featured</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
            <option value="rating">Top rated</option>
          </select>
        </div>
      </div>

      <div className="mt-8">
        <ProductList products={results} />
      </div>
    </div>
  );
}

function FilterChip({
  active, onClick, children,
}: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
        active ? "bg-plum text-ivory" : "bg-white text-plum border border-plum/15 hover:border-brass"
      }`}
    >
      {children}
    </button>
  );
}
