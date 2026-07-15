import { apiClient } from '../api/apiClient';
import type { User, ProviderProfile, Report, ApiResponseEnvelope, PaginatedResponseEnvelope } from '../types';

export const adminService = {
  getDashboardStats: async (): Promise<any> => {
    const response = await apiClient.get<ApiResponseEnvelope<any>>('/admin/dashboard');
    return response.data.data;
  },

  listUsers: async (params?: {
    page?: number;
    limit?: number;
    q?: string;
    role?: string;
    isActive?: string;
  }): Promise<PaginatedResponseEnvelope<User>> => {
    const response = await apiClient.get<PaginatedResponseEnvelope<User>>('/admin/users', { params });
    return response.data;
  },

  updateUserStatus: async (id: string, isActive: boolean): Promise<User> => {
    const response = await apiClient.patch<ApiResponseEnvelope<User>>(`/admin/users/${id}/status`, {
      isActive,
    });
    return response.data.data;
  },

  listProviders: async (params?: {
    page?: number;
    limit?: number;
    q?: string;
    isVerified?: string;
    isAvailable?: string;
  }): Promise<PaginatedResponseEnvelope<ProviderProfile>> => {
    const response = await apiClient.get<PaginatedResponseEnvelope<ProviderProfile>>('/admin/providers', {
      params,
    });
    return response.data;
  },

  verifyProvider: async (id: string, isVerified: boolean): Promise<ProviderProfile> => {
    const response = await apiClient.patch<ApiResponseEnvelope<ProviderProfile>>(
      `/admin/providers/${id}/verify`,
      { isVerified }
    );
    return response.data.data;
  },

  listReports: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<PaginatedResponseEnvelope<Report>> => {
    const response = await apiClient.get<PaginatedResponseEnvelope<Report>>('/admin/reports', { params });
    return response.data;
  },

  resolveReport: async (
    id: string,
    data: { status: 'REVIEWED' | 'RESOLVED' | 'DISMISSED'; adminNotes?: string }
  ): Promise<Report> => {
    const response = await apiClient.patch<ApiResponseEnvelope<Report>>(`/admin/reports/${id}`, data);
    return response.data.data;
  },
};
export default adminService;
