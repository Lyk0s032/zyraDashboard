import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { CheckCircle2, X } from 'lucide-react';

const LAYOUT_ID_HERO_LIQUIDACION = 'liquidacion-hero-expand';
const SPRING_EXPAND = { type: 'spring', stiffness: 380, damping: 34, mass: 0.85 };

const RESUMEN_CONTABLE = {
  ingresosTotales: "$1'545,000 COP",
  retenciones: '$125,000 COP',
  pendienteTransferir: "$1'420,000 COP",
  proximoDesembolso: 'Viernes 12 de Junio, 2026',
  cuenta: 'Cuenta de ahorros Bancolombia *4567',
};

const TRANSACCIONES_PROXIMA_LIQUIDACION = [
  {
    id: 'pl1',
    concepto: 'Reserva Cancha 2 — Torneo Nocturno',
    fecha: '08/Jun/2026',
    valorTotal: '$100,000 COP',
    porcentajeAnticipo: 30,
    anticipoBruto: '$30,000 COP',
    comisionPasarela: '-$1,800 COP',
    netoAportado: '$28,200 COP',
  },
  {
    id: 'pl2',
    concepto: 'Reserva Cancha 1 — Partido Amistoso',
    fecha: '09/Jun/2026',
    valorTotal: '$160,000 COP',
    porcentajeAnticipo: 50,
    anticipoBruto: '$80,000 COP',
    comisionPasarela: '-$4,800 COP',
    netoAportado: '$75,200 COP',
  },
  {
    id: 'pl3',
    concepto: 'Reserva Pádel 1 — Clase Grupal',
    fecha: '10/Jun/2026',
    valorTotal: '$240,000 COP',
    porcentajeAnticipo: 100,
    anticipoBruto: '$240,000 COP',
    comisionPasarela: '-$14,400 COP',
    netoAportado: '$225,600 COP',
  },
  {
    id: 'pl4',
    concepto: 'Reserva Cancha 3 — Liga Empresarial',
    fecha: '11/Jun/2026',
    valorTotal: '$320,000 COP',
    porcentajeAnticipo: 40,
    anticipoBruto: '$128,000 COP',
    comisionPasarela: '-$7,680 COP',
    netoAportado: '$120,320 COP',
  },
  {
    id: 'pl5',
    concepto: 'Reserva Pádel 2 — Torneo Mixto',
    fecha: '12/Jun/2026',
    valorTotal: '$200,000 COP',
    porcentajeAnticipo: 50,
    anticipoBruto: '$100,000 COP',
    comisionPasarela: '-$6,000 COP',
    netoAportado: '$94,000 COP',
  },
  {
    id: 'pl6',
    concepto: 'Reserva Cancha 1 — Reserva Corporativa',
    fecha: '12/Jun/2026',
    valorTotal: '$450,000 COP',
    porcentajeAnticipo: 30,
    anticipoBruto: '$135,000 COP',
    comisionPasarela: '-$8,100 COP',
    netoAportado: '$126,900 COP',
  },
];

