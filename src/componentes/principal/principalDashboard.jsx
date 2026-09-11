import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Banknote,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  SlidersHorizontal,
} from 'lucide-react';
import { useAccessibility } from '../../estados/AccessibilityContext';
import { useRainMode } from '../../estados/RainModeContext';
import { useMobileLayout } from '../../estados/MobileLayoutContext';
import ContextMenuReserva from './ContextMenuReserva';
import FormularioReservaManual from './FormularioReservaManual';
import MicroConfirmacionReprogramacion from './MicroConfirmacionReprogramacion';
import MicroToast from './MicroToast';
import PanelDesgloseIngresos from './PanelDesgloseIngresos';
import { obtenerTarifaCancha } from './constantesAgenda';
import axiosInstance from '../../api/axiosConfig';
const CANCHAS = [
  { id: 'maracana-f5', nombre: 'Maracaná F5', categoria: 'futbol' },
  { id: 'centenario-f7', nombre: 'Centenario F7', categoria: 'futbol' },
  { id: 'bombonera-f11', nombre: 'La Bombonera F11', categoria: 'futbol' },
  { id: 'pista-norte', nombre: 'Pista Norte', categoria: 'padel' },
  { id: 'pista-oeste', nombre: 'Pista Oeste ', categoria: 'padel' },
  { id: 'pista-este', nombre: 'Pista Este', categoria: 'padel' },
  { id: 'pista-sur', nombre: 'Pista Sur', categoria: 'padel' },
];

const ANCHO_COL_HORA = 76;
const ANCHO_COL_CANCHA = 220;

const CATEGORIA_A_DEPORTE = {
  futbol: 'Fútbol',
  padel: 'Pádel',
  voley: 'Voley',
};

function canchaFiltradaVisible(cancha, selectedSports) {
  return selectedSports.includes(CATEGORIA_A_DEPORTE[cancha.categoria]);
}

function columnasGrilla(canchas, esVisible) {
  const anchosCanchas = canchas.map((cancha) =>
    esVisible(cancha) ? `${ANCHO_COL_CANCHA}px` : '0px',
  );
  return `${ANCHO_COL_HORA}px ${anchosCanchas.join(' ')}`;
}

function estilosColumnaCancha(visible) {
  return visible
    ? 'min-w-[220px] max-w-[220px] opacity-100'
    : 'pointer-events-none min-w-0 max-w-0 w-0 overflow-hidden !border-transparent opacity-0 !p-0';
}

