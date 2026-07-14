import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { inr } from "../lib/format";
import { computeOrderTotals } from "../lib/pricing";
import { useRazorpayScript } from "../hooks/useRazorpayScript";
import type { ChangeEvent, ChangeEventHandler } from "react";
import type { PaymentMethod } from "../types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[6-9]\d{9}$/;
const PINCODE_RE = /^\d{6}$/;

type Status = "idle" | "submitting" | "awaiting-payment" | "error";

export function Checkout() {
  const { items, subtotal, clear } = useCart();
  const navigate = useNavigate();
  const razorpayReady = useRazorpayScript();
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [form, setForm] = useState({
    name: "", email: "", phone: "", address: "", city: "", state: "", pincode: "",
  });

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-3xl text-plum">Nothing to check out</h1>
        <Link to="/shop" className="mt-4 inline-block text-brass hover:underline">Back to shop →</Link>
      </div>
    );
  }

  const update = (k: keyof typeof form) => (e: ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const valid =
    form.name.trim() &&
    EMAIL_RE.test(form.email) &&
    PHONE_RE.test(form.phone) &&
    form.address.trim() &&
    form.city.trim() &&
    form.state.trim() &&
    PINCODE_RE.test(form.pincode);

  const handleSubmit = async () => {
    setStatus("submitting");
    setErrorMsg("");
    try {
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: form,
          items: items.map(({ product, qty }) => ({ productId: product.id, qty })),
          paymentMethod,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create order");

      if (!data.paymentRequired) {
        clear();
        navigate(`/order/${data.orderId}`);
        return;
      }

      if (!razorpayReady) throw new Error("Payment gateway is still loading — please try again");

      setStatus("awaiting-payment");
      const rzp = new window.Razorpay({
        key: data.razorpay.keyId,
        amount: data.razorpay.amount,
        currency: data.razorpay.currency,
        order_id: data.razorpay.orderId,
        name: "RnD Muse",
        prefill: { name: form.name, email: form.email, contact: form.phone },
        handler: async (response) => {
          try {
            const verifyRes = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderId: data.orderId, ...response }),
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) throw new Error(verifyData.error || "Payment verification failed");
            clear();
            navigate(`/order/${data.orderId}`);
          } catch (err) {
            setStatus("error");
            setErrorMsg(err instanceof Error ? err.message : "Payment verification failed");
          }
        },
        modal: { ondismiss: () => setStatus("idle") },
      });
      rzp.open();
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  const { shipping, tax, total } = computeOrderTotals(subtotal);
  const busy = status === "submitting" || status === "awaiting-payment";

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-4xl text-plum">Checkout</h1>
      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <Field label="Full name" value={form.name} onChange={update("name")} />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Email" type="email" value={form.email} onChange={update("email")} />
            <Field label="Phone" type="tel" value={form.phone} onChange={update("phone")} />
          </div>
          <Field label="Address" value={form.address} onChange={update("address")} />
          <div className="grid grid-cols-3 gap-4">
            <Field label="City" value={form.city} onChange={update("city")} />
            <Field label="State" value={form.state} onChange={update("state")} />
            <Field label="Pincode" value={form.pincode} onChange={update("pincode")} />
          </div>

          <fieldset className="rounded-xl border border-plum/20 p-4">
            <legend className="px-1 text-sm font-medium text-plum">Payment method</legend>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                />
                Cash on Delivery
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  checked={paymentMethod === "razorpay"}
                  onChange={() => setPaymentMethod("razorpay")}
                />
                Pay online
              </label>
            </div>
          </fieldset>

          {status === "error" && (
            <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{errorMsg}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={!valid || busy}
            className="mt-2 w-full rounded-full bg-plum py-3 text-sm font-semibold text-ivory hover:bg-berry disabled:opacity-40"
          >
            {busy ? "Processing…" : paymentMethod === "cod" ? "Place order" : "Pay & place order"}
          </button>
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
          <dl className="space-y-2 text-sm text-plum/70">
            <div className="flex justify-between"><dt>Subtotal</dt><dd>{inr(subtotal)}</dd></div>
            <div className="flex justify-between"><dt>Tax</dt><dd>{inr(tax)}</dd></div>
            <div className="flex justify-between"><dt>Shipping</dt><dd>{shipping === 0 ? "Free" : inr(shipping)}</dd></div>
          </dl>
          <div className="my-3 h-px bg-plum/10" />
          <div className="flex justify-between font-semibold">
            <span>Total</span><span>{inr(total)}</span>
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
