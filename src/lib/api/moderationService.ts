/**
 * Service de modération
 */

import { apiClient } from './apiClient';

export interface Report {
  id: number;
  type: 'product' | 'shop' | 'review' | 'user' | 'message';
  target_id: number;
  target_name: string;
  target_description?: string;
  reported_by: {
    id: number;
    name: string;
    email: string;
  };
  reason: string;
  details?: string;
  status: 'pending' | 'approved' | 'rejected' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  resolved_at?: string;
  resolved_by?: string;
}

export interface ReportFilters {
  type?: string;
  status?: string;
  priority?: string;
  page?: number;
  limit?: number;
}

export const moderationService = {
  /**
   * Get all reports for moderation
   */
  async getReports(filters?: ReportFilters) {
    const params = new URLSearchParams();
    if (filters?.type && filters.type !== 'all') params.append('type', filters.type);
    if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters?.priority && filters.priority !== 'all') params.append('priority', filters.priority);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    return await apiClient.get<{ results: Report[]; count: number }>(`/api/moderation/reports?${params.toString()}`);
  },

  /**
   * Get a single report
   */
  async getReport(id: number) {
    return await apiClient.get<Report>(`/api/moderation/reports/${id}`);
  },

  /**
   * Approve a report (take action against reported item)
   */
  async approveReport(id: number, action?: string) {
    return await apiClient.post(`/api/moderation/reports/${id}/approve`, { action });
  },

  /**
   * Reject a report (dismiss as invalid)
   */
  async rejectReport(id: number, reason?: string) {
    return await apiClient.post(`/api/moderation/reports/${id}/reject`, { reason });
  },

  /**
   * Create a new report
   */
  async createReport(data: {
    type: Report['type'];
    target_id: number;
    reason: string;
    details?: string;
  }) {
    return await apiClient.post<Report>('/api/moderation/reports', data);
  },

  /**
   * Get moderation stats
   */
  async getStats() {
    return await apiClient.get<{
      pending: number;
      approved: number;
      rejected: number;
      high_priority: number;
      by_type: Record<string, number>;
    }>('/api/moderation/stats');
  },
};
