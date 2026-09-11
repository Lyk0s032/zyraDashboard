import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { ChevronDown, Search, TrendingUp, X } from 'lucide-react';
import { finanzasService } from '../../api/services';
import { getStoredSession } from '../../api/auth';
import { useAppContext } from '../../estados/AppContext';

const KPI_MODAL_KEYS = {
  ingresos: 'ingresos',
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

const PERIODOS_FECHA = [
  { value: 'esta-semana', label: 'Esta semana' },
  { value: 'ultimo-mes', label: 'Último mes' },
  { value: 'ultimos-3-meses', label: 'Últimos 3 meses' },
  { value: 'ultimos-6-meses', label: 'Últimos 6 meses' },
  { value: 'rango-personalizado', label: 'Rango personalizado...' },
];

function obtenerComplejoId(state) {
  return state.user?.complejos?.[0]?.id ?? getStoredSession()?.user?.complejos?.[0]?.id ?? null;
}

function resolverDeporteClaveLocal(cancha) {
  const sportId = cancha.sport_id ?? cancha.sport?.id ?? null;
  if (sportId) return `sport:${sportId}`;
  const nombre = (cancha.tipo_deporte || cancha.sport?.nombre || cancha.sport?.name || '').trim();
  return nombre ? `tipo:${nombre.toLowerCase()}` : null;
}

function construirCatalogoDesdeCanchas(canchas = []) {
  const deportesMap = new Map();

  canchas.forEach((cancha) => {
    const clave = resolverDeporteClaveLocal(cancha);
    const nombre = (cancha.sport?.nombre || cancha.sport?.name || cancha.tipo_deporte || '').trim();
    if (!clave || !nombre) return;
    if (!deportesMap.has(clave)) {
      deportesMap.set(clave, { clave, id: cancha.sport_id ?? cancha.sport?.id ?? null, nombre });
    }
  });

  return {
    canchas: canchas.map((c) => ({
      id: c.id,
      nombre: c.nombre,
      sport_id: c.sport_id ?? c.sport?.id ?? null,
      tipo_deporte: c.tipo_deporte ?? c.sport?.nombre ?? c.sport?.name ?? null,
      deporte_clave: resolverDeporteClaveLocal(c),
    })),
    deportes: Array.from(deportesMap.values()).sort((a, b) =>
      a.nombre.localeCompare(b.nombre, 'es')
    ),
  };
}

function estiloMetodoPago(metodo, labelFallback) {
  if (metodo === 'EFECTIVO') {
    return {
      metodo: 'Efectivo',
      metodoClase: 'bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/25',
      metodoClaseCompacta: 'bg-amber-500/10 text-amber-500',
    };
  }
  if (metodo === 'PAGOS_APP') {
    return {
      metodo: 'Pago App',
      metodoClase: 'bg-[#00B488]/15 text-[#00B488] ring-1 ring-[#00B488]/25',
      metodoClaseCompacta: 'bg-emerald-500/10 text-emerald-500',
    };
  }
  if (metodo === 'NEQUI') {
    return {
      metodo: 'Nequi',
      metodoClase: 'bg-purple-500/15 text-purple-400 ring-1 ring-purple-500/25',
      metodoClaseCompacta: 'bg-purple-500/10 text-purple-400',
    };
  }
  if (metodo === 'TRANSFERENCIA') {
    return {
      metodo: 'Transferencia',
      metodoClase: 'bg-blue-500/15 text-blue-400 ring-1 ring-blue-500/25',
      metodoClaseCompacta: 'bg-blue-500/10 text-blue-400',
    };
  }
  if (metodo === 'TARJETA') {
    return {
      metodo: 'Tarjeta',
      metodoClase: 'bg-pink-500/15 text-pink-400 ring-1 ring-pink-500/25',
      metodoClaseCompacta: 'bg-pink-500/10 text-pink-400',
    };
  }
  return {
    metodo: labelFallback ?? metodo ?? 'Otro',
    metodoClase: 'bg-slate-500/15 text-slate-400 ring-1 ring-slate-500/25',
    metodoClaseCompacta: 'bg-slate-500/10 text-slate-400',
  };
}

const CLASE_SELECT =
  'appearance-none w-full bg-[#21262D] border border-[#30363D] text-xs text-slate-300 px-3 py-1.5 pr-8 rounded-lg cursor-pointer whitespace-nowrap hover:border-[#00B488]/30 focus:border-[#00B488]/50 focus:outline-none focus:ring-1 focus:ring-[#00B488]/20 transition md:text-[11px]';

function formatearCOP(valor) {
  return `$${Math.round(valor).toLocaleString('es-CO')} COP`;
}

function formatearMontoTx(monto) {
  if (monto === 0) return { texto: '$0 COP', clase: 'text-slate-400' };
  return { texto: `+${formatearCOP(monto)}`, clase: 'text-[#00B488]/90' };
}

function filtrarPorBusqueda(transacciones, busqueda) {
  const termino = busqueda.trim().toLowerCase();
  if (!termino) return transacciones;

  return transacciones.filter(
    (tx) =>
      tx.cliente?.toLowerCase().includes(termino) ||
      tx.folio?.toLowerCase().includes(termino) ||
      tx.concepto?.toLowerCase().includes(termino) ||
      tx.atendidoPor?.toLowerCase().includes(termino)
  );
}

function normalizarBarras(barras) {
  const maximo = Math.max(...barras.map((barra) => barra.monto), 1);

  return barras.map((barra) => ({
    ...barra,
    porcentaje:
      barra.monto > 0
        ? Math.max(12, Math.round((barra.monto / maximo) * 100))
        : 4,
    fraccionEfectivo: barra.monto > 0 ? (barra.efectivo ?? 0) / barra.monto : 0,
    fraccionPagosApp: barra.monto > 0 ? (barra.pagos_app ?? 0) / barra.monto : 0,
  }));
}

function construirKPIsDesdeApi(kpis, eficienciaDetalle) {
  const detalle = eficienciaDetalle ?? {};
  const subtextoOcupacion =
    detalle.bloques_disponibles > 0
      ? `${detalle.bloques_ocupados}h usadas de ${detalle.bloques_disponibles}h disponibles`
      : null;

  return [
    {
      id: 'caja-total',
      etiqueta: 'Ingresos Totales',
      valor: formatearCOP(kpis.ingresos_totales ?? 0),
      badge: null,
      badgeClase: 'bg-[#00B488]/10 text-[#00B488] ring-1 ring-[#00B488]/20',
      subtexto: 'Ver desglose por método de pago',
      progreso: null,
      modalKey: KPI_MODAL_KEYS.ingresos,
    },
    {
      id: 'efectivo',
      etiqueta: 'Efectivo en Caja (Counter)',
      valor: formatearCOP(kpis.efectivo_caja ?? 0),
      badge: null,
      subtexto: 'Dinero real en counter',
      progreso: null,
      modalKey: KPI_MODAL_KEYS.efectivo,
    },
    {
      id: 'pasarela',
      etiqueta: 'Recaudado por Zyra',
      valor: formatearCOP(kpis.recaudado_zyra ?? 0),
      badge: null,
      subtexto: 'Pendiente por liquidar',
      progreso: null,
      modalKey: KPI_MODAL_KEYS.pasarela,
    },
    {
      id: 'ocupacion',
      etiqueta: 'Eficiencia de Canchas',
      valor: `${kpis.eficiencia_canchas ?? 0}%`,
      badge: null,
      subtexto: subtextoOcupacion,
      progreso: kpis.eficiencia_canchas ?? 0,
      modalKey: KPI_MODAL_KEYS.ocupacion,
    },
  ];
}

function construirDatosGraficoDesdeApi(tendencia, periodo, granularidad) {
  const esMes = granularidad === 'mes';

  const TITULOS = {
    'esta-semana': 'Tendencia Semanal',
    'ultimo-mes': 'Tendencia del Mes',
    'ultimos-3-meses': 'Tendencia Trimestral',
    'ultimos-6-meses': 'Tendencia Semestral',
    'rango-personalizado': 'Tendencia Bimestral',
  };

  const barras = normalizarBarras(
    (tendencia ?? []).map((punto) => ({
      key: punto.fecha,
      etiqueta: punto.etiqueta,
      monto: punto.ingresos ?? punto.monto ?? 0,
      efectivo: punto.efectivo ?? 0,
      pagos_app: punto.pagos_app ?? 0,
    }))
  );

  return {
    modo: esMes ? 'mes' : 'dia',
    titulo: TITULOS[periodo] ?? (esMes ? 'Tendencia Mensual' : 'Tendencia Diaria'),
    unidad: esMes ? 'mes' : 'día',
    datos: barras,
  };
}

function construirSerieAcumulada(tendencia, campo) {
  let acumulado = 0;
  return (tendencia ?? []).map((dia) => {
    acumulado += dia[campo] ?? 0;
    return { etiqueta: dia.etiqueta, acumulado };
  });
}

function parseConceptoReserva(concepto) {
  if (!concepto) return { cancha: null, conceptoCorto: '' };
  const separador = concepto.indexOf(' — ');
  if (concepto.startsWith('Reserva ') && separador > -1) {
    return {
      cancha: concepto.slice(8, separador).trim(),
      conceptoCorto: concepto.slice(separador + 3).trim(),
    };
  }
  return { cancha: null, conceptoCorto: concepto };
}

function mapearHistorial(historial) {
  return (historial ?? []).map((tx) => {
    const estilo = estiloMetodoPago(tx.metodo_pago, tx.metodo_label);
    const { cancha, conceptoCorto } = parseConceptoReserva(tx.concepto);
    return {
      id: tx.id,
      fecha: tx.fecha_legible ?? tx.fecha,
      hora: tx.hora,
      concepto: tx.concepto,
      conceptoCorto,
      cancha,
      folio: tx.folio,
      cliente: tx.cliente,
      metodo: estilo.metodo,
      metodoClase: estilo.metodoClase,
      metodoClaseCompacta: estilo.metodoClaseCompacta,
      atendidoPor: tx.atendido_por ?? tx.cliente,
      montoNumerico: tx.monto ?? 0,
    };
  });
}

function SelectFiltro({ value, onChange, opciones, ariaLabel }) {
  return (
    <div className="relative w-max shrink-0">
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
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500"
        strokeWidth={2}
      />
    </div>
  );
}

function HeaderFinanciero({
  deporte,
  cancha,
  temporalidad,
  deportesOpciones,
  canchasOpciones,
  onDeporte,
  onCancha,
  onTemporalidad,
}) {
  return (
    <header className="mb-4 flex-shrink-0 border-b border-[#21262D]/80 px-3 pb-4 pt-4 md:mb-6 md:px-5 md:pb-5 md:pt-5">
      <div className="mx-auto w-full max-w-6xl">
        <div className="grid grid-cols-1 items-center gap-x-4 gap-y-3 lg:grid-cols-[auto_minmax(0,1fr)]">
          <h1 className="whitespace-nowrap text-lg font-bold tracking-wide text-white">
            Control Financiero
          </h1>

          <div className="flex w-full items-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-none py-2 lg:justify-end [-webkit-overflow-scrolling:touch]">
            <SelectFiltro
              value={deporte}
              onChange={onDeporte}
              opciones={deportesOpciones}
              ariaLabel="Filtrar por deporte"
            />
            <SelectFiltro
              value={cancha}
              onChange={onCancha}
              opciones={canchasOpciones}
              ariaLabel="Filtrar por cancha"
            />
            <SelectFiltro
              value={temporalidad}
              onChange={onTemporalidad}
              opciones={PERIODOS_FECHA}
              ariaLabel="Filtrar por periodo"
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

function BadgeMetodo({ label, clase, compacto = false }) {
  if (compacto) {
    return (
      <span className={`inline-flex max-w-full items-center truncate rounded px-1.5 py-0.5 text-[10px] font-medium ${clase}`}>
        {label}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-medium ${clase}`}>
      {label}
    </span>
  );
}

function TarjetaMovimientoMovil({ tx }) {
  const monto = formatearMontoTx(tx.montoNumerico);
  const esIngreso = tx.montoNumerico > 0;

  return (
    <div className="mb-2 flex items-center justify-between gap-2 rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-3 md:hidden">
      <div className="flex w-[4.25rem] shrink-0 flex-col gap-1.5">
        <span className="font-mono text-[11px] tabular-nums text-zinc-500">{tx.hora}</span>
        <BadgeMetodo label={tx.metodo} clase={tx.metodoClaseCompacta} compacto />
      </div>

      <div className="min-w-0 flex-1">
        <span className="block truncate text-xs font-semibold text-zinc-200">
          {tx.cliente || tx.conceptoCorto || tx.concepto}
        </span>
        <span className="mt-0.5 block truncate text-[11px] text-zinc-500">
          {tx.cancha || tx.concepto}
        </span>
      </div>

      <div className="shrink-0 pl-1 text-right">
        <span
          className={`font-mono text-sm font-bold tabular-nums ${
            esIngreso ? 'text-emerald-500' : monto.clase
          }`}
        >
          {monto.texto}
        </span>
      </div>
    </div>
  );
}

function ValorIndicadorAnimado({ valor }) {
  return (
    <div className="relative mt-1.5 h-6 shrink-0 overflow-hidden md:mt-2 md:h-7">
      <AnimatePresence initial={false}>
        <motion.p
          key={valor}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22, ease: EASE_PREMIUM }}
          className="absolute inset-0 font-mono text-xl font-bold tabular-nums leading-6 text-white md:leading-7"
        >
          {valor}
        </motion.p>
      </AnimatePresence>
    </div>
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
  enSlider = false,
}) {
  const esClickable = Boolean(modalKey);

  const claseBase = enSlider
    ? 'snap-center shrink-0 w-[82vw] rounded-xl border border-zinc-800/60 bg-zinc-900/50 p-4 md:w-auto md:shrink md:snap-align-none md:border-[#21262D] md:bg-[#161B22]'
    : 'rounded-xl border border-[#21262D] bg-[#161B22]';

  const claseDimensiones = enSlider
    ? 'flex min-h-[110px] flex-col justify-between md:min-h-0 md:h-[120px] md:p-4'
    : 'flex min-h-[96px] flex-col justify-between p-3 md:h-[120px] md:p-4';

  const contenido = (
    <>
      <div className="min-h-[44px] md:min-h-[52px]">
        <p className="text-[10px] font-medium uppercase tracking-widest text-slate-500">{etiqueta}</p>
        <ValorIndicadorAnimado valor={valor} />
      </div>

      {badge && (
        <span
          className={`mt-1.5 inline-flex w-fit items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium md:mt-2 ${badgeClase}`}
        >
          <TrendingUp size={10} strokeWidth={2.5} />
          {badge}
        </span>
      )}

      {subtexto && <p className="mt-1.5 text-[10px] leading-snug text-slate-500 md:mt-2">{subtexto}</p>}

      {progreso !== null && (
        <div className="mt-2 md:mt-3">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#21262D]">
            <motion.div
              className="h-full rounded-full bg-[#00B488]"
              animate={{ width: `${progreso}%` }}
              transition={{ duration: 0.45, ease: EASE_PREMIUM }}
            />
          </div>
        </div>
      )}

      {esClickable && (
        <p className="mt-1.5 text-[9px] font-medium uppercase tracking-wider text-[#00B488]/60 md:mt-2">
          Ver detalle →
        </p>
      )}
    </>
  );

  if (!esClickable) {
    return (
      <div className={`${claseBase} ${claseDimensiones}`}>
        {contenido}
      </div>
    );
  }

  return (
    <motion.button
      type="button"
      layout={false}
      onClick={() => onAbrirModal(modalKey)}
      whileHover={{ borderColor: 'rgba(0, 180, 136, 0.35)' }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.2, ease: EASE_PREMIUM }}
      className={`${claseBase} ${claseDimensiones} w-full cursor-pointer text-left transition-colors hover:bg-[#161B22]/90 md:hover:bg-[#161B22]/90 ${
        activa
          ? 'border-[#00B488]/50 ring-1 ring-[#00B488]/30'
          : 'hover:border-[#00B488]/25 md:hover:border-[#00B488]/25'
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

function ContenidoModalCanchas({ canchas, resumen }) {
  return (
    <div className="mt-5 space-y-4">
      {resumen && (
        <p className="font-mono text-2xl tabular-nums text-white">
          {resumen.porcentaje ?? 0}%
          <span className="ml-2 text-sm font-normal text-slate-500">
            ({resumen.bloques_ocupados ?? 0}h / {resumen.bloques_disponibles ?? 0}h)
          </span>
        </p>
      )}

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
              {cancha.bloques_ocupados ?? 0}h / {cancha.bloques_disponibles ?? 0}h · {cancha.porcentaje ?? 0}%
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-[#21262D]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${cancha.porcentaje ?? 0}%` }}
              transition={{ ...SPRING_BARRA, delay: indice * 0.06 }}
              className="h-full rounded-full bg-[#00B488]"
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function ToggleMetodoPago({ metodo, activo, onToggle }) {
  return (
    <button
      type="button"
      onClick={() => onToggle(metodo.id)}
      aria-pressed={activo}
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[10px] font-medium transition ${
        activo
          ? 'border-transparent text-white'
          : 'border-[#30363D] bg-[#21262D]/40 text-slate-500 line-through opacity-60'
      }`}
      style={
        activo
          ? {
              backgroundColor: `${metodo.color}22`,
              borderColor: `${metodo.color}55`,
              color: metodo.color,
            }
          : undefined
      }
    >
      <span
        className="h-2 w-2 rounded-sm"
        style={{ backgroundColor: activo ? metodo.color : '#475569' }}
      />
      {metodo.label}
    </button>
  );
}

function GraficoBarrasMultiples({ tendencia, catalogo, metodosActivos, modo }) {
  const metodosVisibles = useMemo(
    () => catalogo.filter((m) => metodosActivos.has(m.id)),
    [catalogo, metodosActivos]
  );

  const columnas = tendencia.length;
  const estilo = obtenerEstiloBarra(columnas, modo);
  const requiereScroll = modo === 'dia' && columnas > 14;
  const gapColumnas = columnas > 14 ? '2px' : columnas > 7 ? '4px' : '8px';
  const anchoGrupo = estilo.ancho;
  const anchoBarra = Math.max(
    4,
    Math.floor(anchoGrupo / Math.max(metodosVisibles.length, 1)) - 1
  );

  const datos = useMemo(() => {
    const puntos = (tendencia ?? []).map((punto) => {
      const valores = {};
      metodosVisibles.forEach((m) => {
        valores[m.id] = punto.por_metodo?.[m.id] ?? 0;
      });
      const montoTotal = metodosVisibles.reduce((acc, m) => acc + (valores[m.id] ?? 0), 0);
      return {
        key: punto.fecha,
        etiqueta: punto.etiqueta,
        valores,
        montoTotal,
      };
    });

    const maximo = Math.max(
      ...puntos.flatMap((p) => metodosVisibles.map((m) => p.valores[m.id] ?? 0)),
      1
    );

    return puntos.map((punto) => ({
      ...punto,
      barras: metodosVisibles.map((m) => {
        const monto = punto.valores[m.id] ?? 0;
        return {
          id: m.id,
          color: m.color,
          label: m.label,
          monto,
          porcentaje:
            monto > 0 ? Math.max(10, Math.round((monto / maximo) * 100)) : 3,
        };
      }),
    }));
  }, [tendencia, metodosVisibles]);

  if (!metodosVisibles.length) {
    return (
      <p className="mt-6 rounded-lg border border-dashed border-[#30363D] px-4 py-8 text-center text-xs text-slate-500">
        Activa al menos un método de pago para ver el gráfico.
      </p>
    );
  }

  return (
    <div className="relative mt-4 h-[200px] rounded-lg border border-[#21262D] bg-[#0D1117]/40">
      <div
        className={`relative h-full ${
          requiereScroll ? 'overflow-x-auto overflow-y-hidden' : 'overflow-hidden'
        }`}
      >
        <div
          className="relative h-full min-h-[200px]"
          style={{ minWidth: requiereScroll ? `${columnas * 22}px` : '100%' }}
        >
          <div
            className="grid h-full items-end px-1 pb-7 pt-3"
            style={{
              gridTemplateColumns: `repeat(${Math.max(columnas, 1)}, minmax(0, 1fr))`,
              gap: gapColumnas,
            }}
          >
            {datos.map((columna, indice) => (
              <div
                key={columna.key}
                className={`flex h-full min-w-0 flex-col items-center justify-end ${estilo.gap}`}
              >
                <span
                  className={`min-h-[10px] font-mono tabular-nums text-slate-600 ${estilo.monto}`}
                >
                  {formatearMontoCorto(columna.montoTotal)}
                </span>
                <div
                  className="flex items-end justify-center gap-px"
                  style={{ width: `${anchoGrupo}px`, height: '100%' }}
                >
                  {columna.barras.map((barra) => (
                    <motion.div
                      key={`${columna.key}-${barra.id}`}
                      initial={{ height: 0, opacity: 0.5 }}
                      animate={{ height: `${barra.porcentaje}%`, opacity: 1 }}
                      transition={{ ...SPRING_BARRA, delay: indice * 0.02 }}
                      title={`${barra.label}: ${formatearCOP(barra.monto)}`}
                      className="rounded-t-sm"
                      style={{
                        width: `${anchoBarra}px`,
                        backgroundColor: barra.color,
                        boxShadow: `0 0 8px ${barra.color}33`,
                        transformOrigin: 'bottom center',
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div
            className="absolute bottom-0 left-0 right-0 grid px-1 pb-1"
            style={{
              gridTemplateColumns: `repeat(${Math.max(columnas, 1)}, minmax(0, 1fr))`,
              gap: gapColumnas,
            }}
          >
            {datos.map((columna) => (
              <span
                key={`${columna.key}-lbl`}
                className={`truncate text-center text-slate-500 ${estilo.etiqueta}`}
              >
                {columna.etiqueta}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ContenidoModalIngresos({ total, catalogo, metodos, tendencia, modo }) {
  const [metodosActivos, setMetodosActivos] = useState(
    () => new Set((catalogo ?? []).map((m) => m.id))
  );

  useEffect(() => {
    setMetodosActivos(new Set((catalogo ?? []).map((m) => m.id)));
  }, [catalogo]);

  const toggleMetodo = useCallback((id) => {
    setMetodosActivos((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  return (
    <>
      <p className="mt-5 font-mono text-2xl tabular-nums text-white">{formatearCOP(total)}</p>
      <p className="mt-1 text-[10px] text-slate-500">Total del periodo filtrado</p>

      {(metodos ?? []).length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {(metodos ?? []).map((m) => (
            <span
              key={m.id}
              className="inline-flex items-center gap-1.5 rounded-md border border-[#30363D] bg-[#21262D]/50 px-2 py-1 text-[10px] text-slate-300"
            >
              <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: m.color }} />
              {m.label}
              <span className="font-mono tabular-nums text-slate-400">{formatearCOP(m.monto)}</span>
            </span>
          ))}
        </div>
      )}

      <div className="mt-4">
        <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-slate-500">
          Métodos visibles en el gráfico
        </p>
        <div className="flex flex-wrap gap-2">
          {(catalogo ?? []).map((m) => (
            <ToggleMetodoPago
              key={m.id}
              metodo={m}
              activo={metodosActivos.has(m.id)}
              onToggle={toggleMetodo}
            />
          ))}
        </div>
      </div>

      <GraficoBarrasMultiples
        tendencia={tendencia}
        catalogo={catalogo ?? []}
        metodosActivos={metodosActivos}
        modo={modo}
      />
    </>
  );
}

const CONFIG_MODAL_KPI = {
  ingresos: {
    titulo: 'Ingresos Totales',
    subtitulo: 'Desglose por método de pago en el periodo',
    ancho: 'max-w-2xl',
  },
  canchas: {
    titulo: 'Eficiencia de Canchas',
    subtitulo: 'Horas reservadas vs capacidad operativa del periodo',
    ancho: 'max-w-lg',
  },
  zyra: {
    titulo: 'Recaudado por Zyra',
    subtitulo: 'Comportamiento acumulado de pagos online',
    ancho: 'max-w-lg',
  },
  caja: {
    titulo: 'Efectivo en Caja',
    subtitulo: 'Evolución del efectivo físico en counter',
    ancho: 'max-w-lg',
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
            className={`w-full ${config.ancho ?? 'max-w-lg'} rounded-xl border border-[#21262D] bg-[#161B22] p-6 shadow-2xl`}
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

            {activeKpiModal === 'ingresos' && (
              <ContenidoModalIngresos
                total={datosModales.ingresos.total}
                catalogo={datosModales.ingresos.catalogo}
                metodos={datosModales.ingresos.metodos}
                tendencia={datosModales.ingresos.tendencia}
                modo={datosModales.ingresos.modo}
              />
            )}

            {activeKpiModal === 'canchas' && (
              <ContenidoModalCanchas
                canchas={datosModales.canchas}
                resumen={datosModales.resumenOcupacion}
              />
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
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
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
        <div className="flex shrink-0 flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-[10px] text-slate-500">
            <span className="h-2 w-2 rounded-sm bg-amber-400/90" />
            Efectivo
          </span>
          <span className="inline-flex items-center gap-1.5 text-[10px] text-slate-500">
            <span className="h-2 w-2 rounded-sm bg-[#00B488]/90" />
            Zyra App
          </span>
          <motion.span
            key={totalGrafico}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={SPRING_BARRA}
            className="font-mono text-[10px] tabular-nums text-[#00B488]/90"
          >
            {totalGrafico}
          </motion.span>
        </div>
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

                    <div
                      layout
                      className="flex w-full flex-col items-center justify-end"
                      style={{
                        width: `${estilo.ancho}px`,
                        height: `${barra.porcentaje}%`,
                        transformOrigin: 'bottom center',
                      }}
                    >
                      {barra.pagos_app > 0 && (
                        <motion.div
                          layout
                          initial={{ height: 0, opacity: 0.4 }}
                          animate={{
                            height: `${Math.round(barra.fraccionPagosApp * 100)}%`,
                            opacity: 1,
                          }}
                          transition={{
                            height: SPRING_BARRA,
                            opacity: { duration: 0.25 },
                            layout: SPRING_LAYOUT,
                          }}
                          className="w-full rounded-t-sm bg-[#00B488]/90 shadow-[0_0_10px_rgba(0,180,136,0.2)]"
                          title={`App: ${formatearCOP(barra.pagos_app)}`}
                        />
                      )}
                      {barra.efectivo > 0 && (
                        <motion.div
                          layout
                          initial={{ height: 0, opacity: 0.4 }}
                          animate={{
                            height: `${Math.round(barra.fraccionEfectivo * 100)}%`,
                            opacity: 1,
                          }}
                          transition={{
                            height: SPRING_BARRA,
                            opacity: { duration: 0.25 },
                            layout: SPRING_LAYOUT,
                          }}
                          className={`w-full bg-amber-400/90 shadow-[0_0_10px_rgba(251,191,36,0.15)] ${
                            barra.pagos_app > 0 ? '' : 'rounded-t-sm'
                          }`}
                          title={`Efectivo: ${formatearCOP(barra.efectivo)}`}
                        />
                      )}
                      {barra.monto === 0 && (
                        <motion.div
                          layout
                          className="h-full w-full rounded-t-sm bg-[#30363D]/60"
                          style={{ width: `${estilo.ancho}px` }}
                        />
                      )}
                    </div>
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
  const { state } = useAppContext();
  const complejoId = obtenerComplejoId(state);
  const reqIdRef = useRef(0);
  const tieneDatosRef = useRef(false);

  const [deporte, setDeporte] = useState('todos');
  const [cancha, setCancha] = useState('todas');
  const [temporalidad, setTemporalidad] = useState('esta-semana');
  const [busqueda, setBusqueda] = useState('');
  const [activeKpiModal, setActiveKpiModal] = useState(null);
  const [datosApi, setDatosApi] = useState(null);
  const [catalogoFiltros, setCatalogoFiltros] = useState(null);
  const [cargandoInicial, setCargandoInicial] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [error, setError] = useState('');

  const catalogoFallback = useMemo(
    () => construirCatalogoDesdeCanchas(state.canchas),
    [state.canchas]
  );

  const catalogoActivo = catalogoFiltros ?? catalogoFallback;

  const cargarResumen = useCallback(async () => {
    if (!complejoId) {
      setCargandoInicial(false);
      setActualizando(false);
      setError('No se encontró un complejo activo en la sesión.');
      return;
    }

    const token = getStoredSession()?.token;
    if (!token) {
      setCargandoInicial(false);
      setActualizando(false);
      setError('Sesión no válida. Inicia sesión nuevamente.');
      return;
    }

    const reqId = ++reqIdRef.current;
    const esPrimeraCarga = !tieneDatosRef.current;

    if (esPrimeraCarga) setCargandoInicial(true);
    else setActualizando(true);

    setError('');

    try {
      const filtros = { periodo: temporalidad };
      if (cancha !== 'todas') filtros.cancha_id = cancha;
      if (deporte !== 'todos') filtros.deporte_clave = deporte;

      const respuesta = await finanzasService.obtenerResumen(complejoId, token, filtros);
      if (reqId !== reqIdRef.current) return;

      if (respuesta.success) {
        tieneDatosRef.current = true;
        setDatosApi(respuesta);
        if (respuesta.filtros?.canchas?.length) {
          setCatalogoFiltros(respuesta.filtros);
        }
      } else {
        setError(respuesta.message ?? 'No se pudo cargar el resumen financiero.');
      }
    } catch (err) {
      if (reqId !== reqIdRef.current) return;
      console.error('[Finance] Error cargando resumen:', err);
      setError(err.response?.data?.message ?? 'Error al conectar con el servidor.');
    } finally {
      if (reqId === reqIdRef.current) {
        setCargandoInicial(false);
        setActualizando(false);
      }
    }
  }, [complejoId, temporalidad, cancha, deporte]);

  useEffect(() => {
    cargarResumen();
  }, [cargarResumen]);

  const deportesOpciones = useMemo(() => {
    const base = [{ value: 'todos', label: 'Todos los deportes' }];
    const deportes = catalogoActivo?.deportes ?? [];
    return [
      ...base,
      ...deportes.map((d) => ({ value: d.clave, label: d.nombre })),
    ];
  }, [catalogoActivo]);

  const canchasOpciones = useMemo(() => {
    const base = [{ value: 'todas', label: 'Todas las canchas' }];
    let canchas = catalogoActivo?.canchas ?? [];
    if (deporte !== 'todos') {
      canchas = canchas.filter((c) => c.deporte_clave === deporte);
    }
    return [
      ...base,
      ...canchas.map((c) => ({ value: String(c.id), label: c.nombre })),
    ];
  }, [catalogoActivo, deporte]);

  const etiquetaPeriodo =
    PERIODOS_FECHA.find((p) => p.value === temporalidad)?.label ?? 'Esta semana';
  const etiquetaDeporte =
    deportesOpciones.find((d) => d.value === deporte)?.label ?? 'Todos los deportes';
  const etiquetaCancha =
    canchasOpciones.find((c) => c.value === cancha)?.label ?? 'Todas las canchas';

  const datosVista = datosApi ?? {
    kpis: {},
    tendencia: [],
    tendencia_granularidad: 'dia',
    eficiencia_canchas: { porcentaje: 0, bloques_ocupados: 0, bloques_disponibles: 0, por_cancha: [] },
    historial: [],
    ingresos_por_cancha: [],
  };

  const vistaFinanciera = useMemo(() => {
    const granularidad = datosVista.tendencia_granularidad ?? 'dia';
    const datosGrafico = construirDatosGraficoDesdeApi(
      datosVista.tendencia,
      temporalidad,
      granularidad
    );
    const totalGrafico = datosGrafico.datos.reduce((sum, barra) => sum + barra.monto, 0);
    const unidadLabel = datosGrafico.unidad;

    return {
      indicadores: construirKPIsDesdeApi(datosVista.kpis ?? {}, datosVista.eficiencia_canchas),
      datosGrafico,
      totalGrafico: formatearCOP(totalGrafico),
      contextoFiltros: `Ingresos por ${unidadLabel} — ${etiquetaPeriodo} · ${etiquetaDeporte} · ${etiquetaCancha}`,
    };
  }, [datosVista, temporalidad, etiquetaPeriodo, etiquetaDeporte, etiquetaCancha]);

  const transaccionesTabla = useMemo(
    () => filtrarPorBusqueda(mapearHistorial(datosVista.historial), busqueda),
    [datosVista.historial, busqueda]
  );

  const datosModales = useMemo(() => {
    const tendencia = datosVista.tendencia ?? [];
    const eficiencia = datosVista.eficiencia_canchas ?? {};
    const ingresosMetodos = datosVista.ingresos_metodos ?? {};
    const modoIngresos = datosVista.tendencia_granularidad === 'mes' ? 'mes' : 'dia';

    return {
      ingresos: {
        total: datosVista.kpis?.ingresos_totales ?? 0,
        catalogo: ingresosMetodos.catalogo ?? [],
        metodos: ingresosMetodos.metodos ?? [],
        tendencia,
        modo: modoIngresos,
      },
      canchas: eficiencia.por_cancha ?? [],
      resumenOcupacion: {
        porcentaje: eficiencia.porcentaje ?? datosVista.kpis?.eficiencia_canchas ?? 0,
        bloques_ocupados: eficiencia.bloques_ocupados ?? 0,
        bloques_disponibles: eficiencia.bloques_disponibles ?? 0,
      },
      zyra: {
        total: datosVista.kpis?.recaudado_zyra ?? 0,
        serie: construirSerieAcumulada(tendencia, 'pagos_app'),
      },
      caja: {
        total: datosVista.kpis?.efectivo_caja ?? 0,
        serie: construirSerieAcumulada(tendencia, 'efectivo'),
      },
    };
  }, [datosVista]);

  const handleDeporte = (valor) => {
    setDeporte(valor);
    setCancha('todas');
  };

  const mostrarContenido = Boolean(datosApi) || !cargandoInicial;

  return (
    <div className="flex h-full min-h-0 animate-fade-in flex-col overflow-hidden">
      <HeaderFinanciero
        deporte={deporte}
        cancha={cancha}
        temporalidad={temporalidad}
        deportesOpciones={deportesOpciones}
        canchasOpciones={canchasOpciones}
        onDeporte={handleDeporte}
        onCancha={setCancha}
        onTemporalidad={setTemporalidad}
      />

      <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-6 md:px-5">
        <div className="mx-auto max-w-6xl">
          {error && (
            <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-300">
              {error}
            </div>
          )}

          {cargandoInicial && !datosApi ? (
            <>
              <div className="flex w-full gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-4 [-webkit-overflow-scrolling:touch] md:grid md:grid-cols-4 md:gap-4 md:overflow-visible md:pb-0 md:snap-none">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="min-h-[110px] w-[82vw] shrink-0 animate-pulse snap-center rounded-xl border border-zinc-800/60 bg-zinc-900/50 p-4 md:w-auto md:min-h-[120px] md:border-[#21262D] md:bg-[#161B22]"
                  >
                    <div className="h-2 w-20 rounded bg-[#21262D]" />
                    <div className="mt-4 h-6 w-28 rounded bg-[#21262D]" />
                  </div>
                ))}
              </div>
              <div className="mt-2 min-h-[220px] animate-pulse rounded-xl border border-[#21262D] bg-[#161B22]/60" />
            </>
          ) : mostrarContenido ? (
            <div className="relative">
              <AnimatePresence>
                {actualizando && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2, ease: EASE_PREMIUM }}
                    className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center pt-2"
                  >
                    <span className="rounded-full border border-[#30363D] bg-[#161B22]/90 px-3 py-1 text-[10px] text-slate-400 backdrop-blur-sm">
                      Actualizando…
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex w-full gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-4 [-webkit-overflow-scrolling:touch] md:grid md:grid-cols-4 md:gap-4 md:overflow-visible md:pb-0 md:snap-none">
                {vistaFinanciera.indicadores.map((indicador) => (
                  <TarjetaIndicador
                    key={indicador.id}
                    {...indicador}
                    enSlider
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
                <div className="mb-3 flex items-baseline justify-between gap-3">
                  <h2 className="text-sm font-semibold text-slate-200">
                    Historial de Caja y Movimientos
                  </h2>
                  {datosVista.historial_total != null && (
                    <span className="font-mono text-[10px] tabular-nums text-slate-500">
                      {datosVista.historial_total} registro{datosVista.historial_total === 1 ? '' : 's'}
                    </span>
                  )}
                </div>

                <BusquedaHistorial busqueda={busqueda} onBusqueda={setBusqueda} />

                <div className="md:overflow-hidden md:rounded-xl md:border md:border-[#21262D] md:bg-[#161B22]/40">
                  <div className="hidden md:grid md:grid-cols-[0.75fr_2fr_0.9fr_1fr_0.9fr] md:gap-4 md:border-b md:border-[#21262D] md:bg-white/[0.02] md:px-5 md:py-3">
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

                  <AnimatePresence mode="popLayout">
                    {transaccionesTabla.length > 0 ? (
                      transaccionesTabla.map((tx) => {
                        const monto = formatearMontoTx(tx.montoNumerico);
                        return (
                          <motion.div
                            key={tx.id}
                            layout
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.28, ease: EASE_PREMIUM }}
                          >
                            <TarjetaMovimientoMovil tx={tx} />

                            <div className="hidden md:grid md:grid-cols-[0.75fr_2fr_0.9fr_1fr_0.9fr] md:items-center md:gap-4 md:border-b md:border-[#21262D]/80 md:px-5 md:py-4 md:transition-colors md:duration-200 md:last:border-b-0 md:hover:bg-[#21262D]/50">
                              <CeldaFechaHora fecha={tx.fecha} hora={tx.hora} />
                              <span className="truncate text-xs text-slate-200">{tx.concepto}</span>
                              <BadgeMetodo label={tx.metodo} clase={tx.metodoClase} />
                              <span className="truncate text-xs text-slate-400">{tx.atendidoPor}</span>
                              <span className={`text-right font-mono text-xs tabular-nums ${monto.clase}`}>
                                {monto.texto}
                              </span>
                            </div>
                          </motion.div>
                        );
                      })
                    ) : (
                      <motion.div
                        key="sin-movimientos"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="px-1 py-10 text-center md:px-5"
                      >
                        <p className="text-xs text-slate-500">
                          No hay movimientos que coincidan con los filtros seleccionados.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          ) : null}
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
