import { apiClient } from '../api/apiClient';
import type { Category, ApiResponseEnvelope } from '../types';

export const categoryService = {
  listActive: async (): Promise<Category[]> => {
    const response = await apiClient.get<ApiResponseEnvelope<Category[]>>('/categories');
    return response.data.data;
  },

  listAll: async (): Promise<Category[]> => {
    const response = await apiClient.get<ApiResponseEnvelope<Category[]>>('/categories/admin/all');
    return response.data.data;
  },

  getBySlug: async (slug: string): Promise<Category> => {
    const response = await apiClient.get<ApiResponseEnvelope<Category>>(`/categories/${slug}`);
    return response.data.data;
  },

  create: async (data: { name: string; slug: string; description?: string; icon?: string; sortOrder?: number }): Promise<Category> => {
    const response = await apiClient.post<ApiResponseEnvelope<Category>>('/categories', data);
    return response.data.data;
  },

  update: async (id: string, data: Partial<Category>): Promise<Category> => {
    const response = await apiClient.patch<ApiResponseEnvelope<Category>>(`/categories/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/categories/${id}`);
  },
};
export default categoryService;
