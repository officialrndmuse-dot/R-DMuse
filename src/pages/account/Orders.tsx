import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { authedFetch } from "../../lib/api";
import { AccountLayout } from "../../components/account/AccountLayout";
import { STATUS_LABEL } from "../../lib/orderStatus";
import { inr } from "../../lib/format";

interface OrderSummary {
  id: string;
  createdAt: string;
  total: number;
  status: string;
  paymentMethod: string;
  items: { name: string; qty: number }[];
}

export function Orders() {
  const { getIdToken } = useAuth();
  const [orders, setOrders] = useState<OrderSummary[] | null>(null);

  useEffect(() => {
    getIdToken().then(async (idToken) => {
      const res = await authedFetch("/api/account/orders", idToken);
      if (res.ok) setOrders(await res.json());
    });
  }, [getIdToken]);

  return (
    <AccountLayout>
      <h1 className="text-2xl text-plum">My Orders</h1>

      {orders === null ? (
        <p className="mt-6 text-sm text-plum/50">Loading…</p>
      ) : orders.length === 0 ? (
        <div className="mt-6 rounded-xl2 bg-white p-8 text-center shadow-soft">
          <p className="text-plum/60">You haven't placed any orders yet.</p>
          <Link to="/shop" className="mt-3 inline-block text-sm text-brass hover:underline">
            Start shopping →
          </Link>
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-plum/10 rounded-xl2 bg-white shadow-soft">
          {orders.map((o) => (
            <li key={o.id} className="flex flex-wrap items-center justify-between gap-2 p-4">
              <div>
                <Link to={`/order/${o.id}`} className="font-mono text-sm text-plum hover:underline">
                  {o.id.slice(0, 8)}
                </Link>
                <p className="text-xs text-plum/50">
                  {new Date(o.createdAt).toLocaleDateString("en-IN")} ·{" "}
                  {o.items.map((i) => `${i.name} × ${i.qty}`).join(", ")}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-ink">{inr(o.total)}</p>
                <p className="text-xs text-plum/50">{STATUS_LABEL[o.status] ?? o.status}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </AccountLayout>
  );
}
