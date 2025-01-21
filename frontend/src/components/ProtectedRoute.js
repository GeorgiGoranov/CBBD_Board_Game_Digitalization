import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/authContext';

const ProtectedRoute = ({ children, allowedRoles, }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Show a loading state while checking authentication
  }

  if (!isAuthenticated || (allowedRoles && !allowedRoles.includes(user?.role))) {
    // Redirect to login if not authenticated or not authorized
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;