import { DashboardClient } from "@/components/admin/dashboard-client";
import { getDashboardData } from "@/lib/admin/get-dashboard-data";

export default async function AdminDashboard() {
  const { stats, chartData, recentOrders } = await getDashboardData();

  return (
    <DashboardClient
      initialStats={stats}
      initialChartData={chartData}
      initialOrders={recentOrders}
    />
  );
}
