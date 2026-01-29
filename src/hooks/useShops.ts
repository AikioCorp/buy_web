/**
 * Hook personnalisé pour la gestion des boutiques
 */

import { useState, useEffect } from 'react';
import { shopsService, type Shop } from '../lib/api';

export function useShops() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadShops();
  }, []);

  const loadShops = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await shopsService.getPublicShops();

      if (response.data) {
        // Gérer les deux formats de réponse
        const shopsList = 'results' in response.data ? response.data.results : response.data as unknown as Shop[];
        setShops(shopsList);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des boutiques');
    } finally {
      setIsLoading(false);
    }
  };

  const refresh = () => {
    loadShops();
  };

  return {
    shops,
    isLoading,
    error,
    refresh,
  };
}

export function useShop(id: number) {
  const [shop, setShop] = useState<Shop | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadShop();
  }, [id]);

  const loadShop = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Essayer d'abord getMyShop, sinon chercher dans la liste publique
      const response = await shopsService.getPublicShops();

      if (response.data) {
        const shopsList = 'results' in response.data ? response.data.results : response.data as unknown as Shop[];
        const foundShop = shopsList.find(s => s.id === id);
        if (foundShop) {
          setShop(foundShop);
        } else {
          setError('Boutique non trouvée');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement de la boutique');
    } finally {
      setIsLoading(false);
    }
  };

  const refresh = () => {
    loadShop();
  };

  return {
    shop,
    isLoading,
    error,
    refresh,
  };
}

export function useMyShops() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadShops();
  }, []);

  const loadShops = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await shopsService.getMyShops();

      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        setShops(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des boutiques');
    } finally {
      setIsLoading(false);
    }
  };

  const refresh = () => {
    loadShops();
  };

  return {
    shops,
    isLoading,
    error,
    refresh,
  };
}
