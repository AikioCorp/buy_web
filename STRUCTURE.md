# Structure du Projet BuyMore

Date de mise à jour : 15/12/2025

## Vue d'ensemble

Le projet BuyMore a été simplifié pour se concentrer uniquement sur l'application web. Toutes les applications mobiles (iOS/Android) et le backend intermédiaire ont été supprimés.

## Structure actuelle

```
buymore/
├── web/                    # Application web principale (React + Vite)
│   ├── src/               # Code source de l'application
│   ├── public/            # Fichiers statiques
│   ├── package.json       # Dépendances web
│   ├── vite.config.ts     # Configuration Vite
│   ├── tailwind.config.js # Configuration TailwindCSS
│   └── .env               # Variables d'environnement
│
├── packages/              # Packages partagés (monorepo)
│   ├── ui/               # Composants UI réutilisables
│   └── api-client/       # Client Supabase + hooks + stores
│
├── supabase/             # Configuration base de données
│   ├── migrations/       # Migrations SQL
│   ├── seed/            # Données de test
│   ├── policies/        # Politiques RLS
│   └── functions/       # Edge Functions
│
├── docs/                # Documentation du projet
│
├── package.json         # Configuration monorepo racine
├── pnpm-workspace.yaml  # Configuration workspace pnpm
├── README.md           # Documentation principale
├── ARCHITECTURE.md     # Architecture technique
└── INSTALLATION.md     # Guide d'installation
```

## Éléments supprimés

Les éléments suivants ont été supprimés du projet :

- ❌ `apps/mobile/` - Application React Native + Expo
- ❌ `apps/test-expo/` - Application test Expo
- ❌ `buymore-app/` - Application Expo créée
- ❌ `apps/` - Dossier parent des applications
- ❌ `backend/` - API Express.js intermédiaire

## Architecture simplifiée

L'application utilise maintenant une architecture directe :

```
┌─────────────────┐
│   Frontend      │
│  React + Vite   │
│   TailwindCSS   │
└────────┬────────┘
         │ Supabase SDK
         │
┌────────▼────────┐
│   Supabase      │
│   PostgreSQL    │
│   Auth + RLS    │
│   Storage       │
└─────────────────┘
```

## Avantages de cette structure

1. **Simplicité** - Une seule application à maintenir
2. **Performance** - Communication directe avec Supabase (pas de backend intermédiaire)
3. **Sécurité** - Row Level Security (RLS) géré par Supabase
4. **Scalabilité** - Supabase gère automatiquement la montée en charge
5. **Développement rapide** - Moins de code à maintenir

## Commandes principales

```bash
# Installation
pnpm install

# Développement
pnpm dev          # Lance l'application web sur http://localhost:5173

# Build
pnpm build        # Compile l'application pour la production

# Maintenance
pnpm lint         # Vérifie le code
pnpm clean        # Nettoie les dépendances et builds
```

## Technologies utilisées

### Frontend
- **React 18** - Framework UI
- **TypeScript** - Typage statique
- **Vite** - Build tool rapide
- **TailwindCSS** - Framework CSS utility-first
- **shadcn/ui** - Composants UI
- **Zustand** - State management
- **React Router** - Routing

### Backend (Supabase)
- **PostgreSQL** - Base de données
- **Supabase Auth** - Authentification
- **Supabase Storage** - Stockage de fichiers
- **Row Level Security** - Sécurité au niveau des lignes
- **Edge Functions** - Fonctions serverless (Deno)

## Prochaines étapes

Pour développer l'application :

1. Consultez `INSTALLATION.md` pour configurer l'environnement
2. Lisez `ARCHITECTURE.md` pour comprendre l'architecture
3. Explorez le dossier `web/src/` pour le code source
4. Consultez `docs/` pour la documentation détaillée

## Support

Pour toute question :
- Documentation Supabase : https://supabase.com/docs
- Documentation React : https://react.dev
- Documentation Vite : https://vitejs.dev
- Documentation TailwindCSS : https://tailwindcss.com
