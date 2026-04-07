# BuyMore - Marketplace Multi-Boutiques

Version : 1.0 MVP
Date : 15/12/2025

## BuyMore - Marketplace Multi-Boutiques

BuyMore est une plateforme marketplace permettant à des vendeurs de créer leurs boutiques et de vendre leurs produits à des clients via un site web.

## Architecture

Cette application est un frontend **React + Vite** autonome qui consomme l'API Node.js `buymore-api`.

```text
BuyMore/
├── buy_web/       # Frontend web React + Vite
├── buymore-api/   # API Node.js/Express
└── Buy_Apps/      # Application mobile Flutter
```

## Démarrage rapide

### Prérequis

- **Node.js** 18+
- **npm** 9+
- **BuyMore API** accessible localement ou en environnement distant

### Installation

```bash
# Cloner le projet
git clone <repo-url>
cd buymore

# Installer les dépendances
npm install

# Configurer VITE_API_BASE_URL pour pointer vers buymore-api
```

### Développement

```bash
# Lancer l'application web
npm run dev
```

### Build

```bash
# Build l'application web
npm run build
```

## Stack Technique

| Couche | Technologie |
|--------|-------------|
| **Frontend** | React 18 + Vite + TailwindCSS |
| **Backend** | API Node.js/Express (`buymore-api`) |
| **Données** | PostgreSQL via Prisma |
| **Auth / Storage** | Supabase |
| **State Management** | Zustand |
| **UI Components** | shadcn/ui + Lucide Icons |

## Rôles utilisateurs

- **Client (customer)**: Consulte les produits, passe des commandes
- **Vendeur (vendor)**: Gère ses boutiques, produits et commandes
- **Administrateur (admin)**: Supervise la plateforme, valide les boutiques

## Fonctionnalités MVP

- Authentification multi-rôles via l'API Node.js
- Gestion des boutiques (création, validation admin)
- Catalogue de produits avec images
- Système de catégories hiérarchiques
- Panier d'achat persistant
- Gestion des commandes avec gestion du stock
- Dashboard par rôle (client, vendeur, admin)
- API centralisée pour le catalogue, les commandes et l'authentification
- Dashboards web branchés sur la même API que l'application mobile

## Documentation

- [**Installation**](./INSTALLATION.md) - Guide d'installation détaillé
- [**Structure**](./STRUCTURE.md) - Structure du projet

## Scripts utiles

```bash
# Développement
npm run dev

# Build
npm run build

# Maintenance
npm run lint
```

## Déploiement

### Web
- **Vercel** ou **Netlify**
- Build automatique depuis Git
- Preview deployments pour chaque PR

### Backend
- **API Node.js/Express**
- **PostgreSQL + Prisma**
- **Supabase** pour auth et stockage

## Contribution

Ce projet utilise:
- **npm** pour la gestion des dépendances
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
