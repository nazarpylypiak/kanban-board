import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { RootState } from '../../core/store';

interface PrivateRouteProps {
  children: React.ReactNode;
}

export const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const { accessToken, loading } = useSelector(
    (state: RootState) => state.auth
  );

  if (loading) return <div>Loading...</div>;
  if (!accessToken) return <Navigate to="/login" replace />;

  return children;
};
