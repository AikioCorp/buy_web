/**
 * Service d'authentification
 */

import { apiClient } from './apiClient';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone: string;
  is_seller?: boolean;
  store_name?: string;
  store_description?: string;
}

export interface AuthResponse {
  access_token: string;
  user_id: number;
  customer_id: number;
  username: string;
  email: string;
  is_seller?: boolean;
  is_superuser?: boolean;
  is_staff?: boolean;
  role?: UserRole;
  store?: {
    id: number;
    name: string;
    slug: string;
    description?: string;
  };
}

export type UserRole = 'client' | 'vendor' | 'admin' | 'super_admin';

export interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  is_seller?: boolean;
  is_superuser?: boolean;
  is_staff?: boolean;
  role?: UserRole;
}

export const authService = {
  /**
   * Connexion avec email et mot de passe
   */
  async login(credentials: LoginCredentials) {
    const response = await apiClient.post<any>('/api/auth/login', credentials);

    // Support des deux formats de token (Node.js API vs Standard)
    const token = response.data?.access_token || response.data?.token;

    if (token) {
      apiClient.setToken(token);
    }

    // Si la réponse contient un objet 'user' imbriqué (format Node.js probable), on normalise
    if (response.data?.user) {
      // On retourne une structure hybride pour compatibilité
      response.data = {
        ...response.data,
        ...response.data.user, // Étale les propriétés de user à la racine
        access_token: token,
        user_id: response.data.user.id, // Assure la compatibilité avec le code existant qui cherche user_id
      };
    }

    return response;
  },

  /**
   * Inscription
   */
  async register(data: RegisterData) {
    const response = await apiClient.post<any>('/api/auth/register', data);

    const token = response.data?.access_token || response.data?.token;

    if (token) {
      apiClient.setToken(token);
    }

    // Normalisation identique au login
    if (response.data?.user) {
      response.data = {
        ...response.data,
        ...response.data.user,
        access_token: token,
        user_id: response.data.user.id,
      };
    }

    return response;
  },

  /**
   * Déconnexion (côté client uniquement)
   */
  async logout() {
    apiClient.setToken(null);
  },

  /**
   * Obtenir les informations de l'utilisateur connecté
   */
  async getCurrentUser() {
    const response = await apiClient.get<any>('/api/auth/me');

    if (response.data) {
      const d = response.data;
      console.log('API /auth/me response:', d); // DEBUG: Voir la structure exacte

      // Détection de rôle plus robuste
      let role: UserRole = 'client';

      const rawRole = (d.role || '').toString().toLowerCase();

      if (d.is_superuser || d.isAdmin || d.is_admin || rawRole === 'super_admin' || rawRole === 'admin') {
        role = 'super_admin'; // On considère admin comme super_admin pour simplifier l'accès
      } else if (d.is_staff || rawRole === 'staff' || rawRole === 'manager') {
        role = 'admin';
      } else if (d.is_seller || d.isSeller || rawRole === 'vendor' || rawRole === 'seller') {
        role = 'vendor';
      }

      return {
        data: {
          id: d.id ?? d.user?.id,
          username: d.username ?? d.user?.username ?? '',
          email: d.email ?? d.user?.email ?? '',
          first_name: d.first_name,
          last_name: d.last_name,
          phone: d.phone,
          is_seller: d.is_seller || d.isSeller || role === 'vendor',
          is_superuser: d.is_superuser || d.isAdmin || d.is_admin || role === 'super_admin',
          is_staff: d.is_staff || role === 'admin',
          role: role,
        } as User,
        status: response.status,
      };
    }

    return { error: response.error || 'Profil non trouvé', status: response.status || 404 };
  },

  /**
   * Vérifier si l'utilisateur est authentifié
   */
  isAuthenticated(): boolean {
    return apiClient.isAuthenticated();
  },

  /**
   * Obtenir le token actuel
   */
  getToken(): string | null {
    return apiClient.getToken();
  },
};
