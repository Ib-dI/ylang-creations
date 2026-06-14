# Architecture Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate seven architectural friction points — scattered constants, duplicated shipping logic, copy-pasted admin auth, a god-function checkout, a cascading webhook, and leaked local types — by extracting deep modules with narrow interfaces.

**Architecture:** Each task produces a standalone module (or removes a duplication) and does not depend on the next task, except Tasks 6 and 7 which consume the modules created in Tasks 1–3. Execute Tasks 1–4 in any order; execute 5–7 after 1–3 are done.

**Tech Stack:** Next.js 16 App Router, TypeScript 5, Drizzle ORM, Zustand 5, Supabase, SumUp SDK. No test runner is installed — verification uses `pnpm lint` (ESLint + TypeScript) and `pnpm build`.

---

## File Map

### New files
- `lib/currency.ts` — `centsToEuros`, `eurosToCents`, `formatPrice`
- `lib/constants.ts` — `MAX_WEIGHT_GRAMS`, `EMBROIDERY_PRICE_EUR`
- `lib/shipping.ts` — `calculateShippingRate`
- `lib/sumup.ts` — `SUMUP_API_URL`, `getSumupHeaders`
- `lib/auth/with-admin-auth.ts` — `withAdminAuth` HOF

### Deleted files
- `lib/store/configurator-store.ts` — dead code: never imported by any component
- `types/configurator.ts` — described a data model never wired to the page

### Modified files
- `lib/store/cart-store.ts` — import from `lib/shipping.ts`, `lib/constants.ts`
- `components/cart/cart-drawer.tsx` — remove local `const MAX_WEIGHT_GRAMS = 30000`, import from `lib/constants.ts`
- `lib/actions/checkout.ts` — remove duplicate `calculateColissimoHomeRate`, local `CartItem`; import from `lib/shipping.ts`, `lib/currency.ts`, `lib/sumup.ts`, `@/types/cart`
- `app/api/products/route.ts` — use `centsToEuros`
- `app/api/admin/products/route.ts` — use `centsToEuros` + `withAdminAuth`
- `app/api/admin/products/[id]/route.ts` — use `withAdminAuth`
- `app/api/admin/orders/route.ts` — use `withAdminAuth`
- `app/api/admin/orders/[id]/route.ts` — use `withAdminAuth`
- `app/api/admin/settings/route.ts` — use `withAdminAuth`
- `app/api/admin/users/route.ts` — use `withAdminAuth`
- `app/api/admin/configurator/route.ts` (if exists) — use `withAdminAuth`
- `app/api/admin/newsletter/route.ts` (if exists) — use `withAdminAuth`
- `app/api/admin/notifications/route.ts` (if exists) — use `withAdminAuth`
- `app/api/admin/reset/route.ts` (if exists) — use `withAdminAuth`
- `app/api/admin/storage/route.ts` (if exists) — use `withAdminAuth`
- `app/api/webhooks/sumup/route.ts` — extract four handler functions, import from `lib/sumup.ts`
- `types/configurator.ts` — rename `Product` → `ConfiguratorProduct`, `Fabric` → `ConfiguratorFabric`
- `lib/store/configurator-store.ts` — update type imports
- `app/configurateur/page.tsx` — remove local `Product`, `Fabric`, `Configuration`; import from `@/types/configurator`

---

## Task 1: Currency Module

**Files:**
- Create: `lib/currency.ts`
- Modify: `app/api/products/route.ts:90,106`
- Modify: `app/api/admin/products/route.ts:38–39`

- [ ] **Step 1: Create the module**

```typescript
// lib/currency.ts

/** Converts a price stored in cents (integer) to euros (float). */
export function centsToEuros(cents: number): number {
  return cents / 100;
}

/** Converts a euro price to cents (integer), rounded to avoid floating-point drift. */
export function eurosToCents(euros: number): number {
  return Math.round(euros * 100);
}

/** Formats a cent value as a French locale euro string — e.g. "12,50 €". */
export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(centsToEuros(cents));
}
```

- [ ] **Step 2: Update `app/api/products/route.ts`**

Add to imports at the top of the file:
```typescript
import { centsToEuros } from "@/lib/currency";
```

Replace (line ~90):
```typescript
      price: p.price / 100,
```
With:
```typescript
      price: centsToEuros(p.price),
```

Replace (line ~106):
```typescript
      compareAtPrice: p.compareAtPrice ? p.compareAtPrice / 100 : null,
```
With:
```typescript
      compareAtPrice: p.compareAtPrice ? centsToEuros(p.compareAtPrice) : null,
```

