/**
 * Service de gestion des produits
 */

import { apiClient } from './apiClient';

export interface Product {
  id: number;
  name: string;
  slug: string;
  description?: string;
  base_price: string;
  stock?: number;
  low_stock_threshold?: number;
  is_active?: boolean;
  is_in_stock?: boolean;
  is_low_stock?: boolean;
  category: Category;
  store: Store;
  shop?: Store;
  media: ProductMedia[];
  images?: ProductMedia[];
  options?: ProductOption[];
  variants?: ProductVariant[];
  features?: ProductFeature[];
  related_products?: Product[];
  average_rating?: number;
  total_reviews?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ProductFeature {
  id: number;
  product_id: number;
  name: string;
  value: string;
  sort_order?: number;
}

export interface ProductOption {
  id: number;
  product_id: number;
  name: string;
  values: string[];
  sort_order?: number;
}

export interface ProductVariant {
  id: number;
  product_id: number;
  sku?: string;
  option_values: Record<string, string>;
  price_modifier: number;
  stock: number;
  image_url?: string;
  is_active: boolean;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  parent: number | null;
  children: Category[];
}

export interface Store {
  id: number;
  name: string;
  slug: string;
  description?: string;
  logo?: string | null;
  is_active?: boolean;
}

export interface ProductMedia {
  id?: number;
  file?: string;
  image_url?: string;
  media_type?: string;
  is_primary?: boolean;
}

export interface ProductsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Product[];
}

export interface CreateProductData {
  name: string;
  slug: string;
  description: string;
  base_price: string;
  category?: number;
  category_id?: number;
  store_id?: number;
  stock?: number;
  low_stock_threshold?: number;
  is_active?: boolean;
  // Product features
  delivery_time?: string;
  warranty_duration?: string;
  return_policy?: string;
  is_authentic?: boolean;
}

