import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useDemoAuth } from '../../../context/DemoAuthContext';

interface ProtectedAdminRouteProps {
  children: React.ReactElement;
}

export const ProtectedAdminRoute: React.FC<ProtectedAdminRouteProps> = ({ children }) => {
  const { isAdminAuthenticated } = useDemoAuth();
  const location = useLocation();

  if (!isAdminAuthenticated) {
    // Redirect to landing / login page if not authenticated as ESG Admin
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};
