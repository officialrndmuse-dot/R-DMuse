import { useEffect, useState, type ReactNode } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authedFetch } from "../lib/api";
import { AdminLayout } from "../components/AdminLayout";
import type { Category, Product } from "../types";

const CATEGORIES: { id: Category; label: string }[] = [
  { id: "bags", label: "Bags" },
  { id: "earrings", label: "Earrings" },
  { id: "festive", label: "Festive & Navratri" },
  { id: "hair", label: "Hair" },
  { id: "bangles", label: "Bangles" },
];

interface FormState {
  name: string;
  category: Category;
  price: string;
  mrp: string;
  stock: string;
  image: string;
  description: string;
  tags: string;
  sku: string;
  weightKg: string;
  lengthCm: string;
  breadthCm: string;
  heightCm: string;
}

const EMPTY: FormState = {
  name: "",
  category: "bags",
  price: "",
  mrp: "",
  stock: "",
  image: "",
  description: "",
  tags: "",
  sku: "",
  weightKg: "0.2",
  lengthCm: "15",
  breadthCm: "10",
  heightCm: "5",
};

function productToForm(p: Product): FormState {
  return {
    name: p.name,
    category: p.category,
    price: String(p.price),
    mrp: p.mrp !== undefined ? String(p.mrp) : "",
    stock: String(p.stock),
    image: p.image,
    description: p.description,
    tags: p.tags.join(", "),
    sku: p.sku ?? "",
    weightKg: String(p.weightKg),
    lengthCm: String(p.lengthCm),
    breadthCm: String(p.breadthCm),
    heightCm: String(p.heightCm),
  };
}

export function ProductForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { getIdToken } = useAuth();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    getIdToken().then(async (idToken) => {
      const res = await authedFetch(`/api/admin?resource=product&id=${id}`, idToken);
      if (res.ok) setForm(productToForm(await res.json()));
      else setError("Product not found");
      setLoading(false);
    });
  }, [id, getIdToken]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = async () => {
    setError("");
    const payload = {
      name: form.name.trim(),
      category: form.category,
      price: Number(form.price),
      mrp: form.mrp.trim() ? Number(form.mrp) : null,
      stock: Number(form.stock),
      image: form.image.trim(),
      description: form.description,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      sku: form.sku.trim() || null,
      weightKg: Number(form.weightKg),
      lengthCm: Number(form.lengthCm),
      breadthCm: Number(form.breadthCm),
      heightCm: Number(form.heightCm),
    };
    if (!payload.name || !payload.image || !Number.isFinite(payload.price) || !Number.isFinite(payload.stock)) {
      setError("Name, image URL, price and stock are required.");
      return;
    }
    setSaving(true);
    try {
      const idToken = await getIdToken();
      const res = isEdit
        ? await authedFetch(`/api/admin?resource=product&id=${id}`, idToken, {
            method: "PUT",
            body: JSON.stringify(payload),
          })
        : await authedFetch("/api/admin?resource=products", idToken, {
            method: "POST",
            body: JSON.stringify(payload),
          });
      if (!res.ok) throw new Error("Save failed");
      navigate("/products");
    } catch {
      setError("Couldn't save product — check the fields and try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <p className="text-sm text-plum/50">Loading…</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Link to="/products" className="text-sm text-plum/60 hover:text-plum">← Products</Link>
      <h1 className="mt-2 text-2xl text-plum">{isEdit ? "Edit product" : "Add product"}</h1>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="mt-6 max-w-2xl space-y-6">
        <div className="rounded-xl2 bg-white p-6 shadow-soft">
          <h2 className="font-semibold text-plum">Details</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Name" span2>
              <input value={form.name} onChange={(e) => set("name", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Category">
              <select value={form.category} onChange={(e) => set("category", e.target.value as Category)} className={inputCls}>
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </Field>
            <Field label="SKU (optional)">
              <input value={form.sku} onChange={(e) => set("sku", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Sale price (₹)">
              <input type="number" value={form.price} onChange={(e) => set("price", e.target.value)} className={inputCls} />
            </Field>
            <Field label="MRP (₹, optional)">
              <input type="number" value={form.mrp} onChange={(e) => set("mrp", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Stock">
              <input type="number" value={form.stock} onChange={(e) => set("stock", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Image URL" span2>
              <input value={form.image} onChange={(e) => set("image", e.target.value)} className={inputCls} placeholder="https://…" />
            </Field>
            <Field label="Tags (comma-separated)" span2>
              <input value={form.tags} onChange={(e) => set("tags", e.target.value)} className={inputCls} placeholder="festive, navratri, jhumka" />
            </Field>
            <Field label="Description" span2>
              <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={4} className={inputCls} />
            </Field>
          </div>
        </div>

        <div className="rounded-xl2 border-2 border-brass/40 bg-white p-6 shadow-soft">
          <h2 className="font-semibold text-plum">Shipping details (for Shiprocket)</h2>
          <p className="mt-1 text-xs text-plum/50">
            Required for accurate shipping-rate calculation at checkout. Overwrite the defaults with this product's real measurements.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-4">
            <Field label="Weight (kg)">
              <input type="number" step="0.01" value={form.weightKg} onChange={(e) => set("weightKg", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Length (cm)">
              <input type="number" value={form.lengthCm} onChange={(e) => set("lengthCm", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Breadth (cm)">
              <input type="number" value={form.breadthCm} onChange={(e) => set("breadthCm", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Height (cm)">
              <input type="number" value={form.heightCm} onChange={(e) => set("heightCm", e.target.value)} className={inputCls} />
            </Field>
          </div>
        </div>

        <button
          type="button"
          onClick={submit}
          disabled={saving}
          className="rounded-full bg-plum px-8 py-3 text-sm font-semibold text-ivory hover:bg-berry disabled:opacity-40"
        >
          {saving ? "Saving…" : isEdit ? "Save changes" : "Create product"}
        </button>
      </div>
    </AdminLayout>
  );
}

const inputCls =
  "w-full rounded-xl border border-plum/20 bg-white px-4 py-2.5 text-sm outline-none focus:border-brass";

function Field({ label, span2, children }: { label: string; span2?: boolean; children: ReactNode }) {
  return (
    <label className={`block ${span2 ? "sm:col-span-2" : ""}`}>
      <span className="mb-1 block text-sm font-medium text-plum">{label}</span>
      {children}
    </label>
  );
}
