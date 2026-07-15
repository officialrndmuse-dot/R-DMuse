import {
  createContext, useContext, useEffect, useMemo, useState,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabaseClient";

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
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) {
      setStatus("signedOut");
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setAccessToken(data.session?.access_token ?? null);
      setStatus(data.session?.user ? "signedIn" : "signedOut");
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAccessToken(session?.access_token ?? null);
      setStatus(session?.user ? "signedIn" : "signedOut");
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const value = useMemo<AuthValue>(
    () => ({
      user,
      status,
      getIdToken: () => Promise.resolve(accessToken),
      signOutUser: () => (supabase ? supabase.auth.signOut().then(() => {}) : Promise.resolve()),
    }),
    [user, status, accessToken]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
