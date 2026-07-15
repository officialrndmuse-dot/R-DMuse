import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { authedFetch } from "../../lib/api";
import { AccountLayout } from "../../components/account/AccountLayout";
import type { ReturnRequest } from "../../types";

interface OrderSummary {
  id: string;
  orderNumber: string;
  status: string;
  items: { productId: string; name: string; qty: number }[];
}

interface ReturnWithOrderNumber extends ReturnRequest {
  orderNumber: string;
}

const RETURN_STATUS_LABEL: Record<string, string> = {
  requested: "Requested",
  approved: "Approved",
  rejected: "Rejected",
  completed: "Completed",
};

export function Returns() {
  const { getIdToken } = useAuth();
  const [returns, setReturns] = useState<ReturnWithOrderNumber[] | null>(null);
  const [deliveredOrders, setDeliveredOrders] = useState<OrderSummary[]>([]);
  const [orderId, setOrderId] = useState("");
  const [itemIds, setItemIds] = useState<string[]>([]);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    const idToken = await getIdToken();
    const [returnsRes, ordersRes] = await Promise.all([
      authedFetch("/api/account/returns", idToken),
      authedFetch("/api/account/orders", idToken),
    ]);
    if (returnsRes.ok) setReturns(await returnsRes.json());
    if (ordersRes.ok) {
      const orders: OrderSummary[] = await ordersRes.json();
      setDeliveredOrders(orders.filter((o) => o.status === "delivered"));
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedOrder = deliveredOrders.find((o) => o.id === orderId);

  const toggleItem = (productId: string) => {
    setItemIds((prev) => (prev.includes(productId) ? prev.filter((i) => i !== productId) : [...prev, productId]));
  };

  const submit = async () => {
    setError("");
    if (!orderId || !reason.trim()) {
      setError("Select an order and describe the reason");
      return;
    }
    setBusy(true);
    const idToken = await getIdToken();
    const res = await authedFetch("/api/account/returns", idToken, {
      method: "POST",
      body: JSON.stringify({ orderId, reason, itemIds: itemIds.length ? itemIds : undefined }),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Failed to submit return");
      return;
    }
    setOrderId("");
    setItemIds([]);
    setReason("");
    load();
  };

  return (
    <AccountLayout>
      <h1 className="text-2xl text-plum">Returns</h1>

      <div className="mt-6 rounded-xl2 bg-white p-6 shadow-soft">
        <h2 className="font-semibold text-plum">Request a return</h2>
        {deliveredOrders.length === 0 ? (
          <p className="mt-2 text-sm text-plum/50">You have no delivered orders eligible for return.</p>
        ) : (
          <div className="mt-4 space-y-4">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-plum">Order</span>
              <select
                value={orderId}
                onChange={(e) => { setOrderId(e.target.value); setItemIds([]); }}
                className="w-full rounded-xl border border-plum/20 bg-white px-4 py-2.5 text-sm outline-none focus:border-brass"
              >
                <option value="">Select an order…</option>
                {deliveredOrders.map((o) => (
                  <option key={o.id} value={o.id}>ORD-{o.orderNumber}</option>
                ))}
              </select>
            </label>

            {selectedOrder && (
              <div>
                <span className="mb-1 block text-sm font-medium text-plum">Items (leave blank for whole order)</span>
                <div className="space-y-1">
                  {selectedOrder.items.map((i) => (
                    <label key={i.productId} className="flex items-center gap-2 text-sm text-plum/70">
                      <input type="checkbox" checked={itemIds.includes(i.productId)} onChange={() => toggleItem(i.productId)} />
                      {i.name} × {i.qty}
                    </label>
                  ))}
                </div>
              </div>
            )}

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-plum">Reason</span>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-plum/20 bg-white px-4 py-2.5 text-sm outline-none focus:border-brass"
              />
            </label>

            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              onClick={submit}
              disabled={busy}
              className="rounded-full bg-plum px-6 py-2.5 text-sm font-semibold text-ivory hover:bg-berry disabled:opacity-40"
            >
              {busy ? "Submitting…" : "Submit return"}
            </button>
          </div>
        )}
      </div>

      <div className="mt-8">
        <h2 className="font-semibold text-plum">Your returns</h2>
        {returns === null ? (
          <p className="mt-2 text-sm text-plum/50">Loading…</p>
        ) : returns.length === 0 ? (
          <p className="mt-2 text-sm text-plum/50">No return requests yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-plum/10 rounded-xl2 bg-white shadow-soft">
            {returns.map((r) => (
              <li key={r.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm text-plum">Order ORD-{r.orderNumber}</p>
                  <p className="text-xs text-plum/50">{r.reason}</p>
                </div>
                <span className="rounded-full bg-blush/30 px-3 py-1 text-xs text-plum">
                  {RETURN_STATUS_LABEL[r.status] ?? r.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AccountLayout>
  );
}
