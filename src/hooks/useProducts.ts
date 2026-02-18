/**
 * Hook personnalisé pour la gestion des produits avec cache
 */

import { useState, useEffect, useCallback } from 'react';
import { productsService, type Product } from '../lib/api';
import { cache, CACHE_TTL } from '../lib/cache';

export function useProducts(params?: {
  page?: number;
  page_size?: number;
  limit?: number;
  offset?: number;
  category_id?: number;
  category_slug?: string;
  search?: string;
  light?: boolean;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{
    count: number;
    next: string | null;
    previous: string | null;
  } | null>(null);

  // Générer une clé de cache unique basée sur les paramètres
  const getCacheKey = useCallback(() => {
    const parts = ['products'];
    if (params?.page) parts.push(`p${params.page}`);
    if (params?.page_size) parts.push(`ps${params.page_size}`);
    if (params?.limit) parts.push(`l${params.limit}`);
    if (params?.offset) parts.push(`o${params.offset}`);
    if (params?.category_id) parts.push(`cat${params.category_id}`);
    if (params?.category_slug) parts.push(`slug_${params.category_slug}`);
    if (params?.search) parts.push(`q_${params.search}`);
    if (params?.light) parts.push('light');
    return parts.join('_');
  }, [params?.page, params?.page_size, params?.limit, params?.offset, params?.category_id, params?.category_slug, params?.search, params?.light]);

  useEffect(() => {
    loadProducts();
  }, [params?.page, params?.page_size, params?.limit, params?.offset, params?.category_id, params?.category_slug, params?.search, params?.light, getCacheKey]);

  const loadProducts = async (forceRefresh = false) => {
    setIsLoading(true);
    setError(null);

    const cacheKey = getCacheKey();

    // Vérifier le cache d'abord (sauf si forceRefresh)
    if (!forceRefresh) {
      const cachedData = cache.get<{ results: Product[]; count: number; next: string | null; previous: string | null }>(cacheKey);
      if (cachedData) {
        setProducts(cachedData.results);
        setPagination({
          count: cachedData.count,
          next: cachedData.next,
          previous: cachedData.previous,
        });
        setIsLoading(false);
        return;
      }
    }

    try {
      const response = await productsService.getProducts(params);

      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        // Sauvegarder dans le cache
        cache.set(cacheKey, response.data, CACHE_TTL.MEDIUM);
        
        setProducts(response.data.results);
        setPagination({
          count: response.data.count,
          next: response.data.next,
          previous: response.data.previous,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des produits');
    } finally {
      setIsLoading(false);
    }
  };

  const refresh = () => {
    loadProducts(true); // Force refresh bypasse le cache
  };

  return {
    products,
    isLoading,
    error,
    pagination,
    refresh,
  };
}

export function useProduct(id: number) {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await productsService.getProduct(id);

      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        setProduct(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement du produit');
    } finally {
      setIsLoading(false);
    }
  };

  const refresh = () => {
    loadProduct();
  };

  return {
    product,
    isLoading,
    error,
    refresh,
  };
}

export function useMyProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await productsService.getMyProducts();

      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        // Handle both ProductsResponse and Product[] types
        if (Array.isArray(response.data)) {
          setProducts(response.data);
        } else if ('results' in response.data) {
          setProducts(response.data.results);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des produits');
    } finally {
      setIsLoading(false);
    }
  };

  const refresh = () => {
    loadProducts();
  };

  return {
    products,
    isLoading,
    error,
    refresh,
  };
}
