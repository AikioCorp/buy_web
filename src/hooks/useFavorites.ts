/**
 * Hook personnalisé pour la gestion des favoris
 */

import { useState, useEffect } from 'react';
import { favoritesService, type Favorite } from '../lib/api';

export function useFavorites() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await favoritesService.getFavorites();

      if (response.error) {
        setError(response.error);
        setFavorites([]);
      } else if (response.data) {
        setFavorites(response.data.results || []);
      } else {
        setFavorites([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des favoris');
      setFavorites([]);
    } finally {
      setIsLoading(false);
    }
  };

  const addFavorite = async (productId: number) => {
    try {
      const response = await favoritesService.addFavorite(productId);
      if (response.data) {
        await loadFavorites();
        return { success: true };
      }
      return { success: false, error: response.error };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Erreur' };
    }
  };

  const removeFavorite = async (favoriteId: number) => {
    try {
      const response = await favoritesService.removeFavorite(favoriteId);
      if (!response.error) {
        await loadFavorites();
        return { success: true };
      }
      return { success: false, error: response.error };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Erreur' };
    }
  };

  const refresh = () => {
    loadFavorites();
  };

  return {
    favorites,
    isLoading,
    error,
    addFavorite,
    removeFavorite,
    refresh,
  };
}
