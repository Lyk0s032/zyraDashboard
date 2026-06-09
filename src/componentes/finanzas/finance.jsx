import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { ChevronDown, Plus, Search, TrendingUp, X } from 'lucide-react';

const KPI_MODAL_KEYS = {
  ocupacion: 'canchas',
  pasarela: 'zyra',
  efectivo: 'caja',
};

const SPRING_BARRA = { type: 'spring', stiffness: 120, damping: 22, mass: 0.75 };
const SPRING_LAYOUT = { type: 'spring', stiffness: 85, damping: 18, mass: 0.95 };
const EASE_PREMIUM = [0.25, 0.1, 0.25, 1];

const VARIANTES_COLUMNA = {
  inicial: { opacity: 0, scaleY: 0.12, filter: 'blur(3px)' },
  visible: {
    opacity: 1,
    scaleY: 1,
    filter: 'blur(0px)',
    transition: SPRING_BARRA,
  },
  salida: {
    opacity: 0,
    scaleY: 0,
    filter: 'blur(2px)',
    transition: { duration: 0.32, ease: EASE_PREMIUM },
  },
};

const VARIANTES_ETIQUETA = {
  inicial: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.38, ease: EASE_PREMIUM } },
  salida: { opacity: 0, y: -4, transition: { duration: 0.22, ease: EASE_PREMIUM } },
};

const MESES_CORTOS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const NOMBRES_DIA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const PERIODOS_MENSUALES = ['ultimos-3-meses', 'ultimos-6-meses', 'rango-personalizado'];
const FECHA_REFERENCIA = new Date(2026, 5, 8);

const CANTIDAD_MESES_POR_PERIODO = {
  'ultimo-mes': 1,
  'ultimos-3-meses': 3,
  'ultimos-6-meses': 6,
  'rango-personalizado': 2,
};

const PERIODOS_FECHA = [
  { value: 'esta-semana', label: 'Esta semana' },
  { value: 'ultimo-mes', label: 'Último mes' },
  { value: 'ultimos-3-meses', label: 'Últimos 3 meses' },
  { value: 'ultimos-6-meses', label: 'Últimos 6 meses' },
  { value: 'rango-personalizado', label: 'Rango personalizado...' },
];

const DEPORTES_OPCIONES = [
  { value: 'todos', label: 'Todos los deportes' },
  { value: 'futbol', label: 'Fútbol' },
  { value: 'padel', label: 'Pádel' },
];

const CANCHAS_OPCIONES = [
  { value: 'todas', label: 'Todas las canchas' },
  { value: 'cancha-1', label: 'Cancha 1 (F5)' },
  { value: 'cancha-2', label: 'Cancha 2 (F7)' },
  { value: 'padel-1', label: 'Pádel 1' },
];

const LIMITES_TEMPORALIDAD = {
  'esta-semana': 7,
  'ultimo-mes': 30,
  'ultimos-3-meses': 90,
  'ultimos-6-meses': 180,
  'rango-personalizado': 60,
};

