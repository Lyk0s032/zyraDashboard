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

// Estado inicial
export const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  dashboardData: null,
  canchas: []
};

// Reducer principal
export const appReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        error: null
      };

    case LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        dashboardData: null,
        canchas: []
      };

    case SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };

    case SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false
      };

    case CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    case SET_DASHBOARD_DATA:
      return {
        ...state,
        dashboardData: action.payload,
        loading: false
      };

    case UPDATE_DASHBOARD_DATA:
      return {
        ...state,
        dashboardData: {
          ...state.dashboardData,
          ...action.payload
        }
      };

    case SET_CANCHAS:
      return {
        ...state,
        canchas: action.payload
      };

    case UPDATE_CANCHA_NOMBRE:
      return {
        ...state,
        canchas: state.canchas.map(cancha =>
          cancha.id === action.payload.canchaId
            ? { ...cancha, nombre: action.payload.nombre }
            : cancha
        )
      };

    case UPDATE_CANCHA_ESTADO:
      return {
        ...state,
        canchas: state.canchas.map(cancha =>
          cancha.id === action.payload.canchaId
            ? { ...cancha, state: action.payload.estado }
            : cancha
        )
      };

    default:
      return state;
  }
};
