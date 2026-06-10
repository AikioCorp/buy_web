import { apiClient } from './apiClient';

// ── Providers TouchPay (API directe) ──────────────────────────────────────
export type TouchPayProvider = 'orange_money' | 'moov_money' | 'wave';

// ── Providers InTouch (SDK client-side) ───────────────────────────────────
export type IntouchProvider = 'orange_money' | 'moov_money' | 'wave';

// ── Gateway de paiement ───────────────────────────────────────────────────
export type PaymentGateway = 'touchpay' | 'intouch';

export type MobileMoneyProvider = TouchPayProvider;

export const PROVIDER_LABELS: Record<string, string> = {
  orange_money: 'Orange Money',
  moov_money:   'Moov Money',
  wave:         'Wave',
};

export const PROVIDER_COLORS: Record<string, string> = {
  orange_money: '#FF6600',
  moov_money:   '#0055A5',
  wave:         '#1CCAD8',
};

export type TransactionStatus = 'initiated' | 'pending' | 'completed' | 'failed' | 'expired';

// ── TouchPay ─────────────────────────────────────────────────────────────
export interface InitiatePaymentParams {
  order_id:     number;
  provider:     MobileMoneyProvider;
  phone_number: string;
}

export interface InitiatePaymentResult {
  success:                 boolean;
  transaction_id:          number;
  touchpay_transaction_id?: string;
  provider:                MobileMoneyProvider;
  status:                  TransactionStatus;
  payment_url?:            string;
  message:                 string;
}

export interface PaymentStatusResult {
  transaction_id: number;
  status:         TransactionStatus;
  provider:       MobileMoneyProvider;
  amount:         number;
  payment_url?:   string;
  updated_at:     string;
}

// ── InTouch ───────────────────────────────────────────────────────────────
export interface IntouchInitiateParams {
  order_id:        number;
  phone_number:    string;
  provider?:       IntouchProvider;
  customer_email?: string;
}

export interface IntouchInitiateResult {
  success:        boolean;
  transaction_id: number;
  reference:      string;
  payment_url:    string;   // URL vers /payment/intouch?...
  sdk_config:     {
    agencyCode:  string;
    amount:      number;
    reference:   string;
    returnUrl:   string;
    cancelUrl:   string;
    notifUrl:    string;
    clientPhone: string;
    clientEmail: string;
  };
  provider:   string;
  status:     TransactionStatus;
  message:    string;
}

export interface IntouchStatusResult {
  transaction_id: number;
  reference:      string;
  status:         TransactionStatus;
  provider:       string;
  amount:         number;
  payment_url?:   string;
  updated_at:     string;
}

// ── Service ───────────────────────────────────────────────────────────────
class MobileMoneyService {
  // TouchPay
  async initiatePayment(params: InitiatePaymentParams) {
    return apiClient.post<InitiatePaymentResult>('/api/payments/initiate', params);
  }
  async checkStatus(transactionId: number) {
    return apiClient.get<PaymentStatusResult>(`/api/payments/${transactionId}/status`);
  }

  // InTouch
  async initiateIntouchPayment(params: IntouchInitiateParams) {
    return apiClient.post<IntouchInitiateResult>('/api/payments/intouch/initiate', params);
  }
  async checkIntouchStatus(transactionId: number) {
    return apiClient.get<IntouchStatusResult>(`/api/payments/intouch/${transactionId}/status`);
  }
}

export const mobileMoneyService = new MobileMoneyService();