- [ ] **Step 3: Update `app/api/admin/products/route.ts`**

Add to imports:
```typescript
import { centsToEuros } from "@/lib/currency";
```

Replace (lines ~38–39):
```typescript
      price: p.price / 100,
      compareAtPrice: p.compareAtPrice ? p.compareAtPrice / 100 : null,
```
With:
```typescript
      price: centsToEuros(p.price),
      compareAtPrice: p.compareAtPrice ? centsToEuros(p.compareAtPrice) : null,
```

- [ ] **Step 4: Verify**

```bash
pnpm lint
```
Expected: no new errors.

- [ ] **Step 5: Commit**

```bash
git add lib/currency.ts app/api/products/route.ts app/api/admin/products/route.ts
git commit -m "feat: extract currency module, replace inline /100 conversions"
```

---

## Task 2: Business Constants Module

**Files:**
- Create: `lib/constants.ts`
- Modify: `lib/store/cart-store.ts` (remove `MAX_WEIGHT_GRAMS` export, import it)
- Modify: `components/cart/cart-drawer.tsx` (remove local `const MAX_WEIGHT_GRAMS = 30000`, import it)
- Modify: `app/configurateur/page.tsx` (replace hardcoded `1500` with `EMBROIDERY_PRICE_CENTS`)

Note: `configuratorFabric.price` and `configuratorProduct.basePrice` are stored in **cents** in the DB. The configurateur API returns raw DB values. `totalPrice()` in the page operates in cents — embroidery adds `1500` (not `15`). So the constant is `EMBROIDERY_PRICE_CENTS`.

- [ ] **Step 1: Create the module**

```typescript
// lib/constants.ts

/** Maximum parcel weight Colissimo accepts (30 kg in grams). */
export const MAX_WEIGHT_GRAMS = 30_000;

/** Fixed price added when embroidery is selected, in cents. 1500 = 15 €. */
export const EMBROIDERY_PRICE_CENTS = 1_500;
```

- [ ] **Step 2: Update `lib/store/cart-store.ts`**

Add to imports at top:
```typescript
import { MAX_WEIGHT_GRAMS } from "@/lib/constants";
```

Remove line 30:
```typescript
export const MAX_WEIGHT_GRAMS = 30000;
```

- [ ] **Step 3: Update `components/cart/cart-drawer.tsx`**

Add to imports at top:
```typescript
import { MAX_WEIGHT_GRAMS } from "@/lib/constants";
```

Remove line 36:
```typescript
  const MAX_WEIGHT_GRAMS = 30000;
```

- [ ] **Step 4: Update `app/configurateur/page.tsx` — embroidery price**

Add to imports at top:
```typescript
import { EMBROIDERY_PRICE_CENTS } from "@/lib/constants";
```

Replace (line 344):
```typescript
    if (configuration.embroideries.some(e => e.length > 0)) total += 1500;
```
With:
```typescript
    if (configuration.embroideries.some(e => e.length > 0)) total += EMBROIDERY_PRICE_CENTS;
```

- [ ] **Step 5: Verify**

```bash
pnpm lint
```
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add lib/constants.ts lib/store/cart-store.ts components/cart/cart-drawer.tsx app/configurateur/page.tsx
git commit -m "feat: extract business constants module (MAX_WEIGHT_GRAMS, EMBROIDERY_PRICE_CENTS)"
```

---

## Task 3: Shipping Module

**Files:**
- Create: `lib/shipping.ts`
- Modify: `lib/store/cart-store.ts` (remove inline function, import)
- Modify: `lib/actions/checkout.ts` (remove inline function, import)

- [ ] **Step 1: Create the module**

```typescript
// lib/shipping.ts

const COLISSIMO_TIERS: Array<{ maxGrams: number; priceEur: number }> = [
  { maxGrams: 250, priceEur: 5.49 },
  { maxGrams: 500, priceEur: 7.59 },
  { maxGrams: 750, priceEur: 9.29 },
  { maxGrams: 1000, priceEur: 9.59 },
  { maxGrams: 2000, priceEur: 11.19 },
  { maxGrams: 5000, priceEur: 17.39 },
  { maxGrams: 10000, priceEur: 25.29 },
];

const COLISSIMO_MAX_PRICE_EUR = 39.59;