export const productsService = {
  /**
   * Récupérer la liste des produits avec pagination et filtres
   */
  async getProducts(params?: {
    page?: number;
    page_size?: number;
    category_id?: number;
    category_slug?: string;
    search?: string;
    store_id?: number;
  }) {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.page_size) queryParams.append('page_size', params.page_size.toString());
    if (params?.category_id) queryParams.append('category_id', params.category_id.toString());
    if (params?.category_slug) queryParams.append('category_slug', params.category_slug);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.store_id) queryParams.append('store_id', params.store_id.toString());

    const endpoint = `/api/products${queryParams.toString() ? `?${queryParams}` : ''}`;
    return apiClient.get<ProductsResponse>(endpoint);
  },

  /**
   * Récupérer les détails d'un produit par ID ou slug
   */
  async getProduct(idOrSlug: number | string) {
    return apiClient.get<Product>(`/api/products/${idOrSlug}`);
  },

  /**
   * Créer un nouveau produit (vendeur uniquement)
   */
  async createProduct(data: CreateProductData) {
    return apiClient.post<Product>('/api/my-products', data);
  },

  /**
   * Mettre à jour un produit (vendeur uniquement)
   */
  async updateProduct(id: number, data: Partial<CreateProductData>) {
    return apiClient.patch<Product>(`/api/my-products/${id}`, data);
  },

  /**
   * Supprimer un produit (vendeur uniquement)
   */
  async deleteProduct(id: number) {
    return apiClient.delete(`/api/my-products/${id}`);
  },

  /**
   * Récupérer mes produits (vendeur uniquement)
   */
  async getMyProducts() {
    return apiClient.get<Product[]>('/api/my-products');
  },

  /**
   * Upload d'image pour un produit via l'API backend
   * POST /api/my-products/{product_id}/upload-image/
   */
  async uploadProductImage(productId: number, file: File) {
    return apiClient.upload(`/api/my-products/${productId}/upload-image`, file, 'image');
  },

  /**
   * Sauvegarder les variantes d'un produit
   */
  async saveProductVariants(productId: number, variants: Array<{
    name: string;
    value: string;
    price_modifier: number;
    stock: number;
  }>) {
    return apiClient.post(`/api/my-products/${productId}/variants`, { variants });
  },

  /**
   * Récupérer les variantes d'un produit
   */
  async getProductVariants(productId: number) {
    return apiClient.get(`/api/my-products/${productId}/variants`);
  },

  // ========== ADMIN ENDPOINTS ==========

  /**
   * Récupérer tous les produits (Admin)
   */
  async getAllProductsAdmin(params?: {
    page?: number;
    search?: string;
    category_id?: number;
    store_id?: number;
  }) {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.search) queryParams.append('search', params.search);
      if (params?.category_id) queryParams.append('category_id', params.category_id.toString());
      if (params?.store_id) queryParams.append('store_id', params.store_id.toString());

      // Essayer l'endpoint admin d'abord
      const endpoint = `/api/products${queryParams.toString() ? `?${queryParams}` : ''}`;
      const response = await apiClient.get<ProductsResponse | Product[]>(endpoint);

      if (response.error) {
        return {
          data: { count: 0, next: null, previous: null, results: [] },
          status: response.status
        };
      }

      // Gérer les deux formats de réponse
      if (Array.isArray(response.data)) {
        return {
          data: {
            count: response.data.length,
            next: null,
            previous: null,
            results: response.data
          },
          status: response.status
        };
      }
      return { data: response.data, status: response.status };
    } catch (error: any) {
      console.error('Erreur getAllProductsAdmin:', error);
      return {
        data: { count: 0, next: null, previous: null, results: [] },
        status: error.response?.status || 500
      };
    }
  },

  /**
   * Créer un produit (Admin)
   */
  async createProductAdmin(data: CreateProductData) {
    const response = await apiClient.post<Product>('/api/products', data);
    if (response.error) {
      throw new Error(response.error);
    }
    return { data: response.data, status: response.status };
  },

  /**
   * Modifier un produit (Admin)
   */
  async updateProductAdmin(id: number, data: Partial<CreateProductData>) {
    const response = await apiClient.patch<Product>(`/api/products/${id}`, data);
    if (response.error) {
      throw new Error(response.error);
    }
    return { data: response.data, status: response.status };
  },

  /**
   * Supprimer un produit (Admin)
   */
  async deleteProductAdmin(id: number) {
    const response = await apiClient.delete(`/api/products/${id}`);
    if (response.error) {
      throw new Error(response.error);
    }
    return { status: response.status };
  },

  /**
   * Upload des images pour un produit (Admin) via l'API backend
   * POST /api/admin/catalog/products/{product_id}/upload_images/
   * Le backend attend: request.FILES.getlist('images')
   */
  async uploadProductImagesAdmin(productId: number, images: File[]) {
    const formData = new FormData();
    // Le backend attend le champ 'images' (voir admin_views.py ligne 39)
    images.forEach(image => {
      formData.append('images', image);
    });

    console.log(`Upload ${images.length} images pour produit ${productId}`);

    const response = await apiClient.postFormData<ProductMedia[]>(
      `/api/products/${productId}/upload_images`,
      formData
    );

    if (response.error) {
      console.error('Erreur upload images:', response.error, response.status);
      // Ne pas bloquer - le produit est créé, juste sans images
      return { data: [], status: response.status };
    }

    return { data: response.data, status: response.status };
  },
};

/**
 * Récupère l'URL de l'image produit depuis l'API backend
 */
export function getProductImageUrl(product: Product): string {
  // Chercher dans les médias
  if (product.media && product.media.length > 0) {
    const primaryMedia = product.media.find(m => m.is_primary) || product.media[0];
    // Priorité: image_url (URL externe) puis file (fichier local)
    if (primaryMedia.image_url) {
      return primaryMedia.image_url;
    }
    if (primaryMedia.file) {
      return primaryMedia.file;
    }
  }
  // Image par défaut
  return '/placeholder-product.png';
}
