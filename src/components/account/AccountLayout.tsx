import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "../../context/AuthContext";
import { authedFetch } from "../../lib/api";
import { AccountNav } from "./AccountNav";
import type { Profile } from "../../types";

export function AccountLayout({ children }: { children: ReactNode }) {
  const { user, getIdToken, signOutUser } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    getIdToken().then(async (idToken) => {
      const res = await authedFetch("/api/account/profile", idToken);
      if (res.ok) setProfile(await res.json());
    });
  }, [getIdToken]);

  const contact = profile?.phone || user?.phoneNumber || user?.email || "";
  const initials = (profile?.name || contact || "?").trim().charAt(0).toUpperCase();
  const memberSince = profile
    ? new Date(profile.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })
    : "";

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="overflow-hidden rounded-xl2 bg-plum text-ivory">
        <div className="flex flex-wrap items-center justify-between gap-4 p-6">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-ivory/15 text-2xl font-semibold">
              {initials}
            </div>
            <div>
              <p className="text-xl font-semibold">{profile?.name || "Your account"}</p>
              <p className="text-sm text-ivory/70">{contact}</p>
              <div className="mt-2 flex gap-2">
                <span className="rounded-full bg-brass/20 px-3 py-1 text-xs font-medium text-brassLite">
                  Valued Customer
                </span>
                {memberSince && (
                  <span className="rounded-full bg-ivory/10 px-3 py-1 text-xs font-medium">
                    Since {memberSince}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={() => signOutUser()}
            className="rounded-full border border-ivory/30 px-4 py-2 text-sm font-medium hover:bg-ivory/10"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="mt-8">
        <AccountNav />
        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}
