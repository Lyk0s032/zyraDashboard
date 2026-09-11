import {
  SET_USER,
  LOGOUT,
  SET_LOADING,
  SET_ERROR,
  CLEAR_ERROR,
  SET_DASHBOARD_DATA,
  UPDATE_DASHBOARD_DATA,
  SET_CANCHAS,
  UPDATE_CANCHA_NOMBRE,
  UPDATE_CANCHA_ESTADO
} from './types';

// Actions para el usuario
export const setUser = (user) => ({
  type: SET_USER,
  payload: user
});

export const logout = () => ({
  type: LOGOUT
});

// Actions para loading y errores
export const setLoading = (isLoading) => ({
  type: SET_LOADING,
  payload: isLoading
});

export const setError = (error) => ({
  type: SET_ERROR,
  payload: error
});

export const clearError = () => ({
  type: CLEAR_ERROR
});

// Actions para el dashboard
export const setDashboardData = (data) => ({
  type: SET_DASHBOARD_DATA,
  payload: data
});

export const updateDashboardData = (data) => ({
  type: UPDATE_DASHBOARD_DATA,
  payload: data
});

// Actions para canchas
export const setCanchas = (canchas) => ({
  type: SET_CANCHAS,
  payload: canchas
});

export const updateCanchaNombre = (canchaId, nombre) => ({
  type: UPDATE_CANCHA_NOMBRE,
  payload: { canchaId, nombre }
});

export const updateCanchaEstado = (canchaId, estado) => ({
  type: UPDATE_CANCHA_ESTADO,
  payload: { canchaId, estado }
});
