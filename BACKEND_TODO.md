# Backend TODO - Endpoint /api/auth/me/

## Problème actuel
Le frontend web ne peut pas déterminer le rôle de l'utilisateur (super_admin, admin, vendor, client) car aucun endpoint n'expose les flags `is_superuser`, `is_staff`, `is_seller` et `role`.

## Solution requise
Créer un endpoint Django REST API qui retourne l'utilisateur courant avec tous ses attributs de rôle.

### Endpoint à créer
```
GET /api/auth/me/
```

### Headers requis
```
Authorization: Token <user_token>
```

### Réponse attendue (JSON)
```json
{
  "id": 5,
  "username": "superadmin",
  "email": "admin@buymore.ml",
  "first_name": "",
  "last_name": "",
  "phone": "",
  "is_seller": false,
  "is_superuser": true,
  "is_staff": true,
  "role": "super_admin"
}
```

### Champs obligatoires
- `id` (int): ID de l'utilisateur
- `username` (string): Nom d'utilisateur
- `email` (string): Email
- `is_superuser` (boolean): True si super admin
- `is_staff` (boolean): True si staff/admin
- `is_seller` (boolean): True si vendeur
- `role` (string, optionnel): "super_admin" | "admin" | "vendor" | "client"

### Champs optionnels
- `first_name` (string)
- `last_name` (string)
- `phone` (string)

## Implémentation Django suggérée

### 1. Créer une vue dans `views.py`
```python
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_user(request):
    user = request.user
    
    # Déterminer le rôle
    if user.is_superuser:
        role = 'super_admin'
    elif user.is_staff:
        role = 'admin'
    elif hasattr(user, 'is_seller') and user.is_seller:
        role = 'vendor'
    else:
        role = 'client'
    
    return Response({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'first_name': user.first_name or '',
        'last_name': user.last_name or '',
        'phone': getattr(user, 'phone', ''),
        'is_seller': getattr(user, 'is_seller', False),
        'is_superuser': user.is_superuser,
        'is_staff': user.is_staff,
        'role': role,
    })
```

### 2. Ajouter la route dans `urls.py`
```python
from django.urls import path
from . import views

urlpatterns = [
    # ... autres routes
    path('api/auth/me/', views.get_current_user, name='current_user'),
]
```

## Workaround temporaire côté frontend
En attendant l'implémentation backend, un workaround a été ajouté dans `authStore.ts` qui force le rôle `super_admin` pour les comptes suivants:
- username: "superadmin", "admin"
- email: "admin@buymore.ml"

**⚠️ Ce workaround doit être supprimé une fois l'endpoint backend créé.**

## Test de l'endpoint
Une fois implémenté, tester avec:
```bash
curl -H "Authorization: Token <votre_token>" https://backend.buymore.ml/api/auth/me/
```

## Endpoints alternatifs acceptés
Le frontend essaie également ces endpoints dans l'ordre:
1. `/api/auth/me/`
2. `/api/auth/user/`
3. `/dj-rest-auth/user/`
4. `/api/users/me/`

N'importe lequel de ces endpoints peut être implémenté, tant qu'il retourne les champs requis ci-dessus.
