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
};
