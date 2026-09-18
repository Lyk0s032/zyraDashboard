import { AlertTriangle, CheckCircle2, Clock, XCircle } from 'lucide-react';

function formatearFecha(fecha) {
  const date = new Date(fecha);
  return date.toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

function BadgeEstadoReserva({ estado }) {
  const configs = {
    CONFIRMADA: { bg: 'bg-blue-500/10', text: 'text-blue-400', label: 'Confirmada', icon: Clock },
    FINALIZADA: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', label: 'Finalizada', icon: CheckCircle2 },
    CANCELADA: { bg: 'bg-rose-500/10', text: 'text-rose-400', label: 'Cancelada', icon: XCircle },
    NO_SHOW: { bg: 'bg-orange-500/10', text: 'text-orange-400', label: 'No asistió', icon: AlertTriangle }
  };

  const config = configs[estado] || configs.CONFIRMADA;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium ${config.bg} ${config.text}`}>
      <Icon className="h-2.5 w-2.5" strokeWidth={2} />
      {config.label}
    </span>
  );
}

export default function HistorialCliente({ cliente, estadisticas, historial, cargando }) {
  if (cargando) {
    return (
      <div className="flex w-full max-w-md flex-col gap-3 rounded-xl border border-slate-700/50 bg-[#1e293b]/80 p-4 shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
          <p className="text-xs font-medium text-slate-300">Cargando historial...</p>
        </div>
      </div>
    );
  }

  if (!cliente || !historial) {
    return null;
  }

  const tieneIncumplimientos = estadisticas?.tiene_incumplimientos;

  return (
    <div className="flex w-full max-w-md flex-col gap-3 rounded-xl border border-slate-700/50 bg-[#1e293b]/80 shadow-2xl backdrop-blur-md">
      <div className="border-b border-slate-700/50 px-4 pb-3 pt-4">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
              Cliente {cliente.es_cliente_registrado ? '• Registrado' : '• Nuevo'}
            </p>
            <p className="mt-1 truncate text-sm font-semibold text-white">{cliente.nombre}</p>
            <p className="mt-0.5 text-xs text-slate-400">{cliente.telefono}</p>
            {cliente.email && (
              <p className="mt-0.5 truncate text-[11px] text-slate-500">{cliente.email}</p>
            )}
          </div>

          {tieneIncumplimientos && (
            <div className="ml-2 shrink-0">
              <div className="rounded-full bg-rose-500/15 p-1.5">
                <AlertTriangle className="h-4 w-4 text-rose-400" strokeWidth={2} />
              </div>
            </div>
          )}
        </div>

        {tieneIncumplimientos && (
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-rose-500/20 bg-rose-500/5 px-3 py-2">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-rose-400" strokeWidth={2} />
            <p className="text-[11px] leading-snug text-rose-400/90">
              Este cliente tiene {estadisticas.reservas_canceladas} reserva(s) cancelada(s) 
              {estadisticas.reservas_no_show > 0 && ` y ${estadisticas.reservas_no_show} no asistida(s)`}
            </p>
          </div>
        )}

        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className="rounded-lg bg-slate-900/40 px-2 py-1.5 text-center">
            <p className="text-xs font-semibold text-white">{estadisticas.total_reservas}</p>
            <p className="text-[9px] text-slate-500">Total</p>
          </div>
          <div className="rounded-lg bg-emerald-500/10 px-2 py-1.5 text-center">
            <p className="text-xs font-semibold text-emerald-400">{estadisticas.reservas_finalizadas}</p>
            <p className="text-[9px] text-emerald-500">Finalizadas</p>
          </div>
          <div className="rounded-lg bg-slate-900/40 px-2 py-1.5 text-center">
            <p className="text-xs font-semibold text-white">{estadisticas.tasa_cumplimiento}%</p>
            <p className="text-[9px] text-slate-500">Cumplimiento</p>
          </div>
        </div>
      </div>

      <div className="max-h-[400px] min-h-0 flex-1 overflow-y-auto px-4 pb-4">
        <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-slate-500">
          Historial en este complejo
        </p>
        
        {historial.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-700/50 py-8 text-center">
            <p className="text-xs text-slate-500">No hay reservas previas</p>
          </div>
        ) : (
          <div className="space-y-2">
            {historial.map((reserva) => (
              <div
                key={reserva.id}
                className={`rounded-lg border bg-slate-900/30 p-2.5 ${
                  reserva.fue_cancelada || reserva.fue_no_show
                    ? 'border-rose-500/20'
                    : 'border-slate-700/50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-slate-300">
                      {reserva.cancha}
                    </p>
                    <p className="mt-0.5 text-[10px] text-slate-500">
                      {formatearFecha(reserva.fecha)} • {reserva.hora_inicio.substring(0, 5)}
                    </p>
                  </div>
                  <BadgeEstadoReserva estado={reserva.estado_reserva} />
                </div>

                <div className="mt-1.5 flex items-center justify-between">
                  <p className="text-[10px] text-slate-500">
                    {reserva.duracion_minutos} min • ${reserva.monto_total.toLocaleString('es-CO')}
                  </p>
                  {reserva.origen_reserva && (
                    <p className="text-[9px] text-slate-600">
                      vía {reserva.origen_reserva}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
