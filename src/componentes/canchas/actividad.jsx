import { useState } from 'react';
import { BotonAyuda, PanelGlosarioActividad } from './ayuda';

const METRICAS = {
  totalReservas: 148,
  tendenciaReservas: '+14.2% este mes',
  ingresosPasarela: '$5.420.000 COP',
  recaudoEfectivo: '$2.180.000 COP',
  visitas: '1.240 clics',
  conversion: '11.9%',
};

const OCUPACION_SEMANAL = [
  { dia: 'Lun', reservas: 16, altura: 52 },
  { dia: 'Mar', reservas: 19, altura: 62 },
  { dia: 'Mié', reservas: 14, altura: 46 },
  { dia: 'Jue', reservas: 24, altura: 78 },
  { dia: 'Vie', reservas: 28, altura: 92 },
  { dia: 'Sáb', reservas: 22, altura: 72 },
  { dia: 'Dom', reservas: 12, altura: 38 },
];

const INSIGHTS = [
  {
    id: 'horario-estrella',
    icono: '🔥',
    titulo: 'Horario Estrella',
    descripcion: 'Jueves y Viernes de 7:00 PM a 9:00 PM (100% Ocupación)',
    estilo: 'border-purple-500/10 bg-purple-500/[0.03]',
  },
  {
    id: 'cancelaciones',
    icono: '⚠️',
    titulo: 'Pérdida por Cancelaciones',
    descripcion:
      '4 reservas canceladas esta semana ($320.000 COP no recaudados)',
    estilo: 'border-amber-500/10 bg-amber-500/[0.03]',
  },
];

function TarjetaMetricaReservas() {
  return (
    <div className="bg-[#121212] border border-white/5 rounded-xl p-5 flex flex-col justify-between min-h-[120px]">
      <p className="text-[10px] font-medium uppercase tracking-widest text-zinc-500">
        Total Reservas
      </p>
      <div className="mt-3 space-y-2">
        <p className="text-2xl font-semibold text-white tabular-nums">
          {METRICAS.totalReservas}
        </p>
        <span className="inline-flex text-[11px] font-medium text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md">
          {METRICAS.tendenciaReservas}
        </span>
      </div>
    </div>
  );
}

function TarjetaMetricaPasarela() {
  return (
    <div className="bg-[#121212] border border-white/5 rounded-xl p-5 flex flex-col justify-between min-h-[120px]">
      <p className="text-[10px] font-medium uppercase tracking-widest text-zinc-500">
        Ingresos Pasarela
      </p>
      <p className="mt-3 text-emerald-400 font-mono text-xl tabular-nums">
        {METRICAS.ingresosPasarela}
      </p>
    </div>
  );
}

function TarjetaMetricaEfectivo() {
  return (
    <div className="bg-[#121212] border border-white/5 rounded-xl p-5 flex flex-col justify-between min-h-[120px]">
      <p className="text-[10px] font-medium uppercase tracking-widest text-zinc-500">
        Recaudo en Efectivo
      </p>
      <p className="mt-3 text-zinc-300 font-mono text-xl tabular-nums">
        {METRICAS.recaudoEfectivo}
      </p>
    </div>
  );
}

function TarjetaMetricaVisitas() {
  return (
    <div className="bg-[#121212] border border-white/5 rounded-xl p-5 flex flex-col justify-between min-h-[120px]">
      <p className="text-[10px] font-medium uppercase tracking-widest text-zinc-500">
        Visitas a la Cancha
      </p>
      <div className="mt-3 space-y-1">
        <p className="text-2xl font-semibold text-white tabular-nums">
          {METRICAS.visitas}
        </p>
        <p className="text-[11px] text-zinc-500">
          Conversión del{' '}
          <span className="text-zinc-400 font-medium">{METRICAS.conversion}</span>
        </p>
      </div>
    </div>
  );
}

