# Admin Newsletter Page Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the Server-Component-fetch pattern to `/admin/newsletter`. Like `/admin/users`, this page is read-only (search + status filter only — the "Créer une campagne" button is a `Link` to the separate `/admin/newsletter/compose` page, out of scope), so no `router.refresh()`/`useTransition` is needed.

**Architecture:** `app/admin/newsletter/page.tsx` becomes an `async` Server Component that calls a new `lib/admin/get-newsletter-data.ts` and passes the result as `initialSubscribers` to a new `components/admin/newsletter-client.tsx`, which holds only search/status-filter UI state. The original page kept a separate `stats: {total, activeCount}` state populated from the API's own computed fields — this plan drops that redundant field and derives `total`/`activeCount` directly from `initialSubscribers` in the client, since they're trivially computable from the same array (consistent with how the dashboard/orders/products/users pages already derive their stat cards from the full data list rather than carrying parallel pre-computed fields). `app/admin/newsletter/loading.tsx` becomes a skeleton matching the real layout.

**Tech Stack:** Next.js 16 App Router, Drizzle ORM, Tailwind CSS v4, Framer Motion.

## Global Constraints

- No test framework exists — verification is `pnpm build` and manual dev-server/curl checks.
- No price/currency fields on `newsletterSubscriber` — no currency-conversion concern for this page (unlike orders/products/users).
- Do not add `export const dynamic = "force-dynamic"` (confirmed incompatible with `cacheComponents: true`).
- This page has no mutations — do not add `router.refresh()`/`useTransition` machinery it doesn't need (same restraint already applied successfully to the users page).
- The original client `Subscriber` interface typed `createdAt`/`updatedAt` as `string` (an artifact of JSON-over-HTTP). Since this plan fetches directly from Drizzle (no HTTP round-trip), the new `NewsletterSubscriber` type correctly types them as `Date` — same correction already made for `AdminUser.createdAt` in the users refactor. The client's `new Date(subscriber.createdAt)` call works unchanged either way.

---

### Task 1: Create `lib/admin/get-newsletter-data.ts`

**Files:**
- Create: `lib/admin/get-newsletter-data.ts`

**Interfaces:**
- Consumes: `db` from `@/lib/db`, `newsletterSubscriber` from `@/db/schema`.
- Produces: `NewsletterSubscriber` interface and `getNewsletterData(): Promise<NewsletterSubscriber[]>`, sorted newest-first — mirrors `app/api/admin/newsletter/route.ts`'s GET handler (unchanged, out of scope) minus its `status` query-param filter (not needed; filtering happens client-side same as before) and minus its separately-returned `total`/`activeCount` (derived client-side instead, see Global Constraints).

- [ ] **Step 1: Write the function**

```ts
import { newsletterSubscriber } from "@/db/schema";
import { db } from "@/lib/db";
import { desc } from "drizzle-orm";

export interface NewsletterSubscriber {
  id: string;
  email: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function getNewsletterData(): Promise<NewsletterSubscriber[]> {
  return db
    .select()
    .from(newsletterSubscriber)
    .orderBy(desc(newsletterSubscriber.createdAt));
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm build`
Expected: no type errors.

- [ ] **Step 3: Commit**

```bash
git add lib/admin/get-newsletter-data.ts
git commit -m "feat(admin): add getNewsletterData for server-side subscriber fetching"
```

---

### Task 2: Create `components/admin/newsletter-client.tsx`

**Files:**
- Create: `components/admin/newsletter-client.tsx`

**Interfaces:**
- Consumes: `NewsletterSubscriber` from `@/lib/admin/get-newsletter-data` (Task 1).
- Produces: `NewsletterClient({ initialSubscribers }: { initialSubscribers: NewsletterSubscriber[] })` — a client component with no data-fetching and no mutations, only search/status-filter state.

- [ ] **Step 1: Write the component**

This is the current `app/admin/newsletter/page.tsx` body with the `fetchSubscribers`/`isLoading`/`useEffect`/separate-`stats`-state data layer removed — data comes straight from the `initialSubscribers` prop, `total`/`activeCount` computed directly from it.

