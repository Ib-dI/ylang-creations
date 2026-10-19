# Ylang Creations

Plateforme e-commerce pour la vente de créations artisanales sur mesure (vêtements, accessoires) avec un configurateur de tissu permettant aux clients de personnaliser leurs produits.

## Stack technique

- **Framework** : [Next.js 16](https://nextjs.org) (App Router) avec React 19
- **Base de données** : PostgreSQL via [Supabase](https://supabase.com), ORM [Drizzle](https://orm.drizzle.team)
- **State management** : Zustand (panier, configurateur, persistance locale)
- **UI** : Tailwind CSS v4, HeroUI (beta), Radix UI, Framer Motion, Three.js / React Three Fiber
- **Paiement** : SumUp SDK
- **Email** : Brevo
- **Validation** : Zod v4

## Prérequis

- Node.js
- [pnpm](https://pnpm.io)
- Un projet Supabase (base de données PostgreSQL)

## Installation

```bash
pnpm install
```

Configurez vos variables d'environnement dans un fichier `.env.local` (accès Supabase, clés SumUp, Brevo, etc.).

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

## Emails (Brevo)

Tous les emails partent par l'API transactionnelle Brevo (`lib/email/brevo.ts`) : commandes, newsletter, et emails de compte Supabase (via le Send Email Hook).

### Variables d'environnement

```bash
BREVO_API_KEY=xkeysib-...                # Brevo > SMTP & API > Clés API
EMAIL_FROM=adresse@exemple.com           # expéditeur vérifié dans Brevo (Expéditeurs, domaines & IP)
EMAIL_FROM_NAME="Ylang Créations"
EMAIL_REPLY_TO=                          # optionnel
ADMIN_EMAIL=adresse@exemple.com          # reçoit les notifications de commande
EMAIL_SANDBOX=true                       # true : Brevo valide sans délivrer (défaut hors production)
SEND_EMAIL_HOOK_SECRET=v1,whsec_...      # secret du Send Email Hook Supabase
BREVO_WEBHOOK_SECRET=...                 # chaîne aléatoire, protège /api/webhooks/brevo
```

Le jour où un nom de domaine est acheté : l'authentifier dans Brevo (SPF, DKIM, DMARC), puis changer `EMAIL_FROM`. Aucun changement de code n'est nécessaire.

### Configuration Supabase

1. **Authentication > Hooks > Send Email** : type HTTPS, URL `https://<site>/api/auth/send-email`, puis copier le secret généré dans `SEND_EMAIL_HOOK_SECRET`.
2. **Authentication > Emails > Security notifications** : activer « Password changed ».
3. **Authentication > Providers > Email** : longueur minimale du mot de passe = 8.
4. **Authentication > URL Configuration** : ajouter `https://<site>/reset-password` aux Redirect URLs.

Supabase (cloud) ne peut pas joindre `localhost` : les emails de compte se testent sur un déploiement (preview ou prod), ou en local avec un tunnel (`cloudflared tunnel --url localhost:3000`) dont l'URL est temporairement mise dans le hook.

### Désinscriptions newsletter

Brevo ajoute automatiquement un en-tête `List-Unsubscribe` à chaque email. Pour que la base reste synchronisée, créer dans **Brevo > Transactionnel > Paramètres > Webhooks** un webhook sur les événements « Désinscrit » et « Spam », vers `https://<site>/api/webhooks/brevo?token=<BREVO_WEBHOOK_SECRET>`.

Si un client clique sur « Se désabonner » depuis un email de commande ou de compte, Brevo le bloque pour tous les emails transactionnels. Pour le débloquer : **Brevo > Transactionnel > Liste noire**, puis supprimer l'adresse.

## Structure du projet

- `app/` — Pages et routes API (App Router)
- `components/` — Composants React organisés par fonctionnalité (admin, cart, checkout, configurator, home, product)
- `db/schema.ts` — Schéma de la base de données (Drizzle ORM)
- `lib/store/` — Stores Zustand (panier, configurateur)
- `lib/validations/` — Schémas Zod pour la validation des API
- `utils/supabase/` — Clients Supabase (navigateur / serveur)
- `types/` — Types TypeScript partagés
- `emails/` — Templates d'emails (composants React rendus en HTML, gabarit commun `emails/layout.tsx`)

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
