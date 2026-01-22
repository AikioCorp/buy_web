/**
 * Hook personnalisé pour la gestion du profil utilisateur
 */

import { useState, useEffect } from 'react';
import { profileService, type CustomerProfile, type Address } from '../lib/api';

export function useProfile() {
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await profileService.getProfile();

      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        setProfile(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement du profil');
    } finally {
      setIsLoading(false);
    }
  };

  const refresh = () => {
    loadProfile();
  };

  return {
    profile,
    isLoading,
    error,
    refresh,
  };
}

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
      const response = await profileService.getAddresses();

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

  const refresh = () => {
    loadAddresses();
  };

  return {
    addresses,
    isLoading,
    error,
    refresh,
  };
}
