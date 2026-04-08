/**
 * Hook personnalisé pour la gestion des commandes
 */

import { useState, useEffect } from 'react';
import { ordersService, type Order } from '../lib/api';

import { apiClient } from '../lib/api/apiClient';
import { cache, CACHE_TTL } from '../lib/cache';

const getOrdersCacheKey = () => {
  const authStorage = localStorage.getItem('auth-storage')
  if (!authStorage) return 'orders_anonymous'

  try {
    const parsed = JSON.parse(authStorage)
    const userId = parsed?.state?.user?.id
    return userId ? `orders_${userId}` : 'orders_authenticated'
  } catch {
    return 'orders_authenticated'
  }
}

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (apiClient.isAuthenticated()) {
      loadOrders();
    } else {
      setIsLoading(false);
    }
  }, []);

  const loadOrders = async (forceRefresh = false) => {
    setIsLoading(true);
    setError(null);

    // Double sécurité au cas où l'appel est manuel
    if (!apiClient.isAuthenticated()) {
      setIsLoading(false);
      return;
    }

    const cacheKey = getOrdersCacheKey()

    if (!forceRefresh) {
      const cached = cache.get<Order[]>(cacheKey)
      if (cached) {
        setOrders(cached)
        setIsLoading(false)
        return
      }
    }

    try {
      const response = await ordersService.getOrders();

      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        // Backend wraps response in { success: true, data: [...] }
        const raw = response.data as any;
        const unwrapped = raw.data || raw;
        // Handle both array and paginated response formats
        const ordersData = Array.isArray(unwrapped) 
          ? unwrapped 
          : unwrapped.results || [];
        setOrders(ordersData);
        cache.set(cacheKey, ordersData, CACHE_TTL.SHORT)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des commandes');
    } finally {
      setIsLoading(false);
    }
  };

  const refresh = () => {
    loadOrders(true);
  };

  return {
    orders,
    isLoading,
    error,
    refresh,
  };
}

export function useOrder(id: number) {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await ordersService.getOrder(id);

      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        setOrder(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement de la commande');
    } finally {
      setIsLoading(false);
    }
  };

  const refresh = () => {
    loadOrder();
  };

  return {
    order,
    isLoading,
    error,
    refresh,
  };
}

export function useVendorOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await ordersService.getOrders();

      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        // Handle both array and paginated response formats
        const ordersData = Array.isArray(response.data) 
          ? response.data 
          : (response.data as { results?: Order[] }).results || [];
        setOrders(ordersData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des commandes');
    } finally {
      setIsLoading(false);
    }
  };

  const refresh = () => {
    loadOrders();
  };

  return {
    orders,
    isLoading,
    error,
    refresh,
  };
}
