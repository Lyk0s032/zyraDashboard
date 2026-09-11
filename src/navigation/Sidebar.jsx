import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Settings, LogOut } from 'lucide-react';
import SidebarNav from './SidebarNav';
import { useAccessibility } from '../estados/AccessibilityContext';
import { useAppContext } from '../estados/AppContext';
import { logout as authLogout } from '../api/auth';
import { logout } from '../estados/actions';

function Sidebar({
  sidebarRef,
  sidebarWidth,
  isResizing,
  onResizeStart,
  selectedNav,
  onSelectNav,
  selectedCourt,
  onSelectCourt,
  onAddCourt,
  onCourtAction,
}) {
  const { isLight } = useAccessibility();
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const menuRef = useRef(null);

  const usuario = state.user || JSON.parse(localStorage.getItem('zyra_user') || '{}');
  const nombreUsuario = usuario.name || usuario.nick || 'Usuario';
  const rolUsuario = usuario.role || 'JUGADOR';
  const fotoUsuario = usuario.photo;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuAbierto(false);
      }
    };

    if (menuAbierto) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuAbierto]);

  const handleCerrarSesion = () => {
    authLogout();
    dispatch(logout());
    navigate('/signIn', { replace: true });
  };

  const getRolLabel = (rol) => {
    const roles = {
      'DUEÑO': 'Dueño',
      'ADMIN': 'Administrador',
      'JUGADOR': 'Jugador',
      'EMPLEADO': 'Empleado',
      'ACCESO': 'Acceso'
    };
    return roles[rol] || rol;
  };

  const getInitials = (nombre) => {
    if (!nombre) return 'U';
    const words = nombre.trim().split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return nombre.slice(0, 2).toUpperCase();
  };

  return (
    <aside
      ref={sidebarRef}
      style={{ width: `${sidebarWidth}vw` }}
      className={`relative hidden h-full min-h-0 flex-col overflow-hidden px-4 py-5 transition-all duration-300 md:flex ${
        isLight ? 'border-r border-slate-200 bg-[#f8fafc]' : 'bg-[#0b0b0b]'
      }`}
    >
      <div className="mb-8 flex-shrink-0 relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setMenuAbierto(!menuAbierto)}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 group ${
            isLight ? 'hover:bg-slate-100' : 'hover:bg-white/5'
          }`}
        >
          {fotoUsuario ? (
            <img 
              src={fotoUsuario} 
              alt={nombreUsuario}
              className="w-5 h-5 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-5 h-5 rounded-full bg-[#00FF66] flex items-center justify-center flex-shrink-0">
              <span className="text-[10px] font-bold text-black">
                {getInitials(nombreUsuario)}
              </span>
            </div>
          )}
          <span
            className={`text-xs font-medium transition-colors duration-300 truncate ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}
          >
            {nombreUsuario}
          </span>
          <ChevronDown
            size={12}
            strokeWidth={1.5}
            className={`ml-auto transition-all duration-300 ${
              menuAbierto ? 'rotate-180' : ''
            } ${
              isLight
                ? 'text-slate-400 group-hover:text-slate-600'
                : 'text-[#6b6b7b] group-hover:text-white'
            }`}
          />
        </button>

        {menuAbierto && (
          <div
            className={`absolute top-full left-0 right-0 mt-2 rounded-xl overflow-hidden shadow-2xl z-50 border animate-fade-in ${
              isLight
                ? 'bg-white border-slate-200'
                : 'bg-[#161618] border-white/10'
            }`}
          >
            <div className={`p-4 border-b ${isLight ? 'border-slate-200' : 'border-white/5'}`}>
              <div className="flex flex-col items-center gap-3">
                {fotoUsuario ? (
                  <img 
                    src={fotoUsuario} 
                    alt={nombreUsuario}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[#00FF66] flex items-center justify-center">
                    <span className="text-sm font-bold text-black">
                      {getInitials(nombreUsuario)}
                    </span>
                  </div>
                )}
                <div className="text-center">
                  <p className={`text-sm font-medium ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {nombreUsuario}
                  </p>
                  <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
                    {getRolLabel(rolUsuario)}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-2">
              <button
                type="button"
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors ${
                  isLight
                    ? 'text-slate-700 hover:bg-slate-100'
                    : 'text-zinc-300 hover:bg-white/5'
                }`}
              >
                <Settings size={14} strokeWidth={1.5} />
                <span>Ajustes</span>
              </button>

              <button
                type="button"
                onClick={handleCerrarSesion}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors ${
                  isLight
                    ? 'text-red-600 hover:bg-red-50'
                    : 'text-red-400 hover:bg-red-500/10'
                }`}
              >
                <LogOut size={14} strokeWidth={1.5} />
                <span>Cerrar sesión</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden sidebar-scroll">
        <SidebarNav
          selectedNav={selectedNav}
          onSelectNav={onSelectNav}
          selectedCourt={selectedCourt}
          onSelectCourt={onSelectCourt}
          onAddCourt={onAddCourt}
          onCourtAction={onCourtAction}
        />
      </div>

      <div className="mt-auto pt-4 flex-shrink-0">
        <button
          type="button"
          className={`w-10 h-10 rounded-full transition-all duration-300 flex items-center justify-center ${
            isLight
              ? 'bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700'
              : 'bg-white/[0.04] text-[#6b6b7b] hover:bg-white/[0.06] hover:text-white'
          }`}
        >
          <span className="text-lg font-medium">?</span>
        </button>
      </div>

      <div
        role="separator"
        aria-orientation="vertical"
        onMouseDown={onResizeStart}
        className={`absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-[#00FF66]/50 transition-colors ${
          isResizing ? 'bg-[#00FF66]' : 'bg-transparent'
        }`}
        style={{ zIndex: 10 }}
      >
        <div className="absolute top-1/2 -translate-y-1/2 right-0 w-1 h-12 bg-white/10 rounded-full" />
      </div>
    </aside>
  );
}

export default Sidebar;
