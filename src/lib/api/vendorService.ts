/**
 * Service for vendor dashboard stats, revenue, and withdrawals
 */
import { apiClient } from './apiClient';

export interface VendorStats {
  has_shop: boolean;
  shop_id: number | null;
  shop_name?: string;
  shop_active?: boolean;
  products_count: number;
  orders_count: number;
  pending_orders: number;
  revenue_total: number;
  revenue_month: number;
  revenue_available: number;
  pending_withdrawals: number;
  total_paid_out?: number;
}

export interface WithdrawalMethod {
  id: string;
  name: string;
  fee_percent: number;
  min_fee: number;
  max_fee: number;
  estimated_fee: number;
  net_amount: number;
}

export interface WithdrawalRequest {
  id: number;
  vendor_id: string;
  shop_id: number;
  amount: number;
  transfer_fee: number;
  net_amount: number;
  method: string;
  method_name: string;
  phone_number?: string;
  account_name?: string;
  notes?: string;
  admin_notes?: string;
  status: 'pending' | 'approved' | 'rejected' | 'processing' | 'completed';
  processed_by?: string;
  processed_at?: string;
  created_at: string;
  updated_at: string;
  stores?: { id: number; name: string; slug: string };
}

export interface AdminRevenueStats {
  total_orders: number;
  delivered_orders: number;
  total_revenue: number;
  month_revenue: number;
  pending_withdrawals_count: number;
  pending_withdrawals_amount: number;
  total_paid_out: number;
  active_shops: number;
  platform_balance: number;
}

export interface ShopRevenue {
  id: number;
  name: string;
  slug: string;
  owner_id: string;
  is_active: boolean;
  created_at: string;
  total_revenue: number;
  total_paid_out: number;
  pending_payout: number;
  available_balance: number;
}

export const vendorService = {
  // ========== VENDOR ENDPOINTS ==========

  /** Get lightweight vendor dashboard stats */
  async getStats() {
    return apiClient.get<VendorStats>('/api/vendor/stats');
  },

  /** Get vendor revenue transactions */
  async getRevenue(params?: { page?: number; page_size?: number }) {
    const q = new URLSearchParams();
    if (params?.page) q.append('page', params.page.toString());
    if (params?.page_size) q.append('page_size', params.page_size.toString());
    return apiClient.get<{ transactions: any[]; total: number; page: number; page_size: number }>(
      `/api/vendor/revenue${q.toString() ? `?${q}` : ''}`
    );
  },

  /** Get available withdrawal methods with fees */
  async getWithdrawalMethods(amount?: number) {
    const q = amount ? `?amount=${amount}` : '';
    return apiClient.get<WithdrawalMethod[]>(`/api/vendor/withdrawal-methods${q}`);
  },

  /** Create a withdrawal request */
  async createWithdrawal(data: {
    amount: number;
    method: string;
    phone_number?: string;
    account_name?: string;
    notes?: string;
  }) {
    return apiClient.post<WithdrawalRequest>('/api/vendor/withdrawals', data);
  },

  /** Get my withdrawal requests */
  async getMyWithdrawals(params?: { page?: number; status?: string }) {
    const q = new URLSearchParams();
    if (params?.page) q.append('page', params.page.toString());
    if (params?.status) q.append('status', params.status);
    return apiClient.get<{ withdrawals: WithdrawalRequest[]; total: number }>(
      `/api/vendor/withdrawals${q.toString() ? `?${q}` : ''}`
    );
  },

  // ========== ADMIN ENDPOINTS ==========

  /** Get admin global revenue stats */
  async getAdminRevenueStats() {
    return apiClient.get<AdminRevenueStats>('/api/admin/revenue/stats');
  },

  /** Get revenue per shop */
  async getRevenueByShop(params?: { page?: number; search?: string }) {
    const q = new URLSearchParams();
    if (params?.page) q.append('page', params.page.toString());
    if (params?.search) q.append('search', params.search);
    return apiClient.get<{ shops: ShopRevenue[]; total: number }>(
      `/api/admin/revenue/shops${q.toString() ? `?${q}` : ''}`
    );
  },

  /** Get all withdrawal requests (admin) */
  async getAllWithdrawals(params?: { page?: number; status?: string; search?: string; shop_id?: number }) {
    const q = new URLSearchParams();
    if (params?.page) q.append('page', params.page.toString());
    if (params?.status) q.append('status', params.status);
    if (params?.search) q.append('search', params.search);
    if (params?.shop_id) q.append('shop_id', params.shop_id.toString());
    return apiClient.get<{ withdrawals: WithdrawalRequest[]; total: number }>(
      `/api/admin/withdrawals${q.toString() ? `?${q}` : ''}`
    );
  },

  /** Update withdrawal status (admin) */
  async updateWithdrawalStatus(id: number, status: string, admin_notes?: string) {
    return apiClient.patch<WithdrawalRequest>(`/api/admin/withdrawals/${id}`, { status, admin_notes });
  },
};
