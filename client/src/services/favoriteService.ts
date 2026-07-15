import { apiClient } from '../api/apiClient';
import type { Favorite, ApiResponseEnvelope, PaginatedResponseEnvelope } from '../types';

export const favoriteService = {
  list: async (page?: number, limit?: number): Promise<PaginatedResponseEnvelope<Favorite>> => {
    const response = await apiClient.get<PaginatedResponseEnvelope<Favorite>>('/favorites', {
      params: { page, limit },
    });
    return response.data;
  },

  add: async (providerId: string): Promise<Favorite> => {
    const response = await apiClient.post<ApiResponseEnvelope<Favorite>>(`/favorites/${providerId}`);
    return response.data.data;
  },

  remove: async (providerId: string): Promise<void> => {
    await apiClient.delete(`/favorites/${providerId}`);
  },
};
export default favoriteService;
