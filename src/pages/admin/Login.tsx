import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { firebaseAuth } from "../../lib/firebaseClient";

export function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setError("");
    setBusy(true);
    try {
      if (!firebaseAuth) throw new Error("not-configured");
      await signInWithEmailAndPassword(firebaseAuth, email, password);
      navigate("/admin/returns", { replace: true });
    } catch (err) {
      setError(
        err instanceof Error && err.message === "not-configured"
          ? "Sign-in isn't set up yet"
          : "Invalid email or password"
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-24">
      <h1 className="text-center text-3xl text-plum">Admin sign in</h1>
      <div className="mt-8 space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-plum">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-plum/20 bg-white px-4 py-2.5 text-sm outline-none focus:border-brass"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-plum">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-plum/20 bg-white px-4 py-2.5 text-sm outline-none focus:border-brass"
          />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          onClick={submit}
          disabled={busy || !email || !password}
          className="w-full rounded-full bg-plum py-3 text-sm font-semibold text-ivory hover:bg-berry disabled:opacity-40"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </div>
    </div>
  );
}
