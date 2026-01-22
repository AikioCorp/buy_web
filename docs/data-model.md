# Modèle de données BuyMore

## Tables principales

### users
Profils utilisateurs étendus (lié à auth.users)

| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID (PK) | Référence à auth.users.id |
| role | TEXT | customer \| vendor \| admin |
| full_name | TEXT | Nom complet |
| phone | TEXT | Numéro de téléphone |
| avatar_url | TEXT | URL de l'avatar |
| created_at | TIMESTAMP | Date de création |

### shops
Boutiques des vendeurs

| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID (PK) | Identifiant |
| owner_id | UUID (FK) | Référence à users.id |
| name | TEXT | Nom de la boutique |
| slug | TEXT (UNIQUE) | Identifiant URL |
| description | TEXT | Description |
| logo_url | TEXT | URL du logo |
| cover_url | TEXT | URL de la couverture |
| status | TEXT | pending \| approved \| blocked |
| address | TEXT | Adresse physique |
| city | TEXT | Ville |
| country | TEXT | Pays |
| created_at | TIMESTAMP | Date de création |
| updated_at | TIMESTAMP | Dernière modification |

### categories
Catégories de produits (hiérarchiques)

| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID (PK) | Identifiant |
| name | TEXT | Nom de la catégorie |
| slug | TEXT (UNIQUE) | Identifiant URL |
| parent_id | UUID (FK) | Catégorie parente |
| icon | TEXT | Nom de l'icône |
| created_at | TIMESTAMP | Date de création |

### products
Produits vendus

| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID (PK) | Identifiant |
| shop_id | UUID (FK) | Référence à shops.id |
| category_id | UUID (FK) | Référence à categories.id |
| name | TEXT | Nom du produit |
| slug | TEXT (UNIQUE) | Identifiant URL |
| description | TEXT | Description |
| price | NUMERIC | Prix unitaire |
| currency | TEXT | Code devise (XOF) |
| stock_quantity | INTEGER | Quantité en stock |
| is_active | BOOLEAN | Produit actif/visible |
| created_at | TIMESTAMP | Date de création |
| updated_at | TIMESTAMP | Dernière modification |

### product_images
Images des produits

| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID (PK) | Identifiant |
| product_id | UUID (FK) | Référence à products.id |
| image_url | TEXT | URL de l'image |
| position | INTEGER | Ordre d'affichage |
| created_at | TIMESTAMP | Date de création |

### orders
Commandes clients

| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID (PK) | Identifiant |
| customer_id | UUID (FK) | Référence à users.id |
| status | TEXT | pending \| paid \| shipped \| delivered \| cancelled |
| total_amount | NUMERIC | Montant total |
| currency | TEXT | Code devise |
| payment_status | TEXT | unpaid \| paid \| refunded |
| created_at | TIMESTAMP | Date de création |
| updated_at | TIMESTAMP | Dernière modification |

### order_items
Détails des commandes

| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID (PK) | Identifiant |
| order_id | UUID (FK) | Référence à orders.id |
| product_id | UUID (FK) | Référence à products.id |
| shop_id | UUID (FK) | Référence à shops.id |
| unit_price | NUMERIC | Prix unitaire (snapshot) |
| quantity | INTEGER | Quantité commandée |
| created_at | TIMESTAMP | Date de création |

## Relations

```
users (1) ──< (N) shops
shops (1) ──< (N) products
categories (1) ──< (N) products
categories (1) ──< (N) categories (hiérarchie)
products (1) ──< (N) product_images
users (1) ──< (N) orders
orders (1) ──< (N) order_items
products (1) ──< (N) order_items
shops (1) ──< (N) order_items
```

## Indexes

### Performance
- `idx_users_role` sur users(role)
- `idx_shops_owner` sur shops(owner_id)
- `idx_shops_status` sur shops(status)
- `idx_products_shop` sur products(shop_id)
- `idx_products_category` sur products(category_id)
- `idx_products_active` sur products(is_active)
- `idx_orders_customer` sur orders(customer_id)
- `idx_orders_status` sur orders(status)

### Unicité
- `categories.slug` UNIQUE
- `shops.slug` UNIQUE
- `products.slug` UNIQUE

## Triggers

### update_updated_at
Mise à jour automatique du champ `updated_at` sur:
- shops
- products
- orders

## Extensions futures

### Phase 2
- `shop_reviews` - Avis sur les boutiques
- `product_reviews` - Avis sur les produits
- `addresses` - Adresses de livraison
- `payments` - Détails des paiements
- `payouts` - Reversements aux vendeurs

### Phase 3
- `wishlists` - Listes de souhaits
- `coupons` - Codes promo
- `notifications` - Notifications push
- `messages` - Chat vendeur-client
