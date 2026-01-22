# 🔌 Guide de Connexion à l'API - BuyMore Web

**Date** : 21 janvier 2026  
**API Backend** : Django REST API sur `http://localhost:8000`

---

## ✅ Configuration terminée

Tous les services ont été **corrigés et adaptés** pour correspondre exactement à votre API Django REST.

### Fichiers modifiés

1. **`.env`** - URL de l'API mise à jour
2. **`authService.ts`** - Login/Register adaptés
3. **`productsService.ts`** - Interfaces corrigées
4. **`shopsService.ts`** - Endpoints `/api/customers/stores/`
5. **`profileService.ts`** - Profil et adresses
6. **`ordersService.ts`** - Création de commandes
7. **`authStore.ts`** - Store adapté aux nouvelles réponses

---

## 🚀 Démarrage

### 1. Vérifier le backend

Assurez-vous que votre backend Django est démarré sur `http://localhost:8000` :

```bash
# Dans le dossier backend Django
python manage.py runserver
```

### 2. Vérifier la configuration

Le fichier `.env` doit contenir :

```env
VITE_API_BASE_URL=http://localhost:8000
```

### 3. Lancer l'application web

```bash
cd c:\Dev\Projet\buymore\web
pnpm dev
```

### 4. Tester la connexion

Accédez à la page de test :

**http://localhost:5173/test-api**

Cette page va vérifier :
- ✅ Connexion au backend
- ✅ Chargement des catégories
- ✅ Chargement des produits
- ✅ État de l'authentification

---

## 📋 Endpoints disponibles

### Authentification

#### Login
```typescript
import { useAuthStore } from './stores';

const { login } = useAuthStore();
await login('john@example.com', 'password123');
```

**API** : `POST /api/auth/login/`
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Réponse** :
```json
{
  "token": "abc123...",
  "user_id": 1,
  "customer_id": 1,
  "username": "john",
  "email": "john@example.com"
}
```

#### Register
```typescript
const { register } = useAuthStore();
await register({
  username: 'john',
  email: 'john@example.com',
  password: 'password123',
  first_name: 'John',
  last_name: 'Doe',
  phone: '0600000000',
  is_seller: true,
  store_name: 'Ma Boutique'
});
```

**API** : `POST /api/auth/register/`

---

### Produits

#### Liste des produits
```typescript
import { useProducts } from './hooks';

const { products, isLoading, error } = useProducts({
  page: 1,
  page_size: 12,
  category_id: 1,
  search: 'phone'
});
```

**API** : `GET /api/products/?page=1&page_size=12&category_id=1&search=phone`

**Réponse** :
```json
{
  "count": 42,
  "next": "http://localhost:8000/api/products/?page=2",
  "previous": null,
  "results": [
    {
      "id": 10,
      "name": "Produit X",
      "slug": "produit-x",
      "base_price": "19.99",
      "store": { "id": 1, "name": "Ma Boutique", ... },
      "category": { "id": 1, "name": "Électronique", ... },
      "media": []
    }
  ]
}
```

#### Détail d'un produit
```typescript
import { useProduct } from './hooks';

const { product, isLoading, error } = useProduct(10);
```

**API** : `GET /api/products/10/`

#### Mes produits (vendeur)
```typescript
import { useMyProducts } from './hooks';

const { products, isLoading, error } = useMyProducts();
```

**API** : `GET /api/my-products/` (avec token)

#### Créer un produit (vendeur)
```typescript
import { productsService } from './lib/api';

const response = await productsService.createProduct({
  category: 1,
  name: 'Nouveau produit',
  slug: 'nouveau-produit',
  description: 'Description...',
  base_price: '29.99'
});
```

**API** : `POST /api/my-products/` (avec token)

---

### Catégories

```typescript
import { useCategories } from './hooks';

const { categories, isLoading, error } = useCategories();
```

**API** : `GET /api/categories/`

**Réponse** :
```json
[
  {
    "id": 1,
    "name": "Électronique",
    "slug": "electronique",
    "parent": null,
    "children": []
  }
]
```

---

### Boutiques

#### Ma boutique (vendeur)
```typescript
import { shopsService } from './lib/api';

const response = await shopsService.getMyShops();
// Retourne un tableau avec 0 ou 1 boutique
```

**API** : `GET /api/customers/stores/` (avec token)

#### Créer une boutique (vendeur)
```typescript
const response = await shopsService.createShop({
  name: 'Ma Boutique',
  slug: 'ma-boutique',
  description: 'Ma super boutique',
  is_active: true
});
```

**API** : `POST /api/customers/stores/` (avec token)

---

### Profil

#### Mon profil
```typescript
import { useProfile } from './hooks';

const { profile, isLoading, error } = useProfile();
```

**API** : `GET /api/customers/profiles/` (avec token)

