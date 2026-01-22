# 🔄 Guide de Migration - Supabase vers Django REST API

**Date** : 21 janvier 2026  
**Version** : 2.0.0

---

## 📋 Vue d'ensemble

Ce guide détaille la migration de l'application web BuyMore de **Supabase** vers **Django REST API** pour unifier le backend avec l'application mobile.

### Pourquoi cette migration ?

1. **Unification du backend** - Même API pour web et mobile
2. **Cohérence des données** - Une seule source de vérité
3. **Simplicité de maintenance** - Un seul backend à gérer
4. **Flexibilité** - Plus de contrôle sur la logique métier

---

## 🆕 Nouveaux fichiers créés

### Services API (`src/lib/api/`)

| Fichier | Description |
|---------|-------------|
| `apiClient.ts` | Client HTTP avec gestion du token JWT |
| `authService.ts` | Authentification (login, register, social auth) |
| `productsService.ts` | Gestion des produits |
| `categoriesService.ts` | Gestion des catégories |
| `shopsService.ts` | Gestion des boutiques |
| `ordersService.ts` | Gestion des commandes |
| `profileService.ts` | Gestion du profil et adresses |
| `index.ts` | Export centralisé |

### Stores Zustand (`src/stores/`)

| Fichier | Description |
|---------|-------------|
| `authStore.ts` | Store d'authentification avec persistence |
| `cartStore.ts` | Store du panier avec persistence |
| `index.ts` | Export centralisé |

### Hooks personnalisés (`src/hooks/`)

| Fichier | Description |
|---------|-------------|
| `useProducts.ts` | Hooks pour produits (liste, détail, mes produits) |
| `useCategories.ts` | Hooks pour catégories |
| `useShops.ts` | Hooks pour boutiques |
| `useOrders.ts` | Hooks pour commandes |
| `useProfile.ts` | Hooks pour profil et adresses |
| `index.ts` | Export centralisé |

---

## 🔧 Configuration

### 1. Variables d'environnement

**Ancien (`.env`)** :
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Nouveau (`.env`)** :
```env
VITE_API_BASE_URL=https://backend.buymore.ml
```

### 2. Installation des dépendances

Aucune nouvelle dépendance requise ! La migration utilise uniquement :
- `zustand` (déjà installé)
- `fetch` API native

**À retirer** (optionnel) :
```bash
pnpm remove @supabase/supabase-js
```

---

## 🔄 Migration du code

### Authentification

**Avant (Supabase)** :
```typescript
import { supabase } from './lib/supabase';

// Connexion
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
});

// Inscription
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password'
});
```

**Après (Django REST API)** :
```typescript
import { useAuthStore } from './stores';

// Dans un composant
const { login, register } = useAuthStore();

// Connexion
const success = await login('user@example.com', 'password');

// Inscription
const success = await register({
  username: 'john_doe',
  email: 'user@example.com',
  password: 'password',
  first_name: 'John',
  last_name: 'Doe',
  phone: '+223 70 00 00 00'
});
```

### Récupération de données

**Avant (Supabase)** :
```typescript
// Produits
const { data: products } = await supabase
  .from('products')
  .select('*')
  .eq('is_active', true);

// Catégories
const { data: categories } = await supabase
  .from('categories')
  .select('*');
```

**Après (Django REST API)** :
```typescript
import { useProducts, useCategories } from './hooks';

// Dans un composant
function ProductsPage() {
  const { products, isLoading, error } = useProducts();
  const { categories } = useCategories();

  if (isLoading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error}</div>;

  return (
    <div>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

### Panier

**Avant (Supabase)** :
```typescript
// Stockage local manuel
const cart = JSON.parse(localStorage.getItem('cart') || '[]');
```

**Après (Django REST API)** :
```typescript
import { useCartStore } from './stores';

function CartPage() {
  const { items, addItem, removeItem, getTotal } = useCartStore();

  return (
    <div>
      <h1>Panier ({items.length})</h1>
      <p>Total: {getTotal()} FCFA</p>
    </div>
  );
}
```

---

## 📝 Checklist de migration

### Étape 1 : Configuration
- [ ] Mettre à jour `.env` avec `VITE_API_BASE_URL`
- [ ] Vérifier que le backend Django est accessible
- [ ] Tester la connexion à l'API

### Étape 2 : Authentification
- [ ] Remplacer `supabase.auth` par `useAuthStore`
- [ ] Mettre à jour les pages de login/register
- [ ] Tester la connexion/déconnexion
- [ ] Vérifier la persistence du token

### Étape 3 : Données
- [ ] Remplacer les requêtes Supabase par les hooks
- [ ] Mettre à jour `HomePage` avec `useProducts` et `useCategories`
- [ ] Mettre à jour `ShopsPage` avec `useShops`
- [ ] Mettre à jour `ProductDetailPage` avec `useProduct`

### Étape 4 : Profil
- [ ] Mettre à jour la page profil avec `useProfile`
- [ ] Implémenter l'upload d'avatar
- [ ] Gérer les adresses avec `useAddresses`

### Étape 5 : Commandes
- [ ] Mettre à jour la page commandes avec `useOrders`
- [ ] Implémenter la création de commande
- [ ] Gérer les statuts de commande (vendeur)

### Étape 6 : Tests
- [ ] Tester toutes les fonctionnalités
- [ ] Vérifier les erreurs réseau
- [ ] Tester la déconnexion/reconnexion
- [ ] Valider la persistence du panier

### Étape 7 : Nettoyage
- [ ] Supprimer `src/lib/supabase.ts`
- [ ] Retirer les imports Supabase
- [ ] Nettoyer les anciens stores si nécessaire
- [ ] Mettre à jour la documentation

---

## 🎯 Exemples d'utilisation

### Exemple 1 : Page de produits avec filtres

```typescript
import { useProducts, useCategories } from './hooks';
import { useState } from 'react';