```tsx
"use client";

import type { NewsletterSubscriber } from "@/lib/admin/get-newsletter-data";
import { motion } from "framer-motion";
import { Calendar, Mail, PenLine, Search, UserCheck, Users, XCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface NewsletterClientProps {
  initialSubscribers: NewsletterSubscriber[];
}

export function NewsletterClient({ initialSubscribers }: NewsletterClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredSubscribers = initialSubscribers.filter((s) => {
    const matchesSearch = s.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const total = initialSubscribers.length;
  const activeCount = initialSubscribers.filter((s) => s.status === "active").length;

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="type-overline mb-2" style={{ color: "var(--color-accent)" }}>Administration</p>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "1.75rem", color: "var(--color-ink)" }}>
            Newsletter
          </h1>
          <p className="font-body mt-1 text-sm" style={{ color: "var(--color-ink-3)" }}>
            Gérez vos abonnés à la newsletter
          </p>
        </div>
        <Link
          href="/admin/newsletter/compose"
          className="inline-flex shrink-0 items-center gap-2 px-5 py-2.5 font-body text-sm font-medium transition-opacity hover:opacity-80"
          style={{ background: "var(--color-ink)", color: "var(--color-paper)" }}
        >
          <PenLine className="h-4 w-4" strokeWidth={1.5} />
          Créer une campagne
        </Link>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-3 gap-3">
        {[
          { label: "Total abonnés", value: total,                    icon: Users },
          { label: "Actifs",        value: activeCount,              icon: UserCheck },
          { label: "Désinscrits",   value: total - activeCount,      icon: XCircle },
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

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" style={{ color: "var(--color-ink-3)" }} strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Rechercher un email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="font-body w-full py-2.5 pr-4 pl-9 text-sm outline-none"
            style={{ border: "var(--rule-soft)", background: "var(--color-paper)", color: "var(--color-ink)" }}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="font-body cursor-pointer appearance-none py-2.5 pr-10 pl-4 text-sm outline-none"
          style={{ border: "var(--rule-soft)", background: "var(--color-paper)", color: "var(--color-ink)", minWidth: "160px" }}
        >
          <option value="all">Tous les statuts</option>
          <option value="active">Actifs</option>
          <option value="unsubscribed">Désinscrits</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ border: "var(--rule-hair)", background: "var(--color-paper)" }}>
        {filteredSubscribers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Mail className="mb-4 h-8 w-8" style={{ color: "var(--color-ink-3)", opacity: 0.3 }} strokeWidth={1} />
            <p className="font-body text-sm" style={{ color: "var(--color-ink-3)" }}>
              {searchQuery || statusFilter !== "all"
                ? "Aucun abonné ne correspond à votre recherche."
                : "Aucun abonné pour le moment."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: "var(--color-paper-2)" }}>
                  {["Email", "Statut", "Date d'inscription"].map((th) => (
                    <th key={th} className="type-overline px-6 py-3 text-left" style={{ color: "var(--color-ink-3)" }}>
                      {th}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredSubscribers.map((subscriber, index) => (
                  <motion.tr
                    key={subscriber.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25, delay: index * 0.03 }}
                    className="transition-colors hover:bg-[var(--color-paper-2)]"
                    style={{ borderTop: "var(--rule-soft)" }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 shrink-0" style={{ color: "var(--color-ink-3)" }} strokeWidth={1.5} />
                        <span className="font-body text-sm" style={{ color: "var(--color-ink)" }}>
                          {subscriber.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5" style={{ border: "var(--rule-soft)" }}>
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ background: subscriber.status === "active" ? "#22c55e" : "#94a3b8" }}
                        />
                        <span className="type-overline" style={{ color: "var(--color-ink)" }}>
                          {subscriber.status === "active" ? "Actif" : "Désinscrit"}
                        </span>
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--color-ink-3)" }} strokeWidth={1.5} />
                        <span className="font-body text-sm" style={{ color: "var(--color-ink-3)" }}>
                          {new Date(subscriber.createdAt).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {filteredSubscribers.length > 0 && (
        <p className="mt-4 text-center font-body text-xs" style={{ color: "var(--color-ink-3)", opacity: 0.5 }}>
          {filteredSubscribers.length} abonné{filteredSubscribers.length > 1 ? "s" : ""} affiché{filteredSubscribers.length > 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm build`
Expected: fine either way whether this fails scoped to `app/admin/newsletter/page.tsx` (not yet wired, Task 3) or passes cleanly — confirm any failure is NOT inside `components/admin/newsletter-client.tsx` itself.

- [ ] **Step 3: Commit**

