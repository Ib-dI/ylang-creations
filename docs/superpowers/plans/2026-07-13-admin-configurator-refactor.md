# Admin Configurator Page Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the Server-Component-fetch pattern to `/admin/configurator`, the last remaining admin page. Unlike the previous four pages, this is a **single route with 5 client-side tabs** (fabrics, products, broderie, palettes, polices), not 5 separate routes — so this plan produces one Server Component, one large client component, and one `loading.tsx` for the whole page, not per-tab.

**Architecture:** `app/admin/configurator/page.tsx` becomes an `async` Server Component that fetches 5 resources in parallel via `Promise.all` — fabrics, configurator products, categories, colors, and embroidery fonts (all new `lib/admin/get-configurator-*-data.ts` functions) — mirroring the `Promise.all` the current client component already does in its own `fetchData()`. All 5 are passed as `initial*` props to a new `components/admin/configurator-client.tsx`. Mutations (fabric/category/product/color CRUD, active toggles, embroidery zone save) switch from local optimistic state updates to `startTransition(() => router.refresh())`, following the products-page pattern (not the simpler users/newsletter read-only pattern — this page mutates heavily).

**The one non-mechanical risk in this conversion:** `embroideryProduct` (which product is selected in the Broderie tab's live editor) is local `useState`, not derived from props — it must stay local (the editor session persists across a save), but after `handleSaveEmbroidery`'s `router.refresh()`, the underlying `products` list refreshes while `embroideryProduct` would NOT auto-update (classic stale-derived-state bug). This plan resolves it explicitly: `handleSaveEmbroidery` patches `embroideryProduct` with the exact zone value just saved (we know precisely what changed), independently of the `router.refresh()` that refreshes the `products` list for everything else (the product picker's "✓ Calibré" badge, the Products tab, etc.).

**Out of scope:** `components/admin/configurator/embroidery-fonts-panel.tsx` (the widget shown in the Polices tab) is a separate, self-contained component with its own client-side fetch/CRUD for font management — same "detail page / self-contained widget" exception already applied to `/admin/orders/[id]` and `/admin/users/[id]`. This plan only converts the *main* component's own read-only `embroideryFonts` list (used for the Broderie tab's preview-font dropdown), not the panel's internal font management.

## Global Constraints

- No test framework exists — verification is `pnpm build` and manual dev-server/curl checks.
- Currency bug audit (per the recommendation from the products/users/newsletter reviews, where this bug recurred twice): the current client does `f.price / 100` and `p.basePrice / 100` itself after fetching raw-cents JSON from `/api/admin/configurator/fabrics` and `/api/admin/configurator/products` — both API routes return raw cents, unconverted. The new `lib/admin/get-configurator-fabrics-data.ts` and `lib/admin/get-configurator-products-data.ts` must use `centsToEuros(cents(...))` instead of a raw `/100`. `configuratorEmbroideryFont.price` is stored in cents but never displayed by the *main* component (only by the out-of-scope `EmbroideryFontsPanel`) — left as raw cents in `ConfiguratorEmbroideryFontAdmin`, matching the field this plan's consumer doesn't use for display.
- Do not add `export const dynamic = "force-dynamic"` (confirmed incompatible with `cacheComponents: true` in prior refactors).
- `lib/admin/get-configurator-products-data.ts` must apply `normalizeEmbroideryZoneByFont()` (from `@/lib/configurator/normalize-embroidery-zone`, unchanged) to each product's `embroideryZone`, exactly like the unchanged `/api/admin/configurator/products` GET route does — this is what makes old flat-shape embroidery zone rows compatible with the per-font map shape the UI expects.
- Reuse the canonical `EmbroideryZone` type from `@/types/configurateur-page` (already used by `normalizeEmbroideryZoneByFont`) for both the lib function's return type and the client component's local embroidery-zone editing state — do not redefine a parallel local type, to avoid drift.
- Mutations keep calling the existing `/api/admin/configurator/{fabrics,categories,products,colors}` routes (all unchanged, out of scope) and `/api/admin/storage/upload`. After every successful mutation, call `startTransition(() => router.refresh())` instead of local `setFabrics`/`setProducts`/`setCategories`/`setColors` state updates — except `embroideryProduct`, which stays local (see Architecture above).
- `EmbroideryFontsPanel` (`components/admin/configurator/embroidery-fonts-panel.tsx`) is not touched by this plan.

---

### Task 1: Create the 5 `lib/admin/get-configurator-*-data.ts` functions

**Files:**
- Create: `lib/admin/get-configurator-fabrics-data.ts`
- Create: `lib/admin/get-configurator-categories-data.ts`
- Create: `lib/admin/get-configurator-colors-data.ts`
- Create: `lib/admin/get-configurator-products-data.ts`
- Create: `lib/admin/get-configurator-embroidery-fonts-data.ts`

**Interfaces:**
- Consumes: `db` from `@/lib/db`, `configuratorFabric`/`configuratorFabricCategory`/`configuratorColor`/`configuratorProduct`/`configuratorEmbroideryFont` from `@/db/schema`, `cents`/`centsToEuros` from `@/lib/currency`, `normalizeEmbroideryZoneByFont` from `@/lib/configurator/normalize-embroidery-zone`, `EmbroideryZone` type from `@/types/configurateur-page`.
- Produces: `ConfiguratorFabricAdmin`/`getConfiguratorFabricsData()`, `ConfiguratorFabricCategoryAdmin`/`getConfiguratorCategoriesData()`, `ConfiguratorColorAdmin`/`getConfiguratorColorsData()`, `ConfiguratorProductAdmin`/`getConfiguratorProductsData()`, `ConfiguratorEmbroideryFontAdmin`/`getConfiguratorEmbroideryFontsData()`. Task 2's `ConfiguratorClient` imports all 5 types; Task 3's Server Component imports all 5 functions.

- [ ] **Step 1: Write `lib/admin/get-configurator-fabrics-data.ts`**

Mirrors `/api/admin/configurator/fabrics` GET (unchanged, out of scope) but with the currency fix — the API route returns raw cents and the *client* currently does `f.price / 100` itself; this function does the conversion correctly instead.

```ts
import { configuratorFabric } from "@/db/schema";
import { db } from "@/lib/db";
import { cents, centsToEuros } from "@/lib/currency";

export interface ConfiguratorFabricAdmin {
  id: string;
  name: string;
  price: number;
  baseColor: string;
  image: string;
  category: string;
  isActive: boolean;
}

export async function getConfiguratorFabricsData(): Promise<ConfiguratorFabricAdmin[]> {
  const rows = await db.select().from(configuratorFabric);
  return rows.map((f) => ({
    id: f.id,
    name: f.name,
    price: centsToEuros(cents(f.price)),
    baseColor: f.baseColor,
    image: f.image,
    category: f.category,
    isActive: f.isActive,
  }));
}
```

- [ ] **Step 2: Write `lib/admin/get-configurator-categories-data.ts`**

```ts
import { configuratorFabricCategory } from "@/db/schema";
import { db } from "@/lib/db";

export interface ConfiguratorFabricCategoryAdmin {
  id: string;
  title: string;
  description: string | null;
  order: number;
  isActive: boolean;
}

export async function getConfiguratorCategoriesData(): Promise<ConfiguratorFabricCategoryAdmin[]> {
  const rows = await db
    .select()
    .from(configuratorFabricCategory)
    .orderBy(configuratorFabricCategory.order);
  return rows.map((c) => ({
    id: c.id,
    title: c.title,
    description: c.description,
    order: c.order,
    isActive: c.isActive,
  }));
}
```

- [ ] **Step 3: Write `lib/admin/get-configurator-colors-data.ts`**

```ts
import { configuratorColor } from "@/db/schema";
import { db } from "@/lib/db";

export interface ConfiguratorColorAdmin {
  id: string;
  name: string;
  hex: string;
  type: "product" | "embroidery";
  order: number;
  isActive: boolean;
}

export async function getConfiguratorColorsData(): Promise<ConfiguratorColorAdmin[]> {
  const rows = await db
    .select()
    .from(configuratorColor)
    .orderBy(configuratorColor.order, configuratorColor.createdAt);
  return rows.map((c) => ({
    id: c.id,
    name: c.name,
    hex: c.hex,
    type: c.type as "product" | "embroidery",
    order: c.order,
    isActive: c.isActive,
  }));
}
```

- [ ] **Step 4: Write `lib/admin/get-configurator-products-data.ts`**

```ts
import { configuratorProduct } from "@/db/schema";
import { db } from "@/lib/db";
import { cents, centsToEuros } from "@/lib/currency";
import { normalizeEmbroideryZoneByFont } from "@/lib/configurator/normalize-embroidery-zone";
import type { EmbroideryZone } from "@/types/configurateur-page";

export interface ConfiguratorProductAdmin {
  id: string;
  name: string;
  description: string | null;
  basePrice: number;
  weight: number;
  icon: string | null;
  baseImage: string;
  maskImage: string;
  colorMaskImage: string | null;
  embroideryZone: Record<string, EmbroideryZone>;
  sizes: string[] | null;
  defaultSize: string | null;
  isActive: boolean;
}

export async function getConfiguratorProductsData(): Promise<ConfiguratorProductAdmin[]> {
  const rows = await db.select().from(configuratorProduct);
  return rows.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    basePrice: centsToEuros(cents(p.basePrice)),
    weight: p.weight,
    icon: p.icon,
    baseImage: p.baseImage,
    maskImage: p.maskImage,
    colorMaskImage: p.colorMaskImage,
    embroideryZone: normalizeEmbroideryZoneByFont(p.embroideryZone),
    sizes: p.sizes as string[] | null,
    defaultSize: p.defaultSize,
    isActive: p.isActive,
  }));
}
```

- [ ] **Step 5: Write `lib/admin/get-configurator-embroidery-fonts-data.ts`**

No currency conversion here — `price` is stored in cents and this function's only consumer (the main configurator client's Broderie-tab preview dropdown) never displays it, so it's carried through as-is (matching the unchanged API route, which also returns raw cents).