const TRANSACCIONES_CRUDAS = [
  {
    id: 1,
    fecha: 'Hoy',
    hora: '15:30',
    diaSemana: 'Dom',
    mesKey: '2026-06',
    antiguedadDias: 0,
    concepto: 'Reserva Cancha 2 - Torneo Nocturno',
    folio: 'ZYR-2026-0412',
    cliente: 'Carlos Méndez',
    deporte: 'futbol',
    cancha: 'cancha-2',
    metodoPago: 'online',
    metodo: 'Pago Online',
    metodoClase: 'bg-[#00B488]/15 text-[#00B488] ring-1 ring-[#00B488]/25',
    atendidoPor: 'Sistema Zyra',
    montoNumerico: 70000,
  },
  {
    id: 2,
    fecha: 'Hoy',
    hora: '14:15',
    diaSemana: 'Dom',
    mesKey: '2026-06',
    antiguedadDias: 0,
    concepto: 'Liquidación Saldo - Cancha 3',
    folio: 'ZYR-2026-0408',
    cliente: 'Laura Pérez',
    deporte: 'futbol',
    cancha: 'cancha-1',
    metodoPago: 'efectivo',
    metodo: 'Efectivo',
    metodoClase: 'bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/25',
    atendidoPor: 'Andrea Gómez',
    montoNumerico: 40000,
  },
  {
    id: 3,
    fecha: 'Ayer',
    hora: '11:00',
    diaSemana: 'Sáb',
    mesKey: '2026-06',
    antiguedadDias: 1,
    concepto: 'Reserva Cancha 5 - Cortesía Escuela',
    folio: 'ZYR-2026-0395',
    cliente: 'Escuela Norte',
    deporte: 'padel',
    cancha: 'padel-1',
    metodoPago: 'gratuito',
    metodo: 'Gratuito',
    metodoClase: 'bg-slate-500/15 text-slate-400 ring-1 ring-slate-500/25',
    atendidoPor: 'Andrea Gómez',
    montoNumerico: 0,
  },
  {
    id: 4,
    fecha: '6 Jun',
    hora: '18:20',
    diaSemana: 'Vie',
    mesKey: '2026-06',
    antiguedadDias: 3,
    concepto: 'Reserva Cancha 1 - Liga Empresarial',
    folio: 'ZYR-2026-0381',
    cliente: 'Grupo Atlas',
    deporte: 'futbol',
    cancha: 'cancha-1',
    metodoPago: 'online',
    metodo: 'Pago Online',
    metodoClase: 'bg-[#00B488]/15 text-[#00B488] ring-1 ring-[#00B488]/25',
    atendidoPor: 'Sistema Zyra',
    montoNumerico: 120000,
  },
  {
    id: 5,
    fecha: '5 Jun',
    hora: '20:00',
    diaSemana: 'Jue',
    mesKey: '2026-06',
    antiguedadDias: 4,
    concepto: 'Reserva Cancha 2 - Partido Amistoso',
    folio: 'ZYR-2026-0374',
    cliente: 'Felipe R.',
    deporte: 'futbol',
    cancha: 'cancha-2',
    metodoPago: 'efectivo',
    metodo: 'Efectivo',
    metodoClase: 'bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/25',
    atendidoPor: 'Andrea Gómez',
    montoNumerico: 95000,
  },
  {
    id: 6,
    fecha: '4 Jun',
    hora: '17:45',
    diaSemana: 'Mié',
    mesKey: '2026-06',
    antiguedadDias: 5,
    concepto: 'Clase Pádel — Grupo Intermedio',
    folio: 'ZYR-2026-0360',
    cliente: 'Academia Smash',
    deporte: 'padel',
    cancha: 'padel-1',
    metodoPago: 'online',
    metodo: 'Pago Online',
    metodoClase: 'bg-[#00B488]/15 text-[#00B488] ring-1 ring-[#00B488]/25',
    atendidoPor: 'Sistema Zyra',
    montoNumerico: 55000,
  },
  {
    id: 7,
    fecha: '3 Jun',
    hora: '19:30',
    diaSemana: 'Mar',
    mesKey: '2026-06',
    antiguedadDias: 6,
    concepto: 'Reserva Cancha 1 - Torneo Relámpago',
    folio: 'ZYR-2026-0348',
    cliente: 'Club Deportivo Sur',
    deporte: 'futbol',
    cancha: 'cancha-1',
    metodoPago: 'efectivo',
    metodo: 'Efectivo',
    metodoClase: 'bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/25',
    atendidoPor: 'Andrea Gómez',
    montoNumerico: 80000,
  },
  {
    id: 8,
    fecha: '2 Jun',
    hora: '16:00',
    diaSemana: 'Lun',
    mesKey: '2026-06',
    antiguedadDias: 7,
    concepto: 'Reserva Pádel 1 - Parejas Mixtas',
    folio: 'ZYR-2026-0331',
    cliente: 'María & Juan',
    deporte: 'padel',
    cancha: 'padel-1',
    metodoPago: 'online',
    metodo: 'Pago Online',
    metodoClase: 'bg-[#00B488]/15 text-[#00B488] ring-1 ring-[#00B488]/25',
    atendidoPor: 'Sistema Zyra',
    montoNumerico: 45000,
  },
  {
    id: 9,
    fecha: '20 May',
    hora: '21:00',
    diaSemana: 'Mar',
    mesKey: '2026-05',
    antiguedadDias: 20,
    concepto: 'Reserva Cancha 2 - Liga Nocturna',
    folio: 'ZYR-2026-0290',
    cliente: 'Los Halcones',
    deporte: 'futbol',
    cancha: 'cancha-2',
    metodoPago: 'online',
    metodo: 'Pago Online',
    metodoClase: 'bg-[#00B488]/15 text-[#00B488] ring-1 ring-[#00B488]/25',
    atendidoPor: 'Sistema Zyra',
    montoNumerico: 110000,
  },
  {
    id: 10,
    fecha: '10 Abr',
    hora: '10:30',
    diaSemana: 'Jue',
    mesKey: '2026-04',
    antiguedadDias: 60,
    concepto: 'Clínica Pádel — Fin de Semana',
    folio: 'ZYR-2026-0210',
    cliente: 'Pro Padel Academy',
    deporte: 'padel',
    cancha: 'padel-1',
    metodoPago: 'efectivo',
    metodo: 'Efectivo',
    metodoClase: 'bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/25',
    atendidoPor: 'Andrea Gómez',
    montoNumerico: 65000,
  },
  {
    id: 11,
    fecha: '15 Mar',
    hora: '19:00',
    diaSemana: 'Sáb',
    mesKey: '2026-03',
    antiguedadDias: 85,
    concepto: 'Torneo Fútbol 5 — Fase Final',
    folio: 'ZYR-2026-0180',
    cliente: 'Liga Barrial',
    deporte: 'futbol',
    cancha: 'cancha-2',
    metodoPago: 'online',
    metodo: 'Pago Online',
    metodoClase: 'bg-[#00B488]/15 text-[#00B488] ring-1 ring-[#00B488]/25',
    atendidoPor: 'Sistema Zyra',
    montoNumerico: 135000,
  },
  {
    id: 12,
    fecha: '22 Feb',
    hora: '18:30',
    diaSemana: 'Dom',
    mesKey: '2026-02',
    antiguedadDias: 106,
    concepto: 'Reserva Pádel 1 — Campeonato Parejas',
    folio: 'ZYR-2026-0142',
    cliente: 'Smash Club',
    deporte: 'padel',
    cancha: 'padel-1',
    metodoPago: 'efectivo',
    metodo: 'Efectivo',
    metodoClase: 'bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/25',
    atendidoPor: 'Andrea Gómez',
    montoNumerico: 78000,
  },
  {
    id: 13,
    fecha: '12 Ene',
    hora: '20:15',
    diaSemana: 'Lun',
    mesKey: '2026-01',
    antiguedadDias: 148,
    concepto: 'Reserva Cancha 1 — Liga Verano',
    folio: 'ZYR-2026-0098',
    cliente: 'Equipo Andes',
    deporte: 'futbol',
    cancha: 'cancha-1',
    metodoPago: 'online',
    metodo: 'Pago Online',
    metodoClase: 'bg-[#00B488]/15 text-[#00B488] ring-1 ring-[#00B488]/25',
    atendidoPor: 'Sistema Zyra',
    montoNumerico: 92000,
  },
];

const CLASE_SELECT =
  'appearance-none w-full bg-[#21262D] border border-[#30363D] text-[11px] text-slate-300 pl-2.5 pr-7 py-1.5 rounded-lg cursor-pointer hover:border-[#00B488]/30 focus:border-[#00B488]/50 focus:outline-none focus:ring-1 focus:ring-[#00B488]/20 transition';

function formatearCOP(valor) {
  return `$${Math.round(valor).toLocaleString('es-CO')} COP`;
}

