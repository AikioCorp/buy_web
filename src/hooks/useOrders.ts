/**
 * Hook personnalisé pour la gestion des commandes
 */

import { useState, useEffect } from 'react';
import { ordersService, type Order } from '../lib/api';

export function useOrders() {
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
        setOrders(response.data);
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
      const response = await ordersService.getVendorOrders();

      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        setOrders(response.data);
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