```ts
import { configuratorEmbroideryFont } from "@/db/schema";
import { db } from "@/lib/db";

export interface ConfiguratorEmbroideryFontAdmin {
  id: string;
  name: string;
  folder: string;
  format: "exp" | "pes";
  price: number;
  order: number;
  isActive: boolean;
  supportsThreadColor: boolean;
}

export async function getConfiguratorEmbroideryFontsData(): Promise<ConfiguratorEmbroideryFontAdmin[]> {
  const rows = await db.select().from(configuratorEmbroideryFont);
  return rows.map((f) => ({
    id: f.id,
    name: f.name,
    folder: f.folder,
    format: f.format as "exp" | "pes",
    price: f.price,
    order: f.order,
    isActive: f.isActive,
    supportsThreadColor: f.supportsThreadColor,
  }));
}
```

- [ ] **Step 6: Typecheck**

Run: `pnpm build`
Expected: no type errors.

- [ ] **Step 7: Commit**

```bash
git add lib/admin/get-configurator-fabrics-data.ts lib/admin/get-configurator-categories-data.ts lib/admin/get-configurator-colors-data.ts lib/admin/get-configurator-products-data.ts lib/admin/get-configurator-embroidery-fonts-data.ts
git commit -m "feat(admin): add lib/admin/get-configurator-*-data.ts for server-side configurator fetching"
```

