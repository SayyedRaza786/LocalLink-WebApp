import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { tokenStore } from './tokenStore';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Crucial for sending/receiving the HttpOnly refresh token cookie
});

// Flag to prevent multiple parallel refresh token calls
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (token) {
      prom.resolve(token);
    } else {
      prom.reject(error);
    }
  });
  failedQueue = [];
};

// Request interceptor: Inject Access Token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenStore.getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Handle 401 and Token Refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If request failed with 401 and hasn't been retried yet
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      
      // If we are already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      // Check if the request was to login or register (no refresh needed)
      if (
        originalRequest.url?.includes('/auth/login') ||
        originalRequest.url?.includes('/auth/register')
      ) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Call refresh token endpoint (sends the HttpOnly cookie automatically)
        const refreshUrl = (import.meta.env.VITE_API_URL || '/api/v1') + '/auth/refresh';
        const response = await axios.post(
          refreshUrl,
          {},
          { withCredentials: true }
        );

        if (response.data?.success && response.data?.data?.accessToken) {
          const newAccessToken = response.data.data.accessToken;
          tokenStore.setAccessToken(newAccessToken);
          
          processQueue(null, newAccessToken);
          
          // Re-run original request
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }
          return apiClient(originalRequest);
        } else {
          throw new Error('Refresh failed');
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        tokenStore.clearAccessToken();
        
        // Log out user & redirect to login page (silently, without popup alerts)
        // Check if we are already on login page to avoid redirect loops
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login?expired=true';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Wrap structured API validation errors so components can read field errors
    return Promise.reject(error);
  }
);
