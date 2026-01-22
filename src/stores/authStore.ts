/**
 * Store Zustand pour l'authentification
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService, type User } from '../lib/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: any) => Promise<boolean>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await authService.login({ email, password });
          
          if (response.error) {
            set({ error: response.error, isLoading: false });
            return false;
          }

          if (response.data) {
            // Créer un objet User à partir de la réponse
            const user: User = {
              id: response.data.user_id,
              username: response.data.username,
              email: response.data.email,
              is_seller: response.data.is_seller,
            };

            set({
              user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            return true;
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
            // Créer un objet User à partir de la réponse
            const user: User = {
              id: response.data.user_id,
              username: response.data.username,
              email: response.data.email,
              is_seller: response.data.is_seller,
            };

            set({
              user,
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
            error: null,
          });
        }
      },

      loadUser: async () => {
        if (!authService.isAuthenticated()) {
          set({ user: null, isAuthenticated: false });
          return;
        }

        set({ isLoading: true });

        try {
          const response = await authService.getCurrentUser();
          
          if (response.data) {
            set({
              user: response.data,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            // Token invalide, déconnecter
            await get().logout();
          }
        } catch (error) {
          await get().logout();
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
