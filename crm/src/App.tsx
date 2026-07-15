import { Routes, Route, Navigate } from "react-router-dom";
import { RequireAdmin } from "./components/RequireAdmin";
import { Login } from "./pages/Login";
import { Orders } from "./pages/Orders";
import { Customers } from "./pages/Customers";
import { CustomerDetail } from "./pages/CustomerDetail";
import { Returns } from "./pages/Returns";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/orders" element={<RequireAdmin><Orders /></RequireAdmin>} />
      <Route path="/customers" element={<RequireAdmin><Customers /></RequireAdmin>} />
      <Route path="/customers/:id" element={<RequireAdmin><CustomerDetail /></RequireAdmin>} />
      <Route path="/returns" element={<RequireAdmin><Returns /></RequireAdmin>} />
      <Route path="/" element={<Navigate to="/orders" replace />} />
      <Route path="*" element={<Navigate to="/orders" replace />} />
    </Routes>
  );
}
