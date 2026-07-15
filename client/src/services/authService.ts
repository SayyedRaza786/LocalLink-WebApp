import { apiClient } from '../api/apiClient';
import { tokenStore } from '../api/tokenStore';
import { User, ApiResponseEnvelope } from '../types';

export const authService = {
  login: async (email: string, password: string): Promise<User> => {
    const response = await apiClient.post<ApiResponseEnvelope<{ user: User; accessToken: string }>>(
      '/auth/login',
      { email, password }
    );
    const { user, accessToken } = response.data.data;
    tokenStore.setAccessToken(accessToken);
    return user;
  },

  register: async (data: any): Promise<User> => {
    const response = await apiClient.post<ApiResponseEnvelope<{ user: User; accessToken: string }>>(
      '/auth/register',
      data
    );
    const { user, accessToken } = response.data.data;
    tokenStore.setAccessToken(accessToken);
    return user;
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      tokenStore.clearAccessToken();
    }
  },

  refresh: async (): Promise<string> => {
    const response = await apiClient.post<ApiResponseEnvelope<{ accessToken: string }>>(
      '/auth/refresh'
    );
    const { accessToken } = response.data.data;
    tokenStore.setAccessToken(accessToken);
    return accessToken;
  },
};
export default authService;
