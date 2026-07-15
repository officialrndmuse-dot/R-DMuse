import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { authedFetch } from "../lib/api";
import { AdminLayout } from "../components/AdminLayout";
import { StatCard } from "../components/StatCard";
import { inr } from "../lib/format";

interface DashboardStats {
  todayOrders: number;
  todayRevenue: number;
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  pendingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  pendingReturns: number;
}

export function Dashboard() {
  const { getIdToken } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    getIdToken().then(async (idToken) => {
      const res = await authedFetch("/api/admin?resource=dashboard", idToken);
      if (res.ok) setStats(await res.json());
    });
  }, [getIdToken]);

  return (
    <AdminLayout>
      <h1 className="text-2xl text-plum">Dashboard</h1>
      <p className="mt-1 text-sm text-plum/50">Welcome back</p>

      {!stats ? (
        <p className="mt-6 text-sm text-plum/50">Loading…</p>
      ) : (
        <>
          <h2 className="mt-8 text-xs font-semibold uppercase tracking-wide text-plum/50">Today's Overview</h2>
          <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard label="Today's Revenue" value={inr(stats.todayRevenue)} hint="Revenue today" tone="green" />
            <StatCard label="Today's Orders" value={String(stats.todayOrders)} hint="Orders placed today" />
            <StatCard label="Pending Returns" value={String(stats.pendingReturns)} hint="Awaiting review" tone="orange" />
            <StatCard label="Total Customers" value={String(stats.totalCustomers)} hint="Registered accounts" tone="blue" />
          </div>

          <h2 className="mt-8 text-xs font-semibold uppercase tracking-wide text-plum/50">Overall Summary</h2>
          <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard label="Total Revenue" value={inr(stats.totalRevenue)} hint="All-time revenue" tone="green" />
            <StatCard label="Total Orders" value={String(stats.totalOrders)} hint="All-time orders" />
            <StatCard label="Pending Orders" value={String(stats.pendingOrders)} hint="Not yet confirmed" tone="orange" />
            <StatCard label="Shipped" value={String(stats.shippedOrders)} hint="In transit" tone="blue" />
            <StatCard label="Delivered" value={String(stats.deliveredOrders)} hint="Completed orders" tone="green" />
            <StatCard label="Total Customers" value={String(stats.totalCustomers)} hint="Registered accounts" tone="blue" />
            <StatCard label="Pending Returns" value={String(stats.pendingReturns)} hint="Awaiting review" tone="orange" />
          </div>
        </>
      )}
    </AdminLayout>
  );
}
