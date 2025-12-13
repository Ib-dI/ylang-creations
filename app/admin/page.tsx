"use client";

import StatusBadge from "@/components/admin/status-badge";
import { useAdminStore } from "@/lib/store/admin-store";
import type { DashboardStats } from "@/types/admin";
import {
  Clock,
  Euro,
  Loader2,
  Package,
  ShoppingBag,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";

function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  color = "blue",
}: {
  title: string;
  value: string | number;
  icon: React.ElementType<{ className?: string }>;
  trend?: string;
  color?: string;
}) {
  const colorClasses = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    orange: "bg-orange-500",
    purple: "bg-purple-500",
  };

  return (
    <div className="border-ylang-beige rounded-2xl border bg-white p-6 transition-shadow hover:shadow-lg">
      <div className="mb-4 flex items-start justify-between">
        <div
          className={`h-12 w-12 ${colorClasses[color as keyof typeof colorClasses]} flex items-center justify-center rounded-xl`}
        >
          <Icon className="h-6 w-6 text-white" />
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-sm font-medium text-green-600">
            <TrendingUp className="h-4 w-4" />
            {trend}
          </div>
        )}
      </div>
      <p className="text-ylang-charcoal mb-1 text-2xl font-bold">{value}</p>
      <p className="text-ylang-charcoal/60 text-sm">{title}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const { orders, setOrders } = useAdminStore();
  const [isLoading, setIsLoading] = React.useState(true);
  const [stats, setStats] = React.useState<DashboardStats>({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    inProduction: 0,
    averageOrderValue: 0,
    revenueGrowth: 12.5,
  });

  // Charger les commandes
  React.useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch("/api/admin/orders");
        const data = await response.json();
        setOrders(data.orders || []);

        // Calculer les stats
        const ordersList = data.orders || [];
        const totalOrders = ordersList.length;
        const totalRevenue = ordersList.reduce(
          (sum: number, order: { total: number }) => sum + (order.total || 0),
          0,
        );
        const pendingOrders = ordersList.filter(
          (o: { status: string }) =>
            o.status === "pending" || o.status === "paid",
        ).length;
        const inProduction = ordersList.filter(
          (o: { status: string }) => o.status === "in_production",
        ).length;
        const averageOrderValue =
          totalOrders > 0 ? totalRevenue / totalOrders : 0;

        setStats({
          totalOrders,
          totalRevenue,
          pendingOrders,
          inProduction,
          averageOrderValue,
          revenueGrowth: 0, // TODO: Monter ce calcul avec les commandes du mois dernier
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
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="text-ylang-rose h-8 w-8 animate-spin" />
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
      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Commandes"
          value={stats.totalOrders}
          icon={ShoppingBag}
          color="blue"
        />
        <StatCard
          title="Chiffre d'affaires"
          value={`${stats.totalRevenue.toFixed(0)}€`}
          icon={Euro}
          trend={`+${stats.revenueGrowth}%`}
          color="green"
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
      </div>

      {/* Quick Actions */}
      <div className="mb-8 grid gap-6 sm:grid-cols-3">
        <Link
          href="/admin/orders"
          className="group border-ylang-beige rounded-2xl border bg-white p-6 transition-all duration-300 hover:scale-105 hover:shadow-lg"
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
          className="group border-ylang-beige rounded-2xl border bg-white p-6 transition-all duration-300 hover:scale-105 hover:shadow-lg"
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
          className="group border-ylang-beige rounded-2xl border bg-white p-6 transition-all duration-300 hover:scale-105 hover:shadow-lg"
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
      <div className="border-ylang-beige rounded-2xl border bg-white shadow-lg">
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
                {orders.slice(0, 5).map((order) => (
                  <tr
                    key={order.id}
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
