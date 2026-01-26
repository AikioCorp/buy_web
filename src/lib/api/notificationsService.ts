/**
 * Service de gestion des notifications
 */

import { apiClient } from './apiClient';

export interface Notification {
  id: number;
  type: 'order' | 'message' | 'promotion' | 'system';
  title: string;
  message: string;
  is_read: boolean;
  data?: any;
  created_at: string;
}

export interface NotificationsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Notification[];
  unread_count: number;
}

class NotificationsService {
  async getNotifications(page: number = 1) {
    return apiClient.get<NotificationsResponse>(`/customers/notifications/?page=${page}`);
  }

  async getNotification(id: number) {
    return apiClient.get<Notification>(`/customers/notifications/${id}/`);
  }

  async markAsRead(id: number) {
    return apiClient.post(`/customers/notifications/${id}/mark_read/`);
  }

  async markAllAsRead() {
    return apiClient.post('/customers/notifications/mark_all_read/');
  }

  async deleteNotification(id: number) {
    return apiClient.delete(`/customers/notifications/${id}/`);
  }

  async getUnreadCount() {
    const response = await this.getNotifications(1);
    return response.data?.unread_count || 0;
  }
}

export const notificationsService = new NotificationsService();
