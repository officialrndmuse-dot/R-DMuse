import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { inr } from "../lib/format";
import type { ChangeEvent, ChangeEventHandler } from "react";

// Mock checkout — no real payment. Collects details, "places" the order,
// clears the cart, and shows a confirmation. Swap handleSubmit for a real
// payment gateway (Razorpay/Stripe) later.
export function Checkout() {
  const { items, subtotal, clear } = useCart();
  const navigate = useNavigate();
  const [placed, setPlaced] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", address: "", city: "", pincode: "" });

  if (items.length === 0 && !placed) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-3xl text-plum">Nothing to check out</h1>
        <Link to="/shop" className="mt-4 inline-block text-brass hover:underline">Back to shop →</Link>
      </div>
    );
  }

  const update = (k: keyof typeof form) => (e: ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const handleSubmit = () => {
    // Pretend we posted the order to an API here.
    clear();
    setPlaced(true);
    window.scrollTo(0, 0);
  };

  if (placed) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <p className="text-5xl">🪔</p>
        <h1 className="mt-4 text-4xl text-plum">Order placed!</h1>
        <p className="mt-3 text-plum/60">
          Thank you, {form.name || "friend"}. This is a demo checkout — no payment was taken.
        </p>
        <button
          onClick={() => navigate("/shop")}
          className="mt-6 rounded-full bg-plum px-8 py-3 text-sm font-semibold text-ivory hover:bg-berry"
        >
          Keep shopping
        </button>
      </div>
    );
  }

  const valid = form.name && form.email && form.address && form.pincode;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-4xl text-plum">Checkout</h1>
      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <Field label="Full name" value={form.name} onChange={update("name")} />
          <Field label="Email" type="email" value={form.email} onChange={update("email")} />
          <Field label="Address" value={form.address} onChange={update("address")} />
          <div className="grid grid-cols-2 gap-4">
            <Field label="City" value={form.city} onChange={update("city")} />
            <Field label="Pincode" value={form.pincode} onChange={update("pincode")} />
          </div>
          <button
            onClick={handleSubmit}
            disabled={!valid}
            className="mt-2 w-full rounded-full bg-plum py-3 text-sm font-semibold text-ivory hover:bg-berry disabled:opacity-40"
          >
            Place order (demo)
          </button>
          <p className="text-center text-xs text-plum/40">
            Demo only — connect Razorpay or Stripe to take real payments.
          </p>
        </div>

        <aside className="h-fit rounded-xl2 bg-white p-6 shadow-soft">
          <h2 className="text-xl text-plum">In your bag</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {items.map(({ product, qty }) => (
              <li key={product.id} className="flex justify-between text-plum/70">
                <span>{product.name} × {qty}</span>
                <span>{inr(product.price * qty)}</span>
              </li>
            ))}
          </ul>
          <div className="my-3 h-px bg-plum/10" />
          <div className="flex justify-between font-semibold">
            <span>Subtotal</span><span>{inr(subtotal)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Field({
  label, value, onChange, type = "text",
}: { label: string; value: string; onChange: ChangeEventHandler<HTMLInputElement>; type?: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-plum">{label}</span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-plum/20 bg-white px-4 py-2.5 text-sm focus:border-brass"
      />
    </label>
  );
}
