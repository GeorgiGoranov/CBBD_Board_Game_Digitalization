import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/authContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Show a loading state while checking authentication
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
//in case customer knows the website routes
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/duser" replace />;
  }

  return children;
};

export default ProtectedRoute;