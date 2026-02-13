"use client";
import StatusBadge from "@/components/admin/status-badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAdminStore } from "@/lib/store/admin-store";
import { cn } from "@/lib/utils";
import type { DashboardStats } from "@/types/admin";
import { motion } from "framer-motion";
import {
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

// Lazy-load recharts (~200KB) — only loaded when revenue dialog opens
const RevenueChart = dynamic(
  () =>
    import("@/components/admin/revenue-chart").then((mod) => mod.RevenueChart),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[300px] items-center justify-center">
        <Loader2 className="text-ylang-rose h-8 w-8 animate-spin" />
      </div>
    ),
  },
);

function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  color = "blue",
  onTrendClick,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType<{ className?: string }>;
  trend?: string;
  color?: "blue" | "green" | "orange" | "purple";
  onTrendClick?: () => void;
}) {
  const colorClasses = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    orange: "bg-orange-500",
    purple: "bg-purple-500",
  };

  const isPositive = typeof trend === "string" && trend.startsWith("+");
  const trendColorClass = isPositive ? "text-green-600" : "text-red-600";
  const trendBgClass = isPositive
    ? "bg-green-50 hover:bg-green-100"
    : "bg-red-50 hover:bg-red-100";

  return (
    <div className="group border-ylang-terracotta relative overflow-hidden rounded-2xl border bg-white p-6 transition-all">
      <div className="mb-4 flex items-start justify-between">
        <div
          className={`h-12 w-12 ${colorClasses[color as keyof typeof colorClasses]} flex items-center justify-center rounded-xl`}
        >
          <Icon className="h-6 w-6 text-white" />
        </div>
        {trend && (
          <button
            onClick={onTrendClick}
            className={cn(
              "flex items-center gap-1 rounded-full px-2 py-1 text-sm font-medium transition-colors",
              onTrendClick
                ? `${trendBgClass} ${trendColorClass} cursor-pointer`
                : trendColorClass,
            )}
          >
            {isPositive ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            {trend}
          </button>
        )}
      </div>
      <p className="text-ylang-charcoal mb-1 text-2xl font-bold">{value}</p>
      <div className="flex items-center justify-between">
        <p className="text-ylang-charcoal/60 text-sm">{title}</p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { orders, setOrders } = useAdminStore();
  const [isLoading, setIsLoading] = React.useState(true);
  const [isChartOpen, setIsChartOpen] = React.useState(false);
  const [stats, setStats] = React.useState<
    DashboardStats & { thisMonthRevenue: number }
  >({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    inProduction: 0,
    averageOrderValue: 0,
    revenueGrowth: 0,
    thisMonthRevenue: 0,
  });
  const [chartData, setChartData] = React.useState<any[]>([]);

  // Charger les commandes
  React.useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch("/api/admin/orders");
        const data = await response.json();
        const ordersList = data.orders || [];
        setOrders(ordersList);

        // Filterm les commandes annulées pour les stats financières
        const validOrders = ordersList.filter(
          (o: any) => o.status !== "cancelled",
        );

        // Calculer les stats
        const totalOrders = validOrders.length;
        const totalRevenue = validOrders.reduce(
          (sum: number, order: { total: number }) => sum + (order.total || 0),
          0,
        );
        const pendingOrders = validOrders.filter(
          (o: { status: string }) =>
            o.status === "pending" || o.status === "paid",
        ).length;
        const inProduction = validOrders.filter(
          (o: { status: string }) => o.status === "in_production",
        ).length;
        const averageOrderValue =
          totalOrders > 0 ? totalRevenue / totalOrders : 0;

        // Calcul de la croissance (CE MOIS vs MOIS DERNIER)
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear =
          currentMonth === 0 ? currentYear - 1 : currentYear;

        const thisMonthRevenue = validOrders
          .filter((o: any) => {
            const d = new Date(o.createdAt);
            return (
              d.getMonth() === currentMonth && d.getFullYear() === currentYear
            );
          })
          .reduce((sum: number, o: any) => sum + (o.total || 0), 0);

        const lastMonthRevenue = validOrders
          .filter((o: any) => {
            const d = new Date(o.createdAt);
            return (
              d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear
            );
          })
          .reduce((sum: number, o: any) => sum + (o.total || 0), 0);

        const revenueGrowth =
          lastMonthRevenue > 0
            ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
            : thisMonthRevenue > 0
              ? 100
              : 0;

        // Données du graphique (6 derniers mois)
        const months = Array.from({ length: 6 }, (_, i) => {
          const d = new Date();
          d.setMonth(d.getMonth() - (5 - i));
          return {
            month: d.getMonth(),
            year: d.getFullYear(),
            label: d.toLocaleDateString("fr-FR", { month: "short" }),
          };
        });

        const computedChartData = months.map((m) => {
          const monthlyRevenue = validOrders
            .filter((o: any) => {
              const d = new Date(o.createdAt);
              return d.getMonth() === m.month && d.getFullYear() === m.year;
            })
            .reduce((sum: number, o: any) => sum + (o.total || 0), 0);

          return {
            name: m.label,
            revenue: monthlyRevenue,
          };
        });

        setChartData(computedChartData);

        setStats({
          totalOrders,
          totalRevenue,
          pendingOrders,
          inProduction,
          averageOrderValue,
          revenueGrowth: parseFloat(revenueGrowth.toFixed(1)),
          thisMonthRevenue,
        });
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
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="text-ylang-rose h-10 w-10 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-ylang-charcoal mb-2 text-3xl font-bold">
          Dashboard
        </h1>
        <p className="text-ylang-charcoal/60">
          Bienvenue ! Voici un aperçu de votre activité.
        </p>
      </div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
      >
        <StatCard
          title="CA (Mois en cours)"
          value={`${stats.thisMonthRevenue.toFixed(0)}€`}
          icon={Euro}
          trend={`${stats.revenueGrowth > 0 ? "+" : ""}${stats.revenueGrowth}%`}
          color="green"
          onTrendClick={() => setIsChartOpen(true)}
        />
        <StatCard
          title="Total Commandes"
          value={stats.totalOrders}
          icon={ShoppingBag}
          color="blue"
        />
        <StatCard
          title="En attente"
          value={stats.pendingOrders}
          icon={Clock}
          color="orange"
        />
        <StatCard
          title="En production"
          value={stats.inProduction}
          icon={Package}
          color="purple"
        />
      </motion.div>

      {/* Quick Actions */}
      <div className="mb-8 grid gap-6 sm:grid-cols-3">
        <Link
          href="/admin/orders"
          className="group border-ylang-beige rounded-2xl border bg-white p-6 transition-all duration-300 hover:scale-105 hover:shadow-md"
        >
          <div className="flex items-center gap-4">
            <div className="bg-ylang-rose/10 group-hover:bg-ylang-rose flex h-12 w-12 items-center justify-center rounded-xl transition-colors">
              <Package className="text-ylang-rose h-6 w-6 transition-colors group-hover:text-white" />
            </div>
            <div>
              <p className="text-ylang-charcoal mb-1 font-bold">
                Toutes les commandes
              </p>
              <p className="text-ylang-charcoal/60 text-sm">Gérer et suivre</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/products"
          className="group border-ylang-beige rounded-2xl border bg-white p-6 transition-all duration-300 hover:scale-105 hover:shadow-md"
        >
          <div className="flex items-center gap-4">
            <div className="bg-ylang-rose/10 group-hover:bg-ylang-rose flex h-12 w-12 items-center justify-center rounded-xl transition-colors">
              <ShoppingBag className="text-ylang-rose h-6 w-6 transition-colors group-hover:text-white" />
            </div>
            <div>
              <p className="text-ylang-charcoal mb-1 font-bold">Produits</p>
              <p className="text-ylang-charcoal/60 text-sm">
                Gérer le catalogue
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/users"
          className="group border-ylang-beige rounded-2xl border bg-white p-6 transition-all duration-300 hover:scale-105 hover:shadow-md"
        >
          <div className="flex items-center gap-4">
            <div className="bg-ylang-rose/10 group-hover:bg-ylang-rose flex h-12 w-12 items-center justify-center rounded-xl transition-colors">
              <Users className="text-ylang-rose h-6 w-6 transition-colors group-hover:text-white" />
            </div>
            <div>
              <p className="text-ylang-charcoal mb-1 font-bold">Clients</p>
              <p className="text-ylang-charcoal/60 text-sm">
                Voir les utilisateurs
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Orders */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="border-ylang-terracotta rounded-2xl border bg-white shadow-xs"
      >
        <div className="border-ylang-beige border-b p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-ylang-charcoal text-xl font-bold">
              Commandes récentes
            </h2>
            <Link
              href="/admin/orders"
              className="text-ylang-rose text-sm font-medium hover:underline"
            >
              Voir tout →
            </Link>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="text-ylang-charcoal/20 mx-auto mb-4 h-12 w-12" />
            <p className="text-ylang-charcoal/60">
              Aucune commande pour le moment
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-ylang-cream">
                <tr>
                  <th className="text-ylang-charcoal/60 px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
                    Commande
                  </th>
                  <th className="text-ylang-charcoal/60 px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
                    Client
                  </th>
                  <th className="text-ylang-charcoal/60 px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
                    Statut
                  </th>
                  <th className="text-ylang-charcoal/60 px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
                    Montant
                  </th>
                  <th className="text-ylang-charcoal/60 px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-ylang-beige divide-y">
                {orders.slice(0, 5).map((order, idx) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 + idx * 0.05 }}
                    className="hover:bg-ylang-cream transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-ylang-rose font-medium hover:underline"
                      >
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-ylang-charcoal text-sm font-medium">
                          {order.customerName}
                        </p>
                        <p className="text-ylang-charcoal/60 text-xs">
                          {order.customerEmail}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="text-ylang-charcoal px-6 py-4 text-sm font-bold whitespace-nowrap">
                      {order.total.toFixed(2)}€
                    </td>
                    <td className="text-ylang-charcoal/60 px-6 py-4 text-sm whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Revenue Modal */}
      <Dialog open={isChartOpen} onOpenChange={setIsChartOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-ylang-charcoal text-2xl font-bold">
              Analyse du chiffre d&apos;affaires
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 border-t pt-6">
            <div className="mb-6 grid grid-cols-2 gap-4">
              <div className="border-ylang-beige bg-ylang-cream/10 rounded-2xl border p-4">
                <p className="text-ylang-charcoal/60 text-sm font-medium">
                  Revenu Total
                </p>
                <p className="text-ylang-charcoal text-xl font-bold">
                  {stats.totalRevenue.toFixed(2)}€
                </p>
              </div>
              <div className="border-ylang-beige bg-ylang-cream/10 rounded-2xl border p-4">
                <p className="text-ylang-charcoal/60 text-sm font-medium">
                  Croissance
                </p>
                <p className="text-xl font-bold text-green-600">
                  {stats.revenueGrowth > 0 ? "+" : ""}
                  {stats.revenueGrowth}%
                </p>
              </div>
            </div>
            <RevenueChart data={chartData} />
            <p className="text-ylang-charcoal/40 mt-6 text-center text-xs italic">
              Données basées sur les 6 derniers mois d&apos;activité
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