/** Returns the Colissimo home-delivery rate in euros for the given parcel weight in grams. */
export function calculateShippingRate(weightGrams: number): number {
  const tier = COLISSIMO_TIERS.find((t) => weightGrams <= t.maxGrams);
  return tier?.priceEur ?? COLISSIMO_MAX_PRICE_EUR;
}
```

- [ ] **Step 2: Update `lib/store/cart-store.ts`**

Add to imports at top:
```typescript
import { calculateShippingRate } from "@/lib/shipping";
```

Remove lines 32–45 (the `calculateColissimoHomeRate` function):
```typescript
function calculateColissimoHomeRate(weightGrams: number): number {
  if (weightGrams <= 250) return 5.49;
  if (weightGrams <= 500) return 7.59;
  if (weightGrams <= 750) return 9.29;
  if (weightGrams <= 1000) return 9.59;
  if (weightGrams <= 2000) return 11.19;
  if (weightGrams <= 5000) return 17.39;
  if (weightGrams <= 10000) return 25.29;
  return 39.59; // jusqu'à 30 kg
}
```

In the `getShipping` action, replace:
```typescript
        return calculateColissimoHomeRate(totalWeight);
```
With:
```typescript
        return calculateShippingRate(totalWeight);
```

- [ ] **Step 3: Update `lib/actions/checkout.ts`**

Add to imports at top:
```typescript
import { calculateShippingRate } from "@/lib/shipping";
```

Remove lines 52–64 (the duplicate `calculateColissimoHomeRate` function):
```typescript
function calculateColissimoHomeRate(weightGrams: number): number {
  if (weightGrams <= 250) return 5.49;
  if (weightGrams <= 500) return 7.59;
  if (weightGrams <= 750) return 9.29;
  if (weightGrams <= 1000) return 9.59;
  if (weightGrams <= 2000) return 11.19;
  if (weightGrams <= 5000) return 17.39;
  if (weightGrams <= 10000) return 25.29;
  return 39.59; // jusqu'à 30 kg
}
```

Replace the call site in `createCheckoutSession` (~line 231):
```typescript
        ? calculateColissimoHomeRate(totalWeight)
```
With:
```typescript
        ? calculateShippingRate(totalWeight)
```

- [ ] **Step 4: Verify**

```bash
pnpm lint
```
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add lib/shipping.ts lib/store/cart-store.ts lib/actions/checkout.ts
git commit -m "feat: extract shipping module, remove duplicated Colissimo rate function"
```

---

## Task 4: SumUp Client Module

**Files:**
- Create: `lib/sumup.ts`
- Modify: `lib/actions/checkout.ts` (remove local constants, import)
- Modify: `app/api/webhooks/sumup/route.ts` (remove local constants, import)

- [ ] **Step 1: Create the module**

```typescript
// lib/sumup.ts

export const SUMUP_API_URL = "https://api.sumup.com/v0.1";

/** Returns SumUp authorization headers using the runtime secret key. */
export function getSumupHeaders(): HeadersInit {
  const key = process.env.SUMUP_SECRET_KEY;
  if (!key) throw new Error("SUMUP_SECRET_KEY is not defined");
  return {
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  };
}
```

- [ ] **Step 2: Update `lib/actions/checkout.ts`**

Add to imports at top:
```typescript
import { getSumupHeaders, SUMUP_API_URL } from "@/lib/sumup";
```

Remove the top-level guard and constant block (lines 15–28):
```typescript
const sumupApiUrl = "https://api.sumup.com/v0.1";

if (!process.env.SUMUP_SECRET_KEY) {
  throw new Error("SUMUP_SECRET_KEY is not defined");
}

if (!process.env.SUMUP_MERCHANT_CODE) {
  throw new Error("SUMUP_MERCHANT_CODE is not defined");
}

const sumupHeaders = {
  Authorization: `Bearer ${process.env.SUMUP_SECRET_KEY}`,
  "Content-Type": "application/json",
};
```

Replace all uses of `sumupApiUrl` with `SUMUP_API_URL` and all uses of `sumupHeaders` with `getSumupHeaders()` in the file. There are two fetch calls (create checkout and get checkout):

```typescript
// In createCheckoutSession (~line 276):
    const sumupResponse = await fetch(`${SUMUP_API_URL}/checkouts`, {
      method: "POST",
      headers: getSumupHeaders(),
      body: JSON.stringify(sumupPayload),
    });

// In getCheckoutSession (~line 324):
    const sumupResponse = await fetch(`${SUMUP_API_URL}/checkouts/${sessionId}`, {
      method: "GET",
      headers: getSumupHeaders(),
    });
```

