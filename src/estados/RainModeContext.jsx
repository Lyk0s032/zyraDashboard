import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const RainModeContext = createContext(null);

export function parseHoraAgenda(horaStr) {
  const match = horaStr?.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return null;

  let horas = parseInt(match[1], 10);
  const minutos = parseInt(match[2], 10);
  const periodo = match[3].toUpperCase();

  if (periodo === 'PM' && horas !== 12) horas += 12;
  if (periodo === 'AM' && horas === 12) horas = 0;

  const fecha = new Date();
  fecha.setHours(horas, minutos, 0, 0);
  return fecha;
}

function obtenerFinDelDia() {
  const fin = new Date();
  fin.setHours(23, 59, 59, 999);
  return fin;
}

function formatearHora(date) {
  return date.toLocaleTimeString('es-CO', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function RainModeProvider({ children }) {
  const [isRainModeActive, setIsRainModeActive] = useState(false);
  const [modo, setModo] = useState(null);
  const [rangoInicio, setRangoInicio] = useState(null);
  const [rangoFin, setRangoFin] = useState(null);

  const activate2Hours = useCallback(() => {
    const inicio = new Date();
    const fin = new Date(inicio.getTime() + 2 * 60 * 60 * 1000);

    setIsRainModeActive(true);
    setModo('2horas');
    setRangoInicio(inicio);
    setRangoFin(fin);
  }, []);

  const activateIndefinite = useCallback(() => {
    const inicio = new Date();
    const fin = obtenerFinDelDia();

    setIsRainModeActive(true);
    setModo('indefinido');
    setRangoInicio(inicio);
    setRangoFin(fin);
  }, []);

  const deactivate = useCallback(() => {
    setIsRainModeActive(false);
    setModo(null);
    setRangoInicio(null);
    setRangoFin(null);
  }, []);

  const isReservaAfectada = useCallback(
    (horaStr) => {
      if (!isRainModeActive || !rangoInicio || !rangoFin) return false;

      const slot = parseHoraAgenda(horaStr);
      if (!slot) return false;

      return slot >= rangoInicio && slot <= rangoFin;
    },
    [isRainModeActive, rangoInicio, rangoFin]
  );

  const descripcionActiva = useMemo(() => {
    if (!isRainModeActive || !rangoInicio || !rangoFin) return null;

    if (modo === '2horas') {
      return `Próximas 2 h · ${formatearHora(rangoInicio)} – ${formatearHora(rangoFin)}`;
    }

    return `Hasta fin del día · desde ${formatearHora(rangoInicio)}`;
  }, [isRainModeActive, modo, rangoInicio, rangoFin]);

  const value = useMemo(
    () => ({
      isRainModeActive,
      modo,
      rangoInicio,
      rangoFin,
      activate2Hours,
      activateIndefinite,
      deactivate,
      isReservaAfectada,
      descripcionActiva,
    }),
    [
      isRainModeActive,
      modo,
      rangoInicio,
      rangoFin,
      activate2Hours,
      activateIndefinite,
      deactivate,
      isReservaAfectada,
      descripcionActiva,
    ]
  );

  return (
    <RainModeContext.Provider value={value}>{children}</RainModeContext.Provider>
  );
}

export function useRainMode() {
  const context = useContext(RainModeContext);
  if (!context) {
    throw new Error('useRainMode debe usarse dentro de un RainModeProvider');
  }
  return context;
}
