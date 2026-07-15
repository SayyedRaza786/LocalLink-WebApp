import { apiClient } from '../api/apiClient';
import type { User, ApiResponseEnvelope } from '../types';

export const userService = {
  getMe: async (): Promise<User> => {
    const response = await apiClient.get<ApiResponseEnvelope<User>>('/users/me');
    return response.data.data;
  },

  updateProfile: async (data: {
    firstName?: string;
    lastName?: string;
    phone?: string | null;
    avatarUrl?: string | null;
  }): Promise<User> => {
    const response = await apiClient.patch<ApiResponseEnvelope<User>>('/users/me', data);
    return response.data.data;
  },

  changePassword: async (data: any): Promise<void> => {
    await apiClient.patch('/users/me/password', data);
  },
};
export default userService;
