/**
 * Service de gestion des notifications
 */

import { apiClient } from './apiClient';

export interface Notification {
  id: number;
  type: 'order' | 'user' | 'shop' | 'product' | 'message' | 'promotion' | 'system' | 'info';
  title: string;
  content: string;
  link?: string;
  is_read: boolean;
  data?: any;
  created_at: string;
  read_at?: string;
}

export interface NotificationsResponse {
  count: number;
  page: number;
  total_pages: number;
  results: Notification[];
  unread_count: number;
}

export interface UnreadCountResponse {
  count: number;
}

export interface SendNotificationData {
  title: string;
  content: string;
  type?: 'info' | 'promotion' | 'system' | 'order' | 'message';
  link?: string;
}

class NotificationsService {
  async getNotifications(page: number = 1, limit: number = 20) {
    return apiClient.get<NotificationsResponse>(`/api/notifications?page=${page}&limit=${limit}`);
  }

  async getUnreadCount() {
    return apiClient.get<UnreadCountResponse>('/api/notifications/unread-count');
  }

  async markAsRead(id: number) {
    return apiClient.post(`/api/notifications/${id}/read`, {});
  }

  async markAllAsRead() {
    return apiClient.post('/api/notifications/read-all', {});
  }

  async deleteNotification(id: number) {
    return apiClient.delete(`/api/notifications/${id}`);
  }

  // ==================== ADMIN FUNCTIONS ====================

  async getAllNotifications(page: number = 1, limit: number = 20, targetType?: string) {
    let url = `/api/admin/notifications?page=${page}&limit=${limit}`;
    if (targetType) url += `&target_type=${targetType}`;
    return apiClient.get<NotificationsResponse>(url);
  }

  async sendToUser(userId: string, data: SendNotificationData) {
    return apiClient.post('/api/admin/notifications/send-to-user', { user_id: userId, ...data });
  }

  async sendToAll(data: SendNotificationData) {
    return apiClient.post('/api/admin/notifications/send-to-all', data);
  }

  async sendToUserType(targetType: 'clients' | 'sellers' | 'admins', data: SendNotificationData) {
    return apiClient.post('/api/admin/notifications/send-to-type', { target_type: targetType, ...data });
  }

  async sendToShop(shopId: number, data: SendNotificationData) {
    return apiClient.post('/api/admin/notifications/send-to-shop', { shop_id: shopId, ...data });
  }

  async deleteNotificationAdmin(id: number) {
    return apiClient.delete(`/api/admin/notifications/${id}`);
  }
}

export const notificationsService = new NotificationsService();