function formatearMontoTx(monto) {
  if (monto === 0) return { texto: '$0 COP', clase: 'text-slate-400' };
  return { texto: `+${formatearCOP(monto)}`, clase: 'text-[#00B488]/90' };
}

function coincideTemporalidad(tx, temporalidad) {
  const limite = LIMITES_TEMPORALIDAD[temporalidad] ?? 7;
  return tx.antiguedadDias <= limite;
}

function filtrarPorControles(transacciones, { deporte, cancha, temporalidad }) {
  return transacciones.filter((tx) => {
    const coincideDeporte = deporte === 'todos' || tx.deporte === deporte;
    const coincideCancha = cancha === 'todas' || tx.cancha === cancha;
    const coincidePeriodo = coincideTemporalidad(tx, temporalidad);
    return coincideDeporte && coincideCancha && coincidePeriodo;
  });
}

function filtrarPorBusqueda(transacciones, busqueda) {
  const termino = busqueda.trim().toLowerCase();
  if (!termino) return transacciones;

  return transacciones.filter(
    (tx) =>
      tx.cliente.toLowerCase().includes(termino) ||
      tx.folio.toLowerCase().includes(termino) ||
      tx.concepto.toLowerCase().includes(termino)
  );
}

function resolverGranularidad(temporalidad) {
  return PERIODOS_MENSUALES.includes(temporalidad) ? 'mes' : 'dia';
}

function obtenerMesesPeriodo(temporalidad) {
  const cantidad = CANTIDAD_MESES_POR_PERIODO[temporalidad] ?? 2;
  const meses = [];

  for (let i = cantidad - 1; i >= 0; i -= 1) {
    const fecha = new Date(
      FECHA_REFERENCIA.getFullYear(),
      FECHA_REFERENCIA.getMonth() - i,
      1
    );

    meses.push({
      key: `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`,
      etiqueta: MESES_CORTOS[fecha.getMonth()],
    });
  }

  return meses;
}

function generarBucketsDias(cantidadDias, formatoEtiqueta = 'numero') {
  const buckets = [];

  for (let offset = cantidadDias - 1; offset >= 0; offset -= 1) {
    const fecha = new Date(FECHA_REFERENCIA);
    fecha.setDate(fecha.getDate() - offset);

    buckets.push({
      key: `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`,
      etiqueta:
        formatoEtiqueta === 'nombre'
          ? NOMBRES_DIA[fecha.getDay()]
          : String(fecha.getDate()),
      offset,
    });
  }

  return buckets;
}

function normalizarBarras(barras) {
  const maximo = Math.max(...barras.map((barra) => barra.monto), 1);

  return barras.map((barra) => ({
    ...barra,
    porcentaje:
      barra.monto > 0
        ? Math.max(12, Math.round((barra.monto / maximo) * 100))
        : 4,
  }));
}

function calcularIngresosPorDia(transacciones, cantidadDias, formatoEtiqueta = 'numero') {
  const buckets = generarBucketsDias(cantidadDias, formatoEtiqueta);
  const totales = Object.fromEntries(buckets.map((bucket) => [bucket.offset, 0]));

  transacciones.forEach((tx) => {
    if (tx.antiguedadDias < cantidadDias) {
      totales[tx.antiguedadDias] += tx.montoNumerico;
    }
  });

  return buckets.map((bucket) => ({
    key: bucket.key,
    etiqueta: bucket.etiqueta,
    monto: totales[bucket.offset],
  }));
}

function calcularIngresosPorMes(transacciones, temporalidad) {
  const meses = obtenerMesesPeriodo(temporalidad);
  const totales = Object.fromEntries(meses.map((mes) => [mes.key, 0]));

  transacciones.forEach((tx) => {
    if (totales[tx.mesKey] !== undefined) {
      totales[tx.mesKey] += tx.montoNumerico;
    }
  });

  return meses.map((mes) => ({
    key: mes.key,
    etiqueta: mes.etiqueta,
    monto: totales[mes.key],
  }));
}

function calcularDatosGrafico(transacciones, temporalidad) {
  const granularidad = resolverGranularidad(temporalidad);

  if (granularidad === 'dia') {
    const cantidadDias = temporalidad === 'esta-semana' ? 7 : 30;
    const formatoEtiqueta = temporalidad === 'esta-semana' ? 'nombre' : 'numero';
    const barras = calcularIngresosPorDia(transacciones, cantidadDias, formatoEtiqueta);

    return {
      modo: 'dia',
      titulo: temporalidad === 'esta-semana' ? 'Tendencia Semanal' : 'Tendencia Diaria',
      unidad: 'día',
      datos: normalizarBarras(barras),
    };
  }

  const barras = calcularIngresosPorMes(transacciones, temporalidad);
  const titulos = {
    'ultimos-3-meses': 'Tendencia Trimestral',
    'ultimos-6-meses': 'Tendencia Semestral',
    'rango-personalizado': 'Tendencia Bimestral',
  };

  return {
    modo: 'mes',
    titulo: titulos[temporalidad] ?? 'Tendencia por Meses',
    unidad: 'mes',
    datos: normalizarBarras(barras),
  };
}

