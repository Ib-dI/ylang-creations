"use client";

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
import Link from "next/link";
import * as React from "react";

export default function OrdersPage() {
  const { orders, setOrders, filterByStatus, searchOrders, updateOrderStatus } =
    useAdminStore();
  const [statusFilter, setStatusFilter] = React.useState<OrderStatus | "all">(
    "all",
  );
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filteredOrders, setFilteredOrders] = React.useState(orders);
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

  const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        updateOrderStatus(orderId, status);
      }
    } catch (error) {
      console.error("Error updating order:", error);
    }
  };

  const handleExportCSV = () => {
    // Define headers
    const headers = [
      "No Commande",
      "Date",
      "Client",
      "Email",
      "Statut",
      "Total",
      "Rue",
      "Code Postal",
      "Ville",
      "Pays",
      "Articles",
    ];

    // Format data rows
    const rows = filteredOrders.map((order) => {
      const itemsList = order.items
        .map(
          (i) =>
            `${i.quantity}x ${i.productName} ${i.configuration ? `(${i.configuration.fabricName})` : ""}`,
        )
        .join(", ");

      const addr = order.shippingAddress || {};

      // Helper to escape CSV fields
      const escape = (field: string | undefined | null) => {
        if (!field) return "";
        return `"${String(field).replace(/"/g, '""')}"`;
      };

      return [
        escape(order.orderNumber),
        escape(new Date(order.createdAt).toLocaleDateString("fr-FR")),
        escape(order.customerName),
        escape(order.customerEmail),
        escape(order.status),
        escape(order.total.toFixed(2).replace(".", ",")),
        escape(addr.address),
        escape(addr.postalCode),
        escape(addr.city),
        escape(addr.country),
        escape(itemsList),
      ].join(";");
    });

    // Combine headers and rows
    const csvContent = "\uFEFF" + [headers.join(";"), ...rows].join("\n"); // Add BOM and use semicolon

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `commandes_export_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="">
      <div className="mb-6 lg:mb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-ylang-charcoal mb-1 text-2xl font-bold sm:text-3xl">
              Commandes
            </h1>
            <p className="text-ylang-charcoal/60 text-xs sm:text-sm">
              {filteredOrders.length} commande(s)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={fetchOrders}
              className="flex-1 lg:flex-none"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              <span className="lg:inline">Actualiser</span>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExportCSV}
              className="flex-1 lg:flex-none"
            >
              <Download className="mr-2 h-4 w-4" />
              <span className="sm:inline">Exporter</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="border-ylang-beige mb-6 rounded-2xl border bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="text-ylang-charcoal/40 absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 lg:left-4 lg:h-5 lg:w-5" />
              <input
                type="text"
                placeholder="N° commande, client..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-ylang-beige focus:ring-ylang-rose/20 h-10 w-full rounded-xl border pr-4 pl-9 text-sm focus:ring-2 focus:outline-none lg:h-12 lg:pl-12"
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

      {/* Orders View */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="text-ylang-rose h-8 w-8 animate-spin" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="border-ylang-beige rounded-2xl border bg-white py-20 text-center">
          <Package className="text-ylang-charcoal/20 mx-auto mb-4 h-12 w-12" />
          <h3 className="text-ylang-charcoal mb-2 text-xl font-semibold">
            Aucune commande
          </h3>
          <p className="text-ylang-charcoal/60 text-sm">
            Les commandes apparaîtront ici après les achats
          </p>
        </div>
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="space-y-4 lg:hidden">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="border-ylang-beige rounded-2xl border bg-white p-4 shadow-sm"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex flex-col">
                    <span className="text-ylang-rose font-mono text-sm font-bold">
                      {order.orderNumber}
                    </span>
                    <span className="text-ylang-charcoal/40 text-[10px] uppercase">
                      {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                  <StatusBadge status={order.status} />
                </div>

                <div className="mb-4 border-t pt-3">
                  <div className="flex justify-between">
                    <div>
                      <p className="text-ylang-charcoal text-sm font-semibold">
                        {order.customerName}
                      </p>
                      <p className="text-ylang-charcoal/60 text-xs">
                        {order.items && order.items.length > 0
                          ? order.items[0].productName
                          : "Produit"}
                        {order.items && order.items.length > 1
                          ? ` (+${order.items.length - 1})`
                          : ""}
                      </p>
                    </div>
                    <p className="text-ylang-charcoal text-base font-bold">
                      {order.total?.toFixed(2)}€
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="bg-ylang-beige text-ylang-charcoal flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-sm font-medium transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    Voir détails
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="border-ylang-beige hidden overflow-hidden rounded-2xl border bg-white shadow-sm lg:block">
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
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="bg-ylang-beige text-ylang-charcoal flex items-center gap-1 rounded-lg px-3 py-1 text-sm transition-colors hover:bg-[#e8dcc8]"
                          >
                            <Eye className="h-4 w-4" />
                            Voir
                          </Link>
                          {order.status === "paid" && (
                            <button
                              onClick={() =>
                                handleUpdateStatus(order.id, "in_production")
                              }
                              className="rounded-lg border border-orange-200 bg-orange-100 px-3 py-1 text-sm text-orange-700 transition-colors hover:bg-orange-200"
                            >
                              Production
                            </button>
                          )}
                          {order.status === "in_production" && (
                            <button
                              onClick={() =>
                                handleUpdateStatus(order.id, "shipped")
                              }
                              className="rounded-lg border border-purple-200 bg-purple-100 px-3 py-1 text-sm text-purple-700 transition-colors hover:bg-purple-200"
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
          </div>
        </>
      )}
    </div>
  );
}
