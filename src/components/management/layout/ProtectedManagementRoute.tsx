import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useDemoAuth } from '../../../context/DemoAuthContext';

interface ProtectedManagementRouteProps {
  children: React.ReactElement;
}

export const ProtectedManagementRoute: React.FC<ProtectedManagementRouteProps> = ({ children }) => {
  const { isManagementAuthenticated } = useDemoAuth();
  const location = useLocation();

  if (!isManagementAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};
