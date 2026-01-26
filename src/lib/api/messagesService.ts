/**
 * Service de gestion des messages
 */

import { apiClient } from './apiClient';

export interface Message {
  id: number;
  conversation_id: number;
  sender: {
    id: number;
    username: string;
    full_name: string;
  };
  receiver: {
    id: number;
    username: string;
    full_name: string;
  };
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface Conversation {
  id: number;
  other_user: {
    id: number;
    username: string;
    full_name: string;
  };
  last_message: Message | null;
  unread_count: number;
  created_at: string;
  updated_at: string;
}

export interface SendMessageData {
  receiver_id: number;
  content: string;
}

class MessagesService {
  async getConversations() {
    return apiClient.get<Conversation[]>('/customers/conversations/');
  }

  async getConversation(id: number) {
    return apiClient.get<Conversation>(`/customers/conversations/${id}/`);
  }

  async getMessages(conversationId: number) {
    return apiClient.get<Message[]>(`/customers/conversations/${conversationId}/messages/`);
  }

  async sendMessage(data: SendMessageData) {
    return apiClient.post<Message>('/customers/messages/', data);
  }

  async markAsRead(messageId: number) {
    return apiClient.post(`/customers/messages/${messageId}/mark_read/`);
  }

  async markConversationAsRead(conversationId: number) {
    return apiClient.post(`/customers/conversations/${conversationId}/mark_read/`);
  }
}

export const messagesService = new MessagesService();