function ProductsPage() {
  const [categoryId, setCategoryId] = useState<number>();
  const [search, setSearch] = useState('');

  const { products, isLoading, error } = useProducts({
    category_id: categoryId,
    search,
    page_size: 12
  });

  const { categories } = useCategories();

  return (
    <div>
      <select onChange={(e) => setCategoryId(Number(e.target.value))}>
        <option value="">Toutes les catégories</option>
        {categories.map(cat => (
          <option key={cat.id} value={cat.id}>{cat.name}</option>
        ))}
      </select>

      <input
        type="search"
        placeholder="Rechercher..."
        onChange={(e) => setSearch(e.target.value)}
      />

      {isLoading && <div>Chargement...</div>}
      {error && <div>Erreur: {error}</div>}

      <div className="grid grid-cols-3 gap-4">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
```

### Exemple 2 : Création de commande

```typescript
import { useCartStore } from './stores';
import { ordersService } from './lib/api';
import { useAddresses } from './hooks';

function CheckoutPage() {
  const { items, clearCart } = useCartStore();
  const { addresses } = useAddresses();
  const [selectedAddress, setSelectedAddress] = useState<number>();

  const handleCheckout = async () => {
    if (!selectedAddress) {
      alert('Veuillez sélectionner une adresse');
      return;
    }

    const orderData = {
      shipping_address_id: selectedAddress,
      items: items.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity
      }))
    };

    const response = await ordersService.createOrder(orderData);

    if (response.error) {
      alert(`Erreur: ${response.error}`);
    } else {
      alert('Commande créée avec succès !');
      clearCart();
      // Rediriger vers la page de confirmation
    }
  };

  return (
    <div>
      <h1>Finaliser la commande</h1>
      
      <select onChange={(e) => setSelectedAddress(Number(e.target.value))}>
        <option value="">Sélectionner une adresse</option>
        {addresses.map(addr => (
          <option key={addr.id} value={addr.id}>
            {addr.line1}, {addr.city}
          </option>
        ))}
      </select>

      <button onClick={handleCheckout}>
        Passer la commande
      </button>
    </div>
  );
}
```

### Exemple 3 : Upload d'avatar

```typescript
import { profileService } from './lib/api';
import { useProfile } from './hooks';

function ProfilePage() {
  const { profile, refresh } = useProfile();

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const response = await profileService.uploadAvatar(file);

    if (response.error) {
      alert(`Erreur: ${response.error}`);
    } else {
      alert('Avatar mis à jour !');
      refresh(); // Recharger le profil
    }
  };

  return (
    <div>
      <img src={profile?.avatar || '/default-avatar.png'} alt="Avatar" />
      <input type="file" accept="image/*" onChange={handleAvatarUpload} />
    </div>
  );
}
```

---

## 🐛 Résolution de problèmes

### Erreur : "Missing Supabase environment variables"

**Cause** : Anciennes variables d'environnement  
**Solution** : Mettre à jour `.env` avec `VITE_API_BASE_URL`

### Erreur : "Network request failed"

**Cause** : Backend inaccessible  
**Solution** : Vérifier que le backend Django est démarré et accessible

### Erreur : "Token expired"

**Cause** : Token JWT expiré  
**Solution** : Se reconnecter. Le store gère automatiquement la déconnexion

### Les données ne se chargent pas

**Cause** : Mauvaise configuration de l'API  
**Solution** : Vérifier `VITE_API_BASE_URL` dans `.env`

---

## 📚 Ressources

- **API Documentation** : Voir `PROJET_RECAP.md` dans le dossier mobile
- **Backend Django** : `c:\Dev\Projet\buymore\web` (à vérifier)
- **Hooks React** : Documentation officielle React
- **Zustand** : https://github.com/pmndrs/zustand

---

## ✅ Avantages de la nouvelle architecture

1. **Type-safe** - TypeScript complet sur tous les services
2. **Hooks réutilisables** - Code DRY (Don't Repeat Yourself)
3. **Gestion d'état centralisée** - Zustand pour auth et cart
4. **Meilleure gestion des erreurs** - Retours explicites
5. **Performance** - Cache automatique avec les hooks
6. **Testabilité** - Services isolés et testables

---

**Dernière mise à jour** : 21 janvier 2026  
**Version** : 2.0.0
