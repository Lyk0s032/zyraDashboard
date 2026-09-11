import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../estados/AppContext';
import { setUser } from '../estados/actions';
import { login as authLogin } from '../api/auth';

function Login() {
  const navigate = useNavigate();
  const { dispatch } = useAppContext();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await authLogin(username, password);

      if (!result.success) {
        setError(result.error);
        setLoading(false);
        return;
      }

      dispatch(setUser(result.user));
      navigate('/dashboard', { replace: true });
    } catch (error) {
      setError('Error inesperado al iniciar sesión');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#111111] px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#00FF66]">
            <span className="text-sm font-bold text-black">ZR</span>
          </Link>
          <h1 className="text-2xl font-semibold text-white">ZYRA</h1>
          <p className="mt-2 text-sm text-[#6b6b7b]">
            Inicia sesión en tu panel de control
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-[#1f1f23] bg-[#0b0b0b] p-8 shadow-xl"
        >
          <div className="space-y-5">
            <div>
              <label
                htmlFor="username"
                className="mb-2 block text-sm font-medium text-[#9ca3af]"
              >
                Teléfono
              </label>
              <input
                id="username"
                type="tel"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="tel"
                required
                className="w-full rounded-lg border border-[#2e2e35] bg-[#111111] px-4 py-3 text-white placeholder-[#4b5563] outline-none transition-colors focus:border-[#00FF66] focus:ring-1 focus:ring-[#00FF66]"
                placeholder="3001234567"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-[#9ca3af]"
              >
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                className="w-full rounded-lg border border-[#2e2e35] bg-[#111111] px-4 py-3 text-white placeholder-[#4b5563] outline-none transition-colors focus:border-[#00FF66] focus:ring-1 focus:ring-[#00FF66]"
                placeholder="Ingresa tu contraseña"
              />
            </div>

            {error && (
              <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#00FF66] px-4 py-3 text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Ingresando...' : 'Iniciar sesión'}
            </button>
          </div>
        </form>
        <p className="mt-6 text-center text-sm text-[#6b6b7b]">
          <Link to="/" className="text-[#9ca3af] hover:text-white">
            ← Volver a Zyra
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
