"use client";

import StatusBadge from "@/components/admin/status-badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAdminStore } from "@/lib/store/admin-store";
import type { DashboardStats } from "@/types/admin";
import { motion } from "framer-motion";
import {
  ChevronRight,
  Clock,
  Euro,
  Loader2,
  Package,
  ShoppingBag,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import * as React from "react";

const RevenueChart = dynamic(
  () => import("@/components/admin/revenue-chart").then((mod) => mod.RevenueChart),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[300px] items-center justify-center">
        <Loader2
          className="h-6 w-6 animate-spin"
          style={{ color: "var(--color-ink-3)" }}
          strokeWidth={1.5}
        />
      </div>
    ),
  },
);

function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  onTrendClick,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType<{ className?: string; strokeWidth?: number }>;
  trend?: string;
  onTrendClick?: () => void;
}) {
  const isPositive = typeof trend === "string" && trend.startsWith("+");

  return (
    <div style={{ border: "var(--rule-soft)", background: "var(--color-paper)" }}>
      <div className="flex items-start justify-between p-5">
        <div className="min-w-0 flex-1">
          <p className="type-overline mb-3" style={{ color: "var(--color-ink-3)" }}>
            {title}
          </p>
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 400,
              fontSize: "var(--text-title)",
              color: "var(--color-ink)",
              lineHeight: 1,
            }}
          >
            {value}
          </p>
        </div>
        <Icon className="h-4 w-4 shrink-0" style={{ color: "var(--color-ink-3)" } as React.CSSProperties} strokeWidth={1.5} />
      </div>

      {trend && (
        <button
          onClick={onTrendClick}
          disabled={!onTrendClick}
          className="flex w-full items-center justify-between px-5 py-3 font-body text-xs transition-opacity hover:opacity-70 disabled:cursor-default"
          style={{ borderTop: "var(--rule-soft)" }}
        >
          <span style={{ color: "var(--color-ink-3)" }}>vs. mois dernier</span>
          <span
            className="flex items-center gap-1 font-medium"
            style={{ color: isPositive ? "#22c55e" : "#ef4444" }}
          >
            {isPositive
              ? <TrendingUp className="h-3 w-3" strokeWidth={2} />
              : <TrendingDown className="h-3 w-3" strokeWidth={2} />
            }
            {trend}
          </span>
        </button>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const { orders, setOrders } = useAdminStore();
  const [isLoading, setIsLoading] = React.useState(true);
  const [isChartOpen, setIsChartOpen] = React.useState(false);
  const [stats, setStats] = React.useState<DashboardStats & { thisMonthRevenue: number }>({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    inProduction: 0,
    averageOrderValue: 0,
    revenueGrowth: 0,
    thisMonthRevenue: 0,
  });
  const [chartData, setChartData] = React.useState<{ name: string; revenue: number }[]>([]);

  React.useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch("/api/admin/orders");
        const data = await response.json();
        const ordersList = data.orders || [];
        setOrders(ordersList);

        const validOrders = ordersList.filter((o: { status: string }) => o.status !== "cancelled");

        const totalOrders = validOrders.length;
        const totalRevenue = validOrders.reduce((sum: number, o: { total: number }) => sum + (o.total || 0), 0);
        const pendingOrders = validOrders.filter((o: { status: string }) => o.status === "pending" || o.status === "paid").length;
        const inProduction = validOrders.filter((o: { status: string }) => o.status === "in_production").length;
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

        const thisMonthRevenue = validOrders
          .filter((o: { createdAt: string }) => {
            const d = new Date(o.createdAt);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
          })
          .reduce((sum: number, o: { total: number }) => sum + (o.total || 0), 0);

        const lastMonthRevenue = validOrders
          .filter((o: { createdAt: string }) => {
            const d = new Date(o.createdAt);
            return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
          })
          .reduce((sum: number, o: { total: number }) => sum + (o.total || 0), 0);

        const revenueGrowth = lastMonthRevenue > 0
          ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
          : thisMonthRevenue > 0 ? 100 : 0;

        const months = Array.from({ length: 6 }, (_, i) => {
          const d = new Date();
          d.setMonth(d.getMonth() - (5 - i));
          return {
            month: d.getMonth(),
            year: d.getFullYear(),
            label: d.toLocaleDateString("fr-FR", { month: "short" }),
          };
        });

        setChartData(months.map((m) => ({
          name: m.label,
          revenue: validOrders
            .filter((o: { createdAt: string }) => {
              const d = new Date(o.createdAt);
              return d.getMonth() === m.month && d.getFullYear() === m.year;
            })
            .reduce((sum: number, o: { total: number }) => sum + (o.total || 0), 0),
        })));

        setStats({ totalOrders, totalRevenue, pendingOrders, inProduction, averageOrderValue, revenueGrowth: parseFloat(revenueGrowth.toFixed(1)), thisMonthRevenue });
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, [setOrders]);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" style={{ color: "var(--color-ink-3)" }} strokeWidth={1.5} />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <p className="type-overline mb-2" style={{ color: "var(--color-accent)" }}>
          Administration
        </p>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 400,
            fontSize: "1.75rem",
            color: "var(--color-ink)",
          }}
        >
          Dashboard
        </h1>
        <p className="font-body mt-1 text-sm" style={{ color: "var(--color-ink-3)" }}>
          Aperçu de l&apos;activité en cours
        </p>
      </div>

      {/* Stat cards */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4"
      >
        <StatCard
          title="CA mois en cours"
          value={`${stats.thisMonthRevenue.toFixed(0)} €`}
          icon={Euro}
          trend={`${stats.revenueGrowth > 0 ? "+" : ""}${stats.revenueGrowth}%`}
          onTrendClick={() => setIsChartOpen(true)}
        />
        <StatCard
          title="Total commandes"
          value={stats.totalOrders}
          icon={ShoppingBag}
        />
        <StatCard
          title="En attente"
          value={stats.pendingOrders}
          icon={Clock}
        />
        <StatCard
          title="En production"
          value={stats.inProduction}
          icon={Package}
        />
      </motion.div>

      {/* Quick actions */}
      <div className="mb-8 grid gap-3 sm:grid-cols-3">
        {[
          { href: "/admin/orders",   icon: Package,    label: "Commandes",  sub: "Gérer et suivre" },
          { href: "/admin/products", icon: ShoppingBag, label: "Produits",   sub: "Gérer le catalogue" },
          { href: "/admin/users",    icon: Users,       label: "Clients",    sub: "Voir les utilisateurs" },
        ].map(({ href, icon: Icon, label, sub }) => (
          <Link
            key={href}
            href={href}
            className="group flex items-center gap-4 p-5 transition-opacity hover:opacity-70"
            style={{ border: "var(--rule-soft)", background: "var(--color-paper)" }}
          >
            <Icon className="h-5 w-5 shrink-0" style={{ color: "var(--color-ink-3)" }} strokeWidth={1.5} />
            <div className="min-w-0 flex-1">
              <p
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 400,
                  fontSize: "1rem",
                  color: "var(--color-ink)",
                }}
              >
                {label}
              </p>
              <p className="font-body mt-0.5 text-xs" style={{ color: "var(--color-ink-3)" }}>
                {sub}
              </p>
            </div>
            <ChevronRight
              className="h-4 w-4 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
              style={{ color: "var(--color-ink-3)" }}
              strokeWidth={1.5}
            />
          </Link>
        ))}
      </div>

      {/* Commandes récentes */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        style={{ border: "var(--rule-hair)", background: "var(--color-paper)" }}
      >
        {/* Table header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: "var(--rule-hair)" }}
        >
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 400,
              fontSize: "1rem",
              color: "var(--color-ink)",
            }}
          >
            Commandes récentes
          </h2>
          <Link
            href="/admin/orders"
            className="font-body text-xs transition-opacity hover:opacity-70"
            style={{ color: "var(--color-ink-3)", borderBottom: "1px solid var(--color-accent)" }}
          >
            Voir tout →
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <Package
              className="mx-auto mb-4 h-8 w-8"
              style={{ color: "var(--color-ink-3)", opacity: 0.3 }}
              strokeWidth={1}
            />
            <p className="font-body text-sm" style={{ color: "var(--color-ink-3)" }}>
              Aucune commande pour le moment
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: "var(--color-paper-2)" }}>
                  {["Commande", "Client", "Statut", "Montant", "Date"].map((th) => (
                    <th
                      key={th}
                      className="type-overline px-6 py-3 text-left"
                      style={{ color: "var(--color-ink-3)" }}
                    >
                      {th}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map((order, idx) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25, delay: 0.2 + idx * 0.04 }}
                    className="transition-colors hover:bg-[var(--color-paper-2)]"
                    style={{ borderTop: "var(--rule-soft)" }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-body text-sm transition-opacity hover:opacity-70"
                        style={{ color: "var(--color-ink)", borderBottom: "1px solid var(--color-accent)" }}
                      >
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="font-body text-sm font-medium" style={{ color: "var(--color-ink)" }}>
                        {order.customerName}
                      </p>
                      <p className="font-body mt-0.5 text-xs" style={{ color: "var(--color-ink-3)" }}>
                        {order.customerEmail}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        style={{
                          fontFamily: "var(--font-display)",
                          fontWeight: 400,
                          fontSize: "0.9375rem",
                          color: "var(--color-ink)",
                        }}
                      >
                        {order.total.toFixed(2)} €
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-body text-sm" style={{ color: "var(--color-ink-3)" }}>
                        {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Revenue dialog */}
      <Dialog open={isChartOpen} onOpenChange={setIsChartOpen}>
        <DialogContent
          className="sm:max-w-2xl"
          style={{ background: "var(--color-paper)", border: "var(--rule-hair)" }}
        >
          <DialogHeader>
            <DialogTitle
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 400,
                fontSize: "var(--text-title)",
                color: "var(--color-ink)",
              }}
            >
              Chiffre d&apos;affaires
            </DialogTitle>
          </DialogHeader>

          <div style={{ borderTop: "var(--rule-hair)", paddingTop: "1.5rem" }}>
            <div className="mb-6 grid grid-cols-2 gap-4">
              <div className="p-4" style={{ border: "var(--rule-soft)" }}>
                <p className="type-overline mb-2" style={{ color: "var(--color-ink-3)" }}>
                  Revenu total
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 400,
                    fontSize: "var(--text-title)",
                    color: "var(--color-ink)",
                  }}
                >
                  {stats.totalRevenue.toFixed(2)} €
                </p>
              </div>
              <div className="p-4" style={{ border: "var(--rule-soft)" }}>
                <p className="type-overline mb-2" style={{ color: "var(--color-ink-3)" }}>
                  Croissance
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 400,
                    fontSize: "var(--text-title)",
                    color: stats.revenueGrowth >= 0 ? "#22c55e" : "#ef4444",
                  }}
                >
                  {stats.revenueGrowth > 0 ? "+" : ""}{stats.revenueGrowth}%
                </p>
              </div>
            </div>

            <RevenueChart data={chartData} />

            <p
              className="mt-6 text-center font-body text-xs italic"
              style={{ color: "var(--color-ink-3)", opacity: 0.5 }}
            >
              6 derniers mois d&apos;activité
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
