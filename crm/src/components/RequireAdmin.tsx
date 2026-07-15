import { useEffect, useState, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { status, getIdToken } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    if (status !== "signedIn") {
      setIsAdmin(null);
      return;
    }
    let cancelled = false;
    getIdToken().then(async (idToken) => {
      const res = await fetch("/api/admin?resource=whoami", { headers: { Authorization: `Bearer ${idToken}` } });
      const data = await res.json().catch(() => ({ isAdmin: false }));
      if (!cancelled) setIsAdmin(res.ok && data.isAdmin === true);
    });
    return () => {
      cancelled = true;
    };
  }, [status, getIdToken]);

  if (status === "loading" || (status === "signedIn" && isAdmin === null)) {
    return <div className="mx-auto max-w-3xl px-4 py-24 text-center text-plum/60">Loading…</div>;
  }
  if (status === "signedOut" || isAdmin === false) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}
