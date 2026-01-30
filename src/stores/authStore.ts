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
  login: (email: string, password: string) => Promise<boolean>;
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

// Déterminer le rôle basé sur les données de l'utilisateur
const determineRole = (user: User | any): UserRole => {
  // Logs pour debug
  console.log('Determining role for user:', user);

  // Si user.role est défini, l'utiliser avec normalisation
  if (user.role) {
    const rawRole = user.role.toString().toLowerCase();
    if (rawRole === 'super_admin' || rawRole === 'admin' || rawRole === 'superuser') return 'super_admin'; // Simplification: tout admin est super_admin pour l'instant
    if (rawRole === 'vendor' || rawRole === 'seller' || rawRole === 'shop') return 'vendor';
    if (rawRole === 'client' || rawRole === 'customer') return 'client';
    // Si role est déjà un UserRole valide, le retourner
    if (['client', 'vendor', 'admin', 'super_admin'].includes(rawRole)) return rawRole as UserRole;
  }

  // Vérifier is_superuser, isAdmin, etc.
  if (user.is_superuser || user.isAdmin || user.is_admin) {
    return 'super_admin';
  }

  // Vérifier is_staff pour admin
  if (user.is_staff || user.isStaff) {
    return 'admin';
  }

  // Sinon, déduire du statut is_seller
  if (user.is_seller || user.isSeller) {
    return 'vendor';
  }

  // Par défaut, c'est un client
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

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });

        try {
          const response = await authService.login({ email, password });
          console.log('Login Response:', response);

          if (response.error) {
            set({ error: response.error, isLoading: false });
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
        } catch (error) {
          console.error('Login error:', error);
          set({
            error: error instanceof Error ? error.message : 'Erreur de connexion',
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
            set({ error: response.error, isLoading: false });
            return false;
          }
          if (response.data) {
            // Au cas où le register renvoie aussi un token (auto-login)
            const responseData = response.data as any;
            const token = responseData.token || responseData.access_token;
            if (token) apiClient.setToken(token);

            const userData: any = {
              ...response.data,
              id: response.data.user_id,
            };
            const role = determineRole(userData);
            set({ user: { ...userData, role } as User, role, isAuthenticated: true, isLoading: false, error: null });
            return true;
          }
          return false;
        } catch (error) {
          set({ error: error instanceof Error ? error.message : "Erreur", isLoading: false });
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
              role: (response.data as any).role ?? get().role,
            }
            const role = determineRole(mergedUser)
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
