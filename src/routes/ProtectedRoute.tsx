import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import type { Role } from '../types';

interface ProtectedRouteProps {
  roles?: Role[];
}

export function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const { status, canAccess } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return <div className="route-state">Checking your session...</div>;
  }

  if (status === 'anonymous') {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!canAccess(roles)) {
    return (
      <div className="page-shell">
        <div className="empty-panel">
          <p className="kicker">Access denied</p>
          <h1>This area is not available for your account.</h1>
          <p>
            Use the navigation to return to a section that matches your role.
          </p>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
