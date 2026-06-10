import { type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import { getAuthToken } from '../lib/api';

export default function RequireAuth({ children }: { children: ReactNode }) {
  const location = useLocation();

  if (!getAuthToken()) {
    const redirect = `${location.pathname}${location.search}`;
    return <Navigate to={`/login?redirect=${encodeURIComponent(redirect)}`} replace />;
  }

  return children;
}
