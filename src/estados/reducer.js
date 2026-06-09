import {
  SET_USER,
  LOGOUT,
  SET_LOADING,
  SET_ERROR,
  CLEAR_ERROR,
  SET_DASHBOARD_DATA,
  UPDATE_DASHBOARD_DATA
} from './types';

// Estado inicial
export const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  dashboardData: null
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
        dashboardData: null
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

    default:
      return state;
  }
};
