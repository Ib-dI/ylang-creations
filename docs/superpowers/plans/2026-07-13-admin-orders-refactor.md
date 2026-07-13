# Admin Orders Page Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the Server-Component-fetch pattern established in the admin dashboard refactor (`docs/superpowers/plans/2026-07-13-admin-loading-refactor.md`) to `/admin/orders`: eliminate its client-side `useEffect` + `fetch("/api/admin/orders")` waterfall, replacing it with server-side data fetching and a layout-matching loading skeleton.

**Architecture:** `app/admin/orders/page.tsx` becomes an `async` Server Component that calls `getOrdersData()` — already built and merged in the dashboard refactor, at `lib/admin/get-orders-data.ts`, reused here **unchanged** — and passes the result as `initialOrders` to a new `components/admin/orders-client.tsx`. The client component keeps all interactive JSX (search, status-tab filter, CSV export, per-row status-advance buttons) but derives its filtered view from the `initialOrders` prop instead of a Zustand store populated by its own fetch. Status-update mutations still go through `PATCH /api/admin/orders/:id` (unchanged API route), followed by `router.refresh()` to re-run the Server Component and get fresh data — this repo's established post-mutation resync pattern (see the dashboard plan's Global Constraints / the `/grill-me` session that set it). `app/admin/orders/loading.tsx` becomes a skeleton matching the real page (search bar, status tabs, table rows) instead of the current single centered spinner.

**Tech Stack:** Next.js 16 App Router, Drizzle ORM (via the existing `getOrdersData`), Tailwind CSS v4, Framer Motion.

## Global Constraints

- No test framework exists in this repo (`package.json` has no test script) — verification is `pnpm build` and manual dev-server checks.
- `pnpm lint` has ~152 pre-existing errors unrelated to this work (confirmed during the dashboard refactor) — do not treat pre-existing lint debt outside touched files as a regression, but new code in this plan should not add fresh `no-explicit-any` violations (unlike `get-orders-data.ts`, this plan's new files don't touch raw DB rows, so this should be moot).
- `getOrdersData()`'s signature (`Promise<Order[]>`, sorted newest-first, from `lib/admin/get-orders-data.ts`) must not change — it's shared with the dashboard, which is already in production use of it.
- Mutations keep calling the existing `/api/admin/orders/:id` PATCH route (not touched by this plan) — after a successful mutation, call `router.refresh()` rather than mutating local state, so the Server Component re-fetches from the DB.
- `app/admin/orders/[id]/page.tsx` (the order detail page) is out of scope — confirmed it fetches its own data independently via `/api/admin/orders/${params.id}` and only reads `updateOrderStatus`/`addTrackingNumber` from the Zustand store (local-state mutators, not populated by the list page), so nothing in this plan affects it.
- Do not touch `lib/store/admin-store.ts` — `OrdersClient` in this plan stops *consuming* it (derives filtering from props instead), but the store itself stays as-is since `app/admin/orders/[id]/page.tsx` still uses it.

---

### Task 1: Create `components/admin/orders-client.tsx`

**Files:**
- Create: `components/admin/orders-client.tsx`

**Interfaces:**
- Consumes: `Order`/`OrderStatus` types from `@/types/admin`, `StatusBadge` from `@/components/admin/status-badge` (unchanged).
- Produces: `OrdersClient({ initialOrders }: { initialOrders: Order[] })` — a client component with no data-fetching of its own. Task 3 renders this with the output of `getOrdersData()`.

- [ ] **Step 1: Write the component**

This is the current `app/admin/orders/page.tsx` body with the Zustand-store-backed fetch/filter effects replaced by prop-derived filtering, and the status-update handler switched from local store mutation to `router.refresh()`.

