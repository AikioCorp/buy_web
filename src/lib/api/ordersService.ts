/**
 * Service de gestion des commandes
 */

import { apiClient } from './apiClient';

export interface Order {
  id: number;
  customer: number;
  user: number;
  status: OrderStatus;
  shipping_address: number;
  total_amount: string;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: number;
  product: {
    id: number;
    name: string;
    slug: string;
    description?: string;
    base_price: string;
    store: {
      id: number;
      name: string;
      slug: string;
      description?: string;
    };
    category: {
      id: number;
      name: string;
      slug: string;
      parent: number | null;
      children: any[];
    };
    media: Array<{ image_url?: string }>;
  };
  quantity: number;
  unit_price: string;
}

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface ShippingAddressData {
  full_name: string;
  phone: string;
  email?: string;
  commune: string;
  quartier: string;
  address_details?: string;
  country: string;
}

export interface CreateOrderData {
  shipping_address_id?: number;
  shipping_address?: ShippingAddressData;
  items: Array<{
    product_id: number;
    quantity: number;
  }>;
  payment_method?: string;
  delivery_fee?: number;
  notes?: string;
}

export interface OrdersListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Order[];
}

export const ordersService = {
  /**
   * Récupérer les commandes du vendeur connecté (ses propres commandes de boutique)
   */
  async getOrders() {
    // Endpoint pour le vendeur - retourne uniquement les commandes de sa boutique
    return apiClient.get<Order[]>('/api/orders/vendor/');
  },

  /**
   * Récupérer les commandes du client connecté
   */
  async getMyOrders() {
    return apiClient.get<Order[]>('/api/orders/');
  },

  /**
   * Récupérer une commande par ID
   */
  async getOrder(id: number) {
    return apiClient.get<Order>(`/api/orders/${id}/`);
  },

  /**
   * Créer une nouvelle commande (checkout)
   * Si shipping_address est fourni, on crée d'abord l'adresse puis la commande
   */
  async createOrder(data: CreateOrderData) {
    let shippingAddressId = data.shipping_address_id;

    // Si on a des données d'adresse, créer d'abord l'adresse
    if (data.shipping_address && !shippingAddressId) {
      const addressResponse = await apiClient.post<{ id: number }>('/api/customers/addresses/', {
        full_name: data.shipping_address.full_name,
        phone: data.shipping_address.phone,
        email: data.shipping_address.email || '',
        commune: data.shipping_address.commune,
        quartier: data.shipping_address.quartier,
        address_details: data.shipping_address.address_details || '',
        country: data.shipping_address.country || 'Mali',
        // Champs de compatibilité pour l'ancien backend
        line1: `${data.shipping_address.quartier}, ${data.shipping_address.commune}`,
        city: 'Bamako',
        postal_code: '00000',
        is_default: true,
      });

      if (addressResponse.error) {
        return { data: null, error: addressResponse.error, status: addressResponse.status };
      }

      shippingAddressId = addressResponse.data?.id;
    }

    if (!shippingAddressId) {
      return { data: null, error: 'Adresse de livraison requise', status: 400 };
    }

    // Créer la commande avec l'ID de l'adresse
    const orderData: any = {
      items: data.items,
      shipping_address_id: shippingAddressId,
    };

    return apiClient.post<Order>('/api/orders/', orderData);
  },

  // ========== ADMIN ENDPOINTS ==========

  /**
   * Récupérer toutes les commandes (Admin/SuperAdmin)
   * Permet de rechercher par numéro de commande, boutique, produit
   */
  async getAllOrdersAdmin(params?: {
    page?: number;
    status?: OrderStatus;
    search?: string;
    store_id?: number;
    product_id?: number;
  }) {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.status) queryParams.append('status', params.status);
      if (params?.search) queryParams.append('search', params.search);
      if (params?.store_id) queryParams.append('store', params.store_id.toString());
      if (params?.product_id) queryParams.append('product', params.product_id.toString());

      // Endpoint admin pour voir toutes les commandes
      const endpoint = `/api/orders/admin/${queryParams.toString() ? `?${queryParams}` : ''}`;
      const response = await apiClient.get<OrdersListResponse | Order[]>(endpoint);
      
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
      console.error('Erreur getAllOrdersAdmin:', error);
      // Fallback sur l'endpoint standard si l'endpoint admin n'existe pas
      try {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.status) queryParams.append('status', params.status);
        if (params?.search) queryParams.append('search', params.search);
        
        const fallbackEndpoint = `/api/orders/${queryParams.toString() ? `?${queryParams}` : ''}`;
        const fallbackResponse = await apiClient.get<OrdersListResponse | Order[]>(fallbackEndpoint);
        
        if (Array.isArray(fallbackResponse.data)) {
          return { 
            data: { 
              count: fallbackResponse.data.length, 
              next: null, 
              previous: null, 
              results: fallbackResponse.data 
            }, 
            status: fallbackResponse.status 
          };
        }
        return { data: fallbackResponse.data, status: fallbackResponse.status };
      } catch {
        return { 
          data: { count: 0, next: null, previous: null, results: [] }, 
          status: error.response?.status || 500 
        };
      }
    }
  },

  /**
   * Transférer une commande vers une autre boutique (Admin/SuperAdmin)
   */
  async transferOrder(orderId: number, newStoreId: number, reason: string) {
    try {
      const response = await apiClient.post<Order>(`/api/orders/${orderId}/transfer/`, {
        new_store_id: newStoreId,
        reason: reason
      });
      return { data: response.data, status: response.status };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors du transfert de la commande');
    }
  },

  /**
   * Récupérer une commande par ID (Admin)
   */
  async getOrderAdmin(id: number) {
    try {
      const response = await apiClient.get<Order>(`/api/orders/${id}/`);
      return { data: response.data, status: response.status };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération de la commande');
    }
  },

  /**
   * Mettre à jour le statut d'une commande (Admin)
   */
  async updateOrderStatus(id: number, status: OrderStatus) {
    try {
      const response = await apiClient.patch<Order>(`/api/orders/${id}/`, { status });
      return { data: response.data, status: response.status };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour de la commande');
    }
  },

  /**
   * Annuler une commande (Admin)
   */
  async cancelOrder(id: number) {
    try {
      const response = await apiClient.patch<Order>(`/api/orders/${id}/`, { status: 'cancelled' });
      return { data: response.data, status: response.status };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de l\'annulation de la commande');
    }
  },
};
