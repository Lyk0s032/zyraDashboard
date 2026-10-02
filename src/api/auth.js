const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://10.0.2.2:3002';

const STORAGE_KEYS = {
  token: 'token',
  user: 'zyra_user',
};

export async function login(telefono, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login/dashboard`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ telefono, password }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      return { 
        success: false, 
        error: data.message || 'Error al iniciar sesión' 
      };
    }

    const { token, user } = data;

    localStorage.setItem(STORAGE_KEYS.token, token);
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));

    return { success: true, user, token };

  } catch (error) {
    console.error('Error en login:', error);
    return { 
      success: false, 
      error: 'No se pudo conectar con el servidor' 
    };
  }
}

export function logout() {
  localStorage.removeItem(STORAGE_KEYS.token);
  localStorage.removeItem(STORAGE_KEYS.user);
}

export function getStoredSession() {
  const token = localStorage.getItem(STORAGE_KEYS.token);
  const rawUser = localStorage.getItem(STORAGE_KEYS.user);

  if (!token || !rawUser) {
    return null;
  }

  try {
    const user = JSON.parse(rawUser);
    return { user, token };
  } catch {
    logout();
    return null;
  }
}

export function isAuthenticated() {
  return Boolean(getStoredSession());
}
