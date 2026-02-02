/**
 * Service de gestion du profil utilisateur
 */

import { apiClient } from './apiClient';

export interface CustomerProfile {
  id: string;  // UUID from Supabase
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  street?: string;
  city?: string;
  avatar_url?: string;
}

export interface UpdateProfileData {
  first_name?: string;
  last_name?: string;
  phone?: string;
}

export interface Address {
  id: number;
  label: string;
  full_name: string;
  phone: string;
  email: string;
  commune: string;
  quartier: string;
  address_details: string;
  street: string;
  city: string;
  country: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateAddressData {
  label?: string;
  full_name: string;
  phone: string;
  email?: string;
  commune: string;
  quartier: string;
  address_details?: string;
  street?: string;
  city?: string;
  country?: string;
  is_default?: boolean;
}

export const profileService = {
  /**
   * Récupérer le profil client
   */
  async getProfile() {
    return apiClient.get<CustomerProfile>('/api/customers/profile');
  },

  /**
   * Mettre à jour le profil client
   */
  async updateProfile(id: string, data: UpdateProfileData) {
    return apiClient.patch<CustomerProfile>('/api/customers/profile', data);
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
