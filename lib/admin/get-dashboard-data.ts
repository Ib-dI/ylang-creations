import { getOrdersData } from "@/lib/admin/get-orders-data";
import type { DashboardStats, Order } from "@/types/admin";

export interface DashboardData {
  stats: DashboardStats & { thisMonthRevenue: number };
  chartData: { name: string; revenue: number }[];
  recentOrders: Order[];
}

export async function getDashboardData(): Promise<DashboardData> {
  const orders = await getOrdersData();
  const validOrders = orders.filter((o) => o.status !== "cancelled");

  const totalOrders = validOrders.length;
  const totalRevenue = validOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const pendingOrders = validOrders.filter(
    (o) => o.status === "pending" || o.status === "paid",
  ).length;
  const inProduction = validOrders.filter((o) => o.status === "in_production").length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  const thisMonthRevenue = validOrders
    .filter((o) => {
      const d = new Date(o.createdAt);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const lastMonthRevenue = validOrders
    .filter((o) => {
      const d = new Date(o.createdAt);
      return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
    })
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const revenueGrowth =
    lastMonthRevenue > 0
      ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
      : thisMonthRevenue > 0
        ? 100
        : 0;

  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    return {
      month: d.getMonth(),
      year: d.getFullYear(),
      label: d.toLocaleDateString("fr-FR", { month: "short" }),
    };
  });

  const chartData = months.map((m) => ({
    name: m.label,
    revenue: validOrders
      .filter((o) => {
        const d = new Date(o.createdAt);
        return d.getMonth() === m.month && d.getFullYear() === m.year;
      })
      .reduce((sum, o) => sum + (o.total || 0), 0),
  }));

  return {
    stats: {
      totalOrders,
      totalRevenue,
      pendingOrders,
      inProduction,
      averageOrderValue,
      revenueGrowth: parseFloat(revenueGrowth.toFixed(1)),
      thisMonthRevenue,
    },
    chartData,
    recentOrders: orders.slice(0, 5),
  };
}
