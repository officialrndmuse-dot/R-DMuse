import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authedFetch } from "../lib/api";
import { AdminLayout } from "../components/AdminLayout";
import { inr } from "../lib/format";
import type { Product } from "../types";

export function Products() {
  const { getIdToken } = useAuth();
  const [products, setProducts] = useState<Product[] | null>(null);

  const load = async () => {
    const idToken = await getIdToken();
    const res = await authedFetch("/api/admin?resource=products", idToken);
    if (res.ok) setProducts(await res.json());
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const remove = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This can't be undone.`)) return;
    const idToken = await getIdToken();
    await authedFetch(`/api/admin?resource=product&id=${id}`, idToken, { method: "DELETE" });
    load();
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl text-plum">Products</h1>
        <Link
          to="/products/new"
          className="rounded-full bg-plum px-5 py-2 text-sm font-semibold text-ivory hover:bg-berry"
        >
          + Add product
        </Link>
      </div>

      {products === null ? (
        <p className="mt-6 text-sm text-plum/50">Loading…</p>
      ) : products.length === 0 ? (
        <p className="mt-6 text-sm text-plum/50">No products yet.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl2 bg-white shadow-soft">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-plum/10 text-plum/50">
                <th className="p-4 font-medium">Product</th>
                <th className="p-4 font-medium">Category</th>
                <th className="p-4 font-medium">Stock</th>
                <th className="p-4 font-medium">Price</th>
                <th className="p-4 font-medium">MRP</th>
                <th className="p-4 font-medium">Discount</th>
                <th className="p-4 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const discount = p.mrp && p.mrp > p.price
                  ? Math.round(((p.mrp - p.price) / p.mrp) * 100)
                  : 0;
                return (
                  <tr key={p.id} className="border-b border-plum/5 last:border-0">
                    <td className="p-4">
                      <Link to={`/products/${p.id}`} className="flex items-center gap-3">
                        <img src={p.image} alt={p.name} className="h-10 w-10 rounded-lg object-cover" />
                        <span className="font-medium text-plum hover:underline">{p.name}</span>
                      </Link>
                    </td>
                    <td className="p-4 text-plum/70 capitalize">{p.category}</td>
                    <td className="p-4 text-plum/70">
                      {p.stock <= 0 ? <span className="text-red-600">Sold out</span> : p.stock}
                    </td>
                    <td className="p-4 font-semibold text-ink">{inr(p.price)}</td>
                    <td className="p-4 text-plum/50">{p.mrp ? inr(p.mrp) : "—"}</td>
                    <td className="p-4 text-plum/70">{discount > 0 ? `${discount}%` : "—"}</td>
                    <td className="p-4 text-right">
                      <Link to={`/products/${p.id}`} className="mr-3 text-brass hover:underline">Edit</Link>
                      <button
                        type="button"
                        onClick={() => remove(p.id, p.name)}
                        className="text-red-500 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
