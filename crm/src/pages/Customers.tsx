import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authedFetch } from "../lib/api";
import { AdminLayout } from "../components/AdminLayout";
import { inr } from "../lib/format";
import type { CustomerSummary } from "../types";

export function Customers() {
  const { getIdToken } = useAuth();
  const [customers, setCustomers] = useState<CustomerSummary[] | null>(null);

  useEffect(() => {
    getIdToken().then(async (idToken) => {
      const res = await authedFetch("/api/admin?resource=customers", idToken);
      if (res.ok) setCustomers(await res.json());
    });
  }, [getIdToken]);

  return (
    <AdminLayout>
      <h1 className="text-2xl text-plum">Customers</h1>

      {customers === null ? (
        <p className="mt-6 text-sm text-plum/50">Loading…</p>
      ) : customers.length === 0 ? (
        <p className="mt-6 text-sm text-plum/50">No registered customers yet.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl2 bg-white shadow-soft">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-plum/10 text-plum/50">
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Contact</th>
                <th className="p-4 font-medium">Orders</th>
                <th className="p-4 font-medium">Total spent</th>
                <th className="p-4 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="border-b border-plum/5 last:border-0">
                  <td className="p-4">
                    <Link to={`/customers/${c.id}`} className="font-medium text-plum hover:underline">
                      {c.name || "—"}
                    </Link>
                  </td>
                  <td className="p-4 text-plum/70">
                    {c.phone && <p>{c.phone}</p>}
                    {c.email && <p className="text-xs text-plum/50">{c.email}</p>}
                  </td>
                  <td className="p-4 text-plum/70">{c.orderCount}</td>
                  <td className="p-4 font-semibold text-ink">{inr(c.totalSpent)}</td>
                  <td className="p-4 text-plum/50">{new Date(c.joinedAt).toLocaleDateString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
