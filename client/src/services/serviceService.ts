import { apiClient } from '../api/apiClient';
import type { Service, ServiceImage, ApiResponseEnvelope, PaginatedResponseEnvelope } from '../types';

export const serviceService = {
  list: async (params: any): Promise<PaginatedResponseEnvelope<Service>> => {
    const response = await apiClient.get<PaginatedResponseEnvelope<Service>>('/services', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Service> => {
    const response = await apiClient.get<ApiResponseEnvelope<Service>>(`/services/${id}`);
    return response.data.data;
  },

  create: async (data: {
    categoryId: string;
    name: string;
    description?: string;
    price: number;
    priceType: string;
    durationMinutes?: number;
  }): Promise<Service> => {
    const response = await apiClient.post<ApiResponseEnvelope<Service>>('/services', data);
    return response.data.data;
  },

  update: async (id: string, data: Partial<Service>): Promise<Service> => {
    const response = await apiClient.patch<ApiResponseEnvelope<Service>>(`/services/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/services/${id}`);
  },

  addImage: async (
    serviceId: string,
    data: { imageUrl: string; sortOrder?: number }
  ): Promise<ServiceImage> => {
    const response = await apiClient.post<ApiResponseEnvelope<ServiceImage>>(`/services/${serviceId}/images`, data);
    return response.data.data;
  },

  deleteImage: async (serviceId: string, imageId: string): Promise<void> => {
    await apiClient.delete(`/services/${serviceId}/images/${imageId}`);
  },
};
export default serviceService;
