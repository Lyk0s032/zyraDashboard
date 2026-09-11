import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { getSportIcon, getSportBorderColor, ICON_PROPS } from './sportIcons';
import CourtStatusIcon from './CourtStatusIcon';
import ExpandAddButton from './ExpandAddButton';
import CourtContextMenu from './CourtContextMenu';
import { useAccessibility } from '../estados/AccessibilityContext';
import { useAppContext } from '../estados/AppContext';
import { updateCanchaNombre, updateCanchaEstado } from '../estados/actions';
import axiosInstance from '../api/axiosConfig';

/**
 * Agrupa el array plano de canchas de la API en la estructura
 * [{ id, nombre, canchas: [{ id, nombre, state }] }]
 */
function groupCanchasBySport(canchas) {
  const map = new Map();
  canchas.forEach((cancha) => {
    const sportNombre = (cancha.sport?.nombre || cancha.tipo_deporte || 'Otro').toUpperCase();
    const sportKey = cancha.sport?.id ?? cancha.tipo_deporte ?? 'otro';
    if (!map.has(sportKey)) {
      map.set(sportKey, { id: sportKey, nombre: sportNombre, canchas: [] });
    }
    map.get(sportKey).canchas.push({
      id: cancha.id,
      nombre: cancha.nombre,
      state: cancha.state
    });
  });
  return Array.from(map.values());
}

