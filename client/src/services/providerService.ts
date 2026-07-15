import { apiClient } from '../api/apiClient';
import type {
  ProviderProfile,
  Review,
  Availability,
  ProviderGallery,
  ApiResponseEnvelope,
  PaginatedResponseEnvelope,
} from '../types';

export const providerService = {
  search: async (params: any): Promise<PaginatedResponseEnvelope<ProviderProfile & { distance: number | null }>> => {
    const response = await apiClient.get<PaginatedResponseEnvelope<ProviderProfile & { distance: number | null }>>(
      '/providers',
      { params }
    );
    return response.data;
  },

  getPublicProfile: async (id: string): Promise<ProviderProfile> => {
    const response = await apiClient.get<ApiResponseEnvelope<ProviderProfile>>(`/providers/${id}`);
    return response.data.data;
  },

  getReviews: async (id: string, page?: number, limit?: number): Promise<PaginatedResponseEnvelope<Review>> => {
    const response = await apiClient.get<PaginatedResponseEnvelope<Review>>(`/providers/${id}/reviews`, {
      params: { page, limit },
    });
    return response.data;
  },

  getOwnProfile: async (): Promise<ProviderProfile> => {
    const response = await apiClient.get<ApiResponseEnvelope<ProviderProfile>>('/providers/me/profile');
    return response.data.data;
  },

  upsertProfile: async (data: any): Promise<ProviderProfile> => {
    const response = await apiClient.put<ApiResponseEnvelope<ProviderProfile>>('/providers/me/profile', data);
    return response.data.data;
  },

  getAvailability: async (): Promise<Availability[]> => {
    const response = await apiClient.get<ApiResponseEnvelope<Availability[]>>('/providers/me/availability');
    return response.data.data;
  },

  setAvailability: async (slots: any[]): Promise<Availability[]> => {
    const response = await apiClient.put<ApiResponseEnvelope<Availability[]>>('/providers/me/availability', {
      slots,
    });
    return response.data.data;
  },

  getGallery: async (): Promise<ProviderGallery[]> => {
    const response = await apiClient.get<ApiResponseEnvelope<ProviderGallery[]>>('/providers/me/gallery');
    return response.data.data;
  },

  addGalleryImage: async (data: { imageUrl: string; caption?: string; sortOrder?: number }): Promise<ProviderGallery> => {
    const response = await apiClient.post<ApiResponseEnvelope<ProviderGallery>>('/providers/me/gallery', data);
    return response.data.data;
  },

  deleteGalleryImage: async (imageId: string): Promise<void> => {
    await apiClient.delete(`/providers/me/gallery/${imageId}`);
  },
};
export default providerService;
