/**
 * SeccionReservas — tab Reservas de una cancha específica
 *
 * Carga inicial: usa `reservasSemana` pre-fetched del endpoint principal (semana actual).
 * Rangos extendidos (30días / mes): llama a GET /api/dashboard/:complejoId/:canchaId/reservas
 */

import { useState, useCallback, useEffect } from 'react';
import { Star, X, Check, Clock, CreditCard, Banknote, Smartphone, ArrowLeftRight, CalendarDays, AlertCircle, CheckCircle2 } from 'lucide-react';
import axiosInstance from '../../api/axiosConfig';

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────
const RANGOS_FECHA = [
  { id: 'semana', etiqueta: 'Esta semana' },
  { id: '30dias', etiqueta: 'Últimos 30 días' },
  { id: 'mes', etiqueta: 'Mes actual' },
];

const ESTILO_ESTADO = {
  CONFIRMADA: 'text-[#00FF66]/90 bg-[#00FF66]/10 border-[#00FF66]/15',
  FINALIZADA: 'text-blue-400/90 bg-blue-400/10 border-blue-400/15',
  NO_SHOW: 'text-red-400/90 bg-red-400/10 border-red-400/15',
};

const ESTILO_HISTORIAL = {
  Asistió: 'text-[#00FF66]/90 bg-[#00FF66]/10 border-[#00FF66]/15',
  Canceló: 'text-yellow-400/90 bg-yellow-400/10 border-yellow-400/15',
  'No asistió / Fake': 'text-red-400/90 bg-red-400/10 border-red-400/15',
};

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────
const METODO_PAGO_CONFIG = {
  NEQUI:         { label: 'Nequi',          icon: Smartphone },
  TRANSFERENCIA: { label: 'Transferencia',  icon: ArrowLeftRight },
  EFECTIVO:      { label: 'Efectivo',       icon: Banknote },
  TARJETA:       { label: 'Tarjeta',        icon: CreditCard },
};