**Réponse** :
```json
[
  {
    "id": 1,
    "user": 1,
    "first_name": "John",
    "last_name": "Doe",
    "phone": "0600000000",
    "addresses": [...]
  }
]
```

---

### Adresses

#### Liste des adresses
```typescript
import { useAddresses } from './hooks';

const { addresses, isLoading, error } = useAddresses();
```

**API** : `GET /api/customers/addresses/` (avec token)

#### Créer une adresse
```typescript
import { profileService } from './lib/api';

const response = await profileService.createAddress({
  full_name: 'John Doe',
  line1: '10 rue de la Paix',
  line2: '',
  city: 'Paris',
  state: '',
  postal_code: '75000',
  country: 'FR',
  is_default: true
});
```

**API** : `POST /api/customers/addresses/` (avec token)

---

### Commandes

#### Mes commandes
```typescript
import { useOrders } from './hooks';

const { orders, isLoading, error } = useOrders();
```

**API** : `GET /api/orders/` (avec token)

#### Créer une commande (checkout)
```typescript
import { ordersService } from './lib/api';

const response = await ordersService.createOrder({
  shipping_address_id: 3,
  items: [
    { product_id: 10, quantity: 2 },
    { product_id: 12, quantity: 1 }
  ]
});
```

**API** : `POST /api/orders/` (avec token)

**Réponse** :
```json
{
  "id": 10,
  "customer": 1,
  "user": 1,
  "status": "pending",
  "shipping_address": 3,
  "total_amount": "59.97",
  "items": [...],
  "created_at": "2025-01-01T12:00:00Z",
  "updated_at": "2025-01-01T12:00:00Z"
}
```

---

## 🔐 Authentification

Tous les endpoints protégés nécessitent un header :

```
Authorization: Token <token>
```

Le token est géré automatiquement par `apiClient` après login/register.

---

## 🎯 Exemples complets

### Exemple 1 : Page de connexion

```typescript
import { useAuthStore } from './stores';
import { useState } from 'react';

function LoginPage() {
  const { login, isLoading, error } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      window.location.href = '/dashboard';
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="email" 
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input 
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Mot de passe"
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Connexion...' : 'Se connecter'}
      </button>
      {error && <p className="error">{error}</p>}
    </form>
  );
}
```

### Exemple 2 : Liste de produits avec filtres

```typescript
import { useProducts, useCategories } from './hooks';
import { useState } from 'react';

function ProductsPage() {
  const [categoryId, setCategoryId] = useState<number>();
  const [search, setSearch] = useState('');

  const { products, isLoading, error, pagination } = useProducts({
    category_id: categoryId,
    search,
    page_size: 12
  });

  const { categories } = useCategories();

  if (isLoading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error}</div>;

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
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="grid grid-cols-3 gap-4">
        {products.map(product => (
          <div key={product.id} className="product-card">
            <h3>{product.name}</h3>
            <p>{product.base_price} FCFA</p>
            <p>Boutique: {product.store.name}</p>
          </div>
        ))}
      </div>

      {pagination && (
        <p>Total: {pagination.count} produits</p>
      )}
    </div>
  );
}
```

### Exemple 3 : Création de commande

```typescript
import { useCartStore } from './stores';
import { useAddresses } from './hooks';
import { ordersService } from './lib/api';
import { useState } from 'react';

function CheckoutPage() {
  const { items, clearCart } = useCartStore();
  const { addresses } = useAddresses();
  const [selectedAddress, setSelectedAddress] = useState<number>();
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    if (!selectedAddress) {
      alert('Veuillez sélectionner une adresse');
      return;
    }

    setIsLoading(true);

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
      window.location.href = '/orders';
    }

    setIsLoading(false);
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

      <button onClick={handleCheckout} disabled={isLoading}>
        {isLoading ? 'Traitement...' : 'Passer la commande'}
      </button>
    </div>
  );
}
```

---

## ✅ Checklist de vérification

- [ ] Backend Django démarré sur `http://localhost:8000`
- [ ] `.env` contient `VITE_API_BASE_URL=http://localhost:8000`
- [ ] `pnpm dev` lancé avec succès
- [ ] Page `/test-api` affiche tout en vert ✅
- [ ] Login fonctionne
- [ ] Produits se chargent
- [ ] Catégories se chargent

---

## 🐛 Résolution de problèmes

### Erreur CORS

Si vous voyez des erreurs CORS, vérifiez dans votre backend Django :

```python
# settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
]
```

### Token non envoyé

Vérifiez que le token est bien stocké après login :

```typescript
console.log(localStorage.getItem('auth_token'));
```

### API non accessible

Vérifiez que le backend répond :

```bash
curl http://localhost:8000/api/products/
```

---

**Tout est prêt ! L'application web est maintenant connectée à votre API Django REST. 🎉**
