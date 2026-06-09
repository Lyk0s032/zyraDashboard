import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { CANCHAS_POR_DEPORTE } from '../navigation/canchasData';

const CourtBlockContext = createContext(null);

const STORAGE_KEY = 'zyra-court-blocks';

export const COURT_STATUS = {
  ACTIVE: 'ACTIVE',
  MAINTENANCE_BLOCKED: 'MAINTENANCE_BLOCKED',
};

export const DURACION_BLOQUEO = {
  UNA_HORA: '1h',
  DOS_HORAS: '2h',
  RESTO_DIA: 'resto-dia',
};

export function obtenerTodasLasCanchas() {
  return CANCHAS_POR_DEPORTE.flatMap((deporte) => deporte.canchas);
}

function calcularExpiracion(duracion) {
  if (duracion === DURACION_BLOQUEO.UNA_HORA) {
    return Date.now() + 60 * 60 * 1000;
  }
  if (duracion === DURACION_BLOQUEO.DOS_HORAS) {
    return Date.now() + 2 * 60 * 60 * 1000;
  }

  const finDelDia = new Date();
  finDelDia.setHours(23, 59, 59, 999);
  return finDelDia.getTime();
}

function limpiarBloqueosExpirados(bloqueos) {
  const ahora = Date.now();
  const limpio = {};

  Object.entries(bloqueos).forEach(([canchaId, bloqueo]) => {
    if (
      bloqueo.status === COURT_STATUS.MAINTENANCE_BLOCKED &&
      bloqueo.expiresAt > ahora
    ) {
      limpio[canchaId] = bloqueo;
    }
  });

  return limpio;
}

function leerBloqueosGuardados() {
  try {
    const guardado = localStorage.getItem(STORAGE_KEY);
    if (!guardado) return {};
    const parsed = JSON.parse(guardado);
    return limpiarBloqueosExpirados(parsed);
  } catch {
    return {};
  }
}

function persistirBloqueos(bloqueos) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bloqueos));
  } catch {
    /* almacenamiento no disponible */
  }
}

export function CourtBlockProvider({ children }) {
  const [bloqueos, setBloqueos] = useState(leerBloqueosGuardados);

  const aplicarBloqueos = useCallback((updater) => {
    setBloqueos((prev) => {
      const siguiente = typeof updater === 'function' ? updater(prev) : updater;
      const limpio = limpiarBloqueosExpirados(siguiente);
      persistirBloqueos(limpio);
      return limpio;
    });
  }, []);

  const revisarExpiraciones = useCallback(() => {
    setBloqueos((prev) => {
      const limpio = limpiarBloqueosExpirados(prev);
      if (Object.keys(limpio).length !== Object.keys(prev).length) {
        persistirBloqueos(limpio);
      }
      return limpio;
    });
  }, []);

  useEffect(() => {
    revisarExpiraciones();
    const intervalo = setInterval(revisarExpiraciones, 30_000);
    return () => clearInterval(intervalo);
  }, [revisarExpiraciones]);

  const getCanchaEstado = useCallback(
    (canchaId) => {
      const bloqueo = bloqueos[canchaId];
      if (
        bloqueo?.status === COURT_STATUS.MAINTENANCE_BLOCKED &&
        bloqueo.expiresAt > Date.now()
      ) {
        return COURT_STATUS.MAINTENANCE_BLOCKED;
      }
      return COURT_STATUS.ACTIVE;
    },
    [bloqueos]
  );

  const isCanchaBloqueada = useCallback(
    (canchaId) => getCanchaEstado(canchaId) === COURT_STATUS.MAINTENANCE_BLOCKED,
    [getCanchaEstado]
  );

  const bloquearCancha = useCallback(
    (canchaId, duracion) => {
      const expiresAt = calcularExpiracion(duracion);
      aplicarBloqueos((prev) => ({
        ...prev,
        [canchaId]: {
          status: COURT_STATUS.MAINTENANCE_BLOCKED,
          expiresAt,
          duracion,
        },
      }));
    },
    [aplicarBloqueos]
  );

  const desbloquearCancha = useCallback(
    (canchaId) => {
      aplicarBloqueos((prev) => {
        const siguiente = { ...prev };
        delete siguiente[canchaId];
        return siguiente;
      });
    },
    [aplicarBloqueos]
  );

  const obtenerExpiracion = useCallback(
    (canchaId) => bloqueos[canchaId]?.expiresAt ?? null,
    [bloqueos]
  );

  const value = useMemo(
    () => ({
      bloqueos,
      getCanchaEstado,
      isCanchaBloqueada,
      bloquearCancha,
      desbloquearCancha,
      obtenerExpiracion,
      revisarExpiraciones,
    }),
    [
      bloqueos,
      getCanchaEstado,
      isCanchaBloqueada,
      bloquearCancha,
      desbloquearCancha,
      obtenerExpiracion,
      revisarExpiraciones,
    ]
  );

  return (
    <CourtBlockContext.Provider value={value}>{children}</CourtBlockContext.Provider>
  );
}

export function useCourtBlock() {
  const context = useContext(CourtBlockContext);
  if (!context) {
    throw new Error('useCourtBlock debe usarse dentro de un CourtBlockProvider');
  }
  return context;
}
