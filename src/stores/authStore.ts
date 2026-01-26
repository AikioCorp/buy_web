/**
 * Store Zustand pour l'authentification
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService, type User, type UserRole } from '../lib/api';

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
  // Si user.role est défini, l'utiliser
  if (user.role) {
    return user.role;
  }

  // Vérifier is_superuser pour super admin
  if (user.is_superuser) {
    return 'super_admin';
  }

  // Vérifier is_staff pour admin
  if (user.is_staff) {
    return 'admin';
  }

  // Sinon, déduire du statut is_seller
  if (user.is_seller) {
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
          // L'API attend 'email' et 'password'
          const response = await authService.login({ email, password });

          if (response.error) {
            set({ error: response.error, isLoading: false });
            return false;
          }

          if (response.data) {
            // Après connexion, tenter de récupérer l'utilisateur courant (avec rôle) depuis l'API
            const me = await authService.getCurrentUser()

            if (me.data) {
              const role = determineRole(me.data)
              set({
                user: me.data,
                role,
                isAuthenticated: true,
                isLoading: false,
                error: null,
              })
              return true
            }

            // Fallback: si l'endpoint /me n'est pas dispo, dériver depuis la réponse de login
            const userData = {
              id: response.data.user_id,
              username: response.data.username,
              email: response.data.email,
              is_seller: response.data.is_seller,
              is_superuser: (response.data as any).is_superuser,
              is_staff: (response.data as any).is_staff,
              role: (response.data as any).role,
            }

            const role = determineRole(userData)
            set({
              user: { ...userData, role } as User,
              role,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            })
            return true
          }

          return false;
        } catch (error) {
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
            // Créer un objet User à partir de la réponse avec tous les champs
            const userData = {
              id: response.data.user_id,
              username: response.data.username,
              email: response.data.email,
              is_seller: response.data.is_seller,
              is_superuser: response.data.is_superuser,
              is_staff: response.data.is_staff,
              role: response.data.role,
            };

            const role = determineRole(userData);
            
            const user: User = {
              ...userData,
              role,
            };

            set({
              user,
              role,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            return true;
          }

          return false;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Erreur d\'inscription',
            isLoading: false,
          });
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
            // Échec silencieux: conserver l'état existant si le token est présent
            set({ isLoading: false, isAuthenticated: true })
          }
        } catch (error) {
          // Ne pas déconnecter brutalement si l'endpoint /me n'existe pas
          set({ isLoading: false, isAuthenticated: true })
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