function calcularKPIs(transacciones) {
  const ingresosTotales = transacciones.reduce((sum, tx) => sum + tx.montoNumerico, 0);
  const efectivo = transacciones
    .filter((tx) => tx.metodoPago === 'efectivo')
    .reduce((sum, tx) => sum + tx.montoNumerico, 0);
  const online = transacciones
    .filter((tx) => tx.metodoPago === 'online')
    .reduce((sum, tx) => sum + tx.montoNumerico, 0);
  const conIngreso = transacciones.filter((tx) => tx.montoNumerico > 0).length;
  const ocupacion = transacciones.length
    ? Math.min(98, Math.round(48 + conIngreso * 5 + ingresosTotales / 25000))
    : 0;

  return [
    {
      id: 'caja-total',
      etiqueta: 'Ingresos Totales',
      valor: formatearCOP(ingresosTotales),
      badge: ingresosTotales > 0 ? '+12% vs ayer' : null,
      badgeClase: 'bg-[#00B488]/10 text-[#00B488] ring-1 ring-[#00B488]/20',
      subtexto: null,
      progreso: null,
    },
    {
      id: 'efectivo',
      etiqueta: 'Efectivo en Caja (Counter)',
      valor: formatearCOP(efectivo),
      badge: null,
      subtexto: 'Dinero real en counter',
      progreso: null,
      modalKey: KPI_MODAL_KEYS.efectivo,
    },
    {
      id: 'pasarela',
      etiqueta: 'Recaudado por Zyra',
      valor: formatearCOP(online),
      badge: null,
      subtexto: 'Pendiente por liquidar',
      progreso: null,
      modalKey: KPI_MODAL_KEYS.pasarela,
    },
    {
      id: 'ocupacion',
      etiqueta: 'Eficiencia de Canchas',
      valor: `${ocupacion}%`,
      badge: null,
      subtexto: null,
      progreso: ocupacion,
      modalKey: KPI_MODAL_KEYS.ocupacion,
    },
  ];
}

function calcularIngresosPorCancha(transacciones) {
  const canchas = CANCHAS_OPCIONES.filter((c) => c.value !== 'todas');

  const filas = canchas.map((cancha) => {
    const monto = transacciones
      .filter((tx) => tx.cancha === cancha.value)
      .reduce((sum, tx) => sum + tx.montoNumerico, 0);

    return { id: cancha.value, nombre: cancha.label, monto };
  });

  const maximo = Math.max(...filas.map((f) => f.monto), 1);

  return filas.map((fila) => ({
    ...fila,
    porcentaje: Math.round((fila.monto / maximo) * 100),
  }));
}

function calcularSerieTemporal(transacciones, metodoPago, temporalidad) {
  const granularidad = resolverGranularidad(temporalidad);
  let puntos = [];

  if (granularidad === 'dia') {
    const cantidadDias = temporalidad === 'esta-semana' ? 7 : 30;
    const buckets = generarBucketsDias(cantidadDias, 'nombre');

    puntos = buckets.map((bucket) => ({
      etiqueta: bucket.etiqueta,
      valor: transacciones
        .filter((tx) => tx.antiguedadDias === bucket.offset && tx.metodoPago === metodoPago)
        .reduce((sum, tx) => sum + tx.montoNumerico, 0),
    }));
  } else {
    const meses = obtenerMesesPeriodo(temporalidad);

    puntos = meses.map((mes) => ({
      etiqueta: mes.etiqueta,
      valor: transacciones
        .filter((tx) => tx.mesKey === mes.key && tx.metodoPago === metodoPago)
        .reduce((sum, tx) => sum + tx.montoNumerico, 0),
    }));
  }

  let acumulado = 0;
  return puntos.map((punto) => {
    acumulado += punto.valor;
    return { ...punto, acumulado };
  });
}

function construirDatosModales(transacciones, temporalidad) {
  const efectivo = transacciones
    .filter((tx) => tx.metodoPago === 'efectivo')
    .reduce((sum, tx) => sum + tx.montoNumerico, 0);
  const online = transacciones
    .filter((tx) => tx.metodoPago === 'online')
    .reduce((sum, tx) => sum + tx.montoNumerico, 0);

  return {
    canchas: calcularIngresosPorCancha(transacciones),
    zyra: {
      total: online,
      serie: calcularSerieTemporal(transacciones, 'online', temporalidad),
    },
    caja: {
      total: efectivo,
      serie: calcularSerieTemporal(transacciones, 'efectivo', temporalidad),
    },
  };
}

function construirVistaFinanciera(transacciones, { deporte, cancha, temporalidad }) {
  const etiquetaPeriodo =
    PERIODOS_FECHA.find((p) => p.value === temporalidad)?.label ?? 'Esta semana';
  const etiquetaDeporte =
    DEPORTES_OPCIONES.find((d) => d.value === deporte)?.label ?? 'Todos los deportes';
  const etiquetaCancha =
    CANCHAS_OPCIONES.find((c) => c.value === cancha)?.label ?? 'Todas las canchas';

  const datosGrafico = calcularDatosGrafico(transacciones, temporalidad);
  const totalGrafico = datosGrafico.datos.reduce((sum, barra) => sum + barra.monto, 0);
  const unidadLabel = datosGrafico.unidad === 'mes' ? 'mes' : 'día';

  return {
    indicadores: calcularKPIs(transacciones),
    datosGrafico,
    totalGrafico: formatearCOP(totalGrafico),
    contextoFiltros: `Ingresos por ${unidadLabel} — ${etiquetaPeriodo} · ${etiquetaDeporte} · ${etiquetaCancha}`,
  };
}

