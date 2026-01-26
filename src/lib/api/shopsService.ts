/**
 * Service de gestion des boutiques
 */

import { apiClient } from './apiClient';

export interface Shop {
  id: number;
  name: string;
  slug: string;
  description?: string;
  logo?: string | null;
  is_active: boolean;
}

export interface CreateShopData {
  name: string;
  slug: string;
  description?: string;
  is_active?: boolean;
}

export interface ShopsListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Shop[];
}

export const shopsService = {
  /**
   * Récupérer les boutiques publiques (sans authentification)
   * Essaie plusieurs endpoints pour trouver celui qui fonctionne
   */
  async getPublicShops(page: number = 1, pageSize: number = 20) {
    // Liste des endpoints à essayer (du plus public au plus restreint)
    const endpoints = [
      `/api/stores/?page=${page}&page_size=${pageSize}`,
      `/api/catalog/stores/?page=${page}&page_size=${pageSize}`,
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await apiClient.get<ShopsListResponse | Shop[]>(endpoint);
        
        if (response.error || response.status === 401 || response.status === 403) {
          continue; // Essayer le prochain endpoint
        }
        
        // Gérer les deux formats de réponse possibles
        if (Array.isArray(response.data)) {
          return { 
            data: { 
              count: response.data.length, 
              next: null, 
              previous: null, 
              results: response.data 
            }, 
            status: response.status 
          };
        }
        return {
          data: response.data,
          status: response.status,
        };
      } catch (error: any) {
        // Continuer avec le prochain endpoint
        continue;
      }
    }

    // Aucun endpoint n'a fonctionné - retourner un résultat vide sans erreur
    return { 
      data: { count: 0, next: null, previous: null, results: [] }, 
      status: 200 
    };
  },

  /**
   * Récupérer toutes les boutiques (super admin uniquement)
   */
  async getAllShops(page: number = 1, pageSize: number = 20) {
    try {
      const response = await apiClient.get<ShopsListResponse>(
        `/api/customers/stores/?page=${page}&page_size=${pageSize}`
      );
      return {
        data: response.data,
        status: response.status,
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des boutiques');
    }
  },

  /**
   * Rechercher des boutiques (super admin uniquement)
   */
  async searchShops(query: string, page: number = 1, pageSize: number = 20) {
    try {
      const response = await apiClient.get<ShopsListResponse>(
        `/api/customers/stores/?search=${encodeURIComponent(query)}&page=${page}&page_size=${pageSize}`
      );
      return {
        data: response.data,
        status: response.status,
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la recherche de boutiques');
    }
  },

  /**
   * Récupérer une boutique par ID (super admin uniquement)
   */
  async getShopById(shopId: number) {
    try {
      const response = await apiClient.get<Shop>(`/api/customers/stores/${shopId}/`);
      return {
        data: response.data,
        status: response.status,
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération de la boutique');
    }
  },
  /**
   * Récupérer mes boutiques (vendeur uniquement) - retourne 0 ou 1 boutique
   */
  async getMyShops() {
    return apiClient.get<Shop[]>('/api/customers/stores/');
  },

  /**
   * Récupérer ma boutique (première de la liste)
   */
  async getMyShop() {
    const response = await apiClient.get<Shop[]>('/api/customers/stores/');
    if (response.data && response.data.length > 0) {
      return {
        data: response.data[0],
        status: response.status,
      };
    }
    return { error: 'Aucune boutique trouvée', status: 404 };
  },

  /**
   * Créer une nouvelle boutique (vendeur uniquement)
   */
  async createShop(data: CreateShopData) {
    return apiClient.post<Shop>('/api/customers/stores/', data);
  },

  /**
   * Mettre à jour une boutique (vendeur uniquement)
   */
  async updateShop(id: number, data: Partial<CreateShopData>) {
    return apiClient.patch<Shop>(`/api/customers/stores/${id}/`, data);
  },

  /**
   * Supprimer une boutique (vendeur uniquement)
   */
  async deleteShop(id: number) {
    return apiClient.delete(`/api/customers/stores/${id}/`);
  },

  // ========== ADMIN ENDPOINTS ==========

  /**
   * Récupérer toutes les boutiques (Admin) - avec pagination
   * Note: L'API n'a pas d'endpoint admin spécifique pour les boutiques
   * On utilise /api/customers/stores/ qui retourne les boutiques du vendeur connecté
   */
  async getAllShopsAdmin(params?: {
    page?: number;
    search?: string;
    is_active?: boolean;
  }) {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.search) queryParams.append('search', params.search);
      if (params?.is_active !== undefined) queryParams.append('is_active', params.is_active.toString());

      const endpoint = `/api/customers/stores/${queryParams.toString() ? `?${queryParams}` : ''}`;
      const response = await apiClient.get<ShopsListResponse | Shop[]>(endpoint);
      
      // Gérer les erreurs d'authentification silencieusement
      if (response.error || response.status === 401 || response.status === 403) {
        return { 
          data: { count: 0, next: null, previous: null, results: [] }, 
          status: response.status 
        };
      }
      
      if (Array.isArray(response.data)) {
        return { 
          data: { 
            count: response.data.length, 
            next: null, 
            previous: null, 
            results: response.data 
          }, 
          status: response.status 
        };
      }
      return { data: response.data, status: response.status };
    } catch (error: any) {
      console.error('Erreur getAllShopsAdmin:', error);
      return { 
        data: { count: 0, next: null, previous: null, results: [] }, 
        status: error.response?.status || 500 
      };
    }
  },

  /**
   * Valider/Activer une boutique (Admin)
   */
  async validateShop(id: number) {
    try {
      const response = await apiClient.patch<Shop>(`/api/customers/stores/${id}/`, { is_active: true });
      return { data: response.data, status: response.status };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la validation de la boutique');
    }
  },

  /**
   * Désactiver une boutique (Admin)
   */
  async deactivateShop(id: number) {
    try {
      const response = await apiClient.patch<Shop>(`/api/customers/stores/${id}/`, { is_active: false });
      return { data: response.data, status: response.status };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la désactivation de la boutique');
    }
  },

  /**
   * Supprimer une boutique (Admin)
   */
  async deleteShopAdmin(id: number) {
    try {
      const response = await apiClient.delete(`/api/customers/stores/${id}/`);
      return { status: response.status };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la suppression de la boutique');
    }
  },
};
