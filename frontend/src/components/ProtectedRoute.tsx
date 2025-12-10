import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, role, isLoading, isLoggingIn } = useAuth();

  if (isLoading || isLoggingIn) {
    // Optionally render a loading spinner or skeleton screen here
    return null; 
  }

  if (!isAuthenticated) {
    // If not authenticated, redirect to the login page
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    // If authenticated but role is not allowed, redirect to a forbidden page or home
    // For now, let's redirect to home
    return <Navigate to="/" replace />;
  }

  // If authenticated and role is allowed (or no specific roles required), render the child routes
  return <Outlet />;
};

export default ProtectedRoute;
