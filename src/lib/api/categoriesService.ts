/**
 * Service de gestion des catégories
 */

import { apiClient } from './apiClient';

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  parent?: number;
  children?: Category[];
}

export const categoriesService = {
  /**
   * Récupérer toutes les catégories
   */
  async getCategories() {
    return apiClient.get<Category[]>('/api/categories/');
  },

  /**
   * Récupérer une catégorie par ID
   */
  async getCategory(id: number) {
    return apiClient.get<Category>(`/api/categories/${id}/`);
  },

  /**
   * Récupérer une catégorie par slug
   */
  async getCategoryBySlug(slug: string) {
    return apiClient.get<Category>(`/api/categories/slug/${slug}/`);
  },
};
