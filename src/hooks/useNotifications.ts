/**
 * Hook personnalisé pour la gestion des notifications
 */

import { useState, useEffect } from 'react';
import { notificationsService, type Notification } from '../lib/api';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await notificationsService.getNotifications();

      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        setNotifications(response.data.results);
        setUnreadCount(response.data.unread_count);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      const response = await notificationsService.markAsRead(id);
      if (!response.error) {
        await loadNotifications();
        return { success: true };
      }
      return { success: false, error: response.error };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Erreur' };
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await notificationsService.markAllAsRead();
      if (!response.error) {
        await loadNotifications();
        return { success: true };
      }
      return { success: false, error: response.error };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Erreur' };
    }
  };

  const deleteNotification = async (id: number) => {
    try {
      const response = await notificationsService.deleteNotification(id);
      if (!response.error) {
        await loadNotifications();
        return { success: true };
      }
      return { success: false, error: response.error };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Erreur' };
    }
  };

  const refresh = () => {
    loadNotifications();
  };

  return {
    notifications,
    isLoading,
    error,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh,
  };
}
