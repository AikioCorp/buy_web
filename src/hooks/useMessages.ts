/**
 * Hook personnalisé pour la gestion des messages
 */

import { useState, useEffect } from 'react';
import { messagesService, type Conversation, type Message } from '../lib/api/messagesService';

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await messagesService.getConversations();

      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        // Handle both array and paginated response
        const data = Array.isArray(response.data) ? response.data : response.data;
        setConversations(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des conversations');
    } finally {
      setIsLoading(false);
    }
  };

  const createConversation = async (targetShopId?: number, targetUserId?: string) => {
    try {
      const response = await messagesService.createConversation({
        target_shop_id: targetShopId,
        target_user_id: targetUserId
      });
      if (response.data) {
        await loadConversations();
        return { success: true, conversationId: response.data.id };
      }
      return { success: false, error: response.error };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Erreur' };
    }
  };

  const refresh = () => {
    loadConversations();
  };

  return {
    conversations,
    isLoading,
    error,
    refresh,
    createConversation,
  };
}

export function useConversation(conversationId: number) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (conversationId) {
      loadMessages();
    }
  }, [conversationId]);

  const loadMessages = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await messagesService.getMessages(conversationId);

      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        // Handle paginated response
        const data = response.data.results || response.data;
        setMessages(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des messages');
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (content: string, fromShopId?: number) => {
    try {
      const response = await messagesService.sendMessage(conversationId, { content, from_shop_id: fromShopId });
      if (response.data) {
        await loadMessages();
        return { success: true, data: response.data };
      }
      return { success: false, error: response.error };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Erreur' };
    }
  };

  const markAsRead = async () => {
    try {
      const response = await messagesService.markAsRead(conversationId);
      if (!response.error) {
        return { success: true };
      }
      return { success: false, error: response.error };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Erreur' };
    }
  };

  const refresh = () => {
    loadMessages();
  };

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    markAsRead,
    refresh,
  };
}
