/**
 * Service de gestion des boutiques
 */

import { apiClient } from './apiClient';

export type ShopStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface Shop {
  id: number;
  name: string;
  slug: string;
  description?: string;
  logo?: string | null;
  logo_url?: string | null;
  banner?: string | null;
  banner_url?: string | null;
  city?: string;
  category?: string;
  rating?: number;
  products_count?: number;
  is_active: boolean;
  // Approval status
  status?: ShopStatus;
  admin_notes?: string;
  rejection_reason?: string;
  // Owner info
  owner_id?: string;
  owner_name?: string;
  owner_email?: string;
  // Adresse de la boutique
  address_commune?: string;
  address_quartier?: string;
  address_details?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  // Configuration de livraison
  delivery_base_fee?: number;
  delivery_available?: boolean;
  delivery_zones?: ShopDeliveryZone[];
  // Timestamps
  created_at?: string;
  updated_at?: string;
}

export interface ShopDeliveryZone {
  id?: number;
  commune: string;
  delivery_fee: number;
  estimated_time: string;
  is_active: boolean;
}

export interface CreateShopData {
  name: string;
  slug: string;
  description?: string;
  is_active?: boolean;
  // Images
  logo_url?: string | null;
  banner_url?: string | null;
  // Adresse de la boutique
  address_commune?: string;
  address_quartier?: string;
  address_details?: string;
  city?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  // Configuration de livraison
  delivery_base_fee?: number;
  delivery_available?: boolean;
}

export interface ShopsListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Shop[];
}