const ENTREGAS = [
  {
    id: 1,
    fecha: '01/Jun/2026',
    idTransferencia: 'TRF-ZYRA-20260601-A7F3',
    total: "$850,000 COP",
    estado: 'Completado',
    reservas: [
      { id: 'r1', concepto: 'Reserva Cancha 2 — Torneo Nocturno', fecha: '28/May/2026', bruto: '$280,000 COP', neto: '$252,000 COP' },
      { id: 'r2', concepto: 'Reserva Cancha 1 — Partido Amistoso', fecha: '29/May/2026', bruto: '$320,000 COP', neto: '$288,000 COP' },
      { id: 'r3', concepto: 'Reserva Pádel 1 — Clase Grupal', fecha: '30/May/2026', bruto: '$350,000 COP', neto: '$310,000 COP' },
    ],
  },
  {
    id: 2,
    fecha: '25/May/2026',
    idTransferencia: 'TRF-ZYRA-20260525-B2C9',
    total: "$1'120,000 COP",
    estado: 'Completado',
    reservas: [
      { id: 'r4', concepto: 'Reserva Cancha 3 — Liga Empresarial', fecha: '18/May/2026', bruto: '$420,000 COP', neto: '$378,000 COP' },
      { id: 'r5', concepto: 'Reserva Cancha 2 — Entrenamiento', fecha: '20/May/2026', bruto: '$380,000 COP', neto: '$342,000 COP' },
      { id: 'r6', concepto: 'Reserva Pádel 2 — Torneo Mixto', fecha: '22/May/2026', bruto: '$400,000 COP', neto: '$400,000 COP' },
    ],
  },
  {
    id: 3,
    fecha: '18/May/2026',
    idTransferencia: 'TRF-ZYRA-20260518-D4E1',
    total: '$960,000 COP',
    estado: 'Completado',
    reservas: [
      { id: 'r7', concepto: 'Reserva Cancha 1 — Reserva Corporativa', fecha: '12/May/2026', bruto: '$480,000 COP', neto: '$432,000 COP' },
      { id: 'r8', concepto: 'Reserva Cancha 2 — Partido Juvenil', fecha: '15/May/2026', bruto: '$528,000 COP', neto: '$528,000 COP' },
    ],
  },
  {
    id: 4,
    fecha: '11/May/2026',
    idTransferencia: 'TRF-ZYRA-20260511-F8G2',
    total: '$740,000 COP',
    estado: 'Completado',
    reservas: [
      { id: 'r9', concepto: 'Reserva Pádel 1 — Clase Privada', fecha: '05/May/2026', bruto: '$260,000 COP', neto: '$234,000 COP' },
      { id: 'r10', concepto: 'Reserva Cancha 1 — Partido Recreativo', fecha: '08/May/2026', bruto: '$480,000 COP', neto: '$506,000 COP' },
    ],
  },
];

function BadgeCompletado() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20">
      <CheckCircle2 size={11} strokeWidth={2} />
      Completado
    </span>
  );
}

function TarjetaHeroePendiente({ onClick }) {
  return (
    <motion.button
      type="button"
      layoutId={LAYOUT_ID_HERO_LIQUIDACION}
      transition={SPRING_EXPAND}
      onClick={onClick}
      whileHover={{ scale: 1.005 }}
      whileTap={{ scale: 0.992 }}
      className="lg:col-span-2 rounded-lg border border-[#00B488]/60 bg-gradient-to-br from-[#1c212a] via-[#161B22] to-[#0d1117] px-6 py-5 flex flex-col justify-center text-left cursor-pointer hover:border-[#00B488] hover:shadow-[0_0_24px_rgba(0,180,136,0.12)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00B488]/50"
    >
      <p className="text-[10px] font-medium uppercase tracking-wider text-[#00B488]">
        Valor Pendiente por Transferir
      </p>
      <p className="mt-3 text-4xl sm:text-5xl font-bold text-white font-mono tabular-nums tracking-tight leading-none">
        {RESUMEN_CONTABLE.pendienteTransferir}
      </p>
      <div className="mt-5 space-y-1.5">
        <p className="text-xs text-zinc-400">
          Próximo desembolso:{' '}
          <span className="text-zinc-200">{RESUMEN_CONTABLE.proximoDesembolso}</span>
        </p>
        <p className="text-xs text-zinc-500">{RESUMEN_CONTABLE.cuenta}</p>
      </div>
      <p className="mt-3 text-[10px] text-zinc-600">Clic para ver el desglose completo</p>
    </motion.button>
  );
}

function PlaceholderTarjetaHeroe() {
  return (
    <div
      className="lg:col-span-2 min-h-[168px] rounded-lg border border-dashed border-[#21262D]/70 bg-[#161B22]/30"
      aria-hidden="true"
    />
  );
}

