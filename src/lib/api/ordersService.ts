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

export interface CreateOrderData {
  shipping_address_id: number;
  items: Array<{
    product_id: number;
    quantity: number;
  }>;
}

export interface OrdersListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Order[];
}

export const ordersService = {
  /**
   * Récupérer toutes mes commandes
   */
  async getOrders() {
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
   */
  async createOrder(data: CreateOrderData) {
    return apiClient.post<Order>('/api/orders/', data);
  },

  // ========== ADMIN ENDPOINTS ==========

  /**
   * Récupérer toutes les commandes (Admin)
   */
  async getAllOrdersAdmin(params?: {
    page?: number;
    status?: OrderStatus;
    search?: string;
  }) {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.status) queryParams.append('status', params.status);
      if (params?.search) queryParams.append('search', params.search);

      // Utiliser /api/orders/ car /api/admin/orders/ peut ne pas exister
      const endpoint = `/api/orders/${queryParams.toString() ? `?${queryParams}` : ''}`;
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
      return { 
        data: { count: 0, next: null, previous: null, results: [] }, 
        status: error.response?.status || 500 
      };
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
