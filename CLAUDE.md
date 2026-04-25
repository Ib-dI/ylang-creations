# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Ylang Creations is a French e-commerce platform for custom artisanal products (clothing, accessories) with a fabric configurator. Built with Next.js 16, React 19, and a PostgreSQL database via Supabase.

## Commands

```bash
pnpm dev          # Start development server (localhost:3000)
pnpm build        # Production build
pnpm lint         # Run ESLint
pnpm db:push      # Push schema changes to database
pnpm db:generate  # Generate Drizzle migrations
pnpm db:migrate   # Run database migrations
pnpm db:studio    # Open Drizzle Studio for DB inspection
```

## Architecture

### Tech Stack
- **Framework**: Next.js 16 (App Router) with React 19
- **Database**: PostgreSQL via Supabase, with Drizzle ORM
- **State**: Zustand with persistence (cart, configurator)
- **Styling**: Tailwind CSS v4, Framer Motion
- **UI Components**: HeroUI (beta), Radix UI primitives
- **Payments**: SumUp SDK (migrated from Stripe)
- **Email**: Resend
- **Validation**: Zod v4

### Key Directories
- `app/` - Next.js App Router pages and API routes
- `components/` - React components organized by feature (admin, cart, checkout, configurator, home, product)
- `db/schema.ts` - Drizzle ORM schema (users, orders, products, configurator tables)
- `lib/store/` - Zustand stores (cart-store.ts, configurator-store.ts)
- `lib/validations/` - Zod schemas for API validation
- `utils/supabase/` - Supabase client/server utilities (preferred over deprecated lib/supabase/)
- `types/` - TypeScript interfaces (cart, configurator, admin)
- `emails/` - React email templates

### Database Schema (db/schema.ts)
- `user`, `session`, `account`, `verification` - Auth tables
- `customer`, `order` - E-commerce with SumUp integration
- `product` - Inventory with prices in cents
- `settings` - Store configuration (hero slides, testimonials, shipping)
- `configuratorFabricCategory`, `configuratorFabric`, `configuratorProduct` - Fabric configurator

### State Management
- **Cart** (`lib/store/cart-store.ts`): Persisted cart with Colissimo shipping calculation by weight
- **Configurator** (`lib/store/configurator-store.ts`): 5-step product customization flow (product → fabric → preview → options → summary)

### Supabase Setup
Use `utils/supabase/` (not `lib/supabase/` which is deprecated):
- `utils/supabase/client.ts` - Browser client
- `utils/supabase/server.ts` - Server client + admin client (service role)

### API Validation
All API routes use Zod schemas from `lib/validations/index.ts`. Use `validateRequest()` helper for parsing and `formatZodErrors()` for error responses.

## Conventions

- Prices stored in cents (integer) to avoid floating-point errors
- Weight stored in grams for shipping calculation
- French language for UI text and code comments
- Path alias: `@/*` maps to project root

## Skills disponibles (`.agents/skills/`)

Ces skills sont chargés automatiquement selon le contexte. Utilise-les activement lors des tâches correspondantes ou peut être invoqué par `/skill-name`.

| Skill | Quand l'utiliser |
|-------|-----------------|
| `building-components` | Création de composants UI accessibles et composables, design tokens, publication npm |
| `frontend-design` | Interfaces frontend production-grade avec haute qualité visuelle (pages, dashboards, composants) |
| `next-best-practices` | Conventions de fichiers Next.js, RSC boundaries, data fetching, images, fonts, metadata, route handlers |
| `next-cache-components` | PPR (Partial Prerendering), directive `use cache`, `cacheLife`, `cacheTag` (Next.js 16+) |
| `polish` | Passe qualité finale avant livraison : alignement, espacement, cohérence visuelle |
| `seo-audit` | Audit SEO technique, meta tags, on-page SEO, diagnostic de ranking |
| `sumup` | Intégration paiement SumUp : checkout, Card Widget, Cloud API, OAuth, webhooks |
| `supabase-postgres-best-practices` | Optimisation queries Postgres, schémas, indexes, RLS, connexions, performances |
| `tailwind-design-system` | Design systems Tailwind CSS v4, tokens, variantes, patterns responsive |
| `ucp` | Universal Commerce Protocol — intégration e-commerce avancée dans Next.js |
| `vercel-react-best-practices` | Performance React/Next.js : re-renders, bundling, Server Components, data fetching |
| `web-design-guidelines` | Audit UI/UX, accessibilité, conformité aux guidelines web (Vercel) |
