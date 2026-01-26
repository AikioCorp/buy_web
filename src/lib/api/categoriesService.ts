/**
 * Service de gestion des catégories
 */

import { apiClient } from './apiClient';

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  parent?: number | null;
  en_vedette?: boolean;
  children?: Category[];
}

export interface CreateCategoryData {
  name: string;
  slug: string;
  parent?: number | null;
  en_vedette?: boolean;
}

export const categoriesService = {
  /**
   * Récupérer toutes les catégories (Public)
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
    return apiClient.get<Category>(`/api/categories/${slug}/`);
  },

  // ========== ADMIN ENDPOINTS ==========

  /**
   * Liste toutes les catégories (Admin)
   */
  async getAllCategoriesAdmin() {
    try {
      const response = await apiClient.get<Category[]>('/api/admin/catalog/categories/');
      if (response.error) {
        // Fallback to public endpoint
        const publicResponse = await apiClient.get<Category[]>('/api/categories/');
        return { data: publicResponse.data || [], status: publicResponse.status };
      }
      return { data: response.data || [], status: response.status };
    } catch (error: any) {
      console.error('Erreur getAllCategoriesAdmin:', error);
      return { data: [], status: error.response?.status || 500 };
    }
  },

  /**
   * Créer une catégorie (Admin)
   */
  async createCategory(data: CreateCategoryData) {
    const response = await apiClient.post<Category>('/api/admin/catalog/categories/', data);
    if (response.error) {
      throw new Error(response.error);
    }
    return { data: response.data, status: response.status };
  },

  /**
   * Modifier une catégorie (Admin)
   */
  async updateCategory(slug: string, data: Partial<CreateCategoryData>) {
    const response = await apiClient.patch<Category>(`/api/admin/catalog/categories/${slug}/`, data);
    if (response.error) {
      throw new Error(response.error);
    }
    return { data: response.data, status: response.status };
  },

  /**
   * Supprimer une catégorie (Admin)
   */
  async deleteCategory(slug: string) {
    const response = await apiClient.delete(`/api/admin/catalog/categories/${slug}/`);
    if (response.error) {
      throw new Error(response.error);
    }
    return { status: response.status };
  },
};