```bash
git add components/admin/newsletter-client.tsx
git commit -m "feat(admin): extract newsletter subscribers UI into NewsletterClient component"
```

---

### Task 3: Convert `app/admin/newsletter/page.tsx` to a Server Component

**Files:**
- Modify: `app/admin/newsletter/page.tsx` (full rewrite)

**Interfaces:**
- Consumes: `getNewsletterData` from `@/lib/admin/get-newsletter-data` (Task 1), `NewsletterClient` (Task 2).
- Produces: default export `NewsletterPage` — unchanged route contract for `/admin/newsletter`.

- [ ] **Step 1: Replace the file contents**

```tsx
import { NewsletterClient } from "@/components/admin/newsletter-client";
import { getNewsletterData } from "@/lib/admin/get-newsletter-data";

export default async function NewsletterPage() {
  const subscribers = await getNewsletterData();

  return <NewsletterClient initialSubscribers={subscribers} />;
}
```

- [ ] **Step 2: Typecheck and build**

Run: `pnpm build`
Expected: succeeds with no errors.

- [ ] **Step 3: Commit**

```bash
git add app/admin/newsletter/page.tsx
git commit -m "refactor(admin): convert newsletter list to a Server Component with server-side data fetching"
```

---

### Task 4: Add `app/admin/newsletter/loading.tsx`

**Files:**
- Create: `app/admin/newsletter/loading.tsx` (this route currently has no `loading.tsx` of its own — it inherits `app/admin/loading.tsx`, the dashboard skeleton, the wrong shape here)

**Interfaces:**
- Consumes: nothing (static skeleton, no props).
- Produces: nothing consumed elsewhere.

- [ ] **Step 1: Write the file**

Mirrors the real layout: header, 3 stat cards, search+select filter row, 6-row table (Email/Statut/Date columns).

```tsx
export default function Loading() {
  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 h-3 w-24 animate-pulse" style={{ background: "var(--color-paper-2)" }} />
          <div className="mb-1 h-8 w-36 animate-pulse" style={{ background: "var(--color-paper-2)" }} />
          <div className="h-3 w-48 animate-pulse" style={{ background: "var(--color-paper-2)" }} />
        </div>
        <div className="h-10 w-48 animate-pulse" style={{ background: "var(--color-paper-2)" }} />
      </div>

      <div className="mb-8 grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-5" style={{ border: "var(--rule-soft)", background: "var(--color-paper)" }}>
            <div className="mb-3 h-3 w-20 animate-pulse" style={{ background: "var(--color-paper-2)" }} />
            <div className="h-6 w-12 animate-pulse" style={{ background: "var(--color-paper-2)" }} />
          </div>
        ))}
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="h-10 flex-1 animate-pulse" style={{ background: "var(--color-paper-2)" }} />
        <div className="h-10 w-40 animate-pulse" style={{ background: "var(--color-paper-2)" }} />
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
            <div className="h-4 w-40 animate-pulse" style={{ background: "var(--color-paper-2)" }} />
            <div className="h-4 w-16 animate-pulse" style={{ background: "var(--color-paper-2)" }} />
            <div className="h-4 w-28 animate-pulse" style={{ background: "var(--color-paper-2)" }} />
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
git add app/admin/newsletter/loading.tsx
git commit -m "feat(admin): add layout-matching loading skeleton for newsletter subscribers"
```

---

### Task 5: End-to-end manual verification

**Files:** none (verification only)

- [ ] **Step 1: Cold-load check**

Run `pnpm dev`. Signed in as admin, hard-refresh `/admin/newsletter`. Confirm the skeleton (Task 4) appears briefly, then the real table renders with data.

- [ ] **Step 2: Filter check**

Type in the search box and change the status filter; confirm the table filters correctly and stat cards stay stable (computed from `initialSubscribers`, not `filteredSubscribers`).

- [ ] **Step 3: Auth redirect check**

In a private/incognito window (no session), navigate directly to `/admin/newsletter`. Confirm it redirects to `/sign-in`.

- [ ] **Step 4: Full build pass**

Run: `pnpm build`
Expected: clean.

- [ ] **Step 5: Report back**

Summarize verification results before starting the final page in the sequence (configurator — significantly larger, 5 CRUD sub-resources, will need its own dedicated plan following the products-page pattern for mutations, not the users/newsletter read-only pattern).
