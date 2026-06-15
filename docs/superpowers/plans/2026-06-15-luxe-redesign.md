# Ylang Créations — Refonte Luxe : Implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply a Maison Éditoriale (Hermès / Jacquemus) design system across Homepage, Collections, Fiche Produit, and À Propos — zero gradients, zero hover:scale, zero font-abramo-script on headings, Cormorant Garamond as the display typeface.

**Architecture:** Edit 12 existing files in-place. No new routes or components — only the visual/interaction layer changes. Each task is standalone and commit-able.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind CSS v4, Framer Motion, next/font/google, CVA (class-variance-authority), OKLCH design tokens in `app/globals.css`

**Spec:** `docs/superpowers/specs/2026-06-15-luxe-redesign-design.md`

---

## Success Criteria (run before closing the plan)

- Zero `font-abramo-script` on `h1`–`h6` in the 5 target pages
- Zero `bg-linear-to-*` / `bg-gradient-*` on section elements
- Zero `hover:scale-*` or `whileHover` with scale/rotate
- All images use `rounded-none` (or `rounded-[2px]` max)
- `pnpm build` exits 0

---

## Task 1 — Design System Foundation

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`
- Modify: `tokens.css`
- Modify: `components/ui/button.tsx`

---

- [ ] **Step 1.1 — Add Cormorant Garamond to `app/layout.tsx`**

  In `app/layout.tsx`, import `Cormorant_Garamond` and add its variable to the body. The existing imports are at line 4; add `Cormorant_Garamond` to the destructured import and define a new font loader below `playfairDisplay`.

  ```tsx
  // line 4 — add Cormorant_Garamond
  import { Bricolage_Grotesque, Cormorant_Garamond, Inter, Playfair_Display } from "next/font/google";

  // after playfairDisplay definition (after line 21):
  const cormorantGaramond = Cormorant_Garamond({
    variable: "--font-cormorant-garamond",
    subsets: ["latin"],
    weight: ["600"],
    display: "swap",
    preload: true,
  });
  ```

  Then on the `<body>` className (search for `font-body bg-ylang-cream antialiased`), add `${cormorantGaramond.variable}`:

  ```tsx
  // before:
  className={`${inter.variable} ${playfairDisplay.variable} ${bricolageGrotesque.variable} font-body bg-ylang-cream antialiased`}

  // after:
  className={`${inter.variable} ${playfairDisplay.variable} ${bricolageGrotesque.variable} ${cormorantGaramond.variable} font-body bg-ylang-cream antialiased`}
  ```

- [ ] **Step 1.2 — Update `--font-display` token in `app/globals.css`**

  The OKLCH `:root` block in `app/globals.css` (around line 82) has:
  ```css
  --font-display: "Bricolage Grotesque", sans-serif;
  ```
  Change it to:
  ```css
  --font-display: var(--font-cormorant-garamond, "Cormorant Garamond"), serif;
  ```

  Also update section padding (line ~48 in `@theme inline`):
  ```css
  /* before: */
  --spacing-section: 6rem;
  --spacing-section-mobile: 3rem;

  /* after: */
  --spacing-section: 8rem;
  --spacing-section-mobile: 4rem;
  ```

- [ ] **Step 1.3 — Update `--font-display` in `tokens.css`**

  `tokens.css` at project root has its own `:root` block with:
  ```css
  --font-display: "Bricolage Grotesque", sans-serif;
  ```
  Change it to:
  ```css
  --font-display: var(--font-cormorant-garamond, "Cormorant Garamond"), serif;
  ```

- [ ] **Step 1.4 — Update `.font-display` CSS class in `app/globals.css`**

  Around line 101 in `app/globals.css`:
  ```css
  /* before: */
  .font-display {
    font-family: var(--font-display);
    letter-spacing: -0.02em;
  }

  /* after — tighter tracking suits Cormorant: */
  .font-display {
    font-family: var(--font-display);
    letter-spacing: -0.01em;
  }
  ```

- [ ] **Step 1.5 — Add `maison` variant to `components/ui/button.tsx`**

  In the `buttonVariants` CVA (after the `link` variant, before the closing `},` of `variant:`):

  ```tsx
  maison: [
    "rounded-none uppercase tracking-[0.14em] text-xs",
    "transition-opacity duration-300",
  ],
  ```

  The `maison` variant intentionally has no background/text classes in CVA — callers apply the OKLCH token inline to avoid specificity fights with Tailwind:
  ```tsx
  // Usage at call sites:
  <Button
    variant="maison"
    style={{ background: "var(--color-ink)", color: "var(--color-paper)" }}
  >
    Ajouter au panier
  </Button>
  ```

  Add the `maison` type to the CVA definition. Full updated variant block:

  ```tsx
  variant: {
    primary: [ ... ],    // unchanged
    secondary: [ ... ],  // unchanged
    ghost: [ ... ],      // unchanged
    luxury: [ ... ],     // unchanged
    link: [ ... ],       // unchanged
    maison: [
      "rounded-none uppercase tracking-[0.14em] text-xs",
      "transition-opacity duration-300 hover:opacity-75",
    ],
  },
  ```

- [ ] **Step 1.6 — Commit**

  ```bash
  git add app/layout.tsx app/globals.css tokens.css components/ui/button.tsx
  git commit -m "feat: load Cormorant Garamond, update --font-display token, add maison Button variant"
  ```

---

## Task 2 — Homepage: Featured Products Section

**Files:**
- Modify: `app/page.tsx`

The featured products `<section>` (around line 155) has `bg-ylang-terracotta/50` background and a colored eyebrow `font-abramo text-ylang-rose`. Fix both.

---

- [ ] **Step 2.1 — Remove colored background and eyebrow from featured section**

  In `app/page.tsx`, find the `<section>` for featured products:

  ```tsx
  // before (line ~155):
  <section className="bg-ylang-terracotta/50 py-12 sm:py-16 lg:py-24">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mb-8 text-center lg:mb-12">
        <p className="font-abramo text-ylang-rose mb-3 text-sm font-semibold tracking-widest uppercase">
          Collections printemps
        </p>
        <h2 className="font-display text-ylang-charcoal mb-4 text-4xl lg:text-5xl font-semibold tracking-tight">
          Nos créations phares
        </h2>
  ```

  Replace with:

  ```tsx
  // after:
  <section className="py-20 lg:py-32" style={{ background: "var(--color-paper)" }}>
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mb-8 text-center lg:mb-12">
        <h2 className="font-display text-ylang-charcoal mb-4 text-4xl lg:text-5xl font-semibold tracking-tight">
          Nos créations phares
        </h2>
  ```

  Also remove the `<p>` eyebrow with `font-abramo text-ylang-rose` entirely.

- [ ] **Step 2.2 — Remove eyebrow from the How it Works section in app/page.tsx**

  `HowItWorksSection` passes `craftsmanshipImage` from settings — no change needed in `page.tsx` for that. But if there is an eyebrow section wrapper in `page.tsx` for how-it-works, check and clean it. (The section component handles its own markup — skip if no wrapper eyebrow exists here.)

- [ ] **Step 2.3 — Commit**

  ```bash
  git add app/page.tsx
  git commit -m "refactor: remove terracotta bg and colored eyebrow from homepage featured products"
  ```

---

## Task 3 — Homepage: Craftsmanship Section

**Files:**
- Modify: `components/home/craftsmanship-section.tsx`

---

- [ ] **Step 3.1 — Fix section background**

  Line 43:
  ```tsx
  // before:
  <section className="section-padding overflow-hidden bg-linear-to-b from-ylang-terracotta/50 to-ylang-terracotta/40">

  // after:
  <section className="section-padding overflow-hidden" style={{ background: "var(--color-paper-2)" }}>
  ```

- [ ] **Step 3.2 — Fix main image container (remove rounded + shadow)**

  Lines 68-79. The main image `<div>`:
  ```tsx
  // before:
  <div className="relative aspect-4/5 overflow-hidden rounded-2xl shadow-2xl">
    <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-ylang-beige to-ylang-cream">

  // after:
  <div className="relative aspect-4/5 overflow-hidden">
    <div className="absolute inset-0 flex items-center justify-center" style={{ background: "var(--color-paper-3)" }}>
  ```

- [ ] **Step 3.3 — Remove floating secondary image and Made in France badge**

  Delete the entire `{/* Image flottante secondaire */}` block (lines 82–90) and the `{/* Badge Made in France */}` block (lines 92–107). These are the decorative float and the emoji badge.

- [ ] **Step 3.4 — Fix eyebrow color**

  Line 47:
  ```tsx
  // before:
  <p className="font-abramo font-semibold text-ylang-rose mb-3 text-sm tracking-widest uppercase">

  // after:
  <p
    className="mb-3 text-[11px] tracking-[0.2em] uppercase font-semibold"
    style={{ fontFamily: "var(--font-brand)", color: "var(--color-accent)" }}
  >
  ```

- [ ] **Step 3.5 — Fix value cards (remove terracotta bg + rounded corners)**

  Lines 135–153, each value card `<div>`:
  ```tsx
  // before:
  <div
    key={value.title}
    className="flex gap-4 rounded-xl border border-ylang-terracotta/30 bg-ylang-terracotta/30 p-4 transition-shadow duration-300 animate-slide-in-left"
    style={{ animationDelay: `${0.5 + index * 0.15}s` }}
  >
    <div className="bg-ylang-rose/20 flex h-12 w-12 shrink-0 items-center justify-center rounded-lg">
      <value.icon className="text-ylang-rose h-6 w-6" />
    </div>

  // after:
  <div
    key={value.title}
    className="flex gap-4 p-4"
    style={{ borderBottom: "var(--rule-hair)" }}
  >
    <div className="flex h-12 w-12 shrink-0 items-center justify-center">
      <value.icon className="h-6 w-6" style={{ color: "var(--color-accent)" }} />
    </div>
  ```

- [ ] **Step 3.6 — Fix stats bar (remove rounded + terracotta bg)**

  Lines 172–190:
  ```tsx
  // before:
  <div
    className="grid grid-cols-2 gap-8 rounded-2xl border border-ylang-terracotta/30 bg-ylang-terracotta/30 p-8 md:grid-cols-4 animate-fade-in-up"
    style={{ animationDelay: '0.4s' }}
  >
    {stats.map((stat, index) => (
      <div key={stat.label} className="text-center animate-scale-in" style={{ animationDelay: `${0.6 + index * 0.1}s` }}>
        <p className="font-display text-ylang-rose mb-2 text-4xl font-bold lg:text-5xl">

  // after:
  <div
    className="grid grid-cols-2 gap-8 p-8 md:grid-cols-4"
    style={{ borderTop: "var(--rule-hair)" }}
  >
    {stats.map((stat) => (
      <div key={stat.label} className="text-center">
        <p
          className="mb-2 text-4xl font-semibold lg:text-5xl"
          style={{ fontFamily: "var(--font-display)", color: "var(--color-accent)" }}
        >
  ```

- [ ] **Step 3.7 — Commit**

  ```bash
  git add components/home/craftsmanship-section.tsx
  git commit -m "refactor: craftsmanship section — paper-2 bg, straight image, clean value cards, refined stats"
  ```

---

## Task 4 — Homepage: How It Works Section

**Files:**
- Modify: `components/home/how-it-works-section.tsx`

---

- [ ] **Step 4.1 — Fix section wrapper**

  Find the outer `<section>` wrapper (it has `section-padding` and either a terracotta bg or uses default). Read the current line and fix:

  ```tsx
  // before (the section around line 50 — check exact text):
  <section className="section-padding ...bg-ylang-terracotta/40 or similar...">

  // after:
  <section className="section-padding overflow-hidden" style={{ background: "var(--color-paper)" }}>
  ```

  If there are any `blur-3xl` decorative `<div>` elements inside the section, delete them.

- [ ] **Step 4.2 — Fix eyebrow color**

  Line 56 (approximately):
  ```tsx
  // before:
  <p className="font-abramo font-semibold text-ylang-rose mb-3 text-sm uppercase tracking-widest">

  // after:
  <p
    className="mb-3 text-[11px] tracking-[0.2em] uppercase font-semibold"
    style={{ fontFamily: "var(--font-brand)", color: "var(--color-accent)" }}
  >
  ```

- [ ] **Step 4.3 — Fix step cards (remove rounded, remove hover transform, remove gradient line)**

  Each step card (around line 84):
  ```tsx
  // before:
  <div className="relative h-full aspect-4/5 rounded-2xl bg-ylang-beige p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-xs">
    {/* Number Badge */}
    <div className="absolute -top-4 -right-4 flex h-16 w-16 items-center justify-center rounded-full bg-ylang-rose shadow-xs">

  // after:
  <div
    className="relative h-full aspect-4/5 p-8"
    style={{ background: "var(--color-paper-2)", border: "var(--rule-hair)" }}
  >
    {/* Number Badge */}
    <div
      className="absolute -top-4 -right-4 flex h-16 w-16 items-center justify-center"
      style={{ background: "var(--color-ink)" }}
    >
  ```

  Number badge text:
  ```tsx
  // before:
  <span className="font-display text-2xl font-bold text-white">

  // after:
  <span
    className="text-2xl font-semibold"
    style={{ fontFamily: "var(--font-display)", color: "var(--color-paper)" }}
  >
  ```

- [ ] **Step 4.4 — Remove icon container scale and terracotta bg**

  Line ~93:
  ```tsx
  // before:
  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-ylang-terracotta/20 transition-transform duration-300 group-hover:scale-110">
    <Icon className="text-ylang-rose h-8 w-8" />

  // after:
  <div className="mb-6 flex h-16 w-16 items-center justify-center">
    <Icon className="h-8 w-8" style={{ color: "var(--color-accent)" }} />
  ```

- [ ] **Step 4.5 — Remove gradient connecting line**

  Delete the connecting line `<div>` (around line 80):
  ```tsx
  // delete this entire block:
  {index < steps.length - 1 && (
    <div className="absolute top-20 left-full z-0 hidden h-0.5 w-full -translate-x-1/2 bg-linear-to-r from-ylang-rose/50 to-transparent lg:block" />
  )}
  ```

- [ ] **Step 4.6 — Commit**

  ```bash
  git add components/home/how-it-works-section.tsx
  git commit -m "refactor: how-it-works — paper bg, straight corners, remove hover transform and gradient line"
  ```

---

## Task 5 — Homepage: Testimonials Section

**Files:**
- Modify: `components/home/testimonials-section.tsx`

---

- [ ] **Step 5.1 — Fix section background (remove gradient + blur-3xl)**

  Line 28:
  ```tsx
  // before:
  <section className="section-padding from-ylang-terracotta/40 relative overflow-hidden bg-linear-to-b to-ylang-rose/40 py-20">
    {/* Decoration */}
    <div className="bg-ylang-rose/5 absolute top-1/2 left-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl" />

  // after:
  <section className="relative overflow-hidden py-20" style={{ background: "var(--color-paper-2)" }}>
  ```

  (Delete the blur-3xl `<div>` entirely.)

- [ ] **Step 5.2 — Fix eyebrow**

  Line 40:
  ```tsx
  // before:
  <p className="text-ylang-rose font-abramo mb-3 text-sm font-semibold tracking-widest uppercase">

  // after:
  <p
    className="mb-3 text-[11px] tracking-[0.2em] uppercase font-semibold"
    style={{ fontFamily: "var(--font-brand)", color: "var(--color-accent)" }}
  >
  ```

- [ ] **Step 5.3 — Replace stamp-card with plain border + remove whileHover**

  The `<motion.div>` card (lines 54–86):

  ```tsx
  // before:
  <motion.div
    key={testimonial.id || index}
    onClick={() => setSelectedImage(testimonial.image)}
    className="group relative mb-10 cursor-zoom-in break-inside-avoid"
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.05 }}
    whileHover={{ scale: 1.02, rotate: index % 2 === 0 ? 1 : -1 }}
  >
    <div className="stamp-card transition-all duration-300 group-hover:scale-105">
      <div className="stamp-inner">
        <Image
          ...
          className="z-100 block h-auto w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

  // after:
  <motion.div
    key={testimonial.id || index}
    onClick={() => setSelectedImage(testimonial.image)}
    className="group relative mb-10 cursor-zoom-in break-inside-avoid"
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
  >
    <div
      className="overflow-hidden transition-opacity duration-300 group-hover:opacity-90"
      style={{ border: "var(--rule-hair)" }}
    >
      <Image
        src={testimonial.image}
        alt={testimonial.name || "Témoignage client Ylang Créations"}
        width={400}
        height={600}
        className="block h-auto w-full object-cover"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
      />
  ```

  Also remove the zoom overlay `<div>` inside (the one with `<ZoomIn>`).

- [ ] **Step 5.4 — Remove unused imports**

  `ZoomIn` is now unused (removed in step 5.3). Remove it from the import line:
  ```tsx
  // before:
  import { X, ZoomIn } from "lucide-react";

  // after:
  import { X } from "lucide-react";
  ```

- [ ] **Step 5.5 — Commit**

  ```bash
  git add components/home/testimonials-section.tsx
  git commit -m "refactor: testimonials — paper-2 bg, remove stamp-card and whileHover scale/rotate"
  ```

---

## Task 6 — Collections Page

**Files:**
- Modify: `app/collections/page.tsx`

---

- [ ] **Step 6.1 — Fix page background**

  Line 419:
  ```tsx
  // before:
  <div className="bg-ylang-terracotta/50 min-h-screen py-12 sm:py-16 lg:py-24">

  // after:
  <div className="min-h-screen py-12 sm:py-16 lg:py-24" style={{ background: "var(--color-paper)" }}>
  ```

- [ ] **Step 6.2 — Fix header H1 and eyebrow**

  Lines 427–430:
  ```tsx
  // before:
  <p className="text-ylang-rose font-abramo mb-3 text-sm font-semibold tracking-widest uppercase">
    Nos Collections
  </p>
  <h1 className="text-ylang-charcoal font-abramo-script mb-4 text-4xl lg:text-5xl">

  // after:
  <p
    className="mb-3 text-[11px] tracking-[0.2em] uppercase font-semibold"
    style={{ fontFamily: "var(--font-brand)", color: "var(--color-accent)" }}
  >
    Nos Collections
  </p>
  <h1
    className="mb-4 text-4xl font-semibold tracking-tight lg:text-6xl"
    style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}
  >
  ```

- [ ] **Step 6.3 — Fix search input (remove rounded-2xl)**

  Line ~456:
  ```tsx
  // before:
  className="focus:border-ylang-rose focus:ring-ylang-rose/10 font-body text-ylang-charcoal border-ylang-rose w-full rounded-2xl border bg-white py-3.5 pr-12 pl-12 transition-all outline-none placeholder:text-gray-400 focus:ring-4"

  // after:
  className="focus:ring-ylang-rose/10 font-body text-ylang-charcoal border-ylang-rose w-full rounded-none border bg-white py-3.5 pr-12 pl-12 transition-all outline-none placeholder:text-gray-400 focus:ring-4"
  ```

- [ ] **Step 6.4 — Fix filter button (remove rounded-2xl)**

  Line ~472:
  ```tsx
  // before:
  className={`font-body border-ylang-rose flex items-center justify-center gap-2.5 rounded-2xl border bg-white px-6 py-3.5 text-sm font-medium transition-all ${...}`}

  // after:
  className={`font-body border-ylang-rose flex items-center justify-center gap-2.5 rounded-none border bg-white px-6 py-3.5 text-sm font-medium transition-all ${...}`}
  ```

- [ ] **Step 6.5 — Commit**

  ```bash
  git add app/collections/page.tsx
  git commit -m "refactor: collections — paper bg, Cormorant H1, straight corners on inputs"
  ```

---

## Task 7 — Product Card

**Files:**
- Modify: `components/product/product-card.tsx`

---

- [ ] **Step 7.1 — Remove hover:scale-110 on image**

  Line 81:
  ```tsx
  // before:
  className="origin-center object-cover transition-transform duration-500 ease-out group-hover:scale-110"

  // after:
  className="origin-center object-cover transition-opacity duration-500 group-hover:opacity-90"
  ```

- [ ] **Step 7.2 — Remove gradient overlay on image**

  Lines 87–88 (the overlay div):
  ```tsx
  // before:
  <div className="absolute inset-0 bg-linear-to-t from-white/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

  // after: DELETE THIS LINE ENTIRELY
  ```

- [ ] **Step 7.3 — Replace rounded-full badges with plain text labels**

  Lines 114–131. Replace the entire badges block:
  ```tsx
  // before:
  <div className="absolute top-2 left-2 flex flex-col gap-1.5 transition-all duration-300 group-hover:opacity-0 sm:top-4 sm:left-4 sm:gap-2">
    {product.new && (
      <div
        className="bg-ylang-terracotta text-charcoal/80 rounded-full px-2 py-1 text-[10px] font-medium tracking-wider uppercase shadow-lg sm:px-3 sm:py-1.5 sm:text-xs"
        style={{ animation: "scaleRotate 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.2s both" }}
      >
        Nouveauté
      </div>
    )}
    {product.customizable && (
      <div className="bg-ylang-yellow text-charcoal/80 flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-medium tracking-wider uppercase shadow-md sm:px-3 sm:py-1.5 sm:text-xs">
        <Wand2 className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
        Sur mesure
      </div>
    )}
  </div>

  // after:
  <div className="absolute top-3 left-3 flex flex-col gap-1 sm:top-4 sm:left-4">
    {product.new && (
      <span
        className="text-[10px] tracking-[0.14em] uppercase"
        style={{ fontFamily: "var(--font-brand)", color: "var(--color-paper)", background: "var(--color-ink)", padding: "2px 8px" }}
      >
        Nouveau
      </span>
    )}
    {product.customizable && (
      <span
        className="text-[10px] tracking-[0.14em] uppercase"
        style={{ fontFamily: "var(--font-brand)", color: "var(--color-ink)", background: "var(--color-paper-2)", padding: "2px 8px" }}
      >
        Sur mesure
      </span>
    )}
  </div>
  ```

- [ ] **Step 7.4 — Remove hover:scale on wishlist button**

  Line 156:
  ```tsx
  // before:
  "group/heart absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full border shadow-lg transition-transform duration-300 hover:scale-110 sm:top-4 sm:right-4 sm:h-10 sm:w-10",

  // after:
  "group/heart absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full border transition-opacity duration-200 hover:opacity-80 sm:top-4 sm:right-4 sm:h-10 sm:w-10",
  ```

- [ ] **Step 7.5 — Fix product info area background**

  Line 170:
  ```tsx
  // before:
  <div className="bg-ylang-beige space-y-1.5 p-2.5 sm:p-3">

  // after:
  <div className="space-y-1.5 p-2.5 sm:p-3" style={{ background: "var(--color-paper-2)" }}>
  ```

- [ ] **Step 7.6 — Fix category eyebrow color in info area**

  Line 172:
  ```tsx
  // before:
  <p className="font-abramo text-ylang-rose mb-0.5 text-xs font-semibold tracking-widest uppercase">

  // after:
  <p
    className="mb-0.5 text-[10px] tracking-[0.18em] uppercase"
    style={{ fontFamily: "var(--font-brand)", color: "var(--color-accent)" }}
  >
  ```

- [ ] **Step 7.7 — Remove scaleRotate from the JSX style tag**

  The `<style jsx>` block at the bottom of the file has `@keyframes scaleRotate`. Remove that keyframe since the badge animation is gone. Keep only `@keyframes fadeInUp`.

  ```tsx
  <style jsx>{`
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `}</style>
  ```

- [ ] **Step 7.8 — Remove Wand2 import if no longer used**

  Check if `Wand2` is still used (it appears on the "Personnaliser" Button link). If yes, keep it. If not, remove the import. *(It IS still used on line 205 — keep it.)*

- [ ] **Step 7.9 — Commit**

  ```bash
  git add components/product/product-card.tsx
  git commit -m "refactor: product card — opacity hover, plain text badges, straight corners, paper-2 info bg"
  ```

---

## Task 8 — Product Details (60/40 Layout)

**Files:**
- Modify: `components/product/product-details.tsx`

---

- [ ] **Step 8.1 — Remove terracotta background from wrapper**

  Line 99:
  ```tsx
  // before:
  <div className="bg-ylang-terracotta/30 section-padding min-h-screen">

  // after:
  <div className="section-padding min-h-screen" style={{ background: "var(--color-paper)" }}>
  ```

- [ ] **Step 8.2 — Change grid to 60/40 split**

  Line 118:
  ```tsx
  // before:
  <div className="mb-8 grid gap-8 lg:mb-16 lg:grid-cols-2 lg:gap-12">

  // after:
  <div className="mb-8 grid gap-8 lg:mb-16 lg:gap-12" style={{ gridTemplateColumns: "1fr" }} className="mb-8 grid gap-8 lg:mb-16 lg:gap-12 lg:grid-cols-[3fr_2fr]">
  ```

  Correct form (single className):
  ```tsx
  <div className="mb-8 grid gap-8 lg:mb-16 lg:grid-cols-[3fr_2fr] lg:gap-12">
  ```

- [ ] **Step 8.3 — Fix main image container (remove rounded-2xl + shadow)**

  Line 122:
  ```tsx
  // before:
  <div className="bg-ylang-beige/30 relative aspect-square overflow-hidden rounded-2xl shadow-(--shadow-card)">

  // after:
  <div className="relative aspect-square overflow-hidden" style={{ background: "var(--color-paper-3)" }}>
  ```

- [ ] **Step 8.4 — Find and update the product H1**

  Search for the H1 that renders `product.name`. It will look like:
  ```tsx
  <h1 className="font-display text-ylang-charcoal ...">
    {product.name}
  </h1>
  ```

  Update to:
  ```tsx
  <h1
    className="mb-2 text-3xl font-semibold tracking-tight lg:text-4xl xl:text-5xl"
    style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}
  >
    {product.name}
  </h1>
  ```

- [ ] **Step 8.5 — Find and update the price display**

  Search for the element displaying the price (something like `{product.price.toFixed(2)} €`). Update its wrapper:
  ```tsx
  // before (example):
  <p className="font-display text-ylang-charcoal text-2xl font-bold">

  // after:
  <p
    className="text-2xl font-semibold"
    style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}
  >
  ```

- [ ] **Step 8.6 — Change "Ajouter au panier" button to variant="maison"**

  Find the ShoppingBag / "Ajouter au panier" button (look for `ShoppingBag` or the text). Change:
  ```tsx
  // before (likely variant="primary" or "luxury"):
  <Button variant="primary" ...>

  // after:
  <Button
    variant="maison"
    style={{ background: "var(--color-ink)", color: "var(--color-paper)" }}
    ...
  >
  ```

- [ ] **Step 8.7 — Commit**

  ```bash
  git add components/product/product-details.tsx
  git commit -m "refactor: product details — paper bg, 60/40 layout, Cormorant H1+price, maison CTA"
  ```

---

## Task 9 — À Propos Page

**Files:**
- Modify: `app/a-propos/page.tsx`

---

- [ ] **Step 9.1 — Remove terracotta wrapper background**

  Line 110:
  ```tsx
  // before:
  <div className="bg-ylang-terracotta/30 min-h-screen">

  // after:
  <div className="min-h-screen" style={{ background: "var(--color-paper)" }}>
  ```

- [ ] **Step 9.2 — Remove all blur-3xl decorative elements in the hero**

  Lines 115–117 (the two decorative `<div>` inside the `.absolute.inset-0.overflow-hidden` block):
  ```tsx
  // before:
  <div className="absolute inset-0 overflow-hidden">
    <div className="bg-ylang-rose/10 absolute -top-40 -right-40 h-80 w-80 rounded-full blur-3xl" />
    <div className="bg-ylang-sage/20 absolute -bottom-40 -left-40 h-80 w-80 rounded-full blur-3xl" />
  </div>

  // after: DELETE THE ENTIRE BLOCK (including the wrapper div)
  ```

- [ ] **Step 9.3 — Fix hero H1 (`font-abramo-script` → Cormorant Garamond)**

  Lines 132–138:
  ```tsx
  // before:
  <motion.h1
    variants={fadeInUp}
    className="font-abramo-script text-ylang-charcoal mb-6 text-4xl lg:text-6xl"
  >
    Élégance, raffinement
    <br />
    <span className="text-ylang-terracotta">& personnalisation</span>
  </motion.h1>

  // after:
  <motion.h1
    variants={fadeInUp}
    className="mb-6 text-4xl font-semibold tracking-tight lg:text-6xl"
    style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}
  >
    Élégance, raffinement
    <br />
    <span style={{ color: "var(--color-accent)" }}>& personnalisation</span>
  </motion.h1>
  ```

- [ ] **Step 9.4 — Fix hero eyebrow**

  Line 128–130:
  ```tsx
  // before:
  <motion.p
    variants={fadeInUp}
    className="text-ylang-rose font-abramo mb-4 text-sm font-semibold tracking-widest uppercase"
  >

  // after:
  <motion.p
    variants={fadeInUp}
    className="mb-4 text-[11px] tracking-[0.2em] uppercase"
    style={{ fontFamily: "var(--font-brand)", color: "var(--color-accent)" }}
  >
  ```

- [ ] **Step 9.5 — Find and fix all remaining `font-abramo-script` on H2 elements**

  Run a grep to find all occurrences:
  ```bash
  grep -n "font-abramo-script" app/a-propos/page.tsx
  ```
  For each H2 found with `font-abramo-script`, replace the className pattern with:
  ```tsx
  // before (example):
  <h2 className="font-abramo-script text-ylang-charcoal text-3xl lg:text-4xl">

  // after:
  <h2
    className="text-3xl font-semibold tracking-tight lg:text-4xl"
    style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}
  >
  ```

  Common locations (verify with grep): Story section H2, Values section H2, Timeline section H2, Engagement section H2. Apply to each one.

- [ ] **Step 9.6 — Search and remove remaining blur-3xl in the rest of the page**

  ```bash
  grep -n "blur-3xl" app/a-propos/page.tsx
  ```
  Delete every `<div>` element containing `blur-3xl`.

- [ ] **Step 9.7 — Remove any colored section backgrounds (not the wrapper)**

  ```bash
  grep -n "bg-ylang-terracotta\|bg-ylang-rose\|bg-linear-to" app/a-propos/page.tsx
  ```
  For each section `<section>` or `<div>` with these backgrounds, replace the bg class with `style={{ background: "var(--color-paper-2)" }}` for alternating sections, or remove entirely for sections that should be paper.

- [ ] **Step 9.8 — Commit**

  ```bash
  git add app/a-propos/page.tsx
  git commit -m "refactor: à propos — paper bg, font-abramo-script H1/H2 → Cormorant, remove blur-3xl"
  ```

---

## Task 10 — Build Verification

**Files:** none modified — verification only

---

- [ ] **Step 10.1 — Run ESLint**

  ```bash
  pnpm lint
  ```
  Expected: exit 0. Fix any new lint errors (likely unused imports from steps above).

- [ ] **Step 10.2 — Run success criteria grep checks**

  ```bash
  # Must return 0 results:
  grep -rn "font-abramo-script" app/page.tsx app/collections/page.tsx app/a-propos/page.tsx components/home/ components/product/product-details.tsx

  # Must return 0 results:
  grep -rn "hover:scale-" components/home/ components/product/product-card.tsx

  # Must return 0 results:
  grep -rn "bg-linear-to-\|bg-gradient-" components/home/ components/product/ app/collections/page.tsx app/a-propos/page.tsx

  # Must return 0 results:
  grep -rn "whileHover.*scale\|whileHover.*rotate" components/home/testimonials-section.tsx
  ```

- [ ] **Step 10.3 — Run production build**

  ```bash
  pnpm build
  ```
  Expected: exit 0 with no TypeScript errors.

- [ ] **Step 10.4 — Final commit (if any lint fixes were needed)**

  ```bash
  git add -p
  git commit -m "fix: lint and unused import cleanup after luxe redesign"
  ```

---

## Notes for the executor

- The `maison` Button variant has no background/text color in CVA — callers always pass them via `style={}` inline to avoid Tailwind specificity conflicts with the OKLCH token values.
- `font-abramo-script` is still allowed on `<p>` decorative elements (taglines, signatures like "Avec amour, Mélissa"). Only headings (`h1`–`h6`) are forbidden.
- The Configurateur is explicitly out of scope — do not touch any file under `app/configurateur/` or `components/configurateur/`.
- When a section component uses `section-padding`, the padding will automatically pick up the updated `--spacing-section: 8rem` from Task 1 without further edits.
