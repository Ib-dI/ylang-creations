# Ylang Créations — Refonte Luxe : Maison Éditoriale

**Date** : 2026-06-15  
**Scope** : Homepage · Collections · Fiche produit · Configurateur · À propos  
**Approche validée** : A — Maison éditoriale (inspiration Hermès / Jacquemus)  
**Palette** : conservée (cream/terracotta/rose/gold/green → OKLCH déjà en place)

---

## 1. Système de design global

### Typographie
| Rôle | Police | Usage |
|---|---|---|
| Display (H1, H2) | **Cormorant Garamond** (Google Fonts, SemiBold 600) | Tous les titres H1/H2. Haute contraste, optiquement calibrée display. Chargée via `next/font/google`. |
| Accent décoratif | Abramo Script | Taglines isolées, citations, jamais sur un heading |
| Corps | Inter 400/500 | Tout le texte courant |
| Brand / Eyebrow | Abramo (regular) | Labels uppercase, eyebrows 11px |

**Règle absolue** : `font-abramo-script` est interdit sur tout élément `h1`–`h6`. Seuls les `<p>` décoratifs, citations et taglines peuvent l'utiliser.

### Espacement
- Section padding desktop : `8rem` (était `6rem`)
- Section padding mobile : `4rem` (était `3rem`)
- Margins internes des blocs texte : +50%

### Fonds de section
- Toutes les couleurs de fond de section → supprimées
- Sections alternent entre `--color-paper` et `--color-paper-2` uniquement
- Interdit : `bg-linear-to-b`, `bg-gradient-*`, `bg-ylang-terracotta/*`, `bg-ylang-rose/*` sur des sections entières

### Animation
- Une seule primitive : `opacity: 0 → 1`, durée `600ms`, easing `var(--ease-out)`
- Supprimé : `spring`, `bounce`, `translateY` au scroll, `slide-in-right`, `blur-3xl` décoratifs
- Supprimé : `hover:scale-105`, `whileHover={{ scale, rotate }}`
- `prefers-reduced-motion` → aucune animation

### Règles visuelles
- Images : coins droits (border-radius `0` ou `2px` max)
- Ombres : supprimées (`shadow-2xl` → remplacé par `1px solid var(--rule-hair)` si nécessaire)
- Hover sur liens/cartes : `opacity` uniquement, jamais `transform`

---

## 2. Homepage

### Hero (split-screen — déjà implémenté)
- H1 : Abramo serif (remplace Bricolage Grotesque)
- Eyebrow : Abramo brand, conservé
- Sous-titre : Abramo Script conservé comme accent décoratif (usage correct)
- CTA : inchangé

### Section produits phares
- Eyebrow coloré supprimé
- H2 "Nos créations phares" → Abramo serif `text-5xl lg:text-6xl`
- Images produit : coins droits, espacements augmentés

### Section craftsmanship
- Fond : `--color-paper-2` (supprime le terracotta/40)
- H2 → Abramo serif `text-5xl lg:text-6xl`
- Stats (`1500+`, `6 ans`, `4.9/5`, `100%`) → **conservées** mais traitement visuel repensé : données texte élégantes, pas de cercles/trophées. À remplacer par les vraies valeurs.
- Citation éditoriale en Abramo Script, `text-2xl`, centrée, en complément
- Images : coins droits, suppression `rounded-2xl shadow-2xl`

### Section "Comment ça marche"
- Fond : `--color-paper` (supprime terracotta/40 + blur-3xl)
- H2 → Abramo serif
- Numéros d'étape `01/02/03` → Abramo serif grand
- Titre de chaque étape → Abramo serif `text-xl`

### Section testimonials
- Fond : `--color-paper-2`
- `stamp-card` (cadre dentelé) → supprimé, remplacé par `1px solid var(--rule-hair)`
- `whileHover={{ scale: 1.02, rotate: ±1 }}` → supprimé
- H2 → Abramo serif

---

## 3. Page Collections

### Header de page
- H1 "La Boutique" → Abramo serif `text-6xl lg:text-7xl`, centré
- Fond : `--color-paper`, padding généreux

