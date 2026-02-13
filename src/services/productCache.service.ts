import { apiClient } from '../lib/api/apiClient';

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

interface ProductsResponse {
  results: Product[];
  count: number;
  page?: number;
  limit?: number;
}

interface CacheEntry {
  data: Product[];
  timestamp: number;
  count: number;
}

class ProductCacheService {
  private cache: Map<string, CacheEntry> = new Map();
  private loadingPromises: Map<string, Promise<ProductsResponse>> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private readonly BATCH_SIZE = 100;

  /**
   * Générer une clé de cache basée sur les filtres
   */
  private getCacheKey(filters: {
    category_id?: number;
    category_slug?: string;
    store_id?: number;
    search?: string;
    page?: number;
  }): string {
    return JSON.stringify({
      category_id: filters.category_id,
      category_slug: filters.category_slug,
      store_id: filters.store_id,
      search: filters.search,
      page: filters.page || 0,
    });
  }

  /**
   * Vérifier si le cache est encore valide
   */
  private isCacheValid(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp < this.CACHE_DURATION;
  }

  /**
   * Charger une page de produits depuis l'API
   */
  private async fetchProductsPage(
    page: number,
    filters: {
      category_id?: number;
      category_slug?: string;
      store_id?: number;
      search?: string;
    } = {}
  ): Promise<ProductsResponse> {
    const offset = page * this.BATCH_SIZE;
    
    const params: any = {
      limit: this.BATCH_SIZE,
      offset: offset,
    };

    if (filters.category_id) params.category_id = filters.category_id;
    if (filters.category_slug) params.category = filters.category_slug;
    if (filters.store_id) params.store_id = filters.store_id;
    if (filters.search) params.search = filters.search;

    // Construire l'URL avec les paramètres
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, String(value));
      }
    });
    
    const endpoint = `/api/products?${queryParams.toString()}`;
    const response = await apiClient.get<ProductsResponse>(endpoint);
    
    // Vérifier si la réponse contient une erreur
    if (!response.data) {
      throw new Error(response.error || 'Erreur lors du chargement des produits');
    }

    // Normaliser la réponse
    if (Array.isArray(response.data)) {
      return {
        results: response.data,
        count: response.data.length,
      };
    }
    
    return response.data as ProductsResponse;
  }

  /**
   * Charger une page de produits avec cache
   */
  async getProductsPage(
    page: number = 0,
    filters: {
      category_id?: number;
      category_slug?: string;
      store_id?: number;
      search?: string;
    } = {}
  ): Promise<ProductsResponse> {
    const cacheKey = this.getCacheKey({ ...filters, page });

    // Vérifier le cache
    const cached = this.cache.get(cacheKey);
    if (cached && this.isCacheValid(cached)) {
      console.log(`📦 Cache hit pour page ${page}`);
      return {
        results: cached.data,
        count: cached.count,
        page,
        limit: this.BATCH_SIZE,
      };
    }

    // Vérifier si un chargement est déjà en cours
    const existingPromise = this.loadingPromises.get(cacheKey);
    if (existingPromise) {
      console.log(`⏳ Chargement en cours pour page ${page}`);
      return existingPromise;
    }

    // Charger depuis l'API
    console.log(`🌐 Chargement API pour page ${page}`);
    const promise = this.fetchProductsPage(page, filters);
    this.loadingPromises.set(cacheKey, promise);

    try {
      const response = await promise;
      
      // Mettre en cache
      this.cache.set(cacheKey, {
        data: response.results,
        timestamp: Date.now(),
        count: response.count,
      });

      return {
        ...response,
        page,
        limit: this.BATCH_SIZE,
      };
    } finally {
      this.loadingPromises.delete(cacheKey);
    }
  }

  /**
   * Charger tous les produits par séquences de 100 (async)
   */
  async getAllProducts(
    filters: {
      category_id?: number;
      store_id?: number;
      search?: string;
    } = {},
    onProgress?: (loaded: number, total: number) => void
  ): Promise<Product[]> {
    const allProducts: Product[] = [];
    let page = 0;
    let hasMore = true;

    console.log('🔄 Début du chargement de tous les produits...');

    // Charger toutes les pages jusqu'à ce qu'il n'y ait plus de résultats
    while (hasMore) {
      try {
        const pageData = await this.getProductsPage(page, filters);
        
        if (pageData.results.length === 0) {
          hasMore = false;
          break;
        }

        allProducts.push(...pageData.results);
        
        console.log(`📦 Page ${page + 1} chargée: ${pageData.results.length} produits (Total: ${allProducts.length})`);

        if (onProgress) {
          // Estimer le total basé sur le nombre de résultats
          const estimatedTotal = pageData.results.length < this.BATCH_SIZE 
            ? allProducts.length 
            : allProducts.length + this.BATCH_SIZE;
          onProgress(allProducts.length, estimatedTotal);
        }

        // Si on a reçu moins que BATCH_SIZE, c'est la dernière page
        if (pageData.results.length < this.BATCH_SIZE) {
          hasMore = false;
        } else {
          page++;
        }
      } catch (error) {
        console.error(`❌ Erreur chargement page ${page}:`, error);
        hasMore = false;
      }
    }

    console.log(`✅ Chargement terminé: ${allProducts.length} produits au total`);
    return allProducts;
  }

  /**
   * Précharger les pages suivantes en arrière-plan
   */
  async prefetchNextPages(
    currentPage: number,
    filters: {
      category_id?: number;
      store_id?: number;
      search?: string;
    } = {},
    pagesToPrefetch: number = 2
  ): Promise<void> {
    const prefetchPromises: Promise<ProductsResponse>[] = [];

    for (let i = 1; i <= pagesToPrefetch; i++) {
      const nextPage = currentPage + i;
      prefetchPromises.push(
        this.getProductsPage(nextPage, filters).catch(err => {
          console.warn(`Erreur préchargement page ${nextPage}:`, err);
          return { results: [], count: 0 };
        })
      );
    }

    await Promise.all(prefetchPromises);
    console.log(`✅ ${pagesToPrefetch} pages préchargées`);
  }

  /**
   * Vider le cache
   */
  clearCache(): void {
    this.cache.clear();
    this.loadingPromises.clear();
    console.log('🗑️ Cache vidé');
  }

  /**
   * Vider le cache pour des filtres spécifiques
   */
  clearCacheForFilters(filters: {
    category_id?: number;
    store_id?: number;
    search?: string;
  }): void {
    const keysToDelete: string[] = [];
    
    this.cache.forEach((_, key) => {
      const parsedKey = JSON.parse(key);
      const matches = 
        (!filters.category_id || parsedKey.category_id === filters.category_id) &&
        (!filters.store_id || parsedKey.store_id === filters.store_id) &&
        (!filters.search || parsedKey.search === filters.search);
      
      if (matches) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.cache.delete(key));
    console.log(`🗑️ ${keysToDelete.length} entrées de cache supprimées`);
  }

  /**
   * Obtenir les statistiques du cache
   */
  getCacheStats(): {
    totalEntries: number;
    totalProducts: number;
    cacheSize: string;
  } {
    let totalProducts = 0;
    
    this.cache.forEach(entry => {
      totalProducts += entry.data.length;
    });

    return {
      totalEntries: this.cache.size,
      totalProducts,
      cacheSize: `${(JSON.stringify([...this.cache.entries()]).length / 1024).toFixed(2)} KB`,
    };
  }
}

export const productCacheService = new ProductCacheService();
export default productCacheService;
