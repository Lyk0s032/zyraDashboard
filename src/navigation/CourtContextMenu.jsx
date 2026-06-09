import { createPortal } from 'react-dom';
import { useEffect } from 'react';
import {
  Star,
  Circle,
  Pencil,
  Copy,
  CalendarClock,
  BarChart2,
  Settings,
  Trash2,
} from 'lucide-react';

const MENU_WIDTH = 260;
const ICON_PROPS = { size: 14, strokeWidth: 1.5 };

function ToggleSwitch({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={(e) => {
        e.stopPropagation();
        onChange(!checked);
      }}
      className={`relative w-8 h-[18px] rounded-full transition-colors duration-200 shrink-0 ${
        checked ? 'bg-[#00FF66]' : 'bg-zinc-600'
      }`}
    >
      <span
        className={`absolute top-[3px] left-[3px] w-3 h-3 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          checked ? 'translate-x-[14px]' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

function MenuDivider() {
  return <div className="my-1 mx-2 border-t border-white/5" />;
}

function MenuItem({ icon: Icon, iconClassName, children, onClick, variant = 'default' }) {
  const variantClasses = {
    default: 'text-zinc-300 hover:bg-white/5 hover:text-white',
    danger: 'text-zinc-300 hover:bg-white/5 hover:text-red-400',
  };

  const defaultIconClass = 'text-zinc-500 group-hover/item:text-zinc-300 transition-colors';

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      className={`group/item w-full flex items-center gap-2.5 px-3 py-1.5 text-xs rounded-md transition-colors ${variantClasses[variant]}`}
    >
      {Icon && (
        <Icon
          {...ICON_PROPS}
          className={`shrink-0 ${iconClassName ?? defaultIconClass}`}
        />
      )}
      <span className="flex-1 text-left leading-snug">{children}</span>
    </button>
  );
}

function CourtContextMenu({
  courtName,
  direction = 'abajo',
  position,
  isFavorite,
  isAvailable,
  onToggleFavorite,
  onToggleAvailable,
  onClose,
  onAction,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const originClass =
    direction === 'arriba' ? 'origin-bottom-left' : 'origin-top-left';

  const adjustedLeft = Math.min(
    position.left,
    window.innerWidth - MENU_WIDTH - 8
  );

  const menuStyle = {
    width: MENU_WIDTH,
    left: adjustedLeft,
    ...(position.top != null ? { top: position.top } : {}),
    ...(position.bottom != null ? { bottom: position.bottom } : {}),
  };

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="menu"
        aria-label={`Opciones de ${courtName}`}
        className={`fixed z-50 py-1 bg-[#1c1c1e] border border-white/10 rounded-lg shadow-2xl transition-all duration-150 ease-out animate-menu-in ${originClass}`}
        style={menuStyle}
        onClick={(e) => e.stopPropagation()}
      >
        <MenuItem
          icon={Star}
          iconClassName={
            isFavorite
              ? 'text-[#00FF66] fill-[#00FF66] transition-colors'
              : 'text-zinc-500 group-hover/item:text-zinc-300 transition-colors'
          }
          onClick={onToggleFavorite}
        >
          {isFavorite
            ? 'Eliminar configuración de favoritos'
            : 'Guardar configuración en favoritos'}
        </MenuItem>

        <MenuDivider />

        <div className="flex items-center justify-between px-3 py-1.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <Circle
              {...ICON_PROPS}
              className={`shrink-0 transition-colors ${
                isAvailable
                  ? 'text-[#00FF66] fill-[#00FF66]/25'
                  : 'text-zinc-500'
              }`}
            />
            <span className="text-xs text-zinc-300">Disponible</span>
          </div>
          <ToggleSwitch checked={isAvailable} onChange={onToggleAvailable} />
        </div>

        <MenuDivider />

        <MenuItem icon={Pencil} onClick={() => onAction('cambiar-nombre')}>
          Cambiar nombre
        </MenuItem>
        <MenuItem icon={Copy} onClick={() => onAction('copiar')}>
          Copiar
        </MenuItem>
        <MenuItem icon={CalendarClock} onClick={() => onAction('editar-horarios-precios')}>
          Editar horarios y precios
        </MenuItem>

        <MenuDivider />

        <MenuItem icon={BarChart2} onClick={() => onAction('analisis')}>
          Análisis y estadísticas
        </MenuItem>

        <MenuDivider />

        <MenuItem icon={Settings} onClick={() => onAction('configuracion')}>
          Configuración
        </MenuItem>
        <MenuItem
          icon={Trash2}
          variant="danger"
          iconClassName="text-zinc-500 group-hover/item:text-red-400 transition-colors"
          onClick={() => onAction('eliminar')}
        >
          Eliminar cancha
        </MenuItem>
      </div>
    </>,
    document.body
  );
}

export default CourtContextMenu;
