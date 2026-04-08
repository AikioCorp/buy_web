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
  commune_name?: string;
  delivery_fee?: number;
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

  /**
   * Récupérer tous les quartiers avec leur commune
   */
  async getAllQuartiers(): Promise<Quartier[]> {
    const response = await apiClient.get<{ data: Quartier[] }>('/api/locations/quartiers');
    return response.data?.data || [];
  },
};
