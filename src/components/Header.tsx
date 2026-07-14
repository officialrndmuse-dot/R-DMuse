import { Link, NavLink } from "react-router-dom";
import { useCart } from "../context/CartContext";

const nav = [
  { to: "/", label: "Home", end: true },
  { to: "/shop", label: "Shop" },
  { to: "/blog", label: "Journal" },
  { to: "/about", label: "About" },
];

export function Header() {
  const { count } = useCart();
  return (
    <header className="sticky top-0 z-40 border-b border-plum/10 bg-ivory/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        {/* Wordmark — "R&D" stays in the identity, domain is rndmuse */}
        <Link to="/" className="flex items-baseline gap-1" aria-label="RnD Muse home">
          <span className="font-display text-2xl font-bold text-plum">R&amp;D</span>
          <span className="font-display text-2xl italic text-brass">Muse</span>
        </Link>

        <nav className="hidden gap-8 md:flex" aria-label="Primary">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive ? "text-plum" : "text-plum/60 hover:text-plum"
                }`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>

        <Link
          to="/cart"
          className="relative rounded-full bg-plum px-4 py-2 text-sm font-medium text-ivory hover:bg-berry"
        >
          Cart
          {count > 0 && (
            <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-brass text-[11px] font-bold text-plum">
              {count}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
