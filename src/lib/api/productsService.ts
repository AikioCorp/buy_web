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
  category: Category;
  store: Store;
  media: ProductMedia[];
  options?: any[];
  related_products?: Product[];
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
  image_url?: string;
}

export interface ProductsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Product[];
}

export interface CreateProductData {
  category: number;
  name: string;
  slug: string;
  description: string;
  base_price: string;
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
  }) {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.page_size) queryParams.append('page_size', params.page_size.toString());
    if (params?.category_id) queryParams.append('category_id', params.category_id.toString());
    if (params?.category_slug) queryParams.append('category_slug', params.category_slug);
    if (params?.search) queryParams.append('search', params.search);

    const endpoint = `/api/products/${queryParams.toString() ? `?${queryParams}` : ''}`;
    return apiClient.get<ProductsResponse>(endpoint);
  },

  /**
   * Récupérer les détails d'un produit
   */
  async getProduct(id: number) {
    return apiClient.get<Product>(`/api/products/${id}/`);
  },

  /**
   * Créer un nouveau produit (vendeur uniquement)
   */
  async createProduct(data: CreateProductData) {
    return apiClient.post<Product>('/api/my-products/', data);
  },

  /**
   * Mettre à jour un produit (vendeur uniquement)
   */
  async updateProduct(id: number, data: Partial<CreateProductData>) {
    return apiClient.patch<Product>(`/api/my-products/${id}/`, data);
  },

  /**
   * Supprimer un produit (vendeur uniquement)
   */
  async deleteProduct(id: number) {
    return apiClient.delete(`/api/my-products/${id}/`);
  },

  /**
   * Récupérer mes produits (vendeur uniquement)
   */
  async getMyProducts() {
    return apiClient.get<Product[]>('/api/my-products/');
  },

  /**
   * Upload d'image pour un produit
   */
  async uploadProductImage(productId: number, file: File) {
    return apiClient.upload(`/api/my-products/${productId}/upload-image/`, file, 'image');
  },
};
