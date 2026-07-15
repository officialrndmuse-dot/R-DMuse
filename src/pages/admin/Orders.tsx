import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { authedFetch } from "../../lib/api";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { STATUS_LABEL } from "../../lib/orderStatus";
import { inr } from "../../lib/format";

interface AdminOrder {
  id: string;
  createdAt: string;
  address: { name: string; phone: string; email: string };
  items: { name: string; qty: number }[];
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
}

export function AdminOrders() {
  const { getIdToken } = useAuth();
  const [orders, setOrders] = useState<AdminOrder[] | null>(null);

  useEffect(() => {
    getIdToken().then(async (idToken) => {
      const res = await authedFetch("/api/admin?resource=orders", idToken);
      if (res.ok) setOrders(await res.json());
    });
  }, [getIdToken]);

  return (
    <AdminLayout>
      <h1 className="text-2xl text-plum">Orders</h1>

      {orders === null ? (
        <p className="mt-6 text-sm text-plum/50">Loading…</p>
      ) : orders.length === 0 ? (
        <p className="mt-6 text-sm text-plum/50">No orders yet.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl2 bg-white shadow-soft">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-plum/10 text-plum/50">
                <th className="p-4 font-medium">Order</th>
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">Items</th>
                <th className="p-4 font-medium">Total</th>
                <th className="p-4 font-medium">Payment</th>
                <th className="p-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-plum/5 last:border-0">
                  <td className="p-4">
                    <Link to={`/order/${o.id}`} className="font-mono text-plum hover:underline">
                      {o.id.slice(0, 8)}
                    </Link>
                    <p className="text-xs text-plum/40">{new Date(o.createdAt).toLocaleDateString("en-IN")}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-plum">{o.address.name}</p>
                    <p className="text-xs text-plum/50">{o.address.phone}</p>
                  </td>
                  <td className="p-4 text-plum/70">
                    {o.items.map((i) => `${i.name} × ${i.qty}`).join(", ")}
                  </td>
                  <td className="p-4 font-semibold text-ink">{inr(o.total)}</td>
                  <td className="p-4 text-plum/70">
                    {o.paymentMethod === "cod" ? "COD" : "Razorpay"} · {o.paymentStatus}
                  </td>
                  <td className="p-4 text-plum/70">{STATUS_LABEL[o.status] ?? o.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
