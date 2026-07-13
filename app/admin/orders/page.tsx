import { OrdersClient } from "@/components/admin/orders-client";
import { getOrdersData } from "@/lib/admin/get-orders-data";

export default async function OrdersPage() {
  const orders = await getOrdersData();

  return <OrdersClient initialOrders={orders} />;
}
