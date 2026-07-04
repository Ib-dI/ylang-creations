# Embroidery Font Selection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let the customer choose between two embroidery fonts (Moonlight, already live, and Alfabeto Liz, new) for their name embroidery in `/configurateur`, with per-font pricing managed by the admin.

**Architecture:** A new `configurator_embroidery_font` DB table (mirroring the existing `configurator_fabric` pattern) drives font metadata (name, price, active, order) via a public read API and an admin CRUD API + panel. The font's actual glyph assets (a `manifest.json` + `.exp`/`.pes` files under `public/fonts/`) and per-letter calibration data stay code-deployed. `EmbroideryPreview.tsx` is generalized to load either format via a new ported PES/PEC parser (`lib/embroidery/pes-parser.ts`), keyed by font instead of hardcoded to Moonlight. A calibration UI is added to the local `embodery-preview` research tool so the 26 Alfabeto Liz letters can be visually tuned and exported in the same `offsetY`/`advanceX` shape Moonlight already uses.

**Tech Stack:** Next.js 16 App Router, Drizzle ORM/PostgreSQL, Zod v4, React 19 client components, vanilla JS/Express for the separate `embodery-preview` local tool.

## Global Constraints

- Prices stored in cents (integer), French UI text — per project CLAUDE.md.
- No new npm dependencies for either repo (no tsx/ts-node, no font-upload libraries).
- Font *assets* (files, manifest, calibration numbers) are code-deployed only; the admin only edits name/price/order/active — confirmed via grill-me interrogation.
- Font choice is global per configuration (applies to all embroidered name lines), not per-line.
- Alfabeto Liz text is silently normalized (uppercase, accents stripped) for rendering — no visible warning to the customer.
- Embroidery price is no longer a flat constant; it comes from the selected font's `price` column.

---

## File Structure

**ylang-creations (production app):**
- `db/schema.ts` — add `configuratorEmbroideryFont` table
- `lib/validations/index.ts` — add create/update Zod schemas
- `app/api/configurator/embroidery-fonts/route.ts` — public GET (new)
- `app/api/admin/configurator/embroidery-fonts/route.ts` — admin CRUD (new)
- `components/admin/configurator/embroidery-fonts-panel.tsx` — admin UI (new)
- `app/admin/configurator/page.tsx` — wire in new "Polices" tab
- `public/fonts/Alfabeto Liz/manifest.json` — letter → filename map (new)
- `lib/embroidery/pes-parser.ts` — ported PES/PEC reader (new)
- `lib/embroidery/normalize.ts` — text normalization for caps-only fonts (new)
- `components/configurator/EmbroideryPreview.tsx` — multi-font rendering
- `components/configurator/EmbroideryZoneOverlay.tsx` — pass font props through
- `types/configurateur-page.ts`, `types/cart.ts` — add font field
- `app/configurateur/page.tsx` — font selector UI, pricing, cart payload
- `lib/constants.ts` — remove now-unused `EMBROIDERY_PRICE_CENTS`

**embodery-preview (local research tool, separate repo):**
- `server.js` — calibration persistence endpoints
- `public/app.js`, `public/index.html`, `public/style.css` — calibration UI

---

### Task 1: Add `configuratorEmbroideryFont` table

**Files:**
- Modify: `db/schema.ts:237` (right after the `configuratorColor` table, before the `// Newsletter Subscribers` comment)

**Interfaces:**
- Produces: `configuratorEmbroideryFont` Drizzle table with columns `id, name, folder, format, price, order, isActive, createdAt, updatedAt` — consumed by Tasks 2-4.

- [ ] **Step 1: Add the table definition**

In `db/schema.ts`, insert this block immediately after the `configuratorColor` table (after line 237, before the `// Newsletter Subscribers` comment):

```typescript
// Configurator Embroidery Fonts
export const configuratorEmbroideryFont = pgTable("configurator_embroidery_font", {
  id: text("id").primaryKey(), // e.g. "moonlight", "alfabeto-liz"
  name: text("name").notNull(), // display name, e.g. "Moonlight"
  folder: text("folder").notNull(), // public/fonts/<folder> — e.g. "moonlight", "Alfabeto Liz"
  format: text("format").notNull(), // "exp" | "pes"
  price: integer("price").notNull().default(1500), // Price in cents
  order: integer("order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
```

- [ ] **Step 2: Verify the file still parses**

Run: `cd "C:\Users\hp\OneDrive\Bureau\Pro\Rako\ylang-creations" && npx tsc --noEmit db/schema.ts 2>&1 | grep -v "routes.d.ts"`
Expected: no output referencing `db/schema.ts` (the `.next/dev/types/routes.d.ts` noise from stale route typegen is a known unrelated artifact — ignore it).

- [ ] **Step 3: Commit**

```bash
git add db/schema.ts
git commit -m "feat(db): add configurator_embroidery_font table"
```

---

### Task 2: Zod validation schemas

**Files:**
- Modify: `lib/validations/index.ts:295` (right after `updateConfiguratorFabricSchema`, before the `export type CreateConfiguratorProductInput` block)

**Interfaces:**
- Consumes: nothing new.
- Produces: `createConfiguratorEmbroideryFontSchema`, `updateConfiguratorEmbroideryFontSchema`, types `CreateConfiguratorEmbroideryFontInput`, `UpdateConfiguratorEmbroideryFontInput` — consumed by Task 4 (admin API route).

- [ ] **Step 1: Add the schemas**

In `lib/validations/index.ts`, insert after line 295 (`.partial();` that closes `updateConfiguratorFabricSchema`):

```typescript
export const createConfiguratorEmbroideryFontSchema = z.object({
  id: z.string().min(1, "L'identifiant est requis").max(100).transform(sanitizeString),
  name: z.string().min(1, "Le nom est requis").max(200).transform(sanitizeString),
  folder: z.string().min(1, "Le dossier est requis").max(200).transform(sanitizeString),
  format: z.enum(["exp", "pes"]),
  price: z.number().int().min(0).max(9999999).optional().default(1500),
  order: z.number().int().min(0).max(9999).optional().default(0),
  isActive: z.boolean().optional().default(true),
});

export const updateConfiguratorEmbroideryFontSchema = createConfiguratorEmbroideryFontSchema
  .omit({ id: true })
  .partial();

export type CreateConfiguratorEmbroideryFontInput = z.infer<typeof createConfiguratorEmbroideryFontSchema>;
export type UpdateConfiguratorEmbroideryFontInput = z.infer<typeof updateConfiguratorEmbroideryFontSchema>;
```

- [ ] **Step 2: Verify the file still parses**

Run: `cd "C:\Users\hp\OneDrive\Bureau\Pro\Rako\ylang-creations" && npx tsc --noEmit lib/validations/index.ts 2>&1 | grep -v "routes.d.ts"`
Expected: no output referencing `lib/validations/index.ts`.

- [ ] **Step 3: Commit**

```bash
git add lib/validations/index.ts
git commit -m "feat(validation): add embroidery font zod schemas"
```

---

### Task 3: Public API route

**Files:**
- Create: `app/api/configurator/embroidery-fonts/route.ts`

**Interfaces:**
- Consumes: `configuratorEmbroideryFont` from Task 1.
- Produces: `GET /api/configurator/embroidery-fonts?active=true` → `{ fonts: Array<{id,name,folder,format,price,order,isActive,createdAt,updatedAt}> }` — consumed by Task 15 (configurator page fetch).

- [ ] **Step 1: Write the route**

```typescript
import { configuratorEmbroideryFont } from "@/db/schema";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

// Public GET: List active embroidery fonts, ordered for display
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("active") === "true";

    const fonts = activeOnly
      ? await db
          .select()
          .from(configuratorEmbroideryFont)
          .where(eq(configuratorEmbroideryFont.isActive, true))
          .orderBy(configuratorEmbroideryFont.order, configuratorEmbroideryFont.createdAt)
      : await db
          .select()
          .from(configuratorEmbroideryFont)
          .orderBy(configuratorEmbroideryFont.order, configuratorEmbroideryFont.createdAt);

    return NextResponse.json({ fonts });
  } catch (error) {
    console.error("Error fetching embroidery fonts:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des polices de broderie" },
      { status: 500 },
    );
  }
}
```

- [ ] **Step 2: Verify it compiles**

Run: `cd "C:\Users\hp\OneDrive\Bureau\Pro\Rako\ylang-creations" && npx tsc --noEmit app/api/configurator/embroidery-fonts/route.ts 2>&1 | grep -v "routes.d.ts"`
Expected: no output referencing this file.

- [ ] **Step 3: Commit**

```bash
git add app/api/configurator/embroidery-fonts/route.ts
git commit -m "feat(api): add public embroidery fonts endpoint"
```

---

### Task 4: Admin API route

**Files:**
- Create: `app/api/admin/configurator/embroidery-fonts/route.ts`

**Interfaces:**
- Consumes: `createConfiguratorEmbroideryFontSchema`/`updateConfiguratorEmbroideryFontSchema` from Task 2, `withAdminAuth` from `@/lib/auth/with-admin-auth`.
- Produces: `GET/POST/PUT/DELETE /api/admin/configurator/embroidery-fonts` — consumed by Task 6 (admin panel).

- [ ] **Step 1: Write the route**

```typescript
import { configuratorEmbroideryFont } from "@/db/schema";
import { db } from "@/lib/db";
import { withAdminAuth } from "@/lib/auth/with-admin-auth";
import {
  createConfiguratorEmbroideryFontSchema,
  updateConfiguratorEmbroideryFontSchema,
  validateRequest,
  formatZodErrors,
} from "@/lib/validations";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("active") === "true";

    const fonts = activeOnly
      ? await db.select().from(configuratorEmbroideryFont).where(eq(configuratorEmbroideryFont.isActive, true))
      : await db.select().from(configuratorEmbroideryFont);

    return NextResponse.json({ fonts });
  } catch (error) {
    console.error("Error fetching embroidery fonts:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des polices de broderie" },
      { status: 500 },
    );
  }
}

async function handlePOST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const validation = validateRequest(createConfiguratorEmbroideryFontSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: formatZodErrors(validation.errors) }, { status: 400 });
    }

    const data = validation.data;
    await db.insert(configuratorEmbroideryFont).values({
      id: data.id,
      name: data.name,
      folder: data.folder,
      format: data.format,
      price: data.price,
      order: data.order,
      isActive: data.isActive,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error creating embroidery font:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la police de broderie" },
      { status: 500 },
    );
  }
}
export const POST = withAdminAuth(handlePOST);

async function handlePUT(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID manquant" }, { status: 400 });
    }

    const body = await request.json();
    const validation = validateRequest(updateConfiguratorEmbroideryFontSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: formatZodErrors(validation.errors) }, { status: 400 });
    }

    if (Object.keys(validation.data).length === 0) {
      return NextResponse.json({ error: "Aucune donnée à mettre à jour" }, { status: 400 });
    }

    await db
      .update(configuratorEmbroideryFont)
      .set({ ...validation.data, updatedAt: new Date() })
      .where(eq(configuratorEmbroideryFont.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating embroidery font:", error);
    return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 });
  }
}
export const PUT = withAdminAuth(handlePUT);

async function handleDELETE(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID manquant" }, { status: 400 });
    }

    await db.delete(configuratorEmbroideryFont).where(eq(configuratorEmbroideryFont.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting embroidery font:", error);
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
  }
}
export const DELETE = withAdminAuth(handleDELETE);
```

- [ ] **Step 2: Verify it compiles**

Run: `cd "C:\Users\hp\OneDrive\Bureau\Pro\Rako\ylang-creations" && npx tsc --noEmit app/api/admin/configurator/embroidery-fonts/route.ts 2>&1 | grep -v "routes.d.ts"`
Expected: no output referencing this file.

