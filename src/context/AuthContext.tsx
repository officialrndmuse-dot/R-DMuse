import {
  createContext, useContext, useEffect, useMemo, useRef, useState,
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
  const claimedRef = useRef(false);

  useEffect(() => {
    if (!firebaseAuth) {
      setStatus("signedOut");
      return;
    }
    const unsubscribe = onAuthStateChanged(firebaseAuth, (u) => {
      setUser(u);
      setStatus(u ? "signedIn" : "signedOut");

      // Idempotent server-side call to attach any prior guest orders placed
      // with the same phone number — safe to call more than once.
      if (u && !claimedRef.current) {
        claimedRef.current = true;
        u.getIdToken().then((idToken) => {
          fetch("/api/account/claim-orders", {
            method: "POST",
            headers: { Authorization: `Bearer ${idToken}` },
          }).catch(() => {});
        });
      }
      if (!u) claimedRef.current = false;
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
