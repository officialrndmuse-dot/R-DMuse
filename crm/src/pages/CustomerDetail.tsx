import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authedFetch } from "../lib/api";
import { AdminLayout } from "../components/AdminLayout";
import { STATUS_LABEL } from "../lib/orderStatus";
import { inr } from "../lib/format";
import { STOREFRONT_URL } from "../lib/config";
import type { Profile, Order, Address } from "../types";

interface CustomerDetailResponse {
  profile: Profile;
  orders: Order[];
  addresses: Address[];
}

export function CustomerDetail() {
  const { id } = useParams();
  const { getIdToken } = useAuth();
  const [data, setData] = useState<CustomerDetailResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    getIdToken().then(async (idToken) => {
      const res = await authedFetch(`/api/admin?resource=customer&id=${id}`, idToken);
      if (res.ok) setData(await res.json());
      else setError("Customer not found");
    });
  }, [id, getIdToken]);

  return (
    <AdminLayout>
      <Link to="/customers" className="text-sm text-plum/60 hover:text-plum">← Customers</Link>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {data && (
        <>
          <div className="mt-4 rounded-xl2 bg-white p-6 shadow-soft">
            <p className="text-xl font-semibold text-plum">{data.profile.name || "Unnamed customer"}</p>
            <p className="text-sm text-plum/60">{data.profile.phone} {data.profile.email && `· ${data.profile.email}`}</p>
            <p className="mt-1 text-xs text-plum/40">
              Joined {new Date(data.profile.createdAt).toLocaleDateString("en-IN")}
            </p>
          </div>

          <div className="mt-8">
            <h2 className="font-semibold text-plum">Orders ({data.orders.length})</h2>
            {data.orders.length === 0 ? (
              <p className="mt-2 text-sm text-plum/50">No orders yet.</p>
            ) : (
              <ul className="mt-3 divide-y divide-plum/10 rounded-xl2 bg-white shadow-soft">
                {data.orders.map((o) => (
                  <li key={o.id} className="flex items-center justify-between p-4">
                    <div>
                      <a
                        href={`${STOREFRONT_URL}/order/${o.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-sm text-plum hover:underline"
                      >
                        ORD-{o.orderNumber}
                      </a>
                      <p className="text-xs text-plum/50">{new Date(o.createdAt).toLocaleDateString("en-IN")}</p>
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

          <div className="mt-8">
            <h2 className="font-semibold text-plum">Saved addresses ({data.addresses.length})</h2>
            {data.addresses.length === 0 ? (
              <p className="mt-2 text-sm text-plum/50">No saved addresses.</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {data.addresses.map((a) => (
                  <li key={a.id} className="rounded-xl2 bg-white p-4 shadow-soft">
                    <p className="text-sm text-plum">{a.name} · {a.phone}</p>
                    <p className="text-sm text-plum/60">{a.address}, {a.city}, {a.state} {a.pincode}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </AdminLayout>
  );
}
