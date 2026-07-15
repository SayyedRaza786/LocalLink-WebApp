import { apiClient } from '../api/apiClient';
import type { Notification, ApiResponseEnvelope, PaginatedResponseEnvelope } from '../types';

export const notificationService = {
  list: async (params?: { page?: number; limit?: number; isRead?: string }): Promise<PaginatedResponseEnvelope<Notification>> => {
    const response = await apiClient.get<PaginatedResponseEnvelope<Notification>>('/notifications', {
      params,
    });
    return response.data;
  },

  markAsRead: async (id: string): Promise<Notification> => {
    const response = await apiClient.patch<ApiResponseEnvelope<Notification>>(`/notifications/${id}/read`);
    return response.data.data;
  },

  markAllAsRead: async (): Promise<void> => {
    await apiClient.patch('/notifications/read-all');
  },
};
export default notificationService;