---

### Task 2: Create `components/admin/configurator-client.tsx`

**Files:**
- Create: `components/admin/configurator-client.tsx` — created by copying the CURRENT `app/admin/configurator/page.tsx` verbatim, then applying the exact edits below in order. Do not paraphrase or reformat untouched sections; every JSX section not named below stays byte-identical to the source file, since all field names on the new `*Admin` types are unchanged from the old inline types.

**Interfaces:**
- Consumes: `ConfiguratorFabricAdmin`, `ConfiguratorFabricCategoryAdmin`, `ConfiguratorColorAdmin`, `ConfiguratorProductAdmin`, `ConfiguratorEmbroideryFontAdmin` from the 5 Task 1 files; `EmbroideryZone` from `@/types/configurateur-page`.
- Produces: `ConfiguratorClient({ initialFabrics, initialProducts, initialCategories, initialColors, initialEmbroideryFonts })` — a client component with no data-fetching of its own. Task 4 renders this with the output of the 5 `getConfigurator*Data()` calls.

- [ ] **Step 1: Copy the source file**

```bash
cp app/admin/configurator/page.tsx components/admin/configurator-client.tsx
```

- [ ] **Step 2: Edit the imports**

Replace:
```tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TrashBin } from "@gravity-ui/icons";
import { AnimatePresence } from "framer-motion";
import { ImageUpload } from "@/components/ui/image-upload";
import { Loader2, Plus, Edit, Trash2, Eye, EyeOff, Search, ChevronDown, LayoutGrid, List, Palette, Crosshair, RotateCcw, Type, Maximize2, Package } from "lucide-react";
import { toast } from "sonner";
import EmbroideryZoneOverlay from "@/components/configurator/EmbroideryZoneOverlay";
import EmbroideryFontsPanel from "@/components/admin/configurator/embroidery-fonts-panel";
```

with:
```tsx
"use client";

import { useState, useEffect, useRef, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TrashBin } from "@gravity-ui/icons";
import { AnimatePresence } from "framer-motion";
import { ImageUpload } from "@/components/ui/image-upload";
import type { ConfiguratorFabricAdmin } from "@/lib/admin/get-configurator-fabrics-data";
import type { ConfiguratorFabricCategoryAdmin } from "@/lib/admin/get-configurator-categories-data";
import type { ConfiguratorColorAdmin } from "@/lib/admin/get-configurator-colors-data";
import type { ConfiguratorProductAdmin } from "@/lib/admin/get-configurator-products-data";
import type { ConfiguratorEmbroideryFontAdmin } from "@/lib/admin/get-configurator-embroidery-fonts-data";
import type { EmbroideryZone } from "@/types/configurateur-page";
import { Loader2, Plus, Edit, Trash2, Eye, EyeOff, Search, ChevronDown, LayoutGrid, List, Palette, Crosshair, RotateCcw, Type, Maximize2, Package } from "lucide-react";
import { toast } from "sonner";
import EmbroideryZoneOverlay from "@/components/configurator/EmbroideryZoneOverlay";
import EmbroideryFontsPanel from "@/components/admin/configurator/embroidery-fonts-panel";
```

- [ ] **Step 3: Remove the redundant local type aliases**

