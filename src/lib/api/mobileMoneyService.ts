import { apiClient } from './apiClient';

export type MobileMoneyProvider = 'orange_money' | 'moov_money' | 'wave';

export const PROVIDER_LABELS: Record<MobileMoneyProvider, string> = {
  orange_money: 'Orange Money',
  moov_money: 'Moov Money',
  wave: 'Wave',
};

export const PROVIDER_COLORS: Record<MobileMoneyProvider, string> = {
  orange_money: '#FF6600',
  moov_money: '#0055A5',
  wave: '#1CCAD8',
};

export type TransactionStatus = 'initiated' | 'pending' | 'completed' | 'failed' | 'expired';

export interface InitiatePaymentParams {
  order_id: number;
  provider: MobileMoneyProvider;
  phone_number: string;
}

export interface InitiatePaymentResult {
  success: boolean;
  transaction_id: number;
  touchpay_transaction_id?: string;
  provider: MobileMoneyProvider;
  status: TransactionStatus;
  payment_url?: string; // Wave only
  message: string;
}

export interface PaymentStatusResult {
  transaction_id: number;
  status: TransactionStatus;
  provider: MobileMoneyProvider;
  amount: number;
  payment_url?: string;
  updated_at: string;
}

class MobileMoneyService {
  async initiatePayment(params: InitiatePaymentParams) {
    return apiClient.post<InitiatePaymentResult>('/api/payments/initiate', params);
  }

  async checkStatus(transactionId: number) {
    return apiClient.get<PaymentStatusResult>(`/api/payments/${transactionId}/status`);
  }
}

export const mobileMoneyService = new MobileMoneyService();
