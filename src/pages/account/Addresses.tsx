import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { authedFetch } from "../../lib/api";
import { AccountLayout } from "../../components/account/AccountLayout";
import type { Address } from "../../types";

const EMPTY_FORM = { label: "", name: "", phone: "", address: "", city: "", state: "", pincode: "", isDefault: false };

export function Addresses() {
  const { getIdToken } = useAuth();
  const [addresses, setAddresses] = useState<Address[] | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    const idToken = await getIdToken();
    const res = await authedFetch("/api/account/addresses", idToken);
    if (res.ok) setAddresses(await res.json());
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startEdit = (a: Address) => {
    setForm({
      label: a.label ?? "", name: a.name, phone: a.phone, address: a.address,
      city: a.city, state: a.state, pincode: a.pincode, isDefault: a.isDefault,
    });
    setEditingId(a.id);
    setShowForm(true);
  };

  const startAdd = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
  };

  const save = async () => {
    setError("");
    const idToken = await getIdToken();
    const path = editingId ? `/api/account/addresses?id=${editingId}` : "/api/account/addresses";
    const res = await authedFetch(path, idToken, { method: editingId ? "PUT" : "POST", body: JSON.stringify(form) });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Failed to save address");
      return;
    }
    setShowForm(false);
    load();
  };

  const remove = async (id: string) => {
    const idToken = await getIdToken();
    await authedFetch(`/api/account/addresses?id=${id}`, idToken, { method: "DELETE" });
    load();
  };

  return (
    <AccountLayout>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl text-plum">Addresses</h1>
        <button
          onClick={startAdd}
          className="rounded-full bg-plum px-5 py-2 text-sm font-semibold text-ivory hover:bg-berry"
        >
          Add address
        </button>
      </div>

      {showForm && (
        <div className="mt-6 rounded-xl2 bg-white p-6 shadow-soft">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Label (optional)" value={form.label} onChange={(v) => setForm({ ...form, label: v })} />
            <Field label="Full name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
            <Field label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
            <Field label="Pincode" value={form.pincode} onChange={(v) => setForm({ ...form, pincode: v })} />
            <Field label="City" value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
            <Field label="State" value={form.state} onChange={(v) => setForm({ ...form, state: v })} />
          </div>
          <div className="mt-4">
            <Field label="Address" value={form.address} onChange={(v) => setForm({ ...form, address: v })} />
          </div>
          <label className="mt-3 flex items-center gap-2 text-sm text-plum/70">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
            />
            Set as default
          </label>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          <div className="mt-4 flex gap-3">
            <button onClick={save} className="rounded-full bg-plum px-6 py-2.5 text-sm font-semibold text-ivory hover:bg-berry">
              Save
            </button>
            <button onClick={() => setShowForm(false)} className="text-sm text-plum/50 hover:text-plum">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 space-y-4">
        {addresses === null ? (
          <p className="text-sm text-plum/50">Loading…</p>
        ) : addresses.length === 0 && !showForm ? (
          <p className="text-sm text-plum/50">No saved addresses yet.</p>
        ) : (
          addresses.map((a) => (
            <div key={a.id} className="flex items-start justify-between rounded-xl2 bg-white p-5 shadow-soft">
              <div>
                <p className="font-medium text-plum">
                  {a.label || "Address"} {a.isDefault && <span className="ml-2 rounded-full bg-brass/20 px-2 py-0.5 text-xs text-brassLite">Default</span>}
                </p>
                <p className="mt-1 text-sm text-plum/70">{a.name} · {a.phone}</p>
                <p className="text-sm text-plum/60">{a.address}, {a.city}, {a.state} {a.pincode}</p>
              </div>
              <div className="flex gap-3 text-sm">
                <button onClick={() => startEdit(a)} className="text-brass hover:underline">Edit</button>
                <button onClick={() => remove(a.id)} className="text-plum/50 hover:text-red-600">Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
    </AccountLayout>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-plum">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-plum/20 bg-white px-4 py-2.5 text-sm outline-none focus:border-brass"
      />
    </label>
  );
}
