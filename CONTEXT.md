# Domain Glossary — Ylang Créations

## Price

A monetary value. All prices in the system are stored and computed in **cents** (integer) to avoid floating-point errors. The exception is the cart store's `getTotalPrice()` and `getShipping()` which return euros for display. Conversion: `centsToEuros` / `eurosToCents` in `lib/currency.ts`.

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

## Order

A purchase record created at checkout. `totalAmount` is stored in **cents**. Status lifecycle: `pending` → `paid` → `shipped` → `delivered` (or `cancelled`).

## Shipping

Colissimo home-delivery rate, calculated from the total parcel weight in grams. Rate table lives in `lib/shipping.ts`. Free shipping applies when `CartItem` total ≥ `freeShippingThreshold` (euros).