export const shopsService = {
  /**
   * Récupérer les boutiques publiques (sans authentification)
   */
  async getPublicShops(page: number = 1, pageSize: number = 20) {
    try {
      const response = await apiClient.get<ShopsListResponse | Shop[]>(
        `/api/shops?page=${page}&page_size=${pageSize}`
      );

      console.log('getPublicShops API response:', response);

      if (response.error) {
        console.warn('getPublicShops error:', response.error);
        return {
          data: { count: 0, next: null, previous: null, results: [] },
          status: response.status || 200,
        };
      }

      // Gérer les deux formats de réponse possibles
      if (Array.isArray(response.data)) {
        console.log('getPublicShops: Array format, count:', response.data.length);
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

      // Format paginé avec results
      if (response.data?.results) {
        console.log('getPublicShops: Paginated format, count:', response.data.results.length);
      }

      return {
        data: response.data,
        status: response.status,
      };
    } catch (error: any) {
      console.error('Erreur getPublicShops:', error);
      return {
        data: { count: 0, next: null, previous: null, results: [] },
        status: 200
      };
    }
  },

  /**
   * Récupérer toutes les boutiques (super admin uniquement)
   */
  async getAllShops(page: number = 1, pageSize: number = 20) {
    try {
      const response = await apiClient.get<ShopsListResponse>(
        `/api/shops?page=${page}&page_size=${pageSize}`
      );
      return {
        data: response.data,
        status: response.status,
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des boutiques');
    }
  },

  /**
   * Rechercher des boutiques (super admin uniquement)
   */
  async searchShops(query: string, page: number = 1, pageSize: number = 20) {
    try {
      const response = await apiClient.get<ShopsListResponse>(
        `/api/shops?search=${encodeURIComponent(query)}&page=${page}&page_size=${pageSize}`
      );
      return {
        data: response.data,
        status: response.status,
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la recherche de boutiques');
    }
  },

  /**
   * Récupérer une boutique par ID (super admin uniquement)
   */
  async getShopById(shopId: number) {
    try {
      const response = await apiClient.get<Shop>(`/api/shops/${shopId}`);
      return {
        data: response.data,
        status: response.status,
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération de la boutique');
    }
  },

  /**
   * Récupérer une boutique par slug ou ID
   */
  async getShopBySlugOrId(slugOrId: string) {
    try {
      // Essayer d'abord par ID si c'est un nombre
      if (!isNaN(Number(slugOrId))) {
        const response = await apiClient.get<Shop>(`/api/shops/${slugOrId}`);
        if (response.data) {
          return { data: response.data, status: response.status };
        }
      }

      // Sinon chercher par slug dans la liste
      const listResponse = await this.getPublicShops(1, 100);
      if (listResponse.data) {
        const shops = 'results' in listResponse.data ? listResponse.data.results : listResponse.data as unknown as Shop[];
        const shop = shops.find(s => s.slug === slugOrId || s.name.toLowerCase() === slugOrId.toLowerCase());
        if (shop) {
          return { data: shop, status: 200 };
        }
      }

      return { data: undefined, status: 404 };
    } catch (error: any) {
      return { data: undefined, status: 500 };
    }
  },
  /**
   * Récupérer mes boutiques (vendeur uniquement) - retourne 0 ou 1 boutique
   */
  async getMyShops() {
    return apiClient.get<Shop[]>('/api/shops');
  },

  /**
   * Récupérer ma boutique (première de la liste)
   */
  async getMyShop() {
    const response = await apiClient.get<{ results: Shop[]; count: number } | Shop[]>('/api/shops');
    console.log('🔍 getMyShop raw response:', response);
    
    // Handle both response formats: { results: [...] } or direct array
    let shops: Shop[] = [];
    if (response.data) {
      if (Array.isArray(response.data)) {
        shops = response.data;
      } else if (response.data.results && Array.isArray(response.data.results)) {
        shops = response.data.results;
      }
    }
    
    console.log('📦 getMyShop parsed shops:', shops.length, shops);
    
    if (shops.length > 0) {
      return {
        data: shops[0],
        status: response.status,
      };
    }
    return { error: 'Aucune boutique trouvée', status: 404 };
  },

  /**
   * Créer une nouvelle boutique (vendeur uniquement)
   */
  async createShop(data: CreateShopData) {
    const storeData: any = {
      name: data.name,
      slug: data.slug,
      description: data.description || '',
      logo_url: data.logo_url || '',
      banner_url: data.banner_url || '',
      address_commune: data.address_commune || '',
      address_quartier: data.address_quartier || '',
      address_details: data.address_details || '',
      city: data.city || 'Bamako',
      phone: data.phone || '',
      whatsapp: data.whatsapp || '',
      email: data.email || '',
      delivery_base_fee: data.delivery_base_fee || 1000,
      delivery_available: data.delivery_available !== false,
      // Don't send is_active - let backend set it to false for vendors
    };

    console.log('📝 Creating shop with data:', storeData);
    const response = await apiClient.post<Shop>('/api/shops', storeData);
    console.log('📦 Create shop response:', response);
    return response;
  },

  /**
   * Mettre à jour une boutique (vendeur uniquement)
   */
  async updateShop(id: number, data: Partial<CreateShopData>) {
    const storeData: any = {};

    if (data.name !== undefined) storeData.name = data.name;
    if (data.slug !== undefined) storeData.slug = data.slug;
    if (data.description !== undefined) storeData.description = data.description;
    if (data.logo_url !== undefined) storeData.logo_url = data.logo_url;
    if (data.banner_url !== undefined) storeData.banner_url = data.banner_url;
    if (data.address_commune !== undefined) storeData.address_commune = data.address_commune;
    if (data.address_quartier !== undefined) storeData.address_quartier = data.address_quartier;
    if (data.address_details !== undefined) storeData.address_details = data.address_details;
    if (data.city !== undefined) storeData.city = data.city;
    if (data.phone !== undefined) storeData.phone = data.phone;
    if (data.whatsapp !== undefined) storeData.whatsapp = data.whatsapp;
    if (data.email !== undefined) storeData.email = data.email;
    if (data.delivery_base_fee !== undefined) storeData.delivery_base_fee = data.delivery_base_fee;
    if (data.delivery_available !== undefined) storeData.delivery_available = data.delivery_available;
    if (data.is_active !== undefined) storeData.is_active = data.is_active;

    return apiClient.patch<Shop>(`/api/shops/${id}`, storeData);
  },

  /**
   * Supprimer une boutique (vendeur uniquement)
   */
  async deleteShop(id: number) {
    return apiClient.delete(`/api/shops/${id}`);
  },

  // ========== ADMIN ENDPOINTS ==========

  /**
   * Récupérer toutes les boutiques (Admin) - avec pagination
   * Inclut les boutiques inactives pour la gestion admin
   */
  async getAllShopsAdmin(params?: {
    page?: number;
    search?: string;
    is_active?: boolean;
  }) {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('include_inactive', 'true'); // Admin sees all shops
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.search) queryParams.append('search', params.search);
      if (params?.is_active !== undefined) queryParams.append('is_active', params.is_active.toString());

      const endpoint = `/api/shops?${queryParams.toString()}`;
      const response = await apiClient.get<ShopsListResponse | Shop[]>(endpoint);

      // Gérer les erreurs d'authentification silencieusement
      if (response.error || response.status === 401 || response.status === 403) {
        return {
          data: { count: 0, next: null, previous: null, results: [] },
          status: response.status
        };
      }

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
      console.error('Erreur getAllShopsAdmin:', error);
      return {
        data: { count: 0, next: null, previous: null, results: [] },
        status: error.response?.status || 500
      };
    }
  },

  /**
   * Valider/Activer une boutique (Admin)
   */
  async validateShop(id: number) {
    try {
      const response = await apiClient.patch<Shop>(`/api/shops/${id}`, { is_active: true, status: 'approved' });
      return { data: response.data, status: response.status };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la validation de la boutique');
    }
  },

  /**
   * Désactiver une boutique (Admin)
   */
  async deactivateShop(id: number) {
    try {
      const response = await apiClient.patch<Shop>(`/api/shops/${id}`, { is_active: false });
      return { data: response.data, status: response.status };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la désactivation de la boutique');
    }
  },

  /**
   * Approuver une boutique (Admin)
   */
  async approveShop(id: number, notes?: string) {
    try {
      const response = await apiClient.patch<Shop>(`/api/shops/${id}`, {
        status: 'approved',
        is_active: true,
        admin_notes: notes
      });
      return { data: response.data, status: response.status };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de l\'approbation de la boutique');
    }
  },

  /**
   * Rejeter une boutique (Admin)
   */
  async rejectShop(id: number, reason: string) {
    try {
      const response = await apiClient.patch<Shop>(`/api/shops/${id}`, {
        status: 'rejected',
        is_active: false,
        rejection_reason: reason
      });
      return { data: response.data, status: response.status };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors du rejet de la boutique');
    }
  },

  /**
   * Suspendre une boutique (Admin)
   */
  async suspendShop(id: number, reason: string) {
    try {
      const response = await apiClient.patch<Shop>(`/api/shops/${id}`, {
        status: 'suspended',
        is_active: false,
        admin_notes: reason
      });
      return { data: response.data, status: response.status };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la suspension de la boutique');
    }
  },

  /**
   * Envoyer un message à une boutique (Admin)
   */
  async sendMessageToShop(id: number, message: string) {
    try {
      const response = await apiClient.post(`/api/shops/${id}/messages`, { message });
      return { data: response.data, status: response.status };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de l\'envoi du message');
    }
  },

  /**
   * Supprimer une boutique (Admin)
   */
  async deleteShopAdmin(id: number) {
    try {
      const response = await apiClient.delete(`/api/shops/${id}`);
      return { status: response.status };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la suppression de la boutique');
    }
  },
};