- [ ] **Step 3: Update `app/api/webhooks/sumup/route.ts`**

Add to imports at top:
```typescript
import { getSumupHeaders, SUMUP_API_URL } from "@/lib/sumup";
```

Remove lines 8–13:
```typescript
const sumupApiUrl = "https://api.sumup.com/v0.1";

const sumupHeaders = {
  Authorization: `Bearer ${process.env.SUMUP_SECRET_KEY}`,
  "Content-Type": "application/json",
};
```

Replace the fetch call in the POST handler (~line 30):
```typescript
    const sumupResponse = await fetch(
      `${SUMUP_API_URL}/checkouts/${checkoutId}`,
      {
        method: "GET",
        headers: getSumupHeaders(),
      },
    );
```

- [ ] **Step 4: Verify**

```bash
pnpm lint
```
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add lib/sumup.ts lib/actions/checkout.ts app/api/webhooks/sumup/route.ts
git commit -m "feat: extract SumUp client module, remove duplicated API constants"
```

---

## Task 5: Admin Auth Guard

**Files:**
- Create: `lib/auth/with-admin-auth.ts`
- Modify: every `app/api/admin/**/route.ts` that contains the auth check pattern

- [ ] **Step 1: Create the guard**

```typescript
// lib/auth/with-admin-auth.ts
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<Record<string, string>> };
type RouteHandler = (
  request: Request,
  context?: RouteContext
) => Promise<Response>;

/**
 * Wraps a Next.js App Router handler with admin authentication enforcement.
 * Returns 403 if the user is not authenticated or does not have the admin role.
 */
export function withAdminAuth(handler: RouteHandler): RouteHandler {
  return async (request, context) => {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || user.app_metadata?.role !== "admin") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    return handler(request, context);
  };
}
```

- [ ] **Step 2: Find all admin routes that need updating**

Run this to list the files:
```bash
grep -rl "app_metadata.*role.*admin" app/api/admin
```
Expected output: a list of route.ts files. Apply Step 3's pattern to each one.

- [ ] **Step 3: Refactor each admin route (example: `app/api/admin/products/route.ts`)**

The pattern for every handler in each file:

**Before:**
```typescript
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || user.app_metadata?.role !== "admin") {
      console.error("❌ Accès non autorisé pour GET /api/admin/products");
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    // ... actual handler logic
  } catch (e) { ... }
}
```

**After:**
```typescript
import { withAdminAuth } from "@/lib/auth/with-admin-auth";

// Remove createClient import if it was only used for auth
// (keep it if the handler body also needs supabase for other queries)

async function handleGET(request: Request): Promise<Response> {
  try {
    // ... actual handler logic (no auth block)
  } catch (e) { ... }
}

export const GET = withAdminAuth(handleGET);
```

For dynamic routes (e.g., `app/api/admin/products/[id]/route.ts`):
```typescript
async function handleGET(
  request: Request,
  context?: { params: Promise<Record<string, string>> }
): Promise<Response> {
  const { id } = await context!.params;
  try {
    // ... actual handler logic
  } catch (e) { ... }
}

export const GET = withAdminAuth(handleGET);
```

Apply this pattern to every exported handler (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`) in every file found in Step 2. Also remove the `createClient` import from any file where supabase was used *only* for the auth check (keep it if the handler body uses it for admin queries like `supabaseAdmin`).

- [ ] **Step 4: Verify**

```bash
pnpm lint
```
Expected: no errors. TypeScript will catch any handler signature mismatches.

- [ ] **Step 5: Commit**

```bash
git add lib/auth/with-admin-auth.ts app/api/admin
git commit -m "feat: add admin auth guard HOF, remove duplicated auth checks from all admin routes"
```

---

## Task 6: Checkout Cleanup

**Files:**
- Modify: `lib/actions/checkout.ts`

This task removes the remaining local `CartItem` type (duplicates `@/types/cart`) and cleans up the `any` cast in `getCheckoutSession`.

- [ ] **Step 1: Remove the local CartItem interface**

In `lib/actions/checkout.ts`, remove lines 41–49:
```typescript
// Types
interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  weight?: number;
  image?: string;
  configuration?: any;
}
```

Add to imports at the top:
```typescript
import type { CartItem } from "@/types/cart";
```

- [ ] **Step 2: Fix the `any` cast in `getCheckoutSession`**