function CanchasSubmenu({
  selectedCourt,
  onSelectCourt,
  onAddCourt,
  onCourtAction,
}) {
  const { state, dispatch } = useAppContext();
  const todasLasCanchas = state.canchas ?? [];
  const complejoId = state.user?.complejos?.[0]?.id ?? null;
  
  console.log('[CanchasSubmenu] Render - todasLasCanchas.length:', todasLasCanchas.length);
  
  // Estado para forzar actualización
  const [updateTrigger, setUpdateTrigger] = useState(0);
  
  console.log('[CanchasSubmenu] updateTrigger:', updateTrigger);
  
  // Filtrar canchas eliminadas
  const canchasDB = useMemo(() => {
    const filtered = todasLasCanchas.filter(c => c.state !== 'ELIMINADA');
    console.log('[CanchasSubmenu] useMemo canchasDB - filtered:', filtered.length);
    return filtered;
  }, [todasLasCanchas, updateTrigger]);

  // Agrupar canchas por deporte (memorizado)
  const canchasPorDeporte = useMemo(() => {
    const grouped = groupCanchasBySport(canchasDB);
    console.log('[CanchasSubmenu] useMemo canchasPorDeporte:', grouped.length, 'deportes');
    return grouped;
  }, [canchasDB, updateTrigger]);

  const [expandedSports, setExpandedSports] = useState({});
  const [hoveredCourt, setHoveredCourt] = useState(null);
  const [menuAbiertoCanchaId, setMenuAbiertoCanchaId] = useState(null);
  const [menuDirection, setMenuDirection] = useState('abajo');
  const [menuPosition, setMenuPosition] = useState({ top: null, bottom: null, left: 0 });
  const [courtAvailability, setCourtAvailability] = useState({});
  const [courtFavorites, setCourtFavorites] = useState({});
  const [courtFavoriteIds, setCourtFavoriteIds] = useState({});
  const [courtNames, setCourtNames] = useState({});
  const [editandoCanchaId, setEditandoCanchaId] = useState(null);
  const [nombreTemporal, setNombreTemporal] = useState('');
  const editInputRef = useRef(null);
  const cancelandoEdicionRef = useRef(false);

  const cargarFavoritosDesdeBackend = useCallback(async () => {
    if (!complejoId) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axiosInstance.get(
        `/api/precios/favoritos/complejo/${complejoId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        const favoritesMap = {};
        const favoriteIdsMap = {};

        (response.data.data || []).forEach((favorito) => {
          const canchaIdNum = Number(favorito.cancha_id);
          if (Number.isFinite(canchaIdNum) && canchaIdNum > 0) {
            favoritesMap[canchaIdNum] = true;
            favoriteIdsMap[canchaIdNum] = favorito.id;
          }
        });

        setCourtFavorites(favoritesMap);
        setCourtFavoriteIds(favoriteIdsMap);
      }
    } catch (error) {
      console.error('Error al cargar favoritos del complejo:', error);
    }
  }, [complejoId]);

  // Sincronizar estado local cuando lleguen canchas de la API
  useEffect(() => {
    console.log('[CanchasSubmenu] useEffect ejecutado - canchasDB.length:', canchasDB.length);
    if (canchasDB.length === 0) return;

    const availability = {};
    const names = {};
    canchasDB.forEach((c) => {
      // Considerar disponible si está en DISPONIBLE u OCUPADA
      availability[c.id] = c.state === 'DISPONIBLE' || c.state === 'OCUPADA';
      names[c.id] = c.nombre;
    });
    setCourtAvailability(availability);
    setCourtNames(names);

    cargarFavoritosDesdeBackend();

    // Expandir todos los deportes al cargar
    const expanded = {};
    groupCanchasBySport(canchasDB).forEach((d) => { expanded[d.id] = true; });
    setExpandedSports(expanded);
    
    console.log('[CanchasSubmenu] Estados actualizados, canchas por deporte:', groupCanchasBySport(canchasDB));
  }, [canchasDB, cargarFavoritosDesdeBackend]);

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

  const handleToggleAvailable = async (canchaId) => {
    const disponibleActual = courtAvailability[canchaId];
    const nuevoEstadoDisponible = !disponibleActual;
    const estadoAPI = nuevoEstadoDisponible ? 'DISPONIBLE' : 'NO DISPONIBLE';
    
    // Actualizar UI inmediatamente
    setCourtAvailability((prev) => ({
      ...prev,
      [canchaId]: nuevoEstadoDisponible,
    }));

    try {
      const token = localStorage.getItem('token');
      const response = await axiosInstance.patch(
        `/api/courts/${canchaId}/estado`,
        { estado: estadoAPI },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        // Actualizar el estado global
        dispatch(updateCanchaEstado(canchaId, estadoAPI));
        onCourtAction?.('toggle-disponible', canchaId, {
          disponible: nuevoEstadoDisponible,
        });
      } else {
        // Revertir si falla
        setCourtAvailability((prev) => ({
          ...prev,
          [canchaId]: disponibleActual,
        }));
      }
    } catch (error) {
      console.error('Error al cambiar estado de cancha:', error);
      // Revertir si falla
      setCourtAvailability((prev) => ({
        ...prev,
        [canchaId]: disponibleActual,
      }));
    }
  };

  const handleToggleFavorite = async (canchaId) => {
    const canchaIdNum = Number(canchaId);
    if (!Number.isFinite(canchaIdNum) || canchaIdNum <= 0) return;

    const esFavorito = !!courtFavorites[canchaIdNum];
    const token = localStorage.getItem('token');

    try {
      if (esFavorito) {
        const configId = courtFavoriteIds[canchaIdNum];
        if (!configId) {
          await cargarFavoritosDesdeBackend();
          return;
        }

        const response = await axiosInstance.delete(
          `/api/precios/favoritos/${configId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.success) {
          setCourtFavorites((prev) => {
            const siguiente = { ...prev };
            delete siguiente[canchaIdNum];
            return siguiente;
          });
          setCourtFavoriteIds((prev) => {
            const siguiente = { ...prev };
            delete siguiente[canchaIdNum];
            return siguiente;
          });
          onCourtAction?.('favoritos', canchaIdNum, { favorito: false });
        }
      } else {
        const preciosResponse = await axiosInstance.get(
          `/api/canchas/${canchaIdNum}/precios`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!preciosResponse.data.success || !preciosResponse.data.data?.bloques?.length) {
          alert('No hay configuración de precios para guardar en favoritos');
          return;
        }

        const bloques = preciosResponse.data.data.bloques;
        const nombreCancha = courtNames[canchaIdNum] || `Cancha ${canchaIdNum}`;

        const response = await axiosInstance.post(
          '/api/precios/favoritos',
          {
            complejo_id: complejoId,
            cancha_id: canchaIdNum,
            nombre_plantilla: `Config. ${nombreCancha}`,
            configuracion: { bloques },
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.success) {
          const nuevoFavorito = response.data.data;
          setCourtFavorites((prev) => ({ ...prev, [canchaIdNum]: true }));
          setCourtFavoriteIds((prev) => ({
            ...prev,
            [canchaIdNum]: nuevoFavorito.id,
          }));
          onCourtAction?.('favoritos', canchaIdNum, { favorito: true });
        }
      }
    } catch (error) {
      console.error('Error al manejar favoritos:', error);
      alert('Error al guardar/eliminar de favoritos. Por favor, intenta nuevamente.');
    }
  };

  const activarEdicion = useCallback((canchaId, nombreActual) => {
    cancelandoEdicionRef.current = false;
    setEditandoCanchaId(canchaId);
    setNombreTemporal(nombreActual);
  }, []);

  const handleMenuAction = async (action, canchaId, sportId) => {
    if (action === 'cambiar-nombre') {
      closeMenu();
      activarEdicion(canchaId, courtNames[canchaId]);
      return;
    }
    if (action === 'copiar') {
      closeMenu();
      await handleClonarCancha(canchaId);
      return;
    }
    if (action === 'eliminar') {
      closeMenu();
      await handleEliminarCancha(canchaId);
      return;
    }
    onCourtAction?.(action, canchaId, { sportId });
    closeMenu();
  };

  const handleClonarCancha = async (canchaId) => {
    try {
      console.log('[CanchasSubmenu] Iniciando clonación de cancha:', canchaId);
      console.log('[CanchasSubmenu] Canchas actuales en canchasDB:', canchasDB.length);
      
      const token = localStorage.getItem('token');
      const response = await axiosInstance.post(
        `/api/courts/${canchaId}/clonar`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        console.log('[CanchasSubmenu] Cancha clonada exitosamente:', response.data.data);
        const canchaClonada = response.data.data;
        
        // Usar el complejo_id directamente de la cancha clonada
        const complejoId = canchaClonada.complejo_id;
        console.log('[CanchasSubmenu] complejo_id de la cancha clonada:', complejoId);
        
        if (complejoId) {
          const canchasResponse = await axiosInstance.get(`/api/courts/complex/${complejoId}`);
          if (canchasResponse.data.success && canchasResponse.data.data) {
            const nuevasCanchas = canchasResponse.data.data;
            console.log('[CanchasSubmenu] Nueva lista obtenida del servidor:', nuevasCanchas.length, 'canchas');
            console.log('[CanchasSubmenu] Nombres:', nuevasCanchas.map(c => c.nombre));
            
            // Actualizar el estado global con la nueva lista de canchas
            console.log('[CanchasSubmenu] Despachando SET_CANCHAS...');
            dispatch({ type: 'SET_CANCHAS', payload: nuevasCanchas });
            
            // Forzar re-render actualizando el trigger
            console.log('[CanchasSubmenu] Incrementando updateTrigger...');
            setUpdateTrigger(prev => {
              console.log('[CanchasSubmenu] updateTrigger:', prev, '->', prev + 1);
              return prev + 1;
            });
            
            // Asegurar que el deporte de la cancha clonada esté expandido
            const canchaClonedaSportId = canchaClonada.sport?.id ?? canchaClonada.tipo_deporte ?? 'otro';
            console.log('[CanchasSubmenu] Expandiendo deporte:', canchaClonedaSportId);
            setExpandedSports((prev) => ({
              ...prev,
              [canchaClonedaSportId]: true
            }));
            
            // Forzar actualización inmediata del estado local para reflejar cambios
            const newAvailability = {};
            const newNames = {};
            nuevasCanchas.forEach((c) => {
              newAvailability[c.id] = c.state === 'DISPONIBLE' || c.state === 'OCUPADA';
              newNames[c.id] = c.nombre;
            });
            setCourtAvailability(newAvailability);
            setCourtNames(newNames);
            console.log('[CanchasSubmenu] Estados locales actualizados');
            
            // Notificar al componente padre sobre la clonación
            onCourtAction?.('clonar', canchaClonada.id, {
              canchaOriginalId: canchaId,
              canchaClonada: canchaClonada
            });
            console.log('[CanchasSubmenu] Proceso de clonación completado');
          }
        } else {
          console.error('[CanchasSubmenu] No se pudo obtener el complejo_id de la cancha clonada');
        }
      }
    } catch (error) {
      console.error('[CanchasSubmenu] Error al clonar cancha:', error);
    }
  };

  const handleEliminarCancha = async (canchaId) => {
    const confirmar = window.confirm('¿Estás seguro de que deseas eliminar esta cancha? Esta acción no se puede deshacer.');
    
    if (!confirmar) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axiosInstance.patch(
        `/api/courts/${canchaId}/estado`,
        { estado: 'ELIMINADA' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        console.log('Cancha eliminada (soft delete)');
        // Actualizar el estado global
        dispatch(updateCanchaEstado(canchaId, 'ELIMINADA'));
        
        // La cancha se ocultará automáticamente gracias al filtro en useMemo
      }
    } catch (error) {
      console.error('Error al eliminar cancha:', error);
    }
  };

  const iniciarEdicion = (e, canchaId, nombreActual) => {
    e.stopPropagation();
    e.preventDefault();
    activarEdicion(canchaId, nombreActual);
  };

  const guardarEdicion = async (canchaId) => {
    const nombreFinal = nombreTemporal.trim() || courtNames[canchaId];
    
    // Actualizar estado local inmediatamente para mejor UX
    setCourtNames((prev) => ({ ...prev, [canchaId]: nombreFinal }));
    setEditandoCanchaId(null);
    setNombreTemporal('');

    // Llamar a la API para actualizar en el backend
    try {
      const token = localStorage.getItem('token');
      const response = await axiosInstance.patch(
        `/api/courts/${canchaId}/nombre`,
        { nombre: nombreFinal },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        // Actualizar el contexto global para reflejar el cambio en toda la app
        dispatch(updateCanchaNombre(canchaId, nombreFinal));
        onCourtAction?.('renombrar', canchaId, { nombre: nombreFinal });
      }
    } catch (error) {
      console.error('Error al actualizar nombre de cancha:', error);
      // Revertir el cambio local si falla
      const canchaOriginal = canchasDB.find(c => c.id === canchaId);
      if (canchaOriginal) {
        setCourtNames((prev) => ({ ...prev, [canchaId]: canchaOriginal.nombre }));
      }
    }
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

  const openCourt = canchasPorDeporte
    .flatMap((d) =>
      d.canchas.map((c) => ({
        ...c,
        sportId: d.id,
        nombre: courtNames[c.id] ?? c.nombre,
      }))
    )
    .find((c) => c.id === menuAbiertoCanchaId);

  // Estado vacío mientras cargan las canchas
  if (canchasDB.length === 0) {
    return (
      <div className="mt-2 pl-3 space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-3 rounded bg-white/[0.06] animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="mt-1 space-y-0.5 pl-1">
        {canchasPorDeporte.map((deporte) => {
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
                    // selectedCourt viene del URL (string), cancha.id es número de BD
                    const isActive = String(selectedCourt) === String(cancha.id);
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
          courtId={menuAbiertoCanchaId}
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
