import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const tabs = [
  { to: "/admin/orders", label: "Orders" },
  { to: "/admin/customers", label: "Customers" },
  { to: "/admin/returns", label: "Returns" },
];

export function AdminLayout({ children }: { children: ReactNode }) {
  const { signOutUser } = useAuth();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-center justify-between">
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
        <button onClick={() => signOutUser()} className="text-sm text-plum/50 hover:text-plum">
          Logout
        </button>
      </div>

      <div className="mt-8">{children}</div>
    </div>
  );
}
