import {
  createContext, useContext, useEffect, useMemo, useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { firebaseAuth } from "../lib/firebaseClient";

type AuthStatus = "loading" | "signedOut" | "signedIn";

interface AuthValue {
  user: User | null;
  status: AuthStatus;
  getIdToken: () => Promise<string | null>;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  useEffect(() => {
    if (!firebaseAuth) {
      setStatus("signedOut");
      return;
    }
    // Attaching prior guest orders (by phone match) happens server-side as
    // a side effect of GET /api/account/profile, which AccountLayout calls
    // on every account page mount — no separate call needed here.
    const unsubscribe = onAuthStateChanged(firebaseAuth, (u) => {
      setUser(u);
      setStatus(u ? "signedIn" : "signedOut");
    });
    return unsubscribe;
  }, []);

  const value = useMemo<AuthValue>(
    () => ({
      user,
      status,
      getIdToken: () => (user ? user.getIdToken() : Promise.resolve(null)),
      signOutUser: () => (firebaseAuth ? signOut(firebaseAuth) : Promise.resolve()),
    }),
    [user, status]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