function SelectFiltro({ value, onChange, opciones, ariaLabel, ancho = 'w-[118px] sm:w-[124px]' }) {
  return (
    <div className={`relative shrink-0 ${ancho}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={ariaLabel}
        className={CLASE_SELECT}
      >
        {opciones.map((opcion) => (
          <option key={opcion.value} value={opcion.value} className="bg-[#161B22]">
            {opcion.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={11}
        className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-500"
        strokeWidth={2}
      />
    </div>
  );
}

function HeaderFinanciero({ deporte, cancha, temporalidad, onDeporte, onCancha, onTemporalidad }) {
  return (
    <header className="mb-6 flex-shrink-0 border-b border-[#21262D]/80 px-5 pb-5 pt-5">
      <div className="mx-auto w-full max-w-6xl">
        <div className="grid grid-cols-1 items-center gap-x-4 gap-y-3 lg:grid-cols-[auto_minmax(0,1fr)]">
          <h1 className="whitespace-nowrap text-lg font-bold tracking-wide text-white">
            Control Financiero
          </h1>

          <div className="flex min-w-0 flex-wrap items-center justify-start gap-1.5 lg:justify-end">
            <button
              type="button"
              className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-lg bg-[#00B488] px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-[#00c896]"
            >
              <Plus size={13} strokeWidth={2.5} />
              Registrar Movimiento / Cierre
            </button>

            <SelectFiltro
              value={deporte}
              onChange={onDeporte}
              opciones={DEPORTES_OPCIONES}
              ariaLabel="Filtrar por deporte"
            />
            <SelectFiltro
              value={cancha}
              onChange={onCancha}
              opciones={CANCHAS_OPCIONES}
              ariaLabel="Filtrar por cancha"
            />
            <SelectFiltro
              value={temporalidad}
              onChange={onTemporalidad}
              opciones={PERIODOS_FECHA}
              ariaLabel="Filtrar por periodo"
              ancho="w-[128px] sm:w-[136px]"
            />
          </div>

          <p className="max-w-md text-xs leading-relaxed text-gray-400 lg:col-span-2">
            Monitorea los ingresos, el arqueo de caja física y las transacciones en tiempo real.
          </p>
        </div>
      </div>
    </header>
  );
}

function CeldaFechaHora({ fecha, hora }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs font-medium text-slate-200">{fecha}</span>
      <span className="mt-0.5 font-mono text-[11px] tabular-nums text-slate-500">{hora}</span>
    </div>
  );
}

function BadgeMetodo({ label, clase }) {
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-medium ${clase}`}>
      {label}
    </span>
  );
}

function TarjetaIndicador({
  valor,
  etiqueta,
  badge,
  badgeClase,
  subtexto,
  progreso,
  modalKey,
  onAbrirModal,
  activa,
}) {
  const esClickable = Boolean(modalKey);

  const contenido = (
    <>
      <div>
        <p className="text-[10px] font-medium uppercase tracking-widest text-slate-500">{etiqueta}</p>
        <p className="mt-2 font-mono text-xl tabular-nums text-white">{valor}</p>
      </div>

      {badge && (
        <span
          className={`mt-2 inline-flex w-fit items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium ${badgeClase}`}
        >
          <TrendingUp size={10} strokeWidth={2.5} />
          {badge}
        </span>
      )}

      {subtexto && <p className="mt-2 text-[10px] leading-snug text-slate-500">{subtexto}</p>}

      {progreso !== null && (
        <div className="mt-3">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#21262D]">
            <div
              className="h-full rounded-full bg-[#00B488] transition-all duration-500"
              style={{ width: `${progreso}%` }}
            />
          </div>
        </div>
      )}

      {esClickable && (
        <p className="mt-2 text-[9px] font-medium uppercase tracking-wider text-[#00B488]/60">
          Ver detalle →
        </p>
      )}
    </>
  );

  if (!esClickable) {
    return (
      <div className="flex min-h-[120px] flex-col justify-between rounded-xl border border-[#21262D] bg-[#161B22] p-4">
        {contenido}
      </div>
    );
  }

  return (
    <motion.button
      type="button"
      onClick={() => onAbrirModal(modalKey)}
      whileHover={{ scale: 1.015, borderColor: 'rgba(0, 180, 136, 0.35)' }}
      whileTap={{ scale: 0.985 }}
      transition={SPRING_BARRA}
      className={`flex min-h-[120px] w-full cursor-pointer flex-col justify-between rounded-xl border bg-[#161B22] p-4 text-left transition-colors hover:bg-[#161B22]/90 ${
        activa
          ? 'border-[#00B488]/50 ring-1 ring-[#00B488]/30'
          : 'border-[#21262D] hover:border-[#00B488]/25'
      }`}
    >
      {contenido}
    </motion.button>
  );
}

function construirPuntosArea(datos, ancho, alto, padding) {
  const maximo = Math.max(...datos.map((d) => d.acumulado), 1);
  const chartW = ancho - padding.left - padding.right;
  const chartH = alto - padding.top - padding.bottom;

  return datos.map((dato, indice) => ({
    x:
      padding.left +
      (datos.length <= 1 ? chartW / 2 : (indice / (datos.length - 1)) * chartW),
    y: padding.top + chartH - (dato.acumulado / maximo) * chartH,
    etiqueta: dato.etiqueta,
    acumulado: dato.acumulado,
  }));
}

function curvaSuaveMonotone(puntos) {
  if (puntos.length === 0) return '';
  if (puntos.length === 1) return `M ${puntos[0].x} ${puntos[0].y}`;

  let path = `M ${puntos[0].x} ${puntos[0].y}`;

  for (let i = 0; i < puntos.length - 1; i += 1) {
    const actual = puntos[i];
    const siguiente = puntos[i + 1];
    const medioX = (actual.x + siguiente.x) / 2;
    path += ` C ${medioX} ${actual.y}, ${medioX} ${siguiente.y}, ${siguiente.x} ${siguiente.y}`;
  }

  return path;
}

