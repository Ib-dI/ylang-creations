# Admin Users Page Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the Server-Component-fetch pattern to `/admin/users`. This page is read-only (search only, no create/edit/delete mutations — a "Voir" link routes to the separate `/admin/users/[id]` detail page, out of scope) so this is the simplest conversion in the sequence: no `router.refresh()`/`useTransition` machinery needed at all.

**Architecture:** `app/admin/users/page.tsx` becomes an `async` Server Component that calls a new `lib/admin/get-users-data.ts` and passes the result as `initialUsers` to a new `components/admin/users-client.tsx`, which holds only the search-query UI state. `app/admin/users/loading.tsx` becomes a skeleton matching the real layout (4 stat cards + table).

**Tech Stack:** Next.js 16 App Router, Drizzle ORM, Supabase Admin Auth API (`supabaseAdmin.auth.admin.listUsers()` — this page's user list comes from Supabase Auth, not a DB table; `customer`/`order` DB tables are joined in for spend/order-count stats), `lib/currency.ts`, Tailwind CSS v4, Framer Motion.

## Global Constraints

- No test framework exists — verification is `pnpm build` and manual dev-server/curl checks.
- `/api/admin/users/route.ts` (unchanged, out of scope) computes `totalSpent` with a raw `o.totalAmount / 100` — the same class of bug already fixed in the orders refactor. The new `lib/admin/get-users-data.ts` must use `centsToEuros(cents(o.totalAmount))` instead, per `CONTEXT.md`'s Price entry.
- Do not add `export const dynamic = "force-dynamic"` — confirmed incompatible with `cacheComponents: true` in the orders refactor; dynamism is automatic.
- `supabaseAdmin` (from `@/utils/supabase/server`) is a service-role client already used server-side elsewhere (e.g. this same API route) — safe to import directly into the new lib function; it is `null` if `SUPABASE_SERVICE_ROLE_KEY` is unset, matching the existing route's guard.
- This page has no mutations, so there is nothing to wire `router.refresh()` to — do not add it speculatively.

---

### Task 1: Create `lib/admin/get-users-data.ts`

**Files:**
- Create: `lib/admin/get-users-data.ts`

**Interfaces:**
- Consumes: `supabaseAdmin` from `@/utils/supabase/server`, `customer`/`order` from `@/db/schema`, `db` from `@/lib/db`, `cents`/`centsToEuros` from `@/lib/currency`.
- Produces: `AdminUser` interface and `getUsersData(): Promise<AdminUser[]>`. Task 2's `UsersClient` imports `AdminUser`; Task 3's Server Component imports `getUsersData`.

- [ ] **Step 1: Write the function**

Mirrors `app/api/admin/users/route.ts`'s GET handler (unchanged, out of scope) — same Supabase Auth listing, same admin-role filter, same customer/order join for stats — but with the currency bug fixed.

```ts
import { customer, order } from "@/db/schema";
import { db } from "@/lib/db";
import { cents, centsToEuros } from "@/lib/currency";
import { supabaseAdmin } from "@/utils/supabase/server";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: string;
  orderCount: number;
  totalSpent: number;
  sumupCustomerId: string | null;
}

export async function getUsersData(): Promise<AdminUser[]> {
  if (!supabaseAdmin) {
    throw new Error("Serveur mal configuré : SUPABASE_SERVICE_ROLE_KEY manquant.");
  }

  const {
    data: { users },
    error: usersError,
  } = await supabaseAdmin.auth.admin.listUsers();

  if (usersError) {
    throw usersError;
  }

  const customers = await db.select().from(customer);
  const orders = await db.select().from(order);

  return users
    .filter((u) => u.app_metadata?.role !== "admin")
    .map((u) => {
      const customerRecord = customers.find((c) => c.userId === u.id);
      const userOrders = customerRecord
        ? orders.filter((o) => o.customerId === customerRecord.id)
        : [];
      const totalSpent = userOrders.reduce(
        (sum, o) => sum + centsToEuros(cents(o.totalAmount)),
        0,
      );

      const fullName = u.user_metadata?.full_name || u.user_metadata?.name || "Sans nom";

      return {
        id: u.id,
        name: fullName,
        email: u.email || "",
        emailVerified: !!u.email_confirmed_at,
        image: u.user_metadata?.avatar_url || null,
        createdAt: u.created_at,
        orderCount: userOrders.length,
        totalSpent,
        sumupCustomerId: customerRecord?.sumupCustomerId || null,
      };
    });
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm build`
Expected: no type errors.

- [ ] **Step 3: Commit**

```bash
git add lib/admin/get-users-data.ts
git commit -m "feat(admin): add getUsersData for server-side user fetching"
```

---

### Task 2: Create `components/admin/users-client.tsx`

**Files:**
- Create: `components/admin/users-client.tsx`

**Interfaces:**
- Consumes: `AdminUser` from `@/lib/admin/get-users-data` (Task 1).
- Produces: `UsersClient({ initialUsers }: { initialUsers: AdminUser[] })` — a client component with no data-fetching and no mutations, only search-query state.

- [ ] **Step 1: Write the component**

This is the current `app/admin/users/page.tsx` body with the `fetchUsers`/`isLoading`/`useEffect` data layer removed — data comes straight from the `initialUsers` prop, stats and filtering computed directly from it.

```tsx
"use client";

import type { AdminUser } from "@/lib/admin/get-users-data";
import { motion } from "framer-motion";
import {
  Calendar,
  CheckCircle,
  Euro,
  Eye,
  Search,
  ShoppingBag,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface UsersClientProps {
  initialUsers: AdminUser[];
}

export function UsersClient({ initialUsers }: UsersClientProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = initialUsers.filter((user) => {
    const q = searchQuery.toLowerCase();
    return user.name.toLowerCase().includes(q) || user.email.toLowerCase().includes(q);
  });

  const totalUsers = initialUsers.length;
  const verifiedUsers = initialUsers.filter((u) => u.emailVerified).length;
  const activeCustomers = initialUsers.filter((u) => u.orderCount > 0).length;
  const totalRevenue = initialUsers.reduce((sum, u) => sum + u.totalSpent, 0);

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <p className="type-overline mb-2" style={{ color: "var(--color-accent)" }}>Administration</p>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "1.75rem", color: "var(--color-ink)" }}>
          Clients
        </h1>
        <p className="font-body mt-1 text-sm" style={{ color: "var(--color-ink-3)" }}>
          Gérez vos clients et consultez leurs informations
        </p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Utilisateurs",   value: totalUsers,                      icon: Users },
          { label: "Vérifiés",       value: verifiedUsers,                   icon: CheckCircle },
          { label: "Clients actifs", value: activeCustomers,                  icon: ShoppingBag },
          { label: "CA clients",     value: `${totalRevenue.toFixed(0)} €`,  icon: Euro },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="flex items-start justify-between p-5" style={{ border: "var(--rule-soft)", background: "var(--color-paper)" }}>
            <div>
              <p className="type-overline mb-3" style={{ color: "var(--color-ink-3)" }}>{label}</p>
              <p style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "var(--text-title)", color: "var(--color-ink)", lineHeight: 1 }}>
                {value}
              </p>
            </div>
            <Icon className="h-4 w-4 shrink-0" style={{ color: "var(--color-ink-3)" }} strokeWidth={1.5} />
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-sm">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" style={{ color: "var(--color-ink-3)" }} strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Rechercher un client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="font-body w-full py-2.5 pr-4 pl-9 text-sm outline-none"
            style={{ border: "var(--rule-soft)", background: "var(--color-paper)", color: "var(--color-ink)" }}
          />
        </div>
      </div>

      {/* Table */}
      {filteredUsers.length === 0 ? (
        <div className="py-20 text-center" style={{ border: "var(--rule-hair)", background: "var(--color-paper)" }}>
          <Users className="mx-auto mb-4 h-8 w-8" style={{ color: "var(--color-ink-3)", opacity: 0.3 }} strokeWidth={1} />
          <p style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "1rem", color: "var(--color-ink)", marginBottom: "0.25rem" }}>
            Aucun client trouvé
          </p>
          <p className="font-body text-sm" style={{ color: "var(--color-ink-3)" }}>
            {searchQuery ? "Essayez d'autres termes" : "Les clients apparaîtront après leur inscription"}
          </p>
        </div>
      ) : (
        <div style={{ border: "var(--rule-hair)", background: "var(--color-paper)" }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: "var(--color-paper-2)" }}>
                  {["Client", "Email vérifié", "Commandes", "Total dépensé", "Inscrit le", ""].map((th) => (
                    <th key={th} className={`type-overline px-6 py-3 ${th === "" ? "text-right" : "text-left"}`} style={{ color: "var(--color-ink-3)" }}>
                      {th}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, index) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25, delay: index * 0.03 }}
                    className="transition-colors hover:bg-[var(--color-paper-2)]"
                    style={{ borderTop: "var(--rule-soft)" }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-8 w-8 shrink-0 items-center justify-center font-body text-sm font-medium"
                          style={{ background: "var(--color-paper-3)", color: "var(--color-ink)" }}
                        >
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-body font-medium" style={{ color: "var(--color-ink)" }}>{user.name}</p>
                          <p className="font-body text-xs" style={{ color: "var(--color-ink-3)" }}>{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.emailVerified ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5" style={{ border: "var(--rule-soft)" }}>
                          <span className="h-1.5 w-1.5 rounded-full" style={{ background: "#22c55e" }} />
                          <span className="type-overline" style={{ color: "var(--color-ink)" }}>Vérifié</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5" style={{ border: "var(--rule-soft)" }}>
                          <span className="h-1.5 w-1.5 rounded-full" style={{ background: "#f59e0b" }} />
                          <span className="type-overline" style={{ color: "var(--color-ink)" }}>Non vérifié</span>
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="h-3.5 w-3.5" style={{ color: "var(--color-ink-3)" }} strokeWidth={1.5} />
                        <span
                          style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "0.9375rem", color: "var(--color-ink)" }}
                        >
                          {user.orderCount}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "0.9375rem", color: "var(--color-ink)" }}>
                        {user.totalSpent.toFixed(2)} €
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5" style={{ color: "var(--color-ink-3)" }} strokeWidth={1.5} />
                        <span className="font-body text-sm" style={{ color: "var(--color-ink-3)" }}>
                          {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 font-body text-xs transition-opacity hover:opacity-70"
                        style={{ border: "var(--rule-soft)", color: "var(--color-ink-3)" }}
                      >
                        <Eye className="h-3.5 w-3.5" strokeWidth={1.5} />
                        Voir
                      </Link>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm build`
Expected: fine either way whether this fails scoped to `app/admin/users/page.tsx` (not yet wired, Task 3) or passes cleanly — confirm any failure is NOT inside `components/admin/users-client.tsx` itself.

- [ ] **Step 3: Commit**

```bash
git add components/admin/users-client.tsx
git commit -m "feat(admin): extract users list UI into UsersClient component"
```

---

### Task 3: Convert `app/admin/users/page.tsx` to a Server Component

**Files:**
- Modify: `app/admin/users/page.tsx` (full rewrite)

**Interfaces:**
- Consumes: `getUsersData` from `@/lib/admin/get-users-data` (Task 1), `UsersClient` (Task 2).
- Produces: default export `UsersPage` — unchanged route contract for `/admin/users`.

- [ ] **Step 1: Replace the file contents**

```tsx
import { UsersClient } from "@/components/admin/users-client";
import { getUsersData } from "@/lib/admin/get-users-data";

export default async function UsersPage() {
  const users = await getUsersData();

  return <UsersClient initialUsers={users} />;
}
```

- [ ] **Step 2: Typecheck and build**

Run: `pnpm build`
Expected: succeeds with no errors.

- [ ] **Step 3: Commit**

```bash
git add app/admin/users/page.tsx
git commit -m "refactor(admin): convert users list to a Server Component with server-side data fetching"
```

---

### Task 4: Add `app/admin/users/loading.tsx`

**Files:**
- Create: `app/admin/users/loading.tsx` (this route currently has no `loading.tsx` of its own — it inherits `app/admin/loading.tsx`, the dashboard skeleton, the wrong shape here)

**Interfaces:**
- Consumes: nothing (static skeleton, no props).
- Produces: nothing consumed elsewhere.

- [ ] **Step 1: Write the file**

Mirrors the real layout: header, 4 stat cards, search bar, 6-row table.

```tsx
export default function Loading() {
  return (
    <div>
      <div className="mb-8">
        <div className="mb-2 h-3 w-24 animate-pulse" style={{ background: "var(--color-paper-2)" }} />
        <div className="mb-1 h-8 w-28 animate-pulse" style={{ background: "var(--color-paper-2)" }} />
        <div className="h-3 w-56 animate-pulse" style={{ background: "var(--color-paper-2)" }} />
      </div>

      <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-5" style={{ border: "var(--rule-soft)", background: "var(--color-paper)" }}>
            <div className="mb-3 h-3 w-20 animate-pulse" style={{ background: "var(--color-paper-2)" }} />
            <div className="h-6 w-12 animate-pulse" style={{ background: "var(--color-paper-2)" }} />
          </div>
        ))}
      </div>

      <div className="mb-6">
        <div className="h-10 w-full max-w-sm animate-pulse" style={{ background: "var(--color-paper-2)" }} />
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
            <div className="h-4 w-32 animate-pulse" style={{ background: "var(--color-paper-2)" }} />
            <div className="h-4 w-16 animate-pulse" style={{ background: "var(--color-paper-2)" }} />
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
git add app/admin/users/loading.tsx
git commit -m "feat(admin): add layout-matching loading skeleton for users table"
```

---

### Task 5: End-to-end manual verification

**Files:** none (verification only)

- [ ] **Step 1: Cold-load check**

Run `pnpm dev`. Signed in as admin, hard-refresh `/admin/users`. Confirm the skeleton (Task 4) appears briefly, then the real table renders with data.

- [ ] **Step 2: Search check**

Type in the search box; confirm the table filters correctly and stat cards stay stable (computed from `initialUsers`, not `filteredUsers`).

- [ ] **Step 3: Auth redirect check**

In a private/incognito window (no session), navigate directly to `/admin/users`. Confirm it redirects to `/sign-in`.

- [ ] **Step 4: Full build pass**

Run: `pnpm build`
Expected: clean.

- [ ] **Step 5: Report back**

Summarize verification results before starting the next page (newsletter).
