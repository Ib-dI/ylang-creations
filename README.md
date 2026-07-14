# Ylang Creations

Plateforme e-commerce pour la vente de créations artisanales sur mesure (vêtements, accessoires) avec un configurateur de tissu permettant aux clients de personnaliser leurs produits.

## Stack technique

- **Framework** : [Next.js 16](https://nextjs.org) (App Router) avec React 19
- **Base de données** : PostgreSQL via [Supabase](https://supabase.com), ORM [Drizzle](https://orm.drizzle.team)
- **State management** : Zustand (panier, configurateur, persistance locale)
- **UI** : Tailwind CSS v4, HeroUI (beta), Radix UI, Framer Motion, Three.js / React Three Fiber
- **Paiement** : SumUp SDK
- **Email** : Resend
- **Validation** : Zod v4

## Prérequis

- Node.js
- [pnpm](https://pnpm.io)
- Un projet Supabase (base de données PostgreSQL)

## Installation

```bash
pnpm install
```

Configurez vos variables d'environnement dans un fichier `.env.local` (accès Supabase, clés SumUp, Resend, etc.).

## Commandes

```bash
pnpm dev          # Lance le serveur de développement (localhost:3000)
pnpm build        # Build de production
pnpm start        # Lance le serveur en mode production
pnpm lint         # Vérifie le code avec ESLint

pnpm db:push      # Applique les changements de schéma à la base de données
pnpm db:generate  # Génère les migrations Drizzle
pnpm db:migrate   # Exécute les migrations
pnpm db:studio    # Ouvre Drizzle Studio pour inspecter la base de données
```

## Structure du projet

- `app/` — Pages et routes API (App Router)
- `components/` — Composants React organisés par fonctionnalité (admin, cart, checkout, configurator, home, product)
- `db/schema.ts` — Schéma de la base de données (Drizzle ORM)
- `lib/store/` — Stores Zustand (panier, configurateur)
- `lib/validations/` — Schémas Zod pour la validation des API
- `utils/supabase/` — Clients Supabase (navigateur / serveur)
- `types/` — Types TypeScript partagés
- `emails/` — Templates d'emails transactionnels (React Email)

## Fonctionnalités principales

- Catalogue produits avec gestion des stocks
- Configurateur de tissu en plusieurs étapes (produit → tissu → aperçu → options → récapitulatif)
- Panier persistant avec calcul du transport Colissimo au poids
- Paiement via SumUp
- Emails transactionnels (confirmation de commande, etc.)
- Interface d'administration

## Conventions du projet

- Les prix sont stockés en centimes (entiers) pour éviter les erreurs d'arrondi
- Les poids sont stockés en grammes pour le calcul du transport
- Interface et commentaires de code en français
- Alias de chemin `@/*` pointant vers la racine du projet

Voir [CLAUDE.md](./CLAUDE.md) pour plus de détails sur l'architecture et les conventions de développement.