Delete this entire block (it's fully replaced by the imported types from Step 2 — `EmbroideryZone` now comes from `@/types/configurateur-page`, and `Fabric`/`ConfigProduct`/`FabricCategory`/`Color`/`EmbroideryFont` are replaced one-for-one by `ConfiguratorFabricAdmin`/`ConfiguratorProductAdmin`/`ConfiguratorFabricCategoryAdmin`/`ConfiguratorColorAdmin`/`ConfiguratorEmbroideryFontAdmin`):

```tsx
type Fabric = {
  id: string;
  name: string;
  price: number;
  baseColor: string;
  image: string;
  category: string;
  isActive: boolean;
};

type EmbroideryZone = {
  x: number;
  y: number;
  maxWidth: number;
  rotation: number;
  fontSize: number;
  alignment: "center" | "left" | "right";
  nameSpacing?: number;
  multiNameEnabled?: boolean;
};

type ConfigProduct = {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  weight: number;
  icon: string | null;
  baseImage: string;
  maskImage: string;
  colorMaskImage: string | null;
  embroideryZone: Record<string, EmbroideryZone> | null;
  sizes: string[] | null;
  defaultSize: string | null;
  isActive: boolean;
};

type FabricCategory = {
  id: string; // prefix
  title: string;
  description: string;
  order: number;
  isActive: boolean;
};

type Color = {
  id: string;
  name: string;
  hex: string;
  type: "product" | "embroidery";
  order: number;
  isActive: boolean;
};

type EmbroideryFont = {
  id: string;
  name: string;
  folder: string;
  format: "exp" | "pes";
  price: number;
  order: number;
  isActive: boolean;
  supportsThreadColor: boolean;
};
```

(delete the whole block — nothing replaces it in-place, the replacement types are already imported in Step 2)

- [ ] **Step 4: Convert the component signature and top-of-function state**

Replace:
```tsx
export default function ConfiguratorAdmin() {
  const [activeTab, setActiveTab] = useState<"fabrics" | "products" | "broderie" | "palettes" | "polices">("fabrics");
  const [fabrics, setFabrics] = useState<Fabric[]>([]);
  const [products, setProducts] = useState<ConfigProduct[]>([]);
  const [categories, setCategories] = useState<FabricCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & filter
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Fabric modal
  const [isFabricModalOpen, setIsFabricModalOpen] = useState(false);
  const [editingFabric, setEditingFabric] = useState<(Omit<Partial<Fabric>, "image"> & { image?: string | File }) | null>(null);
  const [isSavingFabric, setIsSavingFabric] = useState(false);

  // Product modal
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<ConfigProduct> | null>(null);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [newSizeInput, setNewSizeInput] = useState("");
  const [productImages, setProductImages] = useState<{
    baseImage: string | File;
    maskImage: string | File;
    colorMaskImage: string | File | null;
  }>({ baseImage: "", maskImage: "", colorMaskImage: null });

  // Category modal
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Partial<FabricCategory> | null>(null);

  // Palettes tab
  const [colors, setColors] = useState<Color[]>([]);
  const [embroideryFonts, setEmbroideryFonts] = useState<EmbroideryFont[]>([]);
  const [colorSubTab, setColorSubTab] = useState<"product" | "embroidery">("product");
  const [isColorModalOpen, setIsColorModalOpen] = useState(false);
  const [editingColor, setEditingColor] = useState<Partial<Color> | null>(null);
  const [isSavingColor, setIsSavingColor] = useState(false);

  // Broderie tab
  const [embroideryProduct, setEmbroideryProduct] = useState<ConfigProduct | null>(null);
```

with:
```tsx
interface ConfiguratorClientProps {
  initialFabrics: ConfiguratorFabricAdmin[];
  initialProducts: ConfiguratorProductAdmin[];
  initialCategories: ConfiguratorFabricCategoryAdmin[];
  initialColors: ConfiguratorColorAdmin[];
  initialEmbroideryFonts: ConfiguratorEmbroideryFontAdmin[];
}

export function ConfiguratorClient({
  initialFabrics,
  initialProducts,
  initialCategories,
  initialColors,
  initialEmbroideryFonts,
}: ConfiguratorClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<"fabrics" | "products" | "broderie" | "palettes" | "polices">("fabrics");
  const fabrics = initialFabrics;
  const products = initialProducts;
  const categories = initialCategories;

  // Search & filter
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Fabric modal
  const [isFabricModalOpen, setIsFabricModalOpen] = useState(false);
  const [editingFabric, setEditingFabric] = useState<(Omit<Partial<ConfiguratorFabricAdmin>, "image"> & { image?: string | File }) | null>(null);
  const [isSavingFabric, setIsSavingFabric] = useState(false);

  // Product modal
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<ConfiguratorProductAdmin> | null>(null);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [newSizeInput, setNewSizeInput] = useState("");
  const [productImages, setProductImages] = useState<{
    baseImage: string | File;
    maskImage: string | File;
    colorMaskImage: string | File | null;
  }>({ baseImage: "", maskImage: "", colorMaskImage: null });

  // Category modal
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Partial<ConfiguratorFabricCategoryAdmin> | null>(null);

  // Palettes tab
  const colors = initialColors;
  const embroideryFonts = initialEmbroideryFonts;
  const [colorSubTab, setColorSubTab] = useState<"product" | "embroidery">("product");
  const [isColorModalOpen, setIsColorModalOpen] = useState(false);
  const [editingColor, setEditingColor] = useState<Partial<ConfiguratorColorAdmin> | null>(null);
  const [isSavingColor, setIsSavingColor] = useState(false);

  // Broderie tab
  const [embroideryProduct, setEmbroideryProduct] = useState<ConfiguratorProductAdmin | null>(null);
```

- [ ] **Step 5: Fix `handleSaveEmbroidery` — patch `embroideryProduct` locally, refresh the list**

Replace:
```tsx
  const handleSaveEmbroidery = async () => {
    if (!embroideryProduct) return;
    setIsSavingEmbroidery(true);
    try {
      const updatedZoneMap = { ...(embroideryProduct.embroideryZone ?? {}), [previewFontId]: embroideryZone };
      const res = await fetch(`/api/admin/configurator/products?id=${embroideryProduct.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ embroideryZone: updatedZoneMap }),
      });
      if (res.ok) {
        toast.success("Zone de broderie sauvegardée");
        setProducts(prev => prev.map(p =>
          p.id === embroideryProduct.id ? { ...p, embroideryZone: updatedZoneMap } : p
        ));
        setEmbroideryProduct(prev => prev ? { ...prev, embroideryZone: updatedZoneMap } : prev);
      } else {
        toast.error("Erreur lors de la sauvegarde");
      }
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setIsSavingEmbroidery(false);
    }
  };