function GraficaAreaKpi({ datos, gradientId }) {
  const [indiceHover, setIndiceHover] = useState(null);
  const anchoVista = 400;
  const altoVista = 160;
  const padding = { top: 14, right: 10, bottom: 26, left: 34 };
  const baseY = altoVista - padding.bottom;

  const puntos = useMemo(
    () => construirPuntosArea(datos, anchoVista, altoVista, padding),
    [datos]
  );

  const lineaPath = curvaSuaveMonotone(puntos);
  const areaPath =
    puntos.length > 0
      ? `${lineaPath} L ${puntos[puntos.length - 1].x} ${baseY} L ${puntos[0].x} ${baseY} Z`
      : '';

  const maximo = Math.max(...datos.map((d) => d.acumulado), 1);
  const lineasGrid = [0, 0.5, 1].map((fraccion) => padding.top + (altoVista - padding.top - padding.bottom) * fraccion);
  const etiquetaCada = datos.length > 12 ? Math.ceil(datos.length / 8) : 1;
  const serieKey = datos.map((d) => `${d.etiqueta}-${d.acumulado}`).join('|');
  const puntoActivo = indiceHover !== null ? puntos[indiceHover] : null;

  return (
    <div className="relative mt-4 h-[180px] w-full">
      <svg
        viewBox={`0 0 ${anchoVista} ${altoVista}`}
        className="h-full w-full"
        preserveAspectRatio="none"
        onMouseLeave={() => setIndiceHover(null)}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00B488" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#00B488" stopOpacity={0} />
          </linearGradient>
        </defs>

        {lineasGrid.map((y) => (
          <line
            key={y}
            x1={padding.left}
            x2={anchoVista - padding.right}
            y1={y}
            y2={y}
            stroke="#30363D"
            strokeDasharray="4 4"
          />
        ))}

        {[0, 0.5, 1].map((fraccion) => (
          <text
            key={fraccion}
            x={padding.left - 6}
            y={padding.top + (altoVista - padding.top - padding.bottom) * fraccion + 3}
            textAnchor="end"
            fill="#64748b"
            fontSize="9"
          >
            {`${Math.round((maximo * (1 - fraccion)) / 1000)}k`}
          </text>
        ))}

        <motion.path
          key={`area-${serieKey}`}
          d={areaPath}
          fill={`url(#${gradientId})`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.55, ease: EASE_PREMIUM }}
        />

        <motion.path
          key={`linea-${serieKey}`}
          d={lineaPath}
          fill="none"
          stroke="#00B488"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0.5 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.75, ease: EASE_PREMIUM }}
        />

        {puntos.map((punto, indice) => (
          <g key={`${punto.etiqueta}-${indice}`}>
            <rect
              x={punto.x - (anchoVista / datos.length) / 2}
              y={padding.top}
              width={anchoVista / datos.length}
              height={altoVista - padding.top - padding.bottom}
              fill="transparent"
              onMouseEnter={() => setIndiceHover(indice)}
            />
            <circle
              cx={punto.x}
              cy={punto.y}
              r={indiceHover === indice ? 4 : 0}
              fill="#00B488"
              stroke="#161B22"
              strokeWidth="2"
              className="transition-all duration-200"
            />
          </g>
        ))}

        {puntos.map((punto, indice) =>
          indice % etiquetaCada === 0 || indice === puntos.length - 1 ? (
            <text
              key={`label-${punto.etiqueta}-${indice}`}
              x={punto.x}
              y={altoVista - 8}
              textAnchor="middle"
              fill="#64748b"
              fontSize="9"
            >
              {punto.etiqueta}
            </text>
          ) : null
        )}
      </svg>

      <AnimatePresence>
        {puntoActivo && (
          <motion.div
            key={`tooltip-${puntoActivo.etiqueta}`}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-none absolute top-2 rounded-lg border border-[#30363D] bg-[#161B22]/95 px-2.5 py-1.5 text-[10px] shadow-xl backdrop-blur-sm"
            style={{
              left: `${(puntoActivo.x / anchoVista) * 100}%`,
              transform: 'translateX(-50%)',
            }}
          >
            <p className="text-slate-400">{puntoActivo.etiqueta}</p>
            <p className="font-mono tabular-nums text-[#00B488]">
              {formatearCOP(puntoActivo.acumulado)}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ContenidoModalCanchas({ canchas }) {
  return (
    <div className="mt-5 space-y-4">
      {canchas.map((cancha, indice) => (
        <motion.div
          key={cancha.id}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: indice * 0.06, duration: 0.35, ease: EASE_PREMIUM }}
        >
          <div className="mb-1.5 flex items-center justify-between gap-3">
            <span className="text-xs font-medium text-slate-200">{cancha.nombre}</span>
            <span className="font-mono text-[10px] tabular-nums text-[#00B488]/90">
              {formatearCOP(cancha.monto)}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-[#21262D]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${cancha.porcentaje}%` }}
              transition={{ ...SPRING_BARRA, delay: indice * 0.06 }}
              className="h-full rounded-full bg-[#00B488]"
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

const CONFIG_MODAL_KPI = {
  canchas: {
    titulo: 'Eficiencia de Canchas',
    subtitulo: 'Ingresos generados por cancha en el periodo actual',
  },
  zyra: {
    titulo: 'Recaudado por Zyra',
    subtitulo: 'Comportamiento acumulado de pagos online',
  },
  caja: {
    titulo: 'Efectivo en Caja',
    subtitulo: 'Evolución del efectivo físico en counter',
  },
};

function ModalKpiFinanciero({ activeKpiModal, onCerrar, datosModales, contextoFiltros }) {
  useEffect(() => {
    if (!activeKpiModal) return undefined;

    const manejarEscape = (e) => {
      if (e.key === 'Escape') onCerrar();
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', manejarEscape);

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', manejarEscape);
    };
  }, [activeKpiModal, onCerrar]);

  const config = activeKpiModal ? CONFIG_MODAL_KPI[activeKpiModal] : null;

  return createPortal(
    <AnimatePresence>
      {activeKpiModal && config && (
        <motion.div
          key="kpi-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28, ease: EASE_PREMIUM }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md"
          onClick={onCerrar}
        >
          <motion.div
            key={activeKpiModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="kpi-modal-titulo"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 6 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-xl border border-[#21262D] bg-[#161B22] p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 id="kpi-modal-titulo" className="text-base font-semibold tracking-wide text-white">
                  {config.titulo}
                </h2>
                <p className="mt-1 text-[11px] text-slate-500">{config.subtitulo}</p>
                <p className="mt-1 text-[10px] text-slate-600">{contextoFiltros}</p>
              </div>
              <button
                type="button"
                onClick={onCerrar}
                aria-label="Cerrar modal"
                className="shrink-0 rounded-lg border border-[#30363D] p-1.5 text-slate-400 transition hover:border-[#00B488]/40 hover:text-white"
              >
                <X size={14} strokeWidth={2} />
              </button>
            </div>

            {activeKpiModal === 'canchas' && (
              <ContenidoModalCanchas canchas={datosModales.canchas} />
            )}

            {activeKpiModal === 'zyra' && (
              <>
                <p className="mt-5 font-mono text-2xl tabular-nums text-white">
                  {formatearCOP(datosModales.zyra.total)}
                </p>
                <p className="mt-1 text-[10px] text-slate-500">Total acumulado por la plataforma</p>
                <GraficaAreaKpi datos={datosModales.zyra.serie} gradientId="zyraGradient" />
              </>
            )}

            {activeKpiModal === 'caja' && (
              <>
                <p className="mt-5 font-mono text-2xl tabular-nums text-white">
                  {formatearCOP(datosModales.caja.total)}
                </p>
                <p className="mt-1 text-[10px] text-slate-500">Total en counter físico</p>
                <GraficaAreaKpi datos={datosModales.caja.serie} gradientId="cajaGradient" />
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

function formatearMontoCorto(monto) {
  if (monto === 0) return '';
  if (monto >= 1_000_000) return `$${(monto / 1_000_000).toFixed(1)}M`;
  return `$${Math.round(monto / 1000)}k`;
}

function obtenerEstiloBarra(columnas, modo) {
  if (modo === 'dia' && columnas > 14) {
    return { ancho: 8, etiqueta: 'text-[7px]', monto: 'text-[7px]', gap: 'gap-0.5' };
  }
  if (columnas > 7) {
    return { ancho: 14, etiqueta: 'text-[8px]', monto: 'text-[8px]', gap: 'gap-1' };
  }
  if (modo === 'mes' && columnas <= 2) {
    return { ancho: 48, etiqueta: 'text-[10px]', monto: 'text-[9px]', gap: 'gap-1.5' };
  }
  return { ancho: 32, etiqueta: 'text-[10px]', monto: 'text-[9px]', gap: 'gap-1.5' };
}

function GraficoTendencia({ datosGrafico, contextoFiltros, totalGrafico, granularidadId }) {
  const columnas = datosGrafico.datos.length;
  const estilo = obtenerEstiloBarra(columnas, datosGrafico.modo);
  const requiereScroll = datosGrafico.modo === 'dia' && columnas > 14;
  const gapColumnas = columnas > 14 ? '2px' : columnas > 7 ? '4px' : '8px';

  return (
    <div className="mt-6 rounded-xl border border-[#21262D] bg-[#161B22]/60 p-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <AnimatePresence mode="wait">
            <motion.h3
              key={datosGrafico.titulo}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.35, ease: EASE_PREMIUM }}
              className="text-sm font-semibold text-slate-200"
            >
              {datosGrafico.titulo}
            </motion.h3>
          </AnimatePresence>
          <motion.p
            layout
            className="mt-0.5 text-[10px] text-slate-500"
            transition={SPRING_LAYOUT}
          >
            {contextoFiltros}
          </motion.p>
        </div>
        <motion.span
          key={totalGrafico}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={SPRING_BARRA}
          className="shrink-0 font-mono text-[10px] tabular-nums text-[#00B488]/90"
        >
          {totalGrafico}
        </motion.span>
      </div>

      <div
        className={`relative h-[180px] rounded-lg ${
          requiereScroll ? 'overflow-x-auto overflow-y-hidden' : 'overflow-hidden'
        }`}
      >
        <motion.div
          layout
          transition={SPRING_LAYOUT}
          className="relative h-full"
          style={{
            minWidth: requiereScroll ? `${columnas * 18}px` : '100%',
            backgroundImage: [
              'linear-gradient(to right, rgba(48,54,61,0.35) 1px, transparent 1px)',
              'linear-gradient(to bottom, rgba(48,54,61,0.35) 1px, transparent 1px)',
            ].join(', '),
            backgroundSize: requiereScroll ? '18px 32px' : `calc(100% / ${columnas}) 32px`,
          }}
        >
          <LayoutGroup id={`grafico-${granularidadId}`}>
            <motion.div
              layout
              transition={SPRING_LAYOUT}
              className="grid h-full items-end px-1 pb-7 pt-3"
              style={{
                gridTemplateColumns: `repeat(${columnas}, minmax(0, 1fr))`,
                gap: gapColumnas,
              }}
            >
              <AnimatePresence mode="popLayout">
                {datosGrafico.datos.map((barra, indice) => (
                  <motion.div
                    key={barra.key}
                    layout
                    layoutId={`barra-${granularidadId}-${barra.key}`}
                    variants={VARIANTES_COLUMNA}
                    initial="inicial"
                    animate="visible"
                    exit="salida"
                    transition={{
                      layout: SPRING_LAYOUT,
                      delay: indice * 0.025,
                    }}
                    style={{ transformOrigin: 'bottom center' }}
                    className={`flex h-full min-w-0 flex-col items-center justify-end ${estilo.gap}`}
                  >
                    <motion.span
                      layout="position"
                      key={`monto-${barra.key}-${barra.monto}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: indice * 0.03 }}
                      className={`min-h-[10px] font-mono tabular-nums text-slate-600 ${estilo.monto}`}
                    >
                      {formatearMontoCorto(barra.monto)}
                    </motion.span>

                    <motion.div
                      layout
                      initial={{ height: 0, opacity: 0.4 }}
                      animate={{
                        height: `${barra.porcentaje}%`,
                        opacity: 1,
                      }}
                      transition={{
                        height: SPRING_BARRA,
                        opacity: { duration: 0.25 },
                        layout: SPRING_LAYOUT,
                      }}
                      whileHover={
                        barra.monto > 0
                          ? { backgroundColor: 'rgba(0, 200, 150, 0.95)', scaleX: 1.06 }
                          : undefined
                      }
                      className={`rounded-t-sm shadow-[0_0_14px_rgba(0,180,136,0.18)] ${
                        barra.monto > 0 ? 'bg-[#00B488]/85' : 'bg-[#30363D]/60'
                      }`}
                      style={{
                        width: `${estilo.ancho}px`,
                        transformOrigin: 'bottom center',
                      }}
                      title={`${barra.etiqueta}: ${formatearCOP(barra.monto)}`}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            <motion.div
              layout
              transition={SPRING_LAYOUT}
              className="absolute bottom-0 left-0 right-0 grid px-1 pb-1"
              style={{
                gridTemplateColumns: `repeat(${columnas}, minmax(0, 1fr))`,
                gap: gapColumnas,
              }}
            >
              <AnimatePresence mode="popLayout">
                {datosGrafico.datos.map((barra, indice) => (
                  <motion.span
                    key={`${barra.key}-label`}
                    layout
                    layoutId={`label-${granularidadId}-${barra.key}`}
                    variants={VARIANTES_ETIQUETA}
                    initial="inicial"
                    animate="visible"
                    exit="salida"
                    transition={{
                      layout: SPRING_LAYOUT,
                      delay: indice * 0.02,
                    }}
                    className={`truncate text-center font-medium text-slate-500 ${estilo.etiqueta}`}
                  >
                    {barra.etiqueta}
                  </motion.span>
                ))}
              </AnimatePresence>
            </motion.div>
          </LayoutGroup>
        </motion.div>
      </div>
    </div>
  );
}

function BusquedaHistorial({ busqueda, onBusqueda }) {
  return (
    <div className="mb-4">
      <div className="relative w-full md:w-56">
        <Search
          size={13}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
          strokeWidth={2}
        />
        <input
          type="search"
          value={busqueda}
          onChange={(e) => onBusqueda(e.target.value)}
          placeholder="Buscar cliente o folio..."
          className="w-full rounded-lg border border-[#30363D] bg-[#161B22] py-1.5 pl-8 pr-3 text-xs text-slate-300 placeholder-slate-500 outline-none transition focus:border-[#00B488]/40 focus:ring-1 focus:ring-[#00B488]/20"
        />
      </div>
    </div>
  );
}

function Finance() {
  const [deporte, setDeporte] = useState('todos');
  const [cancha, setCancha] = useState('todas');
  const [temporalidad, setTemporalidad] = useState('esta-semana');
  const [busqueda, setBusqueda] = useState('');
  const [activeKpiModal, setActiveKpiModal] = useState(null);

  const transaccionesPorControles = useMemo(
    () => filtrarPorControles(TRANSACCIONES_CRUDAS, { deporte, cancha, temporalidad }),
    [deporte, cancha, temporalidad]
  );

  const vistaFinanciera = useMemo(
    () => construirVistaFinanciera(transaccionesPorControles, { deporte, cancha, temporalidad }),
    [transaccionesPorControles, deporte, cancha, temporalidad]
  );

  const transaccionesTabla = useMemo(
    () => filtrarPorBusqueda(transaccionesPorControles, busqueda),
    [transaccionesPorControles, busqueda]
  );

  const datosModales = useMemo(
    () => construirDatosModales(transaccionesPorControles, temporalidad),
    [transaccionesPorControles, temporalidad]
  );

  return (
    <div className="flex h-full min-h-0 animate-fade-in flex-col overflow-hidden">
      <HeaderFinanciero
        deporte={deporte}
        cancha={cancha}
        temporalidad={temporalidad}
        onDeporte={setDeporte}
        onCancha={setCancha}
        onTemporalidad={setTemporalidad}
      />

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-6">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {vistaFinanciera.indicadores.map((indicador) => (
              <TarjetaIndicador
                key={indicador.id}
                {...indicador}
                onAbrirModal={setActiveKpiModal}
                activa={indicador.modalKey === activeKpiModal}
              />
            ))}
          </div>

          <GraficoTendencia
            datosGrafico={vistaFinanciera.datosGrafico}
            contextoFiltros={vistaFinanciera.contextoFiltros}
            totalGrafico={vistaFinanciera.totalGrafico}
            granularidadId={`${temporalidad}-${deporte}-${cancha}-${vistaFinanciera.datosGrafico.modo}`}
          />

          <div className="mt-6">
            <h2 className="mb-3 text-sm font-semibold text-slate-200">
              Historial de Caja y Movimientos
            </h2>

            <BusquedaHistorial busqueda={busqueda} onBusqueda={setBusqueda} />

            <div className="overflow-hidden rounded-xl border border-[#21262D] bg-[#161B22]/40">
              <div className="grid grid-cols-[0.75fr_2fr_0.9fr_1fr_0.9fr] gap-4 border-b border-[#21262D] bg-white/[0.02] px-5 py-3">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Fecha / Hora
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Concepto
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Método
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Atendido Por
                </span>
                <span className="text-right text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Monto
                </span>
              </div>

              {transaccionesTabla.length > 0 ? (
                transaccionesTabla.map((tx) => {
                  const monto = formatearMontoTx(tx.montoNumerico);
                  return (
                    <div
                      key={tx.id}
                      className="grid grid-cols-[0.75fr_2fr_0.9fr_1fr_0.9fr] items-center gap-4 border-b border-[#21262D]/80 px-5 py-4 transition-colors duration-200 last:border-b-0 hover:bg-[#21262D]/50"
                    >
                      <CeldaFechaHora fecha={tx.fecha} hora={tx.hora} />
                      <span className="text-xs text-slate-200">{tx.concepto}</span>
                      <BadgeMetodo label={tx.metodo} clase={tx.metodoClase} />
                      <span className="text-xs text-slate-400">{tx.atendidoPor}</span>
                      <span className={`text-right font-mono text-xs tabular-nums ${monto.clase}`}>
                        {monto.texto}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="px-5 py-10 text-center">
                  <p className="text-xs text-slate-500">
                    No hay movimientos que coincidan con los filtros seleccionados.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ModalKpiFinanciero
        activeKpiModal={activeKpiModal}
        onCerrar={() => setActiveKpiModal(null)}
        datosModales={datosModales}
        contextoFiltros={vistaFinanciera.contextoFiltros}
      />
    </div>
  );
}

export default Finance;
