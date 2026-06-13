import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { getStoredUserIdentity } from '../lib/authCookie';

function ProtectedRoute() {
  const location = useLocation();
  const storedUser = getStoredUserIdentity();

  if (!storedUser) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