```

with:
```tsx
  const handleSaveEmbroidery = async () => {
    if (!embroideryProduct) return;
    setIsSavingEmbroidery(true);
    try {
      const updatedZoneMap = { ...(embroideryProduct.embroideryZone ?? {}), [previewFontId]: embroideryZone };
      const res = await fetch(`/api/admin/configurator/products?id=${embroideryProduct.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ embroideryZone: updatedZoneMap }),
      });
      if (res.ok) {
        toast.success("Zone de broderie sauvegardée");
        // embroideryProduct is local "currently editing" state, not derived
        // from props — patch it with the exact value just saved so the
        // editor keeps showing correct data while router.refresh() below
        // re-fetches the `products` list (used elsewhere: product picker's
        // "Calibré" badge, Products tab, etc.).
        setEmbroideryProduct(prev => prev ? { ...prev, embroideryZone: updatedZoneMap } : prev);
        startTransition(() => router.refresh());
      } else {
        toast.error("Erreur lors de la sauvegarde");
      }
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setIsSavingEmbroidery(false);
    }
  };
```

- [ ] **Step 6: Simplify `handleConfirmDelete`**

Replace:
```tsx
  const handleConfirmDelete = async () => {
    if (!deleteConfirmation.id) return;
    try {
      const url = deleteConfirmation.type === "fabric"
        ? `/api/admin/configurator/fabrics?id=${deleteConfirmation.id}`
        : deleteConfirmation.type === "category"
        ? `/api/admin/configurator/categories?id=${deleteConfirmation.id}`
        : deleteConfirmation.type === "color"
        ? `/api/admin/configurator/colors?id=${deleteConfirmation.id}`
        : `/api/admin/configurator/products?id=${deleteConfirmation.id}`;
      const res = await fetch(url, { method: "DELETE" });
      if (res.ok) {
        toast.success(
          deleteConfirmation.type === "fabric" ? "Tissu supprimé" :
          deleteConfirmation.type === "category" ? "Catégorie supprimée" :
          deleteConfirmation.type === "color" ? "Couleur supprimée" :
          "Produit supprimé"
        );
        setDeleteConfirmation({ isOpen: false, type: "fabric", id: null, name: "" });
        if (deleteConfirmation.type === "color") {
          setColors(prev => prev.filter(c => c.id !== deleteConfirmation.id));
        } else {
          fetchData();
        }
      } else {
        toast.error("Erreur lors de la suppression");
      }
    } catch {
      toast.error("Erreur réseau");
    }
  };
```

with:
```tsx
  const handleConfirmDelete = async () => {
    if (!deleteConfirmation.id) return;
    try {
      const url = deleteConfirmation.type === "fabric"
        ? `/api/admin/configurator/fabrics?id=${deleteConfirmation.id}`
        : deleteConfirmation.type === "category"
        ? `/api/admin/configurator/categories?id=${deleteConfirmation.id}`
        : deleteConfirmation.type === "color"
        ? `/api/admin/configurator/colors?id=${deleteConfirmation.id}`
        : `/api/admin/configurator/products?id=${deleteConfirmation.id}`;
      const res = await fetch(url, { method: "DELETE" });
      if (res.ok) {
        toast.success(
          deleteConfirmation.type === "fabric" ? "Tissu supprimé" :
          deleteConfirmation.type === "category" ? "Catégorie supprimée" :
          deleteConfirmation.type === "color" ? "Couleur supprimée" :
          "Produit supprimé"
        );
        setDeleteConfirmation({ isOpen: false, type: "fabric", id: null, name: "" });
        startTransition(() => router.refresh());
      } else {
        toast.error("Erreur lors de la suppression");
      }
    } catch {
      toast.error("Erreur réseau");
    }
  };
```

- [ ] **Step 7: Remove `fetchData`/`useEffect` entirely**

Delete this whole block (data now arrives via props, no client fetch needed):

```tsx
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [fabricsRes, productsRes, categoriesRes, colorsRes, embroideryFontsRes] = await Promise.all([
        fetch("/api/admin/configurator/fabrics"),
        fetch("/api/admin/configurator/products"),
        fetch("/api/admin/configurator/categories"),
        fetch("/api/admin/configurator/colors"),
        fetch("/api/admin/configurator/embroidery-fonts"),
      ]);
      const fabricsData = await fabricsRes.json();
      const productsData = await productsRes.json();
      const categoriesData = await categoriesRes.json();
      const colorsData = await colorsRes.json();
      const embroideryFontsData = await embroideryFontsRes.json();
      setFabrics(fabricsData.fabrics?.map((f: Fabric) => ({ ...f, price: f.price / 100 })) || []);
      setProducts(productsData.products?.map((p: ConfigProduct) => ({ ...p, basePrice: p.basePrice / 100 })) || []);
      setCategories(categoriesData.categories || []);
      setColors(colorsData.colors || []);
      setEmbroideryFonts(embroideryFontsData.fonts || []);
    } catch (e) {
      console.error("Failed to load configurator data", e);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);
```

(delete the whole block, nothing replaces it)

- [ ] **Step 8: Simplify `handleColorSubmit`**

Replace:
```tsx
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingColor),
      });
      if (res.ok) {
        const data = await res.json();
        toast.success(isExisting ? "Couleur mise à jour" : "Couleur ajoutée");
        setIsColorModalOpen(false);
        setEditingColor(null);
        if (isExisting) {
          setColors(prev => prev.map(c => c.id === data.color.id ? data.color : c));
        } else {
          setColors(prev => [...prev, data.color]);
        }
      } else {
        const err = await res.json();
        toast.error("Erreur : " + (err.error || "Inconnu"));
      }
    } catch { toast.error("Erreur réseau"); }
    finally { setIsSavingColor(false); }
  };
```

with:
```tsx
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingColor),
      });
      if (res.ok) {
        toast.success(isExisting ? "Couleur mise à jour" : "Couleur ajoutée");
        setIsColorModalOpen(false);
        setEditingColor(null);
        startTransition(() => router.refresh());
      } else {
        const err = await res.json();
        toast.error("Erreur : " + (err.error || "Inconnu"));
      }
    } catch { toast.error("Erreur réseau"); }
    finally { setIsSavingColor(false); }
  };
```

- [ ] **Step 9: Simplify `toggleColorActive`**

Replace:
```tsx
  const toggleColorActive = async (color: Color) => {
    try {
      const res = await fetch(`/api/admin/configurator/colors?id=${color.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !color.isActive }),
      });
      if (res.ok) {
        setColors(prev => prev.map(c => c.id === color.id ? { ...c, isActive: !c.isActive } : c));
      } else {
        toast.error("Erreur lors de la mise à jour");
      }
    } catch { toast.error("Erreur réseau"); }
  };
