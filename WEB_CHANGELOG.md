# Changelog - BuyMore Web

Historique des modifications de l'application web BuyMore.

---

## [2.0.0] - 2026-01-21

### 🔄 Migration majeure : Supabase → Django REST API

**Raison** : Unification du backend avec l'application mobile pour une meilleure cohérence et maintenance.

### ✨ Nouveaux fichiers créés

#### Services API (`src/lib/api/`)
- **`apiClient.ts`** - Client HTTP avec gestion JWT
  - Singleton pattern
  - Gestion automatique du token
  - Support upload de fichiers (multipart/form-data)
  - Gestion des erreurs centralisée

- **`authService.ts`** - Service d'authentification
  - Login avec email, username ou téléphone
  - Inscription complète
  - Authentification sociale (Google, Facebook, Apple)
  - Gestion du token JWT

- **`productsService.ts`** - Service de gestion des produits
  - Liste avec pagination et filtres
  - Détail d'un produit
  - CRUD pour vendeurs (mes produits)
  - Upload d'images

- **`categoriesService.ts`** - Service de gestion des catégories
  - Liste complète
  - Récupération par ID ou slug
  - Support hiérarchie parent/enfant

- **`shopsService.ts`** - Service de gestion des boutiques
  - Liste publique
  - Mes boutiques (vendeur)
  - CRUD complet
  - Upload logo et bannière

- **`ordersService.ts`** - Service de gestion des commandes
  - Mes commandes (client)
  - Création de commande
  - Commandes vendeur
  - Gestion des statuts

- **`profileService.ts`** - Service de gestion du profil
  - Profil client
  - Mise à jour du profil
  - Upload d'avatar
  - Gestion des adresses

- **`index.ts`** - Export centralisé avec résolution des conflits de types

#### Stores Zustand (`src/stores/`)
- **`authStore.ts`** - Store d'authentification
  - Gestion de l'utilisateur connecté
  - Actions : login, register, logout, loadUser
  - Persistence avec localStorage
  - Gestion des erreurs

- **`cartStore.ts`** - Store du panier
  - Gestion des items du panier
  - Actions : addItem, removeItem, updateQuantity, clearCart
  - Getters : getItemCount, getTotal, getItem
  - Persistence avec localStorage

- **`index.ts`** - Export centralisé

#### Hooks personnalisés (`src/hooks/`)
- **`useProducts.ts`** - Hooks pour produits
  - `useProducts()` - Liste avec filtres
  - `useProduct(id)` - Détail d'un produit
  - `useMyProducts()` - Mes produits (vendeur)

- **`useCategories.ts`** - Hooks pour catégories
  - `useCategories()` - Liste complète
  - `useCategory(id)` - Détail d'une catégorie

- **`useShops.ts`** - Hooks pour boutiques
  - `useShops()` - Liste publique
  - `useShop(id)` - Détail d'une boutique
  - `useMyShops()` - Mes boutiques (vendeur)

- **`useOrders.ts`** - Hooks pour commandes
  - `useOrders()` - Mes commandes
  - `useOrder(id)` - Détail d'une commande
  - `useVendorOrders()` - Commandes vendeur

- **`useProfile.ts`** - Hooks pour profil
  - `useProfile()` - Mon profil
  - `useAddresses()` - Mes adresses

- **`index.ts`** - Export centralisé

#### Documentation
- **`MIGRATION_GUIDE.md`** - Guide complet de migration
  - Comparaison avant/après
  - Exemples de code
  - Checklist de migration
  - Résolution de problèmes

- **`WEB_QUICK_START.md`** - Guide de démarrage rapide
  - Installation en 4 étapes
  - Exemples de code
  - Commandes utiles
  - Débogage

- **`WEB_CHANGELOG.md`** - Ce fichier

### 🔧 Fichiers modifiés

- **`.env.example`** - Nouvelles variables d'environnement
  - `VITE_API_BASE_URL` remplace `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`

### 🗑️ À supprimer (optionnel)

- `src/lib/supabase.ts` - Remplacé par `src/lib/api/`
- Dépendance `@supabase/supabase-js` - Plus nécessaire

### 📊 Statistiques

- **Fichiers créés** : 20 fichiers
- **Lignes de code** : ~2500 lignes
- **Services API** : 7 services complets
- **Hooks** : 5 fichiers de hooks
- **Stores** : 2 stores Zustand

### 🎯 Fonctionnalités

#### Authentification
- ✅ Login avec email, username ou téléphone
- ✅ Inscription complète avec validation
- ✅ Authentification sociale (Google, Facebook, Apple)
- ✅ Gestion de session avec JWT
- ✅ Déconnexion
- ✅ Persistence de l'utilisateur

#### Produits
- ✅ Liste avec pagination
- ✅ Filtres (catégorie, recherche)
- ✅ Détail d'un produit
- ✅ CRUD pour vendeurs
- ✅ Upload d'images

#### Catégories
- ✅ Liste complète
- ✅ Hiérarchie parent/enfant
- ✅ Récupération par ID ou slug

#### Boutiques
- ✅ Liste publique
- ✅ Détail d'une boutique
- ✅ Mes boutiques (vendeur)
- ✅ CRUD complet
- ✅ Upload logo et bannière

#### Commandes
- ✅ Création de commande
- ✅ Liste des commandes (client)
- ✅ Détail d'une commande
- ✅ Commandes vendeur
- ✅ Gestion des statuts

#### Profil
- ✅ Affichage du profil
- ✅ Modification du profil
- ✅ Upload d'avatar
- ✅ Gestion des adresses
- ✅ CRUD des adresses

#### Panier
- ✅ Ajout de produits
- ✅ Modification de quantité
- ✅ Suppression de produits
- ✅ Calcul du total
- ✅ Persistence locale

### 🔒 Sécurité

- ✅ Token JWT stocké de manière sécurisée
- ✅ Déconnexion automatique si token invalide
- ✅ Headers d'authentification automatiques
- ✅ Gestion des erreurs réseau

### 🚀 Performance

- ✅ Hooks avec cache automatique
- ✅ Stores avec persistence
- ✅ Requêtes optimisées
- ✅ Chargement asynchrone

### 📝 Types TypeScript

- ✅ Types complets pour tous les services
- ✅ Interfaces pour toutes les entités
- ✅ Types pour les réponses API
- ✅ Résolution des conflits de types

### 🎨 Architecture

- ✅ Séparation des responsabilités
- ✅ Services réutilisables
- ✅ Hooks personnalisés
- ✅ State management centralisé
- ✅ Code DRY (Don't Repeat Yourself)

---

## [1.0.0] - 2025-12-15

### Version initiale avec Supabase

- Authentification avec Supabase Auth
- Gestion des produits avec Supabase Database
- Gestion des boutiques
- Système de commandes
- Dashboard client et vendeur
- Panier d'achats
- Profil utilisateur

---

## Prochaines versions prévues

### [2.1.0] - À venir
- Migration complète des composants
- Remplacement de tous les appels Supabase
- Tests unitaires pour les services
- Tests d'intégration

### [2.2.0] - À venir
- Optimisation des performances
- Cache avancé avec React Query
- Lazy loading des images
- PWA (Progressive Web App)

### [2.3.0] - À venir
- Notifications en temps réel
- Chat vendeur-client
- Système de notation et avis
- Favoris et wishlist

---

**Dernière mise à jour** : 21 janvier 2026  
**Version actuelle** : 2.0.0