```tsx
"use client";

import StatusBadge from "@/components/admin/status-badge";
import type { Order, OrderStatus } from "@/types/admin";
import { motion } from "framer-motion";
import {
  Download,
  Eye,
  Package,
  RefreshCw,
  Search,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";

const STATUS_TABS: { value: OrderStatus | "all"; label: string }[] = [
  { value: "all",           label: "Toutes" },
  { value: "pending",       label: "En attente" },
  { value: "paid",          label: "Payées" },
  { value: "in_production", label: "En production" },
  { value: "shipped",       label: "Expédiées" },
  { value: "delivered",     label: "Livrées" },
];

interface OrdersClientProps {
  initialOrders: Order[];
}

export function OrdersClient({ initialOrders }: OrdersClientProps) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = React.useState<OrderStatus | "all">("all");
  const [searchQuery, setSearchQuery] = React.useState("");

  let filteredOrders = initialOrders;
  if (statusFilter !== "all") {
    filteredOrders = filteredOrders.filter((order) => order.status === statusFilter);
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
    const headers = ["No Commande", "Date", "Client", "Email", "Statut", "Total", "Rue", "Code Postal", "Ville", "Pays", "Articles"];
    const escape = (field: string | undefined | null) => {
      if (!field) return "";
      return `"${String(field).replace(/"/g, '""')}"`;
    };
    const rows = filteredOrders.map((order) => {
      const itemsList = order.items
        .map((i) => `${i.quantity}x ${i.productName}${i.configuration ? ` (${i.configuration.fabricName})` : ""}`)
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
            Commandes
          </h1>
          <p className="font-body mt-1 text-sm" style={{ color: "var(--color-ink-3)" }}>
            {filteredOrders.length} commande{filteredOrders.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={() => router.refresh()}
            className="flex items-center gap-2 px-4 py-2 font-body text-sm transition-opacity hover:opacity-70"
            style={{ border: "var(--rule-soft)", color: "var(--color-ink-3)" }}
          >
            <RefreshCw className="h-3.5 w-3.5" strokeWidth={1.5} />
            Actualiser
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 font-body text-sm transition-opacity hover:opacity-70"
            style={{ border: "var(--rule-soft)", color: "var(--color-ink-3)" }}
          >
            <Download className="h-3.5 w-3.5" strokeWidth={1.5} />
            Exporter
          </button>
        </div>
      </div>

      {/* Search + filters */}
      <div className="mb-6" style={{ border: "var(--rule-hair)", background: "var(--color-paper)" }}>
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
            const count = tab.value === "all" ? initialOrders.length : initialOrders.filter((o) => o.status === tab.value).length;
            const isActive = statusFilter === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className="flex shrink-0 items-center gap-2 px-5 py-3 font-body text-sm whitespace-nowrap transition-all"
                style={{
                  color: isActive ? "var(--color-ink)" : "var(--color-ink-3)",
                  borderBottom: isActive ? "2px solid var(--color-ink)" : "2px solid transparent",
                  background: isActive ? "var(--color-paper-2)" : "transparent",
                }}
              >
                {tab.label}
                <span
                  className="type-overline"
                  style={{ color: isActive ? "var(--color-ink)" : "var(--color-ink-3)", opacity: isActive ? 1 : 0.6 }}
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
          style={{ border: "var(--rule-hair)", background: "var(--color-paper)" }}
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
          <p className="font-body text-sm" style={{ color: "var(--color-ink-3)" }}>
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
                style={{ border: "var(--rule-hair)", background: "var(--color-paper)" }}
              >
                <div className="flex items-start justify-between p-4" style={{ borderBottom: "var(--rule-soft)" }}>
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
                    <p className="font-body mt-0.5 text-xs" style={{ color: "var(--color-ink-3)" }}>
                      {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <StatusBadge status={order.status} />
                </div>

                <div className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-body text-sm font-medium" style={{ color: "var(--color-ink)" }}>
                      {order.customerName}
                    </p>
                    <p className="font-body mt-0.5 text-xs" style={{ color: "var(--color-ink-3)" }}>
                      {order.items?.[0]?.productName || "Produit"}
                      {order.items?.length > 1 ? ` +${order.items.length - 1}` : ""}
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
                      className="flex items-center gap-1.5 px-3 py-1.5 font-body text-xs transition-opacity hover:opacity-70"
                      style={{ border: "var(--rule-soft)", color: "var(--color-ink-3)" }}
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
            style={{ border: "var(--rule-hair)", background: "var(--color-paper)" }}
          >
            <table className="w-full">
              <thead>
                <tr style={{ background: "var(--color-paper-2)" }}>
                  {["N° Commande", "Client", "Articles", "Statut", "Montant", "Date", "Actions"].map((th) => (
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
                        style={{ color: "var(--color-ink)", borderBottom: "1px solid var(--color-accent)" }}
                      >
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-body text-sm font-medium" style={{ color: "var(--color-ink)" }}>
                        {order.customerName}
                      </p>
                      <p className="font-body mt-0.5 text-xs" style={{ color: "var(--color-ink-3)" }}>
                        {order.customerEmail}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      {order.items?.length > 0 ? (
                        <>
                          <p className="font-body text-sm" style={{ color: "var(--color-ink)" }}>
                            {order.items[0]?.productName || "Produit"}
                          </p>
                          {order.items.length > 1 && (
                            <p className="font-body mt-0.5 text-xs" style={{ color: "var(--color-ink-3)" }}>
                              +{order.items.length - 1} autre{order.items.length > 2 ? "s" : ""}
                            </p>
                          )}
                        </>
                      ) : (
                        <span className="font-body text-sm" style={{ color: "var(--color-ink-3)" }}>—</span>
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
                      <span className="font-body text-sm" style={{ color: "var(--color-ink-3)" }}>
                        {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 font-body text-xs transition-opacity hover:opacity-70"
                          style={{ border: "var(--rule-soft)", color: "var(--color-ink-3)" }}
                        >
                          <Eye className="h-3.5 w-3.5" strokeWidth={1.5} />
                          Voir
                        </Link>
                        {order.status === "paid" && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, "in_production")}
                            className="px-3 py-1.5 font-body text-xs transition-opacity hover:opacity-70"
                            style={{ border: "var(--rule-soft)", color: "var(--color-ink-3)" }}
                          >
                            → Production
                          </button>
                        )}
                        {order.status === "in_production" && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, "shipped")}
                            className="px-3 py-1.5 font-body text-xs transition-opacity hover:opacity-70"
                            style={{ border: "var(--rule-soft)", color: "var(--color-ink-3)" }}
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
```

- [ ] **Step 2: Typecheck**

Run: `pnpm build`
Expected: fails at this point only because `app/admin/orders/page.tsx` (Task 3) doesn't import `OrdersClient` yet — confirm the error is scoped there, not to this new file.

- [ ] **Step 3: Commit**

```bash
git add components/admin/orders-client.tsx
git commit -m "feat(admin): extract orders list UI into OrdersClient component"
```

---

### Task 2: Convert `app/admin/orders/page.tsx` to a Server Component

**Files:**
- Modify: `app/admin/orders/page.tsx` (full rewrite)

**Interfaces:**
- Consumes: `getOrdersData` from `@/lib/admin/get-orders-data` (already exists, unchanged), `OrdersClient` (Task 1).
- Produces: default export `OrdersPage` — unchanged route contract for `/admin/orders`.

- [ ] **Step 1: Replace the file contents**

```tsx
import { OrdersClient } from "@/components/admin/orders-client";
import { getOrdersData } from "@/lib/admin/get-orders-data";

export default async function OrdersPage() {
  const orders = await getOrdersData();

  return <OrdersClient initialOrders={orders} />;
}
```

- [ ] **Step 2: Typecheck and build**

Run: `pnpm build`
Expected: succeeds with no errors.

- [ ] **Step 3: Commit**

```bash
git add app/admin/orders/page.tsx
git commit -m "refactor(admin): convert orders list to a Server Component with server-side data fetching"
```

---

### Task 3: Replace `app/admin/orders/loading.tsx` with a layout-matching skeleton

**Files:**
- Create: `app/admin/orders/loading.tsx` (this route currently has no `loading.tsx` of its own — it inherits `app/admin/loading.tsx`, the dashboard skeleton, which is the wrong shape for this page; a route-local `loading.tsx` overrides it for this segment)

**Interfaces:**
- Consumes: nothing (static skeleton, no props).
- Produces: nothing consumed elsewhere — this is the Suspense fallback Next.js renders automatically while `app/admin/orders/page.tsx`'s `await getOrdersData()` is pending.

- [ ] **Step 1: Write the file**

Mirrors the real layout: header, search bar, 6-tab status filter row, 6 desktop table rows (skeleton doesn't need to replicate the mobile-card breakpoint — the table skeleton is representative enough for both, matching the level of fidelity used in the dashboard skeleton).

```tsx
export default function Loading() {
  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 h-3 w-24 animate-pulse" style={{ background: "var(--color-paper-2)" }} />
          <div className="mb-1 h-8 w-40 animate-pulse" style={{ background: "var(--color-paper-2)" }} />
          <div className="h-3 w-20 animate-pulse" style={{ background: "var(--color-paper-2)" }} />
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <div className="h-9 w-28 animate-pulse" style={{ background: "var(--color-paper-2)" }} />
          <div className="h-9 w-28 animate-pulse" style={{ background: "var(--color-paper-2)" }} />
        </div>
      </div>

      <div className="mb-6" style={{ border: "var(--rule-hair)", background: "var(--color-paper)" }}>
        <div className="px-6 py-4" style={{ borderBottom: "var(--rule-hair)" }}>
          <div className="h-9 w-full max-w-sm animate-pulse" style={{ background: "var(--color-paper-2)" }} />
        </div>
        <div className="flex gap-0 overflow-x-auto px-2 py-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="mx-3 h-4 w-16 animate-pulse" style={{ background: "var(--color-paper-2)" }} />
          ))}
        </div>
      </div>

      <div style={{ border: "var(--rule-hair)", background: "var(--color-paper)" }}>
        <div className="px-6 py-3" style={{ background: "var(--color-paper-2)" }}>
          <div className="h-3 w-full animate-pulse" style={{ background: "var(--color-paper-3, var(--color-paper))" }} />
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between px-6 py-4"
            style={{ borderTop: i === 0 ? "none" : "var(--rule-soft)" }}
          >
            <div className="h-4 w-24 animate-pulse" style={{ background: "var(--color-paper-2)" }} />
            <div className="h-4 w-32 animate-pulse" style={{ background: "var(--color-paper-2)" }} />
            <div className="h-4 w-16 animate-pulse" style={{ background: "var(--color-paper-2)" }} />
            <div className="h-4 w-20 animate-pulse" style={{ background: "var(--color-paper-2)" }} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Build**

Run: `pnpm build`
Expected: succeeds.

- [ ] **Step 3: Commit**

```bash
git add app/admin/orders/loading.tsx
git commit -m "feat(admin): add layout-matching loading skeleton for orders list"
```

---

### Task 4: End-to-end manual verification

**Files:** none (verification only)

- [ ] **Step 1: Cold-load check**

Run `pnpm dev`. Signed in as admin, hard-refresh `/admin/orders`. Confirm the orders skeleton (Task 3) appears briefly, then the real table renders with data matching what the dashboard's "Commandes récentes" shows for the same orders.

- [ ] **Step 2: Filter/search check**

Type in the search box and click through status tabs; confirm `filteredOrders` updates correctly and the counts next to each tab (from `initialOrders`, not `filteredOrders`) stay stable while filtering.

- [ ] **Step 3: Mutation + resync check**

On an order with status `paid`, click "→ Production". Confirm the page shows a `router.refresh()` round-trip (network tab: a fetch to `/admin/orders` RSC payload after the PATCH resolves) and the row's status badge updates to `in_production` without a full page reload.

- [ ] **Step 4: Full lint + build pass**

Run: `pnpm build`
Expected: clean (lint is not a gate in this repo per the dashboard refactor's established baseline).

- [ ] **Step 5: Report back**

Summarize verification results before starting the next page in the sequence (products — the largest remaining page, with heavy image-upload and multi-tab-form mutation logic).