- [ ] **Step 3: Commit**

```bash
git add app/api/admin/configurator/embroidery-fonts/route.ts
git commit -m "feat(api): add admin embroidery fonts CRUD endpoint"
```

---

### Task 5: Push the schema change to the database

**Files:** none (command-only task)

- [ ] **Step 1: Push schema**

Run: `cd "C:\Users\hp\OneDrive\Bureau\Pro\Rako\ylang-creations" && pnpm db:push`
Expected: Drizzle reports the new `configurator_embroidery_font` table created, no destructive warnings about other tables. If prompted to confirm a new table creation, confirm.

- [ ] **Step 2: Verify the table exists**

Run: `pnpm db:studio` and visually confirm `configurator_embroidery_font` appears with columns `id, name, folder, format, price, order, is_active, created_at, updated_at`, empty (0 rows) for now. Close Drizzle Studio when done (rows are seeded through the admin UI in Task 8).

No commit — this task only changes the remote database, not tracked files.

---

### Task 6: Admin panel component

**Files:**
- Create: `components/admin/configurator/embroidery-fonts-panel.tsx`

**Interfaces:**
- Consumes: `GET/POST/PUT/DELETE /api/admin/configurator/embroidery-fonts` from Task 4.
- Produces: default-exported `EmbroideryFontsPanel` React component, no props — consumed by Task 7.

- [ ] **Step 1: Write the component**

