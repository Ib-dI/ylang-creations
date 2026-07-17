"use client";

import StatusBadge from "@/components/admin/status-badge";
import type { Order, OrderStatus } from "@/types/admin";
import { motion } from "framer-motion";
import { Download, Eye, Package, RefreshCw, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";

const STATUS_TABS: { value: OrderStatus | "all"; label: string }[] = [
  { value: "all", label: "Toutes" },
  { value: "pending", label: "En attente" },
  { value: "paid", label: "Payées" },
  { value: "in_production", label: "En production" },
  { value: "shipped", label: "Expédiées" },
  { value: "delivered", label: "Livrées" },
];

interface OrdersClientProps {
  initialOrders: Order[];
}

export function OrdersClient({ initialOrders }: OrdersClientProps) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = React.useState<OrderStatus | "all">(
    "all",
  );
  const [searchQuery, setSearchQuery] = React.useState("");

  let filteredOrders = initialOrders;
  if (statusFilter !== "all") {
    filteredOrders = filteredOrders.filter(
      (order) => order.status === statusFilter,
    );
  }
  if (searchQuery) {
    const lowerQuery = searchQuery.toLowerCase();
    filteredOrders = filteredOrders.filter(
      (order) =>
        order.orderNumber.toLowerCase().includes(lowerQuery) ||
        order.customerName.toLowerCase().includes(lowerQuery) ||
        order.customerEmail.toLowerCase().includes(lowerQuery),
    );
  }

  const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (response.ok) router.refresh();
    } catch (error) {
      console.error("Error updating order:", error);
    }
  };

  const handleExportCSV = () => {
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
    const escape = (field: string | undefined | null) => {
      if (!field) return "";
      return `"${String(field).replace(/"/g, '""')}"`;
    };
    const rows = filteredOrders.map((order) => {
      const itemsList = order.items
        .map(
          (i) =>
            `${i.quantity}x ${i.productName}${i.configuration ? ` (${i.configuration.fabricName})` : ""}`,
        )
        .join(", ");
      const addr = order.shippingAddress || {};
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
    const csvContent = "﻿" + [headers.join(";"), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `commandes_export_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p
            className="type-overline mb-2"
            style={{ color: "var(--color-accent)" }}
          >
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
            Commandes
          </h1>
          <p
            className="font-body mt-1 text-sm"
            style={{ color: "var(--color-ink-3)" }}
          >
            {filteredOrders.length} commande
            {filteredOrders.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={() => router.refresh()}
            className="font-body flex items-center gap-2 px-4 py-2 text-sm transition-opacity hover:opacity-70"
            style={{ border: "var(--rule-soft)", color: "var(--color-ink-3)" }}
          >
            <RefreshCw className="h-3.5 w-3.5" strokeWidth={1.5} />
            Actualiser
          </button>
          <button
            onClick={handleExportCSV}
            className="font-body flex items-center gap-2 px-4 py-2 text-sm transition-opacity hover:opacity-70"
            style={{ border: "var(--rule-soft)", color: "var(--color-ink-3)" }}
          >
            <Download className="h-3.5 w-3.5" strokeWidth={1.5} />
            Exporter
          </button>
        </div>
      </div>

      {/* Search + filters */}
      <div
        className="mb-6"
        style={{ border: "var(--rule-hair)", background: "var(--color-paper)" }}
      >
        <div className="px-6 py-4" style={{ borderBottom: "var(--rule-hair)" }}>
          <div className="relative">
            <Search
              className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
              style={{ color: "var(--color-ink-3)" }}
              strokeWidth={1.5}
            />
            <input
              type="text"
              placeholder="N° commande, client..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="font-body w-full py-2.5 pr-4 pl-9 text-sm outline-none"
              style={{
                border: "var(--rule-soft)",
                color: "var(--color-ink)",
                background: "var(--color-paper)",
              }}
            />
          </div>
        </div>

        <div className="flex gap-0 overflow-x-auto">
          {STATUS_TABS.map((tab) => {
            const count =
              tab.value === "all"
                ? initialOrders.length
                : initialOrders.filter((o) => o.status === tab.value).length;
            const isActive = statusFilter === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className="font-body flex shrink-0 items-center gap-2 px-5 py-3 text-sm whitespace-nowrap transition-colors"
                style={{
                  color: isActive ? "var(--color-ink)" : "var(--color-ink-3)",
                  borderBottom: isActive
                    ? "2px solid var(--color-ink)"
                    : "2px solid transparent",
                  background: isActive ? "var(--color-paper-2)" : "transparent",
                }}
              >
                {tab.label}
                <span
                  className="type-overline"
                  style={{
                    color: isActive ? "var(--color-ink)" : "var(--color-ink-3)",
                    opacity: isActive ? 1 : 0.6,
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      {filteredOrders.length === 0 ? (
        <div
          className="py-20 text-center"
          style={{
            border: "var(--rule-hair)",
            background: "var(--color-paper)",
          }}
        >
          <Package
            className="mx-auto mb-4 h-8 w-8"
            style={{ color: "var(--color-ink-3)", opacity: 0.3 }}
            strokeWidth={1}
          />
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 400,
              fontSize: "1rem",
              color: "var(--color-ink)",
              marginBottom: "0.25rem",
            }}
          >
            Aucune commande
          </p>
          <p
            className="font-body text-sm"
            style={{ color: "var(--color-ink-3)" }}
          >
            Les commandes apparaîtront ici après les achats
          </p>
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="space-y-3 lg:hidden">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                style={{
                  border: "var(--rule-hair)",
                  background: "var(--color-paper)",
                }}
              >
                <div
                  className="flex items-start justify-between p-4"
                  style={{ borderBottom: "var(--rule-soft)" }}
                >
                  <div>
                    <p
                      style={{
                        fontFamily: "var(--font-display)",
                        fontWeight: 400,
                        fontSize: "0.9375rem",
                        color: "var(--color-ink)",
                      }}
                    >
                      {order.orderNumber}
                    </p>
                    <p
                      className="font-body mt-0.5 text-xs"
                      style={{ color: "var(--color-ink-3)" }}
                    >
                      {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <StatusBadge status={order.status} />
                </div>

                <div className="flex items-center justify-between p-4">
                  <div>
                    <p
                      className="font-body text-sm font-medium"
                      style={{ color: "var(--color-ink)" }}
                    >
                      {order.customerName}
                    </p>
                    <p
                      className="font-body mt-0.5 text-xs"
                      style={{ color: "var(--color-ink-3)" }}
                    >
                      {order.items?.[0]?.productName || "Produit"}
                      {order.items?.length > 1
                        ? ` +${order.items.length - 1}`
                        : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      style={{
                        fontFamily: "var(--font-display)",
                        fontWeight: 400,
                        fontSize: "0.9375rem",
                        color: "var(--color-ink)",
                      }}
                    >
                      {order.total?.toFixed(2)} €
                    </span>
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="font-body flex items-center gap-1.5 px-3 py-1.5 text-xs transition-opacity hover:opacity-70"
                      style={{
                        border: "var(--rule-soft)",
                        color: "var(--color-ink-3)",
                      }}
                    >
                      <Eye className="h-3.5 w-3.5" strokeWidth={1.5} />
                      Voir
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div
            className="hidden overflow-hidden lg:block"
            style={{
              border: "var(--rule-hair)",
              background: "var(--color-paper)",
            }}
          >
            <table className="w-full">
              <thead>
                <tr style={{ background: "var(--color-paper-2)" }}>
                  {[
                    "N° Commande",
                    "Client",
                    "Articles",
                    "Statut",
                    "Montant",
                    "Date",
                    "Actions",
                  ].map((th) => (
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
                {filteredOrders.map((order, index) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25, delay: index * 0.03 }}
                    className="transition-colors hover:bg-[var(--color-paper-2)]"
                    style={{ borderTop: "var(--rule-soft)" }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-body text-sm transition-opacity hover:opacity-70"
                        style={{
                          color: "var(--color-ink)",
                          borderBottom: "1px solid var(--color-accent)",
                        }}
                      >
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <p
                        className="font-body text-sm font-medium"
                        style={{ color: "var(--color-ink)" }}
                      >
                        {order.customerName}
                      </p>
                      <p
                        className="font-body mt-0.5 text-xs"
                        style={{ color: "var(--color-ink-3)" }}
                      >
                        {order.customerEmail}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      {order.items?.length > 0 ? (
                        <>
                          <p
                            className="font-body text-sm"
                            style={{ color: "var(--color-ink)" }}
                          >
                            {order.items[0]?.productName || "Produit"}
                          </p>
                          {order.items.length > 1 && (
                            <p
                              className="font-body mt-0.5 text-xs"
                              style={{ color: "var(--color-ink-3)" }}
                            >
                              +{order.items.length - 1} autre
                              {order.items.length > 2 ? "s" : ""}
                            </p>
                          )}
                        </>
                      ) : (
                        <span
                          className="font-body text-sm"
                          style={{ color: "var(--color-ink-3)" }}
                        >
                          —
                        </span>
                      )}
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
                        {order.total?.toFixed(2) || "0.00"} €
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className="font-body text-sm"
                        style={{ color: "var(--color-ink-3)" }}
                      >
                        {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="font-body flex items-center gap-1.5 px-3 py-1.5 text-xs transition-opacity hover:opacity-70"
                          style={{
                            border: "var(--rule-soft)",
                            color: "var(--color-ink-3)",
                          }}
                        >
                          <Eye className="h-3.5 w-3.5" strokeWidth={1.5} />
                          Voir
                        </Link>
                        {order.status === "paid" && (
                          <button
                            onClick={() =>
                              handleUpdateStatus(order.id, "in_production")
                            }
                            className="font-body px-3 py-1.5 text-xs transition-opacity hover:opacity-70"
                            style={{
                              border: "var(--rule-soft)",
                              color: "var(--color-ink-3)",
                            }}
                          >
                            → Production
                          </button>
                        )}
                        {order.status === "in_production" && (
                          <button
                            onClick={() =>
                              handleUpdateStatus(order.id, "shipped")
                            }
                            className="font-body px-3 py-1.5 text-xs transition-opacity hover:opacity-70"
                            style={{
                              border: "var(--rule-soft)",
                              color: "var(--color-ink-3)",
                            }}
                          >
                            → Expédier
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