function ModalProximaLiquidacion({ abierto, onCerrar }) {
  useEffect(() => {
    if (!abierto) return undefined;

    const manejarEscape = (e) => {
      if (e.key === 'Escape') onCerrar();
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', manejarEscape);

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', manejarEscape);
    };
  }, [abierto, onCerrar]);

  return createPortal(
    <AnimatePresence>
      {abierto && (
        <>
          <motion.div
            key="modal-proxima-liquidacion-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md"
            onClick={onCerrar}
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              key="modal-proxima-liquidacion-panel"
              layoutId={LAYOUT_ID_HERO_LIQUIDACION}
              transition={SPRING_EXPAND}
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-proxima-liquidacion-titulo"
              onClick={(e) => e.stopPropagation()}
              className="pointer-events-auto flex max-h-[min(90vh,720px)] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-[#21262D] bg-[#161B22] shadow-2xl"
            >
              <motion.div
                className="flex min-h-0 flex-1 flex-col"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.08, duration: 0.22 }}
              >
                <div className="relative shrink-0 border-b border-[#21262D] px-6 py-5">
                  <button
                    type="button"
                    onClick={onCerrar}
                    aria-label="Cerrar modal"
                    className="absolute top-4 right-4 p-2 rounded-lg border border-[#30363D] text-slate-400 transition hover:border-[#00B488]/40 hover:text-white"
                  >
                    <X size={16} strokeWidth={2} />
                  </button>

                  <p className="text-[10px] font-medium uppercase tracking-wider text-[#00B488]">
                    Transparencia Total
                  </p>
                  <h2
                    id="modal-proxima-liquidacion-titulo"
                    className="mt-1 pr-10 text-base font-semibold text-white"
                  >
                    Próxima Liquidación — {RESUMEN_CONTABLE.proximoDesembolso}
                  </h2>
                  <p className="mt-1 text-[11px] text-zinc-500">
                    {TRANSACCIONES_PROXIMA_LIQUIDACION.length} transacciones acumuladas · Total neto{' '}
                    <span className="font-mono text-zinc-300 tabular-nums">
                      {RESUMEN_CONTABLE.pendienteTransferir}
                    </span>
                  </p>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto overflow-x-auto px-7 py-3">
                  <table className="w-full min-w-[760px] table-fixed text-left">
                    <colgroup>
                      <col className="w-[33%] min-w-[250px]" />
                      <col className="w-[11%]" />
                      <col className="w-[14%]" />
                      <col className="w-[16%]" />
                      <col className="w-[14%]" />
                      <col className="w-[12%]" />
                    </colgroup>
                    <thead>
                      <tr className="border-b border-[#21262D] text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                        <th className="pb-2 pr-5 font-semibold text-left">Detalle</th>
                        <th className="pb-2 pr-5 font-semibold text-left whitespace-nowrap">Fecha</th>
                        <th className="pb-2 pr-5 font-semibold text-left whitespace-nowrap">Valor Total</th>
                        <th className="pb-2 pr-5 font-semibold text-left whitespace-nowrap">Anticipo</th>
                        <th className="pb-2 pr-5 font-semibold text-left whitespace-nowrap">Comisión Banco</th>
                        <th className="pb-2 font-semibold text-right whitespace-nowrap">Neto</th>
                      </tr>
                    </thead>
                    <tbody>
                      {TRANSACCIONES_PROXIMA_LIQUIDACION.map((tx) => (
                        <tr key={tx.id} className="border-b border-[#21262D] last:border-b-0">
                          <td className="py-2.5 pr-5 align-top text-left min-w-[250px]">
                            <p className="text-xs text-white leading-snug">{tx.concepto}</p>
                          </td>
                          <td className="py-2.5 pr-5 align-top text-left text-xs text-zinc-400 tabular-nums whitespace-nowrap">
                            {tx.fecha}
                          </td>
                          <td className="py-2.5 pr-5 align-top font-mono text-xs text-zinc-300 tabular-nums whitespace-nowrap">
                            {tx.valorTotal}
                          </td>
                          <td className="py-2.5 pr-5 align-top font-mono text-xs text-zinc-300 tabular-nums whitespace-nowrap">
                            {tx.anticipoBruto}
                            <span className="ml-1 text-zinc-500">({tx.porcentajeAnticipo}%)</span>
                          </td>
                          <td className="py-2.5 pr-5 align-top font-mono text-xs text-red-400 tabular-nums whitespace-nowrap">
                            {tx.comisionPasarela}
                          </td>
                          <td className="py-2.5 align-top text-right font-mono text-xs font-semibold text-[#00B488] tabular-nums whitespace-nowrap">
                            {tx.netoAportado}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="shrink-0 border-t border-[#21262D] bg-[#0d1117]/60 px-6 py-4">
                  <p className="text-[11px] leading-relaxed text-zinc-500">
                    Zyra no cobra comisiones por tus liquidaciones. El 100% de los descuentos
                    corresponden a la tasa de procesamiento de la pasarela de pagos bancaria.
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}

function TarjetaMetricaSecundaria({ titulo, monto, subtexto }) {
  return (
    <div className="rounded-lg border border-[#21262D] bg-[#161B22] px-4 py-3">
      <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
        {titulo}
      </p>
      <p className="mt-1 text-xl font-semibold text-white font-mono tabular-nums leading-none">
        {monto}
      </p>
      <p className="mt-1.5 text-[10px] text-zinc-500 leading-snug">{subtexto}</p>
    </div>
  );
}

function DrawerEntrega({ entrega, onCerrar }) {
  const cerrar = useCallback(() => onCerrar?.(), [onCerrar]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') cerrar();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [cerrar]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  if (!entrega) return null;

  return createPortal(
    <>
      <button
        type="button"
        aria-label="Cerrar desglose de transferencia"
        className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-[1px] transition-opacity"
        onClick={cerrar}
      />

      <aside
        className="fixed top-0 right-0 bottom-0 z-[80] w-full max-w-[420px] bg-[#161618] border-l border-white/5 flex flex-col shadow-2xl animate-fade-in overflow-hidden"
        aria-label="Desglose de transferencia"
      >
        <div className="relative shrink-0 bg-[#121212] border-b border-white/5 px-5 py-4">
          <button
            type="button"
            aria-label="Cerrar panel"
            onClick={cerrar}
            className="absolute top-3 right-3 p-2 rounded-md text-zinc-600 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X size={16} strokeWidth={1.5} />
          </button>

          <p className="text-[10px] font-medium uppercase tracking-widest text-emerald-500/80 pr-10">
            Desglose de Transferencia
          </p>
          <p className="mt-1.5 text-sm font-semibold text-white pr-10">
            {entrega.idTransferencia}
          </p>
          <div className="mt-3 flex items-center justify-between gap-4">
            <span className="text-xs text-zinc-500">{entrega.fecha}</span>
            <span className="text-sm font-mono font-semibold text-white tabular-nums">
              {entrega.total}
            </span>
          </div>
        </div>

        <div className="relative flex-1 min-h-0 overflow-y-auto px-5 py-4 pb-32">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-3">
            Reservas incluidas ({entrega.reservas.length})
          </p>

          <ul className="space-y-3">
            {entrega.reservas.map((reserva) => (
              <li
                key={reserva.id}
                className="rounded-lg border border-white/5 bg-[#121212]/60 px-4 py-3.5"
              >
                <p className="text-xs font-medium text-zinc-200 leading-snug">
                  {reserva.concepto}
                </p>
                <p className="mt-1 text-[11px] text-zinc-500">{reserva.fecha}</p>
                <div className="mt-2.5 flex items-center justify-between gap-3">
                  <span className="text-xs text-gray-500">
                    Bruto{' '}
                    <span className="font-mono tabular-nums">{reserva.bruto}</span>
                  </span>
                  <span className="text-sm font-mono font-semibold text-emerald-400/90 tabular-nums">
                    {reserva.neto}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-10 border-t border-white/5 bg-[#161618] px-5 pt-4 pb-10 pr-24 shadow-[0_-16px_32px_rgba(0,0,0,0.5)]">
          <div
            className="pointer-events-none absolute inset-x-0 -top-8 h-8 bg-gradient-to-t from-[#161618] to-transparent"
            aria-hidden="true"
          />
          <div className="relative flex items-center justify-between gap-4">
            <span className="text-xs text-zinc-500">Total transferido</span>
            <span className="text-sm font-mono font-semibold text-white tabular-nums">
              {entrega.total}
            </span>
          </div>
        </div>
      </aside>
    </>,
    document.body
  );
}

function Billing() {
  const [entregaSeleccionada, setEntregaSeleccionada] = useState(null);
  const [showNextLiquidationModal, setShowNextLiquidationModal] = useState(false);

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden animate-fade-in">
      <div className="flex-shrink-0 px-5 py-3 border-b border-[#21262D]">
        <div className="max-w-5xl mx-auto w-full">
          <h1 className="text-lg font-semibold text-white tracking-tight">
            Liquidaciones Zyra
          </h1>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4">
        <div className="max-w-5xl mx-auto">
          <LayoutGroup id="liquidacion-hero-expand">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {!showNextLiquidationModal ? (
                <TarjetaHeroePendiente onClick={() => setShowNextLiquidationModal(true)} />
              ) : (
                <PlaceholderTarjetaHeroe />
              )}

              <div className="flex flex-col gap-4 lg:col-span-1">
                <TarjetaMetricaSecundaria
                  titulo="Ingresos Totales"
                  monto={RESUMEN_CONTABLE.ingresosTotales}
                  subtexto="Monto bruto pagado por usuarios en la plataforma"
                />
                <TarjetaMetricaSecundaria
                  titulo="Retenciones y Comisión Bancaria"
                  monto={RESUMEN_CONTABLE.retenciones}
                  subtexto="Fee de procesamiento de la pasarela de pagos. Zyra es 100% gratis"
                />
              </div>
            </div>

            <ModalProximaLiquidacion
              abierto={showNextLiquidationModal}
              onCerrar={() => setShowNextLiquidationModal(false)}
            />
          </LayoutGroup>

          <div className="bg-[#121212]/80 backdrop-blur-sm border border-white/5 rounded-xl overflow-hidden">
            <div className="px-4 py-3.5 border-b border-white/5">
              <h2 className="text-sm font-semibold text-white">Historial de Entregas</h2>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Transferencias anteriores realizadas por Zyra
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px]">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.02]">
                    <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 w-[18%]">
                      Fecha
                    </th>
                    <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 w-[34%]">
                      ID de Transferencia
                    </th>
                    <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 w-[24%]">
                      Total Enviado
                    </th>
                    <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 w-[24%]">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {ENTREGAS.map((entrega) => (
                    <tr
                      key={entrega.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => setEntregaSeleccionada(entrega)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setEntregaSeleccionada(entrega);
                        }
                      }}
                      className="border-b border-white/5 last:border-b-0 cursor-pointer hover:bg-[#161B22]/50 transition-colors duration-200"
                    >
                      <td className="px-4 py-3.5 text-xs text-zinc-400 tabular-nums">
                        {entrega.fecha}
                      </td>
                      <td className="px-4 py-3.5 text-[11px] font-mono text-zinc-500 truncate max-w-0">
                        {entrega.idTransferencia}
                      </td>
                      <td className="px-4 py-3.5 text-xs font-mono text-white tabular-nums">
                        {entrega.total}
                      </td>
                      <td className="px-4 py-3.5">
                        <BadgeCompletado />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {entregaSeleccionada && (
        <DrawerEntrega
          entrega={entregaSeleccionada}
          onCerrar={() => setEntregaSeleccionada(null)}
        />
      )}
    </div>
  );
}

export default Billing;
