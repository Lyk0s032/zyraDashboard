import { useState, useEffect, useRef } from 'react';
import {
  useCourtBlock,
  obtenerTodasLasCanchas,
  DURACION_BLOQUEO,
} from '../estados/CourtBlockContext';

const OPCIONES_DURACION = [
  { id: DURACION_BLOQUEO.UNA_HORA, etiqueta: '1 Hora' },
  { id: DURACION_BLOQUEO.DOS_HORAS, etiqueta: '2 Horas' },
  { id: DURACION_BLOQUEO.RESTO_DIA, etiqueta: 'Resto del Día' },
];

function SwitchCompacto({ activo, onChange, ariaLabel }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={activo}
      aria-label={ariaLabel}
      onClick={() => onChange(!activo)}
      className="shrink-0"
    >
      <span
        className={`relative block w-8 h-[18px] rounded-full transition-colors duration-200 ${
          activo ? 'bg-[#00FF66]' : 'bg-zinc-600'
        }`}
      >
        <span
          className={`absolute top-[2px] left-[2px] w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
            activo ? 'translate-x-[14px]' : 'translate-x-0'
          }`}
        />
      </span>
    </button>
  );
}

function FilaCanchaBloqueo({ cancha, activo, menuAbierto, onToggle, onSeleccionarDuracion }) {
  return (
    <div className="relative">
      <div className="flex items-center justify-between gap-2 py-1.5 px-1 rounded-md hover:bg-white/[0.03] transition-colors">
        <span
          className={`text-[11px] truncate transition-colors ${
            activo ? 'text-zinc-300' : 'text-amber-300/80'
          }`}
          title={cancha.nombre}
        >
          {cancha.nombre}
        </span>
        <SwitchCompacto
          activo={activo}
          onChange={onToggle}
          ariaLabel={`${activo ? 'Bloquear' : 'Desbloquear'} ${cancha.nombre}`}
        />
      </div>

      {menuAbierto && (
        <div className="absolute right-0 top-full mt-0.5 z-20 w-36 py-1 rounded-lg border border-white/10 bg-[#0c1018]/98 backdrop-blur-md shadow-xl animate-[fadeIn_0.12s_ease-out]">
          <p className="px-2.5 py-1 text-[9px] uppercase tracking-widest text-zinc-500">
            Bloquear por
          </p>
          {OPCIONES_DURACION.map((opcion) => (
            <button
              key={opcion.id}
              type="button"
              onClick={() => onSeleccionarDuracion(opcion.id)}
              className="w-full text-left px-2.5 py-1.5 text-[11px] text-zinc-300 hover:bg-cyan-500/10 hover:text-cyan-200 transition-colors"
            >
              {opcion.etiqueta}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function EstadoCanchasSidebar() {
  const { isCanchaBloqueada, bloquearCancha, desbloquearCancha } = useCourtBlock();
  const [menuCanchaId, setMenuCanchaId] = useState(null);
  const contenedorRef = useRef(null);

  const canchas = obtenerTodasLasCanchas();

  useEffect(() => {
    if (!menuCanchaId) return undefined;

    const cerrarAlClickFuera = (e) => {
      if (contenedorRef.current?.contains(e.target)) return;
      setMenuCanchaId(null);
    };

    document.addEventListener('mousedown', cerrarAlClickFuera);
    return () => document.removeEventListener('mousedown', cerrarAlClickFuera);
  }, [menuCanchaId]);

  const handleToggle = (canchaId, nuevoActivo) => {
    if (nuevoActivo) {
      desbloquearCancha(canchaId);
      setMenuCanchaId(null);
      return;
    }
    setMenuCanchaId(canchaId);
  };

  const handleSeleccionarDuracion = (canchaId, duracion) => {
    bloquearCancha(canchaId, duracion);
    setMenuCanchaId(null);
  };

  return (
    <div ref={contenedorRef}>
      <p className="text-[10px] font-medium uppercase tracking-widest text-zinc-500 mb-2.5">
        Estado de Canchas
      </p>
      <p className="text-[10px] text-zinc-600 mb-2 px-0.5 leading-relaxed">
        🔒 Bloqueo Express · Desactiva el switch para elegir duración
      </p>

      <div className="space-y-0.5 max-h-48 overflow-y-auto pr-0.5 sidebar-scroll">
        {canchas.map((cancha) => {
          const bloqueada = isCanchaBloqueada(cancha.id);
          const menuAbierto = menuCanchaId === cancha.id;
          const switchActivo = !bloqueada && !menuAbierto;

          return (
            <FilaCanchaBloqueo
              key={cancha.id}
              cancha={cancha}
              activo={switchActivo}
              menuAbierto={menuAbierto}
              onToggle={(nuevoActivo) => handleToggle(cancha.id, nuevoActivo)}
              onSeleccionarDuracion={(duracion) =>
                handleSeleccionarDuracion(cancha.id, duracion)
              }
            />
          );
        })}
      </div>
    </div>
  );
}

export default EstadoCanchasSidebar;