```tsx
"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Edit, Trash2, Type } from "lucide-react";
import { toast } from "sonner";

type EmbroideryFont = {
  id: string;
  name: string;
  folder: string;
  format: "exp" | "pes";
  price: number; // cents
  order: number;
  isActive: boolean;
};

// Fonts that ship with code assets (manifest + files + calibration) and can
// safely be registered in the DB. A developer adds an entry here when a new
// font is deployed; the admin only ever picks from this fixed list.
const AVAILABLE_FONT_DEFINITIONS: Array<Pick<EmbroideryFont, "id" | "name" | "folder" | "format">> = [
  { id: "moonlight", name: "Moonlight", folder: "moonlight", format: "exp" },
  { id: "alfabeto-liz", name: "Alfabeto Liz", folder: "Alfabeto Liz", format: "pes" },
];

export default function EmbroideryFontsPanel() {
  const [fonts, setFonts] = useState<EmbroideryFont[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFont, setEditingFont] = useState<Partial<EmbroideryFont> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const loadFonts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/configurator/embroidery-fonts");
      const data = await res.json();
      setFonts(data.fonts || []);
    } catch {
      toast.error("Erreur lors du chargement des polices");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFonts();
  }, []);

  const unregisteredDefinitions = AVAILABLE_FONT_DEFINITIONS.filter(
    (def) => !fonts.some((f) => f.id === def.id),
  );

  const openCreateModal = () => {
    const first = unregisteredDefinitions[0];
    setEditingFont(
      first
        ? { ...first, price: 1500, order: fonts.length, isActive: true }
        : { price: 1500, order: fonts.length, isActive: true },
    );
    setIsModalOpen(true);
  };

  const openEditModal = (font: EmbroideryFont) => {
    setEditingFont({ ...font });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!editingFont?.id || !editingFont?.name || !editingFont?.folder || !editingFont?.format) {
      toast.error("Champs obligatoires manquants");
      return;
    }
    setIsSaving(true);
    const isExisting = fonts.some((f) => f.id === editingFont.id);
    const url = isExisting
      ? `/api/admin/configurator/embroidery-fonts?id=${editingFont.id}`
      : "/api/admin/configurator/embroidery-fonts";
    try {
      const res = await fetch(url, {
        method: isExisting ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingFont),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(typeof data.error === "string" ? data.error : "Erreur");
      }
      toast.success(isExisting ? "Police mise à jour" : "Police ajoutée");
      setIsModalOpen(false);
      setEditingFont(null);
      await loadFonts();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur lors de l'enregistrement");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleActive = async (font: EmbroideryFont) => {
    try {
      await fetch(`/api/admin/configurator/embroidery-fonts?id=${font.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !font.isActive }),
      });
      await loadFonts();
    } catch {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/admin/configurator/embroidery-fonts?id=${id}`, { method: "DELETE" });
      toast.success("Police supprimée");
      setDeleteConfirmId(null);
      await loadFonts();
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <p className="font-body text-sm text-gray-500">
          Nom, prix et disponibilité des polices de broderie. Les fichiers et le calibrage restent gérés par le code.
        </p>
        <Button onClick={openCreateModal} disabled={unregisteredDefinitions.length === 0} className="gap-2">
          <Plus className="h-4 w-4" /> Ajouter une police
        </Button>
      </div>

      {fonts.length === 0 ? (
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 bg-white py-24">
          <Type className="mb-3 h-10 w-10 text-gray-300" />
          <p className="font-body font-medium text-gray-400">Aucune police enregistrée</p>
          <p className="font-body mt-1 text-sm text-gray-300">Ajoutez Moonlight et Alfabeto Liz pour commencer</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {fonts
            .sort((a, b) => a.order - b.order)
            .map((font) => (
              <div key={font.id} className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-body text-sm font-medium text-gray-800">{font.name}</p>
                  <p className="font-body mt-0.5 text-xs text-gray-400">
                    {font.folder} · .{font.format} · {(font.price / 100).toFixed(2)} €
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    onClick={() => toggleActive(font)}
                    className={`px-2 py-1 font-body text-[10px] font-semibold uppercase ${
                      font.isActive ? "text-green-600" : "text-gray-400"
                    }`}
                  >
                    {font.isActive ? "Actif" : "Inactif"}
                  </button>
                  <button onClick={() => openEditModal(font)} className="p-1.5 text-gray-400 hover:text-gray-700">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button onClick={() => setDeleteConfirmId(font.id)} className="p-1.5 text-gray-400 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={(open) => { setIsModalOpen(open); if (!open) setEditingFont(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{fonts.some((f) => f.id === editingFont?.id) ? "Modifier la police" : "Ajouter une police"}</DialogTitle>
            <DialogDescription>Nom, prix et disponibilité affichés au client.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {!fonts.some((f) => f.id === editingFont?.id) && (
              <div>
                <label className="mb-1 block font-body text-xs font-medium text-gray-600">Police disponible</label>
                <select
                  value={editingFont?.id || ""}
                  onChange={(e) => {
                    const def = AVAILABLE_FONT_DEFINITIONS.find((d) => d.id === e.target.value);
                    if (def) setEditingFont((prev) => ({ ...prev, ...def }));
                  }}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 font-body text-sm"
                >
                  <option value="" disabled>Choisir…</option>
                  {unregisteredDefinitions.map((def) => (
                    <option key={def.id} value={def.id}>{def.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="mb-1 block font-body text-xs font-medium text-gray-600">Nom affiché</label>
              <input
                type="text"
                value={editingFont?.name || ""}
                onChange={(e) => setEditingFont((prev) => ({ ...prev!, name: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 font-body text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block font-body text-xs font-medium text-gray-600">Prix (€)</label>
              <input
                type="number"
                min={0}
                step={0.5}
                value={((editingFont?.price ?? 0) / 100).toString()}
                onChange={(e) => setEditingFont((prev) => ({ ...prev!, price: Math.round(parseFloat(e.target.value || "0") * 100) }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 font-body text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block font-body text-xs font-medium text-gray-600">Ordre d&apos;affichage</label>
              <input
                type="number"
                min={0}
                value={editingFont?.order ?? 0}
                onChange={(e) => setEditingFont((prev) => ({ ...prev!, order: parseInt(e.target.value) || 0 }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 font-body text-sm"
              />
            </div>
            <button
              type="button"
              onClick={() => setEditingFont((prev) => ({ ...prev!, isActive: !prev?.isActive }))}
              className={`relative h-6 w-11 rounded-full transition-colors ${editingFont?.isActive ? "bg-gray-900" : "bg-gray-300"}`}
            >
              <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all ${editingFont?.isActive ? "left-6" : "left-1"}`} />
            </button>
          </div>

          <DialogFooter>
            <Button onClick={handleSave} disabled={isSaving} className="gap-2">
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteConfirmId} onOpenChange={(open) => { if (!open) setDeleteConfirmId(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer cette police ?</DialogTitle>
            <DialogDescription>Cette action est irréversible.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="destructive" onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `cd "C:\Users\hp\OneDrive\Bureau\Pro\Rako\ylang-creations" && npx tsc --noEmit components/admin/configurator/embroidery-fonts-panel.tsx 2>&1 | grep -v "routes.d.ts"`
Expected: no output referencing this file. If `Button variant="destructive"` doesn't exist on your `Button` component, check `components/ui/button.tsx` for the correct variant name and adjust.

- [ ] **Step 3: Commit**

```bash
git add components/admin/configurator/embroidery-fonts-panel.tsx
git commit -m "feat(admin): add embroidery fonts management panel"
```

---

### Task 7: Wire the "Polices" tab into the admin configurator page

**Files:**
- Modify: `app/admin/configurator/page.tsx:68` (activeTab union), `:592-596` (tabs array), `:619` (action bar condition), plus a new render block after the `palettes` block

**Interfaces:**
- Consumes: `EmbroideryFontsPanel` from Task 6.

- [ ] **Step 1: Import the panel**

At the top of `app/admin/configurator/page.tsx`, after the existing `import EmbroideryZoneOverlay from "@/components/configurator/EmbroideryZoneOverlay";` (line 11), add:

```tsx
import EmbroideryFontsPanel from "@/components/admin/configurator/embroidery-fonts-panel";
```

- [ ] **Step 2: Extend the `activeTab` union**

Change line 68 from:

```tsx
  const [activeTab, setActiveTab] = useState<"fabrics" | "products" | "broderie" | "palettes">("fabrics");
```

to:

```tsx
  const [activeTab, setActiveTab] = useState<"fabrics" | "products" | "broderie" | "palettes" | "polices">("fabrics");
```

- [ ] **Step 3: Add the tab button**

In the tabs array (lines 592-596), change:

```tsx
        {([
          { id: "fabrics", label: "Tissus & Catégories", count: null },
          { id: "products", label: "Produits", count: products.length },
          { id: "broderie", label: "Broderie", count: null },
          { id: "palettes", label: "Palettes", count: colors.length },
        ] as const).map(({ id, label, count }) => (
```

to:

```tsx
        {([
          { id: "fabrics", label: "Tissus & Catégories", count: null },
          { id: "products", label: "Produits", count: products.length },
          { id: "broderie", label: "Broderie", count: null },
          { id: "palettes", label: "Palettes", count: colors.length },
          { id: "polices", label: "Polices", count: null },
        ] as const).map(({ id, label, count }) => (
```

- [ ] **Step 4: Hide the search/filter action bar on the new tab**

Change line 619 from:

```tsx
      {activeTab !== 'broderie' && activeTab !== 'palettes' && (
```

to:

```tsx
      {activeTab !== 'broderie' && activeTab !== 'palettes' && activeTab !== 'polices' && (
```

- [ ] **Step 5: Render the panel**

Find the closing of the `{activeTab === 'palettes' && ( ... )}` block (starts at line 1292 in the original file). Immediately after its closing `)}`, add:

```tsx
      {activeTab === 'polices' && (
        <div>
          <EmbroideryFontsPanel />
        </div>
      )}
```

- [ ] **Step 6: Manual verification**

Run: `cd "C:\Users\hp\OneDrive\Bureau\Pro\Rako\ylang-creations" && pnpm dev`
Open `http://localhost:3000/admin/configurator`, click the new "Polices" tab. Expected: empty state ("Aucune police enregistrée") with an "Ajouter une police" button, no console errors. Stop the dev server (Ctrl+C) once confirmed.

- [ ] **Step 7: Commit**

```bash
git add app/admin/configurator/page.tsx
git commit -m "feat(admin): wire embroidery fonts panel into configurator tabs"
```

---

### Task 8: Seed the two font rows via the admin UI

**Files:** none (manual data-entry task, uses the UI built in Tasks 6-7)

- [ ] **Step 1: Start the dev server**

Run: `cd "C:\Users\hp\OneDrive\Bureau\Pro\Rako\ylang-creations" && pnpm dev`

- [ ] **Step 2: Create the Moonlight row**

Open `http://localhost:3000/admin/configurator` → "Polices" tab → "Ajouter une police". In the dropdown pick "Moonlight" (auto-fills id=`moonlight`, folder=`moonlight`, format=`exp`). Set "Prix (€)" to `15`, "Ordre d'affichage" to `0`, leave Actif on. Save.

- [ ] **Step 3: Create the Alfabeto Liz row**

Click "Ajouter une police" again, pick "Alfabeto Liz" (auto-fills id=`alfabeto-liz`, folder=`Alfabeto Liz`, format=`pes`). Set "Prix (€)" to `15` (same price as Moonlight per the "no price change" decision), "Ordre d'affichage" to `1`, leave Actif on. Save.

- [ ] **Step 4: Verify via the public API**

Run: `curl -s "http://localhost:3000/api/configurator/embroidery-fonts?active=true"`
Expected JSON: `{"fonts":[{"id":"moonlight",...,"price":1500,...},{"id":"alfabeto-liz",...,"price":1500,...}]}` (order: moonlight then alfabeto-liz). Stop the dev server once confirmed.

No commit — this task only inserts database rows.

---

### Task 9: Alfabeto Liz manifest.json

**Files:**
- Create: `public/fonts/Alfabeto Liz/manifest.json`

**Interfaces:**
- Produces: a direct letter → filename map, consumed by the `pes` branch of `loadFontsShared` in Task 12.

- [ ] **Step 1: Write the manifest**

The folder already contains 26 usable files (suffix-named, e.g. `99999974_A.pes`) plus one unused duplicate (`99999974 2.pes`, no letter suffix — intentionally omitted below).

```json
{
  "A": "99999974_A.pes",
  "B": "99999973_B.pes",
  "C": "99999972_C.pes",
  "D": "99999971_D.pes",
  "E": "99999970_E.pes",
  "F": "99999969_F.pes",
  "G": "99999967_G.pes",
  "H": "99999966_H.pes",
  "I": "99999965_I.pes",
  "J": "99999964_J.pes",
  "K": "99999963_K.pes",
  "L": "99999962_L.pes",
  "M": "99999961_M.pes",
  "N": "99999960_N.pes",
  "O": "99999959_O.pes",
  "P": "99999958_P.pes",
  "Q": "99999957_Q.pes",
  "R": "99999956_R.pes",
  "S": "99999955_S.pes",
  "T": "99999954_T.pes",
  "U": "99999953_U.pes",
  "V": "99999952_V.pes",
  "W": "99999968_W.pes",
  "X": "99999951_X.pes",
  "Y": "99999950_Y.pes",
  "Z": "99999949_Z.pes"
}
```

- [ ] **Step 2: Verify it's valid JSON and every referenced file exists**

Run: `cd "C:\Users\hp\OneDrive\Bureau\Pro\Rako\ylang-creations" && node -e "const m=require('./public/fonts/Alfabeto Liz/manifest.json'); const fs=require('fs'); for (const [ch,f] of Object.entries(m)) { if (!fs.existsSync('./public/fonts/Alfabeto Liz/'+f)) console.log('MISSING', ch, f); } console.log('checked', Object.keys(m).length, 'letters');"`
Expected: `checked 26 letters` with no `MISSING` lines.

- [ ] **Step 3: Commit**

```bash
git add "public/fonts/Alfabeto Liz/manifest.json"
git commit -m "feat(fonts): add Alfabeto Liz letter manifest"
```

---

### Task 10: Port the PES/PEC parser to TypeScript

**Files:**
- Create: `lib/embroidery/pes-parser.ts`

**Interfaces:**
- Consumes: nothing (pure parsing module).
- Produces: `parsePesToPESData(buffer: ArrayBuffer): PESData` where `PESData = { colorBlocks: { color: string; stitches: { x: number; y: number; type: "stitch" }[] }[]; minX: 0; maxX: number; minY: 0; maxY: number; width: number; height: number }` — same shape `EmbroideryPreview.tsx`'s existing `parseEXP` already produces, so it can be consumed identically. Used by Task 12.

This is a direct port of the battle-tested `embodery-preview/public/pes-parser.js` (already verified against the real Alfabeto Liz files in your local tool), restructured at the very end (`finalize`) to output the `PESData` shape instead of raw segments/bounds, and normalized to start at `(0, 0)` like `buildFromStitches` does for EXP.

- [ ] **Step 1: Write the module**

```typescript
// Parser for Brother/Babylock .pes embroidery files (embedded PEC stitch block).
// Ported from embodery-preview/public/pes-parser.js, itself ported from the
// reference implementation in pyembroidery (EmbroidePy/pyembroidery),
// PesReader.py / PecReader.py / EmbThreadPec.py.

const JUMP_CODE = 0x10;
const TRIM_CODE = 0x20;
const FLAG_LONG = 0x80;

const THREAD_SET: Array<[number, number, number, string] | null> = [
  null,
  [14, 31, 124, "Prussian Blue"], [10, 85, 163, "Blue"], [0, 135, 119, "Teal Green"],
  [75, 107, 175, "Cornflower Blue"], [237, 23, 31, "Red"], [209, 92, 0, "Reddish Brown"],
  [145, 54, 151, "Magenta"], [228, 154, 203, "Light Lilac"], [145, 95, 172, "Lilac"],
  [158, 214, 125, "Mint Green"], [232, 169, 0, "Deep Gold"], [254, 186, 53, "Orange"],
  [255, 255, 0, "Yellow"], [112, 188, 31, "Lime Green"], [186, 152, 0, "Brass"],
  [168, 168, 168, "Silver"], [125, 111, 0, "Russet Brown"], [255, 255, 179, "Cream Brown"],
  [79, 85, 86, "Pewter"], [0, 0, 0, "Black"], [11, 61, 145, "Ultramarine"],
  [119, 1, 118, "Royal Purple"], [41, 49, 51, "Dark Gray"], [42, 19, 1, "Dark Brown"],
  [246, 74, 138, "Deep Rose"], [178, 118, 36, "Light Brown"], [252, 187, 197, "Salmon Pink"],
  [254, 55, 15, "Vermilion"], [240, 240, 240, "White"], [106, 28, 138, "Violet"],
  [168, 221, 196, "Seacrest"], [37, 132, 187, "Sky Blue"], [254, 179, 67, "Pumpkin"],
  [255, 243, 107, "Cream Yellow"], [208, 166, 96, "Khaki"], [209, 84, 0, "Clay Brown"],
  [102, 186, 73, "Leaf Green"], [19, 74, 70, "Peacock Blue"], [135, 135, 135, "Gray"],
  [216, 204, 198, "Warm Gray"], [67, 86, 7, "Dark Olive"], [253, 217, 222, "Flesh Pink"],
  [249, 147, 188, "Pink"], [0, 56, 34, "Deep Green"], [178, 175, 212, "Lavender"],
  [104, 106, 176, "Wisteria Violet"], [239, 227, 185, "Beige"], [247, 56, 102, "Carmine"],
  [181, 75, 100, "Amber Red"], [19, 43, 26, "Olive Green"], [199, 1, 86, "Dark Fuchsia"],
  [254, 158, 50, "Tangerine"], [168, 222, 235, "Light Blue"], [0, 103, 62, "Emerald Green"],
  [78, 41, 144, "Purple"], [47, 126, 32, "Moss Green"], [255, 204, 204, "Flesh Pink"],
  [255, 217, 17, "Harvest Gold"], [9, 91, 166, "Electric Blue"], [240, 249, 112, "Lemon Yellow"],
  [227, 243, 91, "Fresh Green"], [255, 153, 0, "Orange"], [255, 240, 141, "Cream Yellow"],
  [255, 200, 200, "Applique"],
];

function signed7(b: number): number {
  return b > 63 ? -128 + b : b;
}

function signed12(b: number): number {
  b &= 0xfff;
  return b > 0x7ff ? -0x1000 + b : b;
}

class Reader {
  bytes: Uint8Array;
  pos = 0;
  constructor(buffer: ArrayBuffer) {
    this.bytes = new Uint8Array(buffer);
  }
  seek(n: number) {
    this.pos = n;
  }
  skip(n: number) {
    this.pos += n;
  }
  u8(): number | null {
    if (this.pos >= this.bytes.length) return null;
    return this.bytes[this.pos++];
  }
  read(n: number): Uint8Array {
    const out = this.bytes.slice(this.pos, this.pos + n);
    this.pos += n;
    return out;
  }
  string8(len: number): string {
    const bytes = this.read(len);
    let out = "";
    for (const b of bytes) out += String.fromCharCode(b);
    return out;
  }
  int16le(): number | null {
    const a = this.u8();
    const b = this.u8();
    if (a === null || b === null) return null;
    return a + (b << 8);
  }
  int24le(): number | null {
    const a = this.u8();
    const b = this.u8();
    const c = this.u8();
    if (a === null || b === null || c === null) return null;
    return a + (b << 8) + (c << 16);
  }
  int32le(): number | null {
    const a = this.u8();
    const b = this.u8();
    const c = this.u8();
    const d = this.u8();
    if (a === null || b === null || c === null || d === null) return null;
    return (a + (b << 8) + (c << 16) + (d << 24)) >>> 0;
  }
  pesString(): string | null {
    const len = this.u8();
    if (!len) return null;
    return this.string8(len).trim();
  }
}

type Thread = [number, number, number, string, string?, string?];

type StitchEvent =
  | { type: "color_change" }
  | { type: "move" | "trim" | "stitch"; dx: number; dy: number };

function mapPecColors(colorBytes: Uint8Array, chart: Thread[]): Thread[] {
  const threads: Thread[] = [];
  const maxValue = THREAD_SET.length;
  if (!chart || chart.length === 0) {
    for (const byte of colorBytes) {
      threads.push((THREAD_SET[byte % maxValue] as Thread) || [128, 128, 128, "Unknown"]);
    }
  } else if (chart.length >= colorBytes.length) {
    for (let i = 0; i < colorBytes.length; i++) threads.push(chart[i]);
  } else {
    const chartCopy = chart.slice();
    const map = new Map<number, Thread>();
    for (const byte of colorBytes) {
      const colorIndex = byte % maxValue;
      let thread = map.get(colorIndex);
      if (!thread) {
        thread = chartCopy.length ? chartCopy.shift()! : ((THREAD_SET[colorIndex] as Thread) || [128, 128, 128, "Unknown"]);
        map.set(colorIndex, thread);
      }
      threads.push(thread);
    }
  }
  return threads;
}

function readPecStitches(r: Reader): StitchEvent[] {
  const events: StitchEvent[] = [];
  while (true) {
    let val1 = r.u8();
    let val2 = r.u8();
    if (val1 === null || val2 === null || (val1 === 0xff && val2 === 0x00)) break;
    if (val1 === 0xfe && val2 === 0xb0) {
      r.skip(1);
      events.push({ type: "color_change" });
      continue;
    }
    let jump = false;
    let trim = false;
    let x: number, y: number;
    if ((val1 & FLAG_LONG) !== 0) {
      if (val1 & TRIM_CODE) trim = true;
      if (val1 & JUMP_CODE) jump = true;
      const code = (val1 << 8) | val2;
      x = signed12(code);
      const nextVal2 = r.u8();
      if (nextVal2 === null) break;
      val2 = nextVal2;
    } else {
      x = signed7(val1);
    }
    if ((val2 & FLAG_LONG) !== 0) {
      if (val2 & TRIM_CODE) trim = true;
      if (val2 & JUMP_CODE) jump = true;
      const val3 = r.u8();
      if (val3 === null) break;
      const code = (val2 << 8) | val3;
      y = signed12(code);
    } else {
      y = signed7(val2);
    }
    if (jump) events.push({ type: "move", dx: x, dy: y });
    else if (trim) events.push({ type: "trim", dx: x, dy: y });
    else events.push({ type: "stitch", dx: x, dy: y });
  }
  return events;
}

interface PecResult {
  label: string;
  threads: Thread[];
  events: StitchEvent[];
}

function readPec(r: Reader, chart: Thread[]): PecResult {
  r.skip(3); // "LA:"
  const label = r.string8(16).replace(/\0/g, "").trim();
  r.skip(0xf);
  r.u8(); // graphicStride, unused here
  r.u8(); // graphicHeight, unused here
  r.skip(0xc);
  const colorChanges = r.u8() ?? 0;
  const countColors = colorChanges + 1;
  const colorBytes = r.read(countColors);
  const threads = mapPecColors(colorBytes, chart);
  r.skip(0x1d0 - colorChanges);
  r.int24le(); // lenField, unused here (we read events until the terminator)
  r.skip(0x0b);
  const events = readPecStitches(r);
  return { label, threads, events };
}

function readPesThread(r: Reader): Thread {
  const catalogNumber = r.pesString();
  const rgb = r.int24be_compat();
  r.skip(5);
  const description = r.pesString();
  const brand = r.pesString() ?? undefined;
  const chart = r.pesString() ?? undefined;
  const c = rgb === null ? [0, 0, 0] : [(rgb >> 16) & 0xff, (rgb >> 8) & 0xff, rgb & 0xff];
  return [c[0], c[1], c[2], description || catalogNumber || "Thread", brand, chart];
}

// int24be isn't in the base Reader (only used for thread RGB) — small local helper.
declare module "./pes-parser" {}
interface ReaderWithBE extends Reader {
  int24be_compat(): number | null;
}
(Reader.prototype as ReaderWithBE).int24be_compat = function (this: Reader) {
  const a = this.u8();
  const b = this.u8();
  const c = this.u8();
  if (a === null || b === null || c === null) return null;
  return c + (b << 8) + (a << 16);
};

interface PesMeta {
  magic: string;
  version?: number;
}

function readPesMetadata(r: Reader) {
  r.pesString(); // name, unused
  r.pesString(); // category, unused
  r.pesString(); // author, unused
  r.pesString(); // keywords, unused
  r.pesString(); // comments, unused
}

function readThreadListCommon(r: Reader, gapBeforeImage: number, gapAfterImage: number): Thread[] {
  const threadList: Thread[] = [];
  r.skip(gapBeforeImage);
  r.pesString(); // image name, unused
  r.skip(gapAfterImage);
  const fills = r.int16le();
  if (fills !== 0) return threadList;
  const motifs = r.int16le();
  if (motifs !== 0) return threadList;
  const feather = r.int16le();
  if (feather !== 0) return threadList;
  const countThreads = r.int16le() || 0;
  for (let i = 0; i < countThreads; i++) threadList.push(readPesThread(r));
  return threadList;
}

function parsePesHeader(r: Reader, magic: string, meta: PesMeta): Thread[] {
  switch (magic) {
    case "#PES0100":
      meta.version = 10; r.skip(4); readPesMetadata(r); r.skip(14); r.pesString();
      return readThreadListCommon(r, 38, 34);
    case "#PES0090":
      meta.version = 9; r.skip(4); readPesMetadata(r); r.skip(14); r.pesString();
      return readThreadListCommon(r, 30, 34);
    case "#PES0080":
      meta.version = 8; r.skip(4); readPesMetadata(r);
      return readThreadListCommon(r, 38, 26);
    case "#PES0070":
      meta.version = 7; r.skip(4); readPesMetadata(r);
      return readThreadListCommon(r, 36, 24);
    case "#PES0060":
      meta.version = 6; r.skip(4); readPesMetadata(r);
      return readThreadListCommon(r, 36, 24);
    case "#PES0050":
    case "#PES0055":
    case "#PES0056":
      meta.version = magic === "#PES0050" ? 5 : magic === "#PES0055" ? 5.5 : 5.6;
      r.skip(4); readPesMetadata(r);
      return readThreadListCommon(r, 24, 24);
    case "#PES0040":
      meta.version = 4; r.skip(4); readPesMetadata(r);
      return [];
    default:
      return [];
  }
}

export interface PESData {
  colorBlocks: { color: string; stitches: { x: number; y: number; type: "stitch" }[] }[];
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  width: number;
  height: number;
}

function toHex([r0, g0, b0]: Thread): string {
  const hex = (n: number) => n.toString(16).padStart(2, "0");
  return `#${hex(r0)}${hex(g0)}${hex(b0)}`;
}

export function parsePesToPESData(buffer: ArrayBuffer): PESData {
  const r = new Reader(buffer);
  const magic = r.string8(8);
  const meta: PesMeta = { magic };

  let threadChart: Thread[] = [];
  let pec: PecResult;
  if (magic === "#PEC0001") {
    pec = readPec(r, threadChart);
  } else {
    const pecBlockPosition = r.int32le() ?? 0;
    try {
      threadChart = parsePesHeader(r, magic, meta) || [];
    } catch {
      threadChart = [];
    }
    r.seek(pecBlockPosition);
    pec = readPec(r, threadChart);
  }

  // Walk stitch events into absolute-coordinate polylines, one per color/jump
  // segment — same approach as embodery-preview's finalize(), but emitted
  // directly as PESData.colorBlocks (stitch-only points, no jump entries)
  // to match parseEXP's output shape.
  let x = 0;
  let y = 0;
  let colorIndex = 0;
  const colorBlocks: PESData["colorBlocks"] = [];
  let current: { x: number; y: number }[] | null = null;
  let currentColor = pec.threads[0] || [0, 0, 0, "Unknown"];
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  const colorOf = (i: number): Thread => pec.threads[Math.min(i, pec.threads.length - 1)] || [0, 0, 0, "Unknown"];

  const flush = () => {
    if (current && current.length > 1) {
      colorBlocks.push({
        color: toHex(currentColor),
        stitches: current.map((p) => ({ x: p.x, y: p.y, type: "stitch" as const })),
      });
    }
    current = null;
  };

  for (const ev of pec.events) {
    if (ev.type === "color_change") {
      flush();
      colorIndex++;
      currentColor = colorOf(colorIndex);
      current = [{ x, y }];
      continue;
    }
    x += ev.dx;
    y += ev.dy;
    if (ev.type === "stitch") {
      if (!current) {
        currentColor = colorOf(colorIndex);
        current = [{ x: x - ev.dx, y: y - ev.dy }];
      }
      current.push({ x, y });
    } else {
      flush();
      currentColor = colorOf(colorIndex);
      current = [{ x, y }];
    }
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  flush();

  if (!isFinite(minX)) {
    minX = minY = maxX = maxY = 0;
  }

  // Normalize to start at (0, 0), matching parseEXP's buildFromStitches().
  const sx = minX, sy = minY;
  const normalized = colorBlocks.map((block) => ({
    color: block.color,
    stitches: block.stitches.map((s) => ({ x: s.x - sx, y: s.y - sy, type: s.type })),
  }));

  return {
    colorBlocks: normalized,
    minX: 0,
    maxX: maxX - sx,
    minY: 0,
    maxY: maxY - sy,
    width: maxX - sx,
    height: maxY - sy,
  };
}
```

- [ ] **Step 2: Verify it compiles**

Run: `cd "C:\Users\hp\OneDrive\Bureau\Pro\Rako\ylang-creations" && npx tsc --noEmit lib/embroidery/pes-parser.ts 2>&1 | grep -v "routes.d.ts"`
Expected: no output referencing this file. If the `declare module` / prototype-augmentation trick for `int24be_compat` doesn't type-check cleanly, replace it with a plain standalone function `function int24be(r: Reader): number | null { const a=r.u8(), b=r.u8(), c=r.u8(); if (a===null||b===null||c===null) return null; return c+(b<<8)+(a<<16); }` and call `int24be(r)` instead of `r.int24be_compat()` inside `readPesThread` — functionally identical, simpler TypeScript.

- [ ] **Step 3: Smoke-test parsing against a real file**

Run this quick Node check (uses the compiled-on-the-fly TS via a temporary `.mjs` wrapper is overkill; instead verify structurally by reading raw bytes and checking the magic header, which confirms the file is readable before wiring it into React):

`cd "C:\Users\hp\OneDrive\Bureau\Pro\Rako\ylang-creations" && node -e "const fs=require('fs'); const b=fs.readFileSync('./public/fonts/Alfabeto Liz/99999974_A.pes'); console.log('magic:', b.toString('ascii',0,8));"`
Expected: `magic: #PES0100` (or another `#PESxxxx` variant / `#PEC0001`) — confirms the file is a real PES/PEC file the parser's `switch` in `parsePesHeader` should handle. The full rendering path is verified visually in Task 12's manual step.

- [ ] **Step 4: Commit**

```bash
git add lib/embroidery/pes-parser.ts
git commit -m "feat(embroidery): port PES/PEC parser to TypeScript"
```

---

### Task 11: Text normalization for caps-only fonts

**Files:**
- Create: `lib/embroidery/normalize.ts`

**Interfaces:**
- Produces: `normalizeForFont(text: string, fontId: string): string` — consumed by Task 15.

- [ ] **Step 1: Write the module**

```typescript
// Fonts whose glyph set is uppercase-only with no accented characters.
// Text is silently normalized before being handed to the renderer so the
// customer's input (kept as-is in the form field) doesn't fall through to
// the low-opacity placeholder glyph in EmbroideryPreview.
const CAPS_ONLY_FONT_IDS = new Set(["alfabeto-liz"]);

export function normalizeForFont(text: string, fontId: string): string {
  if (!CAPS_ONLY_FONT_IDS.has(fontId)) return text;
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip combining diacritics (é → e, à → a, ...)
    .toUpperCase();
}
```

- [ ] **Step 2: Verify it compiles**

Run: `cd "C:\Users\hp\OneDrive\Bureau\Pro\Rako\ylang-creations" && npx tsc --noEmit lib/embroidery/normalize.ts 2>&1 | grep -v "routes.d.ts"`
Expected: no output referencing this file.

- [ ] **Step 3: Manual sanity check**

Run: `node -e "const s='Zoé'; console.log(s.normalize('NFD').replace(/[̀-ͯ]/g,'').toUpperCase())"`
Expected: `ZOE`

- [ ] **Step 4: Commit**

```bash
git add lib/embroidery/normalize.ts
git commit -m "feat(embroidery): add caps-only font text normalization"
```

---

### Task 12: Generalize `EmbroideryPreview.tsx` for multi-font rendering

**Files:**
- Modify: `components/configurator/EmbroideryPreview.tsx` (full rewrite of the font-loading and adjustments sections; drawing math unchanged)

**Interfaces:**
- Consumes: `parsePesToPESData` from Task 10.
- Produces: `EmbroideryPreview` now takes `fontId: string`, `fontFolder: string`, `fontFormat: "exp" | "pes"` props (replacing the hardcoded `FONT_FOLDER` constant and `DEFAULT_ADJUSTMENTS`) — consumed by Task 13.

- [ ] **Step 1: Replace the font-loading section**

Replace lines 1-56 (from `"use client";` through the closing of `loadFontsShared`) with:

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { parsePesToPESData } from "@/lib/embroidery/pes-parser";

export type EmbroideryFontFormat = "exp" | "pes";

// Cache module-level, keyed by "format:folder" so multiple fonts coexist.
const _fontCache = new Map<string, FontFiles>();
const _fontLoadPromises = new Map<string, Promise<FontFiles>>();

function encodeFolderPath(folder: string): string {
  return folder.split("/").map(encodeURIComponent).join("/");
}

async function loadFontsShared(folder: string, format: EmbroideryFontFormat): Promise<FontFiles> {
  const cacheKey = `${format}:${folder}`;
  if (_fontCache.has(cacheKey)) return _fontCache.get(cacheKey)!;
  if (_fontLoadPromises.has(cacheKey)) return _fontLoadPromises.get(cacheKey)!;

  const promise = (async () => {
    const encodedFolder = encodeFolderPath(folder);
    const mRes = await fetch(`${encodedFolder}/manifest.json`);
    if (!mRes.ok) throw new Error(`manifest.json introuvable dans ${folder}`);
    const raw = await mRes.json();

    const newFonts: FontFiles = {};

    if (format === "pes") {
      // Direct letter → filename map, e.g. { "A": "99999974_A.pes", ... }.
      const map = raw as Record<string, string>;
      await Promise.all(
        Object.entries(map).map(async ([letter, filename]) => {
          try {
            const res = await fetch(`${encodedFolder}/${encodeURIComponent(filename)}`);
            if (!res.ok) return;
            newFonts[letter] = parsePesToPESData(await res.arrayBuffer());
          } catch (e) {
            console.warn(`Failed to load ${filename}`, e);
          }
        }),
      );
    } else {
      let filenames: string[] = [];
      let prefix = "";
      if (Array.isArray(raw)) {
        filenames = raw;
      } else if (typeof raw === "object" && raw !== null) {
        const keys = Object.keys(raw).sort((a, b) => parseFloat(a) - parseFloat(b));
        const firstKey = keys[0];
        if (firstKey) { filenames = raw[firstKey]; prefix = `${firstKey}/`; }
      }
      if (!filenames.length) throw new Error("Aucun fichier dans le manifest.");

      await Promise.all(filenames.map(async (filename: string) => {
        if (!filename.toLowerCase().endsWith(".exp")) return;
        let letter = "";
        const lowerFile = filename.toLowerCase();
        for (const [key, val] of Object.entries(SYMBOL_MAP)) {
          if (lowerFile.startsWith(key.toLowerCase())) { letter = val; break; }
        }
        if (!letter) {
          const firstChar = filename.charAt(0);
          if (firstChar.match(/[a-zA-Z0-9]/)) letter = firstChar;
        }
        if (!letter) return;
        try {
          const res = await fetch(`${encodedFolder}/${prefix}${filename}`);
          if (!res.ok) return;
          newFonts[letter] = parseEXP(await res.arrayBuffer());
        } catch (e) { console.warn(`Failed to load ${filename}`, e); }
      }));
    }

    _fontCache.set(cacheKey, newFonts);
    return newFonts;
  })();

  _fontLoadPromises.set(cacheKey, promise);
  return promise;
}
```

- [ ] **Step 2: Rename `DEFAULT_ADJUSTMENTS` to a per-font map**

Find the `type LetterAdj = ...` and `const DEFAULT_ADJUSTMENTS: Record<string, LetterAdj> = { ... };` block (originally lines 58-113). Replace the `const DEFAULT_ADJUSTMENTS` declaration line with:

```tsx
const FONT_ADJUSTMENTS: Record<string, Record<string, LetterAdj>> = {
  moonlight: {
```

...keep every existing letter entry (`A:{offsetY:18,...}` through `z:{offsetY:36,...}`) exactly as-is, unindented content unchanged...

...then close both the `moonlight` entry and add the Alfabeto Liz placeholder table (all zeros — ready to be overwritten once Task 17's calibration tool export is pasted in):

```tsx
  },
  "alfabeto-liz": {
    A:{offsetY:0,advanceX:0,leftBearing:0}, B:{offsetY:0,advanceX:0,leftBearing:0},
    C:{offsetY:0,advanceX:0,leftBearing:0}, D:{offsetY:0,advanceX:0,leftBearing:0},
    E:{offsetY:0,advanceX:0,leftBearing:0}, F:{offsetY:0,advanceX:0,leftBearing:0},
    G:{offsetY:0,advanceX:0,leftBearing:0}, H:{offsetY:0,advanceX:0,leftBearing:0},
    I:{offsetY:0,advanceX:0,leftBearing:0}, J:{offsetY:0,advanceX:0,leftBearing:0},
    K:{offsetY:0,advanceX:0,leftBearing:0}, L:{offsetY:0,advanceX:0,leftBearing:0},
    M:{offsetY:0,advanceX:0,leftBearing:0}, N:{offsetY:0,advanceX:0,leftBearing:0},
    O:{offsetY:0,advanceX:0,leftBearing:0}, P:{offsetY:0,advanceX:0,leftBearing:0},
    Q:{offsetY:0,advanceX:0,leftBearing:0}, R:{offsetY:0,advanceX:0,leftBearing:0},
    S:{offsetY:0,advanceX:0,leftBearing:0}, T:{offsetY:0,advanceX:0,leftBearing:0},
    U:{offsetY:0,advanceX:0,leftBearing:0}, V:{offsetY:0,advanceX:0,leftBearing:0},
    W:{offsetY:0,advanceX:0,leftBearing:0}, X:{offsetY:0,advanceX:0,leftBearing:0},
    Y:{offsetY:0,advanceX:0,leftBearing:0}, Z:{offsetY:0,advanceX:0,leftBearing:0},
  },
};
```

- [ ] **Step 3: Update the component's props**

Change the `EmbroideryPreviewProps` interface and function signature from:

```tsx
export interface EmbroideryPreviewProps {
  text: string;
  threadColor?: string | null;
  className?: string;
  targetHeight?: number;
}

export default function EmbroideryPreview({
  text, threadColor, className="", targetHeight=130,
}: EmbroideryPreviewProps) {
```

to:

```tsx
export interface EmbroideryPreviewProps {
  text: string;
  threadColor?: string | null;
  className?: string;
  targetHeight?: number;
  fontId: string;
  fontFolder: string;
  fontFormat: EmbroideryFontFormat;
}

export default function EmbroideryPreview({
  text, threadColor, className="", targetHeight=130, fontId, fontFolder, fontFormat,
}: EmbroideryPreviewProps) {
```

- [ ] **Step 4: Update the font-loading effect**

Change:

```tsx
  useEffect(() => {
    if (_fontCache) { setFontFiles(_fontCache); return; }
    loadFontsShared(FONT_FOLDER)
      .then(fonts => setFontFiles(fonts))
      .catch(e => setErrorMsg(e instanceof Error ? e.message : "Erreur inconnue"));
  }, []);
```

to:

```tsx
  useEffect(() => {
    const cacheKey = `${fontFormat}:${fontFolder}`;
    if (_fontCache.has(cacheKey)) { setFontFiles(_fontCache.get(cacheKey)!); return; }
    loadFontsShared(fontFolder, fontFormat)
      .then(fonts => setFontFiles(fonts))
      .catch(e => setErrorMsg(e instanceof Error ? e.message : "Erreur inconnue"));
  }, [fontFolder, fontFormat]);
```

Also change the initial state line right above it from `useState<FontFiles>(_fontCache ?? {})` to `useState<FontFiles>({})` (the module cache is now a `Map`, not a single object, so there's no single synchronous initial value to read).

- [ ] **Step 5: Use the per-font adjustments table in the drawing effect**

Inside the second `useEffect` (the drawing one), find the two places `DEFAULT_ADJUSTMENTS[ch]` is read:

```tsx
      const adj = DEFAULT_ADJUSTMENTS[ch];
```

(in the descender pre-pass) and:

```tsx
      const adj=DEFAULT_ADJUSTMENTS[ch]??{offsetY:0,advanceX:0,leftBearing:0};
```

(twice — once in the `advances` map, once in the render loop). Add this line at the top of the effect body, right after `if (!text) { canvas.width=1; canvas.height=1; return; }`:

```tsx
    const adjustments = FONT_ADJUSTMENTS[fontId] ?? {};
```

Then replace all three `DEFAULT_ADJUSTMENTS[ch]` reads with `adjustments[ch]`. Finally, add `fontId` to the effect's dependency array: change `}, [text, fontFiles, threadColor, targetHeight]);` to `}, [text, fontFiles, threadColor, targetHeight, fontId]);`.

- [ ] **Step 6: Verify it compiles**

Run: `cd "C:\Users\hp\OneDrive\Bureau\Pro\Rako\ylang-creations" && npx tsc --noEmit components/configurator/EmbroideryPreview.tsx 2>&1 | grep -v "routes.d.ts"`
Expected: no output referencing this file. Fix any leftover reference to the old `FONT_FOLDER` constant or `DEFAULT_ADJUSTMENTS` name if the compiler flags one.

- [ ] **Step 7: Commit**

```bash
git add components/configurator/EmbroideryPreview.tsx
git commit -m "feat(embroidery): generalize EmbroideryPreview for multi-font rendering"
```

---

### Task 13: Pass font props through `EmbroideryZoneOverlay`

**Files:**
- Modify: `components/configurator/EmbroideryZoneOverlay.tsx`

**Interfaces:**
- Consumes: `EmbroideryPreview`'s new props from Task 12.
- Produces: `EmbroideryZoneOverlay` now requires `fontId`, `fontFolder`, `fontFormat` props — consumed by Task 15.

- [ ] **Step 1: Extend the props interface**

Change:

```tsx
interface Props {
  texts: string[];
  threadColor: string;
  zone: EmbroideryZone;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export default function EmbroideryZoneOverlay({ texts, threadColor, zone, containerRef }: Props) {
```

to:

```tsx
interface Props {
  texts: string[];
  threadColor: string;
  zone: EmbroideryZone;
  containerRef: React.RefObject<HTMLDivElement | null>;
  fontId: string;
  fontFolder: string;
  fontFormat: "exp" | "pes";
}

export default function EmbroideryZoneOverlay({ texts, threadColor, zone, containerRef, fontId, fontFolder, fontFormat }: Props) {
```

- [ ] **Step 2: Pass the props down**

Change:

```tsx
            <EmbroideryPreview
              text={text}
              threadColor={threadColor}
              targetHeight={zone.fontSize}
            />
```

to:

```tsx
            <EmbroideryPreview
              text={text}
              threadColor={threadColor}
              targetHeight={zone.fontSize}
              fontId={fontId}
              fontFolder={fontFolder}
              fontFormat={fontFormat}
            />
```

- [ ] **Step 3: Verify it compiles**

Run: `cd "C:\Users\hp\OneDrive\Bureau\Pro\Rako\ylang-creations" && npx tsc --noEmit components/configurator/EmbroideryZoneOverlay.tsx 2>&1 | grep -v "routes.d.ts"`
Expected: errors about missing `fontId`/`fontFolder`/`fontFormat` at call sites in `app/admin/configurator/page.tsx` and `app/configurateur/page.tsx` — that's expected and fixed in Task 14/15.

- [ ] **Step 4: Commit**

```bash
git add components/configurator/EmbroideryZoneOverlay.tsx
git commit -m "feat(embroidery): thread font selection through EmbroideryZoneOverlay"
```

---

### Task 14: Extend shared types

**Files:**
- Modify: `types/configurateur-page.ts`
- Modify: `types/cart.ts`

**Interfaces:**
- Produces: `ConfigurateurEmbroideryFont` type and `ConfigurateurConfiguration.embroideryFont` field — consumed by Task 15. `CartItem.configuration.embroideryFont` — consumed by Task 15's `handleAddToCart`.

- [ ] **Step 1: Add the font type and configuration field**

In `types/configurateur-page.ts`, add after the `ConfigurateurFabricCategory` interface (after line 43, before `ConfigurateurConfiguration`):

```typescript
export interface ConfigurateurEmbroideryFont {
  id: string;
  name: string;
  folder: string;
  format: "exp" | "pes";
  price: number;
  order: number;
}
```

Then change `ConfigurateurConfiguration` from:

```typescript
export interface ConfigurateurConfiguration {
  product: ConfigurateurProduct | null;
  fabric: ConfigurateurFabric | null;
  size: string | null;
  embroideries: string[];
  embroideryColor: string;
  selectedColor: string | null;
}
```

to:

```typescript
export interface ConfigurateurConfiguration {
  product: ConfigurateurProduct | null;
  fabric: ConfigurateurFabric | null;
  size: string | null;
  embroideries: string[];
  embroideryColor: string;
  embroideryFont: ConfigurateurEmbroideryFont | null;
  selectedColor: string | null;
}
```

- [ ] **Step 2: Add the cart field**

In `types/cart.ts`, change:

```typescript
  configuration: {
    fabricName: string;
    fabricColor: string;
    embroidery?: string;
    embroideryColor?: string;
    size?: string;
    selectedColor?: string;    // hex, pour le swatch
    selectedColorName?: string; // nom affiché
  };
```

to:

```typescript
  configuration: {
    fabricName: string;
    fabricColor: string;
    embroidery?: string;
    embroideryColor?: string;
    embroideryFont?: string; // nom affiché de la police
    size?: string;
    selectedColor?: string;    // hex, pour le swatch
    selectedColorName?: string; // nom affiché
  };
```

- [ ] **Step 3: Verify both files compile**

Run: `cd "C:\Users\hp\OneDrive\Bureau\Pro\Rako\ylang-creations" && npx tsc --noEmit types/configurateur-page.ts types/cart.ts 2>&1 | grep -v "routes.d.ts"`
Expected: no output referencing these two files.

- [ ] **Step 4: Commit**

```bash
git add types/configurateur-page.ts types/cart.ts
git commit -m "feat(types): add embroidery font to configurator and cart types"
```

---

### Task 15: Configurator page — font selector, pricing, cart payload

**Files:**
- Modify: `app/configurateur/page.tsx`

**Interfaces:**
- Consumes: `GET /api/configurator/embroidery-fonts` (Task 3), `normalizeForFont` (Task 11), `EmbroideryZoneOverlay`'s new props (Task 13), `ConfigurateurEmbroideryFont` (Task 14).

- [ ] **Step 1: Update imports**

Change:

```tsx
import { Check, ChevronLeft, ChevronRight, Palette, ShoppingBag, X } from "lucide-react";
import { EMBROIDERY_PRICE_CENTS } from "@/lib/constants";
import { cents, centsToEuros } from "@/lib/currency";
```

to:

```tsx
import { Check, ChevronLeft, ChevronRight, Palette, ShoppingBag, X } from "lucide-react";
import { cents, centsToEuros } from "@/lib/currency";
import { normalizeForFont } from "@/lib/embroidery/normalize";
```

And in the type import block, add `ConfigurateurEmbroideryFont`:

```tsx
import type {
  ConfigurateurConfiguration,
  ConfigurateurEmbroideryFont,
  ConfigurateurFabric,
  ConfigurateurFabricCategory,
  ConfigurateurProduct,
} from "@/types/configurateur-page";
```

- [ ] **Step 2: Add state and fetch**

Change:

```tsx
  const [products, setProducts] = useState<ConfigurateurProduct[]>([]);
  const [fabrics, setFabrics] = useState<ConfigurateurFabric[]>([]);
  const [categories, setCategories] = useState<ConfigurateurFabricCategory[]>([]);
```

to:

```tsx
  const [products, setProducts] = useState<ConfigurateurProduct[]>([]);
  const [fabrics, setFabrics] = useState<ConfigurateurFabric[]>([]);
  const [categories, setCategories] = useState<ConfigurateurFabricCategory[]>([]);
  const [embroideryFonts, setEmbroideryFonts] = useState<ConfigurateurEmbroideryFont[]>([]);
```

Change the initial `configuration` state to include `embroideryFont: null`:

```tsx
  const [configuration, setConfiguration] = useState<ConfigurateurConfiguration>({
    product: null,
    fabric: null,
    size: null,
    embroideries: [""],
    embroideryColor: "#D4AF37",
    embroideryFont: null,
    selectedColor: null,
  });
```

In the data-loading effect, add the fetch call:

```tsx
        const [prodRes, fabRes, catRes, productColorsRes, embroideryColorsRes] = await Promise.all([
          fetch("/api/configurator/products?active=true"),
          fetch("/api/configurator/fabrics?active=true"),
          fetch("/api/configurator/categories?active=true"),
          fetch("/api/configurator/colors?type=product&active=true"),
          fetch("/api/configurator/colors?type=embroidery&active=true"),
        ]);
```

becomes:

```tsx
        const [prodRes, fabRes, catRes, productColorsRes, embroideryColorsRes, embroideryFontsRes] = await Promise.all([
          fetch("/api/configurator/products?active=true"),
          fetch("/api/configurator/fabrics?active=true"),
          fetch("/api/configurator/categories?active=true"),
          fetch("/api/configurator/colors?type=product&active=true"),
          fetch("/api/configurator/colors?type=embroidery&active=true"),
          fetch("/api/configurator/embroidery-fonts?active=true"),
        ]);
```

And right after `const loadedEmbroideryColors: { name: string; hex: string }[] = embroideryColorsData.colors || [];`, add:

```tsx
        const embroideryFontsData = await embroideryFontsRes.json();
        const loadedEmbroideryFonts: ConfigurateurEmbroideryFont[] = embroideryFontsData.fonts || [];
        setEmbroideryFonts(loadedEmbroideryFonts);
```

(Move the existing `setEmbroideryColors(loadedEmbroideryColors);` line's neighbors as needed so all `setXxx` calls stay grouped — exact ordering doesn't matter functionally.)

Finally, in the `setConfiguration` call that sets initial defaults once data loads:

```tsx
        if (loadedProducts.length > 0 && loadedFabrics.length > 0) {
          setConfiguration((prev) => ({
            ...prev,
            product: initialConfigProduct,
            fabric: loadedFabrics[0],
            size: initialConfigProduct?.defaultSize ?? initialConfigProduct?.sizes?.[0] ?? null,
            embroideryColor: loadedEmbroideryColors[0]?.hex ?? "#D4AF37",
            selectedColor:
              initialConfigProduct?.colorMaskImage && loadedProductColors[0]
                ? loadedProductColors[0].hex
                : null,
          }));
        }
```

add `embroideryFont: loadedEmbroideryFonts[0] ?? null,` right after the `embroideryColor` line.

- [ ] **Step 3: Update `totalPrice()`**

Change:

```tsx
  const totalPrice = () => {
    let total = configuration.product?.basePrice || 0;
    total += configuration.fabric?.price || 0;
    if (configuration.embroideries.some((e) => e.length > 0)) total += EMBROIDERY_PRICE_CENTS;
    return total;
  };
```

to:

```tsx
  const totalPrice = () => {
    let total = configuration.product?.basePrice || 0;
    total += configuration.fabric?.price || 0;
    if (configuration.embroideries.some((e) => e.length > 0)) {
      total += configuration.embroideryFont?.price ?? 0;
    }
    return total;
  };
```

- [ ] **Step 4: Add the font selector UI**

Locate the "Couleur du fil" block (originally lines 1057-1097, ending in `</div>` right before the closing `</>` of the `activeTab === "embroidery"` block). Insert a new "Police de broderie" block immediately after it (before the closing `</>`):

```tsx
                  {/* Police de broderie */}
                  {embroideryFonts.length > 1 && (
                    <div style={{ borderTop: "var(--rule-soft)", paddingTop: "1.5rem" }}>
                      <div className="mb-4 flex items-center justify-between">
                        <span className="type-overline" style={{ color: "var(--color-ink-3)" }}>
                          Police de broderie
                        </span>
                        {configuration.embroideryFont && (
                          <span className="font-body text-xs" style={{ color: "var(--color-ink-3)" }}>
                            {configuration.embroideryFont.name}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {embroideryFonts.map((font) => {
                          const isSelected = configuration.embroideryFont?.id === font.id;
                          const sampleText = normalizeForFont("Ylang", font.id);
                          return (
                            <button
                              key={font.id}
                              type="button"
                              onClick={() => setConfiguration((prev) => ({ ...prev, embroideryFont: font }))}
                              className="flex flex-col items-center gap-2 p-4 transition-all"
                              style={{
                                border: isSelected ? "2px solid var(--color-accent)" : "var(--rule-soft)",
                                background: isSelected ? "var(--color-paper-2)" : "var(--color-paper)",
                              }}
                            >
                              <EmbroideryPreview
                                text={sampleText}
                                threadColor={configuration.embroideryColor}
                                targetHeight={48}
                                fontId={font.id}
                                fontFolder={`/fonts/${font.folder}`}
                                fontFormat={font.format}
                              />
                              <span className="font-body text-xs" style={{ color: "var(--color-ink)" }}>
                                {font.name}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
```

Add the import for the standalone preview at the top of the file (next to the `EmbroideryZoneOverlay` import):

```tsx
import EmbroideryPreview from "@/components/configurator/EmbroideryPreview";
```

- [ ] **Step 5: Update the subtitle and résumé price text**

Change:

```tsx
                    <p className="font-body mt-1 text-sm" style={{ color: "var(--color-ink-3)" }}>
                      +15 € · Aperçu immédiat sur le produit
                    </p>
```

to:

```tsx
                    <p className="font-body mt-1 text-sm" style={{ color: "var(--color-ink-3)" }}>
                      +{((configuration.embroideryFont?.price ?? 0) / 100).toFixed(0)} € · Aperçu immédiat sur le produit
                    </p>
```

And in the résumé step's "Broderie" line item, change:

```tsx
                        <span className="font-body text-sm" style={{ color: "var(--color-ink)" }}>+15 €</span>
```

to:

```tsx
                        <span className="font-body text-sm" style={{ color: "var(--color-ink)" }}>
                          +{((configuration.embroideryFont?.price ?? 0) / 100).toFixed(0)} €
                        </span>
```

- [ ] **Step 6: Normalize text and pass font props to the live canvas overlay**

Change:

```tsx
            {configuration.embroideries.some((e) => e) && configuration.product?.embroideryZone && (
              <EmbroideryZoneOverlay
                texts={configuration.embroideries.filter(Boolean)}
                threadColor={configuration.embroideryColor}
                zone={configuration.product.embroideryZone}
                containerRef={productContainerRef}
              />
            )}
```

to:

```tsx
            {configuration.embroideries.some((e) => e) && configuration.product?.embroideryZone && configuration.embroideryFont && (
              <EmbroideryZoneOverlay
                texts={configuration.embroideries.filter(Boolean).map((t) => normalizeForFont(t, configuration.embroideryFont!.id))}
                threadColor={configuration.embroideryColor}
                zone={configuration.product.embroideryZone}
                containerRef={productContainerRef}
                fontId={configuration.embroideryFont.id}
                fontFolder={`/fonts/${configuration.embroideryFont.folder}`}
                fontFormat={configuration.embroideryFont.format}
              />
            )}
```

- [ ] **Step 7: Record the chosen font on the cart item**

Inside `handleAddToCart`, change:

```tsx
        embroidery: configuration.embroideries.filter(Boolean).join(", ") || undefined,
        embroideryColor: configuration.embroideries.some((e) => e) ? configuration.embroideryColor : undefined,
```

to:

```tsx
        embroidery: configuration.embroideries.filter(Boolean).join(", ") || undefined,
        embroideryColor: configuration.embroideries.some((e) => e) ? configuration.embroideryColor : undefined,
        embroideryFont: configuration.embroideries.some((e) => e) ? (configuration.embroideryFont?.name ?? undefined) : undefined,
```

- [ ] **Step 8: Remove the now-unused constant**

In `lib/constants.ts`, remove the line `export const EMBROIDERY_PRICE_CENTS = 1_500;` (it's no longer imported anywhere after Step 1).

- [ ] **Step 9: Verify it compiles**

Run: `cd "C:\Users\hp\OneDrive\Bureau\Pro\Rako\ylang-creations" && npx tsc --noEmit app/configurateur/page.tsx lib/constants.ts 2>&1 | grep -v "routes.d.ts"`
Expected: no output referencing these two files.

- [ ] **Step 10: Manual verification**

Run: `cd "C:\Users\hp\OneDrive\Bureau\Pro\Rako\ylang-creations" && pnpm dev`
Open `http://localhost:3000/configurateur`, go to step "Broderie", type a name with lowercase/accents (e.g. "Zoé") in the first name field. Expected:
- Two font cards appear ("Moonlight" and "Alfabeto Liz") each showing a live "Ylang"/"YLANG" sample.
- Selecting "Alfabeto Liz" re-renders the main product preview with the name in uppercase, accent-stripped ("ZOE"), using the blocky Alfabeto Liz stitching (not upside-down — if it renders upside-down, see the note in Task 10 Step 3 about flipping Y in `parsePesToPESData`).
- The price shown (subtitle, résumé, footer total) reflects the selected font's price from the admin-seeded value (15 €).
- Adding to cart and opening the cart drawer shows the font name in the item's configuration summary.
Stop the dev server once confirmed.

- [ ] **Step 11: Commit**

```bash
git add app/configurateur/page.tsx lib/constants.ts
git commit -m "feat(configurateur): add embroidery font selector, dynamic pricing, cart payload"
```

---

### Task 16: Calibration data persistence in `embodery-preview`

**Files:**
- Modify: `C:\Users\hp\OneDrive\Bureau\Pro\Rako\embodery-preview\server.js`

**Interfaces:**
- Produces: `GET /api/font-calibration?folder=...` → `{ folder, adjustments }`, `POST /api/font-calibration` (body `{ folder, adjustments }`) — consumed by Task 17.

- [ ] **Step 1: Add calibration file constants**

Right after the existing `const OVERRIDES_FILE = path.join(DATA_DIR, 'font-overrides.json');` line, add:

```javascript
const CALIBRATION_FILE = path.join(DATA_DIR, 'font-calibration.json');
```

- [ ] **Step 2: Add load/save helpers**

Right after the existing `saveOverrides` function, add:

```javascript
function loadCalibration() {
  try {
    return JSON.parse(fs.readFileSync(CALIBRATION_FILE, 'utf8'));
  } catch {
    return {};
  }
}

function saveCalibration(calibration) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(CALIBRATION_FILE, JSON.stringify(calibration, null, 2));
}
```

- [ ] **Step 3: Add the endpoints**

Right after the existing `app.post('/api/font-overrides', ...)` handler, add:

```javascript
app.get('/api/font-calibration', (req, res) => {
  const folder = req.query.folder;
  if (typeof folder !== 'string' || folder.length === 0) {
    return res.status(400).send('Missing folder');
  }
  const calibration = loadCalibration();
  res.json({ folder, adjustments: calibration[folder] || {} });
});

app.post('/api/font-calibration', (req, res) => {
  const { folder, adjustments } = req.body || {};
  if (typeof folder !== 'string' || folder.length === 0 || typeof adjustments !== 'object' || adjustments === null) {
    return res.status(400).send('Invalid body');
  }
  const clean = {};
  for (const [ch, adj] of Object.entries(adjustments)) {
    if (!ch || typeof adj !== 'object' || adj === null) continue;
    const offsetY = Number(adj.offsetY) || 0;
    const advanceX = Number(adj.advanceX) || 0;
    clean[ch] = { offsetY, advanceX, leftBearing: 0 };
  }
  const calibration = loadCalibration();
  calibration[folder] = clean;
  saveCalibration(calibration);
  res.json({ ok: true, folder, adjustments: clean });
});
```

- [ ] **Step 4: Verify the server starts**

Run: `cd "C:\Users\hp\OneDrive\Bureau\Pro\Rako\embodery-preview" && node -c server.js && echo "syntax ok"`
Expected: `syntax ok` (a syntax check, doesn't start the long-running server).

Then run: `cd "C:\Users\hp\OneDrive\Bureau\Pro\Rako\embodery-preview" && npm start &` (background) followed by `curl -s -X POST http://127.0.0.1:4173/api/font-calibration -H "Content-Type: application/json" -d "{\"folder\":\"Alfabeto Liz\",\"adjustments\":{\"A\":{\"offsetY\":5,\"advanceX\":-2}}}"` then `curl -s "http://127.0.0.1:4173/api/font-calibration?folder=Alfabeto%20Liz"`.
Expected: the GET echoes back `{"folder":"Alfabeto Liz","adjustments":{"A":{"offsetY":5,"advanceX":-2,"leftBearing":0}}}`. Stop the server afterward (find and kill the `node server.js` process, or close the terminal running it).

No commit convention exists in this local tool (it has no `.git` — verify with `git -C "C:\Users\hp\OneDrive\Bureau\Pro\Rako\embodery-preview" status` first; if it *is* a git repo, commit with `git add server.js && git commit -m "feat: persist per-letter calibration data"`, otherwise skip committing).

---

### Task 17: Calibration UI in `embodery-preview`

**Files:**
- Modify: `C:\Users\hp\OneDrive\Bureau\Pro\Rako\embodery-preview\public\index.html`
- Modify: `C:\Users\hp\OneDrive\Bureau\Pro\Rako\embodery-preview\public\style.css`
- Modify: `C:\Users\hp\OneDrive\Bureau\Pro\Rako\embodery-preview\public\app.js`

**Interfaces:**
- Consumes: `/api/font-calibration` from Task 16.
- Produces: a "Calibrer..." button opening a modal with per-letter `offsetY`/`advanceX` inputs, a live baseline-accurate preview canvas (replicating `EmbroideryPreview.tsx`'s layout math), and an "Exporter" button producing the `FONT_ADJUSTMENTS["alfabeto-liz"]` object literal to paste into Task 12's file.

- [ ] **Step 1: Add the modal markup**

In `index.html`, right after the existing `assignLettersBtn` button:

```html
        <button id="assignLettersBtn" class="secondary">Assigner lettres...</button>
```

add:

```html
        <button id="calibrateBtn" class="secondary">Calibrer...</button>
```

Then, right after the closing `</div>` of the existing `mappingOverlay` modal (before `<script src="pes-parser.js"></script>`), add a new modal:

```html
  <div class="modal-overlay" id="calibOverlay" style="display:none">
    <div class="modal" style="width:min(1000px,94vw)">
      <div class="modal-header">
        <h2>Calibrer les lettres -- Alfabeto Liz</h2>
      </div>
      <div class="modal-hint">
        offsetY et advanceX sont exprimés dans le même repère que la production (pixels canvas, targetHeight=130).
        Ajustez, observez l'aperçu, puis exportez.
      </div>
      <div style="padding:12px 20px;border-bottom:1px solid #2a2e37">
        <input type="text" id="calibPreviewText" value="YLANG" maxlength="15"
          style="width:100%;padding:8px 10px;background:#14161a;border:1px solid #2a2e37;border-radius:6px;color:#e8e8ea;font-size:14px" />
        <canvas id="calibPreviewCanvas" style="margin-top:12px;background:#16181d;border-radius:6px;display:block"></canvas>
      </div>
      <div class="mapping-grid" id="calibGrid"></div>
      <div class="modal-footer">
        <span class="modal-status" id="calibStatus"></span>
        <button id="calibExport" class="secondary">Exporter</button>
        <button id="calibCancel" class="secondary">Fermer</button>
        <button id="calibSave">Enregistrer</button>
      </div>
    </div>
  </div>
  <div class="modal-overlay" id="calibExportOverlay" style="display:none">
    <div class="modal" style="width:min(700px,92vw)">
      <div class="modal-header"><h2>Export TypeScript</h2></div>
      <div class="modal-hint">Copiez ce bloc et remplacez l'entrée "alfabeto-liz" dans FONT_ADJUSTMENTS (EmbroideryPreview.tsx).</div>
      <textarea id="calibExportText" readonly
        style="flex:1;margin:16px 20px;padding:12px;background:#14161a;border:1px solid #2a2e37;border-radius:6px;color:#e8e8ea;font-family:monospace;font-size:12px;min-height:300px"></textarea>
      <div class="modal-footer">
        <button id="calibExportClose" class="secondary">Fermer</button>
      </div>
    </div>
  </div>
```

- [ ] **Step 2: Add calibration item styling**

In `style.css`, right after the existing `.mapping-item input { ... }` block, add:

```css
.calib-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  background: #14161a;
  border: 1px solid #2a2e37;
  border-radius: 8px;
  padding: 8px;
}

.calib-item .calib-letter {
  font-size: 13px;
  color: #f4f4f5;
  font-weight: 600;
}

.calib-item .calib-row {
  display: flex;
  gap: 4px;
  align-items: center;
}

.calib-item .calib-row label {
  font-size: 10px;
  color: #6b7280;
  width: 46px;
}

.calib-item .calib-row input {
  width: 54px;
  text-align: center;
  background: #24272f;
  border: 1px solid #2a2e37;
  color: #e8e8ea;
  border-radius: 6px;
  padding: 3px;
  font-size: 12px;
}
```

- [ ] **Step 3: Implement the calibration logic**

At the very end of `app.js` (after the existing `mappingSave` click handler, before `resizeCanvas(); loadFileList();`), add:

```javascript
// --- Calibration ---

const calibOverlayEl = document.getElementById('calibOverlay');
const calibGridEl = document.getElementById('calibGrid');
const calibStatusEl = document.getElementById('calibStatus');
const calibPreviewTextEl = document.getElementById('calibPreviewText');
const calibPreviewCanvasEl = document.getElementById('calibPreviewCanvas');
const calibExportOverlayEl = document.getElementById('calibExportOverlay');
const calibExportTextEl = document.getElementById('calibExportText');

let calibAdjustments = {}; // letter -> { offsetY, advanceX }
let calibGlyphs = {}; // letter -> parsed design (same shape as getGlyphDesign results)

async function loadCalibrationFromServer(folder) {
  const res = await fetch('/api/font-calibration?folder=' + encodeURIComponent(folder));
  const data = await res.json();
  return data.adjustments || {};
}

// Replicates EmbroideryPreview.tsx's baseline layout math exactly, so the
// offsetY/advanceX numbers tuned here transfer 1:1 to production.
function drawCalibPreview() {
  const ctx = calibPreviewCanvasEl.getContext('2d');
  const text = calibPreviewTextEl.value || '';
  const CAP = 130, PX = 16, PY = 12;
  const chars = text.split('');
  const letters = Object.keys(calibGlyphs);
  if (!letters.length || !chars.length) {
    calibPreviewCanvasEl.width = 1; calibPreviewCanvasEl.height = 1;
    return;
  }
  let maxH = 1;
  for (const l of letters) {
    const h = calibGlyphs[l].bounds.maxY - calibGlyphs[l].bounds.minY;
    if (h > maxH) maxH = h;
  }
  const SCALE = CAP / maxH;
  const baselineY = PY + CAP;

  let maxDescender = 0;
  for (const ch of chars) {
    const adj = calibAdjustments[ch];
    if (adj && adj.offsetY > 0) maxDescender = Math.max(maxDescender, adj.offsetY);
  }
  const canvasH = baselineY + Math.ceil(maxDescender) + PY;

  const GAP = CAP * 0.05;
  const advances = chars.map((ch) => {
    const design = calibGlyphs[ch];
    if (!design) return CAP * 0.4;
    const w = design.bounds.maxX - design.bounds.minX;
    const adj = calibAdjustments[ch] || { advanceX: 0 };
    return w * SCALE + GAP + (adj.advanceX || 0);
  });

  let tw = PX;
  advances.forEach((adv, i) => { tw += i < chars.length - 1 ? adv : (calibGlyphs[chars[i]] ? (calibGlyphs[chars[i]].bounds.maxX - calibGlyphs[chars[i]].bounds.minX) * SCALE : adv); });
  tw += PX;

  calibPreviewCanvasEl.width = Math.max(Math.ceil(tw), 1);
  calibPreviewCanvasEl.height = Math.ceil(canvasH);
  ctx.clearRect(0, 0, calibPreviewCanvasEl.width, calibPreviewCanvasEl.height);

  let curX = PX;
  chars.forEach((ch, i) => {
    const design = calibGlyphs[ch];
    const adj = calibAdjustments[ch] || { offsetY: 0, advanceX: 0 };
    if (design) {
      const { minX, minY, maxY } = design.bounds;
      const originX = curX;
      const vertY = baselineY - (maxY - minY) * SCALE + (adj.offsetY || 0);
      ctx.save();
      ctx.translate(0, vertY);
      ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      for (const seg of design.segments) {
        ctx.strokeStyle = `rgb(${seg.color[0]}, ${seg.color[1]}, ${seg.color[2]})`;
        ctx.lineWidth = Math.max(1, SCALE * 0.7);
        ctx.beginPath();
        const pts = seg.points;
        ctx.moveTo(originX + (pts[0][0] - minX) * SCALE, (pts[0][1] - minY) * SCALE);
        for (let j = 1; j < pts.length; j++) ctx.lineTo(originX + (pts[j][0] - minX) * SCALE, (pts[j][1] - minY) * SCALE);
        ctx.stroke();
      }
      ctx.restore();
    }
    curX += advances[i];
  });
}

async function openCalibrationModal() {
  calibOverlayEl.style.display = 'flex';
  calibStatusEl.textContent = 'Chargement...';
  calibGridEl.innerHTML = '';

  const [map, savedAdjustments] = await Promise.all([
    getFontMap(FONT_FOLDER),
    loadCalibrationFromServer(FONT_FOLDER),
  ]);
  calibAdjustments = {};
  for (const [ch, adj] of Object.entries(savedAdjustments)) {
    calibAdjustments[ch] = { offsetY: adj.offsetY || 0, advanceX: adj.advanceX || 0 };
  }

  const letters = Object.keys(map).sort();
  calibGlyphs = {};
  for (const letter of letters) {
    try {
      calibGlyphs[letter] = await getGlyphDesign(map[letter]);
    } catch (e) {
      console.warn('Failed to load glyph for calibration', letter, e);
    }
  }

  calibGridEl.innerHTML = '';
  for (const letter of letters) {
    if (!calibAdjustments[letter]) calibAdjustments[letter] = { offsetY: 0, advanceX: 0 };
    const item = document.createElement('div');
    item.className = 'calib-item';

    const label = document.createElement('div');
    label.className = 'calib-letter';
    label.textContent = letter;
    item.appendChild(label);

    const rowY = document.createElement('div');
    rowY.className = 'calib-row';
    const labelY = document.createElement('label');
    labelY.textContent = 'offsetY';
    const inputY = document.createElement('input');
    inputY.type = 'number';
    inputY.value = calibAdjustments[letter].offsetY;
    inputY.addEventListener('input', () => {
      calibAdjustments[letter].offsetY = Number(inputY.value) || 0;
      drawCalibPreview();
    });
    rowY.appendChild(labelY); rowY.appendChild(inputY);
    item.appendChild(rowY);

    const rowX = document.createElement('div');
    rowX.className = 'calib-row';
    const labelX = document.createElement('label');
    labelX.textContent = 'advanceX';
    const inputX = document.createElement('input');
    inputX.type = 'number';
    inputX.value = calibAdjustments[letter].advanceX;
    inputX.addEventListener('input', () => {
      calibAdjustments[letter].advanceX = Number(inputX.value) || 0;
      drawCalibPreview();
    });
    rowX.appendChild(labelX); rowX.appendChild(inputX);
    item.appendChild(rowX);

    calibGridEl.appendChild(item);
  }

  calibStatusEl.textContent = letters.length + ' lettres chargées.';
  drawCalibPreview();
}

function closeCalibrationModal() {
  calibOverlayEl.style.display = 'none';
}

document.getElementById('calibrateBtn').addEventListener('click', openCalibrationModal);
document.getElementById('calibCancel').addEventListener('click', closeCalibrationModal);
calibPreviewTextEl.addEventListener('input', drawCalibPreview);

document.getElementById('calibSave').addEventListener('click', async () => {
  calibStatusEl.textContent = 'Enregistrement...';
  try {
    const res = await fetch('/api/font-calibration', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ folder: FONT_FOLDER, adjustments: calibAdjustments }),
    });
    if (!res.ok) throw new Error('Echec de l\'enregistrement');
    calibStatusEl.textContent = 'Enregistré.';
  } catch (err) {
    calibStatusEl.textContent = 'Erreur: ' + err.message;
  }
});

document.getElementById('calibExport').addEventListener('click', () => {
  const letters = Object.keys(calibAdjustments).sort();
  const lines = letters.map((l) => {
    const adj = calibAdjustments[l];
    return `    ${l}:{offsetY:${adj.offsetY},advanceX:${adj.advanceX},leftBearing:0},`;
  });
  const output = `  "alfabeto-liz": {\n${lines.join('\n')}\n  },`;
  calibExportTextEl.value = output;
  calibExportOverlayEl.style.display = 'flex';
});
document.getElementById('calibExportClose').addEventListener('click', () => {
  calibExportOverlayEl.style.display = 'none';
});
```

- [ ] **Step 4: Manual verification**

Run: `cd "C:\Users\hp\OneDrive\Bureau\Pro\Rako\embodery-preview" && npm start`
Open `http://127.0.0.1:4173`. Click "Calibrer...". Expected:
- A grid of 26 letters, each with `offsetY`/`advanceX` number inputs, appears.
- The preview canvas above renders "YLANG" using the current adjustments (all zero initially — letters will likely look slightly misaligned vertically since Alfabeto Liz glyphs weren't designed with a shared baseline reference; that's exactly what this tool is for).
- Changing an input immediately updates the preview.
- Typing a different word in the preview text field re-renders live.
- "Enregistrer" persists to `data/font-calibration.json` (check the file exists after saving).
- "Exporter" opens a textarea with a `"alfabeto-liz": { A:{...}, ... },` block.
Stop the server (Ctrl+C) once confirmed.

- [ ] **Step 5: Commit (if this tool is a git repo)**

```bash
git -C "C:\Users\hp\OneDrive\Bureau\Pro\Rako\embodery-preview" status
```

If it reports a git repository, run:

```bash
git -C "C:\Users\hp\OneDrive\Bureau\Pro\Rako\embodery-preview" add public/index.html public/style.css public/app.js
git -C "C:\Users\hp\OneDrive\Bureau\Pro\Rako\embodery-preview" commit -m "feat: add per-letter calibration UI"
```

Otherwise, skip — there's no version control to commit to.

---

### Task 18: Final verification pass

**Files:** none (verification-only task)

- [ ] **Step 1: Lint**

Run: `cd "C:\Users\hp\OneDrive\Bureau\Pro\Rako\ylang-creations" && pnpm lint`
Expected: no new errors introduced by this feature's files (`db/schema.ts`, `lib/validations/index.ts`, `app/api/configurator/embroidery-fonts/route.ts`, `app/api/admin/configurator/embroidery-fonts/route.ts`, `components/admin/configurator/embroidery-fonts-panel.tsx`, `app/admin/configurator/page.tsx`, `lib/embroidery/pes-parser.ts`, `lib/embroidery/normalize.ts`, `components/configurator/EmbroideryPreview.tsx`, `components/configurator/EmbroideryZoneOverlay.tsx`, `types/configurateur-page.ts`, `types/cart.ts`, `app/configurateur/page.tsx`, `lib/constants.ts`).

- [ ] **Step 2: Production build**

Run: `cd "C:\Users\hp\OneDrive\Bureau\Pro\Rako\ylang-creations" && pnpm build`
Expected: build succeeds (per this project's known environment flakiness with long Turbopack+typecheck runs crashing the sandboxed worker — if it crashes with a non-TypeScript exit code after "Compiled successfully", retry once or run on your own machine/CI; a real `Type error:` in the output means a genuine bug to fix, not flakiness).

- [ ] **Step 3: End-to-end manual walkthrough**

Run: `cd "C:\Users\hp\OneDrive\Bureau\Pro\Rako\ylang-creations" && pnpm dev`

Walk through:
1. `/admin/configurator` → "Polices" tab → confirm both fonts listed, edit Alfabeto Liz's price to a different value, save, confirm it persists on reload.
2. `/configurateur` → pick a product with an embroidery zone configured → step "Broderie" → type a name → switch between both font cards → confirm live preview updates and price updates.
3. Add to cart → open cart drawer → confirm the embroidery font name appears in the item's details.
4. Go through checkout up to (not including) actual payment submission → confirm the order summary price matches `totalPrice()` from the configurator.

Stop the dev server once confirmed.

- [ ] **Step 4: Final commit (only if any fixups were needed in Steps 1-3)**

```bash
git add -A
git commit -m "fix: address lint/build/QA findings from embroidery font selection feature"
```

If no fixups were needed, skip this step — Task 15's commit is already the last one.

---

## Self-Review Notes

- **Spec coverage:** scope (text font, not motif library) → Tasks 12-15; format porting → Task 10; static manifest → Task 9; calibration tooling → Tasks 16-17; admin-managed pricing, metadata-only → Tasks 1-8; global font choice → Task 15 Step 2 (single `embroideryFont` field, not per-line); silent normalization → Task 11 + Task 15 Step 6.
- **Placeholder scan:** the only intentionally-zero values are the Alfabeto Liz `FONT_ADJUSTMENTS` entries in Task 12 Step 2 — these are real, valid defaults (not TODOs), explicitly meant to be overwritten via Task 17's export once calibration is done by eye; this is called out inline.
- **Type consistency:** `ConfigurateurEmbroideryFont` (Task 14) fields (`id, name, folder, format, price, order`) match the DB table (Task 1), the public API response shape (Task 3), and the admin panel's `EmbroideryFont` type (Task 6). `EmbroideryPreview`'s `fontId/fontFolder/fontFormat` props (Task 12) match `EmbroideryZoneOverlay`'s props (Task 13) and the call sites in `app/configurateur/page.tsx` (Task 15).
