import { NavLink } from "react-router-dom";

const tabs = [
  { to: "/account", label: "Overview", end: true },
  { to: "/account/orders", label: "My Orders" },
  { to: "/account/addresses", label: "Addresses" },
  { to: "/account/wishlist", label: "Wishlist" },
  { to: "/account/profile", label: "Edit Profile" },
];

export function AccountNav() {
  return (
    <nav className="flex flex-wrap gap-6 border-b border-plum/10" aria-label="Account">
      {tabs.map((t) => (
        <NavLink
          key={t.to}
          to={t.to}
          end={t.end}
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
  );
}
