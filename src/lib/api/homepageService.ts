/**
 * Service pour gérer le contenu dynamique de la page d'accueil
 */

import { apiClient } from './apiClient';

// Types
export interface HeroSlider {
  id?: number;
  title: string;
  subtitle: string;
  description?: string;
  bg_color: string;
  image_url: string;
  image_position?: string;
  cta_text: string;
  cta_link: string;
  position: number;
  is_active: boolean;
}

export interface PromoBanner {
  id?: number;
  title: string;
  subtitle: string;
  discount?: string;
  bg_color: string;
  image_url: string;
  image_position?: string;
  link?: string;
  position: number;
  is_active: boolean;
}

export interface FeaturedProduct {
  id?: number;
  product_id: number;
  section: 'top_ventes' | 'flash_deals' | 'populaires';
  position: number;
  is_active: boolean;
  product?: {
    id: number;
    name: string;
    slug: string;
    base_price: string;
    promo_price?: string;
    stock: number;
    media?: { id: number; image_url: string; is_primary: boolean }[];
    images?: { id: number; image_url: string; is_primary: boolean }[];
  };
}

export interface HomepageContent {
  sliders: HeroSlider[];
  banners: PromoBanner[];
  featuredProducts: {
    top_ventes: FeaturedProduct[];
    flash_deals: FeaturedProduct[];
    populaires: FeaturedProduct[];
  };
}

export const homepageService = {
  // ==================== PUBLIC ====================

  /**
   * Récupérer tout le contenu de la page d'accueil
   */
  async getHomepageContent(): Promise<{ data: HomepageContent | null; error?: string }> {
    const response = await apiClient.get<HomepageContent>('/api/homepage/content');
    return { ...response, data: response.data ?? null };
  },

  // ==================== ADMIN - SLIDERS ====================

  /**
   * Récupérer tous les sliders (admin)
   */
  async getSliders(includeInactive = true): Promise<{ data: HeroSlider[] | null; error?: string }> {
    const response = await apiClient.get<HeroSlider[]>(`/api/homepage/admin/sliders?include_inactive=${includeInactive}`);
    return { ...response, data: response.data ?? null };
  },

  /**
   * Créer un slider
   */
  async createSlider(slider: Omit<HeroSlider, 'id'>): Promise<{ data: HeroSlider | null; error?: string }> {
    const response = await apiClient.post<HeroSlider>('/api/homepage/admin/sliders', slider);
    return { ...response, data: response.data ?? null };
  },

  /**
   * Mettre à jour un slider
   */
  async updateSlider(id: number, slider: Partial<HeroSlider>): Promise<{ data: HeroSlider | null; error?: string }> {
    const response = await apiClient.put<HeroSlider>(`/api/homepage/admin/sliders/${id}`, slider);
    return { ...response, data: response.data ?? null };
  },

  /**
   * Supprimer un slider
   */
  async deleteSlider(id: number): Promise<{ error?: string }> {
    return apiClient.delete(`/api/homepage/admin/sliders/${id}`);
  },

  /**
   * Upload image pour un slider
   */
  async uploadSliderImage(id: number, file: File): Promise<{ data: HeroSlider | null; error?: string }> {
    const response = await apiClient.upload<HeroSlider>(`/api/homepage/admin/sliders/${id}/upload`, file, 'image');
    return { ...response, data: response.data ?? null };
  },

  /**
   * Réordonner les sliders
   */
  async reorderSliders(orderedIds: number[]): Promise<{ error?: string }> {
    return apiClient.post('/api/homepage/admin/sliders/reorder', { orderedIds });
  },

  // ==================== ADMIN - BANNERS ====================

  /**
   * Récupérer toutes les bannières (admin)
   */
  async getBanners(includeInactive = true): Promise<{ data: PromoBanner[] | null; error?: string }> {
    const response = await apiClient.get<PromoBanner[]>(`/api/homepage/admin/banners?include_inactive=${includeInactive}`);
    return { ...response, data: response.data ?? null };
  },

  /**
   * Créer une bannière
   */
  async createBanner(banner: Omit<PromoBanner, 'id'>): Promise<{ data: PromoBanner | null; error?: string }> {
    const response = await apiClient.post<PromoBanner>('/api/homepage/admin/banners', banner);
    return { ...response, data: response.data ?? null };
  },

  /**
   * Mettre à jour une bannière
   */
  async updateBanner(id: number, banner: Partial<PromoBanner>): Promise<{ data: PromoBanner | null; error?: string }> {
    const response = await apiClient.put<PromoBanner>(`/api/homepage/admin/banners/${id}`, banner);
    return { ...response, data: response.data ?? null };
  },

  /**
   * Supprimer une bannière
   */
  async deleteBanner(id: number): Promise<{ error?: string }> {
    return apiClient.delete(`/api/homepage/admin/banners/${id}`);
  },

  /**
   * Upload image pour une bannière
   */
  async uploadBannerImage(id: number, file: File): Promise<{ data: PromoBanner | null; error?: string }> {
    const response = await apiClient.upload<PromoBanner>(`/api/homepage/admin/banners/${id}/upload`, file, 'image');
    return { ...response, data: response.data ?? null };
  },

  // ==================== ADMIN - FEATURED PRODUCTS ====================

  /**
   * Récupérer les produits mis en avant (admin)
   */
  async getFeaturedProducts(section?: string, includeInactive = true): Promise<{ data: FeaturedProduct[] | null; error?: string }> {
    let url = `/api/homepage/admin/featured?include_inactive=${includeInactive}`;
    if (section) url += `&section=${section}`;
    const response = await apiClient.get<FeaturedProduct[]>(url);
    return { ...response, data: response.data ?? null };
  },

  /**
   * Ajouter un produit en vedette
   */
  async addFeaturedProduct(productId: number, section: string, position?: number): Promise<{ data: FeaturedProduct | null; error?: string }> {
    const response = await apiClient.post<FeaturedProduct>('/api/homepage/admin/featured', {
      product_id: productId,
      section,
      position
    });
    return { ...response, data: response.data ?? null };
  },

  /**
   * Mettre à jour un produit en vedette
   */
  async updateFeaturedProduct(id: number, data: Partial<FeaturedProduct>): Promise<{ data: FeaturedProduct | null; error?: string }> {
    const response = await apiClient.put<FeaturedProduct>(`/api/homepage/admin/featured/${id}`, data);
    return { ...response, data: response.data ?? null };
  },

  /**
   * Retirer un produit des vedettes
   */
  async removeFeaturedProduct(id: number): Promise<{ error?: string }> {
    return apiClient.delete(`/api/homepage/admin/featured/${id}`);
  },

  /**
   * Réordonner les produits en vedette
   */
  async reorderFeaturedProducts(section: string, orderedIds: number[]): Promise<{ error?: string }> {
    return apiClient.post('/api/homepage/admin/featured/reorder', { section, orderedIds });
  },
};
