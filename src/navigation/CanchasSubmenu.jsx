import { useState, useCallback, useRef, useEffect } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { CANCHAS_POR_DEPORTE } from './canchasData';
import { getSportIcon, getSportBorderColor, ICON_PROPS } from './sportIcons';
import CourtStatusIcon from './CourtStatusIcon';
import ExpandAddButton from './ExpandAddButton';
import CourtContextMenu from './CourtContextMenu';
import { useAccessibility } from '../estados/AccessibilityContext';

function buildInitialAvailability() {
  const initial = {};
  CANCHAS_POR_DEPORTE.forEach((deporte) => {
    deporte.canchas.forEach((cancha) => {
      initial[cancha.id] = true;
    });
  });
  return initial;
}

function buildInitialCourtNames() {
  const initial = {};
  CANCHAS_POR_DEPORTE.forEach((deporte) => {
    deporte.canchas.forEach((cancha) => {
      initial[cancha.id] = cancha.nombre;
    });
  });
  return initial;
}

function CanchasSubmenu({
  selectedCourt,
  onSelectCourt,
  onAddCourt,
  onCourtAction,
}) {
  const [expandedSports, setExpandedSports] = useState(() =>
    Object.fromEntries(CANCHAS_POR_DEPORTE.map((d) => [d.id, true]))
  );
  const [hoveredCourt, setHoveredCourt] = useState(null);
  const [menuAbiertoCanchaId, setMenuAbiertoCanchaId] = useState(null);
  const [menuDirection, setMenuDirection] = useState('abajo');
  const [menuPosition, setMenuPosition] = useState({ top: null, bottom: null, left: 0 });
  const [courtAvailability, setCourtAvailability] = useState(buildInitialAvailability);
  const [courtFavorites, setCourtFavorites] = useState({});
  const [courtNames, setCourtNames] = useState(buildInitialCourtNames);
  const [editandoCanchaId, setEditandoCanchaId] = useState(null);
  const [nombreTemporal, setNombreTemporal] = useState('');
  const editInputRef = useRef(null);
  const cancelandoEdicionRef = useRef(false);

  useEffect(() => {
    if (editandoCanchaId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editandoCanchaId]);

  const toggleSport = (sportId) => {
    setExpandedSports((prev) => ({ ...prev, [sportId]: !prev[sportId] }));
  };

  const closeMenu = useCallback(() => {
    setMenuAbiertoCanchaId(null);
  }, []);

  const handleMenuToggle = (e, canchaId) => {
    e.stopPropagation();

    if (menuAbiertoCanchaId === canchaId) {
      closeMenu();
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const direction =
      e.clientY > window.innerHeight * 0.6 ? 'arriba' : 'abajo';

    setMenuDirection(direction);
    setMenuPosition({
      top: direction === 'abajo' ? rect.top : null,
      bottom: direction === 'arriba' ? window.innerHeight - rect.bottom : null,
      left: rect.right + 4,
    });
    setMenuAbiertoCanchaId(canchaId);
  };

  const handleToggleAvailable = (canchaId) => {
    const nuevoEstado = !courtAvailability[canchaId];
    setCourtAvailability((prev) => ({
      ...prev,
      [canchaId]: nuevoEstado,
    }));
    onCourtAction?.('toggle-disponible', canchaId, {
      disponible: nuevoEstado,
    });
  };

  const handleToggleFavorite = (canchaId) => {
    const nuevoEstado = !courtFavorites[canchaId];
    setCourtFavorites((prev) => ({
      ...prev,
      [canchaId]: nuevoEstado,
    }));
    onCourtAction?.('favoritos', canchaId, {
      favorito: nuevoEstado,
    });
  };

  const activarEdicion = useCallback((canchaId, nombreActual) => {
    cancelandoEdicionRef.current = false;
    setEditandoCanchaId(canchaId);
    setNombreTemporal(nombreActual);
  }, []);

  const handleMenuAction = (action, canchaId, sportId) => {
    if (action === 'cambiar-nombre') {
      closeMenu();
      activarEdicion(canchaId, courtNames[canchaId]);
      return;
    }
    onCourtAction?.(action, canchaId, { sportId });
    closeMenu();
  };

  const iniciarEdicion = (e, canchaId, nombreActual) => {
    e.stopPropagation();
    e.preventDefault();
    activarEdicion(canchaId, nombreActual);
  };

  const guardarEdicion = (canchaId) => {
    const nombreFinal = nombreTemporal.trim() || courtNames[canchaId];
    setCourtNames((prev) => ({ ...prev, [canchaId]: nombreFinal }));
    onCourtAction?.('renombrar', canchaId, { nombre: nombreFinal });
    setEditandoCanchaId(null);
    setNombreTemporal('');
  };

  const cancelarEdicion = () => {
    cancelandoEdicionRef.current = true;
    setEditandoCanchaId(null);
    setNombreTemporal('');
  };

  const handleEditBlur = (canchaId) => {
    if (cancelandoEdicionRef.current) {
      cancelandoEdicionRef.current = false;
      return;
    }
    guardarEdicion(canchaId);
  };

  const handleEditKeyDown = (e, canchaId) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      guardarEdicion(canchaId);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelarEdicion();
    }
  };

  const { isLight } = useAccessibility();

  const openCourt = CANCHAS_POR_DEPORTE
    .flatMap((d) =>
      d.canchas.map((c) => ({
        ...c,
        sportId: d.id,
        nombre: courtNames[c.id] ?? c.nombre,
      }))
    )
    .find((c) => c.id === menuAbiertoCanchaId);

  return (
    <>
      <div className="mt-1 space-y-0.5 pl-1">
        {CANCHAS_POR_DEPORTE.map((deporte) => {
          const SportIcon = getSportIcon(deporte.nombre);
          const sportBorderColor = getSportBorderColor(deporte.nombre);
          const isExpanded = expandedSports[deporte.id];

          return (
            <div key={deporte.id}>
              <button
                type="button"
                onClick={() => toggleSport(deporte.id)}
                className={`group w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[11px] font-medium tracking-wide transition-all duration-300 ${
                  isLight
                    ? 'text-slate-500 hover:text-slate-700'
                    : 'text-[#6b6b7b] hover:text-white'
                }`}
              >
                <SportIcon
                  {...ICON_PROPS}
                  className={`shrink-0 transition-colors duration-300 ${
                    isLight
                      ? 'text-slate-400 group-hover:text-slate-600'
                      : 'text-[#6b6b7b] group-hover:text-white'
                  }`}
                />
                <span className="flex-1 text-left uppercase">{deporte.nombre}</span>
                <ExpandAddButton
                  expanded={isExpanded}
                  onAdd={() => onAddCourt?.(deporte.id)}
                  addLabel={`Añadir cancha de ${deporte.nombre}`}
                />
              </button>

              {isExpanded && (
                <div
                  className={`ml-3 pl-2 border-l space-y-0.5 mb-1 transition-colors duration-300 ${
                    isLight ? 'border-slate-200' : 'border-[#1f1f23]'
                  }`}
                >
                  {deporte.canchas.map((cancha) => {
                    const isActive = selectedCourt === cancha.id;
                    const isHovered = hoveredCourt === cancha.id;
                    const isMenuOpen = menuAbiertoCanchaId === cancha.id;

                    return (
                      <div
                        key={cancha.id}
                        className={`group flex items-center w-full rounded-md transition-all duration-300 ${
                          isActive || isMenuOpen
                            ? isLight
                              ? 'bg-slate-200/60'
                              : 'bg-white/[0.04]'
                            : isLight
                              ? 'hover:bg-slate-100'
                              : 'hover:bg-white/[0.04]'
                        }`}
                        onMouseEnter={() => setHoveredCourt(cancha.id)}
                        onMouseLeave={() => setHoveredCourt(null)}
                      >
                        <button
                          type="button"
                          onClick={() => onSelectCourt(cancha.id)}
                          className={`flex-1 flex items-center gap-2 px-2 py-1.5 min-w-0 text-xs transition-colors duration-300 ${
                            isActive
                              ? isLight
                                ? 'text-emerald-600 font-medium'
                                : 'text-white font-medium'
                              : isLight
                                ? 'text-slate-600 group-hover:text-slate-900'
                                : 'text-[#6b6b7b] group-hover:text-white'
                          }`}
                        >
                          <CourtStatusIcon
                            active={isActive}
                            sportColor={sportBorderColor}
                            hovered={isHovered && !isActive}
                          />
                          {editandoCanchaId === cancha.id ? (
                            <input
                              ref={editInputRef}
                              type="text"
                              value={nombreTemporal}
                              onChange={(e) => setNombreTemporal(e.target.value)}
                              onBlur={() => handleEditBlur(cancha.id)}
                              onKeyDown={(e) => handleEditKeyDown(e, cancha.id)}
                              onClick={(e) => e.stopPropagation()}
                              onDoubleClick={(e) => e.stopPropagation()}
                              className={`flex-1 min-w-0 w-full text-xs bg-[#080808] border border-[#00FF66] rounded px-1 py-0 outline-none ${
                                isActive
                                  ? 'text-white font-medium'
                                  : 'text-[#6b6b7b] group-hover:text-white'
                              }`}
                            />
                          ) : (
                            <span
                              className="truncate"
                              onDoubleClick={(e) =>
                                iniciarEdicion(e, cancha.id, courtNames[cancha.id])
                              }
                            >
                              {courtNames[cancha.id]}
                            </span>
                          )}
                        </button>

                        <button
                          type="button"
                          aria-label={`Opciones de ${courtNames[cancha.id]}`}
                          aria-expanded={isMenuOpen}
                          onClick={(e) => handleMenuToggle(e, cancha.id)}
                          className={`shrink-0 px-1.5 py-1.5 mr-0.5 rounded transition-all duration-300 ${
                            isLight
                              ? 'text-slate-400 hover:text-slate-700'
                              : 'text-[#6b6b7b] hover:text-white'
                          } ${
                            isMenuOpen
                              ? `opacity-100 ${isLight ? 'text-slate-700' : 'text-white'}`
                              : 'opacity-0 group-hover:opacity-100'
                          }`}
                        >
                          <MoreHorizontal size={14} strokeWidth={1.5} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {menuAbiertoCanchaId && openCourt && (
        <CourtContextMenu
          courtName={openCourt.nombre}
          direction={menuDirection}
          position={menuPosition}
          isFavorite={!!courtFavorites[menuAbiertoCanchaId]}
          isAvailable={courtAvailability[menuAbiertoCanchaId] ?? true}
          onToggleFavorite={() => handleToggleFavorite(menuAbiertoCanchaId)}
          onToggleAvailable={() => handleToggleAvailable(menuAbiertoCanchaId)}
          onClose={closeMenu}
          onAction={(action) =>
            handleMenuAction(action, menuAbiertoCanchaId, openCourt.sportId)
          }
        />
      )}
    </>
  );
}

export default CanchasSubmenu;
