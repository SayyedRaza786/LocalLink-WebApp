import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types';
import { tokenStore } from '../api/tokenStore';
import { apiClient } from '../api/apiClient';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Recover session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Attempt token refresh
        const response = await apiClient.post('/auth/refresh');
        if (response.data?.success && response.data?.data?.accessToken) {
          tokenStore.setAccessToken(response.data.data.accessToken);
          
          // Retrieve profile details
          const profileResponse = await apiClient.get('/users/me');
          if (profileResponse.data?.success) {
            setUser(profileResponse.data.data);
          }
        }
      } catch (err) {
        // Silent catch: User is guest
        tokenStore.clearAccessToken();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      if (response.data?.success && response.data?.data) {
        const { user: loggedInUser, accessToken } = response.data.data;
        tokenStore.setAccessToken(accessToken);
        setUser(loggedInUser);
      }
    } catch (error) {
      tokenStore.clearAccessToken();
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (registerData: any) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post('/auth/register', registerData);
      if (response.data?.success && response.data?.data) {
        const { user: registeredUser, accessToken } = response.data.data;
        tokenStore.setAccessToken(accessToken);
        setUser(registeredUser);
      }
    } catch (error) {
      tokenStore.clearAccessToken();
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await apiClient.post('/auth/logout');
    } catch (err) {
      console.warn('Logout request failed', err);
    } finally {
      tokenStore.clearAccessToken();
      setUser(null);
      setIsLoading(false);
      window.location.href = '/login';
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
