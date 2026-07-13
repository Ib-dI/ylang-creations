# Domain Glossary — Ylang Créations

## Price

A monetary value. All prices in the system are stored and computed in **cents** (integer) to avoid floating-point errors. The unit is enforced at the type level via branded types `Cents` and `Euros` in `lib/currency.ts` — use `cents()` / `euros()` factory functions and `centsToEuros()` / `eurosToCents()` for conversion; never raw `/100` or `*100`. Display: `formatPrice(n: Cents)` or `formatEuros(n: Euros)`.

**Seam règle :** the Configurateur API (`/api/configurator/*`) returns `basePrice` and `price` in **Cents** — the configurateur page uses them internally in cents and converts to Euros only when adding to cart (`centsToEuros`). All other public product APIs return prices in **Euros**.

## Configurateur

The 5-tab product customization flow at `/configurateur`. Manages its entire state locally with `useState` — there is no Zustand store. State shape: `ConfigurateurConfiguration` (see `types/configurateur-page.ts`).

## ConfigurateurProduct

A customizable product (garment) from the `configurator_product` DB table. Distinct from **CatalogProduct** — has `basePrice` (cents), `baseImage`, `maskImage`, `embroideryZone`. Fetched from `/api/configurator/products`.

## ConfigurateurFabric

A fabric option from the `configurator_fabric` DB table. `price` is in **cents**. `baseColor` is a hex string used as the cart display color and canvas fallback.

## CatalogProduct

A product from the `product` DB table, displayed in the shop catalog. `price` is stored in cents; the public API (`/api/products`) returns it in euros. Type: `CatalogProduct` in `data/products.ts`.

## CartItem

An item in the user's cart (persisted in Zustand). `price` is in **euros** (converted at the point of addition). `weight` is in grams. `configuration` holds the fabric name, color, embroidery text, and size chosen in the Configurateur.

## Admin

A Supabase-authenticated `user` whose `app_metadata.role === "admin"`. There is no `role` column on the `user` DB table — admin-ness lives entirely in Supabase auth metadata. This exact check is intentionally duplicated in `middleware.ts` (gates `/admin/:path*` page navigation) and `lib/auth/with-admin-auth.ts` (gates every `/api/admin/*` route handler independently) — see `docs/adr/0001-admin-middleware-auth.md`. Both must stay in sync with this definition if the role model ever changes.

## Order

A purchase record created at checkout. `totalAmount` is stored in **cents**. Status lifecycle: `pending` → `paid` → `shipped` → `delivered` (or `cancelled`).

## Shipping

Colissimo home-delivery rate, calculated from the total parcel weight in grams. `calculateShippingRate(weightGrams): Euros` is the single authority — `lib/shipping.ts` is the only place Colissimo tiers are defined. `FALLBACK_SHIPPING_EUR` (9.59 €) is used when no weight is available. Free shipping applies when `CartItem` total ≥ `freeShippingThreshold` (Euros). The `settings.shippingFee` DB column is used as fallback only in checkout when no Colissimo tier applies; the cart UI uses `FALLBACK_SHIPPING_EUR` directly.
