import { apiClient } from '../api/apiClient';
import type { Booking, ApiResponseEnvelope, PaginatedResponseEnvelope } from '../types';

export const bookingService = {
  create: async (data: {
    providerId: string;
    serviceId: string;
    scheduledDate: string; // YYYY-MM-DD
    scheduledTime: string; // HH:MM
    address: string;
    latitude?: number;
    longitude?: number;
    notes?: string;
  }): Promise<Booking> => {
    const response = await apiClient.post<ApiResponseEnvelope<Booking>>('/bookings', data);
    return response.data.data;
  },

  list: async (params: {
    page?: number;
    limit?: number;
    status?: string; // comma separated status values
    role?: 'customer' | 'provider';
  }): Promise<PaginatedResponseEnvelope<Booking>> => {
    const response = await apiClient.get<PaginatedResponseEnvelope<Booking>>('/bookings', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Booking> => {
    const response = await apiClient.get<ApiResponseEnvelope<Booking>>(`/bookings/${id}`);
    return response.data.data;
  },

  accept: async (id: string): Promise<Booking> => {
    const response = await apiClient.patch<ApiResponseEnvelope<Booking>>(`/bookings/${id}/accept`);
    return response.data.data;
  },

  reject: async (id: string, reason?: string): Promise<Booking> => {
    const response = await apiClient.patch<ApiResponseEnvelope<Booking>>(`/bookings/${id}/reject`, {
      reason,
    });
    return response.data.data;
  },

  onTheWay: async (id: string): Promise<Booking> => {
    const response = await apiClient.patch<ApiResponseEnvelope<Booking>>(`/bookings/${id}/on-the-way`);
    return response.data.data;
  },

  start: async (id: string): Promise<Booking> => {
    const response = await apiClient.patch<ApiResponseEnvelope<Booking>>(`/bookings/${id}/start`);
    return response.data.data;
  },

  complete: async (id: string, finalPrice?: number): Promise<Booking> => {
    const response = await apiClient.patch<ApiResponseEnvelope<Booking>>(`/bookings/${id}/complete`, {
      finalPrice,
    });
    return response.data.data;
  },

  cancel: async (id: string, reason: string): Promise<Booking> => {
    const response = await apiClient.patch<ApiResponseEnvelope<Booking>>(`/bookings/${id}/cancel`, {
      reason,
    });
    return response.data.data;
  },
};
export default bookingService;