function BarraOcupacion({ dia, reservas, altura, activa, onHover, onLeave }) {
  return (
    <div
      className="flex-1 flex flex-col items-center gap-2 relative"
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      <div className="relative w-full h-44 flex items-end justify-center">
        {activa && (
          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
            <div className="bg-zinc-900 border border-white/10 rounded-lg px-2.5 py-1.5 shadow-xl whitespace-nowrap">
              <p className="text-[11px] font-medium text-white tabular-nums">
                {reservas} reservas
              </p>
            </div>
            <div className="w-2 h-2 bg-zinc-900 border-r border-b border-white/10 rotate-45 mx-auto -mt-1" />
          </div>
        )}

        <div
          className={`w-3 rounded-full mx-auto transition-all duration-200 ${
            activa
              ? 'bg-gradient-to-t from-purple-500 to-purple-300 shadow-[0_0_16px_rgba(168,85,247,0.45)] scale-x-125'
              : 'bg-gradient-to-t from-purple-600 to-purple-400 opacity-80 hover:opacity-100'
          }`}
          style={{ height: `${altura}%` }}
        />
      </div>
      <span
        className={`text-[10px] font-medium uppercase tracking-wider transition-colors ${
          activa ? 'text-purple-300' : 'text-zinc-600'
        }`}
      >
        {dia}
      </span>
    </div>
  );
}

function GraficaOcupacionSemanal() {
  const [barraActiva, setBarraActiva] = useState(null);
  const totalSemana = OCUPACION_SEMANAL.reduce((sum, d) => sum + d.reservas, 0);

  return (
    <div className="bg-[#121212] border border-white/5 rounded-xl p-5">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h3 className="text-sm font-semibold text-white">Flujo de Ocupación por Días</h3>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            Distribución semanal de reservas confirmadas
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[10px] uppercase tracking-widest text-zinc-600">Total semana</p>
          <p className="text-sm font-semibold text-white tabular-nums mt-0.5">
            {totalSemana} reservas
          </p>
        </div>
      </div>

      <div className="flex items-end gap-2 sm:gap-3 px-1">
        {OCUPACION_SEMANAL.map((item, indice) => (
          <BarraOcupacion
            key={item.dia}
            dia={item.dia}
            reservas={item.reservas}
            altura={item.altura}
            activa={barraActiva === indice}
            onHover={() => setBarraActiva(indice)}
            onLeave={() => setBarraActiva(null)}
          />
        ))}
      </div>
    </div>
  );
}

function ModuloInsights() {
  return (
    <div className="bg-[#121212] border border-white/5 rounded-xl p-5 h-full flex flex-col">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-white">Insights de Rendimiento</h3>
        <p className="text-[11px] text-zinc-500 mt-0.5">Señales accionables del periodo</p>
      </div>

      <div className="space-y-3 flex-1">
        {INSIGHTS.map((insight) => (
          <div
            key={insight.id}
            className={`rounded-lg border px-3.5 py-3 ${insight.estilo}`}
          >
            <p className="text-xs text-zinc-300 leading-relaxed">
              <span className="mr-1.5">{insight.icono}</span>
              <span className="font-medium text-zinc-200">{insight.titulo}:</span>{' '}
              {insight.descripcion}
            </p>
          </div>
        ))}
      </div>

      <p className="text-[10px] text-zinc-600 mt-4 pt-3 border-t border-white/5">
        Datos simulados · Actualización en tiempo real próximamente
      </p>
    </div>
  );
}

function SeccionActividad({ nombreCancha }) {
  const [glosarioAbierto, setGlosarioAbierto] = useState(false);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-white">Actividad de la Cancha</h2>
          {nombreCancha && (
            <p className="text-[11px] text-zinc-500 mt-0.5">{nombreCancha}</p>
          )}
        </div>
        <BotonAyuda
          onClick={() => setGlosarioAbierto(true)}
          activo={glosarioAbierto}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <TarjetaMetricaReservas />
        <TarjetaMetricaPasarela />
        <TarjetaMetricaEfectivo />
        <TarjetaMetricaVisitas />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <GraficaOcupacionSemanal />
        </div>
        <ModuloInsights />
      </div>

      <PanelGlosarioActividad
        abierto={glosarioAbierto}
        onCerrar={() => setGlosarioAbierto(false)}
      />
    </div>
  );
}

export default SeccionActividad;
