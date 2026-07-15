import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const location = useLocation();

  if (status === "loading") {
    return <div className="mx-auto max-w-3xl px-4 py-24 text-center text-plum/60">Loading…</div>;
  }
  if (status === "signedOut") {
    return <Navigate to="/account/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}
