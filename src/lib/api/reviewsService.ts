/**
 * Service pour la gestion des avis
 */

import { apiClient } from './apiClient';

export interface Review {
  id: number;
  user: {
    id: number;
    name: string;
    email: string;
    avatar?: string;
  };
  product?: {
    id: number;
    name: string;
    image?: string;
  };
  shop?: {
    id: number;
    name: string;
  };
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  helpful_count: number;
}

export interface ReviewFilters {
  status?: string;
  rating?: number;
  product_id?: number;
  shop_id?: number;
  page?: number;
  limit?: number;
}

export const reviewsService = {
  /**
   * Get all reviews (admin)
   */
  async getAllReviews(filters?: ReviewFilters) {
    const params = new URLSearchParams();
    if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters?.rating) params.append('rating', filters.rating.toString());
    if (filters?.product_id) params.append('product_id', filters.product_id.toString());
    if (filters?.shop_id) params.append('shop_id', filters.shop_id.toString());
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    return await apiClient.get<{ results: Review[]; count: number }>(`/api/reviews?${params.toString()}`);
  },

  /**
   * Get reviews for a product
   */
  async getProductReviews(productId: number) {
    return await apiClient.get<{ results: Review[]; count: number }>(`/api/products/${productId}/reviews`);
  },

  /**
   * Get reviews for a shop
   */
  async getShopReviews(shopId: number) {
    return await apiClient.get<{ results: Review[]; count: number }>(`/api/shops/${shopId}/reviews`);
  },

  /**
   * Approve a review
   */
  async approveReview(id: number) {
    return await apiClient.post(`/api/reviews/${id}/approve`, {});
  },

  /**
   * Reject a review
   */
  async rejectReview(id: number, reason?: string) {
    return await apiClient.post(`/api/reviews/${id}/reject`, { reason });
  },

  /**
   * Delete a review
   */
  async deleteReview(id: number) {
    return await apiClient.delete(`/api/reviews/${id}`);
  },

  /**
   * Get review stats
   */
  async getStats() {
    return await apiClient.get<{
      total: number;
      pending: number;
      approved: number;
      rejected: number;
      average_rating: number;
    }>('/api/reviews/stats');
  },
};
