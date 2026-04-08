/**
 * Hook personnalisé pour la gestion des favoris
 */

import { useState, useEffect } from 'react';
import { favoritesService, type Favorite } from '../lib/api';
import { cache, CACHE_TTL } from '../lib/cache';
import { apiClient } from '../lib/api/apiClient';

const getFavoritesCacheKey = () => {
  const authStorage = localStorage.getItem('auth-storage')
  if (!authStorage) return 'favorites_anonymous'

  try {
    const parsed = JSON.parse(authStorage)
    const userId = parsed?.state?.user?.id
    return userId ? `favorites_${userId}` : 'favorites_authenticated'
  } catch {
    return 'favorites_authenticated'
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!apiClient.isAuthenticated()) {
      setFavorites([])
      setIsLoading(false)
      return
    }

    loadFavorites();
  }, []);

  const loadFavorites = async (forceRefresh = false) => {
    setIsLoading(true);
    setError(null);

    const cacheKey = getFavoritesCacheKey()

    if (!forceRefresh) {
      const cached = cache.get<Favorite[]>(cacheKey)
      if (cached) {
        setFavorites(cached)
        setIsLoading(false)
        return
      }
    }

    try {
      const response = await favoritesService.getFavorites();

      if (response.error) {
        setError(response.error);
        setFavorites([]);
      } else if (response.data) {
        const results = response.data.results || []
        setFavorites(results);
        cache.set(cacheKey, results, CACHE_TTL.MEDIUM)
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
        await loadFavorites(true);
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
        await loadFavorites(true);
        return { success: true };
      }
      return { success: false, error: response.error };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Erreur' };
    }
  };

  const refresh = () => {
    loadFavorites(true);
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
