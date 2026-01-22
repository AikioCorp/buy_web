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

export const shopsService = {
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
};
