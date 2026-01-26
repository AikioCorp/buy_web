/**
 * Hook personnalisé pour la gestion des moyens de paiement
 */

import { useState, useEffect } from 'react';
import { paymentsService, type PaymentMethod, type CreatePaymentMethodData } from '../lib/api';

export function usePayments() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await paymentsService.getPaymentMethods();

      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        setPaymentMethods(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des moyens de paiement');
    } finally {
      setIsLoading(false);
    }
  };

  const createPaymentMethod = async (data: CreatePaymentMethodData) => {
    try {
      const response = await paymentsService.createPaymentMethod(data);
      if (response.data) {
        await loadPaymentMethods();
        return { success: true, data: response.data };
      }
      return { success: false, error: response.error };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Erreur' };
    }
  };

  const updatePaymentMethod = async (id: number, data: Partial<CreatePaymentMethodData>) => {
    try {
      const response = await paymentsService.updatePaymentMethod(id, data);
      if (response.data) {
        await loadPaymentMethods();
        return { success: true, data: response.data };
      }
      return { success: false, error: response.error };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Erreur' };
    }
  };

  const deletePaymentMethod = async (id: number) => {
    try {
      const response = await paymentsService.deletePaymentMethod(id);
      if (!response.error) {
        await loadPaymentMethods();
        return { success: true };
      }
      return { success: false, error: response.error };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Erreur' };
    }
  };

  const setDefaultPaymentMethod = async (id: number) => {
    try {
      const response = await paymentsService.setDefaultPaymentMethod(id);
      if (!response.error) {
        await loadPaymentMethods();
        return { success: true };
      }
      return { success: false, error: response.error };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Erreur' };
    }
  };

  const refresh = () => {
    loadPaymentMethods();
  };

  return {
    paymentMethods,
    isLoading,
    error,
    createPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    setDefaultPaymentMethod,
    refresh,
  };
}
