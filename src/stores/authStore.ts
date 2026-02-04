/**
 * Store Zustand pour l'authentification
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService, apiClient, type User, type UserRole } from '../lib/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  role: UserRole | null;

  // Actions
  login: (identifier: string, password: string, method?: 'email' | 'phone') => Promise<boolean>;
  register: (data: any) => Promise<boolean>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  clearError: () => void;
  getRole: () => UserRole | null;
  hasRole: (role: UserRole) => boolean;
  isVendor: () => boolean;
  isAdmin: () => boolean;
  isSuperAdmin: () => boolean;
}

// Fonction pour traduire les messages d'erreur en français
const translateErrorMessage = (message: string): string => {
  const translations: Record<string, string> = {
    'Invalid credentials': 'Identifiants incorrects',
    'Invalid login credentials': 'Identifiants de connexion incorrects',
    'User not found': 'Utilisateur non trouvé',
    'Incorrect password': 'Mot de passe incorrect',
    'Email already exists': 'Cet email est déjà utilisé',
    'Phone already exists': 'Ce numéro de téléphone est déjà utilisé',
    'Invalid email': 'Email invalide',
    'Invalid phone': 'Numéro de téléphone invalide',
    'Password too short': 'Mot de passe trop court',
    'User already exists': 'Cet utilisateur existe déjà',
    'Database error': 'Erreur de base de données',
    'Failed to create user': 'Échec de la création de l\'utilisateur',
    'Failed to sign in': 'Échec de la connexion',
    'Network error': 'Erreur réseau',
    'Server error': 'Erreur serveur',
    'Unauthorized': 'Non autorisé',
    'Forbidden': 'Accès interdit',
    'Not found': 'Non trouvé',
  };

  // Chercher une correspondance exacte
  if (translations[message]) {
    return translations[message];
  }

  // Chercher une correspondance partielle
  for (const [key, value] of Object.entries(translations)) {
    if (message.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }

  // Retourner le message original s'il est déjà en français ou non traduit
  return message;
};

// Déterminer le rôle basé sur les données de l'utilisateur
// Hiérarchie: super_admin > admin > vendor > client
const determineRole = (user: User | any): UserRole => {
  // Logs pour debug
  console.log('Determining role for user:', user);

  // PRIORITÉ 1: Vérifier is_superuser en premier (le plus haut niveau)
  // Seuls les super admins ont is_superuser = true
  if (user.is_superuser === true) {
    console.log('User is SUPER_ADMIN (is_superuser=true)');
    return 'super_admin';
  }

  // PRIORITÉ 2: Vérifier is_staff pour les admins simples
  // Les admins ont is_staff = true mais is_superuser = false
  if (user.is_staff === true) {
    console.log('User is ADMIN (is_staff=true, is_superuser=false)');
    return 'admin';
  }

  // PRIORITÉ 3: Vérifier is_seller pour les vendeurs
  if (user.is_seller === true) {
    console.log('User is VENDOR (is_seller=true)');
    return 'vendor';
  }

  // Si user.role est défini explicitement, l'utiliser avec normalisation
  if (user.role) {
    const rawRole = user.role.toString().toLowerCase();
    console.log('User has explicit role:', rawRole);
    
    // Mapper les différentes valeurs possibles
    if (rawRole === 'super_admin' || rawRole === 'superuser' || rawRole === 'superadmin') {
      return 'super_admin';
    }
    if (rawRole === 'admin' || rawRole === 'staff') {
      return 'admin';
    }
    if (rawRole === 'vendor' || rawRole === 'seller' || rawRole === 'shop') {
      return 'vendor';
    }
    if (rawRole === 'client' || rawRole === 'customer' || rawRole === 'user') {
      return 'client';
    }
    // Si role est déjà un UserRole valide, le retourner
    if (['client', 'vendor', 'admin', 'super_admin'].includes(rawRole)) {
      return rawRole as UserRole;
    }
  }

  // Par défaut, c'est un client
  console.log('User is CLIENT (default)');
  return 'client';
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      role: null,

      login: async (identifier: string, password: string, method: 'email' | 'phone' = 'email') => {
        set({ isLoading: true, error: null });

        try {
          // Préparer les données de connexion selon la méthode
          const loginData = method === 'phone' 
            ? { phone: identifier, password } 
            : { email: identifier, password };
          const response = await authService.login(loginData);
          console.log('Login Response:', response);

          if (response.error) {
            let errorMsg = response.error;
            if (typeof response.error === 'object' && response.error !== null) {
              errorMsg = (response.error as any).message || (response.error as any).error || JSON.stringify(response.error);
            }
            // Traduire les messages d'erreur courants en français
            const translatedMsg = translateErrorMessage(String(errorMsg));
            set({ error: translatedMsg, isLoading: false });
            return false;
          }

          if (response.data) {
            const responseData = response.data as any;

            // 1. Extraire et stocker le token
            const token = responseData.token || responseData.access_token || responseData.key;
            if (token) {
              apiClient.setToken(token);
            } else {
              console.error('No token found in login response', responseData);
            }

            // 2. Traiter l'utilisateur
            let user = responseData.user;

            // Si user incomplet, tenter de récupérer via /me
            if (!user || (!user.role && !user.is_superuser)) {
              try {
                const meResponse = await authService.getCurrentUser();
                if (meResponse.data) user = meResponse.data;
              } catch (e) { console.warn('Failed to fetch /me after login', e); }
            }

            if (user) {
              if (!user.id && user.user_id) user.id = user.user_id;
              const role = determineRole(user);

              set({
                user: { ...user, role } as User,
                role,
                isAuthenticated: true,
                isLoading: false,
                error: null,
              });
              return true;
            }
          }

          set({ error: 'Réponse de connexion invalide', isLoading: false });
          return false;
        } catch (error: any) {
          console.error('Login error:', error);

          // Ensure error is a string
          let errorMessage = 'Erreur de connexion';
          if (typeof error === 'string') {
            errorMessage = error;
          } else if (error instanceof Error) {
            errorMessage = error.message;
          } else if (error && typeof error === 'object') {
            // Handle { message, code } objects
            errorMessage = error.message || error.error || JSON.stringify(error);
          }

          // Traduire les messages d'erreur
          const translatedMsg = translateErrorMessage(errorMessage);

          set({
            error: translatedMsg,
            isLoading: false,
          });
          return false;
        }
      },

      register: async (data: any) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.register(data);
          if (response.error) {
            let errorMsg = response.error;
            if (typeof response.error === 'object' && response.error !== null) {
              errorMsg = (response.error as any).message || (response.error as any).error || JSON.stringify(response.error);
            }
            // Traduire les messages d'erreur
            const translatedMsg = translateErrorMessage(String(errorMsg));
            set({ error: translatedMsg, isLoading: false });
            return false;
          }
          if (response.data) {
            // Au cas où le register renvoie aussi un token (auto-login)
            const responseData = response.data as any;
            const token = responseData.token || responseData.access_token;
            if (token) apiClient.setToken(token);

            // Extraire les données utilisateur (peut être dans response.data.user ou directement)
            const userFromResponse = responseData.user || responseData;
            const userData: any = {
              ...userFromResponse,
              id: userFromResponse.id || responseData.user_id,
            };
            const role = determineRole(userData);
            set({ user: { ...userData, role } as User, role, isAuthenticated: true, isLoading: false, error: null });
            return true;
          }
          // Si pas de data mais pas d'erreur non plus, considérer comme succès (compte créé)
          set({ isLoading: false, error: null });
          return true;
        } catch (error: any) {
          let errorMessage = "Erreur lors de l'inscription";
          if (typeof error === 'string') errorMessage = error;
          else if (error instanceof Error) errorMessage = error.message;
          else if (error && typeof error === 'object') errorMessage = (error as any).message || JSON.stringify(error);

          // Traduire les messages d'erreur
          const translatedMsg = translateErrorMessage(errorMessage);

          set({ error: translatedMsg, isLoading: false });
          return false;
        }
      },

      logout: async () => {
        try {
          await authService.logout();
        } catch (error) {
          console.error('Erreur lors de la déconnexion:', error);
        } finally {
          set({
            user: null,
            isAuthenticated: false,
            role: null,
            error: null,
          });
          localStorage.removeItem('auth-storage'); // Nettoyer aussi le persist zustand si nécessaire
        }
      },

      loadUser: async () => {
        if (!authService.isAuthenticated()) {
          set({ user: null, isAuthenticated: false, role: null });
          return;
        }

        set({ isLoading: true });

        try {
          const response = await authService.getCurrentUser();

          // Si 401 Unauthorized, le token est invalide -> Logout
          if (response.status === 401) {
            console.warn('Token invalide (401), déconnexion forcée.');
            await get().logout();
            return;
          }

          if (response.data) {
            // Si l'API ne retourne pas explicitement le rôle/flags, conserver ceux déjà stockés
            const mergedUser: any = {
              ...response.data,
              is_superuser: (response.data as any).is_superuser ?? (get().user as any)?.is_superuser,
              is_staff: (response.data as any).is_staff ?? (get().user as any)?.is_staff,
              is_seller: (response.data as any).is_seller ?? (get().user as any)?.is_seller,
              permissions: (response.data as any).permissions ?? (get().user as any)?.permissions ?? [],
              role: (response.data as any).role ?? get().role,
            }
            const role = determineRole(mergedUser)
            console.log('User permissions loaded:', mergedUser.permissions)
            set({
              user: { ...mergedUser, role } as User,
              role,
              isAuthenticated: true,
              isLoading: false,
            })
          } else {
            // Si erreur autre que 401, mais on a un token
            // On garde l'état actuel mais on arrête le loading
            set({ isLoading: false });
          }
        } catch (error) {
          // Erreur réseau ou autre
          console.error('Erreur loadUser:', error);
          set({ isLoading: false });
        }
      },

      clearError: () => set({ error: null }),

      getRole: () => get().role,

      hasRole: (role: UserRole) => get().role === role,

      isVendor: () => get().role === 'vendor',

      isAdmin: () => get().role === 'admin',

      isSuperAdmin: () => get().role === 'super_admin',
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        role: state.role,
      }),
    }
  )
);
