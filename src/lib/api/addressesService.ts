/**
 * Service de gestion des adresses
 */

import { apiClient } from './apiClient';

export interface Address {
  id: number;
  label: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state?: string;
  postal_code?: string;
  country: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateAddressData {
  label: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state?: string;
  postal_code?: string;
  country: string;
  is_default?: boolean;
}

class AddressesService {
  async getAddresses() {
    return apiClient.get<Address[]>('/api/customers/addresses');
  }

  async getAddress(id: number) {
    return apiClient.get<Address>(`/api/customers/addresses/${id}`);
  }

  async createAddress(data: CreateAddressData) {
    return apiClient.post<Address>('/api/customers/addresses', data);
  }

  async updateAddress(id: number, data: Partial<CreateAddressData>) {
    return apiClient.put<Address>(`/api/customers/addresses/${id}`, data);
  }

  async deleteAddress(id: number) {
    return apiClient.delete(`/api/customers/addresses/${id}`);
  }

  async setDefaultAddress(id: number) {
    return apiClient.post(`/api/customers/addresses/${id}/set_default`);
  }
}

export const addressesService = new AddressesService();
