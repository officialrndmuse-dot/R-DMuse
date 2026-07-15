import { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { RequireAdmin } from "./components/RequireAdmin";
import { Login } from "./pages/Login";

// Lazy-loaded so the Tiptap editor (Journal) and other secondary pages
// don't bloat the bundle every visitor downloads just to see the Dashboard.
const Dashboard = lazy(() => import("./pages/Dashboard").then((m) => ({ default: m.Dashboard })));
const Orders = lazy(() => import("./pages/Orders").then((m) => ({ default: m.Orders })));
const Customers = lazy(() => import("./pages/Customers").then((m) => ({ default: m.Customers })));
const CustomerDetail = lazy(() => import("./pages/CustomerDetail").then((m) => ({ default: m.CustomerDetail })));
const Returns = lazy(() => import("./pages/Returns").then((m) => ({ default: m.Returns })));
const Products = lazy(() => import("./pages/Products").then((m) => ({ default: m.Products })));
const ProductForm = lazy(() => import("./pages/ProductForm").then((m) => ({ default: m.ProductForm })));
const Journal = lazy(() => import("./pages/Journal").then((m) => ({ default: m.Journal })));
const JournalForm = lazy(() => import("./pages/JournalForm").then((m) => ({ default: m.JournalForm })));

function PageFallback() {
  return <div className="p-8 text-sm text-plum/50">Loading…</div>;
}

export default function App() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<RequireAdmin><Dashboard /></RequireAdmin>} />
        <Route path="/orders" element={<RequireAdmin><Orders /></RequireAdmin>} />
        <Route path="/customers" element={<RequireAdmin><Customers /></RequireAdmin>} />
        <Route path="/customers/:id" element={<RequireAdmin><CustomerDetail /></RequireAdmin>} />
        <Route path="/returns" element={<RequireAdmin><Returns /></RequireAdmin>} />
        <Route path="/products" element={<RequireAdmin><Products /></RequireAdmin>} />
        <Route path="/products/new" element={<RequireAdmin><ProductForm /></RequireAdmin>} />
        <Route path="/products/:id" element={<RequireAdmin><ProductForm /></RequireAdmin>} />
        <Route path="/journal" element={<RequireAdmin><Journal /></RequireAdmin>} />
        <Route path="/journal/new" element={<RequireAdmin><JournalForm /></RequireAdmin>} />
        <Route path="/journal/:id" element={<RequireAdmin><JournalForm /></RequireAdmin>} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}
