import { Routes, Route, Navigate } from "react-router-dom";
import { RequireAdmin } from "./components/RequireAdmin";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { Orders } from "./pages/Orders";
import { Customers } from "./pages/Customers";
import { CustomerDetail } from "./pages/CustomerDetail";
import { Returns } from "./pages/Returns";
import { Products } from "./pages/Products";
import { ProductForm } from "./pages/ProductForm";
import { Journal } from "./pages/Journal";
import { JournalForm } from "./pages/JournalForm";

export default function App() {
  return (
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
  );
}
