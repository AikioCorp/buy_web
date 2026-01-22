# Guide d'installation - BuyMore Marketplace

## Prérequis

- **Node.js** 18+ et npm
- **Compte Supabase** (gratuit sur https://supabase.com)
- **Git** (optionnel)

## Étape 1 : Configuration de Supabase

### 1.1 Créer un projet Supabase

1. Allez sur https://supabase.com et créez un compte
2. Créez un nouveau projet
3. Notez les informations suivantes :
   - Project URL
   - Anon/Public Key
   - Service Role Key (dans Project Settings > API)

### 1.2 Exécuter les migrations

1. Dans votre projet Supabase, allez dans **SQL Editor**
2. Exécutez les fichiers SQL dans l'ordre :
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_rls_policies.sql`
   - `supabase/migrations/003_seed_data.sql`

### 1.3 Configurer le Storage (optionnel)

1. Allez dans **Storage** dans le dashboard Supabase
2. Créez les buckets suivants :
   - `avatars` (public)
   - `shop-logos` (public)
   - `shop-covers` (public)
   - `product-images` (public)

## Étape 2 : Configuration du Frontend

```bash
cd web
npm install
```

Créez le fichier `.env` :

```bash
cp .env.example .env
```

Éditez `.env` avec vos informations :

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-anon-key
VITE_API_URL=http://localhost:3001
```

Démarrez l'application web :

```bash
npm run dev
```

L'application démarre sur http://localhost:5173

## Étape 4 : Créer le premier utilisateur admin

### Option 1 : Via l'interface

1. Allez sur http://localhost:5173/register
2. Créez un compte avec le rôle "Vendeur" ou "Client"

### Option 2 : Via Supabase Dashboard

1. Allez dans **Authentication** > **Users**
2. Créez un utilisateur
3. Dans **Table Editor** > **users**, ajoutez une ligne avec :
   - `id` : l'UUID de l'utilisateur créé
   - `role` : `admin`
   - `full_name` : votre nom
   - `created_at` : date actuelle

## Étape 5 : Test de l'application

### Créer une boutique (vendeur)

1. Connectez-vous avec un compte vendeur
2. Allez dans "Mes Boutiques"
3. Créez une nouvelle boutique
4. En tant qu'admin, approuvez la boutique dans le dashboard admin

### Ajouter des produits

1. Dans votre boutique, ajoutez des produits
2. Les produits seront visibles sur la page d'accueil

### Passer une commande (client)

1. Connectez-vous avec un compte client
2. Parcourez les produits
3. Ajoutez au panier
4. Passez la commande

## Structure des URLs

- **Application Web** : http://localhost:5173
  - `/` - Page d'accueil
  - `/shops` - Liste des boutiques
  - `/shops/:id` - Détail d'une boutique
  - `/products/:id` - Détail d'un produit
  - `/cart` - Panier
  - `/login` - Connexion
  - `/register` - Inscription
  - `/dashboard` - Dashboard client
  - `/vendor/shops` - Gestion boutiques (vendeur)
  - `/admin` - Dashboard admin

## Dépannage

### Erreur de connexion à Supabase

- Vérifiez que les URLs et clés sont correctes dans les fichiers `.env`
- Assurez-vous que les migrations SQL ont été exécutées


### Erreur de permissions

- Vérifiez que les politiques RLS ont été correctement créées
- Vérifiez le rôle de l'utilisateur dans la table `users`

### Port déjà utilisé

- Changez le port dans `web/vite.config.ts`

## Production

### Build du frontend

```bash
cd web
npm run build
```

Les fichiers de production seront dans `web/dist/`

### Variables d'environnement de production

N'oubliez pas de mettre à jour :
- Les URLs de production Supabase
- Les clés API sécurisées

## Support

Pour toute question ou problème, consultez :
- Documentation Supabase : https://supabase.com/docs
- Documentation React : https://react.dev
- Documentation Vite : https://vitejs.dev
