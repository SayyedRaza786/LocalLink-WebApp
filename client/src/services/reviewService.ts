import { apiClient } from '../api/apiClient';
import type { Review, ApiResponseEnvelope } from '../types';

export const reviewService = {
  create: async (data: {
    bookingId: string;
    rating: number;
    comment?: string | null;
  }): Promise<Review> => {
    const response = await apiClient.post<ApiResponseEnvelope<Review>>('/reviews', data);
    return response.data.data;
  },

  update: async (id: string, data: { rating?: number; comment?: string | null }): Promise<Review> => {
    const response = await apiClient.patch<ApiResponseEnvelope<Review>>(`/reviews/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/reviews/${id}`);
  },
};
export default reviewService;
