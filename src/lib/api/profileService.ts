/**
 * Service de gestion du profil utilisateur
 */

import { apiClient } from './apiClient';

export interface CustomerProfile {
  id: number;
  user: number;
  first_name: string;
  last_name: string;
  phone: string;
  addresses: Address[];
}

export interface UpdateProfileData {
  first_name?: string;
  last_name?: string;
  phone?: string;
}

export interface Address {
  id: number;
  full_name: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

export interface CreateAddressData {
  full_name: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postal_code: string;
  country: string;
  is_default?: boolean;
}

export const profileService = {
  /**
   * Récupérer le profil client
   */
  async getProfile() {
    const response = await apiClient.get<CustomerProfile[]>('/api/customers/profiles');
    return {
      ...response,
      data: response.data?.[0], // Retourner le premier profil
    };
  },

  /**
   * Mettre à jour le profil client
   */
  async updateProfile(id: number, data: UpdateProfileData) {
    return apiClient.patch<CustomerProfile>(`/api/customers/profiles/${id}`, data);
  },

  /**
   * Récupérer les adresses
   */
  async getAddresses() {
    return apiClient.get<Address[]>('/api/customers/addresses');
  },

  /**
   * Créer une nouvelle adresse
   */
  async createAddress(data: CreateAddressData) {
    return apiClient.post<Address>('/api/customers/addresses', data);
  },

  /**
   * Mettre à jour une adresse
   */
  async updateAddress(id: number, data: Partial<CreateAddressData>) {
    return apiClient.patch<Address>(`/api/customers/addresses/${id}`, data);
  },

  /**
   * Supprimer une adresse
   */
  async deleteAddress(id: number) {
    return apiClient.delete(`/api/customers/addresses/${id}`);
  },
};