### Filtres
- Barre horizontale fine
- Inter 11px uppercase `tracking-widest`
- Labels texte avec underline sur l'actif, pas de pills/boutons arrondis

### Grille produits
- `grid-cols-2 lg:grid-cols-3`, gap augmenté
- Aucun `hover:scale` sur les cartes

### Carte produit
- Image : coins droits, ratio `3/4`, fond `--color-paper-3` si absente
- Nom → Abramo serif `text-lg`
- Prix → Inter `text-sm`, muted
- Badge "Nouveau" → texte seul, uppercase 10px, sans pill coloré

---

## 4. Fiche produit

- Layout split desktop : image 60% | infos 40%
- Image principale : pleine hauteur, coins droits, aucun shadow
- Galerie thumbnails : rangée horizontale, `1px solid` au hover
- H1 produit → Abramo serif `text-4xl lg:text-5xl`
- Prix → Abramo serif `text-2xl`, `--color-ink`
- Description → Inter `text-base`, `line-height: 1.8`
- Bouton "Ajouter au panier" : `variant="maison"` (nouveau variant Button), pleine largeur, fond `--color-ink`, texte `--color-paper`, uppercase 12px `tracking-widest`, transition opacity uniquement — aucun scale, aucun shimmer
- Section "Vous aimerez aussi" → même traitement que la grille Collections

---

## 5. Page À propos

- Toutes les occurrences `font-abramo-script` sur H1/H2 → Cormorant Garamond
- Hero de page : grand titre Cormorant Garamond pleine largeur, fond `--color-paper-2`
- Citations et pull-quotes : Abramo Script conservée, `text-2xl`, centrée, `--color-accent`
- Suppression de tous les fonds colorés des sections
- Layout éditorial : alternance image-texte gauche/droite entre les sections

---

## 6. Configurateur

**Hors scope de cette refonte.** Traité dans une itération dédiée pour éviter tout risque de régression sur le canvas et la logique de sélection tissu.

---

## 7. Composant Button — nouveau variant `maison`

Ajout d'un variant sans toucher aux variants existants (pas de régression hors scope) :

```
maison: fond var(--color-ink) · texte var(--color-paper) · uppercase · tracking-widest
        hover: opacity 80% uniquement · aucun scale · aucun shimmer · aucun gradient
```

Pages refondues → `variant="maison"`. Pages hors scope → variants existants inchangés.

---

## 8. Fichiers concernés

| Fichier | Changements |
|---|---|
| `app/layout.tsx` | Chargement Cormorant Garamond via `next/font/google` |
| `app/globals.css` | `--font-display` → Cormorant Garamond, section padding `8rem`/`4rem` |
| `components/ui/button.tsx` | Ajout variant `maison` |
| `components/home/hero-section.tsx` | H1 → Cormorant Garamond |
| `components/home/craftsmanship-section.tsx` | Fond paper-2, stats conservées, coins droits |
| `components/home/how-it-works-section.tsx` | Fond paper, blur-3xl supprimés |
| `components/home/testimonials-section.tsx` | stamp-card → `1px solid var(--rule-hair)`, hover supprimé |
| `app/page.tsx` | Eyebrow coloré supprimé, fonds nettoyés |
| `app/collections/page.tsx` | Header H1 Cormorant, filtres texte, grille 3 col |
| `components/product/product-card.tsx` | Coins droits, hover opacity, badge texte |
| `components/product/product-details.tsx` | Layout 60/40, Cormorant sur H1/prix, variant maison |
| `app/a-propos/page.tsx` | Fond global supprimé, tous font-abramo-script → Cormorant, blur-3xl supprimés |

---

## Critères de succès

- Aucun `font-abramo-script` sur un élément `h1`–`h6` dans les 5 pages
- Aucun gradient de fond de section
- Aucun `hover:scale` ou `whileHover: scale/rotate`
- Aucune stat inventée (les métriques sont réelles ou absentes)
- Toutes les images en coins droits
- TypeScript et build Next.js : exit code 0
