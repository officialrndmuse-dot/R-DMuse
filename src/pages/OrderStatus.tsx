import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { inr } from "../lib/format";
import { STATUS_LABEL } from "../lib/orderStatus";

interface TrackedOrder {
  id: string;
  orderNumber: string;
  createdAt: string;
  items: { name: string; price: number; qty: number }[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  paymentMethod: "razorpay" | "cod";
  paymentStatus: string;
  status: string;
  awbCode?: string;
  courierName?: string;
}

export function OrderStatus() {
  const { id } = useParams();
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    fetch(`/api/track-order?orderId=${encodeURIComponent(id)}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Order not found");
        setOrder(data);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Order not found"));
  }, [id]);

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="text-3xl text-plum">{error}</h1>
        <Link to="/shop" className="mt-4 inline-block text-brass hover:underline">Back to shop →</Link>
      </div>
    );
  }

  if (!order) {
    return <div className="mx-auto max-w-2xl px-4 py-24 text-center text-plum/60">Loading order…</div>;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <p className="text-5xl">🪔</p>
      <h1 className="mt-4 text-4xl text-plum">Order placed!</h1>
      <p className="mt-3 text-plum/60">
        Order <span className="font-mono">ORD-{order.orderNumber}</span> —{" "}
        {STATUS_LABEL[order.status] ?? order.status}
      </p>
      {order.paymentMethod === "cod" && (
        <p className="mt-1 text-sm text-plum/60">Pay {inr(order.total)} on delivery.</p>
      )}
      {order.awbCode && (
        <p className="mt-1 text-sm text-plum/60">
          Tracking AWB: <span className="font-mono">{order.awbCode}</span>
          {order.courierName && ` via ${order.courierName}`}
        </p>
      )}

      <div className="mx-auto mt-8 max-w-md rounded-xl2 bg-white p-6 text-left shadow-soft">
        <ul className="space-y-2 text-sm text-plum/70">
          {order.items.map((item, i) => (
            <li key={i} className="flex justify-between">
              <span>{item.name} × {item.qty}</span>
              <span>{inr(item.price * item.qty)}</span>
            </li>
          ))}
        </ul>
        <div className="my-3 h-px bg-plum/10" />
        <div className="flex justify-between font-semibold">
          <span>Total</span><span>{inr(order.total)}</span>
        </div>
      </div>

      <Link
        to="/shop"
        className="mt-8 inline-block rounded-full bg-plum px-8 py-3 text-sm font-semibold text-ivory hover:bg-berry"
      >
        Keep shopping
      </Link>
    </div>
  );
}
