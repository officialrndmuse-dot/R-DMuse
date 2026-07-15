import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const tabs = [
  { to: "/orders", label: "Orders" },
  { to: "/customers", label: "Customers" },
  { to: "/returns", label: "Returns" },
];

export function AdminLayout({ children }: { children: ReactNode }) {
  const { signOutUser } = useAuth();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <p className="font-display text-lg text-plum">
            R&amp;D <span className="italic text-brassLite">Muse</span> CRM
          </p>
          <nav className="flex gap-6 border-b border-plum/10" aria-label="Admin">
            {tabs.map((t) => (
              <NavLink
                key={t.to}
                to={t.to}
                className={({ isActive }) =>
                  `-mb-px border-b-2 pb-3 text-sm font-medium transition-colors ${
                    isActive ? "border-plum text-plum" : "border-transparent text-plum/50 hover:text-plum"
                  }`
                }
              >
                {t.label}
              </NavLink>
            ))}
          </nav>
        </div>
        <button onClick={() => signOutUser()} className="text-sm text-plum/50 hover:text-plum">
          Logout
        </button>
      </div>

      <div className="mt-8">{children}</div>
    </div>
  );
}
