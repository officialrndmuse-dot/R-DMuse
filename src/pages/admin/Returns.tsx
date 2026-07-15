import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { authedFetch } from "../../lib/api";
import type { ReturnRequest, ReturnStatus } from "../../types";

interface AdminReturn extends ReturnRequest {
  orderCustomerName: string;
}

const STATUSES: ReturnStatus[] = ["requested", "approved", "rejected", "completed"];

export function AdminReturns() {
  const { getIdToken, signOutUser } = useAuth();
  const [returns, setReturns] = useState<AdminReturn[] | null>(null);

  const load = async () => {
    const idToken = await getIdToken();
    const res = await authedFetch("/api/admin?resource=returns", idToken);
    if (res.ok) setReturns(await res.json());
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setStatus = async (id: string, status: ReturnStatus) => {
    const idToken = await getIdToken();
    await authedFetch("/api/admin?resource=returns", idToken, { method: "PATCH", body: JSON.stringify({ id, status }) });
    load();
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl text-plum">Return requests</h1>
        <button onClick={() => signOutUser()} className="text-sm text-plum/50 hover:text-plum">Logout</button>
      </div>

      {returns === null ? (
        <p className="mt-6 text-sm text-plum/50">Loading…</p>
      ) : returns.length === 0 ? (
        <p className="mt-6 text-sm text-plum/50">No return requests.</p>
      ) : (
        <ul className="mt-6 divide-y divide-plum/10 rounded-xl2 bg-white shadow-soft">
          {returns.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="text-sm font-medium text-plum">{r.orderCustomerName} · Order {r.orderId.slice(0, 8)}</p>
                <p className="text-xs text-plum/50">{r.reason}</p>
                <p className="text-xs text-plum/40">{new Date(r.requestedAt).toLocaleString("en-IN")}</p>
              </div>
              <select
                value={r.status}
                onChange={(e) => setStatus(r.id, e.target.value as ReturnStatus)}
                className="rounded-xl border border-plum/20 bg-white px-3 py-2 text-sm outline-none focus:border-brass"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
