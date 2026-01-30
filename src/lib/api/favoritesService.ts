/**
 * Service de gestion des favoris
 */

import { apiClient } from './apiClient';
import type { Product } from './productsService';

export interface Favorite {
  id: number;
  product: Product;
  created_at: string;
}

export interface FavoritesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Favorite[];
}

class FavoritesService {
  async getFavorites() {
    return apiClient.get<FavoritesResponse>('/api/customers/favorites');
  }

  async addFavorite(productId: number) {
    return apiClient.post('/api/customers/favorites', { product_id: productId });
  }

  async removeFavorite(favoriteId: number) {
    return apiClient.delete(`/api/customers/favorites/${favoriteId}`);
  }

  async isFavorite(productId: number) {
    const response = await this.getFavorites();
    if (response.data) {
      return response.data.results.some(fav => fav.product.id === productId);
    }
    return false;
  }
}

export const favoritesService = new FavoritesService();
