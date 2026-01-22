# API Design - BuyMore

## Architecture

L'API BuyMore utilise **Supabase** comme backend, combinant:
- **PostgREST** pour les opérations CRUD automatiques
- **Edge Functions** pour la logique métier complexe
- **Row Level Security (RLS)** pour la sécurité

## Authentification

Toutes les requêtes authentifiées doivent inclure le token JWT:

```http
Authorization: Bearer <supabase_jwt_token>
```

## Endpoints PostgREST

### Users

#### GET /rest/v1/users
Récupérer les utilisateurs

**Query params:**
- `id=eq.<uuid>` - Filtrer par ID
- `role=eq.<role>` - Filtrer par rôle
- `select=*` - Colonnes à récupérer

**Response:**
```json
[
  {
    "id": "uuid",
    "role": "customer",
    "full_name": "Jean Dupont",
    "phone": "+223...",
    "avatar_url": "https://...",
    "created_at": "2025-01-01T00:00:00Z"
  }
]
```

#### PATCH /rest/v1/users
Mettre à jour un utilisateur

**Body:**
```json
{
  "full_name": "Nouveau nom",
  "phone": "+223...",
  "avatar_url": "https://..."
}
```

### Shops

#### GET /rest/v1/shops
Liste des boutiques

**Query params:**
- `status=eq.approved` - Boutiques approuvées
- `owner_id=eq.<uuid>` - Boutiques d'un vendeur
- `select=*,owner:users(full_name)` - Avec relations

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Ma Boutique",
    "slug": "ma-boutique",
    "description": "...",
    "logo_url": "https://...",
    "status": "approved",
    "city": "Bamako",
    "owner": {
      "full_name": "Vendeur"
    }
  }
]
```

#### POST /rest/v1/shops
Créer une boutique

**Body:**
```json
{
  "name": "Ma Boutique",
  "slug": "ma-boutique",
  "description": "Description",
  "city": "Bamako",
  "country": "Mali"
}
```

**Response:** `201 Created`

#### PATCH /rest/v1/shops?id=eq.<uuid>
Mettre à jour une boutique

**Body:**
```json
{
  "name": "Nouveau nom",
  "description": "Nouvelle description"
}
```

### Products

#### GET /rest/v1/products
Liste des produits

**Query params:**
- `shop_id=eq.<uuid>` - Produits d'une boutique
- `category_id=eq.<uuid>` - Produits d'une catégorie
- `is_active=eq.true` - Produits actifs
- `name=ilike.*search*` - Recherche
- `select=*,shop:shops(*),images:product_images(*)` - Avec relations

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "iPhone 15",
    "slug": "iphone-15",
    "price": 500000,
    "currency": "XOF",
    "stock_quantity": 10,
    "shop": {
      "name": "Tech Store"
    },
    "images": [
      {
        "image_url": "https://...",
        "position": 1
      }
    ]
  }
]
```

#### POST /rest/v1/products
Créer un produit

**Body:**
```json
{
  "shop_id": "uuid",
  "category_id": "uuid",
  "name": "Produit",
  "slug": "produit",
  "description": "...",
  "price": 10000,
  "currency": "XOF",
  "stock_quantity": 50
}
```

### Categories

#### GET /rest/v1/categories
Liste des catégories

**Query params:**
- `parent_id=is.null` - Catégories racines
- `parent_id=eq.<uuid>` - Sous-catégories

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Électronique",
    "slug": "electronique",
    "icon": "smartphone",
    "parent_id": null
  }
]
```

### Orders

#### GET /rest/v1/orders
Liste des commandes

**Query params:**
- `customer_id=eq.<uuid>` - Commandes d'un client
- `status=eq.pending` - Filtrer par statut
- `select=*,items:order_items(*)` - Avec items

**Response:**
```json
[
  {
    "id": "uuid",
    "customer_id": "uuid",
    "status": "pending",
    "total_amount": 50000,
    "currency": "XOF",
    "payment_status": "unpaid",
    "created_at": "2025-01-01T00:00:00Z",
    "items": [
      {
        "product_id": "uuid",
        "quantity": 2,
        "unit_price": 25000
      }
    ]
  }
]
```

## Edge Functions

### POST /functions/v1/create-order
Créer une commande (avec validation et gestion du stock)

**Headers:**
```http
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "items": [
    {
      "product_id": "uuid",
      "quantity": 2
    }
  ],
  "currency": "XOF"
}
```

**Response:**
```json
{
  "order": {
    "id": "uuid",
    "customer_id": "uuid",
    "total_amount": 50000,
    "status": "pending",
    "payment_status": "unpaid"
  }
}
```

**Errors:**
- `401` - Non authentifié
- `400` - Validation échouée
- `500` - Erreur serveur

### POST /functions/v1/signup-vendor
Inscription vendeur avec création de boutique

**Body:**
```json
{
  "email": "vendor@example.com",
  "password": "password",
  "full_name": "Vendeur",
  "shop_name": "Ma Boutique",
  "shop_slug": "ma-boutique"
}
```

## Filtres PostgREST

### Opérateurs

- `eq` - Égal
- `neq` - Différent
- `gt` - Plus grand que
- `gte` - Plus grand ou égal
- `lt` - Plus petit que
- `lte` - Plus petit ou égal
- `like` - LIKE SQL
- `ilike` - LIKE insensible à la casse
- `is` - IS NULL
- `in` - IN (liste)

### Exemples

```http
# Produits entre 10000 et 50000 XOF
GET /rest/v1/products?price=gte.10000&price=lte.50000

# Boutiques à Bamako ou Dakar
GET /rest/v1/shops?city=in.(Bamako,Dakar)

# Recherche insensible à la casse
GET /rest/v1/products?name=ilike.*phone*
```

## Pagination

```http
GET /rest/v1/products?limit=20&offset=0
Range: 0-19

# Response headers
Content-Range: 0-19/100
```

## Tri

```http
GET /rest/v1/products?order=created_at.desc
GET /rest/v1/products?order=price.asc,name.asc
```

## Sélection de colonnes

```http
# Colonnes spécifiques
GET /rest/v1/products?select=id,name,price

# Avec relations
GET /rest/v1/products?select=*,shop:shops(name,city)

# Relations imbriquées
GET /rest/v1/orders?select=*,items:order_items(*,product:products(name))
```

## Codes d'erreur

| Code | Description |
|------|-------------|
| 200 | Succès |
| 201 | Créé |
| 204 | Pas de contenu |
| 400 | Requête invalide |
| 401 | Non authentifié |
| 403 | Interdit (RLS) |
| 404 | Non trouvé |
| 409 | Conflit (contrainte unique) |
| 500 | Erreur serveur |

## Rate Limiting

Supabase applique des limites par défaut:
- **Anonymous**: 100 req/min
- **Authenticated**: 1000 req/min

## Webhooks (Future)

Pour les événements asynchrones:
- `order.created`
- `order.paid`
- `shop.approved`
- `product.out_of_stock`
