import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface AdminOnlyRouteProps {
  children: React.ReactNode;
}

/**
 * AdminOnlyRoute - Ensures only admin users can access certain routes
 * Redirects all non-admin users to home page
 */
const AdminOnlyRoute: React.FC<AdminOnlyRouteProps> = ({ children }) => {
  const { role, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role !== UserRole.ADMIN) {
    // Redirect non-admin users to their appropriate dashboard
    if (role === UserRole.SELLER) {
      return <Navigate to="/seller/products" replace />;
    } else if (role === UserRole.RIDER) {
      return <Navigate to="/rider-dashboard" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

export default AdminOnlyRoute;
