import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CircularProgress, Box } from '@mui/material';

interface ProtectedRouteProps {
  children: React.ReactElement;
  requireEditor?: boolean;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireEditor = false,
  requireAdmin = false 
}) => {
  const { isAuthenticated, user, loading, canManageArticles, canModerateContent } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireEditor && !canManageArticles) {
    return <Navigate to="/" replace />;
  }

  if (requireAdmin && !canModerateContent) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
