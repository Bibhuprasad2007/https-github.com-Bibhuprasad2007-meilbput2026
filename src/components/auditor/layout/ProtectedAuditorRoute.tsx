import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useDemoAuth } from '../../../context/DemoAuthContext';

interface ProtectedAuditorRouteProps {
  children: React.ReactElement;
}

export const ProtectedAuditorRoute: React.FC<ProtectedAuditorRouteProps> = ({ children }) => {
  const { isAuthenticated } = useDemoAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};
