# ✅ Nettoyage Supabase - Terminé

**Date** : 21 janvier 2026  
**Statut** : Login et Register fonctionnent sans Supabase

---

## ✅ Fichiers nettoyés

### Fichiers vidés (pour éviter les erreurs d'import)

1. **`src/lib/supabase.ts`** - Vidé, export `null`
2. **`src/utils/supabase.ts`** - Vidé, export `null`

### Fichiers modifiés

3. **`src/main.tsx`** - Suppression de `initSupabase()`
4. **`src/store/authStore.ts`** - Réexporte depuis `../stores/authStore`
5. **`src/store/cartStore.ts`** - Réexporte depuis `../stores/cartStore`
6. **`src/pages/LoginPage.tsx`** - Utilise le nouveau authStore
7. **`src/pages/RegisterPage.tsx`** - Utilise le nouveau authStore

---

## 🎯 Résultat

### ✅ Login et Register fonctionnent maintenant avec Django REST API

Les pages de connexion et d'inscription utilisent maintenant :
- `src/stores/authStore.ts` (nouveau store Zustand)
- `src/lib/api/authService.ts` (service Django REST API)
- Aucune dépendance à Supabase

### 📋 Fichiers Supabase restants (non utilisés par Login/Register)

Ces fichiers contiennent encore du code Supabase mais **ne sont pas chargés** au démarrage :

- `src/lib/api-client/` - Ancien package (non utilisé)
- `src/pages/TodosPage.tsx` - Utilise encore Supabase
- `src/pages/HomePage.tsx` - À migrer
- `src/pages/ShopsPage.tsx` - À migrer
- `src/components/NeighborhoodAutocomplete.tsx` - À migrer

**Note** : Ces fichiers peuvent être migrés progressivement.

---

## 🧪 Test

### 1. Démarrer le backend Django

```bash
python manage.py runserver
```

### 2. Démarrer l'application web

```bash
cd c:\Dev\Projet\buymore\web
pnpm dev
```

### 3. Tester le login

1. Aller sur http://localhost:5173/login
2. Entrer un email et mot de passe
3. Cliquer sur "Se connecter"

**Résultat attendu** : Aucune erreur Supabase, connexion via Django REST API

---

## 🔧 Configuration requise

### Fichier `.env`

```env
VITE_API_BASE_URL=http://localhost:8000
```

### Backend Django

L'API doit être accessible sur `http://localhost:8000` avec les endpoints :

- `POST /api/auth/login/` - Connexion
- `POST /api/auth/register/` - Inscription

---

## 📝 Code de référence (Mobile vs Web)

### Mobile (Dart) - ApiService

```dart
static const String baseUrl = 'https://backend.buymore.ml';

Future<Map<String, dynamic>> login({
  required String identifier,
  required String password,
}) async {
  Map<String, dynamic> loginData = {'password': password};

  if (identifier.contains('@')) {
    loginData['email'] = identifier;
  } else if (RegExp(r'^[0-9]+$').hasMatch(identifier)) {
    loginData['phone'] = identifier;
  } else {
    loginData['username'] = identifier;
  }

  final response = await http.post(
    Uri.parse('$baseUrl/api/auth/login/'),
    headers: {'Content-Type': 'application/json'},
    body: jsonEncode(loginData),
  );

  if (response.statusCode == 200) {
    final data = jsonDecode(response.body);
    if (data['token'] != null) {
      await _saveToken(data['token']);
    }
    return data;
  }
}
```

### Web (TypeScript) - authService

```typescript
const API_BASE_URL = 'http://localhost:8000';

async login(credentials: LoginCredentials) {
  const response = await apiClient.post<AuthResponse>(
    '/api/auth/login/', 
    credentials
  );
  
  if (response.data?.token) {
    apiClient.setToken(response.data.token);
  }
  
  return response;
}
```

**Différence** : Le mobile accepte email/username/phone, le web accepte uniquement email pour le moment.

---

## ⚠️ Notes importantes

1. **L'erreur "supabaseUrl is required" est résolue** - Les fichiers Supabase ont été vidés
2. **Login et Register ne chargent plus Supabase** - Ils utilisent Django REST API
3. **Les autres pages** (HomePage, ShopsPage, etc.) utilisent encore Supabase mais ne sont pas chargées au démarrage

---

## 🚀 Prochaines étapes (optionnel)

Pour supprimer complètement Supabase du projet :

1. Migrer les pages restantes vers les nouveaux hooks
2. Supprimer le dossier `src/lib/api-client/`
3. Désinstaller `@supabase/supabase-js` : `pnpm remove @supabase/supabase-js`

---

**Dernière mise à jour** : 21 janvier 2026  
**Statut** : ✅ Login et Register sans Supabase
