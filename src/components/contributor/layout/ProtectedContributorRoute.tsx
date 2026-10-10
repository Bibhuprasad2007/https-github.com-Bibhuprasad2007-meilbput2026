import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useDemoAuth } from '../../../context/DemoAuthContext';

interface ProtectedContributorRouteProps {
  children: React.ReactElement;
}

export const ProtectedContributorRoute: React.FC<ProtectedContributorRouteProps> = ({ children }) => {
  const { isContributorAuthenticated } = useDemoAuth();
  const location = useLocation();

  if (!isContributorAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};
