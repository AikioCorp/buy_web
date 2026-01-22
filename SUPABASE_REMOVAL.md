# 🗑️ Suppression de Supabase - BuyMore Web

**Date** : 21 janvier 2026  
**Migration** : Supabase → Django REST API

---

## ✅ Fichiers modifiés

### Stores (`src/store/`)

1. **`authStore.ts`** ✅
   - **Avant** : Réexportait depuis `@buymore/api-client` (Supabase)
   - **Après** : Réexporte depuis `../stores/authStore` (Django REST API)

2. **`cartStore.ts`** ✅
   - **Avant** : Réexportait depuis `@buymore/api-client` (Supabase)
   - **Après** : Réexporte depuis `../stores/cartStore` (Django REST API)

### Pages d'authentification

3. **`LoginPage.tsx`** ✅
   - **Avant** : Utilisait `signIn(email, password)` de Supabase
   - **Après** : Utilise `login(email, password)` de notre authStore
   - Gestion d'erreur et loading depuis le store

4. **`RegisterPage.tsx`** ✅
   - **Avant** : Utilisait `signUp(email, password, fullName, role, shopData)` de Supabase
   - **Après** : Utilise `register(data)` de notre authStore
   - Adapté aux champs requis par l'API Django

---

## 📋 Fichiers Supabase restants à supprimer

Les fichiers suivants contiennent encore des références à Supabase et doivent être nettoyés :

### Dossier `src/lib/`
- `src/lib/supabase.ts` - **À SUPPRIMER**
- `src/lib/api-client/` - **Dossier complet à supprimer** (ancien client Supabase)

### Dossier `src/utils/`
- `src/utils/supabase.ts` - **À SUPPRIMER**

### Pages à migrer
- `src/pages/HomePage.tsx` - Utilise encore Supabase pour les produits
- `src/pages/ShopsPage.tsx` - Utilise encore Supabase pour les boutiques
- `src/pages/ShopDetailPage.tsx` - Utilise encore Supabase
- `src/pages/ProductDetailPage.tsx` - Utilise encore Supabase
- `src/pages/DashboardPage.tsx` - Utilise encore Supabase
- `src/pages/TodosPage.tsx` - Utilise encore Supabase

### Composants à migrer
- `src/components/Navbar.tsx` - Utilise encore Supabase pour l'auth
- `src/components/NeighborhoodAutocomplete.tsx` - Utilise encore Supabase

### Fichier principal
- `src/main.tsx` - Contient probablement l'initialisation Supabase

---

## 🔄 Plan de migration des pages restantes

### 1. HomePage.tsx
**Avant** :
```typescript
import { supabase } from '@/lib/supabase'
const { data: products } = await supabase.from('products').select('*')
```

**Après** :
```typescript
import { useProducts, useCategories } from '@/hooks'
const { products, isLoading } = useProducts()
const { categories } = useCategories()
```

### 2. ShopsPage.tsx
**Avant** :
```typescript
const { data: shops } = await supabase.from('shops').select('*')
```

**Après** :
```typescript
import { useShops } from '@/hooks'
const { shops, isLoading } = useShops()
```

### 3. ProductDetailPage.tsx
**Avant** :
```typescript
const { data: product } = await supabase
  .from('products')
  .select('*')
  .eq('id', id)
  .single()
```

**Après** :
```typescript
import { useProduct } from '@/hooks'
const { product, isLoading } = useProduct(Number(id))
```

### 4. Navbar.tsx
**Avant** :
```typescript
import { supabase } from '@/lib/supabase'
const { data: { user } } = await supabase.auth.getUser()
```

**Après** :
```typescript
import { useAuthStore } from '@/store/authStore'
const { user, isAuthenticated } = useAuthStore()
```

---

## 🗑️ Commandes de nettoyage

Une fois toutes les pages migrées, exécuter :

```bash
# Supprimer les fichiers Supabase
rm src/lib/supabase.ts
rm src/utils/supabase.ts
rm -rf src/lib/api-client/

# Désinstaller la dépendance Supabase (optionnel)
pnpm remove @supabase/supabase-js
```

---

## ✅ Checklist de migration

### Stores
- [x] `src/store/authStore.ts` - Réexporte le nouveau store
- [x] `src/store/cartStore.ts` - Réexporte le nouveau store

### Pages d'authentification
- [x] `src/pages/LoginPage.tsx` - Utilise le nouveau authStore
- [x] `src/pages/RegisterPage.tsx` - Utilise le nouveau authStore

### Pages à migrer
- [ ] `src/pages/HomePage.tsx` - Migrer vers useProducts/useCategories
- [ ] `src/pages/ShopsPage.tsx` - Migrer vers useShops
- [ ] `src/pages/ShopDetailPage.tsx` - Migrer vers useShop
- [ ] `src/pages/ProductDetailPage.tsx` - Migrer vers useProduct
- [ ] `src/pages/DashboardPage.tsx` - Migrer vers les nouveaux hooks
- [ ] `src/pages/TodosPage.tsx` - Migrer ou supprimer

### Composants
- [ ] `src/components/Navbar.tsx` - Migrer vers useAuthStore
- [ ] `src/components/NeighborhoodAutocomplete.tsx` - Vérifier et migrer

### Nettoyage final
- [ ] Supprimer `src/lib/supabase.ts`
- [ ] Supprimer `src/utils/supabase.ts`
- [ ] Supprimer `src/lib/api-client/`
- [ ] Désinstaller `@supabase/supabase-js`
- [ ] Vérifier qu'aucune référence à Supabase ne reste

---

## 🎯 État actuel

### ✅ Complété
- Login et Register fonctionnent avec Django REST API
- Stores réexportent les nouveaux stores
- AuthStore et CartStore utilisent l'API Django

### 🚧 En cours
- Migration des pages restantes vers les nouveaux hooks

### ⏳ À faire
- Supprimer les fichiers Supabase
- Nettoyer les dépendances

---

## 📝 Notes importantes

1. **Ne pas supprimer les fichiers Supabase** avant d'avoir migré toutes les pages
2. **Tester chaque page** après migration
3. **Vérifier les types TypeScript** - certains peuvent avoir changé
4. **Adapter les composants** aux nouvelles structures de données

---

**Dernière mise à jour** : 21 janvier 2026  
**Statut** : Login et Register migrés ✅
