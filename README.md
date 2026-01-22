# BuyMore - Marketplace Multi-Boutiques

Version : 1.0 MVP
Date : 15/12/2025

## BuyMore - Marketplace Multi-Boutiques

BuyMore est une plateforme marketplace permettant à des vendeurs de créer leurs boutiques et de vendre leurs produits à des clients via un site web.

## Architecture

Ce projet utilise **pnpm workspaces** pour gérer l'application web et les packages partagés.

```
buymore/
├── web/               # Application web (React + Vite + TailwindCSS)
├── packages/
│   ├── ui/            # Composants UI réutilisables
│   └── api-client/    # Client API + hooks + stores Zustand
├── supabase/
│   ├── migrations/    # Schéma de base de données
│   ├── seed/          # Données de test
│   ├── policies/      # Politiques RLS (Row Level Security)
│   └── functions/     # Edge Functions (Deno)
└── docs/              # Documentation complète
```

## Démarrage rapide

### Prérequis

- **Node.js** 18+
- **pnpm** 8+ (`npm install -g pnpm`)
- **Compte Supabase** (gratuit sur https://supabase.com)

### Installation

```bash
# Cloner le projet
git clone <repo-url>
cd buymore

# Installer toutes les dépendances
pnpm install

# Configurer Supabase (voir docs/installation.md)
# Exécuter les migrations SQL dans votre projet Supabase
```

### Développement

```bash
# Lancer l'application web
pnpm dev          # Site web (http://localhost:5173)
pnpm dev:web      # Alias pour pnpm dev
```

### Build

```bash
# Build l'application web
pnpm build
pnpm build:web    # Alias pour pnpm build
```

## Packages partagés

### @buymore/ui
Composants UI réutilisables:
- `Button`, `Card`, `Input`
- Utilitaires: `cn()`, `formatPrice()`, `formatDate()`

### @buymore/api-client
Code partagé pour interagir avec Supabase:
- Client Supabase configuré
- Types TypeScript complets
- Stores Zustand (auth, cart)
- Hooks React personnalisés (useProducts, useShops, useOrders)

## Stack Technique

| Couche | Technologie |
|--------|-------------|
| **Frontend** | React 18 + Vite + TailwindCSS |
| **Backend** | Supabase (PostgreSQL + Auth + Storage) |
| **Edge Functions** | Deno Deploy |
| **State Management** | Zustand |
| **UI Components** | shadcn/ui + Lucide Icons |

## Rôles utilisateurs

- **Client (customer)**: Consulte les produits, passe des commandes
- **Vendeur (vendor)**: Gère ses boutiques, produits et commandes
- **Administrateur (admin)**: Supervise la plateforme, valide les boutiques

## Fonctionnalités MVP

- Authentification multi-rôles (Supabase Auth)
- Gestion des boutiques (création, validation admin)
- Catalogue de produits avec images
- Système de catégories hiérarchiques
- Panier d'achat persistant
- Gestion des commandes avec gestion du stock
- Dashboard par rôle (client, vendeur, admin)
- Sécurité RLS (Row Level Security)
- Edge Functions pour logique métier critique

## Documentation

- [**Installation**](./INSTALLATION.md) - Guide d'installation détaillé
- [**Structure**](./STRUCTURE.md) - Structure du projet

## Scripts utiles

```bash
# Développement
pnpm dev              # Lance l'application web
pnpm dev:web          # Alias pour pnpm dev

# Build
pnpm build            # Build l'application web
pnpm build:web        # Alias pour pnpm build

# Maintenance
pnpm lint             # Lint tous les packages
pnpm clean            # Nettoie node_modules et builds
```

## Déploiement

### Web
- **Vercel** ou **Netlify**
- Build automatique depuis Git
- Preview deployments pour chaque PR

### Backend
- **Supabase** (géré)
- Backups automatiques
- Scaling automatique

## Contribution

Ce projet utilise:
- **pnpm** pour la gestion des dépendances
- **TypeScript** pour la sécurité des types
- **ESLint** pour le linting
- **Prettier** pour le formatage (à configurer)

## Licence

Propriétaire - Aikio Corp 2025

## Support

Pour toute question:
- Consultez la [documentation](./docs/)
- Créez une issue sur GitHub
- Contactez l'équipe Aikio Corp
