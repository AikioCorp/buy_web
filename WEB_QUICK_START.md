# ⚡ Quick Start - BuyMore Web

Guide de démarrage rapide pour l'application web BuyMore.

---

## 🚀 Installation rapide

```bash
# 1. Aller dans le dossier web
cd c:\Dev\Projet\buymore\web

# 2. Installer les dépendances
pnpm install

# 3. Configurer l'environnement
cp .env.example .env
# Éditer .env et configurer VITE_API_BASE_URL

# 4. Lancer l'application
pnpm dev
```

L'application sera accessible sur **http://localhost:5173**

---

## 📁 Structure du projet

```
web/
├── src/
│   ├── lib/
│   │   └── api/              # Services API Django REST 🆕
│   │       ├── apiClient.ts
│   │       ├── authService.ts
│   │       ├── productsService.ts
│   │       ├── categoriesService.ts
│   │       ├── shopsService.ts
│   │       ├── ordersService.ts
│   │       └── profileService.ts
│   ├── stores/               # Stores Zustand 🆕
│   │   ├── authStore.ts
│   │   └── cartStore.ts
│   ├── hooks/                # Hooks personnalisés 🆕
│   │   ├── useProducts.ts
│   │   ├── useCategories.ts
│   │   ├── useShops.ts
│   │   ├── useOrders.ts
│   │   └── useProfile.ts
│   ├── components/           # Composants React
│   ├── pages/                # Pages de l'application
│   └── App.tsx               # Point d'entrée
└── package.json
```

---

## 🔧 Configuration

### Variables d'environnement

Créer un fichier `.env` :

```env
# API Backend Django REST
VITE_API_BASE_URL=https://backend.buymore.ml

# Pour le développement local
# VITE_API_BASE_URL=http://localhost:8000
```

---

## 💡 Exemples de code

### Authentification

```typescript
import { useAuthStore } from './stores';

function LoginPage() {
  const { login, isLoading, error } = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      // Rediriger vers le dashboard
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input type="email" />
      <input type="password" />
      <button disabled={isLoading}>Connexion</button>
      {error && <p>{error}</p>}
    </form>
  );
}
```

### Afficher des produits

```typescript
import { useProducts } from './hooks';

function HomePage() {
  const { products, isLoading, error } = useProducts();

  if (isLoading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error}</div>;

  return (
    <div className="grid grid-cols-3 gap-4">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

### Gérer le panier

```typescript
import { useCartStore } from './stores';

function ProductCard({ product }) {
  const { addItem } = useCartStore();

  return (
    <div>
      <h3>{product.name}</h3>
      <p>{product.base_price} FCFA</p>
      <button onClick={() => addItem(product)}>
        Ajouter au panier
      </button>
    </div>
  );
}

function CartPage() {
  const { items, getTotal, removeItem } = useCartStore();

  return (
    <div>
      <h1>Panier ({items.length})</h1>
      {items.map(item => (
        <div key={item.product.id}>
          <span>{item.product.name} x {item.quantity}</span>
          <button onClick={() => removeItem(item.product.id)}>
            Supprimer
          </button>
        </div>
      ))}
      <p>Total: {getTotal()} FCFA</p>
    </div>
  );
}
```

---

## 🎯 Fonctionnalités disponibles

### ✅ Implémentées (services API)

- **Authentification** - Login, register, social auth, logout
- **Produits** - Liste, détail, recherche, filtres, pagination
- **Catégories** - Liste complète avec hiérarchie
- **Boutiques** - Liste, détail, mes boutiques (vendeur)
- **Commandes** - Création, liste, détail, gestion vendeur
- **Profil** - Affichage, modification, upload avatar, adresses
- **Panier** - Ajout, suppression, modification quantité, total

### 🚧 À intégrer dans les composants

Les services et hooks sont prêts, il faut maintenant :
1. Remplacer les appels Supabase par les nouveaux hooks
2. Mettre à jour les stores existants
3. Adapter les composants aux nouveaux types

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| **[MIGRATION_GUIDE.md](MIGRATION_GUIDE.md)** | Guide de migration Supabase → Django REST |
| **[README.md](README.md)** | Documentation principale |
| **[INSTALLATION.md](INSTALLATION.md)** | Guide d'installation détaillé |
| **[STRUCTURE.md](STRUCTURE.md)** | Structure du projet |

---

## 🔌 Services API disponibles

### authService
```typescript
import { authService } from './lib/api';

// Connexion
await authService.login({ identifier: 'user@example.com', password: 'pass' });

// Inscription
await authService.register({ username, email, password, ... });

// Déconnexion
await authService.logout();
```

### productsService
```typescript
import { productsService } from './lib/api';

// Liste avec filtres
await productsService.getProducts({ page: 1, category_id: 5, search: 'phone' });

// Détail
await productsService.getProduct(123);

// Mes produits (vendeur)
await productsService.getMyProducts();
```

### shopsService
```typescript
import { shopsService } from './lib/api';

// Liste des boutiques
await shopsService.getShops();

// Mes boutiques (vendeur)
await shopsService.getMyShops();

// Créer une boutique
await shopsService.createShop({ name, slug, description, ... });
```

### ordersService
```typescript
import { ordersService } from './lib/api';

// Mes commandes
await ordersService.getOrders();

// Créer une commande
await ordersService.createOrder({ shipping_address_id, items });

// Commandes vendeur
await ordersService.getVendorOrders();
```

### profileService
```typescript
import { profileService } from './lib/api';

// Mon profil
await profileService.getProfile();

// Upload avatar
await profileService.uploadAvatar(file);

// Mes adresses
await profileService.getAddresses();
```

---

## 🛠️ Commandes utiles

```bash
# Développement
pnpm dev              # Lance le serveur de dev (port 5173)

# Build
pnpm build            # Build pour la production
pnpm preview          # Preview du build

# Qualité du code
pnpm lint             # Lint le code
pnpm type-check       # Vérifier les types TypeScript

# Maintenance
pnpm clean            # Nettoyer node_modules et build
```

---

## 🎨 Stack technique

- **React 18** - Framework UI
- **TypeScript** - Typage statique
- **Vite** - Build tool ultra-rapide
- **TailwindCSS** - Framework CSS utility-first
- **Zustand** - State management léger
- **React Router** - Routing
- **Django REST API** - Backend

---

## 🐛 Débogage

### L'API ne répond pas

```bash
# Vérifier que le backend est accessible
curl https://backend.buymore.ml/api/products/

# Vérifier la configuration
echo $VITE_API_BASE_URL
```

### Erreur de CORS

Le backend Django doit autoriser l'origine du frontend dans `CORS_ALLOWED_ORIGINS`.

### Token expiré

Le store `authStore` gère automatiquement la déconnexion si le token est invalide.

---

## 🚀 Prochaines étapes

1. **Migrer les composants** - Remplacer Supabase par les nouveaux hooks
2. **Tester l'authentification** - Login, register, logout
3. **Tester le panier** - Ajout, suppression, commande
4. **Implémenter les dashboards** - Client et vendeur
5. **Optimiser les performances** - Lazy loading, cache

---

## 📞 Support

Pour toute question :
1. Consulter `MIGRATION_GUIDE.md`
2. Vérifier la documentation de l'API mobile
3. Contacter l'équipe de développement

---

**Dernière mise à jour** : 21 janvier 2026  
**Version** : 2.0.0

---

**Bon développement ! 🎉**