```

with:
```tsx
  const toggleColorActive = async (color: ConfiguratorColorAdmin) => {
    try {
      const res = await fetch(`/api/admin/configurator/colors?id=${color.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !color.isActive }),
      });
      if (res.ok) {
        startTransition(() => router.refresh());
      } else {
        toast.error("Erreur lors de la mise à jour");
      }
    } catch { toast.error("Erreur réseau"); }
  };
```

- [ ] **Step 10: Simplify `handleCategorySubmit`**

Replace:
```tsx
      if (res.ok) {
        toast.success(isExisting ? "Catégorie mise à jour" : "Catégorie créée");
        setIsCategoryModalOpen(false);
        setEditingCategory(null);
        fetchData();
      } else {
        const err = await res.json();
        toast.error("Erreur serveur : " + (err.error || "Une erreur est survenue"));
      }
    } catch { toast.error("Erreur réseau"); }
  };

  const toggleCategoryActive = async (category: FabricCategory, e: React.MouseEvent) => {
```

with:
```tsx
      if (res.ok) {
        toast.success(isExisting ? "Catégorie mise à jour" : "Catégorie créée");
        setIsCategoryModalOpen(false);
        setEditingCategory(null);
        startTransition(() => router.refresh());
      } else {
        const err = await res.json();
        toast.error("Erreur serveur : " + (err.error || "Une erreur est survenue"));
      }
    } catch { toast.error("Erreur réseau"); }
  };

  const toggleCategoryActive = async (category: ConfiguratorFabricCategoryAdmin, e: React.MouseEvent) => {
```

- [ ] **Step 11: Simplify `toggleCategoryActive`'s body**

Replace:
```tsx
      if (res.ok) {
        toast.success(category.isActive ? "Catégorie désactivée" : "Catégorie activée");
        setCategories(prev => prev.map(c => c.id === category.id ? { ...c, isActive: !c.isActive } : c));
      } else {
        const err = await res.json();
        toast.error("Erreur : " + (err.error || "Inconnu"));
      }
    } catch { toast.error("Erreur réseau"); }
  };

  const deleteCategory = (id: string, name: string, e: React.MouseEvent) => {
```

with:
```tsx
      if (res.ok) {
        toast.success(category.isActive ? "Catégorie désactivée" : "Catégorie activée");
        startTransition(() => router.refresh());
      } else {
        const err = await res.json();
        toast.error("Erreur : " + (err.error || "Inconnu"));
      }
    } catch { toast.error("Erreur réseau"); }
  };

  const deleteCategory = (id: string, name: string, e: React.MouseEvent) => {
```

- [ ] **Step 12: Simplify `handleFabricSubmit`**

Replace:
```tsx
      if (res.ok) {
        toast.success(isExisting ? "Tissu mis à jour" : "Tissu créé");
        setIsFabricModalOpen(false);
        setEditingFabric(null);
        fetchData();
      } else {
        const err = await res.json();
        toast.error("Erreur serveur : " + (err.error || "Une erreur est survenue"));
      }
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setIsSavingFabric(false);
    }
  };

  const toggleFabricActive = async (fabric: Fabric, e: React.MouseEvent) => {
```

with:
```tsx
      if (res.ok) {
        toast.success(isExisting ? "Tissu mis à jour" : "Tissu créé");
        setIsFabricModalOpen(false);
        setEditingFabric(null);
        startTransition(() => router.refresh());
      } else {
        const err = await res.json();
        toast.error("Erreur serveur : " + (err.error || "Une erreur est survenue"));
      }
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setIsSavingFabric(false);
    }
  };

  const toggleFabricActive = async (fabric: ConfiguratorFabricAdmin, e: React.MouseEvent) => {
```

- [ ] **Step 13: Simplify `toggleFabricActive`'s body**

Replace:
```tsx
      if (res.ok) {
        toast.success(fabric.isActive ? "Tissu désactivé" : "Tissu activé");
        // Optimistic update
        setFabrics(prev => prev.map(f => f.id === fabric.id ? { ...f, isActive: !f.isActive } : f));
      } else {
        const err = await res.json();
        toast.error("Erreur : " + (err.error || "Inconnu"));
      }
    } catch { toast.error("Erreur réseau"); }
  };

  const deleteFabric = (id: string, name: string) => {
```

with:
```tsx
      if (res.ok) {
        toast.success(fabric.isActive ? "Tissu désactivé" : "Tissu activé");
        startTransition(() => router.refresh());
      } else {
        const err = await res.json();
        toast.error("Erreur : " + (err.error || "Inconnu"));
      }
    } catch { toast.error("Erreur réseau"); }
  };

  const deleteFabric = (id: string, name: string) => {
```

- [ ] **Step 14: Simplify `handleOpenProductModal`'s type and `handleProductSubmit`**

Replace:
```tsx
  const handleOpenProductModal = (product?: ConfigProduct) => {
```
with:
```tsx
  const handleOpenProductModal = (product?: ConfiguratorProductAdmin) => {
```

Replace:
```tsx
      if (res.ok) {
        toast.success(isExisting ? "Produit mis à jour" : "Produit créé");
        setIsProductModalOpen(false);
        setEditingProduct(null);
        fetchData();
      } else {
        const err = await res.json();
        toast.error("Erreur : " + (err.error || "Une erreur est survenue"));
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur réseau");
    } finally {
      setIsSavingProduct(false);
    }
  };

  const toggleProductActive = async (product: ConfigProduct) => {
```

with:
```tsx
      if (res.ok) {
        toast.success(isExisting ? "Produit mis à jour" : "Produit créé");
        setIsProductModalOpen(false);
        setEditingProduct(null);
        startTransition(() => router.refresh());
      } else {
        const err = await res.json();
        toast.error("Erreur : " + (err.error || "Une erreur est survenue"));
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur réseau");
    } finally {
      setIsSavingProduct(false);
    }
  };

  const toggleProductActive = async (product: ConfiguratorProductAdmin) => {
```

- [ ] **Step 15: Simplify `toggleProductActive`'s body**

Replace:
```tsx
      if (res.ok) {
        toast.success(product.isActive ? "Produit désactivé" : "Produit activé");
        setProducts(prev => prev.map(p => p.id === product.id ? { ...p, isActive: !p.isActive } : p));
      } else {
        const err = await res.json();
        toast.error("Erreur : " + (err.error || "Inconnu"));
      }
    } catch { toast.error("Erreur réseau"); }
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: "var(--color-ink-3)" }} strokeWidth={1.5} />
        <p className="font-body text-sm" style={{ color: "var(--color-ink-3)" }}>Chargement du configurateur…</p>
      </div>
    );
  }

  return (
```

with:
```tsx
      if (res.ok) {
        toast.success(product.isActive ? "Produit désactivé" : "Produit activé");
        startTransition(() => router.refresh());
      } else {
        const err = await res.json();
        toast.error("Erreur : " + (err.error || "Inconnu"));
      }
    } catch { toast.error("Erreur réseau"); }
  };

  return (
```

(the `if (isLoading) { ... }` early-return block is deleted entirely — there's no more loading state to gate on, `loading.tsx` from Task 4 handles the equivalent moment)

- [ ] **Step 16: Add `isPending` to the mutation-in-flight disabled states**

In the fabric modal submit button, replace:
```tsx
            <button type="submit" disabled={isSavingFabric} className="mt-4 flex w-full items-center justify-center gap-2 py-3 font-body font-medium transition-opacity hover:opacity-80 disabled:opacity-50" style={{ background: "var(--color-ink)", color: "var(--color-paper)" }}>
```
with:
```tsx
            <button type="submit" disabled={isSavingFabric || isPending} className="mt-4 flex w-full items-center justify-center gap-2 py-3 font-body font-medium transition-opacity hover:opacity-80 disabled:opacity-50" style={{ background: "var(--color-ink)", color: "var(--color-paper)" }}>
```

In the product modal submit button, replace:
```tsx
                disabled={isSavingProduct}
                className="flex w-full items-center justify-center gap-2 py-3 font-body font-medium transition-opacity hover:opacity-80 disabled:opacity-50 disabled:pointer-events-none"
```
with:
```tsx
                disabled={isSavingProduct || isPending}
                className="flex w-full items-center justify-center gap-2 py-3 font-body font-medium transition-opacity hover:opacity-80 disabled:opacity-50 disabled:pointer-events-none"
```

In the color modal submit button, replace:
```tsx
              disabled={isSavingColor}
              className="mt-1 flex w-full items-center justify-center gap-2 py-3.5 font-body font-medium transition-opacity hover:opacity-80 disabled:opacity-50"
```
with:
```tsx
              disabled={isSavingColor || isPending}
              className="mt-1 flex w-full items-center justify-center gap-2 py-3.5 font-body font-medium transition-opacity hover:opacity-80 disabled:opacity-50"
```

In the embroidery zone save button, replace:
```tsx
                  onClick={handleSaveEmbroidery}
                  disabled={isSavingEmbroidery}
```
with:
```tsx
                  onClick={handleSaveEmbroidery}
                  disabled={isSavingEmbroidery || isPending}
```

In the delete-confirmation dialog's confirm button, replace:
```tsx
                <Button
                  variant="primary"
                  className="cursor-pointer bg-red-500 font-medium text-white hover:bg-red-600"
                  onClick={handleConfirmDelete}
                >
                  Supprimer définitivement
                </Button>
```
with:
```tsx
                <Button
                  variant="primary"
                  disabled={isPending}
                  className="cursor-pointer bg-red-500 font-medium text-white hover:bg-red-600"
                  onClick={handleConfirmDelete}
                >
                  Supprimer définitivement
                </Button>
```

- [ ] **Step 17: Typecheck**

Run: `pnpm build`
Expected: no type errors. Watch specifically for: any remaining reference to `fetchData`, `setFabrics`, `setProducts`, `setCategories`, `setColors`, `setEmbroideryFonts`, `isLoading`, or the deleted `Fabric`/`ConfigProduct`/`FabricCategory`/`Color`/`EmbroideryFont` type names — any hit means a spot from Steps 2–16 was missed.

- [ ] **Step 18: Commit**

```bash
git add components/admin/configurator-client.tsx
git commit -m "feat(admin): extract configurator UI into ConfiguratorClient with router.refresh() resync"
```

---

### Task 3: Convert `app/admin/configurator/page.tsx` to a Server Component

**Files:**
- Modify: `app/admin/configurator/page.tsx` (full rewrite)

**Interfaces:**
- Consumes: the 5 `getConfigurator*Data()` functions (Task 1), `ConfiguratorClient` (Task 2).
- Produces: default export `ConfiguratorPage` (was `ConfiguratorAdmin` — the default export name doesn't matter to Next's routing, but `ConfiguratorPage` matches this plan's naming convention for every other converted admin page).

- [ ] **Step 1: Replace the file contents**

```tsx
import { ConfiguratorClient } from "@/components/admin/configurator-client";
import { getConfiguratorFabricsData } from "@/lib/admin/get-configurator-fabrics-data";
import { getConfiguratorCategoriesData } from "@/lib/admin/get-configurator-categories-data";
import { getConfiguratorColorsData } from "@/lib/admin/get-configurator-colors-data";
import { getConfiguratorProductsData } from "@/lib/admin/get-configurator-products-data";
import { getConfiguratorEmbroideryFontsData } from "@/lib/admin/get-configurator-embroidery-fonts-data";

export default async function ConfiguratorPage() {
  const [fabrics, categories, colors, products, embroideryFonts] = await Promise.all([
    getConfiguratorFabricsData(),
    getConfiguratorCategoriesData(),
    getConfiguratorColorsData(),
    getConfiguratorProductsData(),
    getConfiguratorEmbroideryFontsData(),
  ]);

  return (
    <ConfiguratorClient
      initialFabrics={fabrics}
      initialProducts={products}
      initialCategories={categories}
      initialColors={colors}
      initialEmbroideryFonts={embroideryFonts}
    />
  );
}
```

- [ ] **Step 2: Typecheck and build**

Run: `pnpm build`
Expected: succeeds with no errors.

- [ ] **Step 3: Commit**

```bash
git add app/admin/configurator/page.tsx
git commit -m "refactor(admin): convert configurator to a Server Component with server-side data fetching"
```

---

### Task 4: Add `app/admin/configurator/loading.tsx`

**Files:**
- Create: `app/admin/configurator/loading.tsx` (this route currently has no `loading.tsx` of its own — it inherits `app/admin/loading.tsx`, the dashboard skeleton, the wrong shape here)

**Interfaces:**
- Consumes: nothing (static skeleton, no props).
- Produces: nothing consumed elsewhere — the Suspense fallback while `Promise.all([...5 getConfigurator*Data() calls])` is pending.

- [ ] **Step 1: Write the file**

Approximates the default tab (`activeTab` starts as `"fabrics"`): header, 4 stat badges, tab bar (5 tabs), search+filter action bar, and one category section with a swatch grid — enough to read as "the fabrics view is loading" without needing to fully replicate every tab's shape (matching the level of fidelity used elsewhere: representative, not pixel-exact).

```tsx
export default function Loading() {
  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 h-3 w-24 animate-pulse" style={{ background: "var(--color-paper-2)" }} />
          <div className="mb-1 h-8 w-44 animate-pulse" style={{ background: "var(--color-paper-2)" }} />
          <div className="h-3 w-56 animate-pulse" style={{ background: "var(--color-paper-2)" }} />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-6 w-20 animate-pulse" style={{ background: "var(--color-paper-2)" }} />
          ))}
        </div>
      </div>

      <div className="mb-6 flex overflow-x-auto" style={{ borderBottom: "var(--rule-soft)" }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="mx-3 my-3 h-4 w-20 animate-pulse" style={{ background: "var(--color-paper-2)" }} />
        ))}
      </div>

      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="h-11 flex-1 animate-pulse" style={{ background: "var(--color-paper-2)" }} />
        <div className="h-11 w-44 animate-pulse" style={{ background: "var(--color-paper-2)" }} />
      </div>

      <div style={{ border: "var(--rule-hair)", background: "var(--color-paper)" }}>
        <div className="flex items-center gap-3 px-6 py-4" style={{ borderBottom: "var(--rule-soft)", background: "var(--color-paper-2)" }}>
          <div className="h-6 w-32 animate-pulse" style={{ background: "var(--color-paper-3, var(--color-paper))" }} />
        </div>
        <div className="grid grid-cols-2 gap-3 p-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} style={{ border: "var(--rule-soft)" }}>
              <div className="aspect-square animate-pulse" style={{ background: "var(--color-paper-2)" }} />
              <div className="p-2.5">
                <div className="h-3 w-full animate-pulse" style={{ background: "var(--color-paper-2)" }} />
              </div>
            </div>
          ))}
        </div>
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
git add app/admin/configurator/loading.tsx
git commit -m "feat(admin): add layout-matching loading skeleton for configurator"
```

---

### Task 5: End-to-end manual verification

**Files:** none (verification only)

- [ ] **Step 1: Cold-load check**

Run `pnpm dev`. Signed in as admin, hard-refresh `/admin/configurator`. Confirm the skeleton (Task 4) appears briefly, then the real page renders with data on the default Fabrics tab.

- [ ] **Step 2: Per-tab mutation + resync check**

For each of Fabrics, Products, Palettes: create, edit, toggle-active, and delete one test item; confirm each action produces a toast and the list updates after the `router.refresh()` round-trip (network tab: RSC payload re-fetch after the mutation's own fetch resolves).

- [ ] **Step 3: Broderie tab staleness check — the one identified risk**

Open the Broderie tab, select a product, adjust the embroidery zone (position/rotation/font size), save. Confirm: (a) the editor keeps showing the just-saved values (no flicker back to old values), (b) switch to the Products tab and back to Broderie — the same product's "✓ Calibré" badge and zone data are still correct, confirming the `router.refresh()`-driven `products` list actually picked up the change and `embroideryProduct`'s local patch didn't mask a real desync.

- [ ] **Step 4: Auth redirect check**

In a private/incognito window (no session), navigate directly to `/admin/configurator`. Confirm it redirects to `/sign-in`.

- [ ] **Step 5: Full build pass**

Run: `pnpm build`
Expected: clean.

- [ ] **Step 6: Report back**

Summarize verification results. This is the last page in the admin-loading-refactor initiative (dashboard, orders, products, users, newsletter, configurator all converted) — flag anything that should get a follow-up pass (e.g. applying the same `unsubscribeToken`-style column-selection audit from the newsletter refactor to any configurator table with fields the client shouldn't need).
