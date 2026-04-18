import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // TODO: replace with real Supabase session from AuthContext (M4)
  const isAuthenticated = false;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;