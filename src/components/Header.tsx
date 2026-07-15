import { Link, NavLink } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import logoMark from "../assets/logo-mark.jpg";

const nav = [
  { to: "/", label: "Home", end: true },
  { to: "/shop", label: "Shop" },
  { to: "/blog", label: "Journal" },
  { to: "/about", label: "About" },
];

export function Header() {
  const { count } = useCart();
  const { status } = useAuth();
  return (
    <header className="sticky top-0 z-40 border-b border-plum/10 bg-ivory/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link to="/" aria-label="RnD Muse home">
          <img src={logoMark} alt="RnD Muse" className="h-9 w-auto" />
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

        <div className="flex items-center gap-3">
          <Link
            to={status === "signedIn" ? "/account" : "/account/login"}
            aria-label="Account"
            className="grid h-9 w-9 place-items-center rounded-full text-plum/70 hover:bg-plum/5 hover:text-plum"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 3.5-6 8-6s8 2 8 6" />
            </svg>
          </Link>

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
      </div>
    </header>
  );
}
