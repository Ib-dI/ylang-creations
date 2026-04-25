# Broderie multi-noms Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permettre à l'utilisateur d'ajouter jusqu'à 3 noms brodés dans le configurateur, empilés verticalement avec un aperçu en temps réel.

**Architecture:** Le champ `embroidery: string` dans l'interface `Configuration` devient `embroideries: string[]`. Toutes les références dans `page.tsx` sont mises à jour. Le composant `EmbroideryZoneOverlay` reçoit `texts: string[]` au lieu de `text: string` et empile un `EmbroideryPreview` par nom via flex-col, centré sur le point d'ancrage — ce qui fait naturellement remonter le premier nom lorsqu'un deuxième est ajouté.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, Framer Motion. Aucune dépendance externe ajoutée.

---

## Fichiers modifiés

| Fichier | Rôle |
|---------|------|
| `app/configurateur/page.tsx` | Interface, état, UI étape 3, résumé, panier, overlay |
| `components/configurator/EmbroideryZoneOverlay.tsx` | Rendu multi-lignes |

`components/configurator/EmbroideryPreview.tsx` — **non modifié**.

---

## Task 1 : Mettre à jour le modèle de données dans `page.tsx`

**Files:**
- Modify: `app/configurateur/page.tsx`

- [ ] **Étape 1 : Remplacer `embroidery: string` par `embroideries: string[]` dans l'interface `Configuration`**

Localise l'interface `Configuration` (ligne ~75) et remplace :

```ts
// AVANT
interface Configuration {
  product: Product | null;
  fabric: Fabric | null;
  size: string | null;
  embroidery: string;
  embroideryColor: string;
  selectedColor: string | null;
}
```

Par :

```ts
// APRÈS
interface Configuration {
  product: Product | null;
  fabric: Fabric | null;
  size: string | null;
  embroideries: string[];
  embroideryColor: string;
  selectedColor: string | null;
}
```

- [ ] **Étape 2 : Mettre à jour l'état initial**

Localise `useState<Configuration>` (ligne ~249) et remplace :

```ts
// AVANT
const [configuration, setConfiguration] = useState<Configuration>({
  product: null as unknown as Product,
  fabric: null as unknown as Fabric,
  size: null,
  embroidery: "",
  embroideryColor: "#D4AF37",
  selectedColor: null,
});
```

Par :

```ts
// APRÈS
const [configuration, setConfiguration] = useState<Configuration>({
  product: null as unknown as Product,
  fabric: null as unknown as Fabric,
  size: null,
  embroideries: [""],
  embroideryColor: "#D4AF37",
  selectedColor: null,
});
```

- [ ] **Étape 3 : Mettre à jour `totalPrice`**

Localise la fonction `totalPrice` (ligne ~339) et remplace :

```ts
// AVANT
if (configuration.embroidery) total += 1500;
```

Par :

```ts
// APRÈS
if (configuration.embroideries.some(e => e.length > 0)) total += 1500;
```

- [ ] **Étape 4 : Mettre à jour l'onglet Broderie dans `tabs`**

Localise le tableau `tabs` (ligne ~347) et remplace :

```ts
// AVANT
{
  id: "embroidery" as const,
  label: "Broderie",
  icon: Type,
  complete: configuration.embroidery.length > 0,
},
```

Par :

```ts
// APRÈS
{
  id: "embroidery" as const,
  label: "Broderie",
  icon: Type,
  complete: configuration.embroideries.some(e => e.length > 0),
},
```

- [ ] **Étape 5 : Mettre à jour la condition de capture canvas dans `handleAddToCart`**

Localise la section canvas composite dans `handleAddToCart` (ligne ~418) et remplace :

```ts
// AVANT
if (
  configuration.embroidery &&
  configuration.product.embroideryZone &&
  productContainerRef.current
) {
```

Par :

```ts
// APRÈS
if (
  configuration.embroideries.some(e => e) &&
  configuration.product.embroideryZone &&
  productContainerRef.current
) {
```

- [ ] **Étape 6 : Mettre à jour la construction de l'item panier**

Dans `handleAddToCart`, localise la propriété `configuration` de l'objet `cartItem` (ligne ~464) et remplace :

