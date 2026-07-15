import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/orders", label: "Orders" },
  { to: "/customers", label: "Customers" },
  { to: "/returns", label: "Returns" },
  { to: "/products", label: "Products" },
  { to: "/journal", label: "Journal" },
];

export function Sidebar() {
  const { user, signOutUser } = useAuth();

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-plum/10 bg-white">
      <div className="p-6">
        <p className="font-display text-lg text-plum">
          R&amp;D <span className="italic text-brassLite">Muse</span>
        </p>
        <p className="text-xs text-plum/50">CRM</p>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-plum/40">Overview</p>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive ? "bg-plum text-ivory" : "text-plum/70 hover:bg-plum/5"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-plum/10 p-4">
        <p className="truncate text-xs text-plum/50">{user?.email}</p>
        <button onClick={() => signOutUser()} className="mt-1 text-sm font-medium text-plum/60 hover:text-plum">
          Logout
        </button>
      </div>
    </aside>
  );
}
