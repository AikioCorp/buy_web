/**
 * Hook personnalisé pour la gestion des adresses
 */

import { useState, useEffect } from 'react';
import { addressesService, type Address, type CreateAddressData } from '../lib/api/addressesService';

export function useAddresses() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await addressesService.getAddresses();

      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        setAddresses(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des adresses');
    } finally {
      setIsLoading(false);
    }
  };

  const createAddress = async (data: CreateAddressData) => {
    try {
      const response = await addressesService.createAddress(data);
      if (response.data) {
        await loadAddresses();
        return { success: true, data: response.data };
      }
      return { success: false, error: response.error };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Erreur' };
    }
  };

  const updateAddress = async (id: number, data: Partial<CreateAddressData>) => {
    try {
      const response = await addressesService.updateAddress(id, data);
      if (response.data) {
        await loadAddresses();
        return { success: true, data: response.data };
      }
      return { success: false, error: response.error };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Erreur' };
    }
  };

  const deleteAddress = async (id: number) => {
    try {
      const response = await addressesService.deleteAddress(id);
      if (!response.error) {
        await loadAddresses();
        return { success: true };
      }
      return { success: false, error: response.error };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Erreur' };
    }
  };

  const setDefaultAddress = async (id: number) => {
    try {
      const response = await addressesService.setDefaultAddress(id);
      if (!response.error) {
        await loadAddresses();
        return { success: true };
      }
      return { success: false, error: response.error };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Erreur' };
    }
  };

  const refresh = () => {
    loadAddresses();
  };

  return {
    addresses,
    isLoading,
    error,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    refresh,
  };
}