```ts
// AVANT
embroidery: configuration.embroidery || undefined,
embroideryColor: configuration.embroidery ? configuration.embroideryColor : undefined,
```

Par :

```ts
// APRÈS
embroidery: configuration.embroideries.filter(Boolean).join(", ") || undefined,
embroideryColor: configuration.embroideries.some(e => e) ? configuration.embroideryColor : undefined,
```

- [ ] **Étape 7 : Vérifier qu'il n'y a plus de référence à `configuration.embroidery` dans `page.tsx`**

Cherche dans le fichier toute occurrence de `configuration.embroidery` (sans `ies`) — il ne doit en rester aucune sauf dans la JSX qu'on modifiera aux tasks suivantes. Corrige toute occurrence oubliée.

- [ ] **Étape 8 : Vérifier que TypeScript compile**

```bash
pnpm build 2>&1 | head -40
```

Résultat attendu : des erreurs sur `text=` dans l'overlay JSX (normal, on le corrige à la Task 2) mais **pas** d'erreur sur `embroidery` dans les fonctions déjà modifiées.

- [ ] **Étape 9 : Commit**

```bash
git add app/configurateur/page.tsx
git commit -m "refactor: replace embroidery string with embroideries array in Configuration"
```

---

## Task 2 : Mettre à jour le composant `EmbroideryZoneOverlay`

**Files:**
- Modify: `components/configurator/EmbroideryZoneOverlay.tsx`

- [ ] **Étape 1 : Remplacer le contenu complet du fichier**

Remplace intégralement `components/configurator/EmbroideryZoneOverlay.tsx` par :

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import EmbroideryPreview from "@/components/configurator/EmbroideryPreview";

interface EmbroideryZone {
  x: number;
  y: number;
  maxWidth: number;
  rotation: number;
  fontSize: number;
}