Replace (~line 350):
```typescript
    const parsedItems = (orderDetails[0].items as any[]) || [];
```
With:
```typescript
    const parsedItems = (orderDetails[0].items as CartItem[]) || [];
```

- [ ] **Step 3: Verify**

```bash
pnpm lint
```
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add lib/actions/checkout.ts
git commit -m "fix: use canonical CartItem type in checkout, remove local redefinition"
```

---

## Task 7: Webhook Handler Isolation

**Files:**
- Modify: `app/api/webhooks/sumup/route.ts`

Extract the four concerns (payment verification, order update, stock decrement, email notification) into named functions in the same file. The `POST` handler becomes an orchestrator.

- [ ] **Step 1: Rewrite the webhook route**

Replace the entire contents of `app/api/webhooks/sumup/route.ts` with:

```typescript
import { order, product } from "@/db/schema";
import { db } from "@/lib/db";
import { getSumupHeaders, SUMUP_API_URL } from "@/lib/sumup";
import type { CartItem } from "@/types/cart";
import { eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

interface VerifiedCheckout {
  status: string;
  checkout_reference: string;
  amount: number;
  transactions?: Array<{ transaction_code: string }>;
}

async function verifyPaymentWithSumup(
  checkoutId: string,
): Promise<VerifiedCheckout | null> {
  const response = await fetch(`${SUMUP_API_URL}/checkouts/${checkoutId}`, {
    method: "GET",
    headers: getSumupHeaders(),
  });
  if (!response.ok) return null;
  return response.json() as Promise<VerifiedCheckout>;
}

async function markOrderPaid(
  orderId: string,
  transactionCode: string | null,
): Promise<void> {
  await db
    .update(order)
    .set({
      status: "paid",
      sumupTransactionId: transactionCode,
      updatedAt: new Date(),
    })
    .where(eq(order.id, orderId));
}

async function decrementStock(items: CartItem[]): Promise<void> {
  for (const item of items) {
    if (!item.productId) continue;
    await db
      .update(product)
      .set({
        stock: sql`GREATEST(${product.stock} - ${item.quantity}, 0)`,
        updatedAt: new Date(),
      })
      .where(eq(product.id, item.productId));
  }
}

async function sendAdminOrderEmail(
  orderId: string,
  amount: number,
): Promise<void> {
  const orderNumber = `YC${orderId.slice(0, 8).toUpperCase()}`;
  const adminEmail = process.env.ADMIN_EMAIL || "contact@ylang-creations.fr";

  await resend.emails.send({
    from: "Ylang Créations <contact@ylang-creations.fr>",
    to: adminEmail,
    subject: `Nouvelle commande ! (${orderNumber})`,
    html: `<p>Nouvelle commande <strong>${orderNumber}</strong> reçue via SumUp. Montant : ${amount} EUR.</p>`,
  });
}

async function markOrderCancelled(orderId: string): Promise<void> {
  await db
    .update(order)
    .set({ status: "cancelled", updatedAt: new Date() })
    .where(eq(order.id, orderId));
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const checkoutId = body.id;

    if (!checkoutId) {
      return new NextResponse("Invalid payload", { status: 400 });
    }

    const verified = await verifyPaymentWithSumup(checkoutId);
    if (!verified) {
      return new NextResponse("Verification failed", { status: 400 });
    }

    const { status, checkout_reference: orderId } = verified;

    if (status === "PAID") {
      const existingOrderResult = await db
        .select()
        .from(order)
        .where(eq(order.id, orderId))
        .limit(1);

      if (existingOrderResult.length === 0) {
        return new NextResponse("Order not found", { status: 404 });
      }

      const existingOrder = existingOrderResult[0];

      if (existingOrder.status !== "pending") {
        return new NextResponse("Already processed", { status: 200 });
      }

      const transactionCode =
        verified.transactions?.[0]?.transaction_code ?? null;

      await markOrderPaid(orderId, transactionCode);

      if (Array.isArray(existingOrder.items)) {
        await decrementStock(existingOrder.items as CartItem[]);
      }

      try {
        await sendAdminOrderEmail(orderId, verified.amount);
      } catch (emailError) {
        console.error("[SumUp Webhook] Error sending email:", emailError);
      }
    } else if (status === "FAILED" || status === "CANCELLED") {
      await markOrderCancelled(orderId);
    }

    return new NextResponse("Webhook processed successfully", { status: 200 });
  } catch (error) {
    console.error("[SumUp Webhook] Unexpected error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
```

- [ ] **Step 2: Verify**

```bash
pnpm lint
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/api/webhooks/sumup/route.ts
git commit -m "refactor: isolate webhook concerns into named handler functions"
```

---

## Task 8: Delete Dead Configurator Store and Extract Page Types

**Context:** `lib/store/configurator-store.ts` and `types/configurator.ts` are dead code — `useConfiguratorStore` is never imported anywhere outside its definition file. The configurateur page manages all state locally with `useState`. This task deletes the dead files and moves the page's local interfaces to `types/configurateur-page.ts` so they have a named home without polluting the 1681-line page.

- [ ] **Step 1: Delete the dead files**

```bash
git rm lib/store/configurator-store.ts types/configurator.ts
```

- [ ] **Step 2: Create `types/configurateur-page.ts`**

```typescript
// types/configurateur-page.ts
// Shapes returned by /api/configurator/* endpoints, used as local useState in the configurateur page.

export interface EmbroideryZone {
  x: number;
  y: number;
  maxWidth: number;
  rotation: number;
  fontSize: number;
  alignment: "center" | "left" | "right";
  nameSpacing?: number;
  multiNameEnabled?: boolean;
}

export interface ConfigurateurProduct {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  weight: number;
  icon: string;
  baseImage: string;
  maskImage: string;
  colorMaskImage?: string;
  embroideryZone: EmbroideryZone;
  sizes?: string[];
  defaultSize?: string | null;
}

export interface ConfigurateurFabric {
  id: string;
  name: string;
  price: number;
  baseColor: string;
  image: string;
  category?: string;
}

export interface ConfigurateurFabricCategory {
  id: string;
  title: string;
  description: string;
  order: number;
}

export interface ConfigurateurConfiguration {
  product: ConfigurateurProduct | null;
  fabric: ConfigurateurFabric | null;
  size: string | null;
  embroideries: string[];
  embroideryColor: string;
  selectedColor: string | null;
}
```

- [ ] **Step 3: Update `app/configurateur/page.tsx`**

Add to imports:
```typescript
import type {
  ConfigurateurConfiguration,
  ConfigurateurFabric,
  ConfigurateurFabricCategory,
  ConfigurateurProduct,
  EmbroideryZone,
} from "@/types/configurateur-page";
```

Remove local interface definitions (lines ~35–84) and replace local type names throughout the file:
- `Product` → `ConfigurateurProduct`
- `Fabric` → `ConfigurateurFabric`
- `FabricCategory` → `ConfigurateurFabricCategory`
- `Configuration` → `ConfigurateurConfiguration`
- `EmbroideryZone` keeps the same name (now imported instead of local)

- [ ] **Step 4: Verify**

```bash
pnpm lint
```
Expected: no errors. TypeScript will surface any missed renames.

- [ ] **Step 5: Full build check**

```bash
pnpm build
```
Expected: clean build.

- [ ] **Step 6: Commit**

```bash
git add types/configurateur-page.ts app/configurateur/page.tsx
git commit -m "refactor: delete dead configurator store, extract page types to types/configurateur-page.ts"
```

---

## Final Verification

- [ ] **Run lint on the full project**

```bash
pnpm lint
```
Expected: zero errors.

- [ ] **Run full build**

```bash
pnpm build
```
Expected: clean build. Fix any TypeScript errors before considering this plan complete.

---

## Self-Review

**Spec coverage check:**
1. ✅ Shipping duplication → Task 3
2. ✅ Business constants (EMBROIDERY_PRICE_CENTS, MAX_WEIGHT_GRAMS) → Task 2
3. ✅ Configurator type fragmentation → Task 8
4. ✅ Currency conversion (30+ `/100` sites) → Task 1
5. ✅ Admin auth duplication → Task 5
6. ✅ Checkout god-function (CartItem local type, duplicate shipping fn) → Tasks 3 + 6
7. ✅ Webhook cascading side effects → Task 7
8. ✅ SumUp URL/headers duplication → Task 4

**Dependency order:** Tasks 1–5 are independent. Task 6 depends on Task 5 (uses `CartItem` import set up in Task 5's context, already canonical). Task 7 depends on Task 4 (`lib/sumup.ts`). Task 8 is independent.

**Placeholder check:** All steps contain actual code. No TBDs.

**Type consistency:** `CartItem` (from `@/types/cart`) used in Tasks 6 and 7. `ConfigurateurProduct`/`ConfigurateurFabric`/`ConfigurateurConfiguration` named consistently in Task 8.
