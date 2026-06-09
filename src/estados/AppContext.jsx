import { createContext, useReducer, useContext, useCallback } from 'react';
import { appReducer, initialState } from './reducer';
import { getStoredSession, logout as clearAuthSession } from '../api/auth';
import { logout as logoutAction } from './actions';

// Crear el contexto
const AppContext = createContext();

function getInitialState() {
  const session = getStoredSession();

  if (!session) {
    return initialState;
  }

  return {
    ...initialState,
    user: session.user,
    isAuthenticated: true,
  };
}

// Provider component
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, undefined, getInitialState);

  const logout = useCallback(() => {
    clearAuthSession();
    dispatch(logoutAction());
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch, logout }}>
      {children}
    </AppContext.Provider>
  );
}

// Custom hook para usar el contexto
export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext debe usarse dentro de un AppProvider');
  }
  return context;
}
