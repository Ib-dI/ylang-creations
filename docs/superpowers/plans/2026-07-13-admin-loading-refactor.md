# Admin Loading Refactor — Phase 0+1 (Middleware + Dashboard Pilot) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate the double client-side waterfall on `/admin/*` (client auth check → client data fetch) by removing the now-redundant client-side auth gate and converting the dashboard page to the Server-Component-fetch pattern already used by `/configurateur` and `/admin/settings`.

**Architecture:** **Correction (discovered mid-execution of Task 1):** this repo already migrated `middleware.ts` → `proxy.ts` (Next.js 16's renamed convention, done in commit `62ef5c9`), and `proxy.ts` → `utils/supabase/middleware.ts`'s `updateSession()` **already gates every `/admin/*` and `/api/admin/*` request server-side** (redirects unauthenticated users to `/sign-in`, non-admins to `/`, returns 401/403 JSON for API routes) — this was true before this plan was written; the original research for this plan only searched for a file literally named `middleware.ts` and missed it. There is nothing to add here: Task 1 is now a verification-only task confirming this existing gate covers `/admin` correctly, not a task that creates new code. The client-side `supabase.auth.getUser()` check in `app/admin/layout.tsx` was therefore **always fully redundant** with `proxy.ts` — not newly redundant — which only strengthens the case for removing it in Task 2. `app/admin/page.tsx` becomes an `async` Server Component that queries the DB directly via a new `lib/admin/get-dashboard-data.ts` (built on a new, reusable `lib/admin/get-orders-data.ts`) and passes the result as props to a new `components/admin/dashboard-client.tsx`, which keeps all the existing interactive JSX but no longer fetches on mount. `app/admin/loading.tsx` becomes a skeleton matching the dashboard's real layout instead of the current generic `PremiumLoader` spinner. Mutations (none on the dashboard itself) are out of scope for this phase.

**Tech Stack:** Next.js 16 App Router, Drizzle ORM, `@supabase/ssr` (already a dependency), Zod (unused in this phase), Tailwind CSS v4.

## Global Constraints

- Prices are stored in cents in the DB. Per `CONTEXT.md`'s **Price** entry, conversion must go through `cents()`/`euros()`/`centsToEuros()`/`eurosToCents()` from `lib/currency.ts` — never a raw `/100` or `*100`. (`/api/admin/orders/route.ts` currently violates this with a raw `/100`; that pre-existing route is out of scope for this refactor, but the new `lib/admin/get-orders-data.ts` in Task 3 must not repeat the violation.)
- French language for all UI strings and code comments, per `CLAUDE.md`.
- No test framework exists in this repo (`package.json` has no test script) — verification is `pnpm build`, `pnpm lint`, and manual dev-server checks (curl for middleware, browser for the dashboard).
- Auth role check convention (already established in `utils/supabase/middleware.ts`'s `updateSession()`, `lib/auth/with-admin-auth.ts`, and the current `app/admin/layout.tsx`): a request is authorized only if `user` exists AND `user.app_metadata?.role === "admin"`.
- Do not create a `middleware.ts` file — Next.js 16 rejects having both `middleware.ts` and `proxy.ts` present (`"Both middleware file "./middleware.ts" and proxy file "./proxy.ts" are detected. Please use "./proxy.ts" only."`). Any change to the request-level auth gate belongs in `proxy.ts` / `utils/supabase/middleware.ts`, not a new file.
- Do not touch `/api/admin/*` route handlers — they keep their own `withAdminAuth` wrapper and remain callable independently (per project decision: GET handlers stay as-is even once unused by the frontend).

---

### Task 1: Verify the existing `proxy.ts` gate covers `/admin` (no new code)

**Correction:** this task originally planned to create `middleware.ts`. Mid-execution, the implementer found that `proxy.ts` already exists (Next.js 16's renamed `middleware.ts` convention) and its `updateSession()` (in `utils/supabase/middleware.ts`) already performs this exact check for both `/admin/*` and `/api/admin/*`:

```ts
// utils/supabase/middleware.ts — already in the codebase, unchanged by this task
const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
const isAdminApiRoute = request.nextUrl.pathname.startsWith("/api/admin");

if (isAdminRoute || isAdminApiRoute) {
  if (!user) {
    if (isAdminApiRoute) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const url = request.nextUrl.clone();
    url.pathname = "/sign-in";
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  if (user.app_metadata?.role !== "admin") {
    if (isAdminApiRoute) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }
}
```

`proxy.ts`'s matcher (`"/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"`) covers `/admin` — there is no gap to fill. **Do not create a `middleware.ts` file** — Next.js 16 refuses to build with both `middleware.ts` and `proxy.ts` present. This task is now verification-only.

**Files:** none (no code changes)

**Interfaces:**
- Consumes: nothing new.
- Produces: nothing new. Later tasks (dashboard Server Component, Task 2's layout cleanup) rely on the *existing* `proxy.ts` gate's side effect: by the time `app/admin/page.tsx` or `app/admin/layout.tsx` runs, the request is already guaranteed to be from an authenticated admin.

- [ ] **Step 1: Confirm no stray `middleware.ts` exists**

```bash
ls middleware.ts 2>/dev/null && echo "CONFLICT: remove this file" || echo "clean, as expected"
```
Expected: `clean, as expected`.

- [ ] **Step 2: Build**

Run: `pnpm build`
Expected: succeeds (this confirms `proxy.ts` and `middleware.ts` aren't both present, among the usual checks).

- [ ] **Step 3: Verify the redirect manually**

Run: `pnpm dev` (in one terminal), then in another:
```bash
curl -sI http://localhost:3000/admin | head -5
```
Expected: a redirect status (302/307) with a `location: /sign-in?next=%2Fadmin` header, since the curl request carries no Supabase auth cookies. This confirms the *existing* `proxy.ts` gate, not new code from this task.

Then sign in as the admin account in a browser and confirm `/admin` loads normally (no redirect loop, sidebar renders).

- [ ] **Step 4: No commit** — this task makes no code changes. Skip straight to Task 2.

---

### Task 2: Strip the client-side auth gate from `app/admin/layout.tsx`

**Files:**
- Modify: `app/admin/layout.tsx:1-62` (imports and the `AdminLayout` function body up to the `handleLogout` definition)
- Delete: `components/admin/premium-loader.tsx` (verified via `grep -rl "components/admin/premium-loader"` that `app/admin/layout.tsx` is its only consumer; once this task removes that usage it becomes dead code)

**Interfaces:**
- Consumes: the existing `proxy.ts` gate confirmed in Task 1 (auth is guaranteed before this component renders — has been true all along, not a new guarantee from this plan).
- Produces: `AdminLayout` still exports the same sidebar/shell UI; no other file imports `AdminLayout` directly (it's the implicit Next.js layout for the `/admin` segment), so no downstream signature to preserve.

- [ ] **Step 1: Remove the auth-gating imports and state**

In `app/admin/layout.tsx`, replace:

```tsx
"use client";

import { PremiumLoader } from "@/components/admin/premium-loader";
import { SidebarToggle } from "@/components/admin/sidebar-toggle";
import { createClient } from "@/utils/supabase/client";
import { Session } from "@supabase/supabase-js";
import {
```

with:

```tsx
"use client";

import { SidebarToggle } from "@/components/admin/sidebar-toggle";
import { createClient } from "@/utils/supabase/client";
import {
```

Replace:

```tsx
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Toaster } from "sonner";
```

with:

```tsx
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Toaster } from "sonner";
```

- [ ] **Step 2: Remove the auth-check effect and the loading/session guards**

Replace:

```tsx
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { push } = useRouter();
  const supabase = createClient();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { push("/sign-in"); return; }
      if (user.app_metadata?.role !== "admin") { push("/"); return; }
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };
    checkAuth();
  }, [push, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    push("/");
  };

  if (loading) return <PremiumLoader />;
  if (!session) return null;

  return (
```

with:

```tsx
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { push } = useRouter();
  const supabase = createClient();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    push("/");
  };

  return (
```

(The rest of the file — sidebar markup, nav items, mobile menu, `<main>{children}</main>`, `<Toaster />` — is unchanged.)

- [ ] **Step 3: Delete the now-orphaned component**

```bash
rm components/admin/premium-loader.tsx
```

- [ ] **Step 4: Typecheck, build, and lint**

Run: `pnpm build && pnpm lint`
Expected: both succeed — no unused-import errors (ESLint would flag a leftover unused `useEffect`/`Session`/`PremiumLoader` import if the edits above were incomplete), no missing-module error for the deleted component.

- [ ] **Step 5: Manual check**

With `pnpm dev` running and signed in as admin, navigate to `/admin`: sidebar should render immediately with no `PremiumLoader` flash (middleware already gated the request before the page streamed).

- [ ] **Step 6: Commit**

```bash
git add app/admin/layout.tsx
git rm components/admin/premium-loader.tsx
git commit -m "refactor(admin): remove client-side auth gate now that middleware handles it"
```

---

### Task 3: Create `lib/admin/get-orders-data.ts` (shared order formatter)

**Files:**
- Create: `lib/admin/get-orders-data.ts`

**Interfaces:**
- Consumes: `db` from `@/lib/db`, `customer`/`order` tables from `@/db/schema`, `Order`/`OrderStatus` types from `@/types/admin`.
- Produces: `getOrdersData(): Promise<Order[]>`, sorted newest-first, formatted identically to the current `GET /api/admin/orders` handler (same `orderNumber` derivation, same address/items parsing, same `paymentStatus` heuristic). **This function's signature must stay stable** — Phase 2 will import it unchanged for `app/admin/orders/page.tsx`.

- [ ] **Step 1: Write the function**

```ts
import { customer, order } from "@/db/schema";
import { db } from "@/lib/db";
import { cents, centsToEuros } from "@/lib/currency";
import { desc, eq } from "drizzle-orm";
import type { Order } from "@/types/admin";

export async function getOrdersData(): Promise<Order[]> {
  const rows = await db
    .select({
      id: order.id,
      status: order.status,
      totalAmount: order.totalAmount,
      shippingAddress: order.shippingAddress,
      items: order.items,
      trackingNumber: order.trackingNumber,
      notes: order.notes,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      customerEmail: customer.email,
      customerName: customer.name,
    })
    .from(order)
    .leftJoin(customer, eq(order.customerId, customer.id))
    .orderBy(desc(order.createdAt));

  return rows.map((o) => {
    let parsedItems: Order["items"] = [];
    try {
      const rawItems = (o.items as any[]) ?? [];
      parsedItems = rawItems.map((item: any) => ({
        productName: item.productName || item.name || "Produit",
        quantity: item.quantity,
        price: item.price,
        image: item.image || item.thumbnail || undefined,
        configuration: item.configuration || undefined,
      }));
    } catch {
      parsedItems = [];
    }

    let parsedAddress: Order["shippingAddress"];
    try {
      const rawAddress = (o.shippingAddress as Record<string, any>) ?? {};
      const stripeAddress = rawAddress.address || rawAddress;
      parsedAddress = {
        address:
          stripeAddress.line1 +
          (stripeAddress.line2 ? `, ${stripeAddress.line2}` : ""),
        city: stripeAddress.city || "",
        postalCode: stripeAddress.postal_code || "",
        country: stripeAddress.country || "",
      };
    } catch {
      parsedAddress = { address: "Inconnue", city: "", postalCode: "", country: "" };
    }

    return {
      id: o.id,
      orderNumber: `YC${o.id.slice(0, 8).toUpperCase()}`,
      customerName: o.customerName || "Client",
      customerEmail: o.customerEmail || "",
      items: parsedItems,
      total: centsToEuros(cents(o.totalAmount)),
      status: o.status as Order["status"],
      paymentStatus: o.status === "pending" ? "pending" : "paid",
      shippingAddress: parsedAddress,
      trackingNumber: o.trackingNumber ?? undefined,
      notes: o.notes ?? undefined,
      createdAt: o.createdAt,
      updatedAt: o.updatedAt,
    };
  });
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm build`
Expected: no type errors (in particular, no "null is not assignable to type string | undefined" on `trackingNumber`/`notes`/`image`/`configuration` — the `?? undefined` / `|| undefined` coercions above are required for this).

- [ ] **Step 3: Commit**

```bash
git add lib/admin/get-orders-data.ts
git commit -m "feat(admin): add getOrdersData for server-side order fetching"
```

---

### Task 4: Create `lib/admin/get-dashboard-data.ts`

**Files:**
- Create: `lib/admin/get-dashboard-data.ts`

**Interfaces:**
- Consumes: `getOrdersData` from Task 3, `DashboardStats`/`Order` types from `@/types/admin`.
- Produces: `getDashboardData(): Promise<DashboardData>` where
  ```ts
  interface DashboardData {
    stats: DashboardStats & { thisMonthRevenue: number };
    chartData: { name: string; revenue: number }[];
    recentOrders: Order[]; // exactly 5, unfiltered by status, newest first
  }
  ```
  Task 6 (`app/admin/page.tsx`) and Task 5 (`DashboardClient` props) both depend on this exact shape.

- [ ] **Step 1: Write the function**

This reproduces the stat/chart computation currently done client-side in `app/admin/page.tsx`'s `fetchOrders` (same `validOrders` filter, same month-window logic), just moved server-side and fed by `getOrdersData()` instead of `fetch("/api/admin/orders")`.

```ts
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
```

- [ ] **Step 2: Typecheck**

Run: `pnpm build`
Expected: no type errors.

- [ ] **Step 3: Commit**

```bash
git add lib/admin/get-dashboard-data.ts
git commit -m "feat(admin): add getDashboardData combining stats and chart data"
```

---

### Task 5: Create `components/admin/dashboard-client.tsx`

**Files:**
- Create: `components/admin/dashboard-client.tsx`

**Interfaces:**
- Consumes: `DashboardStats`/`Order` types from `@/types/admin`, `StatusBadge` from `@/components/admin/status-badge`, `RevenueChart` from `@/components/admin/revenue-chart` (unchanged), `Dialog*` from `@/components/ui/dialog` (unchanged).
- Produces: `DashboardClient({ initialStats, initialChartData, initialOrders }: DashboardClientProps)` — a client component with **no data fetching**, seeded entirely from props. Task 6 renders this with the output of `getDashboardData()` (Task 4).

- [ ] **Step 1: Write the component**

This is the current `app/admin/page.tsx` body (component name, `StatCard`, `RevenueChart` dynamic import, revenue dialog, table) with the `useEffect`/`fetch`/`isLoading` data layer removed and replaced by props.

```tsx
"use client";

import StatusBadge from "@/components/admin/status-badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { DashboardStats, Order } from "@/types/admin";
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

interface DashboardClientProps {
  initialStats: DashboardStats & { thisMonthRevenue: number };
  initialChartData: { name: string; revenue: number }[];
  initialOrders: Order[];
}

export function DashboardClient({
  initialStats,
  initialChartData,
  initialOrders,
}: DashboardClientProps) {
  const [isChartOpen, setIsChartOpen] = React.useState(false);
  const stats = initialStats;
  const chartData = initialChartData;
  const orders = initialOrders;

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
        <StatCard title="Total commandes" value={stats.totalOrders} icon={ShoppingBag} />
        <StatCard title="En attente" value={stats.pendingOrders} icon={Clock} />
        <StatCard title="En production" value={stats.inProduction} icon={Package} />
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
                {orders.map((order, idx) => (
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
```

- [ ] **Step 2: Typecheck**

Run: `pnpm build`
Expected: fails at this point only because `app/admin/page.tsx` (Task 6) doesn't import `DashboardClient` yet — that's expected; confirm the error is scoped to `app/admin/page.tsx`, not to this new file.

- [ ] **Step 3: Commit**

```bash
git add components/admin/dashboard-client.tsx
git commit -m "feat(admin): extract dashboard UI into DashboardClient component"
```

---

### Task 6: Convert `app/admin/page.tsx` to a Server Component

**Files:**
- Modify: `app/admin/page.tsx` (full rewrite — the old client-fetching version is replaced entirely)

**Interfaces:**
- Consumes: `getDashboardData` (Task 4), `DashboardClient` (Task 5).
- Produces: default export `AdminDashboard` (unchanged name/route contract — this is the Next.js page for `/admin`).

- [ ] **Step 1: Replace the file contents**

```tsx
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
```

- [ ] **Step 2: Typecheck and build**

Run: `pnpm build`
Expected: succeeds with no errors.

- [ ] **Step 3: Commit**

```bash
git add app/admin/page.tsx
git commit -m "refactor(admin): convert dashboard to a Server Component with server-side data fetching"
```

---

### Task 7: Replace `app/admin/loading.tsx` with a dashboard skeleton

**Files:**
- Modify: `app/admin/loading.tsx` (full rewrite)

**Interfaces:**
- Consumes: nothing (static skeleton, no props — this is the Suspense fallback Next.js renders automatically while `app/admin/page.tsx`'s `await getDashboardData()` is pending).
- Produces: nothing consumed elsewhere.

- [ ] **Step 1: Replace the file contents**

Skeleton block counts mirror the real layout: 4 stat cards, 3 quick-action cards, 5 table rows.

```tsx
export default function Loading() {
  return (
    <div>
      <div className="mb-8">
        <div className="mb-2 h-3 w-24 animate-pulse" style={{ background: "var(--color-paper-2)" }} />
        <div className="h-8 w-40 animate-pulse" style={{ background: "var(--color-paper-2)" }} />
      </div>

      <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-5" style={{ border: "var(--rule-soft)", background: "var(--color-paper)" }}>
            <div className="mb-3 h-3 w-20 animate-pulse" style={{ background: "var(--color-paper-2)" }} />
            <div className="h-6 w-16 animate-pulse" style={{ background: "var(--color-paper-2)" }} />
          </div>
        ))}
      </div>

      <div className="mb-8 grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-5" style={{ border: "var(--rule-soft)", background: "var(--color-paper)" }}>
            <div className="h-5 w-5 shrink-0 animate-pulse" style={{ background: "var(--color-paper-2)" }} />
            <div className="flex-1">
              <div className="mb-1 h-4 w-20 animate-pulse" style={{ background: "var(--color-paper-2)" }} />
              <div className="h-3 w-24 animate-pulse" style={{ background: "var(--color-paper-2)" }} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ border: "var(--rule-hair)", background: "var(--color-paper)" }}>
        <div className="px-6 py-4" style={{ borderBottom: "var(--rule-hair)" }}>
          <div className="h-4 w-32 animate-pulse" style={{ background: "var(--color-paper-2)" }} />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between px-6 py-4"
            style={{ borderTop: i === 0 ? "none" : "var(--rule-soft)" }}
          >
            <div className="h-4 w-24 animate-pulse" style={{ background: "var(--color-paper-2)" }} />
            <div className="h-4 w-32 animate-pulse" style={{ background: "var(--color-paper-2)" }} />
            <div className="h-4 w-16 animate-pulse" style={{ background: "var(--color-paper-2)" }} />
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
git add app/admin/loading.tsx
git commit -m "feat(admin): replace generic dashboard spinner with a layout-matching skeleton"
```

---

### Task 8: End-to-end manual verification

**Files:** none (verification only)

- [ ] **Step 1: Cold-load check**

Run `pnpm dev`. In a browser, fully reload `/admin` (hard refresh) while signed in as admin. Confirm:
- No `PremiumLoader` full-screen flash before the shell appears (`proxy.ts` already resolved auth server-side, and Task 2 removed the redundant client-side recheck).
- The dashboard skeleton (Task 7) is visible only very briefly (or not at all locally, since the DB call is fast), then the real dashboard renders with real stats — not a second client-side spinner.
- The stat cards, quick actions, and "Commandes récentes" table show real data matching what the old client-fetched version showed (cross-check against `/api/admin/orders` response or the orders page).

- [ ] **Step 2: Auth redirect check**

In a private/incognito window (no session), navigate directly to `/admin/orders`. Confirm it redirects to `/sign-in` without ever rendering the admin shell (server-side redirect, checkable by network tab: the initial navigation response itself is a redirect, not a 200 followed by client-side `push`).

- [ ] **Step 3: Revenue dialog check**

Click the CA stat card's trend to open the revenue dialog; confirm the chart renders with the same 6-month data as before.

- [ ] **Step 4: Full lint + build pass**

Run: `pnpm lint && pnpm build`
Expected: both clean.

- [ ] **Step 5: Report back**

Summarize the manual verification results before starting Phase 2 (orders, products, users, newsletter, configurator pages) — those will each get their own task breakdown in a follow-up plan, applying the exact same pattern established here (`lib/admin/get-<x>-data.ts` → `<X>Client` component → Server Component `page.tsx` → skeleton `loading.tsx`), plus `router.refresh()` calls added to each mutation handler per the agreed post-mutation resync behavior.
