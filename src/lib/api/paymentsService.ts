/**
 * Service de gestion des moyens de paiement
 */

import { apiClient } from './apiClient';

export interface PaymentMethod {
  id: number;
  type: 'card' | 'mobile_money' | 'bank_transfer';
  label: string;
  details: {
    card_last4?: string;
    card_brand?: string;
    phone_number?: string;
    account_number?: string;
    bank_name?: string;
  };
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatePaymentMethodData {
  type: 'card' | 'mobile_money' | 'bank_transfer';
  label: string;
  details: {
    card_number?: string;
    card_expiry?: string;
    card_cvv?: string;
    phone_number?: string;
    account_number?: string;
    bank_name?: string;
  };
  is_default?: boolean;
}

class PaymentsService {
  async getPaymentMethods() {
    return apiClient.get<PaymentMethod[]>('/customers/payment-methods/');
  }

  async getPaymentMethod(id: number) {
    return apiClient.get<PaymentMethod>(`/customers/payment-methods/${id}/`);
  }

  async createPaymentMethod(data: CreatePaymentMethodData) {
    return apiClient.post<PaymentMethod>('/customers/payment-methods/', data);
  }

  async updatePaymentMethod(id: number, data: Partial<CreatePaymentMethodData>) {
    return apiClient.put<PaymentMethod>(`/customers/payment-methods/${id}/`, data);
  }

  async deletePaymentMethod(id: number) {
    return apiClient.delete(`/customers/payment-methods/${id}/`);
  }

  async setDefaultPaymentMethod(id: number) {
    return apiClient.post(`/customers/payment-methods/${id}/set_default/`);
  }
}

export const paymentsService = new PaymentsService();
