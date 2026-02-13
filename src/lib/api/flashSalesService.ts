/**
 * Service pour gérer les Flash Sales côté frontend
 */

import { apiClient } from './apiClient';

export interface FlashSale {
  id?: number;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  bg_color?: string;
  created_at?: string;
  updated_at?: string;
}

export interface FlashSaleProduct {
  id?: number;
  flash_sale_id: number;
  product_id: number;
  discount_percent?: number;
  custom_price?: number;
  position: number;
  created_at?: string;
  product?: any;
}

export interface ActiveFlashSale {
  flashSale: FlashSale;
  products: FlashSaleProduct[];
}

export const flashSalesService = {
  // ==================== PUBLIC ====================

  /**
   * Récupérer la flash sale active avec ses produits
   */
  async getActiveFlashSale(): Promise<{ data: ActiveFlashSale | null; error?: string }> {
    return apiClient.get<ActiveFlashSale>('/api/flash-sales/active');
  },

  // ==================== ADMIN ====================

  /**
   * Récupérer toutes les flash sales (admin)
   */
  async getFlashSales(includeInactive = true): Promise<{ data: FlashSale[] | null; error?: string }> {
    return apiClient.get<FlashSale[]>(`/api/flash-sales/admin?include_inactive=${includeInactive}`);
  },

  /**
   * Récupérer une flash sale par ID (admin)
   */
  async getFlashSaleById(id: number): Promise<{ data: FlashSale | null; error?: string }> {
    return apiClient.get<FlashSale>(`/api/flash-sales/admin/${id}`);
  },

  /**
   * Créer une nouvelle flash sale (admin)
   */
  async createFlashSale(data: Omit<FlashSale, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: FlashSale | null; error?: string }> {
    return apiClient.post<FlashSale>('/api/flash-sales/admin', data);
  },

  /**
   * Mettre à jour une flash sale (admin)
   */
  async updateFlashSale(id: number, data: Partial<FlashSale>): Promise<{ data: FlashSale | null; error?: string }> {
    return apiClient.put<FlashSale>(`/api/flash-sales/admin/${id}`, data);
  },

  /**
   * Supprimer une flash sale (admin)
   */
  async deleteFlashSale(id: number): Promise<{ data: any; error?: string }> {
    return apiClient.delete(`/api/flash-sales/admin/${id}`);
  },

  // ==================== FLASH SALE PRODUCTS ====================

  /**
   * Récupérer les produits d'une flash sale (admin)
   */
  async getFlashSaleProducts(flashSaleId: number): Promise<{ data: FlashSaleProduct[] | null; error?: string }> {
    return apiClient.get<FlashSaleProduct[]>(`/api/flash-sales/admin/${flashSaleId}/products`);
  },

  /**
   * Ajouter un produit à une flash sale (admin)
   */
  async addProductToFlashSale(
    flashSaleId: number,
    productId: number,
    discountPercent?: number,
    customPrice?: number
  ): Promise<{ data: FlashSaleProduct | null; error?: string }> {
    return apiClient.post<FlashSaleProduct>(`/api/flash-sales/admin/${flashSaleId}/products`, {
      product_id: productId,
      discount_percent: discountPercent,
      custom_price: customPrice
    });
  },

  /**
   * Retirer un produit d'une flash sale (admin)
   */
  async removeProductFromFlashSale(id: number): Promise<{ data: any; error?: string }> {
    return apiClient.delete(`/api/flash-sales/admin/products/${id}`);
  },

  /**
   * Mettre à jour un produit dans une flash sale (admin)
   */
  async updateFlashSaleProduct(id: number, data: Partial<FlashSaleProduct>): Promise<{ data: FlashSaleProduct | null; error?: string }> {
    return apiClient.put<FlashSaleProduct>(`/api/flash-sales/admin/products/${id}`, data);
  }
};
