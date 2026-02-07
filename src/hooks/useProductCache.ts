import { useState, useEffect, useCallback } from 'react';
import productCacheService from '../services/productCache.service';

interface Product {
  id: number;
  name: string;
  slug: string;
  description?: string;
  base_price: number;
  compare_at_price?: number;
  stock: number;
  is_active: boolean;
  category_id?: number;
  store_id: number;
  images?: Array<{ image_url: string }>;
  [key: string]: any;
}

interface UseProductCacheOptions {
  category_id?: number;
  store_id?: number;
  search?: string;
  autoLoad?: boolean;
  prefetchNext?: boolean;
}

interface UseProductCacheResult {
  products: Product[];
  loading: boolean;
  error: Error | null;
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  loadPage: (page: number) => Promise<void>;
  nextPage: () => Promise<void>;
  prevPage: () => Promise<void>;
  loadAll: () => Promise<void>;
  refresh: () => void;
  progress: { loaded: number; total: number } | null;
}

export function useProductCache(
  options: UseProductCacheOptions = {}
): UseProductCacheResult {
  const {
    category_id,
    store_id,
    search,
    autoLoad = true,
    prefetchNext = true,
  } = options;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [progress, setProgress] = useState<{ loaded: number; total: number } | null>(null);

  const filters = { category_id, store_id, search };
  const totalPages = Math.ceil(totalCount / 100);
  const hasNextPage = currentPage < totalPages - 1;
  const hasPrevPage = currentPage > 0;

  const loadPage = useCallback(async (page: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await productCacheService.getProductsPage(page, filters);
      setProducts(response.results);
      setTotalCount(response.count);
      setCurrentPage(page);

      // Précharger les pages suivantes en arrière-plan
      if (prefetchNext && page < totalPages - 1) {
        productCacheService.prefetchNextPages(page, filters, 2);
      }
    } catch (err) {
      setError(err as Error);
      console.error('Erreur chargement produits:', err);
    } finally {
      setLoading(false);
    }
  }, [category_id, store_id, search, prefetchNext, totalPages]);

  const nextPage = useCallback(async () => {
    if (hasNextPage) {
      await loadPage(currentPage + 1);
    }
  }, [currentPage, hasNextPage, loadPage]);

  const prevPage = useCallback(async () => {
    if (hasPrevPage) {
      await loadPage(currentPage - 1);
    }
  }, [currentPage, hasPrevPage, loadPage]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    setProgress({ loaded: 0, total: 0 });

    try {
      const allProducts = await productCacheService.getAllProducts(
        filters,
        (loaded, total) => {
          setProgress({ loaded, total });
        }
      );
      
      setProducts(allProducts);
      setTotalCount(allProducts.length);
      setProgress(null);
    } catch (err) {
      setError(err as Error);
      console.error('Erreur chargement tous les produits:', err);
    } finally {
      setLoading(false);
    }
  }, [category_id, store_id, search]);

  const refresh = useCallback(() => {
    productCacheService.clearCacheForFilters(filters);
    loadPage(currentPage);
  }, [category_id, store_id, search, currentPage, loadPage]);

  // Charger la première page au montage
  useEffect(() => {
    if (autoLoad) {
      loadPage(0);
    }
  }, [category_id, store_id, search]); // Recharger si les filtres changent

  return {
    products,
    loading,
    error,
    totalCount,
    currentPage,
    totalPages,
    hasNextPage,
    hasPrevPage,
    loadPage,
    nextPage,
    prevPage,
    loadAll,
    refresh,
    progress,
  };
}

export default useProductCache;
