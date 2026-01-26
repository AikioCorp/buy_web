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
  token: string;
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
    const response = await apiClient.post<AuthResponse>('/api/auth/login/', credentials);
    
    if (response.data?.token) {
      apiClient.setToken(response.data.token);
    }
    
    return response;
  },

  /**
   * Inscription
   */
  async register(data: RegisterData) {
    const response = await apiClient.post<AuthResponse>('/api/auth/register/', data);
    
    if (response.data?.token) {
      apiClient.setToken(response.data.token);
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
    // Essayer une liste d'endpoints communs pour récupérer l'utilisateur courant
    const candidates = [
      '/api/auth/me/',
      '/api/auth/user/',
      '/dj-rest-auth/user/',
      '/api/users/me/',
    ]

    for (const endpoint of candidates) {
      const response = await apiClient.get<any>(endpoint)
      if (response.data) {
        const d = response.data as any
        return {
          data: {
            id: d.id ?? d.user?.id,
            username: d.username ?? d.user?.username ?? '',
            email: d.email ?? d.user?.email ?? '',
            first_name: d.first_name,
            last_name: d.last_name,
            phone: d.phone,
            is_seller: d.is_seller,
            is_superuser: d.is_superuser,
            is_staff: d.is_staff,
            role: d.role || (d.is_superuser ? 'super_admin' : d.is_staff ? 'admin' : d.is_seller ? 'vendor' : undefined),
          } as User,
          status: response.status,
        }
      }
    }

    // Fallback: profil client (ne contient pas les rôles)
    const response = await apiClient.get<any[]>('/api/customers/profiles/')
    if (response.data && response.data.length > 0) {
      const profile = response.data[0]
      return {
        data: {
          id: profile.user,
          username: profile.user?.username || '',
          email: profile.user?.email || '',
          first_name: profile.first_name,
          last_name: profile.last_name,
          phone: profile.phone,
        } as User,
        status: response.status,
      }
    }

    return { error: 'Profil non trouvé', status: 404 }
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
