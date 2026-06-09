import { Navigate } from 'react-router-dom';
import { useAppContext } from '../estados/AppContext';

function PublicRoute({ children }) {
  const { state } = useAppContext();

  if (state.isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default PublicRoute;
