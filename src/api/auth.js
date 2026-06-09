const STORAGE_KEYS = {
  token: 'token',
  user: 'zyra_user',
};

const DEMO_USER = {
  id: 1,
  username: '123',
  password: '123',
  name: 'Elena',
  email: 'elena@zyra.demo',
};

function createMockToken(user) {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(
    JSON.stringify({
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30,
    })
  );
  const signature = btoa('zyra-demo-signature');
  return `${header}.${payload}.${signature}`;
}

export function login(username, password) {
  const normalizedUsername = String(username ?? '').trim();
  const normalizedPassword = String(password ?? '').trim();

  if (
    normalizedUsername !== DEMO_USER.username ||
    normalizedPassword !== DEMO_USER.password
  ) {
    return { success: false, error: 'Usuario o contraseña incorrectos' };
  }

  const user = {
    id: DEMO_USER.id,
    username: DEMO_USER.username,
    name: DEMO_USER.name,
    email: DEMO_USER.email,
  };

  const token = createMockToken(user);

  localStorage.setItem(STORAGE_KEYS.token, token);
  localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));

  return { success: true, user, token };
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
