import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-plum/10 bg-plum text-ivory">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-display text-xl">
            R&amp;D <span className="italic text-brassLite">Muse</span>
          </p>
          <p className="mt-2 max-w-xs text-sm text-ivory/70">
            Ethnic × modern accessories, dreamed up by Ronit &amp; Dhruv. Adorn your every mood.
          </p>
        </div>
        <div className="text-sm">
          <p className="mb-3 font-semibold text-brassLite">Shop</p>
          <ul className="space-y-2 text-ivory/70">
            <li><Link to="/shop" className="hover:text-ivory">All products</Link></li>
            <li><Link to="/shop?category=festive" className="hover:text-ivory">Festive &amp; Navratri</Link></li>
            <li><Link to="/blog" className="hover:text-ivory">Journal</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="mb-3 font-semibold text-brassLite">Account</p>
          <ul className="space-y-2 text-ivory/70">
            <li><Link to="/account/orders" className="hover:text-ivory">Track order</Link></li>
            <li><Link to="/account/wishlist" className="hover:text-ivory">Wishlist</Link></li>
            <li><Link to="/account/support" className="hover:text-ivory">Support</Link></li>
            <li><Link to="/account/returns" className="hover:text-ivory">Returns</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="mb-3 font-semibold text-brassLite">Reach us</p>
          <ul className="space-y-2 text-ivory/70">
            <li>DM to order on Instagram</li>
            <li>Pan-India shipping</li>
            <li>hello@rndmuse.in</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-ivory/10 py-4 text-center text-xs text-ivory/50">
        © {new Date().getFullYear()} RnD Muse. Made with care in India.
      </div>
    </footer>
  );
}
