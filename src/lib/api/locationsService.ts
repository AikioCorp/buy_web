/**
 * Service de gestion des localisations (communes et quartiers)
 */

import { apiClient } from './apiClient';

export interface Commune {
  id: number;
  name: string;
  delivery_fee: number;
  estimated_time: string;
}

export interface Quartier {
  id: number;
  commune_id: number;
  name: string;
}

export const locationsService = {
  /**
   * Récupérer toutes les communes
   */
  async getCommunes(): Promise<Commune[]> {
    const response = await apiClient.get<{ data: Commune[] }>('/api/locations/communes');
    return response.data?.data || [];
  },

  /**
   * Récupérer les quartiers d'une commune par ID
   */
  async getQuartiersByCommune(communeId: number): Promise<Quartier[]> {
    const response = await apiClient.get<{ data: Quartier[] }>(`/api/locations/quartiers?commune_id=${communeId}`);
    return response.data?.data || [];
  },

  /**
   * Récupérer les quartiers d'une commune par nom
   */
  async getQuartiersByCommuneName(communeName: string): Promise<Quartier[]> {
    const response = await apiClient.get<{ data: Quartier[] }>(`/api/locations/quartiers?commune_name=${encodeURIComponent(communeName)}`);
    return response.data?.data || [];
  },
};
