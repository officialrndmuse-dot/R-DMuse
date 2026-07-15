import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { authedFetch } from "../../lib/api";
import { AccountLayout } from "../../components/account/AccountLayout";

export function EditProfile() {
  const { getIdToken } = useAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");

  useEffect(() => {
    getIdToken().then(async (idToken) => {
      const res = await authedFetch("/api/account/profile", idToken);
      if (res.ok) {
        const data = await res.json();
        setName(data.name ?? "");
        setPhone(data.phone ?? "");
      }
    });
  }, [getIdToken]);

  const save = async () => {
    setStatus("saving");
    const idToken = await getIdToken();
    const res = await authedFetch("/api/account/profile", idToken, {
      method: "PUT",
      body: JSON.stringify({ name }),
    });
    setStatus(res.ok ? "saved" : "idle");
  };

  return (
    <AccountLayout>
      <h1 className="text-2xl text-plum">Edit Profile</h1>
      <div className="mt-6 max-w-md space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-plum">Name</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-plum/20 bg-white px-4 py-2.5 text-sm outline-none focus:border-brass"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-plum">Mobile number</span>
          <input
            type="text"
            value={phone}
            disabled
            className="w-full rounded-xl border border-plum/10 bg-plum/5 px-4 py-2.5 text-sm text-plum/50"
          />
          <span className="mt-1 block text-xs text-plum/40">Contact support to change your login number.</span>
        </label>
        <button
          onClick={save}
          disabled={status === "saving" || !name.trim()}
          className="rounded-full bg-plum px-6 py-2.5 text-sm font-semibold text-ivory hover:bg-berry disabled:opacity-40"
        >
          {status === "saving" ? "Saving…" : status === "saved" ? "Saved ✓" : "Save changes"}
        </button>
      </div>
    </AccountLayout>
  );
}
