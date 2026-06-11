import { type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import { getAuthToken } from '../../lib/api';
import { isAdmin } from '../../lib/auth';

export default function RequireAdmin({ children }: { children: ReactNode }) {
  const location = useLocation();

  if (!getAuthToken()) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (!isAdmin()) {
    return <Navigate to="/" replace />;
  }

  return children;
}
