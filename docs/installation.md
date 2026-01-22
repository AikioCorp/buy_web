# Guide d'installation - BuyMore Monorepo

## Prérequis

- **Node.js** 18+ ([télécharger](https://nodejs.org/))
- **pnpm** 8+ : `npm install -g pnpm`
- **Compte Supabase** gratuit sur [supabase.com](https://supabase.com)
- **Git** pour le contrôle de version

## 1. Installation initiale

```bash
# Cloner le projet
git clone <votre-repo-url>
cd buymore

# Installer toutes les dépendances du monorepo
pnpm install
```

Cette commande installera automatiquement les dépendances pour :
- Les packages partagés (`@buymore/ui`, `@buymore/api-client`)
- L'application mobile (`apps/mobile`)
- Les futures applications web et admin

## 2. Configuration Supabase

### 2.1 Créer un projet Supabase

1. Aller sur [supabase.com](https://supabase.com)
2. Créer un nouveau projet
3. Noter les informations suivantes :
   - **Project URL** : `https://xxxxx.supabase.co`
   - **Anon Key** : Clé publique (dans Settings > API)
   - **Service Role Key** : Clé privée (dans Settings > API)

### 2.2 Exécuter les migrations

Dans le dashboard Supabase, aller dans **SQL Editor** et exécuter dans l'ordre :

1. **`supabase/migrations/001_initial_schema.sql`**
   - Crée toutes les tables (users, shops, products, orders, etc.)
   - Configure les triggers et fonctions

2. **`supabase/migrations/002_rls_policies.sql`**
   - Active Row Level Security sur toutes les tables
   - Définit les politiques d'accès par rôle

3. **`supabase/migrations/003_seed_data.sql`**
   - Insère les catégories de base

4. **Politiques RLS individuelles** (optionnel, déjà dans 002) :
   - `supabase/policies/001_users_policies.sql`
   - `supabase/policies/002_shops_policies.sql`
   - `supabase/policies/003_products_policies.sql`
   - `supabase/policies/004_orders_policies.sql`

5. **Données de test** (optionnel) :
   - `supabase/seed/001_test_data.sql`

### 2.3 Configurer le Storage

Dans Supabase Dashboard > Storage :

1. Créer un bucket `products` (public)
2. Créer un bucket `avatars` (public)
3. Créer un bucket `shops` (public)

Politiques de storage à ajouter :
```sql
-- Permettre lecture publique
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id IN ('products', 'avatars', 'shops'));

-- Permettre upload authentifié
CREATE POLICY "Authenticated upload"
ON storage.objects FOR INSERT
WITH CHECK (auth.role() = 'authenticated');
```

## 3. Configuration des applications

### 3.1 Application Mobile (Expo)

```bash
cd apps/mobile

# Créer le fichier .env
cat > .env << EOF
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=votre_anon_key
EOF
```

### 3.2 Application Web (à créer)

```bash
cd apps

# Créer l'app web avec Vite
pnpm create vite web --template react-ts

cd web

# Installer les dépendances
pnpm add @supabase/supabase-js react-router-dom zustand
pnpm add -D tailwindcss postcss autoprefixer
pnpm add @buymore/ui @buymore/api-client

# Créer le fichier .env
cat > .env << EOF
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=votre_anon_key
EOF
```

### 3.3 Application Admin (à créer)

```bash
cd apps

# Créer l'app admin avec Next.js
pnpm create next-app admin --typescript --tailwind --app

cd admin

# Installer les dépendances
pnpm add @supabase/supabase-js zustand
pnpm add @buymore/ui @buymore/api-client

# Créer le fichier .env.local
cat > .env.local << EOF
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_anon_key
EOF
```

## 4. Initialiser Supabase dans les apps

### Dans apps/web/src/main.tsx (ou index.tsx)

```typescript
import { initSupabase } from '@buymore/api-client'

// Initialiser Supabase au démarrage
initSupabase(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

### Dans apps/admin/app/layout.tsx

```typescript
'use client'
import { useEffect } from 'react'
import { initSupabase } from '@buymore/api-client'

export default function RootLayout({ children }) {
  useEffect(() => {
    initSupabase(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }, [])

  return <html><body>{children}</body></html>
}
```

### Dans apps/mobile/App.tsx

```typescript
import { useEffect } from 'react'
import { initSupabase } from '@buymore/api-client'
import Constants from 'expo-constants'

export default function App() {
  useEffect(() => {
    initSupabase(
      Constants.expoConfig?.extra?.supabaseUrl,
      Constants.expoConfig?.extra?.supabaseAnonKey
    )
  }, [])

  return <View>...</View>
}
```

## 5. Démarrer le développement

```bash
# À la racine du monorepo

# Démarrer toutes les apps
pnpm dev

# Ou individuellement
pnpm dev:web      # http://localhost:5173
pnpm dev:admin    # http://localhost:3000
pnpm dev:mobile   # Expo DevTools
```

## 6. Déployer les Edge Functions

```bash
# Installer Supabase CLI
npm install -g supabase

# Se connecter
supabase login

# Lier le projet
supabase link --project-ref votre-project-ref

# Déployer les fonctions
supabase functions deploy create-order
```

## 7. Tester l'installation

### Créer un utilisateur test

Dans Supabase Dashboard > Authentication > Users :
1. Créer un utilisateur manuellement
2. Aller dans SQL Editor et exécuter :

```sql
-- Créer le profil utilisateur
INSERT INTO users (id, role, full_name)
VALUES ('user-uuid-from-auth', 'customer', 'Test User');
```

### Tester l'authentification

```typescript
import { useAuthStore } from '@buymore/api-client'

function LoginTest() {
  const { signIn } = useAuthStore()
  
  const handleLogin = async () => {
    await signIn('test@example.com', 'password')
  }
  
  return <button onClick={handleLogin}>Login</button>
}
```

## 8. Résolution des problèmes courants

### Erreur : "Cannot find module '@buymore/ui'"

```bash
# Réinstaller les dépendances
pnpm install

# Vérifier les workspaces
pnpm list --depth 0
```

### Erreur : "Supabase client not initialized"

Assurez-vous d'appeler `initSupabase()` avant d'utiliser les hooks ou stores.

### Erreur RLS : "new row violates row-level security policy"

Vérifiez que :
1. L'utilisateur est authentifié
2. Les politiques RLS sont bien appliquées
3. Le rôle de l'utilisateur est correct dans la table `users`

### Erreur CORS dans les Edge Functions

Vérifiez que les headers CORS sont bien configurés dans la fonction.

## 9. Structure des variables d'environnement

### apps/mobile/.env
```env
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

### apps/web/.env
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

### apps/admin/.env.local
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

## 10. Prochaines étapes

1. ✅ Configurer TailwindCSS dans web et admin
2. ✅ Migrer les composants existants vers `@buymore/ui`
3. ✅ Créer les pages principales (Home, Products, Cart, etc.)
4. ✅ Implémenter l'authentification complète
5. ✅ Créer le dashboard vendeur
6. ✅ Créer le dashboard admin
7. ✅ Tester les flux complets (commande, paiement, etc.)

## Support

Pour toute question :
- Consultez la [documentation](./architecture.md)
- Vérifiez les [exemples d'API](./api-design.md)
- Consultez le [modèle de données](./data-model.md)