const DEPORTES_FILTRO = [
  { nombre: 'Fútbol', dot: 'bg-emerald-400', activo: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300' },
  { nombre: 'Pádel', dot: 'bg-sky-400', activo: 'bg-sky-500/15 border-sky-500/30 text-sky-300' },
  { nombre: 'Voley', dot: 'bg-amber-400', activo: 'bg-amber-500/15 border-amber-500/30 text-amber-300' },
];

const BORDES_CATEGORIA = {
  futbol: 'border-b-emerald-400',
  padel: 'border-b-sky-400',
  voley: 'border-b-amber-400',
};

// Horarios por defecto (fallback si no hay datos del API)
const HORAS_DEFAULT = [
  { etiqueta: '5:00 PM', clave: '17:00' },
  { etiqueta: '6:00 PM', clave: '18:00' },
  { etiqueta: '7:00 PM', clave: '19:00' },
  { etiqueta: '8:00 PM', clave: '20:00' },
  { etiqueta: '9:00 PM', clave: '21:00' },
  { etiqueta: '10:00 PM', clave: '22:00' },
  { etiqueta: '11:00 PM', clave: '23:00' },
];

const RESERVAS_DEMO = [
  {
    canchaId: 'maracana-f5',
    hora: '17:00',
    nombre: 'Felipe Aristizábal',
    telefono: '+57 300 123 4567',
    deporte: 'Fútbol 5',
    estadoPago: 'Pago Confirmado',
    pagoPendiente: false,
    totalPartido: 120000,
    pagadoOnline: 120000,
    saldoPendiente: 0,
    metodoPago: 'Pago vía Wompi (Tarjeta de Crédito)',
    creadaEn: 'Hace 2 días (Viernes 5 de Jun, 3:14 PM)',
    origen: 'Reservado por el Cliente (Aplicación Web)',
  },
  {
    canchaId: 'centenario-f7',
    hora: '18:00',
    nombre: 'Clara Mendoza',
    telefono: '+57 310 987 6543',
    deporte: 'Fútbol 7',
    estadoPago: 'Anticipo recibido',
    pagoPendiente: true,
    totalPartido: 160000,
    pagadoOnline: 40000,
    saldoPendiente: 120000,
    metodoPago: 'Pago vía Wompi/Stripe (Tarjeta de Crédito)',
    creadaEn: 'Hace 1 día (Sábado 6 de Jun, 11:22 AM)',
    origen: 'Reservado por el Cliente (Aplicación Web)',
  },
  {
    canchaId: 'bombonera-f11',
    hora: '19:00',
    nombre: 'Grupo Los Halcones',
    telefono: '+57 320 555 8899',
    deporte: 'Fútbol 11',
    estadoPago: 'Pago Confirmado',
    pagoPendiente: false,
    totalPartido: 280000,
    pagadoOnline: 0,
    saldoPendiente: 0,
    metodoPago: 'Efectivo en Caja',
    creadaEn: 'Hace 4 días (Miércoles 3 de Jun, 9:05 AM)',
    origen: 'Registrado por Administrador',
  },
  {
    canchaId: 'pista-norte',
    hora: '20:00',
    nombre: 'Academia Tenis Pro',
    telefono: '+57 315 444 2211',
    deporte: null,
    estadoPago: 'Pendiente por pagar',
    pagoPendiente: true,
    totalPartido: 200000,
    pagadoOnline: 0,
    saldoPendiente: 200000,
    metodoPago: 'Pendiente — sin pasarela registrada',
    creadaEn: 'Hace 6 horas (Domingo 7 de Jun, 8:30 AM)',
    origen: 'Registrado por Administrador',
  },
  {
    canchaId: 'maracana-f5',
    hora: '21:00',
    nombre: 'Torneo Zyra — Semifinal',
    telefono: '+57 300 000 1122',
    deporte: 'Fútbol 5',
    estadoPago: 'Pago Confirmado',
    pagoPendiente: false,
    totalPartido: 150000,
    pagadoOnline: 150000,
    saldoPendiente: 0,
    metodoPago: 'Pago vía Stripe (Tarjeta Débito)',
    creadaEn: 'Hace 5 días (Martes 2 de Jun, 4:50 PM)',
    origen: 'Registrado por Administrador',
    afectadaPorLluvia: true,
  },
];

function inicioDelDia(fecha) {
  const copia = new Date(fecha);
  copia.setHours(0, 0, 0, 0);
  return copia;
}

function agregarDias(fecha, dias) {
  const copia = new Date(fecha);
  copia.setDate(copia.getDate() + dias);
  return inicioDelDia(copia);
}

function formatearFechaLarga(fecha) {
  const texto = fecha.toLocaleDateString('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function formatearEtiquetaCorta(fecha) {
  const dia = fecha.toLocaleDateString('es-CO', { weekday: 'short' }).replace('.', '');
  const numero = fecha.getDate();
  const abreviatura = dia.charAt(0).toUpperCase() + dia.slice(1, 3);
  return `${abreviatura} ${numero}`;
}

function esMismoDia(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function construirBotonesRapidos(hoy) {
  return [
    { id: 'hoy', label: 'Hoy', fecha: hoy },
    { id: 'manana', label: 'Mañana', fecha: agregarDias(hoy, 1) },
    ...Array.from({ length: 3 }, (_, i) => {
      const fecha = agregarDias(hoy, i + 2);
      return {
        id: `dia-${i + 2}`,
        label: formatearEtiquetaCorta(fecha),
        fecha,
      };
    }),
  ];
}

function IconoFutbol({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3.5 8.2 8.5 12 12l3.8-3.5L12 3.5Z" />
      <path d="M8.2 8.5 5 12l3.2 3.5" />
      <path d="m16.8 8.5 3.2 3.5-3.2 3.5" />
      <path d="M12 12v8.5" />
      <path d="M8.2 15.5 12 20" />
      <path d="M15.8 15.5 12 20" />
    </svg>
  );
}

function IconoPadel({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <circle cx="17" cy="7" r="3.5" />
      <path d="M14.2 9.8 5.5 18.5" />
      <path d="M7 17.5 5.5 19" />
      <path d="M8.5 16 7 17.5" />
    </svg>
  );
}

const ICONOS_DEPORTE = {
  futbol: IconoFutbol,
  padel: IconoPadel,
};

function claveReserva(canchaId, hora) {
  return `${canchaId}-${hora}`;
}

function obtenerHoraFin(claveHora, horarios) {
  const indice = horarios.findIndex((h) => h.clave === claveHora);
  if (indice >= 0 && indice < horarios.length - 1) {
    return horarios[indice + 1].etiqueta;
  }
  return '12:00 AM';
}

function construirFranjaHoraria(claveHora, horarios) {
  const inicio = horarios.find((h) => h.clave === claveHora)?.etiqueta ?? claveHora;
  return `${inicio} - ${obtenerHoraFin(claveHora, horarios)}`;
}

const ALTURA_FILA_GRILLA_MOVIL = 64;

function claveAMinutos(clave) {
  const [horas, minutos] = clave.split(':').map(Number);
  return horas * 60 + (minutos || 0);
}

function calcularPosicionLineaTiempo(horarios, fechaSeleccionada) {
  const hoy = inicioDelDia(new Date());
  if (!esMismoDia(fechaSeleccionada, hoy) || horarios.length === 0) return null;

  const ahora = new Date();
  const minutosAhora =
    ahora.getHours() * 60 + ahora.getMinutes() + ahora.getSeconds() / 60;

  const primerMin = claveAMinutos(horarios[0].clave);
  const ultimoIdx = horarios.length - 1;
  const ultimoMin = claveAMinutos(horarios[ultimoIdx].clave);
  const ultimoFin =
    ultimoIdx < horarios.length - 1
      ? claveAMinutos(horarios[ultimoIdx + 1]?.clave ?? horarios[ultimoIdx].clave)
      : ultimoMin + 60;

  if (minutosAhora < primerMin || minutosAhora > ultimoFin) return null;

  for (let i = 0; i < horarios.length; i += 1) {
    const minInicio = claveAMinutos(horarios[i].clave);
    const minFin =
      i < horarios.length - 1
        ? claveAMinutos(horarios[i + 1].clave)
        : minInicio + 60;
    const duracion = minFin - minInicio;
    if (minutosAhora >= minInicio && minutosAhora < minFin) {
      const fraccion = (minutosAhora - minInicio) / duracion;
      return i * ALTURA_FILA_GRILLA_MOVIL + fraccion * ALTURA_FILA_GRILLA_MOVIL;
    }
  }

  return null;
}

function usePosicionLineaTiempo(horarios, fechaSeleccionada) {
  const [posicion, setPosicion] = useState(null);

  useEffect(() => {
    const actualizar = () => {
      setPosicion(calcularPosicionLineaTiempo(horarios, fechaSeleccionada));
    };

    actualizar();
    const intervalo = setInterval(actualizar, 30000);
    return () => clearInterval(intervalo);
  }, [horarios, fechaSeleccionada]);

  return posicion;
}

function claseBordeEstadoReserva(reserva) {
  const estado = (reserva.estadoPago || '').toLowerCase();

  if (estado.includes('anticipo') || estado.includes('abonad')) {
    return 'border-l-4 border-l-amber-500';
  }

  if (
    estado.includes('confirm') ||
    estado.includes('pagad') ||
    estado.includes('pago confirmado') ||
    (!reserva.pagoPendiente && reserva.estadoPago)
  ) {
    return 'border-l-4 border-l-emerald-500';
  }

  if (reserva.pagoPendiente || estado.includes('pendiente')) {
    return 'border-l-4 border-l-rose-500';
  }

  return 'border-l-4 border-l-zinc-600';
}

function SkeletonDashboard({ isLight, numHoras = 7 }) {
  const contenedorMaestro = isLight
    ? 'border-slate-200/80 bg-white'
    : 'border-[#1f1f23] bg-[#111111]';
  const skeletonBase = isLight ? 'bg-slate-200' : 'bg-[#1a1a1d]';
  const fondoCabecera = isLight ? 'bg-[#f8fafc]' : 'bg-[#111111]';
  const colorBorde = isLight ? 'border-slate-200/60' : 'border-[#1f1f23]';

  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden">
      <div className={`mb-1 w-full min-w-0 shrink-0 overflow-hidden rounded-lg border py-1.5 ${contenedorMaestro}`}>
        <div className="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-4 px-4">
          <div className="flex min-w-0 items-center justify-start gap-1.5">
            <div className={`h-1.5 w-1.5 shrink-0 animate-pulse rounded-full ${skeletonBase}`} />
            <div className={`h-3 w-32 animate-pulse rounded ${skeletonBase}`} />
          </div>

          <div className="flex items-center justify-center gap-1.5">
            <div className={`h-3 w-3 shrink-0 animate-pulse rounded ${skeletonBase}`} />
            <div className={`h-3 w-40 animate-pulse rounded ${skeletonBase}`} />
          </div>

          <div className="flex min-w-0 items-center justify-end gap-1.5">
            <div className={`h-3 w-3 shrink-0 animate-pulse rounded ${skeletonBase}`} />
            <div className={`h-3 w-36 animate-pulse rounded ${skeletonBase}`} />
          </div>
        </div>
      </div>

      <div className={`flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border ${contenedorMaestro}`}>
        <div className="grid-scroll min-h-0 w-full min-w-0 flex-1 overflow-hidden">
          <div className="grid h-full" style={{ gridTemplateColumns: `76px repeat(4, 220px)` }}>
            <div className={`sticky left-0 top-0 z-40 min-w-[76px] border-b-2 border-r ${colorBorde} border-b-[#1f1f23] ${fondoCabecera} p-1`}>
              <div className={`h-full w-full animate-pulse rounded-lg ${skeletonBase}`} />
            </div>

            {[...Array(4)].map((_, idx) => (
              <div
                key={`skeleton-cancha-${idx}`}
                className={`sticky top-0 z-20 border-b-2 border-r px-4 py-2.5 ${colorBorde} ${fondoCabecera}`}
              >
                <div className="flex min-w-0 items-center gap-2">
                  <div className={`h-4 w-4 shrink-0 animate-pulse rounded ${skeletonBase}`} />
                  <div className={`h-3.5 w-32 animate-pulse rounded ${skeletonBase}`} />
                </div>
              </div>
            ))}

            {[...Array(numHoras)].map((_, indice) => {
              const esPrimeraFila = indice === 0;
              const alturaCelda = esPrimeraFila ? 'min-h-[5rem] h-[5rem] pt-4' : 'h-16 min-h-16';

              return (
                <div key={`skeleton-hora-${indice}`} className="contents">
                  <div className={`sticky left-0 z-30 flex items-start border-b border-r px-4 ${alturaCelda} ${colorBorde} ${fondoCabecera}`}>
                    <div className={`h-3 w-16 animate-pulse rounded ${skeletonBase}`} />
                  </div>

                  {[...Array(4)].map((_, canchaIdx) => {
                    const tieneSkeleton = (indice + canchaIdx) % 3 === 0;

                    return (
                      <div
                        key={`skeleton-celda-${indice}-${canchaIdx}`}
                        className={`relative border-b border-r ${alturaCelda} ${colorBorde} ${tieneSkeleton ? 'p-1' : 'p-0'}`}
                      >
                        {tieneSkeleton && (
                          <div className={`h-full w-full animate-pulse rounded-xl ${skeletonBase}`} />
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function BarraMetricas({ isLight, onClickIngresos, metricas, cargando }) {
  const contenedor = isLight
    ? 'border-slate-200/80 bg-slate-50/80'
    : 'border-[#1f1f23] bg-white/[0.02]';
  const etiqueta = isLight ? 'text-[11px] text-slate-500' : 'text-[11px] text-[#6b6b7b]';
  const valor = isLight ? 'text-[11px] font-medium text-slate-900' : 'text-[11px] font-medium text-white';

  const ocupacion = metricas?.ocupacion_porcentaje ?? 0;
  const horasDisponibles = metricas?.horas_disponibles ?? 0;
  const ingresos = metricas?.ingresos_estimados_cop ?? 0;

  const formatearPesos = (valorNum) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(valorNum);
  };

  const kpiCard = isLight
    ? 'bg-slate-50/80 border border-slate-200/60 p-2.5 rounded-xl'
    : 'bg-zinc-900/40 border border-zinc-800/50 p-2.5 rounded-xl';
  const kpiTitulo =
    'text-[9px] tracking-wider text-zinc-500 uppercase font-medium block text-center leading-tight';
  const kpiValor = isLight
    ? 'text-xs font-semibold text-slate-800 mt-0.5 block text-center leading-tight md:text-sm'
    : 'text-xs font-semibold text-zinc-100 mt-0.5 block text-center leading-tight md:text-sm';

  return (
    <div
      className={`mb-2 w-full min-w-0 shrink-0 overflow-hidden md:mb-1 md:rounded-lg md:border ${contenedor}`}
    >
      {/* Móvil: rejilla 3 columnas con KPIs apilados */}
      <div className="grid w-full grid-cols-3 gap-2 md:hidden">
        <div className={kpiCard}>
          <span className={kpiTitulo}>Ocupación</span>
          <span className={kpiValor}>{ocupacion}%</span>
        </div>

        <div className={kpiCard}>
          <span className={kpiTitulo}>Libres</span>
          <span className={kpiValor}>{horasDisponibles}h</span>
        </div>

        <button
          type="button"
          onClick={onClickIngresos}
          className={`${kpiCard} w-full transition-opacity duration-150 hover:opacity-80`}
          aria-label="Ver desglose de ingresos estimados"
        >
          <span className={kpiTitulo}>Ingresos</span>
          <span className={`${kpiValor} truncate`}>
            {formatearPesos(ingresos).replace(/\s?COP$/, '')}
          </span>
        </button>
      </div>

      {/* Desktop: disposición horizontal original */}
      <div className="hidden w-full grid-cols-[1fr_auto_1fr] items-center px-4 py-1.5 md:grid">
        <div className="flex min-w-0 items-center justify-start gap-1.5 whitespace-nowrap text-left">
          <span className="inline-flex h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
          <span className={etiqueta}>Ocupación:</span>
          <span className={valor}>{ocupacion}%</span>
        </div>

        <div className="flex items-center justify-center gap-1.5 whitespace-nowrap px-4 text-center">
          <Clock className="h-3 w-3 shrink-0 text-[#6b6b7b]" strokeWidth={1.5} />
          <span className={etiqueta}>Horas Disponibles:</span>
          <span className={valor}>{horasDisponibles} horas</span>
        </div>

        <button
          type="button"
          onClick={onClickIngresos}
          className="flex min-w-0 items-center justify-end gap-1.5 whitespace-nowrap text-right transition-colors duration-150 hover:opacity-80"
          aria-label="Ver desglose de ingresos estimados"
        >
          <Banknote className="h-3 w-3 shrink-0 text-[#6b6b7b]" strokeWidth={1.5} />
          <span className={etiqueta}>Ingresos Estimados:</span>
          <span className={valor}>{formatearPesos(ingresos)}</span>
        </button>
      </div>
    </div>
  );
}

function CabeceraCancha({ cancha, isLight, conCirculo = false }) {
  const IconoDeporte = ICONOS_DEPORTE[cancha.categoria] ?? IconoFutbol;
  const colorIcono = cancha.categoria === 'padel' ? 'text-sky-400' : 'text-emerald-400';
  const fondoCirculo =
    cancha.categoria === 'padel'
      ? 'bg-sky-500/15 ring-1 ring-sky-500/25'
      : 'bg-emerald-500/15 ring-1 ring-emerald-500/25';

  return (
    <div className="flex min-w-0 items-center gap-2">
      {conCirculo ? (
        <div
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${fondoCirculo}`}
        >
          <IconoDeporte className={`h-3.5 w-3.5 ${colorIcono}`} />
        </div>
      ) : (
        <IconoDeporte className={`h-4 w-4 shrink-0 ${colorIcono}`} />
      )}
      <p
        className={`truncate text-[13px] font-semibold tracking-[-0.01em] ${
          isLight ? 'text-slate-900' : 'text-white'
        }`}
      >
        {cancha.nombre}
      </p>
    </div>
  );
}

function BadgeEstado({ reserva, afectadaPorLluvia }) {
  if (!reserva.estadoPago) return null;

  const claseBadge =
    'inline-flex max-w-full items-center truncate rounded-md px-2 py-0.5 text-[11px] font-medium leading-none';

  if (afectadaPorLluvia) {
    return (
      <span className={`${claseBadge} bg-cyan-500/10 text-cyan-400`}>
        Reagendable
      </span>
    );
  }

  if (reserva.pagoPendiente && reserva.estadoPago !== 'Anticipo recibido') {
    return (
      <span className={`${claseBadge} bg-rose-500/10 text-rose-400`}>
        {reserva.estadoPago}
      </span>
    );
  }

  if (reserva.estadoPago === 'Anticipo recibido') {
    return (
      <span className={`${claseBadge} bg-amber-500/10 text-amber-400`}>
        Anticipo recibido
      </span>
    );
  }

  return (
    <span className={`${claseBadge} bg-emerald-500/10 text-emerald-400`}>
      Pago Confirmado
    </span>
  );
}

function TarjetaReserva({
  reserva,
  isLight,
  tormentaActiva,
  onClick,
  oculta = false,
  soloLectura = false,
  draggable = false,
  onDragStart,
  onDragEnd,
  esArrastrando = false,
  rebotando = false,
}) {
  const afectada = reserva.afectadaPorLluvia && tormentaActiva;
  const arrastreActivo = draggable && !soloLectura;

  const claseTarjeta = `relative z-[1] flex h-full min-h-0 w-full select-none flex-col justify-between gap-1 overflow-hidden rounded-xl px-2.5 py-1.5 text-left transition-all duration-200 ease-out ${claseBordeEstadoReserva(reserva)} ${
    oculta ? 'pointer-events-none opacity-0' : ''
  } ${
    esArrastrando
      ? 'cursor-grabbing opacity-50 shadow-2xl scale-95'
      : arrastreActivo
        ? 'cursor-grab active:cursor-grabbing'
        : ''
  } ${
    rebotando ? 'scale-[0.97] opacity-75' : ''
  } ${
    afectada
      ? 'bg-cyan-950/30 shadow-[0_1px_0_rgba(56,189,248,0.08)_inset,0_2px_8px_rgba(0,0,0,0.18)] ring-1 ring-cyan-500/20'
      : isLight
        ? 'bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06),0_2px_8px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/80 hover:ring-slate-300/80'
        : 'bg-[#141414] shadow-[0_2px_8px_rgba(0,0,0,0.35),0_1px_0_rgba(255,255,255,0.04)_inset] ring-1 ring-[#1f1f23] hover:ring-zinc-700/60'
  }`;

  const contenido = (
    <>
      <p
        className={`min-w-0 truncate text-xs font-medium leading-tight ${
          isLight ? 'text-slate-900' : 'text-slate-100'
        }`}
      >
        {reserva.nombre}
      </p>
      {afectada && (
        <p className="truncate text-[10px] font-medium leading-none text-cyan-400/80">
          Modo Lluvia
        </p>
      )}
      <div className="min-w-0 shrink">
        <BadgeEstado reserva={reserva} afectadaPorLluvia={afectada} />
      </div>
    </>
  );

  if (soloLectura || !onClick) {
    return <div className={claseTarjeta}>{contenido}</div>;
  }

  return (
    <div
      role="button"
      tabIndex={0}
      draggable={arrastreActivo}
      onDragStart={arrastreActivo ? onDragStart : undefined}
      onDragEnd={arrastreActivo ? onDragEnd : undefined}
      onClick={onClick}
      onKeyDown={(evento) => {
        if (evento.key === 'Enter' || evento.key === ' ') {
          evento.preventDefault();
          onClick(evento);
        }
      }}
      className={claseTarjeta}
    >
      {contenido}
    </div>
  );
}

function CeldaDisponible({ isLight, onAgendar, oculta = false }) {
  return (
    <button
      type="button"
      onClick={onAgendar}
      className={`block h-full min-h-[50px] w-full touch-manipulation transition-colors duration-150 [-webkit-tap-highlight-color:transparent] ${
        oculta ? 'pointer-events-none opacity-0' : ''
      } ${isLight ? 'active:bg-slate-100/80 md:hover:bg-slate-100/70' : 'active:bg-white/[0.06] md:hover:bg-white/[0.03]'}`}
    >
      <span className="sr-only">Agendar horario disponible</span>
    </button>
  );
}

function CinturonNavegacionTemporal({ fechaSeleccionada, onCambiarFecha, isLight }) {
  const inputFechaRef = useRef(null);
  const hoy = useMemo(() => inicioDelDia(new Date()), []);
  const botonesRapidos = useMemo(() => construirBotonesRapidos(hoy), [hoy]);

  const abrirSelectorFecha = () => {
    inputFechaRef.current?.showPicker?.();
    inputFechaRef.current?.click();
  };

  const botonGhost = isLight
    ? 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
    : 'text-[#6b6b7b] hover:bg-white/[0.04] hover:text-white';

  const diaInactivo = isLight
    ? 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
    : 'text-[#6b6b7b] hover:bg-white/[0.04] hover:text-white';

  const diaActivo = isLight
    ? 'bg-slate-200/60 font-medium text-emerald-600'
    : 'bg-white/[0.04] font-medium text-white';

  return (
    <>
      {/* Móvil: fila de días a ancho completo, sin flechas */}
      <div className="w-full md:hidden">
        <div className="flex w-full gap-2 overflow-x-auto py-1 scrollbar-none [-webkit-overflow-scrolling:touch]">
          {botonesRapidos.map((boton) => {
            const activo = esMismoDia(fechaSeleccionada, boton.fecha);
            return (
              <button
                key={boton.id}
                type="button"
                onClick={() => onCambiarFecha(boton.fecha)}
                className={`shrink-0 rounded-lg px-3 py-1.5 text-xs transition-all duration-200 ${
                  activo ? diaActivo : diaInactivo
                }`}
              >
                {boton.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Desktop: cinturón inline original */}
      <div className="hidden min-w-0 shrink-0 items-center gap-1 md:flex">
      <button
        type="button"
        aria-label="Día anterior"
        onClick={() => onCambiarFecha(agregarDias(fechaSeleccionada, -1))}
        className={`shrink-0 rounded p-1 transition-all duration-200 ${botonGhost}`}
      >
        <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
      </button>

      <div className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap scrollbar-none [-webkit-overflow-scrolling:touch]">
        <div className="inline-flex items-center gap-1 pr-1">
          {botonesRapidos.map((boton) => {
            const activo = esMismoDia(fechaSeleccionada, boton.fecha);
            return (
              <button
                key={boton.id}
                type="button"
                onClick={() => onCambiarFecha(boton.fecha)}
                className={`shrink-0 rounded-md px-2 py-1 text-xs transition-all duration-200 ${
                  activo ? diaActivo : diaInactivo
                }`}
              >
                {boton.label}
              </button>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        aria-label="Día siguiente"
        onClick={() => onCambiarFecha(agregarDias(fechaSeleccionada, 1))}
        className={`shrink-0 rounded p-1 transition-all duration-200 ${botonGhost}`}
      >
        <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.5} />
      </button>

      <button
        type="button"
        aria-label="Seleccionar fecha"
        onClick={abrirSelectorFecha}
        className={`ml-1 shrink-0 rounded p-1.5 transition-all duration-200 ${botonGhost}`}
      >
        <CalendarDays className="h-3.5 w-3.5" strokeWidth={1.5} />
      </button>

      <input
        ref={inputFechaRef}
        type="date"
        className="sr-only"
        value={fechaSeleccionada.toISOString().slice(0, 10)}
        onChange={(e) => {
          if (e.target.value) {
            onCambiarFecha(inicioDelDia(new Date(`${e.target.value}T12:00:00`)));
          }
        }}
      />
      </div>
    </>
  );
}

function FiltroDeportesGrilla({ selectedSports, onToggleDeporte }) {
  const [abierto, setAbierto] = useState(false);
  const contenedorRef = useRef(null);

  useEffect(() => {
    if (!abierto) return undefined;

    const cerrarAlClickExterno = (evento) => {
      if (contenedorRef.current && !contenedorRef.current.contains(evento.target)) {
        setAbierto(false);
      }
    };

    document.addEventListener('mousedown', cerrarAlClickExterno);
    return () => document.removeEventListener('mousedown', cerrarAlClickExterno);
  }, [abierto]);

  return (
    <div ref={contenedorRef} className="relative flex h-full w-full items-stretch p-1">
      <button
        type="button"
        aria-expanded={abierto}
        aria-haspopup="listbox"
        aria-label="Filtrar canchas por deporte"
        onClick={() => setAbierto((prev) => !prev)}
        className="flex w-full cursor-pointer items-center justify-between gap-1.5 rounded-lg border border-slate-800 bg-[#16161a] px-2.5 py-1.5 text-xs font-medium text-slate-300 transition-all hover:border-slate-700"
      >
        <span className="flex min-w-0 items-center gap-1.5">
          <SlidersHorizontal className="h-3 w-3 shrink-0 text-slate-400" strokeWidth={1.75} />
          <span className="truncate">Filtrar</span>
        </span>
        <ChevronDown
          className={`h-3 w-3 shrink-0 text-slate-500 transition-transform duration-150 ${
            abierto ? 'rotate-180' : ''
          }`}
          strokeWidth={1.75}
        />
      </button>

      {abierto && (
        <div
          role="listbox"
          aria-label="Deportes disponibles"
          aria-multiselectable="true"
          className="filtro-deportes-dropdown absolute left-0 top-full z-50 mt-1 flex w-[200px] flex-col gap-1 rounded-xl border border-slate-700/60 bg-[#1e293b]/90 p-2 shadow-2xl backdrop-blur-md"
        >
          {DEPORTES_FILTRO.map((deporte) => {
            const seleccionado = selectedSports.includes(deporte.nombre);

            return (
              <button
                key={deporte.nombre}
                type="button"
                role="option"
                aria-selected={seleccionado}
                onClick={() => onToggleDeporte(deporte.nombre)}
                className={`flex w-full items-center gap-2 rounded-lg border px-2 py-1.5 text-left text-xs font-medium transition-all duration-200 ${
                  seleccionado
                    ? deporte.activo
                    : 'border-transparent text-slate-400 hover:border-slate-700/40 hover:bg-slate-800/40'
                }`}
              >
                <span
                  className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border transition-colors ${
                    seleccionado
                      ? 'border-current bg-current/20'
                      : 'border-slate-600 bg-transparent'
                  }`}
                  aria-hidden
                >
                  {seleccionado && (
                    <svg viewBox="0 0 12 12" className="h-2 w-2" fill="none" aria-hidden>
                      <path
                        d="M2.5 6L5 8.5L9.5 3.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </span>
                <span className={`h-2 w-2 shrink-0 rounded-full ${deporte.dot}`} aria-hidden />
                <span>{deporte.nombre}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < breakpoint,
  );

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const onChange = (evento) => setIsMobile(evento.matches);
    setIsMobile(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [breakpoint]);

  return isMobile;
}

function formatoHoraCompacta(etiqueta) {
  const match = etiqueta.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return etiqueta;
  const [, horas, minutos, periodo] = match;
  if (minutos === '00') return `${horas} ${periodo}`;
  return `${horas}:${minutos}`;
}

function SliderCanchasMovil({ canchas, activa, onSelect, isLight }) {
  if (canchas.length <= 1) return null;

  return (
    <div className="mb-2 shrink-0 md:hidden">
      <div className="flex w-full gap-2 overflow-x-auto whitespace-nowrap py-1 scrollbar-none [-webkit-overflow-scrolling:touch]">
        {canchas.map((cancha) => {
          const isActive = activa === cancha.id;
          return (
            <button
              key={cancha.id}
              type="button"
              onClick={() => onSelect(cancha.id)}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                isActive
                  ? isLight
                    ? 'border border-emerald-500/50 bg-emerald-500/10 text-emerald-600'
                    : 'border border-[#00FF66]/40 bg-[#00FF66]/[0.06] text-[#00FF66]'
                  : isLight
                    ? 'border border-transparent bg-slate-100/80 text-slate-500 hover:text-slate-700'
                    : 'border border-transparent bg-zinc-900/40 text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {cancha.nombre}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function HeaderAgendaLinear({ fechaSeleccionada, onCambiarFecha, isLight }) {
  const inputFechaRef = useRef(null);
  const claseHeader = isLight
    ? 'border-slate-100 bg-white'
    : 'border-[#1f1f23] bg-[#111111]';

  const botonCalendario = isLight
    ? 'shrink-0 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700'
    : 'shrink-0 rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-white/[0.04] hover:text-white';

  const abrirSelectorFecha = () => {
    inputFechaRef.current?.showPicker?.();
    inputFechaRef.current?.click();
  };

  return (
    <header
      className={`flex shrink-0 flex-col gap-1 border-b px-2 py-2.5 transition-all duration-300 md:flex-row md:items-center md:justify-between md:gap-4 md:px-6 md:py-1.5 ${claseHeader}`}
    >
      {/* Móvil: calendario + fecha en la misma línea */}
      <div className="flex w-full items-center gap-2 md:hidden">
        <button
          type="button"
          aria-label="Seleccionar fecha"
          onClick={abrirSelectorFecha}
          className={botonCalendario}
        >
          <CalendarDays className="h-4 w-4" strokeWidth={1.5} />
        </button>
        <h1
          className={`min-w-0 flex-1 text-lg font-semibold leading-snug ${
            isLight ? 'text-slate-900' : 'text-white'
          }`}
        >
          {formatearFechaLarga(fechaSeleccionada)}
        </h1>
        <input
          ref={inputFechaRef}
          type="date"
          className="sr-only"
          value={fechaSeleccionada.toISOString().slice(0, 10)}
          onChange={(e) => {
            if (e.target.value) {
              onCambiarFecha(inicioDelDia(new Date(`${e.target.value}T12:00:00`)));
            }
          }}
        />
      </div>

      {/* Desktop: fecha compacta */}
      <h1
        className={`hidden min-w-0 shrink-0 whitespace-nowrap text-sm font-semibold md:block ${
          isLight ? 'text-slate-900' : 'text-white'
        }`}
      >
        {formatearFechaLarga(fechaSeleccionada)}
      </h1>

      <div className="w-full min-w-0 md:w-auto">
        <CinturonNavegacionTemporal
          fechaSeleccionada={fechaSeleccionada}
          onCambiarFecha={onCambiarFecha}
          isLight={isLight}
        />
      </div>
    </header>
  );
}

function GrillaAgendaMovil({
  cancha,
  horarios,
  mapaReservas,
  isLight,
  tormentaActiva,
  fechaSeleccionada,
  menuContexto,
  formularioAgenda,
  arrastre,
  celdaHover,
  rebotando,
  confirmacion,
  manejarDragOver,
  manejarDragLeave,
  manejarDrop,
  abrirFormulario,
  abrirMenu,
  iniciarArrastre,
  finalizarArrastre,
}) {
  const colorBorde = isLight ? 'border-slate-200/60' : 'border-[#1f1f23]';
  const textoHora = isLight ? 'text-slate-400' : 'text-[#6b6b7b]';
  const fondoCabecera = isLight ? 'bg-[#f8fafc]' : 'bg-[#111111]';
  const posicionLinea = usePosicionLineaTiempo(horarios, fechaSeleccionada);

  if (!cancha) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-8 md:hidden">
        <p className={`text-center text-xs ${textoHora}`}>No hay canchas disponibles</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-auto md:hidden">
      <div
        className={`sticky top-0 z-20 shrink-0 border-b px-3 py-2.5 ${colorBorde} ${fondoCabecera}`}
      >
        <CabeceraCancha cancha={cancha} isLight={isLight} conCirculo />
      </div>

      <div className="relative flex min-h-0 flex-1 flex-col">
        {posicionLinea !== null && (
          <div
            className="pointer-events-none absolute left-0 right-0 z-10 flex items-center"
            style={{ top: `${posicionLinea}px` }}
            aria-hidden
          >
            <span className="absolute left-[3.75rem] z-10 h-2 w-2 -translate-x-1/2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.55)]" />
            <div className="ml-[3.75rem] flex-1 border-t border-emerald-500/80" />
          </div>
        )}

      {horarios.map((hora) => {
        const clave = claveReserva(cancha.id, hora.clave);
        const reserva = mapaReservas.get(clave);
        const menuAbierto = menuContexto?.clave === clave;
        const formularioAbierto = formularioAgenda?.clave === clave;
        const esOrigenArrastre = arrastre?.claveOrigen === clave;
        const hoverActivo = celdaHover?.clave === clave;

        return (
          <div
            key={hora.clave}
            className={`grid min-h-16 grid-cols-[3.75rem_minmax(0,1fr)] border-b ${colorBorde}`}
          >
            <div
              className={`flex min-w-[3.75rem] max-w-[3.75rem] items-start border-r py-2 pl-1 pr-0.5 ${colorBorde}`}
            >
              <span className={`text-[10px] font-medium leading-tight ${textoHora}`}>
                {formatoHoraCompacta(hora.etiqueta)}
              </span>
            </div>

            <div
              className={`relative flex min-h-16 min-w-0 flex-1 ${reserva ? 'p-1' : ''}`}
              onDragOver={(evento) => manejarDragOver(evento, cancha, hora)}
              onDragLeave={() => manejarDragLeave(clave)}
              onDrop={(evento) => manejarDrop(evento, cancha, hora)}
            >
              {hoverActivo && (
                <div
                  className={`pointer-events-none absolute inset-0 z-10 transition-all duration-200 ease-out ${
                    celdaHover.disponible
                      ? 'border border-emerald-500/50 bg-emerald-500/[0.02]'
                      : 'border border-rose-500/50 bg-rose-500/[0.02]'
                  }`}
                  aria-hidden
                />
              )}

              {esOrigenArrastre && (
                <div
                  className="pointer-events-none absolute inset-1 z-0 rounded-xl border border-dashed border-slate-700 bg-slate-800/20"
                  aria-hidden
                />
              )}

              {reserva ? (
                <TarjetaReserva
                  reserva={reserva}
                  isLight={isLight}
                  tormentaActiva={tormentaActiva}
                  oculta={menuAbierto}
                  draggable={!menuAbierto && !confirmacion}
                  esArrastrando={esOrigenArrastre}
                  rebotando={rebotando === clave}
                  onDragStart={(evento) => iniciarArrastre(evento, reserva, clave)}
                  onDragEnd={finalizarArrastre}
                  onClick={(evento) => abrirMenu(evento, reserva, cancha)}
                />
              ) : (
                <CeldaDisponible
                  isLight={isLight}
                  oculta={formularioAbierto}
                  onAgendar={(evento) => abrirFormulario(evento, cancha, hora)}
                />
              )}
            </div>
          </div>
        );
      })}
      </div>
    </div>
  );
}

function GrillaMulticancha({
  reservas,
  canchas,
  horarios,
  onReservasChange,
  isLight,
  tormentaActiva,
  fechaSeleccionada,
  onConfirmarReserva,
  onRecargarDatos,
  canchaActivaMovil,
  selectedSports,
  onToggleDeporte,
}) {
  const { registerCreateHandler } = useMobileLayout();
  const isMobile = useIsMobile();
  const [menuContexto, setMenuContexto] = useState(null);
  const [formularioAgenda, setFormularioAgenda] = useState(null);
  const [arrastre, setArrastre] = useState(null);
  const [celdaHover, setCeldaHover] = useState(null);
  const [rebotando, setRebotando] = useState(null);
  const [confirmacion, setConfirmacion] = useState(null);
  const [toast, setToast] = useState(null);
  const huboArrastreRef = useRef(false);
  const confirmacionPendienteRef = useRef(false);

  const canchasVisibles = useMemo(
    () => canchas.filter((c) => canchaFiltradaVisible(c, selectedSports)),
    [canchas, selectedSports],
  );

  const canchaActivaObj = useMemo(
    () => canchasVisibles.find((c) => c.id === canchaActivaMovil) ?? canchasVisibles[0] ?? null,
    [canchasVisibles, canchaActivaMovil],
  );

  const esCanchaVisibleEnGrilla = useCallback(
    (cancha) => {
      if (!canchaFiltradaVisible(cancha, selectedSports)) return false;
      if (isMobile && canchaActivaMovil) return cancha.id === canchaActivaMovil;
      return true;
    },
    [selectedSports, canchaActivaMovil, isMobile],
  );

  const mapaReservas = useMemo(() => {
    const mapa = new Map();
    reservas.forEach((reserva) => {
      mapa.set(claveReserva(reserva.canchaId, reserva.hora), reserva);
    });
    return mapa;
  }, [reservas]);

  const cerrarMenu = useCallback(() => setMenuContexto(null), []);
  const cerrarFormulario = useCallback(() => setFormularioAgenda(null), []);
  const limpiarArrastre = useCallback(() => {
    setArrastre(null);
    setCeldaHover(null);
  }, []);

  const celdaDisponible = useCallback(
    (clave, canchaId, horaClave) => {
      if (arrastre?.claveOrigen === clave) return true;
      return !mapaReservas.has(claveReserva(canchaId, horaClave));
    },
    [arrastre, mapaReservas],
  );

  const iniciarArrastre = useCallback((evento, reserva, clave) => {
    huboArrastreRef.current = false;
    evento.dataTransfer.effectAllowed = 'move';
    evento.dataTransfer.setData('text/plain', clave);
    evento.dataTransfer.setData(
      'application/x-zyra-reserva',
      JSON.stringify({ clave, canchaId: reserva.canchaId, hora: reserva.hora }),
    );

    const imagenArrastre = evento.currentTarget.cloneNode(true);
    imagenArrastre.style.position = 'absolute';
    imagenArrastre.style.top = '-9999px';
    imagenArrastre.style.width = `${evento.currentTarget.offsetWidth}px`;
    imagenArrastre.style.opacity = '0.92';
    document.body.appendChild(imagenArrastre);
    evento.dataTransfer.setDragImage(
      imagenArrastre,
      evento.currentTarget.offsetWidth / 2,
      evento.currentTarget.offsetHeight / 2,
    );
    requestAnimationFrame(() => document.body.removeChild(imagenArrastre));

    setArrastre({ claveOrigen: clave, reserva });
    setMenuContexto(null);
    setFormularioAgenda(null);
  }, []);

  const finalizarArrastre = useCallback(() => {
    huboArrastreRef.current = true;
    if (!confirmacionPendienteRef.current) {
      limpiarArrastre();
    }
    confirmacionPendienteRef.current = false;
    window.setTimeout(() => {
      huboArrastreRef.current = false;
    }, 0);
  }, [limpiarArrastre]);

  const manejarDragOver = useCallback(
    (evento, cancha, hora) => {
      if (!arrastre) return;
      evento.preventDefault();
      evento.dataTransfer.dropEffect = 'move';

      const clave = claveReserva(cancha.id, hora.clave);
      const disponible = celdaDisponible(clave, cancha.id, hora.clave);

      setCeldaHover((prev) =>
        prev?.clave === clave && prev?.disponible === disponible
          ? prev
          : { clave, disponible },
      );
    },
    [arrastre, celdaDisponible],
  );

  const manejarDragLeave = useCallback((clave) => {
    setCeldaHover((prev) => (prev?.clave === clave ? null : prev));
  }, []);

  const manejarDrop = useCallback(
    (evento, cancha, hora) => {
      evento.preventDefault();
      if (!arrastre) return;

      const claveDestino = claveReserva(cancha.id, hora.clave);
      const { claveOrigen, reserva } = arrastre;

      if (claveDestino === claveOrigen) {
        limpiarArrastre();
        return;
      }

      const disponible = celdaDisponible(claveDestino, cancha.id, hora.clave);

      if (!disponible) {
        setRebotando(claveOrigen);
        limpiarArrastre();
        window.setTimeout(() => setRebotando(null), 200);
        return;
      }

      const canchaOrigen = canchas.find((c) => c.id === reserva.canchaId);
      const horaOrigen = horarios.find((h) => h.clave === reserva.hora);
      const tarifaOrigen = obtenerTarifaCancha(reserva.canchaId);
      const tarifaDestino = obtenerTarifaCancha(cancha.id);

      const rectCelda = evento.currentTarget.getBoundingClientRect();
      confirmacionPendienteRef.current = true;
      setConfirmacion({
        reserva,
        claveOrigen,
        claveDestino,
        destino: { canchaId: cancha.id, hora: hora.clave },
        origen: {
          nombreCancha: canchaOrigen?.nombre ?? reserva.canchaId,
          horaEtiqueta: horaOrigen?.etiqueta ?? reserva.hora,
        },
        destinoInfo: {
          nombreCancha: cancha.nombre,
          horaEtiqueta: hora.etiqueta,
        },
        diferenciaTarifa: tarifaDestino - tarifaOrigen,
        anchorRect: {
          top: rectCelda.top,
          left: rectCelda.left,
          width: rectCelda.width,
          height: rectCelda.height,
          bottom: rectCelda.bottom,
          right: rectCelda.right,
        },
      });
      setCeldaHover(null);
    },
    [arrastre, celdaDisponible, limpiarArrastre, canchas, horarios],
  );

  const cancelarConfirmacion = useCallback(() => {
    setConfirmacion(null);
    limpiarArrastre();
  }, [limpiarArrastre]);

  const confirmarReprogramacion = useCallback(async (motivo) => {
    if (!confirmacion) return;

    const { reserva, claveOrigen, destino } = confirmacion;

    try {
      const token = localStorage.getItem('token');
      
      // Extraer IDs numéricos
      const reservaId = reserva.id; // Ya viene como número desde mapearReservaAPI
      
      // Extraer ID numérico de la cancha destino (viene como "cancha-5")
      let nuevaCanchaId = null;
      if (typeof destino.canchaId === 'string') {
        const match = destino.canchaId.match(/\d+/);
        nuevaCanchaId = match ? parseInt(match[0]) : null;
      } else if (typeof destino.canchaId === 'number') {
        nuevaCanchaId = destino.canchaId;
      }

      // Validar que tenemos IDs válidos
      if (!reservaId || isNaN(reservaId)) {
        console.error('❌ ID de reserva inválido:', reserva.id);
        alert('Error: ID de reserva inválido');
        return;
      }

      if (!nuevaCanchaId || isNaN(nuevaCanchaId)) {
        console.error('❌ ID de cancha inválido:', destino.canchaId);
        alert('Error: ID de cancha inválido');
        return;
      }

      console.log('📝 Reprogramando:', {
        reservaId_raw: reserva.id,
        reservaId_parsed: reservaId,
        canchaId_raw: destino.canchaId,
        nuevaCanchaId_parsed: nuevaCanchaId,
        hora: destino.hora,
        fecha: fechaSeleccionada.toISOString().split('T')[0]
      });

      const payload = {
        nueva_cancha_id: nuevaCanchaId,
        nueva_hora_inicio: destino.hora,
        nueva_fecha: fechaSeleccionada.toISOString().split('T')[0],
        motivo: motivo || null
      };

      console.log('📦 Payload enviado al backend:', payload);

      const response = await axiosInstance.patch(
        `/api/reservas/${reservaId}/mover`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        // Recargar el dashboard usando la función pasada como prop
        if (onRecargarDatos) {
          onRecargarDatos();
        }
        
        setConfirmacion(null);
        limpiarArrastre();
        setToast('Partido reprogramado correctamente');
      }
    } catch (error) {
      console.error('Error al reprogramar:', error);
      const mensaje = error.response?.data?.message || 'Error al reprogramar la reserva';
      alert(mensaje);
      setConfirmacion(null);
      limpiarArrastre();
    }
  }, [confirmacion, limpiarArrastre, fechaSeleccionada, onRecargarDatos]);

  const abrirFormulario = useCallback((evento, cancha, hora) => {
    const rect = evento.currentTarget.getBoundingClientRect();
    setFormularioAgenda({
      clave: claveReserva(cancha.id, hora.clave),
      anchorRect: {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        bottom: rect.bottom,
        right: rect.right,
      },
      cancha,
      hora,
    });
  }, []);

  const abrirFormularioDesdeFab = useCallback(() => {
    if (!canchas.length || !horarios.length) return;

    const cancha =
      canchas.find((c) => esCanchaVisibleEnGrilla(c)) ??
      canchas.find((c) => canchaFiltradaVisible(c, selectedSports)) ??
      canchas[0];
    const hora =
      horarios.find((h) => !mapaReservas.has(claveReserva(cancha.id, h.clave))) ??
      horarios[0];

    const fabSize = 56;
    const fabMargin = 24;
    const navOffset = 80;
    const anchorRect = {
      top: window.innerHeight - navOffset - fabSize,
      left: window.innerWidth - fabMargin - fabSize,
      width: fabSize,
      height: fabSize,
      bottom: window.innerHeight - navOffset,
      right: window.innerWidth - fabMargin,
    };

    setFormularioAgenda({
      clave: claveReserva(cancha.id, hora.clave),
      anchorRect,
      cancha,
      hora,
    });
  }, [canchas, horarios, selectedSports, mapaReservas, esCanchaVisibleEnGrilla]);

  useEffect(() => {
    if (!registerCreateHandler) return undefined;
    return registerCreateHandler(abrirFormularioDesdeFab);
  }, [registerCreateHandler, abrirFormularioDesdeFab]);

  const abrirMenu = useCallback((evento, reserva, cancha) => {
    if (huboArrastreRef.current || arrastre) return;

    const rect = evento.currentTarget.getBoundingClientRect();
    setMenuContexto({
      reserva,
      clave: claveReserva(reserva.canchaId, reserva.hora),
      nombreCancha: cancha.nombre,
      franjaHoraria: construirFranjaHoraria(reserva.hora, horarios),
      fechaTexto: formatearFechaLarga(fechaSeleccionada),
      anchorRect: {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        bottom: rect.bottom,
        right: rect.right,
      },
    });
  }, [arrastre, fechaSeleccionada, horarios]);

  const handleAccionMenu = useCallback((accion, reserva) => {
    console.log(`Acción "${accion}" en reserva:`, reserva.nombre);
  }, []);

  const fondoHora = isLight ? 'bg-[#f8fafc]' : 'bg-[#111111]';
  const fondoCabecera = isLight ? 'bg-[#f8fafc]' : 'bg-[#111111]';
  const colorBorde = isLight ? 'border-slate-200/60' : 'border-[#1f1f23]';
  const bordeCelda = `border-r border-b ${colorBorde}`;
  const textoHora = isLight ? 'text-slate-400' : 'text-[#6b6b7b]';
  const alturaFila = 'h-16 min-h-16';
  const contenedorMaestro = isLight
    ? 'border-slate-200/80 bg-white'
    : 'border-[#1f1f23] bg-[#111111]';

  return (
    <>
      <div
        className={`flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden rounded-xl border md:rounded-2xl ${contenedorMaestro}`}
      >
        <GrillaAgendaMovil
          cancha={canchaActivaObj}
          horarios={horarios}
          mapaReservas={mapaReservas}
          isLight={isLight}
          tormentaActiva={tormentaActiva}
          fechaSeleccionada={fechaSeleccionada}
          menuContexto={menuContexto}
          formularioAgenda={formularioAgenda}
          arrastre={arrastre}
          celdaHover={celdaHover}
          rebotando={rebotando}
          confirmacion={confirmacion}
          manejarDragOver={manejarDragOver}
          manejarDragLeave={manejarDragLeave}
          manejarDrop={manejarDrop}
          abrirFormulario={abrirFormulario}
          abrirMenu={abrirMenu}
          iniciarArrastre={iniciarArrastre}
          finalizarArrastre={finalizarArrastre}
        />

        <div className="grid-scroll hidden min-h-0 w-full min-w-0 flex-1 overflow-x-auto overflow-y-auto md:block">
          <div
            className="grid w-max transition-[grid-template-columns] duration-300 ease-in-out"
            style={{ gridTemplateColumns: columnasGrilla(canchas, esCanchaVisibleEnGrilla) }}
          >
            <div
              className={`sticky left-0 top-0 z-40 min-w-[76px] border-b-2 border-r ${colorBorde} border-b-[#1f1f23] ${fondoCabecera}`}
            >
              <FiltroDeportesGrilla
                selectedSports={selectedSports}
                onToggleDeporte={onToggleDeporte}
              />
            </div>

            {canchas.map((cancha) => {
              const visible = esCanchaVisibleEnGrilla(cancha);
              const bordeCategoria =
                BORDES_CATEGORIA[cancha.categoria] ?? BORDES_CATEGORIA.futbol;

              return (
                <div
                  key={cancha.id}
                  aria-hidden={!visible}
                  className={`sticky top-0 z-20 border-b-2 border-r ${colorBorde} shadow-[0_1px_0_0_rgba(255,255,255,0.04)] transition-all duration-300 ease-in-out ${bordeCategoria} ${fondoCabecera} max-md:hidden ${
                    visible ? 'px-4 py-2.5' : ''
                  } ${estilosColumnaCancha(visible)}`}
                >
                  {visible && <CabeceraCancha cancha={cancha} isLight={isLight} />}
                </div>
              );
            })}

            {horarios.map((hora, indice) => {
              const esPrimeraFila = indice === 0;
              const alturaCelda = esPrimeraFila
                ? 'min-h-[4rem] h-[4rem] pt-2 md:min-h-[5rem] md:h-[5rem] md:pt-4'
                : alturaFila;

              return (
                <div key={hora.clave} className="contents">
                  <div
                    className={`sticky left-0 z-30 flex items-start border-b border-r px-2 md:px-4 ${alturaCelda} ${bordeCelda} ${fondoHora}`}
                  >
                    <span className={`text-[12px] font-medium tracking-[-0.01em] ${textoHora}`}>
                      {hora.etiqueta}
                    </span>
                  </div>

                  {canchas.map((cancha) => {
                    const visible = esCanchaVisibleEnGrilla(cancha);
                    const clave = claveReserva(cancha.id, hora.clave);
                    const reserva = mapaReservas.get(clave);
                    const menuAbierto = menuContexto?.clave === clave;
                    const formularioAbierto = formularioAgenda?.clave === clave;

                    const esOrigenArrastre = arrastre?.claveOrigen === clave;
                    const hoverActivo = celdaHover?.clave === clave;

                    return (
                      <div
                        key={clave}
                        aria-hidden={!visible}
                        className={`relative border-b border-r ${alturaCelda} ${bordeCelda} transition-all duration-300 ease-in-out ${estilosColumnaCancha(visible)} ${
                          visible && reserva ? 'p-1' : 'p-0'
                        }`}
                        onDragOver={visible ? (evento) => manejarDragOver(evento, cancha, hora) : undefined}
                        onDragLeave={visible ? () => manejarDragLeave(clave) : undefined}
                        onDrop={visible ? (evento) => manejarDrop(evento, cancha, hora) : undefined}
                      >
                        {visible && hoverActivo && (
                          <div
                            className={`pointer-events-none absolute inset-0 z-10 transition-all duration-200 ease-out ${
                              celdaHover.disponible
                                ? 'border border-emerald-500/50 bg-emerald-500/[0.02]'
                                : 'border border-rose-500/50 bg-rose-500/[0.02]'
                            }`}
                            aria-hidden
                          />
                        )}

                        {visible && esOrigenArrastre && (
                          <div
                            className="pointer-events-none absolute inset-1 z-0 rounded-xl border border-dashed border-slate-700 bg-slate-800/20 transition-all duration-200 ease-out"
                            aria-hidden
                          />
                        )}

                        {visible && reserva ? (
                          <TarjetaReserva
                            reserva={reserva}
                            isLight={isLight}
                            tormentaActiva={tormentaActiva}
                            oculta={menuAbierto}
                            draggable={!menuAbierto && !confirmacion}
                            esArrastrando={esOrigenArrastre}
                            rebotando={rebotando === clave}
                            onDragStart={(evento) => iniciarArrastre(evento, reserva, clave)}
                            onDragEnd={finalizarArrastre}
                            onClick={(evento) => abrirMenu(evento, reserva, cancha)}
                          />
                        ) : visible ? (
                          <CeldaDisponible
                            isLight={isLight}
                            oculta={formularioAbierto}
                            onAgendar={(evento) => abrirFormulario(evento, cancha, hora)}
                          />
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {menuContexto && (
        <ContextMenuReserva
          reserva={menuContexto.reserva}
          anchorRect={menuContexto.anchorRect}
          nombreCancha={menuContexto.nombreCancha}
          fechaTexto={menuContexto.fechaTexto}
          franjaHoraria={menuContexto.franjaHoraria}
          afectadaPorLluvia={
            Boolean(menuContexto.reserva.afectadaPorLluvia && tormentaActiva)
          }
          onCerrar={cerrarMenu}
          onAccion={handleAccionMenu}
        />
      )}
      {formularioAgenda && (
        <FormularioReservaManual
          anchorRect={formularioAgenda.anchorRect}
          cancha={formularioAgenda.cancha}
          hora={formularioAgenda.hora}
          fecha={fechaSeleccionada}
          fechaTexto={formatearFechaLarga(fechaSeleccionada)}
          franjaHoraria={construirFranjaHoraria(formularioAgenda.hora.clave, horarios)}
          onCerrar={cerrarFormulario}
          onConfirmar={onConfirmarReserva}
        />
      )}

      {confirmacion && (
        <MicroConfirmacionReprogramacion
          origen={confirmacion.origen}
          destino={confirmacion.destinoInfo}
          diferenciaTarifa={confirmacion.diferenciaTarifa}
          anchorRect={confirmacion.anchorRect}
          onConfirmar={confirmarReprogramacion}
          onCancelar={cancelarConfirmacion}
        />
      )}

      {toast && <MicroToast mensaje={toast} onCerrar={() => setToast(null)} />}
    </>
  );
}

function PrincipalDashboard() {
  const { isLight } = useAccessibility();
  const { isRainModeActive } = useRainMode();
  const [fechaSeleccionada, setFechaSeleccionada] = useState(() => inicioDelDia(new Date()));
  const [panelIngresos, setPanelIngresos] = useState(null);
  const [reservas, setReservas] = useState([]);
  const [canchas, setCanchas] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [metricas, setMetricas] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSports, setSelectedSports] = useState(['Fútbol', 'Pádel', 'Voley']);
  const [canchaActivaMovil, setCanchaActivaMovil] = useState(null);

  // TODO: Obtener el complejo_id del contexto de autenticación o props
  // Por ahora usar un valor por defecto
  const complejoId = 1;

  const formatearFechaAPI = (fecha) => {
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${año}-${mes}-${dia}`;
  };

  const mapearCategoriaDeporte = (tipoDeporte) => {
    const normalizadoNombre = (tipoDeporte || '').toLowerCase();
    
    if (normalizadoNombre.includes('fut') || normalizadoNombre.includes('fút')) {
      return 'futbol';
    }
    if (normalizadoNombre.includes('pad') || normalizadoNombre.includes('pád')) {
      return 'padel';
    }
    if (normalizadoNombre.includes('vol') || normalizadoNombre.includes('vól')) {
      return 'voley';
    }
    return 'futbol';
  };

  const mapearReservaAPI = (reservaAPI) => {
    const horaInicio = reservaAPI.hora_inicio.substring(0, 5);
    
    return {
      id: reservaAPI.id,  // ¡IMPORTANTE! ID numérico de la reserva
      canchaId: `cancha-${reservaAPI.cancha_id}`,
      hora: horaInicio,
      nombre: reservaAPI.cliente?.nombre || 'Sin nombre',
      telefono: reservaAPI.cliente?.telefono || '',
      deporte: reservaAPI.deporte || null,
      estadoPago: reservaAPI.estado_pago_legible,
      pagoPendiente: reservaAPI.estado_pago !== 'PAGADA_TOTAL',
      totalPartido: reservaAPI.monto_total,
      pagadoOnline: reservaAPI.monto_abono,
      saldoPendiente: reservaAPI.monto_total - reservaAPI.monto_abono,
      metodoPago: reservaAPI.metodo_pago || 'No especificado',
      creadaEn: 'Cargada desde servidor',
      origen: 'Sistema Zyra',
    };
  };

  const cargarDatosDashboard = useCallback(async () => {
    try {
      setCargando(true);
      setError(null);

      const fechaFormateada = formatearFechaAPI(fechaSeleccionada);
      const token = localStorage.getItem('token');

      const response = await axiosInstance.get('/api/dashboard/init', {
        params: {
          complejo_id: complejoId,
          fecha: fechaFormateada
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        const { summary, canchas: canchasAPI, reservas: reservasAPI, horarios: horariosAPI } = response.data;

        setMetricas(summary);
        setHorarios(horariosAPI && horariosAPI.length > 0 ? horariosAPI : HORAS_DEFAULT);

        const canchasMapeadas = canchasAPI.map(cancha => ({
          id: `cancha-${cancha.id}`,
          idNumerico: cancha.id,  // Guardar ID numérico para API de precios
          nombre: cancha.nombre,
          categoria: mapearCategoriaDeporte(cancha.tipo_deporte),
          sportId: cancha.sport_id,
          sportNombre: cancha.sport?.nombre || cancha.tipo_deporte,
        }));
        setCanchas(canchasMapeadas);

        const reservasMapeadas = reservasAPI.map(mapearReservaAPI);
        setReservas(reservasMapeadas);
      }
    } catch (err) {
      console.error('Error al cargar dashboard:', err);
      setError(err.response?.data?.message || 'Error al cargar los datos del dashboard');
      
      setCanchas([]);
      setReservas([]);
      setHorarios(HORAS_DEFAULT);
      setMetricas({
        ocupacion_porcentaje: 0,
        horas_disponibles: 0,
        ingresos_estimados_cop: 0
      });
    } finally {
      setCargando(false);
    }
  }, [fechaSeleccionada, complejoId]);

  useEffect(() => {
    cargarDatosDashboard();
  }, [cargarDatosDashboard]);

  const handleConfirmarReserva = useCallback((datos) => {
    console.log('Reserva manual confirmada:', datos);
    
    // Recargar los datos del dashboard
    cargarDatosDashboard();
    
    // Mostrar notificación de éxito
    console.log('✅ Reserva creada exitosamente');
  }, [cargarDatosDashboard]);

  const abrirPanelIngresos = useCallback((evento) => {
    const rect = evento.currentTarget.getBoundingClientRect();
    setPanelIngresos({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      bottom: rect.bottom,
      right: rect.right,
    });
  }, []);

  const canchasActuales = canchas.length > 0 ? canchas : CANCHAS;
  const reservasActuales = reservas;
  const horariosActuales = horarios.length > 0 ? horarios : HORAS_DEFAULT;

  const canchasVisibles = useMemo(
    () => canchasActuales.filter((c) => canchaFiltradaVisible(c, selectedSports)),
    [canchasActuales, selectedSports],
  );

  useEffect(() => {
    if (canchasVisibles.length === 0) {
      setCanchaActivaMovil(null);
      return;
    }
    setCanchaActivaMovil((prev) =>
      prev && canchasVisibles.some((c) => c.id === prev) ? prev : canchasVisibles[0].id,
    );
  }, [canchasVisibles]);

  const toggleDeporte = useCallback((deporte) => {
    setSelectedSports((prev) => {
      if (prev.includes(deporte)) {
        if (prev.length === 1) return prev;
        return prev.filter((item) => item !== deporte);
      }
      return [...prev, deporte];
    });
  }, []);

  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden font-sans antialiased">
      <HeaderAgendaLinear
        fechaSeleccionada={fechaSeleccionada}
        onCambiarFecha={setFechaSeleccionada}
        isLight={isLight}
      />

      <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col px-2 pb-3 pt-1 md:px-5 md:pb-4">
        {cargando ? (
          <SkeletonDashboard isLight={isLight} numHoras={horariosActuales.length} />
        ) : (
          <>
            <BarraMetricas 
              isLight={isLight} 
              onClickIngresos={abrirPanelIngresos}
              metricas={metricas}
              cargando={cargando}
            />

            <SliderCanchasMovil
              canchas={canchasVisibles}
              activa={canchaActivaMovil}
              onSelect={setCanchaActivaMovil}
              isLight={isLight}
            />

            {error && (
              <div className="mb-3 flex shrink-0 items-center gap-2.5 rounded-xl border border-rose-500/15 bg-rose-500/[0.05] px-3.5 py-2.5">
                <span className="text-sm leading-none">⚠️</span>
                <p className="text-[11px] leading-snug text-rose-400/90">
                  {error}
                </p>
              </div>
            )}

            <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden">
              {isRainModeActive && (
                <div className="mb-3 flex shrink-0 items-center gap-2.5 rounded-xl border border-cyan-500/15 bg-cyan-500/[0.05] px-3.5 py-2.5">
                  <span className="text-sm leading-none">🌧️</span>
                  <p className="text-[11px] leading-snug text-cyan-400/90">
                    Modo Lluvia activo · Las reservas afectadas quedan marcadas para reagendamiento.
                  </p>
                </div>
              )}

              <GrillaMulticancha
                reservas={reservasActuales}
                canchas={canchasActuales}
                horarios={horariosActuales}
                onReservasChange={setReservas}
                isLight={isLight}
                tormentaActiva={isRainModeActive}
                fechaSeleccionada={fechaSeleccionada}
                onConfirmarReserva={handleConfirmarReserva}
                onRecargarDatos={cargarDatosDashboard}
                canchaActivaMovil={canchaActivaMovil}
                selectedSports={selectedSports}
                onToggleDeporte={toggleDeporte}
              />
            </div>
          </>
        )}
      </div>

      {panelIngresos && (
        <PanelDesgloseIngresos
          anchorRect={panelIngresos}
          onCerrar={() => setPanelIngresos(null)}
        />
      )}
    </div>
  );
}

export default PrincipalDashboard;
