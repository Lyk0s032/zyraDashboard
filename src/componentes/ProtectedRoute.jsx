import { Navigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../estados/AppContext';

function ProtectedRoute({ children }) {
  const { state } = useAppContext();
  const location = useLocation();

  if (!state.isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export default ProtectedRoute;
