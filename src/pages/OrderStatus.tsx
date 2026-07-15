import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { inr, formatDate } from "../lib/format";
import { STATUS_LABEL } from "../lib/orderStatus";

interface TrackingEvent {
  date: string;
  status: string;
  activity: string;
  location: string;
}

interface TrackingInfo {
  currentStatus: string;
  edd: string | null;
  trackUrl: string | null;
  events: TrackingEvent[];
}

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
  tracking: TrackingInfo | null;
}

function formatEventTime(raw: string): string {
  const d = new Date(raw.includes("T") ? raw : raw.replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return raw;
  return d.toLocaleString("en-IN", {
    day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit",
  });
}

export function OrderStatus() {
  const { id } = useParams();
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const res = await fetch(`/api/track-order?orderId=${encodeURIComponent(id)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Order not found");
      setOrder(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Order not found");
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const refresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

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

  const headline = order.tracking?.currentStatus || STATUS_LABEL[order.status] || order.status;

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <div className="text-center">
        <p className="text-5xl">🪔</p>
        <h1 className="mt-4 text-4xl text-plum">Order placed!</h1>
        <p className="mt-3 text-plum/60">
          Order <span className="font-mono">ORD-{order.orderNumber}</span> · {formatDate(order.createdAt)}
        </p>
        {order.paymentMethod === "cod" && (
          <p className="mt-1 text-sm text-plum/60">Pay {inr(order.total)} on delivery.</p>
        )}
      </div>

      {/* Tracking card */}
      <div className="mx-auto mt-10 max-w-md rounded-xl2 bg-white p-6 text-left shadow-soft">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wider text-brass">Tracking status</p>
            <h2 className="mt-1 text-xl font-semibold text-plum">{headline}</h2>
          </div>
          <button
            type="button"
            onClick={refresh}
            disabled={refreshing}
            className="shrink-0 rounded-full border border-plum/20 px-3 py-1.5 text-xs font-medium text-plum/70 hover:border-brass disabled:opacity-40"
          >
            {refreshing ? "Refreshing…" : "Refresh"}
          </button>
        </div>

        {order.awbCode ? (
          <div className="mt-3 space-y-1 text-sm text-plum/70">
            <p>
              {order.courierName ? `${order.courierName} · ` : ""}
              AWB <span className="font-mono">{order.awbCode}</span>
            </p>
            {order.tracking?.edd && <p>Estimated delivery: {order.tracking.edd}</p>}
            {order.tracking?.trackUrl && (
              <a
                href={order.tracking.trackUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-brass hover:underline"
              >
                Track on Shiprocket ↗
              </a>
            )}
          </div>
        ) : (
          <p className="mt-3 text-sm text-plum/60">
            We're preparing your order for shipment — tracking details will appear here once it's picked up.
          </p>
        )}

        {order.tracking && order.tracking.events.length > 0 && (
          <ol className="mt-6 space-y-4 border-l-2 border-plum/10 pl-4">
            {[...order.tracking.events].reverse().map((ev, i) => (
              <li key={i} className="relative">
                <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-brass" />
                <p className="text-sm font-medium text-plum">{ev.activity || ev.status}</p>
                <p className="text-xs text-plum/50">
                  {formatEventTime(ev.date)}{ev.location && ` · ${ev.location}`}
                </p>
              </li>
            ))}
          </ol>
        )}

        {order.awbCode && (!order.tracking || order.tracking.events.length === 0) && (
          <p className="mt-4 text-sm text-plum/50">No scan updates yet — check back soon.</p>
        )}
      </div>

      {/* Order summary */}
      <div className="mx-auto mt-6 max-w-md rounded-xl2 bg-white p-6 text-left shadow-soft">
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

      <div className="text-center">
        <Link
          to="/shop"
          className="mt-8 inline-block rounded-full bg-plum px-8 py-3 text-sm font-semibold text-ivory hover:bg-berry"
        >
          Keep shopping
        </Link>
      </div>
    </div>
  );
}
