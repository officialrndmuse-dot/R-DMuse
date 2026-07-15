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
  items: { name: string; qty: number }[];
}

const quickActions = [
  { to: "/account/orders", label: "Track Order", hint: "Check delivery status" },
  { to: "/account/wishlist", label: "Wishlist", hint: "View saved items" },
  { to: "/account/support", label: "Support", hint: "Get help anytime" },
  { to: "/account/returns", label: "Returns", hint: "Easy returns" },
];

export function Overview() {
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
      <h2 className="text-lg font-semibold text-plum">Quick Actions</h2>
      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {quickActions.map((a) => (
          <Link
            key={a.to}
            to={a.to}
            className="rounded-xl2 bg-white p-5 text-center shadow-soft transition-shadow hover:shadow-md"
          >
            <p className="font-medium text-plum">{a.label}</p>
            <p className="mt-1 text-xs text-plum/50">{a.hint}</p>
          </Link>
        ))}
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-plum">Recent Orders</h2>
          <Link to="/account/orders" className="text-sm text-brass hover:underline">View all →</Link>
        </div>

        {orders === null ? (
          <p className="mt-4 text-sm text-plum/50">Loading…</p>
        ) : orders.length === 0 ? (
          <p className="mt-4 text-sm text-plum/50">No orders yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-plum/10 rounded-xl2 bg-white shadow-soft">
            {orders.slice(0, 5).map((o) => (
              <li key={o.id} className="flex items-center justify-between p-4">
                <div>
                  <Link to={`/order/${o.id}`} className="font-mono text-sm text-plum hover:underline">
                    {o.id.slice(0, 8)}
                  </Link>
                  <p className="text-xs text-plum/50">
                    {new Date(o.createdAt).toLocaleDateString("en-IN")} · {o.items.length} item(s)
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
      </div>
    </AccountLayout>
  );
}