interface Props {
  texts: string[];
  threadColor: string;
  zone: EmbroideryZone;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export default function EmbroideryZoneOverlay({ texts, threadColor, zone, containerRef }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [lastCanvasH, setLastCanvasH] = useState(0);

  useEffect(() => {
    const update = () => {
      const container = containerRef.current;
      const wrapper = wrapperRef.current;
      if (!container || !wrapper) return;

      const containerW = container.getBoundingClientRect().width;
      const REFERENCE_WIDTH = 512;
      const newScale = Math.min(containerW / REFERENCE_WIDTH, 1);
      setScale(newScale);

      // Compensation basée sur le dernier canvas (ligne la plus basse du groupe)
      const canvases = wrapper.querySelectorAll<HTMLCanvasElement>("canvas");
      const lastCanvas = canvases.length > 0 ? canvases[canvases.length - 1] : null;
      if (lastCanvas) setLastCanvasH(lastCanvas.height);
    };

    update();
    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    if (wrapperRef.current) ro.observe(wrapperRef.current);
    return () => ro.disconnect();
  }, [texts, zone, containerRef]);

  const PY_TOP = 12;
  const symmetricBase = 2 * PY_TOP + zone.fontSize;
  const actualDescender = lastCanvasH > symmetricBase ? lastCanvasH - symmetricBase : 0;
  const verticalCompensation = (actualDescender / 2) * scale;

  // Réduction du double padding entre les canvases empilés :
  // Chaque EmbroideryPreview a PY=12px en haut et en bas → 24px entre deux lignes.
  // On applique un margin-top négatif en px de référence (le wrapper scale() s'en charge visuellement).
  const lineGap = -(PY_TOP * 1.5); // px de référence, PAS multiplié par scale

  if (!texts.length) return null;

  return (
    <div
      className="pointer-events-none absolute"
      style={{
        left: `${zone.x * 100}%`,
        top: `${zone.y * 100}%`,
        transform: `translate(-50%, calc(-50% + ${verticalCompensation}px)) rotate(${zone.rotation}deg)`,
        overflow: "visible",
      }}
    >
      <div
        ref={wrapperRef}
        style={{
          transformOrigin: "center center",
          transform: `scale(${scale})`,
          overflow: "visible",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {texts.map((text, i) => (
          <div
            key={i}
            style={{ marginTop: i > 0 ? lineGap : 0 }}
          >
            <EmbroideryPreview
              text={text}
              threadColor={threadColor}
              targetHeight={zone.fontSize}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Étape 2 : Commit**

```bash
git add components/configurator/EmbroideryZoneOverlay.tsx
git commit -m "feat: update EmbroideryZoneOverlay to support multiple stacked names"
```

---

## Task 3 : Mettre à jour l'overlay dans le JSX de `page.tsx`

**Files:**
- Modify: `app/configurateur/page.tsx`

- [ ] **Étape 1 : Remplacer la section overlay dans le panneau gauche (preview)**

Localise le bloc JSX (ligne ~777) qui ressemble à :

```tsx
{configuration.embroidery &&
  configuration.product?.embroideryZone && (
    <div
      className="pointer-events-none absolute flex items-center justify-center"
      style={{
        left: `${configuration.product.embroideryZone.x * 100}%`,
        top: `${configuration.product.embroideryZone.y * 100}%`,
        transform: `translate(-50%, -50%) rotate(${configuration.product.embroideryZone.rotation}deg)`,
        overflow: "visible",
      }}
    >
      {configuration.embroidery && configuration.product?.embroideryZone && (
          <EmbroideryZoneOverlay
            text={configuration.embroidery}
            threadColor={configuration.embroideryColor}
            zone={configuration.product.embroideryZone}
            containerRef={productContainerRef}
          />
        )}
    </div>
  )}
```

Et remplace-le par :

```tsx
{configuration.embroideries.some(e => e) &&
  configuration.product?.embroideryZone && (
    <div
      className="pointer-events-none absolute flex items-center justify-center"
      style={{
        left: `${configuration.product.embroideryZone.x * 100}%`,
        top: `${configuration.product.embroideryZone.y * 100}%`,
        transform: `translate(-50%, -50%) rotate(${configuration.product.embroideryZone.rotation}deg)`,
        overflow: "visible",
      }}
    >
      <EmbroideryZoneOverlay
        texts={configuration.embroideries.filter(Boolean)}
        threadColor={configuration.embroideryColor}
        zone={configuration.product.embroideryZone}
        containerRef={productContainerRef}
      />
    </div>
  )}
```

- [ ] **Étape 2 : Vérifier que TypeScript compile sans erreur**

```bash
pnpm build 2>&1 | head -40
```

Résultat attendu : aucune erreur sur `EmbroideryZoneOverlay` ni sur `embroideries`.

- [ ] **Étape 3 : Commit**

```bash
git add app/configurateur/page.tsx
git commit -m "feat: wire embroideries array to EmbroideryZoneOverlay preview"
```

---

## Task 4 : Mettre à jour l'UI de l'étape Broderie (Step 3)

**Files:**
- Modify: `app/configurateur/page.tsx`

- [ ] **Étape 1 : Remplacer le bloc `{activeTab === "embroidery" && ...}`**

Localise le bloc `{/* Step 3: Embroidery */}` (ligne ~1154) et remplace l'intégralité du contenu intérieur (du `<>` jusqu'au `</>` fermant de cette section) par :

```tsx
{activeTab === "embroidery" && (
  <>
    <div>
      <h2 className="text-ylang-charcoal/90 mb-2 text-2xl font-bold">
        Broderie personnalisée
      </h2>
      <p className="text-ylang-charcoal/60 text-sm">
        +15€ • Aperçu immédiat sur le produit
      </p>
    </div>
    <div className="space-y-4">
      <div className="rounded-2xl border border-[#f5f1e8] bg-ylang-beige/50 p-6">
        <div className="mb-4 flex items-center justify-between">
          <label className="text-ylang-charcoal text-base font-bold">
            Noms à broder
          </label>
          <span className="text-ylang-charcoal/40 text-xs font-medium">
            {configuration.embroideries.length} / 3
          </span>
        </div>

        <div className="space-y-3">
          {configuration.embroideries.map((name, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    const next = [...configuration.embroideries];
                    next[index] = e.target.value.slice(0, 15);
                    setConfiguration((prev) => ({ ...prev, embroideries: next }));
                  }}
                  placeholder={
                    index === 0 ? "Ex: Zoé" :
                    index === 1 ? "Ex: Mon Bébé" :
                    "Ex: Chéri(e)"
                  }
                  className="focus:border-ylang-rose focus:ring-ylang-rose/10 placeholder:text-ylang-charcoal/20 w-full rounded-2xl border-2 border-[#e8dcc8] bg-white px-5 py-2 text-lg font-medium transition-all focus:ring-4 focus:outline-none"
                  maxLength={15}
                />
                <div className="absolute top-1/2 right-5 -translate-y-1/2">
                  <span
                    className={`text-sm font-bold ${name.length >= 12 ? "text-ylang-rose" : "text-ylang-charcoal/30"}`}
                  >
                    {name.length}
                    <span className="text-ylang-charcoal/10 mx-0.5">/</span>
                    15
                  </span>
                </div>
              </div>
              {configuration.embroideries.length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    const next = configuration.embroideries.filter((_, i) => i !== index);
                    setConfiguration((prev) => ({ ...prev, embroideries: next }));
                  }}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-[#e8dcc8] text-ylang-charcoal/40 transition-colors hover:border-red-200 hover:text-red-400"
                  aria-label="Supprimer ce nom"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>

        {configuration.embroideries.length < 3 &&
          configuration.embroideries[configuration.embroideries.length - 1].length > 0 && (
          <button
            type="button"
            onClick={() =>
              setConfiguration((prev) => ({
                ...prev,
                embroideries: [...prev.embroideries, ""],
              }))
            }
            className="text-ylang-rose hover:text-ylang-terracotta mt-3 flex items-center gap-2 text-sm font-bold transition-colors"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-current text-xs leading-none">
              +
            </span>
            Ajouter un nom
          </button>
        )}

        <p className="text-ylang-charcoal/50 mt-4 flex items-center gap-2 text-sm font-medium">
          <span className="bg-ylang-rose/20 text-ylang-rose flex h-5 w-5 items-center justify-center rounded-full text-[10px]">
            i
          </span>
          Aperçu en temps réel sur l'image ci-dessus
        </p>
      </div>

      <div className="rounded-2xl border border-[#f5f1e8] bg-ylang-beige/50 p-6 transition-all">
        <div className="mb-4 flex items-center justify-between">
          <label className="text-ylang-charcoal text-base font-bold">
            Couleur du fil
          </label>
          {configuration.embroideryColor && (
            <span className="text-ylang-rose bg-ylang-rose/5 rounded-full px-3 py-1 text-sm font-bold">
              {
                embroideryColors.find(
                  (c) => c.hex === configuration.embroideryColor,
                )?.name
              }
            </span>
          )}
        </div>
        <div className="grid grid-cols-6 gap-4 sm:grid-cols-8 md:grid-cols-10">
          {embroideryColors.map((color) => {
            const isSelected =
              configuration.embroideryColor === color.hex;
            return (
              <button
                key={color.hex}
                onClick={() =>
                  setConfiguration((prev) => ({
                    ...prev,
                    embroideryColor: color.hex,
                  }))
                }
                className={`group relative h-10 w-10 shrink-0 cursor-pointer rounded-full transition-all duration-300 ${
                  isSelected
                    ? "ring-ylang-rose/20 scale-110 shadow-lg ring-4"
                    : "hover:scale-115 hover:shadow-md"
                }`}
                style={{ backgroundColor: color.hex }}
                title={color.name}
              >
                {isSelected && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-full border-2 border-white">
                    <div className="h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  </>
)}
```

- [ ] **Étape 2 : Vérifier que TypeScript compile**

```bash
pnpm build 2>&1 | head -40
```

Résultat attendu : aucune erreur TypeScript.

- [ ] **Étape 3 : Commit**

```bash
git add app/configurateur/page.tsx
git commit -m "feat: add multi-name embroidery UI with add/remove controls"
```

---

## Task 5 : Mettre à jour le récapitulatif (Step 4 — Summary)

**Files:**
- Modify: `app/configurateur/page.tsx`

- [ ] **Étape 1 : Remplacer la section Broderie dans le résumé**

Localise le bloc `{/* Broderie */}` (ligne ~1352) dans l'onglet `summary`. Il ressemble à :

```tsx
{/* Broderie */}
{configuration.embroidery ? (
  <motion.div
    initial={{ opacity: 0, x: -8 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 0.26 }}
    className="flex items-center justify-between px-5 py-4"
  >
    <div>
      <p className="text-ylang-charcoal/35 mb-2 text-[9px] font-black tracking-[0.12em] uppercase">Broderie</p>
      <div className="flex items-center gap-2.5">
        <div
          className="h-7 w-7 shrink-0 rounded-full border-2 border-white shadow-[0_2px_8px_rgba(0,0,0,0.12)]"
          style={{ backgroundColor: configuration.embroideryColor }}
        />
        <div>
          <p className="font-abramo-script text-ylang-charcoal text-xl leading-tight">
            {configuration.embroidery}
          </p>
          <p className="text-ylang-charcoal/40 text-xs">
            {embroideryColors.find((c) => c.hex === configuration.embroideryColor)?.name}
          </p>
        </div>
      </div>
    </div>
    <span className="text-ylang-charcoal text-sm font-bold">+15€</span>
  </motion.div>
) : (
  <motion.div
    initial={{ opacity: 0, x: -8 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 0.26 }}
    className="px-5 py-4"
  >
    <p className="text-ylang-charcoal/35 mb-1 text-[9px] font-black tracking-[0.12em] uppercase">Broderie</p>
    <p className="text-ylang-charcoal/30 text-xs italic">Aucune broderie</p>
  </motion.div>
)}
```

Remplace par :

```tsx
{/* Broderie */}
{configuration.embroideries.some(e => e) ? (
  <motion.div
    initial={{ opacity: 0, x: -8 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 0.26 }}
    className="flex items-center justify-between px-5 py-4"
  >
    <div>
      <p className="text-ylang-charcoal/35 mb-2 text-[9px] font-black tracking-[0.12em] uppercase">Broderie</p>
      <div className="flex items-center gap-2.5">
        <div
          className="h-7 w-7 shrink-0 rounded-full border-2 border-white shadow-[0_2px_8px_rgba(0,0,0,0.12)]"
          style={{ backgroundColor: configuration.embroideryColor }}
        />
        <div>
          {configuration.embroideries.filter(Boolean).map((name, i) => (
            <p key={i} className="font-abramo-script text-ylang-charcoal text-xl leading-tight">
              {name}
            </p>
          ))}
          <p className="text-ylang-charcoal/40 text-xs">
            {embroideryColors.find((c) => c.hex === configuration.embroideryColor)?.name}
          </p>
        </div>
      </div>
    </div>
    <span className="text-ylang-charcoal text-sm font-bold">+15€</span>
  </motion.div>
) : (
  <motion.div
    initial={{ opacity: 0, x: -8 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 0.26 }}
    className="px-5 py-4"
  >
    <p className="text-ylang-charcoal/35 mb-1 text-[9px] font-black tracking-[0.12em] uppercase">Broderie</p>
    <p className="text-ylang-charcoal/30 text-xs italic">Aucune broderie</p>
  </motion.div>
)}
```

- [ ] **Étape 2 : Build final complet**

```bash
pnpm build 2>&1 | tail -20
```

Résultat attendu : `✓ Compiled successfully` (ou similaire), **zéro erreur TypeScript**.

- [ ] **Étape 3 : Vérifier manuellement dans le navigateur**

```bash
pnpm dev
```

Checklist de vérification :
1. Aller sur `localhost:3000/configurateur`
2. **Étape Broderie** : un seul champ visible au départ
3. Taper un premier nom → le bouton "Ajouter un nom" apparaît
4. Cliquer "Ajouter un nom" → un 2e champ apparaît, le premier nom remonte dans le preview
5. Taper un 2e nom → le bouton "Ajouter un nom" réapparaît
6. Ajouter un 3e nom → le bouton disparaît (max atteint), le 1er nom est encore plus haut
7. Cliquer ✕ sur le 2e champ → il disparaît, le 1er redescend légèrement
8. **Étape Résumé** : les noms sont listés les uns sous les autres avec la couleur du fil
9. **Panier** : `embroidery` contient les noms joints par ", "

- [ ] **Étape 4 : Commit final**

```bash
git add app/configurateur/page.tsx
git commit -m "feat: display multiple embroidery names in summary step"
```
