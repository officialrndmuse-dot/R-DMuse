import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { Home } from "./pages/Home";
import { Catalog } from "./pages/Catalog";
import { ProductDetail } from "./pages/ProductDetail";
import { CartPage } from "./pages/CartPage";
import { Checkout } from "./pages/Checkout";
import { OrderStatus } from "./pages/OrderStatus";
import { Blog } from "./pages/Blog";
import { BlogPost } from "./pages/BlogPost";
import { About } from "./pages/About";
import { RequireAuth } from "./components/RequireAuth";
import { RequireAdmin } from "./components/RequireAdmin";
import { Login as AccountLogin } from "./pages/account/Login";
import { Overview } from "./pages/account/Overview";
import { Orders } from "./pages/account/Orders";
import { Addresses } from "./pages/account/Addresses";
import { Wishlist } from "./pages/account/Wishlist";
import { EditProfile } from "./pages/account/EditProfile";
import { Support } from "./pages/account/Support";
import { Returns } from "./pages/account/Returns";
import { AdminLogin } from "./pages/admin/Login";
import { AdminReturns } from "./pages/admin/Returns";

// Scroll to top whenever the route changes
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Catalog />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order/:id" element={<OrderStatus />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/about" element={<About />} />

          <Route path="/account/login" element={<AccountLogin />} />
          <Route path="/account/support" element={<Support />} />
          <Route path="/account" element={<RequireAuth><Overview /></RequireAuth>} />
          <Route path="/account/orders" element={<RequireAuth><Orders /></RequireAuth>} />
          <Route path="/account/addresses" element={<RequireAuth><Addresses /></RequireAuth>} />
          <Route path="/account/wishlist" element={<RequireAuth><Wishlist /></RequireAuth>} />
          <Route path="/account/profile" element={<RequireAuth><EditProfile /></RequireAuth>} />
          <Route path="/account/returns" element={<RequireAuth><Returns /></RequireAuth>} />

          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/returns" element={<RequireAdmin><AdminReturns /></RequireAdmin>} />

          <Route path="*" element={
            <div className="mx-auto max-w-3xl px-4 py-24 text-center">
              <h1 className="text-4xl text-plum">Page not found</h1>
            </div>
          } />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
