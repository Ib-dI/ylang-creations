"use client";

import OrderDetailModal from "@/components/admin/order-detail-modal";
import StatusBadge from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { useAdminStore } from "@/lib/store/admin-store";
import type { OrderStatus } from "@/types/admin";
import { motion } from "framer-motion";
import {
  Download,
  Eye,
  Loader2,
  Package,
  RefreshCw,
  Search,
} from "lucide-react";
import * as React from "react";

export default function OrdersPage() {
  const { orders, setOrders, setSelectedOrder, filterByStatus, searchOrders } =
    useAdminStore();
  const [statusFilter, setStatusFilter] = React.useState<OrderStatus | "all">(
    "all",
  );
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filteredOrders, setFilteredOrders] = React.useState(orders);
  const [showModal, setShowModal] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  // Charger les commandes
  React.useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/orders");
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrer les commandes
  React.useEffect(() => {
    let result = orders;

    if (statusFilter !== "all") {
      result = filterByStatus(statusFilter);
    }

    if (searchQuery) {
      result = searchOrders(searchQuery);
    }

    setFilteredOrders(result);
  }, [statusFilter, searchQuery, orders, filterByStatus, searchOrders]);

  const statusTabs = [
    { value: "all", label: "Toutes", count: orders.length },
    {
      value: "pending",
      label: "En attente",
      count: orders.filter((o) => o.status === "pending").length,
    },
    {
      value: "paid",
      label: "Payées",
      count: orders.filter((o) => o.status === "paid").length,
    },
    {
      value: "in_production",
      label: "En production",
      count: orders.filter((o) => o.status === "in_production").length,
    },
    {
      value: "shipped",
      label: "Expédiées",
      count: orders.filter((o) => o.status === "shipped").length,
    },
    {
      value: "delivered",
      label: "Livrées",
      count: orders.filter((o) => o.status === "delivered").length,
    },
  ];

  const handleViewOrder = (order: (typeof orders)[0]) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      fetchOrders();
    } catch (error) {
      console.error("Error updating order:", error);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-ylang-charcoal mb-2 text-3xl font-bold">
            Commandes
          </h1>
          <p className="text-ylang-charcoal/60">
            {filteredOrders.length} commande(s) trouvée(s)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" onClick={fetchOrders}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualiser
          </Button>
          <Button variant="secondary" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Exporter CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="border-ylang-beige mb-6 rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex-1">
            <div className="relative">
              <Search className="text-ylang-charcoal/40 absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher par n° commande, client..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-ylang-beige focus:ring-ylang-rose/20 w-full rounded-xl border py-3 pr-4 pl-12 focus:ring-2 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value as OrderStatus | "all")}
              className={`rounded-xl px-4 py-2 text-sm font-medium whitespace-nowrap transition-all ${
                statusFilter === tab.value
                  ? "bg-ylang-rose text-white shadow-lg"
                  : "bg-ylang-beige text-ylang-charcoal hover:bg-[#e8dcc8]"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="text-ylang-rose h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="border-ylang-beige overflow-hidden rounded-2xl border bg-white shadow-sm">
          {filteredOrders.length === 0 ? (
            <div className="py-20 text-center">
              <Package className="text-ylang-charcoal/20 mx-auto mb-4 h-16 w-16" />
              <h3 className="text-ylang-charcoal mb-2 text-xl font-semibold">
                Aucune commande
              </h3>
              <p className="text-ylang-charcoal/60">
                Les commandes apparaîtront ici après les achats
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-ylang-cream">
                  <tr>
                    <th className="text-ylang-charcoal/60 px-6 py-4 text-left text-xs font-medium tracking-wider uppercase">
                      N° Commande
                    </th>
                    <th className="text-ylang-charcoal/60 px-6 py-4 text-left text-xs font-medium tracking-wider uppercase">
                      Client
                    </th>
                    <th className="text-ylang-charcoal/60 px-6 py-4 text-left text-xs font-medium tracking-wider uppercase">
                      Articles
                    </th>
                    <th className="text-ylang-charcoal/60 px-6 py-4 text-left text-xs font-medium tracking-wider uppercase">
                      Statut
                    </th>
                    <th className="text-ylang-charcoal/60 px-6 py-4 text-left text-xs font-medium tracking-wider uppercase">
                      Montant
                    </th>
                    <th className="text-ylang-charcoal/60 px-6 py-4 text-left text-xs font-medium tracking-wider uppercase">
                      Date
                    </th>
                    <th className="text-ylang-charcoal/60 px-6 py-4 text-left text-xs font-medium tracking-wider uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-ylang-beige divide-y">
                  {filteredOrders.map((order, index) => (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-ylang-cream transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-ylang-rose font-mono text-sm font-bold">
                          {order.orderNumber}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-ylang-charcoal text-sm font-medium">
                            {order.customerName}
                          </p>
                          <p className="text-ylang-charcoal/60 text-xs">
                            {order.customerEmail}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {order.items && order.items.length > 0 ? (
                          <>
                            <p className="text-ylang-charcoal text-sm">
                              {order.items[0]?.productName || "Produit"}
                            </p>
                            {order.items.length > 1 && (
                              <p className="text-ylang-charcoal/60 text-xs">
                                +{order.items.length - 1} autre(s)
                              </p>
                            )}
                          </>
                        ) : (
                          <p className="text-ylang-charcoal/60 text-sm">-</p>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-ylang-charcoal text-sm font-bold">
                          {order.total?.toFixed(2) || "0.00"}€
                        </span>
                      </td>
                      <td className="text-ylang-charcoal/60 px-6 py-4 text-sm whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewOrder(order)}
                            className="bg-ylang-beige text-ylang-charcoal flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm transition-colors hover:bg-[#e8dcc8]"
                          >
                            <Eye className="h-4 w-4" />
                            Voir
                          </button>
                          {order.status === "paid" && (
                            <button
                              onClick={() =>
                                handleUpdateStatus(order.id, "in_production")
                              }
                              className="rounded-lg bg-orange-100 px-3 py-1.5 text-sm text-orange-700 transition-colors hover:bg-orange-200"
                            >
                              Production
                            </button>
                          )}
                          {order.status === "in_production" && (
                            <button
                              onClick={() =>
                                handleUpdateStatus(order.id, "shipped")
                              }
                              className="rounded-lg bg-purple-100 px-3 py-1.5 text-sm text-purple-700 transition-colors hover:bg-purple-200"
                            >
                              Expédier
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Order Detail Modal */}
      <OrderDetailModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
}
