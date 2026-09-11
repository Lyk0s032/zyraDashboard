import { useNavigate } from 'react-router-dom';
import { Settings, Globe, LogOut, X } from 'lucide-react';
import { useAccessibility } from '../estados/AccessibilityContext';
import { useAppContext } from '../estados/AppContext';
import { logout as authLogout } from '../api/auth';
import { logout } from '../estados/actions';

function MobileSettingsSheet({ open, onClose }) {
  const navigate = useNavigate();
  const { isLight } = useAccessibility();
  const { state, dispatch } = useAppContext();

  if (!open) return null;

  const usuario = state.user || JSON.parse(localStorage.getItem('zyra_user') || '{}');
  const nombreUsuario = usuario.name || usuario.nick || 'Usuario';

  const handleCerrarSesion = () => {
    authLogout();
    dispatch(logout());
    onClose?.();
    navigate('/signIn', { replace: true });
  };

  const irAWebConfig = () => {
    onClose?.();
    navigate('/web-config');
  };

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-[60] bg-black/60 md:hidden"
        onClick={onClose}
        aria-label="Cerrar ajustes"
      />

      <div
        className={`fixed bottom-0 left-0 right-0 z-[70] rounded-t-2xl border-t px-4 pb-[calc(5rem+env(safe-area-inset-bottom,0px))] pt-4 md:hidden ${
          isLight
            ? 'border-slate-200 bg-white'
            : 'border-white/[0.08] bg-[#161618]'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Ajustes"
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className={`text-sm font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {nombreUsuario}
            </p>
            <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>Ajustes</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`rounded-lg p-2 transition-colors ${
              isLight ? 'text-slate-400 hover:bg-slate-100' : 'text-zinc-500 hover:bg-white/5'
            }`}
            aria-label="Cerrar"
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        <div className="space-y-1">
          <button
            type="button"
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm transition-colors ${
              isLight
                ? 'text-slate-700 hover:bg-slate-100'
                : 'text-zinc-300 hover:bg-white/[0.04]'
            }`}
          >
            <Settings size={18} strokeWidth={1.5} className="text-emerald-500" />
            <span>Ajustes del complejo</span>
          </button>

          <button
            type="button"
            onClick={irAWebConfig}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm transition-colors ${
              isLight
                ? 'text-slate-700 hover:bg-slate-100'
                : 'text-zinc-300 hover:bg-white/[0.04]'
            }`}
          >
            <Globe size={18} strokeWidth={1.5} className="text-emerald-500" />
            <span>Configuración Web</span>
          </button>

          <button
            type="button"
            onClick={handleCerrarSesion}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm transition-colors ${
              isLight
                ? 'text-red-600 hover:bg-red-50'
                : 'text-red-400 hover:bg-red-500/10'
            }`}
          >
            <LogOut size={18} strokeWidth={1.5} />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </div>
    </>
  );
}

export default MobileSettingsSheet;
