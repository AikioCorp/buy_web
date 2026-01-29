# 🌐 BuyMore Web Application - Documentation Complète

**Date** : 28 janvier 2026  
**Stack** : React + TypeScript + Vite + TailwindCSS  
**Backend** : Django REST API (https://backend.buymore.ml)

---

## 📋 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture technique](#architecture-technique)
3. [Pages publiques](#pages-publiques)
4. [Dashboard Client](#dashboard-client)
5. [Dashboard Vendeur](#dashboard-vendeur)
6. [Dashboard Admin](#dashboard-admin)
7. [Dashboard Super Admin](#dashboard-super-admin)
8. [Services API](#services-api)
9. [Composants réutilisables](#composants-réutilisables)
10. [Stores (État global)](#stores-état-global)
11. [Hooks personnalisés](#hooks-personnalisés)
12. [Routes et navigation](#routes-et-navigation)

---

## 🎯 Vue d'ensemble

**BuyMore Web** est une marketplace e-commerce complète avec :
- ✅ Boutique en ligne pour les clients
- ✅ Dashboard vendeur pour gérer les produits et commandes
- ✅ Dashboard client pour suivre les commandes et favoris
- ✅ Dashboard admin pour la modération
- ✅ Dashboard super admin pour la gestion complète de la plateforme

---

## 🏗️ Architecture technique

### Stack technique
```
Frontend:
├── React 18 (avec TypeScript)
├── Vite (build tool)
├── TailwindCSS (styling)
├── React Router DOM (navigation)
├── Zustand (state management)
├── Lucide React (icons)
└── Axios (HTTP client)

Backend:
└── Django REST Framework (API)
```

### Structure des dossiers
```
src/
├── components/           # Composants réutilisables
│   ├── dashboard/        # Composants dashboard
│   │   ├── admin/        # Composants admin
│   │   ├── client/       # Composants client
│   │   └── superadmin/   # Composants super admin
│   └── ...
├── pages/                # Pages de l'application
│   ├── dashboard/        # Pages dashboard
│   │   ├── admin/        # Pages admin
│   │   └── client/       # Pages client
│   └── ...
├── lib/
│   ├── api/              # Services API
│   └── ui/               # Composants UI
├── stores/               # État global (Zustand)
├── hooks/                # Hooks personnalisés
└── utils/                # Utilitaires
```

---

## 📄 Pages publiques

### 1. HomePage (`/`)
**Fichier** : `src/pages/HomePage.tsx`

**Sections** :
- ✅ **Hero Banner** - Bannière principale avec CTA
- ✅ **Avantages** - Livraison, Paiement sécurisé, Support 24/7
- ✅ **Boutiques Partenaires** - 4 boutiques mises en avant
- ✅ **Catégories** - Navigation par catégorie
- ✅ **Produits Tendance** - 4 produits populaires avec badges "HOT"
- ✅ **Bannière Promo** - Code promo BIENVENUE
- ✅ **Nouveautés** - 8 derniers produits
- ✅ **Section Restaurants** - "Bientôt disponible"
- ✅ **Newsletter** - Inscription email

### 2. ShopsPage (`/shops`)
**Fichier** : `src/pages/ShopsPage.tsx`

**Fonctionnalités** :
- ✅ Liste de toutes les boutiques
- ✅ Filtrage par catégorie
- ✅ Recherche de boutiques
- ✅ Pagination

### 3. ShopDetailPage (`/shops/:id`)
**Fichier** : `src/pages/ShopDetailPage.tsx`

**Fonctionnalités** :
- ✅ Informations de la boutique
- ✅ Liste des produits de la boutique
- ✅ Avis et notes
- ✅ Contact vendeur

### 4. ProductsPage (`/products`)
**Fichier** : `src/pages/ProductsPage.tsx`

**Fonctionnalités** :
- ✅ Liste de tous les produits
- ✅ Filtrage par catégorie, prix, etc.
- ✅ Tri (prix, popularité, date)
- ✅ Pagination
- ✅ Vue grille/liste

### 5. ProductDetailPage (`/products/:id`)
**Fichier** : `src/pages/ProductDetailPage.tsx`

**Fonctionnalités** :
- ✅ Images du produit (galerie)
- ✅ Description détaillée
- ✅ Prix et variantes
- ✅ Ajouter au panier
- ✅ Ajouter aux favoris
- ✅ Produits similaires

### 6. CategoriesPage (`/categories`)
**Fichier** : `src/pages/CategoriesPage.tsx`

**Fonctionnalités** :
- ✅ Liste des catégories
- ✅ Sous-catégories
- ✅ Navigation vers les produits

### 7. DealsPage (`/deals`)
**Fichier** : `src/pages/DealsPage.tsx`

**Fonctionnalités** :
- ✅ Produits en promotion
- ✅ Offres spéciales
- ✅ Codes promo

### 8. CartPage (`/cart`)
**Fichier** : `src/pages/CartPage.tsx`

**Fonctionnalités** :
- ✅ Liste des produits dans le panier
- ✅ Modifier les quantités
- ✅ Supprimer des produits
- ✅ Calcul du total
- ✅ Procéder au paiement

### 9. CheckoutPage (`/checkout`)
**Fichier** : `src/pages/CheckoutPage.tsx`

**Fonctionnalités** :
- ✅ Adresse de livraison
- ✅ Méthode de paiement (Wave, Orange Money, etc.)
- ✅ Récapitulatif de commande
- ✅ Confirmation de commande

### 10. LoginPage (`/login`)
**Fichier** : `src/pages/LoginPage.tsx`

**Fonctionnalités** :
- ✅ Connexion par email/mot de passe
- ✅ Connexion par téléphone
- ✅ Mot de passe oublié
- ✅ Redirection après connexion

### 11. RegisterPage (`/register`)
**Fichier** : `src/pages/RegisterPage.tsx`

**Fonctionnalités** :
- ✅ Inscription client
- ✅ Inscription vendeur
- ✅ Validation des champs
- ✅ Sélection du quartier (autocomplete)
- ✅ Numéro de téléphone malien

---

## 👤 Dashboard Client (`/client/*`)

**Layout** : `ClientDashboardLayout`  
**Accès** : Utilisateurs avec rôle `client`

### Pages du dashboard client

| Route | Page | Description |
|-------|------|-------------|
| `/client` | ClientDashboardPage | Vue d'ensemble du compte |
| `/client/orders` | OrdersPage | Historique des commandes |
| `/client/favorites` | FavoritesPage | Produits favoris |
| `/client/profile` | ProfilePage | Informations personnelles |
| `/client/addresses` | AddressesPage | Gestion des adresses |
| `/client/payments` | PaymentsPage | Méthodes de paiement |
| `/client/messages` | MessagesPage | Messages avec vendeurs |
| `/client/notifications` | NotificationsPage | Notifications |
| `/client/settings` | SettingsPage | Paramètres du compte |

### Fonctionnalités détaillées

#### ClientDashboardPage
- ✅ Statistiques (commandes, favoris, dépenses)
- ✅ Dernières commandes
- ✅ Produits recommandés
- ✅ Actions rapides

#### OrdersPage
- ✅ Liste des commandes
- ✅ Filtrage par statut
- ✅ Détails de commande
- ✅ Suivi de livraison

#### FavoritesPage
- ✅ Liste des favoris
- ✅ Ajouter au panier
- ✅ Supprimer des favoris

#### ProfilePage
- ✅ Modifier le profil
- ✅ Photo de profil
- ✅ Informations personnelles

#### AddressesPage
- ✅ Ajouter une adresse
- ✅ Modifier une adresse
- ✅ Supprimer une adresse
- ✅ Adresse par défaut

#### PaymentsPage
- ✅ Ajouter une méthode de paiement
- ✅ Wave, Orange Money, Moov
- ✅ Historique des paiements

#### MessagesPage
- ✅ Conversations avec vendeurs
- ✅ Envoyer des messages
- ✅ Notifications de nouveaux messages

#### NotificationsPage
- ✅ Liste des notifications
- ✅ Marquer comme lu
- ✅ Supprimer des notifications

#### SettingsPage
- ✅ Changer le mot de passe
- ✅ Préférences de notification
- ✅ Langue
- ✅ Supprimer le compte

---

## 🏪 Dashboard Vendeur (`/dashboard/*`)

**Layout** : `DashboardLayout`  
**Accès** : Utilisateurs avec rôle `vendor`

### Pages du dashboard vendeur

| Route | Page | Description |
|-------|------|-------------|
| `/dashboard` | VendorDashboardPage | Vue d'ensemble |
| `/dashboard/store` | StorePage | Gestion de la boutique |
| `/dashboard/products` | ProductsPage | Gestion des produits |
| `/dashboard/orders` | OrdersPage | Gestion des commandes |
| `/dashboard/analytics` | AnalyticsPage | Statistiques et analyses |
| `/dashboard/earnings` | EarningsPage | Revenus et paiements |
| `/dashboard/shipping` | ShippingPage | Zones de livraison |
| `/dashboard/settings` | SettingsPage | Paramètres |
| `/dashboard/help` | HelpPage | Aide et support |

### Fonctionnalités détaillées

#### VendorDashboardPage
- ✅ Statistiques (ventes, commandes, revenus)
- ✅ Graphiques de performance
- ✅ Dernières commandes
- ✅ Produits populaires
- ✅ Alertes et notifications

#### StorePage
- ✅ Informations de la boutique
- ✅ Logo et bannière
- ✅ Description
- ✅ Horaires d'ouverture
- ✅ Catégories de la boutique

#### ProductsPage
- ✅ Liste des produits
- ✅ Ajouter un produit
- ✅ Modifier un produit
- ✅ Supprimer un produit
- ✅ Gestion des stocks
- ✅ Images multiples
- ✅ Variantes de produits

#### OrdersPage
- ✅ Liste des commandes
- ✅ Filtrage par statut
- ✅ Détails de commande
- ✅ Changer le statut
- ✅ Imprimer la facture

#### AnalyticsPage
- ✅ Graphiques de ventes
- ✅ Produits les plus vendus
- ✅ Clients fidèles
- ✅ Taux de conversion

#### EarningsPage
- ✅ Revenus totaux
- ✅ Historique des paiements
- ✅ Demander un retrait
- ✅ Commissions

#### ShippingPage
- ✅ Zones de livraison
- ✅ Tarifs de livraison
- ✅ Délais de livraison

---

## 🔧 Dashboard Admin (`/admin/*`)

**Layout** : `AdminDashboardLayout`  
**Accès** : Utilisateurs avec rôle `admin` ou `super_admin`

### Pages du dashboard admin

| Route | Page | Description |
|-------|------|-------------|
| `/admin` | AdminDashboardPage | Vue d'ensemble |
| `/admin/users` | - | Gestion des utilisateurs |
| `/admin/reports` | - | Rapports |
| `/admin/moderation` | - | Modération |
| `/admin/analytics` | - | Analyses |
| `/admin/security` | - | Sécurité |
| `/admin/settings` | - | Paramètres |

---

## 👑 Dashboard Super Admin (`/superadmin/*`)

**Layout** : `SuperAdminDashboardLayout`  
**Accès** : Utilisateurs avec rôle `super_admin` uniquement

### Pages du dashboard super admin

| Route | Page | Description |
|-------|------|-------------|
| `/superadmin` | SuperAdminDashboardPage | Vue d'ensemble complète |
| `/superadmin/users` | SuperAdminUsersPage | Gestion de tous les utilisateurs |
| `/superadmin/businesses` | SuperAdminShopsPage | Gestion des boutiques |
| `/superadmin/restaurants` | SuperAdminRestaurantsPage | Gestion des restaurants |
| `/superadmin/categories` | SuperAdminCategoriesPage | Gestion des catégories |
| `/superadmin/products` | SuperAdminProductsPage | Gestion des produits |
| `/superadmin/orders` | SuperAdminOrdersPage | Gestion des commandes |
| `/superadmin/analytics` | SuperAdminAnalyticsPage | Analyses avancées |
| `/superadmin/performance` | SuperAdminPerformancePage | Performance système |
| `/superadmin/security` | SuperAdminPermissionsPage | Permissions et sécurité |
| `/superadmin/settings` | SuperAdminSettingsPage | Paramètres globaux |

### Fonctionnalités Super Admin

#### SuperAdminUsersPage
- ✅ Liste de tous les utilisateurs
- ✅ Créer un utilisateur
- ✅ Modifier un utilisateur
- ✅ Suspendre/Activer un compte
- ✅ Changer le rôle
- ✅ Historique d'activité

#### SuperAdminShopsPage
- ✅ Liste de toutes les boutiques
- ✅ Approuver/Rejeter une boutique
- ✅ Suspendre une boutique
- ✅ Statistiques par boutique

#### SuperAdminCategoriesPage
- ✅ Créer une catégorie
- ✅ Modifier une catégorie
- ✅ Supprimer une catégorie
- ✅ Sous-catégories
- ✅ Icônes et images

#### SuperAdminProductsPage
- ✅ Liste de tous les produits
- ✅ Modération des produits
- ✅ Supprimer un produit
- ✅ Statistiques

#### SuperAdminOrdersPage
- ✅ Liste de toutes les commandes
- ✅ Filtrage avancé
- ✅ Statistiques de commandes
- ✅ Gestion des litiges

#### SuperAdminAnalyticsPage
- ✅ Statistiques globales
- ✅ Graphiques de croissance
- ✅ Revenus de la plateforme
- ✅ Utilisateurs actifs

#### SuperAdminPermissionsPage
- ✅ Gestion des rôles
- ✅ Permissions par rôle
- ✅ Logs de sécurité

#### SuperAdminSettingsPage
- ✅ Paramètres de la plateforme
- ✅ Commissions
- ✅ Emails automatiques
- ✅ Maintenance

---

## 🔌 Services API

**Dossier** : `src/lib/api/`

### Liste des services

| Service | Fichier | Description |
|---------|---------|-------------|
| apiClient | `apiClient.ts` | Client HTTP configuré |
| authService | `authService.ts` | Authentification |
| productsService | `productsService.ts` | Gestion des produits |
| shopsService | `shopsService.ts` | Gestion des boutiques |
| categoriesService | `categoriesService.ts` | Gestion des catégories |
| ordersService | `ordersService.ts` | Gestion des commandes |
| profileService | `profileService.ts` | Gestion du profil |
| addressesService | `addressesService.ts` | Gestion des adresses |
| favoritesService | `favoritesService.ts` | Gestion des favoris |
| paymentsService | `paymentsService.ts` | Gestion des paiements |
| messagesService | `messagesService.ts` | Messagerie |
| notificationsService | `notificationsService.ts` | Notifications |
| deliveryService | `deliveryService.ts` | Livraison |
| usersService | `usersService.ts` | Gestion des utilisateurs (admin) |

---

## 🧩 Composants réutilisables

**Dossier** : `src/components/`

### Composants principaux

| Composant | Description |
|-----------|-------------|
| `Layout` | Layout principal avec Navbar |
| `AuthLayout` | Layout pour pages d'authentification |
| `Navbar` | Barre de navigation principale |
| `Hero` | Bannière d'accueil |
| `Card` | Carte générique |
| `Button` | Bouton stylisé |
| `Input` | Champ de saisie |
| `PhoneInput` | Saisie de téléphone malien |
| `NeighborhoodAutocomplete` | Autocomplete de quartiers |
| `ProtectedRoute` | Route protégée (authentification) |
| `ProtectedRouteByRole` | Route protégée par rôle |

### Composants Dashboard

| Composant | Description |
|-----------|-------------|
| `DashboardLayout` | Layout dashboard vendeur |
| `DashboardSidebar` | Sidebar du dashboard |
| `DashboardHeader` | Header du dashboard |
| `ProductFormModal` | Modal d'ajout/édition de produit |
| `DeliveryZonesManager` | Gestion des zones de livraison |
| `OnboardingTour` | Tour guidé pour nouveaux vendeurs |

---

## 📦 Stores (État global)

**Dossier** : `src/stores/`

### authStore
**Fichier** : `authStore.ts`

**État** :
```typescript
{
  user: User | null,
  token: string | null,
  isAuthenticated: boolean,
  isLoading: boolean
}
```

**Actions** :
- `login(email, password)`
- `register(data)`
- `logout()`
- `loadUser()`
- `updateProfile(data)`

### cartStore
**Fichier** : `cartStore.ts`

**État** :
```typescript
{
  items: CartItem[],
  total: number
}
```

**Actions** :
- `addItem(product, quantity)`
- `removeItem(productId)`
- `updateQuantity(productId, quantity)`
- `clearCart()`

---

## 🪝 Hooks personnalisés

**Dossier** : `src/hooks/`

| Hook | Description |
|------|-------------|
| `useProducts` | Gestion des produits |
| `useCategories` | Gestion des catégories |
| `useShops` | Gestion des boutiques |
| `useOrders` | Gestion des commandes |
| `useProfile` | Gestion du profil |
| `useAddresses` | Gestion des adresses |
| `useFavorites` | Gestion des favoris |
| `usePayments` | Gestion des paiements |
| `useMessages` | Gestion des messages |
| `useNotifications` | Gestion des notifications |

---

## 🗺️ Routes et navigation

### Routes publiques
```
/                    → HomePage
/shops               → ShopsPage
/shops/:id           → ShopDetailPage
/categories          → CategoriesPage
/products            → ProductsPage
/products/:id        → ProductDetailPage
/deals               → DealsPage
/cart                → CartPage
/checkout            → CheckoutPage
/login               → LoginPage
/register            → RegisterPage
```

### Routes client (protégées)
```
/client              → ClientDashboardPage
/client/orders       → OrdersPage
/client/favorites    → FavoritesPage
/client/profile      → ProfilePage
/client/addresses    → AddressesPage
/client/payments     → PaymentsPage
/client/messages     → MessagesPage
/client/notifications → NotificationsPage
/client/settings     → SettingsPage
```

### Routes vendeur (protégées)
```
/dashboard           → VendorDashboardPage
/dashboard/store     → StorePage
/dashboard/products  → ProductsPage
/dashboard/orders    → OrdersPage
/dashboard/analytics → AnalyticsPage
/dashboard/earnings  → EarningsPage
/dashboard/shipping  → ShippingPage
/dashboard/settings  → SettingsPage
/dashboard/help      → HelpPage
```

### Routes admin (protégées)
```
/admin               → AdminDashboardPage
/admin/users         → AdminDashboardPage
/admin/reports       → AdminDashboardPage
/admin/moderation    → AdminDashboardPage
/admin/analytics     → AdminDashboardPage
/admin/security      → AdminDashboardPage
/admin/settings      → AdminDashboardPage
```

### Routes super admin (protégées)
```
/superadmin              → SuperAdminDashboardPage
/superadmin/users        → SuperAdminUsersPage
/superadmin/businesses   → SuperAdminShopsPage
/superadmin/restaurants  → SuperAdminRestaurantsPage
/superadmin/categories   → SuperAdminCategoriesPage
/superadmin/products     → SuperAdminProductsPage
/superadmin/orders       → SuperAdminOrdersPage
/superadmin/analytics    → SuperAdminAnalyticsPage
/superadmin/performance  → SuperAdminPerformancePage
/superadmin/security     → SuperAdminPermissionsPage
/superadmin/settings     → SuperAdminSettingsPage
```

---

## 📊 Statistiques du projet

- **Pages totales** : ~40
- **Composants** : ~30
- **Services API** : 14
- **Hooks** : 10
- **Stores** : 2
- **Lignes de code** : ~15,000+

---

## 🚀 Améliorations suggérées pour le Home Screen

Le home screen actuel est déjà bien structuré, mais voici des améliorations pour le rendre **digne d'une application e-commerce professionnelle** :

### 1. **Carrousel de bannières**
- Bannières promotionnelles animées
- Offres flash avec compte à rebours
- Nouveaux arrivages

### 2. **Catégories visuelles améliorées**
- Images de fond pour chaque catégorie
- Animations au survol
- Compteur de produits par catégorie

### 3. **Section "Flash Sales"**
- Compte à rebours en temps réel
- Produits avec réductions importantes
- Stock limité visible

### 4. **Produits personnalisés**
- "Recommandé pour vous"
- "Basé sur vos achats récents"
- "Les clients ont aussi acheté"

### 5. **Section témoignages**
- Avis clients
- Notes et étoiles
- Photos de clients

### 6. **Marques partenaires**
- Logos des marques
- Carrousel automatique

### 7. **Application mobile**
- Bannière pour télécharger l'app
- QR code

---

**Document créé le** : 28 janvier 2026  
**Dernière mise à jour** : 28 janvier 2026
