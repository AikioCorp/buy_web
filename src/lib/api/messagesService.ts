/**
 * Service de gestion des messages
 */

import { apiClient } from './apiClient';

export interface Participant {
  id: number;
  user_id?: string;
  shop_id?: number;
  user?: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    avatar_url?: string;
    email?: string;
  };
  shop?: {
    id: number;
    name: string;
    logo_url?: string;
  };
}

export interface Message {
  id: number;
  conversation_id: number;
  content: string;
  message_type: string;
  is_read: boolean;
  created_at: string;
  sender_user_id?: string;
  sender_shop_id?: number;
  sender_user?: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
  sender_shop?: {
    id: number;
    name: string;
    logo_url?: string;
  };
}

export interface Conversation {
  id: number;
  type: 'direct' | 'shop_client' | 'shop_shop';
  participants: Participant[];
  last_message?: Message;
  unread_count: number;
  created_at: string;
  updated_at: string;
}

export interface CreateConversationData {
  target_user_id?: string;
  target_shop_id?: number;
  from_shop_id?: number;
}

export interface SendMessageData {
  content: string;
  from_shop_id?: number;
}

class MessagesService {
  // ==================== USER ROUTES ====================
  
  async getConversations() {
    return apiClient.get<Conversation[]>('/api/messages/conversations');
  }

  async createConversation(data: CreateConversationData) {
    return apiClient.post<{ id: number; existing: boolean }>('/api/messages/conversations', data);
  }

  async getMessages(conversationId: number, page: number = 1, limit: number = 50) {
    return apiClient.get<{ results: Message[]; count: number; page: number; total_pages: number }>(
      `/api/messages/conversations/${conversationId}/messages?page=${page}&limit=${limit}`
    );
  }

  async sendMessage(conversationId: number, data: SendMessageData) {
    return apiClient.post<Message>(`/api/messages/conversations/${conversationId}/messages`, data);
  }

  async markAsRead(conversationId: number) {
    return apiClient.post(`/api/messages/conversations/${conversationId}/read`, {});
  }

  // ==================== ADMIN ROUTES ====================

  async getAllConversations(page: number = 1, limit: number = 20, type?: string) {
    let url = `/api/admin/messages/conversations?page=${page}&limit=${limit}`;
    if (type) url += `&type=${type}`;
    return apiClient.get<{ results: Conversation[]; count: number; page: number; total_pages: number }>(url);
  }

  async getConversationMessagesAdmin(conversationId: number, page: number = 1, limit: number = 100) {
    return apiClient.get<{ results: Message[]; count: number }>(
      `/api/admin/messages/conversations/${conversationId}/messages?page=${page}&limit=${limit}`
    );
  }

  async sendAdminMessage(conversationId: number, content: string) {
    return apiClient.post<Message>(`/api/admin/messages/conversations/${conversationId}/messages`, { content });
  }

  async sendDirectToUser(userId: string, content: string) {
    return apiClient.post<{ message: Message; conversation_id: number }>('/api/admin/messages/send-to-user', { user_id: userId, content });
  }
}

export const messagesService = new MessagesService();
