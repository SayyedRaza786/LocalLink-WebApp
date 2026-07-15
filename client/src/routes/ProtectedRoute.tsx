import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Role } from '../types';
import { Box, CircularProgress } from '@mui/material';

interface ProtectedRouteProps {
  allowedRoles?: Role[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: 'background.default',
        }}
      >
        <CircularProgress color="primary" size={50} />
      </Box>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login but save current location for post-login redirect
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Authenticated but does not have permission
    return <Navigate to="/unauthorized" replace />;
  }

  // Render child routes
  return <Outlet />;
};
export default ProtectedRoute;
