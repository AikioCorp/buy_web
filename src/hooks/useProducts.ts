/**
 * Hook personnalisé pour la gestion des produits
 */

import { useState, useEffect } from 'react';
import { productsService, type Product } from '../lib/api';

export function useProducts(params?: {
  page?: number;
  page_size?: number;
  category_id?: number;
  category_slug?: string;
  search?: string;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{
    count: number;
    next: string | null;
    previous: string | null;
  } | null>(null);

  useEffect(() => {
    loadProducts();
  }, [params?.page, params?.category_id, params?.category_slug, params?.search]);

  const loadProducts = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await productsService.getProducts(params);

      if (response.error) {
        setError(response.error);
      } else if (response.data) {
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
    loadProducts();
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
        setProducts(response.data);
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
