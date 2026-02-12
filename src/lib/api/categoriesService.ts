/**
 * Service de gestion des catégories
 */

import { apiClient } from './apiClient';

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  image?: string;
  parent: number | null;
  parent_id?: number | null;
  en_vedette?: boolean;
  children: Category[];
}

export interface CreateCategoryData {
  name: string;
  slug: string;
  parent?: number | null;
  en_vedette?: boolean;
  icon?: File | string;
  remove_image?: boolean;
}

export const categoriesService = {
  /**
   * Récupérer toutes les catégories (Public)
   */
  async getCategories() {
    return apiClient.get<Category[]>('/api/categories');
  },

  /**
   * Récupérer une catégorie par ID
   */
  async getCategory(id: number) {
    return apiClient.get<Category>(`/api/categories/${id}`);
  },

  /**
   * Récupérer une catégorie par slug
   */
  async getCategoryBySlug(slug: string) {
    return apiClient.get<Category>(`/api/categories/${slug}`);
  },

  // ========== ADMIN ENDPOINTS ==========

  /**
   * Liste toutes les catégories (Admin)
   */
  async getAllCategoriesAdmin() {
    try {
      const response = await apiClient.get<Category[]>('/api/categories');
      if (response.error) {
        // Fallback to public endpoint
        const publicResponse = await apiClient.get<Category[]>('/api/categories');
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
    // If icon is a File, use FormData
    if (data.icon instanceof File) {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('slug', data.slug);
      if (data.parent) formData.append('parent', data.parent.toString());
      if (data.en_vedette) formData.append('en_vedette', data.en_vedette.toString());
      formData.append('icon', data.icon);

      const response = await apiClient.postFormData<Category>('/api/categories', formData);
      if (response.error) {
        throw new Error(response.error);
      }
      return { data: response.data, status: response.status };
    }

    // Otherwise use JSON
    const response = await apiClient.post<Category>('/api/categories', data);
    if (response.error) {
      throw new Error(response.error);
    }
    return { data: response.data, status: response.status };
  },

  /**
   * Modifier une catégorie (Admin)
   */
  async updateCategory(slug: string, data: Partial<CreateCategoryData>) {
    // If icon is a File, use FormData
    if (data.icon instanceof File) {
      const formData = new FormData();
      if (data.name) formData.append('name', data.name);
      if (data.slug) formData.append('slug', data.slug);
      if (data.parent !== undefined) formData.append('parent', data.parent?.toString() || '');
      if (data.en_vedette !== undefined) formData.append('en_vedette', data.en_vedette.toString());
      formData.append('icon', data.icon);

      const response = await apiClient.patchFormData<Category>(`/api/categories/${slug}`, formData);
      if (response.error) {
        throw new Error(response.error);
      }
      return { data: response.data, status: response.status };
    }

    // If remove_image is true, include it in the request
    const requestData: any = { ...data };
    if (data.remove_image) {
      requestData.image = null; // Set image to null to remove it
    }
    delete requestData.icon; // Remove icon field if not a File

    // Otherwise use JSON
    const response = await apiClient.patch<Category>(`/api/categories/${slug}`, requestData);
    if (response.error) {
      throw new Error(response.error);
    }
    return { data: response.data, status: response.status };
  },

  /**
   * Supprimer une catégorie (Admin)
   */
  async deleteCategory(slug: string) {
    const response = await apiClient.delete(`/api/categories/${slug}`);
    if (response.error) {
      throw new Error(response.error);
    }
    return { status: response.status };
  },
};
