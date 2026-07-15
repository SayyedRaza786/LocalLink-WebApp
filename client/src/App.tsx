import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CustomThemeProvider } from './context/ThemeContext';
import AppRoutes from './routes/AppRoutes';

// Initialize TanStack Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Prevents aggressive background refreshes
      retry: 1, // Retries failed requests once before showing error
      staleTime: 5 * 60 * 1000, // Cache query results for 5 minutes
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <CustomThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4500,
                style: {
                  borderRadius: '8px',
                  background: '#334155',
                  color: '#fff',
                  fontFamily: '"Inter", sans-serif',
                  fontWeight: 500,
                },
              }}
            />
            <AppRoutes />
          </BrowserRouter>
        </AuthProvider>
      </CustomThemeProvider>
    </QueryClientProvider>
  );
};
export default App;
