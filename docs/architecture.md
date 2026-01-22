# Architecture BuyMore - Monorepo

## Vue d'ensemble

BuyMore utilise une architecture **monorepo** avec pnpm workspaces pour gérer plusieurs applications et packages partagés.

```
buymore/
├── apps/
│   ├── web/           # Site web public (clients)
│   ├── admin/         # Dashboard admin + vendeur
│   └── mobile/        # App React Native (Expo)
├── packages/
│   ├── ui/            # Composants UI réutilisables
│   └── api-client/    # Client API + hooks + stores
├── supabase/
│   ├── migrations/    # Schéma de base de données
│   ├── seed/          # Données de test
│   ├── policies/      # Politiques RLS
│   └── functions/     # Edge Functions
└── docs/              # Documentation
```

## Stack Technique

### Applications

#### Web (apps/web)
- **Framework**: React 18 + Vite
- **Routing**: React Router v6
- **Styling**: TailwindCSS
- **State**: Zustand (via @buymore/api-client)
- **UI**: @buymore/ui

#### Admin (apps/admin)
- **Framework**: Next.js 14 (App Router)
- **Styling**: TailwindCSS
- **State**: Zustand (via @buymore/api-client)
- **UI**: @buymore/ui

#### Mobile (apps/mobile)
- **Framework**: React Native + Expo
- **Navigation**: Expo Router
- **Styling**: NativeWind (TailwindCSS)
- **State**: Zustand (via @buymore/api-client)

### Packages Partagés

#### @buymore/ui
Composants UI réutilisables entre web, admin et mobile:
- Button, Card, Input
- Utilitaires (cn, formatPrice, formatDate)

#### @buymore/api-client
Code partagé pour interagir avec Supabase:
- Client Supabase configuré
- Types TypeScript
- Stores Zustand (auth, cart)
- Hooks React (useProducts, useShops, useOrders)

### Backend

#### Supabase
- **Database**: PostgreSQL avec RLS
- **Auth**: Supabase Auth (JWT)
- **Storage**: Supabase Storage
- **Functions**: Edge Functions (Deno)

## Flux de données

```
┌─────────────┐
│   Mobile    │
│  (Expo)     │
└──────┬──────┘
       │
       │ @buymore/api-client
       │ @buymore/ui
       │
┌──────▼──────┐     ┌─────────────┐
│    Web      │     │    Admin    │
│  (React)    │     │  (Next.js)  │
└──────┬──────┘     └──────┬──────┘
       │                   │
       └───────┬───────────┘
               │
        ┌──────▼──────┐
        │  api-client │
        │  (Zustand)  │
        └──────┬──────┘
               │
        ┌──────▼──────┐
        │  Supabase   │
        │  (Postgres) │
        └─────────────┘
```

## Avantages du Monorepo

### 1. **Partage de code**
- Composants UI réutilisés entre web, admin et mobile
- Logique métier centralisée dans api-client
- Types TypeScript partagés

### 2. **Développement cohérent**
- Même version des dépendances
- Refactoring facilité
- Tests centralisés

### 3. **Déploiement simplifié**
- Build indépendant de chaque app
- Déploiement séparé possible
- CI/CD optimisé

## Gestion des dépendances

### pnpm Workspaces

```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

### Installation

```bash
# Installer toutes les dépendances
pnpm install

# Installer dans un package spécifique
pnpm --filter web add react-query
pnpm --filter @buymore/ui add lucide-react
```

### Scripts

```bash
# Développement
pnpm dev              # Lance toutes les apps
pnpm dev:web          # Lance uniquement web
pnpm dev:admin        # Lance uniquement admin
pnpm dev:mobile       # Lance uniquement mobile

# Build
pnpm build            # Build toutes les apps
pnpm build:web        # Build web uniquement
```

## Sécurité

### Row Level Security (RLS)

Toutes les tables ont des politiques RLS définies dans `supabase/policies/`:

- **Clients**: Voient leurs commandes uniquement
- **Vendeurs**: Gèrent leurs boutiques et produits
- **Admins**: Accès complet

### Edge Functions

Les opérations critiques (création de commande, paiement) sont gérées par des Edge Functions pour:
- Validation côté serveur
- Transactions atomiques
- Sécurité renforcée

## Déploiement

### Web & Admin
- **Vercel** ou **Netlify**
- Build automatique depuis Git
- Preview deployments

### Mobile
- **Expo EAS Build**
- Distribution iOS/Android
- OTA Updates

### Backend
- **Supabase** (géré)
- Backups automatiques
- Scaling automatique

## Migration depuis l'ancienne structure

L'ancien code dans `web/` et `backend/` peut être progressivement migré vers:
- `apps/web/` - Frontend existant
- `apps/admin/` - Nouveau dashboard
- `packages/ui/` - Composants extraits
- `packages/api-client/` - Logique Supabase extraite