const ESTADO_RESERVA_CONFIG = {
  CONFIRMADA:  { label: 'Confirmada',  color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20', dot: 'bg-emerald-400' },
  FINALIZADA:  { label: 'Finalizada',  color: 'text-blue-400',    bg: 'bg-blue-400/10 border-blue-400/20',    dot: 'bg-blue-400' },
  CANCELADA:   { label: 'Cancelada',   color: 'text-yellow-400',  bg: 'bg-yellow-400/10 border-yellow-400/20', dot: 'bg-yellow-400' },
  NO_SHOW:     { label: 'No Show',     color: 'text-red-400',     bg: 'bg-red-400/10 border-red-400/20',     dot: 'bg-red-400' },
  PENDIENTE:   { label: 'Pendiente',   color: 'text-zinc-400',    bg: 'bg-zinc-400/10 border-zinc-400/20',   dot: 'bg-zinc-400' },
};

const ESTADO_PAGO_CONFIG = {
  PAGADA_TOTAL: { label: 'Pago total',    icon: CheckCircle2, color: 'text-emerald-400' },
  ABONADA:      { label: 'Con anticipo',  icon: AlertCircle,  color: 'text-amber-400' },
  PENDIENTE:    { label: 'Pendiente',     icon: AlertCircle,  color: 'text-red-400' },
};

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
function formatearCOP(valor) {
  return `$${Number(valor || 0).toLocaleString('es-CO')} COP`;
}

function telefonoWhatsApp(tel) {
  return (tel || '').replace(/\D/g, '');
}

/**
 * Convierte fecha "YYYY-MM-DD" + horaInicio "HH:MM:SS" + duracion en minutos
 * → "Hoy, 7:00 PM · 1h"  /  "Lun 9 Jun, 7:00 PM · 2h"
 */
function formatearHorario(fecha, horaInicio, duracionMinutos) {
  if (!fecha || !horaInicio) return '—';

  const [y, m, d] = fecha.split('-').map(Number);
  const fechaDate = new Date(y, m - 1, d);
  const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const hoy = new Date();

  let prefFecha;
  if (fechaDate.toDateString() === hoy.toDateString()) {
    prefFecha = 'Hoy';
  } else {
    const ayer = new Date(hoy);
    ayer.setDate(hoy.getDate() - 1);
    prefFecha =
      fechaDate.toDateString() === ayer.toDateString()
        ? 'Ayer'
        : `${DIAS[fechaDate.getDay()]} ${d} ${MESES[m - 1]}`;
  }

  const partes = horaInicio.split(':').map(Number);
  const h = partes[0] ?? 0;
  const min = partes[1] ?? 0;
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  const periodo = h >= 12 ? 'PM' : 'AM';
  const horaStr = `${h12}:${String(min).padStart(2, '0')} ${periodo}`;

  const durMin = duracionMinutos ?? 60;
  const durStr = durMin >= 60 ? `${durMin / 60}h` : `${durMin}min`;

  return `${prefFecha}, ${horaStr} · ${durStr}`;
}

// ─────────────────────────────────────────────
// ICON WHATSAPP (SVG inline)
// ─────────────────────────────────────────────
function IconoWhatsApp({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

// ─────────────────────────────────────────────
// UI SUB-COMPONENTS
// ─────────────────────────────────────────────
function EstrellasCalificacion({ valor, editable, onChange }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((estrella) => {
        const activa = estrella <= Math.round(valor);
        const mitad = estrella - 0.5 <= valor && estrella > valor;
        return (
          <button
            key={estrella}
            type="button"
            disabled={!editable}
            onClick={() => editable && onChange?.(estrella)}
            className={`${editable ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
            aria-label={`${estrella} estrellas`}
          >
            <Star
              size={16}
              strokeWidth={1.5}
              className={
                activa
                  ? 'text-violet-400 fill-violet-400'
                  : mitad
                    ? 'text-violet-400 fill-violet-400/50'
                    : 'text-zinc-700'
              }
            />
          </button>
        );
      })}
    </div>
  );
}

function SelectorRangoFecha({ valor, onChange }) {
  return (
    <div className="flex items-center gap-1 bg-zinc-800/50 border border-white/5 rounded-lg p-1">
      {RANGOS_FECHA.map((rango) => (
        <button
          key={rango.id}
          type="button"
          onClick={() => onChange(rango.id)}
          className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors ${
            valor === rango.id ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          {rango.etiqueta}
        </button>
      ))}
    </div>
  );
}

function ToggleModoVista({ valor, onChange }) {
  return (
    <div className="bg-zinc-800/50 border border-white/5 rounded-lg p-1 flex items-center gap-1">
      {[
        { id: 'lista', etiqueta: 'Lista de Pagos' },
        { id: 'graficas', etiqueta: 'Análisis de Ocupación' },
      ].map((op) => (
        <button
          key={op.id}
          type="button"
          onClick={() => onChange(op.id)}
          className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors ${
            valor === op.id ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          {op.etiqueta}
        </button>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// TABLA DE PAGOS
// ─────────────────────────────────────────────
function TablaPagosPendientes({ reservas, liquidadas, onLiquidar, onSeleccionarCliente }) {
  if (reservas.length === 0) {
    return (
      <p className="text-center text-zinc-500 text-sm py-12">
        No hay reservas registradas en este período
      </p>
    );
  }

  const grid =
    'grid grid-cols-[minmax(140px,1.3fr)_minmax(150px,1.2fr)_minmax(110px,0.9fr)_minmax(100px,0.9fr)_minmax(100px,0.9fr)_minmax(100px,0.9fr)_minmax(90px,0.75fr)] gap-3';

  return (
    <div className="border border-white/5 rounded-xl overflow-x-auto">
      <div className={`${grid} min-w-[860px] px-4 py-2.5 border-b border-white/5 bg-white/[0.02]`}>
        {['Jugador', 'Horario', 'Canal', 'Valor Total', 'Anticipo', 'Por Liquidar', 'Acción'].map((h) => (
          <span key={h} className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 last:text-right">
            {h}
          </span>
        ))}
      </div>

      {reservas.map((reserva) => {
        const liquidada = liquidadas.has(reserva.id);
        const pendiente = Math.max(0, reserva.monto_total - reserva.monto_abono);
        const esWeb = reserva.origen_reserva !== 'MANUAL' && reserva.origen_reserva !== undefined;
        const horario = formatearHorario(reserva.fecha, reserva.hora_inicio, reserva.duracion_minutos);

        return (
          <div
            key={reserva.id}
            className={`${grid} min-w-[860px] px-4 py-3 border-b border-white/5 last:border-b-0 text-xs hover:bg-white/[0.02] transition-colors items-center`}
          >
            {/* Jugador */}
            <div className="min-w-0">
              <button
                type="button"
                onClick={() => onSeleccionarCliente(reserva)}
                className="text-purple-400 hover:text-purple-300 hover:underline cursor-pointer font-medium truncate text-left max-w-full block"
              >
                {reserva.cliente?.nombre || 'Sin nombre'}
              </button>
              <p className="text-[11px] text-zinc-600 mt-0.5">{reserva.cliente?.telefono || '—'}</p>
            </div>

            {/* Horario */}
            <p className="text-zinc-400 text-[11px]">{horario}</p>

            {/* Canal */}
            <div>
              {esWeb ? (
                <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-medium text-[#00FF66]/90 bg-[#00FF66]/10 border border-[#00FF66]/15">
                  Anticipo 20%
                </span>
              ) : (
                <span className="text-zinc-600 text-[11px]">En caja</span>
              )}
            </div>

            {/* Valor Total */}
            <p className="text-zinc-300 tabular-nums">{formatearCOP(reserva.monto_total)}</p>

            {/* Anticipo */}
            <p className="text-zinc-400 tabular-nums">
              {reserva.monto_abono > 0 ? formatearCOP(reserva.monto_abono) : '—'}
            </p>

            {/* Por Liquidar */}
            <p className="text-white font-semibold tabular-nums">
              {liquidada ? (
                <span className="text-[#00FF66]/80 font-medium">{formatearCOP(0)}</span>
              ) : (
                formatearCOP(pendiente)
              )}
            </p>

            {/* Acción */}
            <div className="flex justify-end">
              {liquidada ? (
                <span className="inline-flex items-center gap-1 text-[11px] text-[#00FF66]/80">
                  <Check size={12} strokeWidth={2} />
                  Liquidado
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => onLiquidar(reserva.id)}
                  className="text-[11px] font-medium px-2 py-1 rounded bg-white text-zinc-900 hover:bg-zinc-200 transition-colors"
                >
                  Liquidar en Caja
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────
// DETALLE DE RESERVA — SECCIÓN SUPERIOR
// ─────────────────────────────────────────────
function DetalleReserva({ reserva, onLiquidar, liquidada }) {
  const pendiente = Math.max(0, (reserva.monto_total ?? 0) - (reserva.monto_abono ?? 0));
  const durMin     = reserva.duracion_minutos ?? 60;
  const durStr     = durMin >= 60 ? `${durMin / 60}h` : `${durMin}min`;

  const estadoReserva = ESTADO_RESERVA_CONFIG[reserva.estado_reserva] ?? ESTADO_RESERVA_CONFIG.PENDIENTE;
  const estadoPago    = ESTADO_PAGO_CONFIG[reserva.estado_pago]       ?? ESTADO_PAGO_CONFIG.PENDIENTE;
  const IconoPagoEst  = estadoPago.icon;

  const metodoCfg = METODO_PAGO_CONFIG[reserva.metodo_pago];
  const IconoMetodo = metodoCfg?.icon;

  return (
    <section>
      <h3 className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-3">
        Detalle de la Reserva
      </h3>

      <div className="bg-[#161618] border border-white/5 rounded-xl overflow-hidden divide-y divide-white/[0.04]">

        {/* Fecha y hora */}
        <div className="flex items-center gap-3 px-4 py-3">
          <CalendarDays size={13} strokeWidth={1.5} className="text-zinc-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-0.5">Fecha y hora</p>
            <p className="text-xs text-white font-medium">
              {formatearHorario(reserva.fecha, reserva.hora_inicio, reserva.duracion_minutos)}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${estadoReserva.bg} ${estadoReserva.color}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${estadoReserva.dot}`} />
              {estadoReserva.label}
            </span>
          </div>
        </div>

        {/* Duración */}
        <div className="flex items-center gap-3 px-4 py-3">
          <Clock size={13} strokeWidth={1.5} className="text-zinc-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-0.5">Duración</p>
            <p className="text-xs text-white">{durStr}</p>
          </div>
        </div>

        {/* Desglose de pago */}
        <div className="px-4 py-3 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Valor total</p>
            <p className="text-sm font-semibold text-white tabular-nums">
              {formatearCOP(reserva.monto_total)}
            </p>
          </div>

          {(reserva.monto_abono ?? 0) > 0 && (
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Anticipo recibido</p>
              <p className="text-xs text-emerald-400 tabular-nums">
                − {formatearCOP(reserva.monto_abono)}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between pt-1 border-t border-white/[0.06]">
            <div className="flex items-center gap-1.5">
              <IconoPagoEst size={12} strokeWidth={2} className={estadoPago.color} />
              <p className={`text-[10px] font-medium uppercase tracking-wider ${estadoPago.color}`}>
                {estadoPago.label}
              </p>
            </div>
            <p className={`text-sm font-bold tabular-nums ${pendiente === 0 ? 'text-emerald-400' : 'text-white'}`}>
              {formatearCOP(pendiente)}
            </p>
          </div>
        </div>

        {/* Método de pago */}
        {metodoCfg && (
          <div className="flex items-center gap-3 px-4 py-3">
            <IconoMetodo size={13} strokeWidth={1.5} className="text-zinc-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-0.5">Método de pago</p>
              <p className="text-xs text-white">{metodoCfg.label}</p>
            </div>
          </div>
        )}

        {/* Canal de origen */}
        <div className="flex items-center justify-between px-4 py-3">
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Canal</p>
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium border ${
            reserva.origen_reserva === 'MANUAL'
              ? 'text-zinc-400 bg-white/5 border-white/10'
              : 'text-emerald-400/90 bg-emerald-400/10 border-emerald-400/15'
          }`}>
            {reserva.origen_reserva === 'MANUAL' ? 'Reserva Manual' : 'Reserva Web / App'}
          </span>
        </div>
      </div>

      {/* Acción de liquidar */}
      {pendiente > 0 && (
        <button
          type="button"
          onClick={() => onLiquidar(reserva.id)}
          disabled={liquidada}
          className="mt-3 w-full py-2.5 px-4 rounded-lg text-xs font-semibold bg-white text-zinc-900 hover:bg-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {liquidada ? '✓ Liquidado en caja' : `Liquidar ${formatearCOP(pendiente)} en Caja`}
        </button>
      )}
    </section>
  );
}

// ─────────────────────────────────────────────
// PANEL PERFIL CLIENTE
// ─────────────────────────────────────────────
function PanelPerfilCliente({
  reserva,
  abierto,
  onCerrar,
  onLiquidar,
  liquidadas,
  todasReservas,
  calificacion,
  notaInterna,
  bloqueado,
  onCambiarCalificacion,
  onCambiarNota,
  onToggleBloqueo,
}) {
  useEffect(() => {
    if (!abierto) return;
    const handleEsc = (e) => { if (e.key === 'Escape') onCerrar(); };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [abierto, onCerrar]);

  if (!reserva) return null;

  const cliente    = reserva.cliente ?? {};
  const urlWA      = `https://wa.me/${telefonoWhatsApp(cliente.telefono || '')}`;
  const liquidada  = liquidadas.has(reserva.id);

  // Historial: otras reservas del mismo teléfono en el período actual
  const historial = (todasReservas || [])
    .filter(
      (r) =>
        r.id !== reserva.id &&
        r.cliente?.telefono &&
        r.cliente.telefono === cliente.telefono
    )
    .slice(0, 5)
    .map((r) => ({
      fecha: formatearHorario(r.fecha, r.hora_inicio, r.duracion_minutos),
      estado: r.estado_reserva === 'CONFIRMADA' ? 'Asistió' : r.estado_reserva === 'NO_SHOW' ? 'No asistió / Fake' : 'Canceló',
    }));

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          abierto ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onCerrar}
        aria-hidden={!abierto}
      />

      <aside
        className={`fixed top-0 right-0 bottom-0 w-full max-w-[460px] bg-[#121212] border-l border-white/5 z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-out ${
          abierto ? 'translate-x-0' : 'translate-x-full pointer-events-none'
        }`}
        role="dialog"
        aria-labelledby="perfil-titulo"
        aria-hidden={!abierto}
      >
        {/* Header */}
        <div className="shrink-0 px-5 py-4 border-b border-white/5 bg-[#161618]">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">
                Reserva #{reserva.id}
              </p>
              <h2 id="perfil-titulo" className="text-base font-semibold text-white truncate">
                {cliente.nombre || 'Sin nombre'}
              </h2>
              <div className="flex items-center gap-2 mt-1.5">
                <p className="text-xs text-zinc-400">{cliente.telefono || '—'}</p>
                {cliente.telefono && (
                  <a
                    href={urlWA}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 rounded text-[#25D366]/70 hover:text-[#25D366] hover:bg-[#25D366]/10 transition-colors"
                    aria-label="Abrir WhatsApp"
                  >
                    <IconoWhatsApp className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
            <button
              type="button"
              aria-label="Cerrar detalle"
              onClick={onCerrar}
              className="p-1.5 rounded text-zinc-600 hover:text-white hover:bg-white/5 transition-colors shrink-0"
            >
              <X size={14} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto min-h-0 px-5 py-5 space-y-6">

          {/* ── Detalle de la reserva ── */}
          <DetalleReserva
            reserva={reserva}
            onLiquidar={onLiquidar}
            liquidada={liquidada}
          />

          {/* ── Calificación ── */}
          <section>
            <h3 className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-3">
              Calificación y Comportamiento
            </h3>
            <div className="bg-[#161618] border border-white/5 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <EstrellasCalificacion valor={calificacion} editable onChange={onCambiarCalificacion} />
                <span className="text-sm font-semibold text-white tabular-nums">
                  {calificacion.toFixed(1)}
                  <span className="text-zinc-500 font-normal"> / 5.0</span>
                </span>
              </div>
              <label className="block">
                <span className="text-[10px] font-medium text-zinc-500 mb-1.5 block">
                  Nota interna del administrador
                </span>
                <textarea
                  value={notaInterna}
                  onChange={(e) => onCambiarNota(e.target.value)}
                  placeholder="Ej: Siempre pide balones prestados y los devuelve tarde"
                  rows={3}
                  className="w-full px-3 py-2 text-xs text-white placeholder:text-zinc-600 bg-[#121212] border border-white/5 rounded-lg outline-none focus:border-violet-500/30 resize-none transition-colors"
                />
              </label>
            </div>
          </section>

          {/* ── Historial ── */}
          {historial.length > 0 && (
            <section>
              <h3 className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-3">
                Otras reservas del cliente en este período
              </h3>
              <div className="bg-[#161618] border border-white/5 rounded-xl overflow-hidden divide-y divide-white/5">
                {historial.map((r, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-3 px-3 py-2.5 text-xs hover:bg-white/[0.02] transition-colors"
                  >
                    <p className="text-zinc-400 truncate">{r.fecha}</p>
                    <span
                      className={`shrink-0 px-2 py-0.5 rounded-md text-[10px] font-medium border ${
                        ESTILO_HISTORIAL[r.estado] ?? 'text-zinc-400 bg-white/5 border-white/5'
                      }`}
                    >
                      {r.estado}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 px-5 py-4 border-t border-white/5 bg-[#161618] space-y-3">
          {cliente.telefono && (
            <button
              type="button"
              onClick={() => window.open(urlWA, '_blank', 'noopener,noreferrer')}
              className="w-full py-2.5 px-4 rounded-lg text-xs font-medium bg-zinc-800 text-white hover:bg-zinc-700 transition-colors"
            >
              Enviar WhatsApp Recordatorio
            </button>
          )}
          <div>
            <button
              type="button"
              onClick={onToggleBloqueo}
              className={`w-full py-2.5 px-4 rounded-lg text-xs font-semibold border transition-colors ${
                bloqueado
                  ? 'bg-red-500 text-white border-red-500 hover:bg-red-600'
                  : 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500 hover:text-white'
              }`}
            >
              {bloqueado ? 'CLIENTE BLOQUEADO — DESBLOQUEAR' : 'BLOQUEAR CLIENTE'}
            </button>
            <p className="text-[10px] text-zinc-600 leading-relaxed mt-2">
              Si bloqueas a este cliente, el sistema rechazará automáticamente cualquier intento de reserva
              desde su número tanto en la web pública como por la IA de Zyra.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}

// ─────────────────────────────────────────────
// GRÁFICAS DE OCUPACIÓN
// ─────────────────────────────────────────────
function GraficaTendenciaOcupacion({ datos, totalHoras }) {
  if (!datos || datos.length === 0) {
    return (
      <div className="bg-[#161618] border border-white/5 rounded-xl p-4 flex items-center justify-center h-[240px]">
        <p className="text-zinc-600 text-xs">Sin datos de ocupación</p>
      </div>
    );
  }

  const ancho = 400;
  const alto = 160;
  const paddingX = 8;
  const paddingY = 12;
  const areaAncho = ancho - paddingX * 2;
  const areaAlto = alto - paddingY * 2;

  const puntos = datos.map((dato, i) => ({
    x: paddingX + (i / Math.max(datos.length - 1, 1)) * areaAncho,
    y: paddingY + areaAlto - (dato.ocupacion / 100) * areaAlto,
    ...dato,
  }));

  const lineaPath = puntos.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${lineaPath} L ${puntos[puntos.length - 1].x} ${paddingY + areaAlto} L ${puntos[0].x} ${paddingY + areaAlto} Z`;

  return (
    <div className="bg-[#161618] border border-white/5 rounded-xl p-4">
      <div className="flex items-baseline justify-between gap-3 mb-4">
        <h4 className="text-xs text-zinc-400 font-semibold">Evolución de Ocupación (%)</h4>
        <span className="text-[11px] text-zinc-600">Total: {totalHoras} h reservadas</span>
      </div>
      <div className="relative">
        <svg
          viewBox={`0 0 ${ancho} ${alto}`}
          className="w-full h-[180px]"
          preserveAspectRatio="none"
          role="img"
          aria-label="Gráfica de evolución de ocupación"
        >
          <defs>
            <linearGradient id="gradOcup" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(139, 92, 246, 0.35)" />
              <stop offset="100%" stopColor="rgba(139, 92, 246, 0)" />
            </linearGradient>
          </defs>
          {[0, 25, 50, 75, 100].map((n) => {
            const y = paddingY + areaAlto - (n / 100) * areaAlto;
            return <line key={n} x1={paddingX} y1={y} x2={ancho - paddingX} y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />;
          })}
          <path d={areaPath} fill="url(#gradOcup)" />
          <path d={lineaPath} fill="none" stroke="rgba(167, 139, 250, 0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          {puntos.map((p) => (
            <circle key={p.etiqueta} cx={p.x} cy={p.y} r="3" fill="#a78bfa" stroke="#161618" strokeWidth="1.5" />
          ))}
        </svg>
        <div
          className="flex justify-between mt-2 px-1"
          style={{ paddingLeft: `${(paddingX / ancho) * 100}%`, paddingRight: `${(paddingX / ancho) * 100}%` }}
        >
          {datos.map((d) => (
            <span key={d.etiqueta} className="text-[10px] text-zinc-600">{d.etiqueta}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function GraficaBloquesHorario({ bloques }) {
  if (!bloques || bloques.length === 0) {
    return (
      <div className="bg-[#161618] border border-white/5 rounded-xl p-4 flex items-center justify-center h-[240px]">
        <p className="text-zinc-600 text-xs">Sin datos de bloques horarios</p>
      </div>
    );
  }

  const maxReservas = Math.max(...bloques.map((b) => b.reservas), 1);

  return (
    <div className="bg-[#161618] border border-white/5 rounded-xl p-4">
      <h4 className="text-xs text-zinc-400 font-semibold mb-4">Ocupación por Bloque Horario</h4>
      <div className="flex items-end justify-between gap-3 h-[180px] px-2">
        {bloques.map((bloque) => {
          const altura = (bloque.reservas / maxReservas) * 100;
          const esPico = bloque.reservas === maxReservas;
          return (
            <div key={bloque.hora} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
              <span className="text-[10px] text-zinc-500 tabular-nums">{bloque.reservas}</span>
              <div
                className="w-full max-w-[48px] rounded-t-md transition-all duration-300"
                style={{
                  height: `${Math.max(altura, 8)}%`,
                  background: esPico
                    ? 'linear-gradient(180deg, rgba(167, 139, 250, 0.95) 0%, rgba(109, 40, 217, 0.5) 100%)'
                    : 'linear-gradient(180deg, rgba(139, 92, 246, 0.45) 0%, rgba(139, 92, 246, 0.12) 100%)',
                  boxShadow: esPico ? '0 0 20px rgba(139, 92, 246, 0.25)' : 'none',
                }}
              />
              <span className={`text-[10px] ${esPico ? 'text-violet-300/80' : 'text-zinc-600'}`}>
                {bloque.hora}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// SKELETONS
// ─────────────────────────────────────────────
function SkeletonTabla() {
  return (
    <div className="border border-white/5 rounded-xl overflow-hidden animate-pulse">
      <div className="h-10 bg-white/[0.02] border-b border-white/5" />
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-14 border-b border-white/5 last:border-b-0 px-4 flex items-center gap-4">
          <div className="h-3 w-28 bg-white/[0.06] rounded" />
          <div className="h-3 w-36 bg-white/[0.04] rounded" />
          <div className="h-3 w-20 bg-white/[0.04] rounded" />
          <div className="h-3 w-24 bg-white/[0.04] rounded ml-auto" />
        </div>
      ))}
    </div>
  );
}

function SkeletonGraficas() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4 animate-pulse">
      <div className="bg-[#161618] border border-white/5 rounded-xl p-4 h-[240px]" />
      <div className="bg-[#161618] border border-white/5 rounded-xl p-4 h-[240px]" />
    </div>
  );
}

// ─────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────
/**
 * @param {string}  canchaSlug     - ID de la cancha (URL param)
 * @param {number}  complejoId     - ID del complejo (para API calls)
 * @param {object|null} reservasSemana - Datos pre-fetched de la semana (de canchaDetalle)
 * @param {boolean} loadingDetalle - Si el fetch principal aún está cargando
 */
export default function SeccionReservas({ canchaSlug, complejoId, reservasSemana, loadingDetalle }) {
  const [rangoFecha, setRangoFecha] = useState('semana');
  const [modoVista, setModoVista] = useState('lista');
  const [liquidadas, setLiquidadas] = useState(() => new Set());
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [edicionesCliente, setEdicionesCliente] = useState({});

  // Datos del rango extendido (30dias / mes)
  const [datosExtendidos, setDatosExtendidos] = useState(null);
  const [loadingExtendido, setLoadingExtendido] = useState(false);

  // Cuando cambia de cancha, resetear todo
  useEffect(() => {
    setRangoFecha('semana');
    setDatosExtendidos(null);
    setLiquidadas(new Set());
    setClienteSeleccionado(null);
  }, [canchaSlug]);

  // Fetch para rangos extendidos
  const fetchExtendido = useCallback(
    async (rango) => {
      if (!canchaSlug || !complejoId) return;
      const token = localStorage.getItem('token');
      if (!token) return;

      setLoadingExtendido(true);
      try {
        const resp = await axiosInstance.get(
          `/api/dashboard/${complejoId}/${canchaSlug}/reservas`,
          { params: { rango }, headers: { Authorization: `Bearer ${token}` } }
        );
        if (resp.data.success) setDatosExtendidos(resp.data);
      } catch (err) {
        console.error('[SeccionReservas] Error cargando rango extendido:', err);
      } finally {
        setLoadingExtendido(false);
      }
    },
    [canchaSlug, complejoId]
  );

  // Efecto: cuando cambia el rango
  useEffect(() => {
    if (rangoFecha === 'semana') {
      setDatosExtendidos(null);
    } else {
      fetchExtendido(rangoFecha);
    }
  }, [rangoFecha, fetchExtendido]);

  // Datos activos según rango
  const datosActivos = rangoFecha === 'semana' ? reservasSemana : datosExtendidos;
  const loading = rangoFecha === 'semana' ? loadingDetalle : loadingExtendido;

  const reservasVisibles = datosActivos?.reservas ?? [];
  const analytics = datosActivos?.analytics ?? { totalHoras: 0, tendencia: [], bloques: [] };

  // Handlers de cliente
  const abrirPerfil = useCallback((reserva) => setClienteSeleccionado(reserva), []);
  const cerrarPerfil = useCallback(() => setClienteSeleccionado(null), []);

  const edicionActiva = clienteSeleccionado
    ? edicionesCliente[clienteSeleccionado.cliente?.telefono ?? clienteSeleccionado.id] ?? {}
    : {};
  const calificacionActiva = edicionActiva.calificacion ?? 3.0;
  const notaActiva = edicionActiva.notaInterna ?? '';
  const bloqueadoActivo = edicionActiva.bloqueado ?? false;

  const actualizarEdicion = useCallback(
    (clave, cambios) => {
      setEdicionesCliente((prev) => ({ ...prev, [clave]: { ...prev[clave], ...cambios } }));
    },
    []
  );

  const clavePerfil = clienteSeleccionado?.cliente?.telefono ?? String(clienteSeleccionado?.id);

  return (
    <>
      {/* Controles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <SelectorRangoFecha valor={rangoFecha} onChange={setRangoFecha} />
        <ToggleModoVista valor={modoVista} onChange={setModoVista} />
      </div>

      {/* Contenido */}
      {loading ? (
        modoVista === 'lista' ? <SkeletonTabla /> : <SkeletonGraficas />
      ) : modoVista === 'lista' ? (
        <TablaPagosPendientes
          reservas={reservasVisibles}
          liquidadas={liquidadas}
          onLiquidar={(id) => setLiquidadas((prev) => new Set([...prev, id]))}
          onSeleccionarCliente={abrirPerfil}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
          <GraficaTendenciaOcupacion datos={analytics.tendencia} totalHoras={analytics.totalHoras} />
          <GraficaBloquesHorario bloques={analytics.bloques} />
        </div>
      )}

      {/* Panel lateral perfil + detalle de reserva */}
      <PanelPerfilCliente
        reserva={clienteSeleccionado}
        abierto={clienteSeleccionado !== null}
        onCerrar={cerrarPerfil}
        onLiquidar={(id) => setLiquidadas((prev) => new Set([...prev, id]))}
        liquidadas={liquidadas}
        todasReservas={reservasVisibles}
        calificacion={calificacionActiva}
        notaInterna={notaActiva}
        bloqueado={bloqueadoActivo}
        onCambiarCalificacion={(v) => actualizarEdicion(clavePerfil, { calificacion: v })}
        onCambiarNota={(v) => actualizarEdicion(clavePerfil, { notaInterna: v })}
        onToggleBloqueo={() => actualizarEdicion(clavePerfil, { bloqueado: !bloqueadoActivo })}
      />
    </>
  );
}
