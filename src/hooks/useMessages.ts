/**
 * Hook personnalisé pour la gestion des messages
 */

import { useState, useEffect } from 'react';
import { messagesService, type Conversation, type Message, type SendMessageData } from '../lib/api';

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
        setConversations(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des conversations');
    } finally {
      setIsLoading(false);
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
        setMessages(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des messages');
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (data: SendMessageData) => {
    try {
      const response = await messagesService.sendMessage(data);
      if (response.data) {
        await loadMessages();
        return { success: true, data: response.data };
      }
      return { success: false, error: response.error };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Erreur' };
    }
  };

  const markAsRead = async (messageId: number) => {
    try {
      const response = await messagesService.markAsRead(messageId);
      if (!response.error) {
        await loadMessages();
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
